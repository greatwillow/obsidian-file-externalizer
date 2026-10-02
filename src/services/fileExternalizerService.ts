import type { App, TFile } from 'obsidian';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { DEFAULT_SETTINGS, FileExternalizerSettings } from '../settings';
import { DocumentType } from '../constants';
import { normalizeDocumentType } from '../domain/documentType';
import { buildExternalFileNote, externalFileNoteFolder, markExternalFileTextMissing, updateExternalFileTextForFolderRename } from '../domain/externalFileNote';
import { defaultTitleForFile, normalizeUploadFilename, slugTitle } from '../domain/filename';
import { parseFrontmatter } from '../domain/frontmatter';
import { deriveContextName, deriveContextType, joinRemotePath, parentRemotePath, replacePathPrefix } from '../domain/paths';
import { getVaultPath, uniqueMarkdownPath, vaultRelativePath } from '../platform/obsidianVault';
import { isMissingRemotePathError, ProtonDriveCliProvider } from '../providers/protonDriveCliProvider';
import { LoginResult, SetupStatus, StorageProvider } from '../providers/storageProvider';
import { CacheService } from './cacheService';

export interface RegisterFileInput {
  destinationFolder: string;
  documentType: DocumentType;
  filePath: string;
  shareLink: boolean;
  title: string;
  uploadFilename: string;
}

export interface RegisterFileResult {
  link: string;
  notePath: string;
  remotePath: string;
  storageFolder: string;
}

export interface ValidationResult {
  changed: number;
  errors: number;
  found: number;
  missing: number;
}

export class FileExternalizerService {
  readonly provider: StorageProvider;

  constructor(
    private readonly app: App,
    private readonly settings: FileExternalizerSettings = DEFAULT_SETTINGS,
    provider?: StorageProvider,
  ) {
    this.provider = provider || new ProtonDriveCliProvider({ cliPath: settings.protonCliPath });
  }

  async checkSetup(): Promise<SetupStatus> {
    if (!this.provider.checkSetup) {
      return { ready: true, checks: [{ label: 'Storage provider', ok: true, detail: 'No setup checks for this provider.' }] };
    }
    return this.provider.checkSetup(this.settings.remoteRoot);
  }

  async login(onUrl?: (url: string) => void): Promise<LoginResult> {
    if (!this.provider.login) throw new Error('This storage provider has no sign-in step.');
    return this.provider.login(onUrl);
  }

  async registerFile(input: RegisterFileInput): Promise<RegisterFileResult> {
    if (!this.settings.remoteRoot) throw new Error('File Externalizer remote root is not configured.');
    const vaultPath = getVaultPath(this.app);
    const localFile = path.resolve(input.filePath);
    if (!fs.existsSync(localFile)) throw new Error(`File not found: ${localFile}`);

    const date = new Date().toISOString().slice(0, 10);
    const title = slugTitle(input.title || defaultTitleForFile(localFile));
    const uploadFilename = normalizeUploadFilename(input.uploadFilename, localFile);
    const documentType = normalizeDocumentType(input.documentType, this.settings.documentTypes);
    const remoteFolder = input.destinationFolder;
    const remotePath = joinRemotePath(remoteFolder, uploadFilename);

    const uploaded = await this.provider.uploadFile({
      localPath: localFile,
      remoteFolder,
      remoteName: uploadFilename,
    });

    this.cache(vaultPath).seedFromLocalFile(localFile, remotePath, uploaded.modifiedTime);

    const noteFolder = externalFileNoteFolder(this.settings.externalNotesFolder, documentType, this.settings.documentTypes);
    await this.app.vault.createFolder(noteFolder).catch(() => undefined);
    const noteRel = await uniqueMarkdownPath(this.app, path.posix.join(noteFolder, `${title}.md`));
    const size = fs.statSync(localFile).size;
    const note = buildExternalFileNote({
      title,
      documentType,
      remoteFolder,
      provider: this.settings.provider,
      remotePath,
      shareLink: input.shareLink ? 'pending' : 'none',
      originalFilename: path.basename(localFile),
      uploadFilename,
      size,
      contextType: deriveContextType(remoteFolder, this.settings.remoteRoot, this.settings.contextTypes),
      contextName: deriveContextName(remoteFolder, this.settings.remoteRoot),
      date,
    }, this.settings.documentTypes);

    const created = await this.app.vault.create(noteRel, note);
    return {
      link: `[[${created.basename}]]`,
      notePath: path.join(vaultPath, created.path),
      remotePath,
      storageFolder: remoteFolder,
    };
  }

  async openExternalFile(note: TFile, open = true): Promise<{ cacheHit: boolean; opened: string; remotePath: string }> {
    const vaultPath = getVaultPath(this.app);
    const text = await this.app.vault.read(note);
    const fm = parseFrontmatter(text);
    const remotePath = fm.remote_path || fm.proton_path;
    if (!remotePath) throw new Error('Active note has no remote_path property.');

    const cache = this.cache(vaultPath);
    const cachePath = cache.cachePathForRemote(remotePath);
    const cacheHit = fs.existsSync(cachePath);

    if (!cacheHit) {
      fs.mkdirSync(path.dirname(cachePath), { recursive: true });
      const tempDir = fs.mkdtempSync(path.join(cache.cacheRoot(), '.download-'));
      try {
        const downloaded = await this.provider.downloadFile(remotePath, tempDir);
        fs.renameSync(downloaded.path, cachePath);
        const info = await this.provider.stat(remotePath);
        const index = cache.readIndex();
        index[remotePath] = {
          cachePath: path.relative(vaultPath, cachePath),
          remoteTime: info.modifiedTime,
          cachedAt: new Date().toISOString(),
        };
        cache.writeIndex(index);
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }

    if (open) openFile(cachePath);
    return { opened: cachePath, cacheHit, remotePath };
  }

  async renameFolder(oldPath: string, newName: string): Promise<number> {
    await this.provider.renameFolder(oldPath, newName);
    const newPath = joinRemotePath(parentRemotePath(oldPath, this.settings.remoteRoot), newName);
    const changed = await this.updateVaultPathReferences(oldPath, newPath);
    this.cache(getVaultPath(this.app)).remapFolder(oldPath, newPath);
    return changed;
  }

  async trashFolder(folderPath: string): Promise<number> {
    await this.provider.trashFolder(folderPath);
    this.cache(getVaultPath(this.app)).removeFolder(folderPath);
    return this.markDeletedFolderNotes(folderPath);
  }

  async updateVaultPathReferences(oldPath: string, newPath: string): Promise<number> {
    const today = new Date().toISOString().slice(0, 10);
    let changed = 0;
    for (const file of this.app.vault.getMarkdownFiles()) {
      const text = await this.app.vault.read(file);
      if (!text.includes(oldPath)) continue;
      const fm = parseFrontmatter(text);
      const updated = fm.type === 'external-file'
        ? updateExternalFileTextForFolderRename(text, oldPath, newPath, today, this.settings.remoteRoot, this.settings.contextTypes)
        : replacePathPrefix(text, oldPath, newPath);
      if (updated !== text) {
        await this.app.vault.modify(file, updated);
        changed += 1;
      }
    }
    return changed;
  }

  async markDeletedFolderNotes(folderPath: string): Promise<number> {
    const today = new Date().toISOString().slice(0, 10);
    let changed = 0;
    for (const file of this.app.vault.getMarkdownFiles()) {
      const text = await this.app.vault.read(file);
      if (!text.includes(folderPath)) continue;
      const updated = markExternalFileTextMissing(text, folderPath, today, 'External storage folder moved to trash');
      if (updated !== text) {
        await this.app.vault.modify(file, updated);
        changed += 1;
      }
    }
    return changed;
  }

  async validateExternalFileNotes(): Promise<ValidationResult> {
    let found = 0;
    let missing = 0;
    let errors = 0;
    let changed = 0;
    const today = new Date().toISOString().slice(0, 10);

    for (const file of this.app.vault.getMarkdownFiles()) {
      const text = await this.app.vault.read(file);
      const fm = parseFrontmatter(text);
      const remotePath = fm.remote_path || fm.proton_path;
      if (fm.type !== 'external-file' || !remotePath) continue;
      try {
        await this.provider.stat(remotePath);
        found += 1;
      } catch (error) {
        if (!isMissingRemotePathError(error)) {
          errors += 1;
          console.warn(`Could not validate ${file.path}:`, error);
          continue;
        }
        missing += 1;
        const updated = markExternalFileTextMissing(text, remotePath, today, 'External file not found during validation');
        if (updated !== text) {
          await this.app.vault.modify(file, updated);
          changed += 1;
        }
      }
    }

    return { found, missing, changed, errors };
  }

  async openCreatedNote(absoluteNotePath: string): Promise<void> {
    const vaultPath = getVaultPath(this.app);
    const rel = vaultRelativePath(vaultPath, absoluteNotePath);
    const file = this.app.vault.getAbstractFileByPath(rel);
    if (file instanceof Object && 'extension' in file) {
      await this.app.workspace.getLeaf(false).openFile(file as TFile);
    }
  }

  private cache(vaultPath: string): CacheService {
    return new CacheService(vaultPath, this.settings.cacheFolder, this.settings.remoteRoot);
  }
}

function openFile(filePath: string): void {
  if (process.platform === 'darwin') {
    spawnSync(fs.existsSync('/usr/bin/open') ? '/usr/bin/open' : 'open', [filePath], { stdio: 'ignore' });
    return;
  }
  if (process.platform === 'win32') {
    spawnSync('cmd', ['/c', 'start', '', filePath], { stdio: 'ignore' });
    return;
  }
  spawnSync('xdg-open', [filePath], { stdio: 'ignore' });
}
