import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildExternalFileNote,
  markExternalFileTextMissing,
  updateExternalFileTextForFolderRename,
} from '../src/domain/externalFileNote';
import { normalizeDocumentType, deriveDocumentType } from '../src/domain/documentType';
import { normalizeUploadFilename } from '../src/domain/filename';
import { parseFrontmatter } from '../src/domain/frontmatter';
import {
  deriveContextName,
  deriveContextType,
  safeRelativeRemotePath,
} from '../src/domain/paths';

const root = '/remote/files';
const documentTypes = ['Source Material', 'Outputs', 'Reference', 'Other'];
const contextTypes = ['Projects', 'Areas', 'Organizations', 'People', 'General'];

test('normalizeUploadFilename defaults to the selected local filename', () => {
  assert.equal(normalizeUploadFilename('', '/tmp/Mutual_NDA_Quebec.pdf'), 'Mutual_NDA_Quebec.pdf');
});

test('normalizeUploadFilename appends the source extension when omitted', () => {
  assert.equal(normalizeUploadFilename('T2', '/tmp/Mutual_NDA_Quebec.pdf'), 'T2.pdf');
});

test('normalizeUploadFilename rejects unsafe path characters', () => {
  assert.throws(() => normalizeUploadFilename('Legal/T2.pdf', '/tmp/source.pdf'), /cannot contain/);
});

test('document type normalization handles case and separators', () => {
  assert.equal(normalizeDocumentType('source-material', documentTypes), 'Source Material');
  assert.equal(normalizeDocumentType('OUTPUTS', documentTypes), 'Outputs');
  assert.equal(normalizeDocumentType('unknown', documentTypes), 'Other');
});

test('deriveDocumentType finds recognized type segments in remote paths', () => {
  assert.equal(deriveDocumentType(`${root}/Projects/Legal/Reference`, root, documentTypes), 'Reference');
  assert.equal(deriveDocumentType(`${root}/Projects/Legal`, root, documentTypes), 'Other');
});

test('context derives from the first two folder segments', () => {
  const folder = `${root}/Projects/Legal/Reference`;
  assert.equal(deriveContextType(folder, root, contextTypes), 'Projects');
  assert.equal(deriveContextName(folder, root), 'Legal');
});

test('safeRelativeRemotePath maps remote paths into cache paths', () => {
  assert.equal(safeRelativeRemotePath(`${root}/Projects/Legal/T1.pdf`, root), 'Projects/Legal/T1.pdf');
});

test('folder rename updates external-file paths and context metadata', () => {
  const input = `---
title: T1
type: external-file
status: active
storage_folder: "${root}/Projects/Legal"
remote_path: "${root}/Projects/Legal/T1.pdf"
context_type: Projects
context_name: "Legal"
updated: 2026-09-29
---

# T1
`;

  const updated = updateExternalFileTextForFolderRename(
    input,
    `${root}/Projects/Legal`,
    `${root}/Projects/Legal Ops`,
    '2026-09-30',
    root,
    contextTypes,
  );
  const fm = parseFrontmatter(updated);
  assert.equal(fm.storage_folder, `${root}/Projects/Legal Ops`);
  assert.equal(fm.remote_path, `${root}/Projects/Legal Ops/T1.pdf`);
  assert.equal(fm.context_type, 'Projects');
  assert.equal(fm.context_name, 'Legal Ops');
  assert.equal(fm.updated, '2026-09-30');
});

test('deletion marks affected external-file notes missing', () => {
  const input = `---
title: T1
type: external-file
status: active
storage_folder: "${root}/Projects/Legal"
remote_path: "${root}/Projects/Legal/T1.pdf"
updated: 2026-09-29
---

# T1
`;

  const updated = markExternalFileTextMissing(input, `${root}/Projects/Legal`, '2026-09-30');
  const fm = parseFrontmatter(updated);
  assert.equal(fm.status, 'missing');
  assert.equal(fm.updated, '2026-09-30');
  assert.equal(fm.missing_reason, 'External file not found');
});

test('buildExternalFileNote writes generic storage and new command id', () => {
  const note = buildExternalFileNote({
    title: 'T1',
    documentType: 'Reference',
    remoteFolder: `${root}/Projects/Legal`,
    provider: 'proton-drive-cli',
    remotePath: `${root}/Projects/Legal/T1.pdf`,
    shareLink: 'none',
    originalFilename: 'Mutual_NDA_Quebec.pdf',
    uploadFilename: 'T1.pdf',
    size: 57853,
    contextType: 'Projects',
    contextName: 'Legal',
    date: '2026-09-30',
  }, documentTypes);
  const fm = parseFrontmatter(note);
  assert.equal(fm.storage, 'external');
  assert.equal(fm.storage_provider, 'proton-drive-cli');
  assert.equal(fm.remote_path, `${root}/Projects/Legal/T1.pdf`);
  assert.equal(fm.document_type, 'reference');
  assert.equal(fm.original_filename, 'Mutual_NDA_Quebec.pdf');
  assert.equal(fm.upload_filename, 'T1.pdf');
  assert.match(note, /command: file-externalizer:open-external-file/);
});

test('folder rename still updates legacy proton_path notes for migration compatibility', () => {
  const input = `---
title: Legacy
type: external-file
storage_folder: "${root}/Projects/Legal"
proton_path: "${root}/Projects/Legal/Legacy.pdf"
context_type: Projects
context_name: "Legal"
updated: 2026-09-29
---

# Legacy
`;

  const updated = updateExternalFileTextForFolderRename(
    input,
    `${root}/Projects/Legal`,
    `${root}/Projects/Legal Ops`,
    '2026-09-30',
    root,
    contextTypes,
  );
  const fm = parseFrontmatter(updated);
  assert.equal(fm.proton_path, `${root}/Projects/Legal Ops/Legacy.pdf`);
  assert.equal(fm.context_name, 'Legal Ops');
});
