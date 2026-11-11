import { DocumentType } from '../constants';
import { normalizeRemoteFolder } from './paths';

export function normalizeDocumentType(value: string, documentTypes: string[]): DocumentType {
  const normalized = normalizedLabel(value);
  return documentTypes.find((type) => normalizedLabel(type) === normalized) || fallbackDocumentType(documentTypes);
}

export function deriveDocumentType(remoteFolder: string, remoteRoot: string, documentTypes: string[]): DocumentType {
  const parts = normalizeRemoteFolder(remoteFolder, remoteRoot)
    .slice(remoteRoot.length)
    .split('/')
    .filter(Boolean);

  for (let i = parts.length - 1; i >= 0; i -= 1) {
    const match = documentTypes.find((type) => normalizedLabel(type) === normalizedLabel(parts[i]));
    if (match) return match;
  }

  return fallbackDocumentType(documentTypes);
}

const EXTENSION_GROUPS: Array<{ labels: string[]; extensions: string[] }> = [
  {
    labels: ['documents', 'document'],
    extensions: ['pdf', 'doc', 'docx', 'odt', 'rtf', 'txt', 'md', 'pages', 'xls', 'xlsx', 'ods', 'csv', 'numbers', 'ppt', 'pptx', 'odp', 'key'],
  },
  {
    labels: ['images', 'image'],
    extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'heic', 'heif', 'tif', 'tiff', 'bmp', 'svg'],
  },
  {
    labels: ['media'],
    extensions: ['mp3', 'wav', 'm4a', 'aac', 'flac', 'ogg', 'mp4', 'mov', 'm4v', 'avi', 'mkv', 'webm'],
  },
  {
    labels: ['archives', 'archive'],
    extensions: ['zip', 'tar', 'gz', 'tgz', 'bz2', 'xz', '7z', 'rar'],
  },
];

/**
 * Suggests a document type from the file extension, using only the types this vault has configured.
 * Falls back to the catch-all type when the extension is unknown or its group is not configured.
 */
export function guessDocumentType(filePath: string, documentTypes: string[]): DocumentType {
  const extension = String(filePath || '').split(/[\\/]/).pop()?.match(/\.([^.]+)$/)?.[1]?.toLowerCase() || '';
  const group = EXTENSION_GROUPS.find((candidate) => candidate.extensions.includes(extension));
  const match = group && documentTypes.find((type) => group.labels.includes(normalizedLabel(type)));
  return match || fallbackDocumentType(documentTypes);
}

function normalizedLabel(value: string): string {
  return String(value || '').trim().toLowerCase().replace(/[-_]+/g, ' ').replace(/\s+/g, ' ');
}

function fallbackDocumentType(documentTypes: string[]): string {
  return documentTypes.find((type) => normalizedLabel(type) === 'other') || documentTypes[0] || 'Other';
}
