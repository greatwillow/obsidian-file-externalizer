import { execFile as execFileCallback, spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { joinRemotePath } from '../domain/paths';
import { LoginResult, SetupCheck, SetupStatus, StorageProvider, StoredFile, UploadFileInput } from './storageProvider';

const execFile = promisify(execFileCallback);

export const PROTON_CLI_INSTALL_URL = 'https://proton.me/support/drive-cli';
const PROTON_DEFAULT_ROOT = '/my-files';
const LOGIN_TIMEOUT_MS = 5 * 60 * 1000;

export type CliProbe = (candidate: string) => boolean;

export interface ProtonDriveCliProviderOptions {
  /** Explicit CLI path from plugin settings. Empty means auto-detect. */
  cliPath?: string;
  /** Overrides how candidate CLI paths are tested. Used by tests. */
  probe?: CliProbe;
}

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
  private resolvedCliPath: string | null = null;

  constructor(private readonly options: ProtonDriveCliProviderOptions = {}) {}

  /** Resolves the CLI lazily so the plugin still loads when Proton is not installed yet. */
  cliPath(): string {
    if (!this.resolvedCliPath) this.resolvedCliPath = findProtonDriveCli(this.options.cliPath, this.options.probe);
    return this.resolvedCliPath;
  }

  async checkSetup(remoteRoot: string): Promise<SetupStatus> {
    const checks: SetupCheck[] = [];
    let cliPath: string;
    try {
      cliPath = this.cliPath();
      checks.push({ label: 'Proton Drive CLI', ok: true, detail: cliPath });
    } catch {
      checks.push({
        label: 'Proton Drive CLI',
        ok: false,
        detail: `Not found. Install it from ${PROTON_CLI_INSTALL_URL}, or set the CLI path in settings.`,
      });
      return { ready: false, checks };
    }

    const root = remoteRoot.replace(/\/+$/g, '');
    try {
      await this.run(['filesystem', 'list', root || PROTON_DEFAULT_ROOT, '--json']);
      checks.push({ label: 'Signed in', ok: true, detail: 'Proton Drive responded.' });
      checks.push(root
        ? { label: 'Remote root', ok: true, detail: root }
        : { label: 'Remote root', ok: false, detail: 'Not configured. Set the remote root in settings.' });
    } catch (error) {
      if (isMissingRemotePathError(error) && root) {
        checks.push({ label: 'Signed in', ok: true, detail: 'Proton Drive responded.' });
        checks.push({ label: 'Remote root', ok: false, detail: `${root} was not found, or this account cannot see it.` });
      } else if (isAuthError(error)) {
        checks.push({ label: 'Signed in', ok: false, detail: 'Not signed in. Use "Log in to Proton".' });
      } else {
        checks.push({ label: 'Signed in', ok: false, detail: firstLine(error) || `${cliPath} could not reach Proton Drive.` });
      }
    }

    return { ready: checks.every((check) => check.ok), checks };
  }

  /**
   * Runs `proton-drive auth login`, which completes in the browser, and waits for it to finish.
   * `onUrl` receives the first sign-in link the CLI prints, in case the browser did not open on its own.
   */
  login(onUrl?: (url: string) => void): Promise<LoginResult> {
    const cliPath = this.cliPath();
    return new Promise((resolve, reject) => {
      const child = spawn(cliPath, ['auth', 'login'], { stdio: ['ignore', 'pipe', 'pipe'] });
      let output = '';
      let urlReported = false;
      const collect = (chunk: Buffer) => {
        output += chunk.toString('utf8');
        const url = urlReported ? null : findUrl(output);
        if (url && onUrl) {
          urlReported = true;
          onUrl(url);
        }
      };
      child.stdout?.on('data', collect);
      child.stderr?.on('data', collect);
      const timer = setTimeout(() => {
        child.kill();
        reject(new Error('Proton login timed out. Try again, or run `proton-drive auth login` in a terminal.'));
      }, LOGIN_TIMEOUT_MS);
      child.on('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
      child.on('close', (code) => {
        clearTimeout(timer);
        if (code === 0) resolve({ output, url: findUrl(output) });
        else reject(new Error(`Proton login failed (exit ${code}).${output.trim() ? `\n${output.trim()}` : ''}`));
      });
    });
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
      const result = await execFile(this.cliPath(), args, { encoding: 'utf8' });
      return result.stdout || '';
    } catch (error) {
      throw decorateCliError(this.cliPath(), args, error);
    }
  }
}

export function protonDriveCliCandidates(configuredPath = '', env: NodeJS.ProcessEnv = process.env, home = os.homedir()): string[] {
  const candidates = [
    configuredPath.trim(),
    env.PROTON_DRIVE_CLI,
    'proton-drive',
    path.join(home, '.local/bin/proton-drive'),
    '/opt/homebrew/bin/proton-drive',
    '/usr/local/bin/proton-drive',
  ].filter(Boolean) as string[];
  return Array.from(new Set(candidates));
}

export function findProtonDriveCli(configuredPath = '', probe: CliProbe = probeCli): string {
  for (const candidate of protonDriveCliCandidates(configuredPath)) {
    if (probe(candidate)) return candidate;
  }

  throw new Error('Could not find proton-drive CLI. Install it or set the CLI path in File Externalizer settings.');
}

function probeCli(candidate: string): boolean {
  return spawnSync(candidate, ['--help'], { encoding: 'utf8' }).status === 0;
}

export function isAuthError(error: unknown): boolean {
  // Look at the CLI's own output first: the wrapped message also echoes the command and its paths.
  const err = error as { message?: string; stderr?: string; stdout?: string };
  const output = `${err?.stderr || ''}\n${err?.stdout || ''}`.trim() || err?.message || '';
  return /not (logged|signed) in|log ?in|sign ?in|unauthori[sz]ed|unauthenticated|authenticat|\b401\b|session (has )?expired/i.test(output);
}

function errorText(error: unknown): string {
  const err = error as { message?: string; stderr?: string; stdout?: string };
  return `${err?.message || ''}\n${err?.stderr || ''}\n${err?.stdout || ''}`.toLowerCase();
}

function firstLine(error: unknown): string {
  const err = error as { message?: string; stderr?: string };
  return String(err?.stderr || err?.message || '').trim().split(/\r?\n/)[0] || '';
}

function findUrl(text: string): string | null {
  const match = text.match(/https:\/\/\S+/);
  return match ? match[0] : null;
}

export function isMissingRemotePathError(error: unknown): boolean {
  const message = errorText(error);
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
