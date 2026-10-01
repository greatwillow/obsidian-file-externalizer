import path from 'node:path';

export function slugTitle(value: string): string {
  return String(value || '').replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, ' ').trim();
}

export function normalizeUploadFilename(input: string, sourceFile: string): string {
  const sourceExt = path.extname(sourceFile || '');
  let filename = String(input || '').trim();
  if (!filename && sourceFile) filename = path.basename(sourceFile);
  if (!filename) throw new Error('Upload filename is required.');
  if (/[\\/:*?"<>|]/.test(filename)) {
    throw new Error('Upload filename cannot contain / \\ : * ? " < > |');
  }
  if (!path.extname(filename) && sourceExt) filename += sourceExt;
  return filename;
}

export function defaultTitleForFile(filePath: string, now = new Date()): string {
  const date = now.toISOString().slice(0, 10);
  const parsed = path.parse(filePath || '');
  return slugTitle(`${date} ${parsed.name || 'External File'}`);
}
