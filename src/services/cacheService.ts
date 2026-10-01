import fs from 'node:fs';
import path from 'node:path';
import { safeRelativeRemotePath } from '../domain/paths';

interface CacheEntry {
  cachedAt: string;
  cachePath: string;
  remoteTime: string;
}

type CacheIndex = Record<string, CacheEntry>;

export class CacheService {
  constructor(
    private readonly vaultPath: string,
    private readonly cacheFolder: string,
    private readonly remoteRoot: string,
  ) {}

  cachePathForRemote(remotePath: string): string {
    return path.join(this.cacheRoot(), safeRelativeRemotePath(remotePath, this.remoteRoot));
  }

  seedFromLocalFile(localPath: string, remotePath: string, remoteTime: string): void {
    const cachePath = this.cachePathForRemote(remotePath);
    fs.mkdirSync(path.dirname(cachePath), { recursive: true });
    fs.copyFileSync(localPath, cachePath);
    const index = this.readIndex();
    index[remotePath] = {
      cachePath: path.relative(this.vaultPath, cachePath),
      remoteTime,
      cachedAt: new Date().toISOString(),
    };
    this.writeIndex(index);
  }

  has(remotePath: string): boolean {
    return fs.existsSync(this.cachePathForRemote(remotePath));
  }

  remapFolder(oldPath: string, newPath: string): void {
    const oldCachePath = this.cachePathForRemote(oldPath);
    const newCachePath = this.cachePathForRemote(newPath);
    mergeMovePath(oldCachePath, newCachePath);
    removeEmptyParents(path.dirname(oldCachePath), this.cacheRoot());

    const index = this.readIndex();
    const next: CacheIndex = {};
    for (const [key, value] of Object.entries(index)) {
      if (key === oldPath || key.startsWith(`${oldPath}/`)) {
        const newKey = key.replace(oldPath, newPath);
        next[newKey] = {
          ...value,
          cachePath: path.relative(this.vaultPath, this.cachePathForRemote(newKey)),
        };
      } else {
        next[key] = value;
      }
    }
    this.writeIndex(next);
  }

  removeFolder(folderPath: string): void {
    const target = this.cachePathForRemote(folderPath);
    fs.rmSync(target, { recursive: true, force: true });
    removeEmptyParents(path.dirname(target), this.cacheRoot());

    const index = this.readIndex();
    const next: CacheIndex = {};
    for (const [key, value] of Object.entries(index)) {
      if (key !== folderPath && !key.startsWith(`${folderPath}/`)) next[key] = value;
    }
    this.writeIndex(next);
  }

  cacheRoot(): string {
    return path.join(this.vaultPath, this.cacheFolder);
  }

  indexPath(): string {
    return path.join(this.cacheRoot(), '.cache-index.json');
  }

  readIndex(): CacheIndex {
    const indexPath = this.indexPath();
    if (!fs.existsSync(indexPath)) return {};
    try {
      return JSON.parse(fs.readFileSync(indexPath, 'utf8')) as CacheIndex;
    } catch {
      return {};
    }
  }

  writeIndex(index: CacheIndex): void {
    fs.mkdirSync(path.dirname(this.indexPath()), { recursive: true });
    fs.writeFileSync(this.indexPath(), JSON.stringify(index, null, 2));
  }
}

function mergeMovePath(fromPath: string, toPath: string): void {
  if (!fs.existsSync(fromPath)) return;
  if (!fs.existsSync(toPath)) {
    fs.mkdirSync(path.dirname(toPath), { recursive: true });
    fs.renameSync(fromPath, toPath);
    return;
  }
  const stat = fs.statSync(fromPath);
  if (stat.isDirectory()) {
    fs.mkdirSync(toPath, { recursive: true });
    for (const name of fs.readdirSync(fromPath)) {
      mergeMovePath(path.join(fromPath, name), path.join(toPath, name));
    }
    fs.rmSync(fromPath, { recursive: true, force: true });
  } else {
    fs.mkdirSync(path.dirname(toPath), { recursive: true });
    fs.rmSync(toPath, { force: true });
    fs.renameSync(fromPath, toPath);
  }
}

function removeEmptyParents(startPath: string, stopPath: string): void {
  let current = startPath;
  const stop = path.resolve(stopPath);
  while (path.resolve(current).startsWith(stop) && path.resolve(current) !== stop) {
    try {
      if (fs.existsSync(current) && fs.readdirSync(current).length === 0) fs.rmdirSync(current);
      else return;
    } catch {
      return;
    }
    current = path.dirname(current);
  }
}
