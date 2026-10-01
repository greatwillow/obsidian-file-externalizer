import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { normalizeSettings } from '../src/settings';
import { safeRelativeRemotePath, normalizeRemoteFolder } from '../src/domain/paths';
import { isMissingRemotePathError } from '../src/providers/protonDriveCliProvider';
import { CacheService } from '../src/services/cacheService';

test('normalizeSettings uses generic defaults and trims configured remote roots', () => {
  const settings = normalizeSettings({
    cacheFolder: '',
    documentTypes: ['Records', 'Reference'],
    contextTypes: ['Projects', 'Clients', 'Projects'],
    externalNotesFolder: '  External File Notes  ',
    remoteRoot: '/remote/files///',
  });

  assert.equal(settings.cacheFolder, 'File Externalizer Cache');
  assert.deepEqual(settings.documentTypes, ['Records', 'Reference', 'Other']);
  assert.deepEqual(settings.contextTypes, ['Projects', 'Clients']);
  assert.equal(settings.externalNotesFolder, 'External File Notes');
  assert.equal(settings.remoteRoot, '/remote/files');
});

test('normalizeRemoteFolder does not force an unconfigured remote root', () => {
  assert.equal(normalizeRemoteFolder('/any/provider/path', ''), '/any/provider/path');
});

test('safeRelativeRemotePath handles configured and unconfigured roots', () => {
  assert.equal(safeRelativeRemotePath('/remote/files/Projects/A/file.pdf', '/remote/files'), 'Projects/A/file.pdf');
  assert.equal(safeRelativeRemotePath('/remote/files/Projects/A/file.pdf', ''), 'remote/files/Projects/A/file.pdf');
});

test('isMissingRemotePathError recognizes common missing-file messages only', () => {
  assert.equal(isMissingRemotePathError(new Error('404 not found')), true);
  assert.equal(isMissingRemotePathError({ stderr: 'No such file or directory' }), true);
  assert.equal(isMissingRemotePathError(new Error('authentication failed')), false);
});

test('CacheService seeds, remaps, and removes cached external files', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'file-externalizer-test-'));
  try {
    const vault = path.join(tmp, 'vault');
    const source = path.join(tmp, 'source.pdf');
    fs.mkdirSync(vault, { recursive: true });
    fs.writeFileSync(source, 'pdf');

    const cache = new CacheService(vault, 'Cache', '/remote/files');
    cache.seedFromLocalFile(source, '/remote/files/Projects/Legal/T1.pdf', '2026-09-30T00:00:00Z');

    const originalCachePath = cache.cachePathForRemote('/remote/files/Projects/Legal/T1.pdf');
    assert.equal(fs.existsSync(originalCachePath), true);
    assert.equal(cache.readIndex()['/remote/files/Projects/Legal/T1.pdf'].remoteTime, '2026-09-30T00:00:00Z');

    cache.remapFolder('/remote/files/Projects/Legal', '/remote/files/Projects/Legal Ops');
    const movedCachePath = cache.cachePathForRemote('/remote/files/Projects/Legal Ops/T1.pdf');
    assert.equal(fs.existsSync(originalCachePath), false);
    assert.equal(fs.existsSync(movedCachePath), true);
    assert.equal(Boolean(cache.readIndex()['/remote/files/Projects/Legal Ops/T1.pdf']), true);

    cache.removeFolder('/remote/files/Projects/Legal Ops');
    assert.equal(fs.existsSync(movedCachePath), false);
    assert.deepEqual(cache.readIndex(), {});
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
