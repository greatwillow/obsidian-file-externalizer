import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { parseFrontmatter } from '../src/domain/frontmatter';
import { FileExternalizerService } from '../src/services/fileExternalizerService';
import { normalizeSettings } from '../src/settings';
import { FakeProvider, FakeVault, fileFor } from './helpers/fakeObsidian';

const root = '/remote/files';

function setup(overrides: Record<string, unknown> = {}) {
  const vault = new FakeVault();
  const provider = new FakeProvider();
  const settings = normalizeSettings({
    remoteRoot: root,
    cacheFolder: 'Cache',
    externalNotesFolder: 'External Files',
    documentTypes: ['Reference', 'Outputs', 'Other'],
    contextTypes: ['Projects', 'Areas', 'General'],
    ...overrides,
  });
  const service = new FileExternalizerService(vault.app(), settings, provider);
  return { vault, provider, service, settings };
}

function writeLocal(vault: FakeVault, name: string, content = 'local file'): string {
  const dir = path.join(vault.basePath, '..', `${path.basename(vault.basePath)}-local`);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, name);
  fs.writeFileSync(file, content);
  return file;
}

function externalNote(remotePath: string, extra = ''): string {
  return `---
title: Note
type: external-file
status: active
storage_folder: "${path.posix.dirname(remotePath)}"
remote_path: "${remotePath}"
updated: 2026-09-01
${extra}---

# Note
`;
}

test('registerFile refuses to run without a configured remote root', async () => {
  const { vault, service } = setup({ remoteRoot: '' });
  try {
    await assert.rejects(service.registerFile({
      destinationFolder: '/x', documentType: 'Other', filePath: '/nope', shareLink: false, title: '', uploadFilename: '',
    }), /remote root is not configured/);
  } finally {
    vault.cleanup();
  }
});

test('registerFile reports a missing local file before uploading anything', async () => {
  const { vault, provider, service } = setup();
  try {
    await assert.rejects(service.registerFile({
      destinationFolder: `${root}/Projects/Legal`,
      documentType: 'Reference',
      filePath: path.join(vault.basePath, 'missing.pdf'),
      shareLink: false,
      title: 'T1',
      uploadFilename: '',
    }), /File not found/);
    assert.deepEqual(provider.calls, []);
  } finally {
    vault.cleanup();
  }
});

test('registerFile uploads, seeds the cache, and writes a note in the document-type folder', async () => {
  const { vault, provider, service } = setup();
  try {
    const local = writeLocal(vault, 'Mutual_NDA.pdf', 'nda-bytes');
    const result = await service.registerFile({
      destinationFolder: `${root}/Projects/Legal/Reference`,
      documentType: 'reference',
      filePath: local,
      shareLink: false,
      title: 'NDA: Quebec',
      uploadFilename: 'NDA',
    });

    assert.equal(result.remotePath, `${root}/Projects/Legal/Reference/NDA.pdf`);
    assert.equal(result.link, '[[NDA- Quebec]]');
    assert.equal(provider.files.get(result.remotePath)?.content, 'nda-bytes');
    assert.ok(vault.folders.has('External Files/Reference'));

    const fm = parseFrontmatter(vault.text('External Files/Reference/NDA- Quebec.md'));
    assert.equal(fm.type, 'external-file');
    assert.equal(fm.remote_path, result.remotePath);
    assert.equal(fm.document_type, 'reference');
    assert.equal(fm.context_type, 'Projects');
    assert.equal(fm.context_name, 'Legal');
    assert.equal(fm.share_link, 'none');
    assert.equal(fm.original_filename, 'Mutual_NDA.pdf');
    assert.equal(fm.file_size_bytes, String('nda-bytes'.length));

    const cached = path.join(vault.basePath, 'Cache/Projects/Legal/Reference/NDA.pdf');
    assert.equal(fs.readFileSync(cached, 'utf8'), 'nda-bytes');
  } finally {
    vault.cleanup();
  }
});

test('registerFile never overwrites an existing note with the same title', async () => {
  const { vault, service } = setup();
  try {
    const local = writeLocal(vault, 'a.pdf');
    const input = {
      destinationFolder: `${root}/Projects/Legal`, documentType: 'Other', filePath: local, shareLink: true, title: 'Same', uploadFilename: '',
    };
    await service.registerFile(input);
    const second = await service.registerFile(input);
    assert.equal(second.link, '[[Same 2]]');
    assert.ok(vault.files.has('External Files/Other/Same.md'));
    assert.ok(vault.files.has('External Files/Other/Same 2.md'));
    assert.equal(parseFrontmatter(vault.text('External Files/Other/Same 2.md')).share_link, 'pending');
  } finally {
    vault.cleanup();
  }
});

test('openExternalFile downloads on a cache miss, then serves the cache', async () => {
  const { vault, provider, service } = setup();
  try {
    const remotePath = `${root}/Projects/Legal/T1.pdf`;
    provider.addRemoteFile(remotePath, 'remote-bytes', '2026-09-30T08:00:00.000Z');
    const note = vault.addNote('External Files/Other/T1.md', externalNote(remotePath));

    const first = await service.openExternalFile(note, false);
    assert.equal(first.cacheHit, false);
    assert.equal(fs.readFileSync(first.opened, 'utf8'), 'remote-bytes');
    const index = JSON.parse(fs.readFileSync(path.join(vault.basePath, 'Cache/.cache-index.json'), 'utf8'));
    assert.equal(index[remotePath].remoteTime, '2026-09-30T08:00:00.000Z');
    assert.equal(fs.readdirSync(path.join(vault.basePath, 'Cache')).some((name) => name.startsWith('.download-')), false);

    const second = await service.openExternalFile(note, false);
    assert.equal(second.cacheHit, true);
    assert.equal(provider.calls.filter((call) => call.startsWith('download')).length, 1);
  } finally {
    vault.cleanup();
  }
});

test('openExternalFile still reads legacy proton_path notes', async () => {
  const { vault, provider, service } = setup();
  try {
    const remotePath = `${root}/Projects/Old/legacy.pdf`;
    provider.addRemoteFile(remotePath, 'legacy');
    const note = vault.addNote('Legacy.md', `---\ntype: external-file\nproton_path: "${remotePath}"\n---\n`);
    const result = await service.openExternalFile(note, false);
    assert.equal(result.remotePath, remotePath);
  } finally {
    vault.cleanup();
  }
});

test('openExternalFile rejects notes without a remote path', async () => {
  const { vault, service } = setup();
  try {
    const note = vault.addNote('Plain.md', '---\ntitle: Plain\n---\n');
    await assert.rejects(service.openExternalFile(note, false), /no remote_path/);
  } finally {
    vault.cleanup();
  }
});

test('openExternalFile leaves no partial cache file when the download fails', async () => {
  const { vault, service } = setup();
  try {
    const remotePath = `${root}/Projects/Legal/gone.pdf`;
    const note = vault.addNote('Gone.md', externalNote(remotePath));
    await assert.rejects(service.openExternalFile(note, false), /not found/);
    assert.equal(fs.existsSync(path.join(vault.basePath, 'Cache/Projects/Legal/gone.pdf')), false);
  } finally {
    vault.cleanup();
  }
});

test('renameFolder updates notes and cache but leaves sibling folders alone', async () => {
  const { vault, provider, service } = setup();
  try {
    const inFolder = `${root}/Projects/Legal/T1.pdf`;
    const sibling = `${root}/Projects/Legal Ops/T2.pdf`;
    provider.addRemoteFile(inFolder, 'one');
    provider.addRemoteFile(sibling, 'two');
    const noteA = vault.addNote('A.md', externalNote(inFolder, 'context_type: Projects\ncontext_name: "Legal"\n'));
    vault.addNote('B.md', externalNote(sibling, 'context_type: Projects\ncontext_name: "Legal Ops"\n'));
    vault.addNote('Project.md', `Files live in \`${root}/Projects/Legal\` and \`${root}/Projects/Legal Ops\`.\n`);
    await service.openExternalFile(noteA, false);

    const changed = await service.renameFolder(`${root}/Projects/Legal`, 'Contracts');
    assert.equal(changed, 2);

    const a = parseFrontmatter(vault.text('A.md'));
    assert.equal(a.remote_path, `${root}/Projects/Contracts/T1.pdf`);
    assert.equal(a.context_name, 'Contracts');
    assert.equal(parseFrontmatter(vault.text('B.md')).remote_path, sibling);
    assert.equal(
      vault.text('Project.md'),
      `Files live in \`${root}/Projects/Contracts\` and \`${root}/Projects/Legal Ops\`.\n`,
    );
    assert.ok(fs.existsSync(path.join(vault.basePath, 'Cache/Projects/Contracts/T1.pdf')));
    assert.equal(fs.existsSync(path.join(vault.basePath, 'Cache/Projects/Legal')), false);
  } finally {
    vault.cleanup();
  }
});

test('trashFolder marks affected notes missing and clears their cache', async () => {
  const { vault, provider, service } = setup();
  try {
    const remotePath = `${root}/Projects/Legal/T1.pdf`;
    provider.addRemoteFile(remotePath, 'one');
    const note = vault.addNote('A.md', externalNote(remotePath));
    vault.addNote('Other.md', externalNote(`${root}/Projects/Other/T9.pdf`));
    await service.openExternalFile(note, false);

    const changed = await service.trashFolder(`${root}/Projects/Legal`);
    assert.equal(changed, 1);
    const fm = parseFrontmatter(vault.text('A.md'));
    assert.equal(fm.status, 'missing');
    assert.equal(fm.missing_reason, 'External storage folder moved to trash');
    assert.equal(parseFrontmatter(vault.text('Other.md')).status, 'active');
    assert.equal(fs.existsSync(path.join(vault.basePath, 'Cache/Projects/Legal/T1.pdf')), false);
  } finally {
    vault.cleanup();
  }
});

test('validateExternalFileNotes only marks clearly missing files, not connection errors', async () => {
  const { vault, provider, service } = setup();
  try {
    provider.addRemoteFile(`${root}/a.pdf`, 'a');
    vault.addNote('Found.md', externalNote(`${root}/a.pdf`));
    vault.addNote('Missing.md', externalNote(`${root}/b.pdf`));
    vault.addNote('Offline.md', externalNote(`${root}/c.pdf`));
    vault.addNote('NotExternal.md', '---\ntype: note\nremote_path: "/remote/files/zzz.pdf"\n---\n');
    provider.statError = (remotePath) => (remotePath.endsWith('c.pdf') ? new Error('Not logged in') : null);
    const originalWarn = console.warn;
    console.warn = () => undefined;
    try {
      const result = await service.validateExternalFileNotes();
      assert.deepEqual(result, { found: 1, missing: 1, changed: 1, errors: 1 });
    } finally {
      console.warn = originalWarn;
    }
    assert.equal(parseFrontmatter(vault.text('Missing.md')).status, 'missing');
    assert.equal(parseFrontmatter(vault.text('Offline.md')).status, 'active');
    assert.equal(provider.calls.some((call) => call.includes('zzz')), false);
  } finally {
    vault.cleanup();
  }
});

test('checkSetup and login degrade cleanly for providers without a setup step', async () => {
  const { vault, service } = setup();
  try {
    const status = await service.checkSetup();
    assert.equal(status.ready, true);
    await assert.rejects(service.login(), /no sign-in step/);
  } finally {
    vault.cleanup();
  }
});

test('checkSetup and login delegate to the provider with the configured remote root', async () => {
  const { vault, provider, service } = setup();
  try {
    const seen: string[] = [];
    provider.checkSetup = async (remoteRoot) => {
      seen.push(remoteRoot);
      return { ready: false, checks: [{ label: 'Signed in', ok: false, detail: 'no' }] };
    };
    provider.login = async (onUrl) => {
      onUrl?.('https://example.test/login');
      return { output: 'ok', url: 'https://example.test/login' };
    };
    assert.equal((await service.checkSetup()).ready, false);
    assert.deepEqual(seen, [root]);
    const urls: string[] = [];
    assert.equal((await service.login((url) => urls.push(url))).url, 'https://example.test/login');
    assert.deepEqual(urls, ['https://example.test/login']);
  } finally {
    vault.cleanup();
  }
});

test('openCreatedNote opens the note in the workspace', async () => {
  const { vault, service } = setup();
  try {
    vault.addNote('External Files/Other/X.md', externalNote(`${root}/x.pdf`));
    await service.openCreatedNote(path.join(vault.basePath, 'External Files/Other/X.md'));
    assert.deepEqual(vault.opened, ['External Files/Other/X.md']);
    assert.equal(fileFor('a/b.md').basename, 'b');
  } finally {
    vault.cleanup();
  }
});
