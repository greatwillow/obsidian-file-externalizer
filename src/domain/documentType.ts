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

function normalizedLabel(value: string): string {
  return String(value || '').trim().toLowerCase().replace(/[-_]+/g, ' ').replace(/\s+/g, ' ');
}

function fallbackDocumentType(documentTypes: string[]): string {
  return documentTypes.find((type) => normalizedLabel(type) === 'other') || documentTypes[0] || 'Other';
}
