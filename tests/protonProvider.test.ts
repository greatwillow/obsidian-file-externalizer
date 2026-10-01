import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  findProtonDriveCli,
  isAuthError,
  isMissingRemotePathError,
  ProtonDriveCliProvider,
  protonDriveCliCandidates,
} from '../src/providers/protonDriveCliProvider';

interface FakeResponse {
  code?: number;
  download?: string;
  stderr?: string;
  stdout?: string;
}

/**
 * Writes a stand-in `proton-drive` executable. It logs each invocation and answers
 * from a table keyed by the first two arguments (for example "filesystem list").
 */
function fakeCli(responses: Record<string, FakeResponse>) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'file-externalizer-cli-'));
  const cli = path.join(dir, 'proton-drive');
  const log = path.join(dir, 'calls.jsonl');
  fs.writeFileSync(path.join(dir, 'responses.json'), JSON.stringify(responses));
  fs.writeFileSync(cli, `#!${process.execPath}
const fs = require('fs');
const path = require('path');
const args = process.argv.slice(2);
const responses = JSON.parse(fs.readFileSync(${JSON.stringify(path.join(dir, 'responses.json'))}, 'utf8'));
const upload = args[1] === 'upload' ? args[args.length - 3] : null;
fs.appendFileSync(${JSON.stringify(log)}, JSON.stringify({ args, uploadExists: upload ? fs.existsSync(upload) : null }) + '\\n');
const r = responses[args.slice(0, 2).join(' ')] || {};
if (r.download !== undefined) fs.writeFileSync(path.join(args[args.length - 1], path.basename(args[args.length - 2])), r.download);
if (r.stdout) process.stdout.write(r.stdout);
if (r.stderr) process.stderr.write(r.stderr);
process.exit(r.code || 0);
`);
  fs.chmodSync(cli, 0o755);
  return {
    cli,
    provider: new ProtonDriveCliProvider({ cliPath: cli }),
    // The provider probes the CLI with --help before first use; tests only care about real commands.
    calls: () => (fs.existsSync(log)
      ? fs.readFileSync(log, 'utf8').trim().split('\n').map((line) => JSON.parse(line) as { args: string[]; uploadExists: boolean | null })
      : []).filter((call) => call.args[0] !== '--help'),
    cleanup: () => fs.rmSync(dir, { recursive: true, force: true }),
  };
}

test('CLI candidates try the settings path, then the env var, then PATH and common install folders', () => {
  assert.deepEqual(
    protonDriveCliCandidates('  /custom/proton-drive ', { PROTON_DRIVE_CLI: '/env/proton-drive' }, '/home/me'),
    [
      '/custom/proton-drive',
      '/env/proton-drive',
      'proton-drive',
      '/home/me/.local/bin/proton-drive',
      '/opt/homebrew/bin/proton-drive',
      '/usr/local/bin/proton-drive',
    ],
  );
  assert.equal(protonDriveCliCandidates('', {}, '/home/me')[0], 'proton-drive');
});

test('findProtonDriveCli returns the first candidate that runs, or explains how to fix it', () => {
  assert.equal(findProtonDriveCli('/custom/cli', (candidate) => candidate === '/custom/cli'), '/custom/cli');
  assert.equal(findProtonDriveCli('', (candidate) => candidate === '/usr/local/bin/proton-drive'), '/usr/local/bin/proton-drive');
  assert.throws(() => findProtonDriveCli('', () => false), /CLI path in File Externalizer settings/);
});

test('constructing the provider does not require the CLI to be installed', async () => {
  const provider = new ProtonDriveCliProvider({ probe: () => false });
  await assert.rejects(provider.listFolders('/my-files'), /Could not find proton-drive CLI/);
});

test('checkSetup explains a missing CLI without trying to reach Proton', async () => {
  const status = await new ProtonDriveCliProvider({ probe: () => false }).checkSetup('/my-files/Root');
  assert.equal(status.ready, false);
  assert.equal(status.checks.length, 1);
  assert.equal(status.checks[0].label, 'Proton Drive CLI');
  assert.match(status.checks[0].detail, /proton\.me\/support\/drive-cli/);
});

test('checkSetup is ready when the CLI can list the remote root', async () => {
  const fake = fakeCli({ 'filesystem list': { stdout: '[]' } });
  try {
    const status = await fake.provider.checkSetup('/my-files/Root/');
    assert.equal(status.ready, true);
    assert.deepEqual(status.checks.map((check) => [check.label, check.ok]), [
      ['Proton Drive CLI', true], ['Signed in', true], ['Remote root', true],
    ]);
    assert.deepEqual(fake.calls()[0].args, ['filesystem', 'list', '/my-files/Root', '--json']);
  } finally {
    fake.cleanup();
  }
});

test('checkSetup without a remote root still checks sign-in and asks for a root', async () => {
  const fake = fakeCli({ 'filesystem list': { stdout: '[]' } });
  try {
    const status = await fake.provider.checkSetup('');
    assert.equal(status.ready, false);
    assert.deepEqual(fake.calls()[0].args, ['filesystem', 'list', '/my-files', '--json']);
    assert.match(status.checks[2].detail, /Not configured/);
  } finally {
    fake.cleanup();
  }
});

test('checkSetup tells a signed-out user to log in', async () => {
  const fake = fakeCli({ 'filesystem list': { code: 1, stderr: 'Error: You are not logged in. Run `proton-drive auth login`.' } });
  try {
    const status = await fake.provider.checkSetup('/my-files/Root');
    assert.equal(status.ready, false);
    assert.equal(status.checks[1].label, 'Signed in');
    assert.equal(status.checks[1].ok, false);
    assert.match(status.checks[1].detail, /Log in to Proton/);
  } finally {
    fake.cleanup();
  }
});

test('checkSetup separates a missing remote root from a sign-in problem', async () => {
  const fake = fakeCli({ 'filesystem list': { code: 1, stderr: 'Error: path does not exist' } });
  try {
    const status = await fake.provider.checkSetup('/my-files/Nope');
    assert.deepEqual(status.checks.map((check) => [check.label, check.ok]), [
      ['Proton Drive CLI', true], ['Signed in', true], ['Remote root', false],
    ]);
  } finally {
    fake.cleanup();
  }
});

test('checkSetup surfaces the first line of an unexpected CLI error', async () => {
  const fake = fakeCli({ 'filesystem list': { code: 2, stderr: 'Network unreachable\nstack...' } });
  try {
    const status = await fake.provider.checkSetup('/my-files/Root');
    assert.equal(status.checks[1].detail, 'Network unreachable');
  } finally {
    fake.cleanup();
  }
});

test('listFolders keeps only folders, reads both name shapes, and sorts', async () => {
  const items = [
    { type: 'folder', name: 'Zeta' },
    { type: 'file', name: 'file.pdf' },
    { type: 'folder', name: { ok: true, value: 'Alpha' } },
    { type: 'folder', name: { ok: false } },
  ];
  const fake = fakeCli({ 'filesystem list': { stdout: JSON.stringify(items) } });
  try {
    assert.deepEqual(await fake.provider.listFolders('/my-files/Root'), ['Alpha', 'Zeta']);
  } finally {
    fake.cleanup();
  }
});

test('stat falls back through the size and time fields Proton reports', async () => {
  const fake = fakeCli({
    'filesystem info': { stdout: JSON.stringify({ activeRevision: { claimedSize: 42, creationTime: '2026-09-01T00:00:00Z' } }) },
  });
  try {
    assert.deepEqual(await fake.provider.stat('/my-files/a.pdf'), {
      path: '/my-files/a.pdf', size: 42, modifiedTime: '2026-09-01T00:00:00Z',
    });
  } finally {
    fake.cleanup();
  }
});

test('uploadFile uploads a renamed temp copy and removes it afterwards', async () => {
  const fake = fakeCli({ 'filesystem upload': { stdout: '{}' }, 'filesystem info': { stdout: '{"totalStorageSize": 3}' } });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'file-externalizer-src-'));
  try {
    const local = path.join(tmp, 'original name.pdf');
    fs.writeFileSync(local, 'abc');
    const stored = await fake.provider.uploadFile({ localPath: local, remoteFolder: '/my-files/Root', remoteName: 'Renamed.pdf' });
    assert.equal(stored.path, '/my-files/Root/Renamed.pdf');
    assert.equal(stored.size, 3);

    const upload = fake.calls().find((call) => call.args[1] === 'upload');
    assert.ok(upload);
    const uploadedPath = upload.args[upload.args.length - 3];
    assert.equal(path.basename(uploadedPath), 'Renamed.pdf');
    assert.equal(upload.uploadExists, true);
    assert.equal(fs.existsSync(uploadedPath), false, 'temp copy is cleaned up');
    assert.equal(fs.existsSync(local), true, 'original file is untouched');
  } finally {
    fake.cleanup();
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('uploadFile sends the original file when the name already matches', async () => {
  const fake = fakeCli({ 'filesystem upload': { stdout: '{}' }, 'filesystem info': { stdout: '{}' } });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'file-externalizer-src-'));
  try {
    const local = path.join(tmp, 'Same.pdf');
    fs.writeFileSync(local, 'abc');
    await fake.provider.uploadFile({ localPath: local, remoteFolder: '/my-files/Root', remoteName: 'Same.pdf' });
    const upload = fake.calls().find((call) => call.args[1] === 'upload');
    assert.equal(upload?.args[upload.args.length - 3], local);
  } finally {
    fake.cleanup();
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('downloadFile returns the downloaded file, and fails if the CLI produced nothing', async () => {
  const ok = fakeCli({ 'filesystem download': { download: 'hello' } });
  const empty = fakeCli({ 'filesystem download': {} });
  const dest = fs.mkdtempSync(path.join(os.tmpdir(), 'file-externalizer-dl-'));
  try {
    const stored = await ok.provider.downloadFile('/my-files/Root/a.pdf', dest);
    assert.equal(stored.path, path.join(dest, 'a.pdf'));
    assert.equal(stored.size, 5);
    await assert.rejects(empty.provider.downloadFile('/my-files/Root/b.pdf', dest), /expected file was not found/);
  } finally {
    ok.cleanup();
    empty.cleanup();
    fs.rmSync(dest, { recursive: true, force: true });
  }
});

test('CLI failures name the command and keep stderr for error classification', async () => {
  const fake = fakeCli({ 'filesystem info': { code: 1, stderr: 'File not found' } });
  try {
    await assert.rejects(fake.provider.stat('/my-files/missing.pdf'), (error: Error & { stderr?: string }) => {
      assert.match(error.message, /filesystem info \/my-files\/missing\.pdf --json failed/);
      assert.equal(error.stderr, 'File not found');
      assert.equal(isMissingRemotePathError(error), true);
      return true;
    });
  } finally {
    fake.cleanup();
  }
});

test('rename, trash and create-folder pass the expected CLI arguments', async () => {
  const fake = fakeCli({});
  try {
    await fake.provider.renameFolder('/my-files/Root/A', 'B');
    await fake.provider.trashFolder('/my-files/Root/B');
    await fake.provider.createFolder('/my-files/Root', 'C');
    assert.deepEqual(fake.calls().map((call) => call.args), [
      ['filesystem', 'rename', '/my-files/Root/A', 'B'],
      ['filesystem', 'trash', '/my-files/Root/B'],
      ['filesystem', 'create-folder', '/my-files/Root', 'C', '--json'],
    ]);
  } finally {
    fake.cleanup();
  }
});

test('login reports the sign-in link as soon as the CLI prints it', async () => {
  const fake = fakeCli({ 'auth login': { stdout: 'Open https://account.proton.me/login?x=1 to continue\nLogged in.\n' } });
  try {
    const urls: string[] = [];
    const result = await fake.provider.login((url) => urls.push(url));
    assert.equal(result.url, 'https://account.proton.me/login?x=1');
    assert.deepEqual(urls, ['https://account.proton.me/login?x=1']);
    assert.deepEqual(fake.calls()[0].args, ['auth', 'login']);
  } finally {
    fake.cleanup();
  }
});

test('login rejects with the CLI output when sign-in fails', async () => {
  const fake = fakeCli({ 'auth login': { code: 3, stderr: 'Login cancelled' } });
  try {
    await assert.rejects(fake.provider.login(), /exit 3[\s\S]*Login cancelled/);
  } finally {
    fake.cleanup();
  }
});

test('isAuthError reads the CLI output, not paths echoed in the command', () => {
  assert.equal(isAuthError({ stderr: 'Unauthorized (401)' }), true);
  assert.equal(isAuthError({ stderr: 'Session expired, please sign in again' }), true);
  assert.equal(isAuthError(new Error('authentication required')), true);
  assert.equal(isAuthError({ message: 'proton-drive filesystem list /my-files/Login Pages failed', stderr: 'not found' }), false);
  assert.equal(isAuthError({ stderr: 'Network unreachable' }), false);
});
