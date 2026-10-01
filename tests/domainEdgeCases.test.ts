import assert from 'node:assert/strict';
import test from 'node:test';
import { deriveDocumentType, normalizeDocumentType } from '../src/domain/documentType';
import {
  buildExternalFileNote,
  externalFileNoteFolder,
  markExternalFileTextMissing,
  updateExternalFileTextForFolderRename,
} from '../src/domain/externalFileNote';
import { defaultTitleForFile, normalizeUploadFilename, slugTitle } from '../src/domain/filename';
import { parseFrontmatter, setFrontmatterFields, yamlScalar, yamlString } from '../src/domain/frontmatter';
import {
  deriveContextName,
  deriveContextType,
  descendantOrSame,
  isRemoteRoot,
  joinRemotePath,
  normalizeRemoteFolder,
  parentRemotePath,
  pathName,
  relativeRemotePath,
  replacePathPrefix,
  safeRelativeRemotePath,
} from '../src/domain/paths';
import { DEFAULT_SETTINGS, normalizeSettings } from '../src/settings';

const root = '/remote/files';
const contextTypes = ['Projects', 'Areas', 'General'];

// filename

test('slugTitle replaces path-unsafe characters and collapses whitespace', () => {
  assert.equal(slugTitle('  Q3: plan / budget?  '), 'Q3- plan - budget-');
  assert.equal(slugTitle('a\n\tb'), 'a b');
  assert.equal(slugTitle(''), '');
});

test('defaultTitleForFile prefixes the date and falls back for empty paths', () => {
  const now = new Date('2026-09-30T23:00:00Z');
  assert.equal(defaultTitleForFile('/tmp/Scan: 01.pdf', now), '2026-09-30 Scan- 01');
  assert.equal(defaultTitleForFile('', now), '2026-09-30 External File');
});

test('normalizeUploadFilename keeps an explicit extension and requires some name', () => {
  assert.equal(normalizeUploadFilename('Report.docx', '/tmp/source.pdf'), 'Report.docx');
  assert.equal(normalizeUploadFilename('  Report  ', '/tmp/source'), 'Report');
  assert.throws(() => normalizeUploadFilename('', ''), /required/);
  for (const bad of ['a:b', 'a*b', 'a?b', 'a"b', 'a<b', 'a|b', 'a\\b']) {
    assert.throws(() => normalizeUploadFilename(bad, '/tmp/x.pdf'), /cannot contain/, bad);
  }
});

// frontmatter

test('parseFrontmatter handles missing frontmatter, colons in values, and CRLF files', () => {
  assert.deepEqual(parseFrontmatter('# No frontmatter'), {});
  assert.equal(parseFrontmatter('---\nshare_link: "https://x.test/a?b=c"\n---\n').share_link, 'https://x.test/a?b=c');
  const crlf = parseFrontmatter('---\r\ntitle: Windows\r\nstatus: active\r\n---\r\nBody');
  assert.equal(crlf.title, 'Windows');
  assert.equal(crlf.status, 'active');
});

test('setFrontmatterFields replaces, appends, quotes, and keeps the body', () => {
  const input = '---\ntitle: T\nstatus: active\n---\n\nBody with status: active\n';
  const out = setFrontmatterFields(input, {
    status: { value: 'missing' },
    reason: { value: 'gone: really', quote: true },
    share_link: { value: 'none', quote: true },
    raw_list: { value: '[a, b]', raw: true },
  });
  assert.equal(out, '---\ntitle: T\nstatus: missing\nreason: "gone: really"\nshare_link: none\nraw_list: [a, b]\n---\n\nBody with status: active\n');
});

test('setFrontmatterFields leaves notes without frontmatter untouched and preserves CRLF', () => {
  assert.equal(setFrontmatterFields('plain', { status: { value: 'x' } }), 'plain');
  const out = setFrontmatterFields('---\r\nstatus: active\r\n---\r\nBody', { status: { value: 'missing' } });
  assert.equal(out, '---\r\nstatus: missing\r\n---\r\nBody');
});

test('yaml helpers escape strings and slugify scalars', () => {
  assert.equal(yamlString('He said "hi"'), '"He said \\"hi\\""');
  assert.equal(yamlString(42), '"42"');
  assert.equal(yamlScalar('Source Docs'), 'source-docs');
  assert.equal(yamlScalar('A/B: C'), 'a-b--c');
});

// paths

test('normalizeRemoteFolder clamps paths outside the root back to the root', () => {
  assert.equal(normalizeRemoteFolder('/elsewhere/x', root), root);
  assert.equal(normalizeRemoteFolder('/remote/files-other/x', root), root);
  assert.equal(normalizeRemoteFolder('', root), root);
  assert.equal(normalizeRemoteFolder(`${root}/A/`, `${root}/`), `${root}/A`);
});

test('joinRemotePath and parentRemotePath stay inside the root', () => {
  assert.equal(joinRemotePath(`${root}/`, '/A/'), `${root}/A`);
  assert.equal(joinRemotePath(root, '  '), root);
  assert.equal(parentRemotePath(`${root}/A/B`, root), `${root}/A`);
  assert.equal(parentRemotePath(`${root}/A`, root), root);
  assert.equal(parentRemotePath(root, root), root);
  assert.equal(parentRemotePath('/other/A', root), root);
});

test('pathName and isRemoteRoot label folders for the picker', () => {
  assert.equal(pathName(root, root), 'External Files');
  assert.equal(pathName(`${root}/Projects/Legal`, root), 'Legal');
  assert.equal(isRemoteRoot(`${root}/`, root), true);
  assert.equal(isRemoteRoot(`${root}/A`, root), false);
});

test('descendantOrSame does not treat a sibling with a shared prefix as a child', () => {
  assert.equal(descendantOrSame(`${root}/Legal`, `${root}/Legal`), true);
  assert.equal(descendantOrSame(`${root}/Legal/a.pdf`, `${root}/Legal`), true);
  assert.equal(descendantOrSame(`${root}/Legal Ops/a.pdf`, `${root}/Legal`), false);
  assert.equal(descendantOrSame('', `${root}/Legal`), false);
});

test('replacePathPrefix rewrites whole paths only', () => {
  const text = [
    `remote_path: "${root}/Legal/a.pdf"`,
    `storage_folder: "${root}/Legal"`,
    `sibling: "${root}/Legal Ops/b.pdf"`,
    `inline \`${root}/Legal\``,
    `link [x](${root}/Legal)`,
    `end ${root}/Legal`,
  ].join('\n');
  const out = replacePathPrefix(text, `${root}/Legal`, `${root}/Contracts`);
  assert.equal(out, [
    `remote_path: "${root}/Contracts/a.pdf"`,
    `storage_folder: "${root}/Contracts"`,
    `sibling: "${root}/Legal Ops/b.pdf"`,
    `inline \`${root}/Contracts\``,
    `link [x](${root}/Contracts)`,
    `end ${root}/Contracts`,
  ].join('\n'));
  assert.equal(replacePathPrefix('a (b) [c]', '(b)', 'X'), 'a (b) [c]', 'regex characters in paths are literal');
  assert.equal(replacePathPrefix('x', '', 'y'), 'x');
});

test('relative and cache-safe remote paths strip the root and unsafe characters', () => {
  assert.equal(relativeRemotePath(`${root}/A/b.pdf`, root), 'A/b.pdf');
  assert.equal(relativeRemotePath('/elsewhere/b.pdf', root), '');
  assert.equal(safeRelativeRemotePath(`${root}/A:B/c?.pdf`, root), 'A-B/c-.pdf');
  assert.equal(safeRelativeRemotePath('/r.x/A/c.pdf', '/r.x'), 'A/c.pdf');
  assert.equal(safeRelativeRemotePath('/rAx/A/c.pdf', '/r.x'), 'rAx/A/c.pdf', 'root is matched literally, not as a regex');
});

test('context type and name come from the first two folders under the root', () => {
  assert.equal(deriveContextType(`${root}/Projects/Legal/Ref`, root, contextTypes), 'Projects');
  assert.equal(deriveContextType(`${root}/Clients/Acme`, root, contextTypes), 'General');
  assert.equal(deriveContextType(root, root, contextTypes), 'General');
  assert.equal(deriveContextName(`${root}/Projects/Legal/Ref`, root), 'Legal');
  assert.equal(deriveContextName(`${root}/Projects`, root), 'Projects');
  assert.equal(deriveContextName(`${root}/General`, root), 'General');
  assert.equal(deriveContextName(root, root), 'General');
});

// document types

test('document type fallback prefers Other, then the first configured type', () => {
  assert.equal(normalizeDocumentType('nope', ['A', 'other']), 'other');
  assert.equal(normalizeDocumentType('nope', ['A', 'B']), 'A');
  assert.equal(normalizeDocumentType('nope', []), 'Other');
  assert.equal(normalizeDocumentType('  source_docs ', ['Source Docs', 'Other']), 'Source Docs');
});

test('deriveDocumentType uses the deepest matching folder and ignores paths outside the root', () => {
  const types = ['Reference', 'Outputs', 'Other'];
  assert.equal(deriveDocumentType(`${root}/Reference/Projects/Outputs`, root, types), 'Outputs');
  assert.equal(deriveDocumentType('/elsewhere/Reference', root, types), 'Other');
});

// notes

test('externalFileNoteFolder files notes under the normalized document type', () => {
  assert.equal(externalFileNoteFolder('External Files', 'reference', ['Reference', 'Other']), 'External Files/Reference');
  assert.equal(externalFileNoteFolder('External Files', 'unknown', ['Reference', 'Other']), 'External Files/Other');
});

test('buildExternalFileNote quotes user-provided values so YAML stays valid', () => {
  const note = buildExternalFileNote({
    title: 'Q3: "Final"',
    documentType: 'Reference',
    remoteFolder: `${root}/Projects/A "B"`,
    provider: 'proton-drive-cli',
    remotePath: `${root}/Projects/A "B"/x.pdf`,
    shareLink: 'pending',
    originalFilename: 'x: y.pdf',
    uploadFilename: 'x.pdf',
    size: 1,
    contextType: 'Projects',
    contextName: 'A "B"',
    date: '2026-09-30',
  }, ['Reference', 'Other']);
  assert.match(note, /^title: Q3- -Final-$/m);
  assert.match(note, /^remote_path: "\/remote\/files\/Projects\/A \\"B\\"\/x\.pdf"$/m);
  assert.match(note, /^share_link: "pending"$/m);
  assert.match(note, /^original_filename: "x: y\.pdf"$/m);
  assert.match(note, /^# Q3- -Final-$/m);
});

test('folder rename ignores notes outside the renamed folder', () => {
  const input = `---\ntype: external-file\nstorage_folder: "${root}/Projects/Legal Ops"\nremote_path: "${root}/Projects/Legal Ops/a.pdf"\n---\n`;
  assert.equal(
    updateExternalFileTextForFolderRename(input, `${root}/Projects/Legal`, `${root}/Projects/X`, '2026-09-30', root, contextTypes),
    input,
  );
});

test('folder rename into a new context updates context_type too', () => {
  const input = `---\ntype: external-file\nstorage_folder: "${root}/Projects/Legal"\nremote_path: "${root}/Projects/Legal/a.pdf"\ncontext_type: Projects\ncontext_name: "Legal"\nupdated: 2026-01-01\n---\n`;
  const fm = parseFrontmatter(updateExternalFileTextForFolderRename(
    input, `${root}/Projects`, `${root}/Areas`, '2026-09-30', root, contextTypes,
  ));
  assert.equal(fm.context_type, 'Areas');
  assert.equal(fm.context_name, 'Legal');
  assert.equal(fm.remote_path, `${root}/Areas/Legal/a.pdf`);
});

test('markExternalFileTextMissing matches a single file path and ignores unrelated notes', () => {
  const input = `---\nstatus: active\nremote_path: "${root}/a.pdf"\n---\n`;
  const fm = parseFrontmatter(markExternalFileTextMissing(input, `${root}/a.pdf`, '2026-09-30', 'Gone'));
  assert.equal(fm.status, 'missing');
  assert.equal(fm.missing_reason, 'Gone');
  assert.equal(markExternalFileTextMissing(input, `${root}/b.pdf`, '2026-09-30'), input);
});

// settings

test('normalizeSettings tolerates empty or malformed saved data', () => {
  assert.deepEqual(normalizeSettings(null), DEFAULT_SETTINGS);
  assert.deepEqual(normalizeSettings(undefined), DEFAULT_SETTINGS);
  const settings = normalizeSettings({
    documentTypes: 'not a list' as unknown as string[],
    contextTypes: ['  ', ''],
    protonCliPath: '  /opt/proton-drive  ',
  });
  assert.deepEqual(settings.documentTypes, DEFAULT_SETTINGS.documentTypes);
  assert.deepEqual(settings.contextTypes, DEFAULT_SETTINGS.contextTypes);
  assert.equal(settings.protonCliPath, '/opt/proton-drive');
});

test('normalizeSettings does not add a second Other when one exists in another case', () => {
  assert.deepEqual(normalizeSettings({ documentTypes: ['Reference', 'other'] }).documentTypes, ['Reference', 'other']);
});
