import type { App, TFile } from 'obsidian';
import path from 'node:path';
import { toPosixPath } from '../domain/paths';

export function getVaultPath(app: App): string {
  const adapter = app.vault.adapter as { basePath?: string; getBasePath?: () => string };
  if (typeof adapter.getBasePath === 'function') return adapter.getBasePath();
  if (adapter.basePath) return adapter.basePath;
  throw new Error('File Externalizer requires the desktop filesystem adapter.');
}

export function vaultRelativePath(vaultPath: string, absolutePath: string): string {
  return toPosixPath(path.relative(vaultPath, absolutePath));
}

export async function uniqueMarkdownPath(app: App, requestedPath: string): Promise<string> {
  if (!await app.vault.adapter.exists(requestedPath)) return requestedPath;
  const ext = path.posix.extname(requestedPath);
  const base = requestedPath.slice(0, -ext.length);
  for (let i = 2; i < 1000; i += 1) {
    const candidate = `${base} ${i}${ext}`;
    if (!await app.vault.adapter.exists(candidate)) return candidate;
  }
  throw new Error('Could not create a unique note path.');
}

export function activeMarkdownFile(app: App): TFile | null {
  const file = app.workspace.getActiveFile();
  return file && file.extension === 'md' ? file : null;
}

export function findExternalFileNote(app: App): TFile | null {
  const active = activeMarkdownFile(app);
  if (active && fileHasRemotePath(app, active)) return active;

  for (const leaf of app.workspace.getLeavesOfType('markdown')) {
    const file = leaf?.view && 'file' in leaf.view ? leaf.view.file as TFile | null : null;
    if (file && file.extension === 'md' && fileHasRemotePath(app, file)) return file;
  }

  return active;
}

function fileHasRemotePath(app: App, file: TFile): boolean {
  const cache = app.metadataCache.getFileCache(file);
  return Boolean(cache?.frontmatter?.remote_path || cache?.frontmatter?.proton_path);
}
