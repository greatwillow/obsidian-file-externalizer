import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { CacheService } from '../src/services/cacheService';

const root = '/remote/files';

function withCache(fn: (cache: CacheService, vault: string, tmp: string) => void): void {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'file-externalizer-cache-'));
  try {
    const vault = path.join(tmp, 'vault');
    fs.mkdirSync(vault, { recursive: true });
    fn(new CacheService(vault, 'Cache', root), vault, tmp);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

function source(tmp: string, name: string, content: string): string {
  const file = path.join(tmp, name);
  fs.writeFileSync(file, content);
  return file;
}

test('a corrupt cache index is treated as empty instead of breaking the plugin', () => {
  withCache((cache) => {
    fs.mkdirSync(cache.cacheRoot(), { recursive: true });
    fs.writeFileSync(cache.indexPath(), '{not json');
    assert.deepEqual(cache.readIndex(), {});
  });
});

test('has() reflects whether the cached file exists', () => {
  withCache((cache, _vault, tmp) => {
    const remote = `${root}/A/a.pdf`;
    assert.equal(cache.has(remote), false);
    cache.seedFromLocalFile(source(tmp, 'a.pdf', 'a'), remote, 't1');
    assert.equal(cache.has(remote), true);
  });
});

test('index entries store vault-relative cache paths', () => {
  withCache((cache, _vault, tmp) => {
    cache.seedFromLocalFile(source(tmp, 'a.pdf', 'a'), `${root}/A/a.pdf`, 't1');
    assert.equal(cache.readIndex()[`${root}/A/a.pdf`].cachePath, path.join('Cache', 'A', 'a.pdf'));
  });
});

test('remapFolder merges into an existing destination and replaces clashing files', () => {
  withCache((cache, _vault, tmp) => {
    cache.seedFromLocalFile(source(tmp, 'old.pdf', 'new-version'), `${root}/A/same.pdf`, 't1');
    cache.seedFromLocalFile(source(tmp, 'other.pdf', 'other'), `${root}/A/only-in-a.pdf`, 't1');
    cache.seedFromLocalFile(source(tmp, 'dest.pdf', 'stale'), `${root}/B/same.pdf`, 't0');

    cache.remapFolder(`${root}/A`, `${root}/B`);
    assert.equal(fs.readFileSync(cache.cachePathForRemote(`${root}/B/same.pdf`), 'utf8'), 'new-version');
    assert.equal(cache.has(`${root}/B/only-in-a.pdf`), true);
    assert.equal(fs.existsSync(cache.cachePathForRemote(`${root}/A`)), false);
  });
});

test('remapFolder and removeFolder leave sibling folders with a shared prefix alone', () => {
  withCache((cache, _vault, tmp) => {
    cache.seedFromLocalFile(source(tmp, 'a.pdf', 'a'), `${root}/Legal/a.pdf`, 't1');
    cache.seedFromLocalFile(source(tmp, 'b.pdf', 'b'), `${root}/Legal Ops/b.pdf`, 't1');

    cache.remapFolder(`${root}/Legal`, `${root}/Contracts`);
    assert.deepEqual(Object.keys(cache.readIndex()).sort(), [`${root}/Contracts/a.pdf`, `${root}/Legal Ops/b.pdf`]);

    cache.removeFolder(`${root}/Contracts`);
    assert.deepEqual(Object.keys(cache.readIndex()), [`${root}/Legal Ops/b.pdf`]);
    assert.equal(cache.has(`${root}/Legal Ops/b.pdf`), true);
  });
});

test('removing the last cached folder keeps the cache root itself', () => {
  withCache((cache, _vault, tmp) => {
    cache.seedFromLocalFile(source(tmp, 'a.pdf', 'a'), `${root}/Deep/Nested/a.pdf`, 't1');
    cache.removeFolder(`${root}/Deep/Nested`);
    assert.equal(fs.existsSync(path.join(cache.cacheRoot(), 'Deep')), false, 'empty parents are pruned');
    assert.equal(fs.existsSync(cache.cacheRoot()), true);
  });
});

test('remapping a folder that was never cached is a no-op', () => {
  withCache((cache) => {
    cache.remapFolder(`${root}/Nope`, `${root}/Still Nope`);
    assert.deepEqual(cache.readIndex(), {});
  });
});
