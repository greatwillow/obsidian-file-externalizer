import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { App, TFile } from 'obsidian';
import { parseFrontmatter } from '../../src/domain/frontmatter';
import type { LoginResult, SetupStatus, StorageProvider, StoredFile, UploadFileInput } from '../../src/providers/storageProvider';

export interface FakeFile {
  basename: string;
  extension: string;
  path: string;
}

/** Minimal in-memory stand-in for the parts of Obsidian's App the service uses. */
export class FakeVault {
  readonly basePath: string;
  readonly files = new Map<string, string>();
  readonly folders = new Set<string>();
  active: FakeFile | null = null;
  opened: string[] = [];

  constructor() {
    this.basePath = fs.mkdtempSync(path.join(os.tmpdir(), 'file-externalizer-vault-'));
  }

  addNote(notePath: string, text: string): FakeFile & TFile {
    this.files.set(notePath, text);
    return fileFor(notePath);
  }

  text(notePath: string): string {
    const text = this.files.get(notePath);
    if (text === undefined) throw new Error(`No note at ${notePath}`);
    return text;
  }

  cleanup(): void {
    fs.rmSync(this.basePath, { recursive: true, force: true });
  }

  app(): App {
    const vault = {
      adapter: {
        getBasePath: () => this.basePath,
        exists: async (p: string) => this.files.has(p) || this.folders.has(p),
      },
      create: async (p: string, text: string) => {
        if (this.files.has(p)) throw new Error(`File already exists: ${p}`);
        this.files.set(p, text);
        return fileFor(p);
      },
      createFolder: async (p: string) => {
        if (this.folders.has(p)) throw new Error('Folder already exists.');
        this.folders.add(p);
      },
      getAbstractFileByPath: (p: string) => (this.files.has(p) ? fileFor(p) : null),
      getMarkdownFiles: () => Array.from(this.files.keys()).filter((p) => p.endsWith('.md')).map(fileFor),
      modify: async (file: FakeFile, text: string) => { this.files.set(file.path, text); },
      read: async (file: FakeFile) => this.text(file.path),
    };
    const workspace = {
      getActiveFile: () => this.active,
      getLeaf: () => ({ openFile: async (file: FakeFile) => { this.opened.push(file.path); } }),
      getLeavesOfType: () => [],
    };
    const metadataCache = {
      getFileCache: (file: FakeFile) => ({ frontmatter: parseFrontmatter(this.files.get(file.path) || '') }),
    };
    return { vault, workspace, metadataCache } as unknown as App;
  }
}

export function fileFor(notePath: string): FakeFile & TFile {
  const parsed = path.posix.parse(notePath);
  return { path: notePath, basename: parsed.name, extension: parsed.ext.replace(/^\./, '') } as FakeFile & TFile;
}

interface RemoteFile {
  content: string;
  modifiedTime: string;
}

/** In-memory storage provider that records calls and can be told to fail. */
export class FakeProvider implements StorageProvider {
  readonly files = new Map<string, RemoteFile>();
  readonly folders = new Set<string>();
  readonly calls: string[] = [];
  statError: ((remotePath: string) => Error | null) | null = null;
  checkSetup?: (remoteRoot: string) => Promise<SetupStatus>;
  login?: (onUrl?: (url: string) => void) => Promise<LoginResult>;

  addRemoteFile(remotePath: string, content: string, modifiedTime = '2026-09-30T12:00:00.000Z'): void {
    this.files.set(remotePath, { content, modifiedTime });
  }

  async createFolder(parentPath: string, name: string): Promise<void> {
    this.calls.push(`createFolder ${parentPath} ${name}`);
    this.folders.add(`${parentPath}/${name}`);
  }

  async downloadFile(remotePath: string, destinationFolder: string): Promise<StoredFile> {
    this.calls.push(`download ${remotePath}`);
    const file = this.files.get(remotePath);
    if (!file) throw new Error(`not found: ${remotePath}`);
    const target = path.join(destinationFolder, path.basename(remotePath));
    fs.writeFileSync(target, file.content);
    return { path: target, size: file.content.length, modifiedTime: file.modifiedTime };
  }

  async listFolders(parentPath: string): Promise<string[]> {
    this.calls.push(`list ${parentPath}`);
    return Array.from(this.folders)
      .filter((folder) => path.posix.dirname(folder) === parentPath)
      .map((folder) => path.posix.basename(folder))
      .sort();
  }

  async renameFolder(oldPath: string, newName: string): Promise<void> {
    this.calls.push(`rename ${oldPath} ${newName}`);
    const newPath = `${path.posix.dirname(oldPath)}/${newName}`;
    for (const [key, value] of Array.from(this.files)) {
      if (key.startsWith(`${oldPath}/`)) {
        this.files.delete(key);
        this.files.set(newPath + key.slice(oldPath.length), value);
      }
    }
  }

  async stat(remotePath: string): Promise<StoredFile> {
    this.calls.push(`stat ${remotePath}`);
    const forced = this.statError?.(remotePath);
    if (forced) throw forced;
    const file = this.files.get(remotePath);
    if (!file) throw new Error(`File not found: ${remotePath}`);
    return { path: remotePath, size: file.content.length, modifiedTime: file.modifiedTime };
  }

  async trashFolder(remotePath: string): Promise<void> {
    this.calls.push(`trash ${remotePath}`);
    for (const key of Array.from(this.files.keys())) {
      if (key.startsWith(`${remotePath}/`)) this.files.delete(key);
    }
  }

  async uploadFile(input: UploadFileInput): Promise<StoredFile> {
    this.calls.push(`upload ${input.localPath} -> ${input.remoteFolder}/${input.remoteName}`);
    const remotePath = `${input.remoteFolder}/${input.remoteName}`;
    this.addRemoteFile(remotePath, fs.readFileSync(input.localPath, 'utf8'));
    return this.stat(remotePath);
  }
}
