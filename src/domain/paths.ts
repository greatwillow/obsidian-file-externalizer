import path from 'node:path';
import { ContextType } from '../constants';

export function normalizeRemoteFolder(folderPath: string, remoteRoot: string): string {
  const normalized = String(folderPath || '').trim().replace(/\/+$/g, '');
  const root = remoteRoot.replace(/\/+$/g, '');
  if (!root) return normalized;
  if (!normalized || normalized === root) return root;
  if (!normalized.startsWith(`${root}/`)) return root;
  return normalized;
}

export function joinRemotePath(parentPath: string, childName: string): string {
  const cleanChild = String(childName || '').trim().replace(/^\/+|\/+$/g, '');
  if (!cleanChild) return parentPath;
  return `${parentPath.replace(/\/+$/g, '')}/${cleanChild}`;
}

export function parentRemotePath(currentPath: string, remoteRoot: string): string {
  const root = remoteRoot.replace(/\/+$/g, '');
  if (currentPath === root) return root;
  const parent = currentPath.replace(/\/+$/g, '').replace(/\/[^/]+$/, '');
  return parent && parent.startsWith(root) ? parent : root;
}

export function pathName(folderPath: string, remoteRoot: string): string {
  const normalized = normalizeRemoteFolder(folderPath, remoteRoot);
  if (normalized === remoteRoot) return 'External Files';
  return normalized.split('/').filter(Boolean).pop() || normalized;
}

export function isRemoteRoot(folderPath: string, remoteRoot: string): boolean {
  return normalizeRemoteFolder(folderPath, remoteRoot) === remoteRoot;
}

export function descendantOrSame(candidate: string, base: string): boolean {
  return candidate === base || String(candidate || '').startsWith(`${base}/`);
}

export function replacePathPrefix(text: string, oldPath: string, newPath: string): string {
  return String(text || '').split(oldPath).join(newPath);
}

export function relativeRemotePath(remotePath: string, remoteRoot: string): string {
  return normalizeRemoteFolder(remotePath, remoteRoot).slice(remoteRoot.length).replace(/^\//, '');
}

export function safeRelativeRemotePath(remotePath: string, remoteRoot: string): string {
  const root = remoteRoot.replace(/\/+$/g, '');
  const rootPattern = root ? new RegExp(`^${escapeRegExp(root)}/?`) : null;
  return String(remotePath || '')
    .replace(rootPattern || /^/, '')
    .replace(/^\/+/, '')
    .split('/')
    .map((part) => part.replace(/[\\:*?"<>|]/g, '-'))
    .join('/');
}

export function deriveContextType(remoteFolder: string, remoteRoot: string, contextTypes: string[]): ContextType {
  const first = normalizeRemoteFolder(remoteFolder, remoteRoot)
    .slice(remoteRoot.length)
    .split('/')
    .filter(Boolean)[0];
  return contextTypes.includes(first) ? first as ContextType : 'General';
}

export function deriveContextName(remoteFolder: string, remoteRoot: string): string {
  const parts = normalizeRemoteFolder(remoteFolder, remoteRoot)
    .slice(remoteRoot.length)
    .split('/')
    .filter(Boolean);
  if (parts.length >= 2) return parts[1];
  if (parts.length === 1 && parts[0] !== 'General') return parts[0];
  return 'General';
}

export function toPosixPath(filePath: string): string {
  return filePath.split(path.sep).join('/');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
