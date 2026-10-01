import { execFile as execFileCallback, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { joinRemotePath } from '../domain/paths';
import { StorageProvider, StoredFile, UploadFileInput } from './storageProvider';

const execFile = promisify(execFileCallback);

interface ProtonItem {
  activeRevision?: {
    claimedSize?: number;
    creationTime?: string;
    storageSize?: number;
  };
  creationTime?: string;
  mediaType?: string;
  modificationTime?: string;
  name?: string | { ok?: boolean; value?: string };
  totalStorageSize?: number;
  type?: string;
}

export class ProtonDriveCliProvider implements StorageProvider {
  private readonly cliPath: string;

  constructor(cliPath = findProtonDriveCli()) {
    this.cliPath = cliPath;
  }

  async createFolder(parentPath: string, name: string): Promise<void> {
    await this.run(['filesystem', 'create-folder', parentPath, name, '--json']);
  }

  async downloadFile(remotePath: string, destinationFolder: string): Promise<StoredFile> {
    await this.run(['filesystem', 'download', '-f', 'remove', remotePath, destinationFolder]);
    const downloaded = path.join(destinationFolder, path.basename(remotePath));
    if (!fs.existsSync(downloaded)) throw new Error('Download completed, but expected file was not found.');
    const stat = fs.statSync(downloaded);
    return {
      modifiedTime: stat.mtime.toISOString(),
      path: downloaded,
      size: stat.size,
    };
  }

  async listFolders(parentPath: string): Promise<string[]> {
    const raw = await this.run(['filesystem', 'list', parentPath, '--json']);
    const items = JSON.parse(raw || '[]') as ProtonItem[];
    return items
      .filter((item) => item && item.type === 'folder')
      .map(protonItemName)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }

  async renameFolder(oldPath: string, newName: string): Promise<void> {
    await this.run(['filesystem', 'rename', oldPath, newName]);
  }

  async stat(remotePath: string): Promise<StoredFile> {
    const raw = await this.run(['filesystem', 'info', remotePath, '--json']);
    const item = JSON.parse(raw || '{}') as ProtonItem;
    return {
      modifiedTime: newestTime(item),
      path: remotePath,
      size: item.totalStorageSize || item.activeRevision?.claimedSize || item.activeRevision?.storageSize || 0,
    };
  }

  async trashFolder(remotePath: string): Promise<void> {
    await this.run(['filesystem', 'trash', remotePath]);
  }

  async uploadFile(input: UploadFileInput): Promise<StoredFile> {
    const prepared = prepareUploadFile(input.localPath, input.remoteName);
    try {
      await this.run(['filesystem', 'upload', '-f', 'replace', '-d', 'merge', prepared.uploadPath, input.remoteFolder, '--json']);
      return this.stat(joinRemotePath(input.remoteFolder, input.remoteName));
    } finally {
      prepared.cleanup();
    }
  }

  private async run(args: string[]): Promise<string> {
    try {
      const result = await execFile(this.cliPath, args, { encoding: 'utf8' });
      return result.stdout || '';
    } catch (error) {
      throw decorateCliError(this.cliPath, args, error);
    }
  }
}

export function findProtonDriveCli(): string {
  const candidates = [
    process.env.PROTON_DRIVE_CLI,
    'proton-drive',
    path.join(os.homedir(), '.local/bin/proton-drive'),
    '/opt/homebrew/bin/proton-drive',
    '/usr/local/bin/proton-drive',
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const probe = spawnSync(candidate, ['--help'], { encoding: 'utf8' });
    if (probe.status === 0) return candidate;
  }

  throw new Error('Could not find proton-drive CLI. Install it or set PROTON_DRIVE_CLI.');
}

export function isMissingRemotePathError(error: unknown): boolean {
  const err = error as { message?: string; stderr?: string; stdout?: string };
  const message = `${err?.message || ''}\n${err?.stderr || ''}\n${err?.stdout || ''}`.toLowerCase();
  return message.includes('not found') ||
    message.includes('does not exist') ||
    message.includes('no such file') ||
    message.includes('404');
}

function protonItemName(item: ProtonItem): string {
  if (!item) return '';
  if (typeof item.name === 'string') return item.name;
  if (item.name && typeof item.name.value === 'string') return item.name.value;
  return '';
}

function newestTime(item: ProtonItem): string {
  return item.modificationTime || item.activeRevision?.creationTime || item.creationTime || '';
}

function prepareUploadFile(localPath: string, remoteName: string): { cleanup: () => void; uploadPath: string } {
  if (path.basename(localPath) === remoteName) return { uploadPath: localPath, cleanup: () => undefined };
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'file-externalizer-upload-'));
  const uploadPath = path.join(tempDir, remoteName);
  fs.copyFileSync(localPath, uploadPath);
  return {
    uploadPath,
    cleanup: () => fs.rmSync(tempDir, { recursive: true, force: true }),
  };
}

function decorateCliError(cliPath: string, args: string[], error: unknown): Error {
  const err = error as Error & { stderr?: string; stdout?: string };
  const details = [
    err.message,
    err.stderr && `stderr: ${err.stderr.trim()}`,
    err.stdout && `stdout: ${err.stdout.trim()}`,
  ].filter(Boolean).join('\n');
  const wrapped = new Error(`${cliPath} ${args.join(' ')} failed${details ? `\n${details}` : ''}`);
  (wrapped as Error & { stderr?: string; stdout?: string }).stderr = err.stderr;
  (wrapped as Error & { stderr?: string; stdout?: string }).stdout = err.stdout;
  return wrapped;
}
