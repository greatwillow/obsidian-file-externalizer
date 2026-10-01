import { DEFAULT_CONTEXT_TYPES, DEFAULT_DOCUMENT_TYPES } from './constants';

export interface FileExternalizerSettings {
  cacheFolder: string;
  contextTypes: string[];
  documentTypes: string[];
  externalNotesFolder: string;
  provider: 'proton-drive-cli';
  remoteRoot: string;
}

export const DEFAULT_SETTINGS: FileExternalizerSettings = {
  cacheFolder: 'File Externalizer Cache',
  contextTypes: [...DEFAULT_CONTEXT_TYPES],
  documentTypes: [...DEFAULT_DOCUMENT_TYPES],
  externalNotesFolder: 'External Files',
  provider: 'proton-drive-cli',
  remoteRoot: '',
};

export function normalizeSettings(input: Partial<FileExternalizerSettings> | null | undefined): FileExternalizerSettings {
  return {
    cacheFolder: nonEmpty(input?.cacheFolder, DEFAULT_SETTINGS.cacheFolder),
    contextTypes: nonEmptyList(input?.contextTypes, DEFAULT_SETTINGS.contextTypes),
    documentTypes: ensureOther(nonEmptyList(input?.documentTypes, DEFAULT_SETTINGS.documentTypes)),
    externalNotesFolder: nonEmpty(input?.externalNotesFolder, DEFAULT_SETTINGS.externalNotesFolder),
    provider: input?.provider || DEFAULT_SETTINGS.provider,
    remoteRoot: String(input?.remoteRoot || DEFAULT_SETTINGS.remoteRoot).trim().replace(/\/+$/g, ''),
  };
}

function nonEmpty(value: string | undefined, fallback: string): string {
  const trimmed = String(value || '').trim();
  return trimmed || fallback;
}

function nonEmptyList(value: string[] | undefined, fallback: string[]): string[] {
  const next = Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : [];
  return next.length ? Array.from(new Set(next)) : [...fallback];
}

function ensureOther(values: string[]): string[] {
  return values.some((value) => value.toLowerCase() === 'other') ? values : [...values, 'Other'];
}
