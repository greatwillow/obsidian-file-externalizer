import path from 'node:path';
import { COMMAND_OPEN_EXTERNAL_FILE, DocumentType } from '../constants';
import { normalizeDocumentType } from './documentType';
import { parseFrontmatter, setFrontmatterFields, yamlScalar, yamlString } from './frontmatter';
import {
  deriveContextName,
  deriveContextType,
  descendantOrSame,
  replacePathPrefix,
} from './paths';
import { slugTitle } from './filename';

export interface ExternalFileNoteInput {
  contextName: string;
  contextType: string;
  date: string;
  documentType: DocumentType;
  originalFilename: string;
  provider: string;
  remotePath: string;
  remoteFolder: string;
  shareLink: string;
  size: number;
  title: string;
  uploadFilename: string;
}

export function externalFileNoteFolder(rootFolder: string, documentType: string, documentTypes: string[]): string {
  return path.posix.join(rootFolder, normalizeDocumentType(documentType, documentTypes));
}

export function buildExternalFileNote(input: ExternalFileNoteInput, documentTypes: string[]): string {
  const title = slugTitle(input.title);
  const documentType = normalizeDocumentType(input.documentType, documentTypes);
  return `---
title: ${title}
type: external-file
status: active
document_type: ${yamlScalar(documentType)}
storage: external
storage_provider: ${input.provider}
storage_folder: ${yamlString(input.remoteFolder)}
remote_path: ${yamlString(input.remotePath)}
share_link: ${input.shareLink === 'none' ? 'none' : yamlString(input.shareLink)}
original_filename: ${yamlString(input.originalFilename)}
upload_filename: ${yamlString(input.uploadFilename)}
file_size_bytes: ${input.size}
context_type: ${input.contextType}
context_name: ${yamlString(input.contextName)}
created: ${input.date}
updated: ${input.date}
---

# ${title}

Stored outside the vault.

Storage folder: \`${input.remoteFolder}\`

## Open

\`\`\`meta-bind-button
label: Open External File
style: primary
action:
  type: command
  command: ${COMMAND_OPEN_EXTERNAL_FILE}
\`\`\`

## Summary

-
`;
}

export function updateExternalFileTextForFolderRename(
  text: string,
  oldPath: string,
  newPath: string,
  today: string,
  remoteRoot: string,
  contextTypes: string[],
): string {
  const fm = parseFrontmatter(text);
  const oldStorage = fm.storage_folder || '';
  const oldRemote = fm.remote_path || fm.proton_path || '';
  const affected = descendantOrSame(oldStorage, oldPath) || descendantOrSame(oldRemote, oldPath);
  if (!affected) return text;

  const replaced = replacePathPrefix(text, oldPath, newPath);
  const newStorage = oldStorage ? replacePathPrefix(oldStorage, oldPath, newPath) : '';
  const updates = {
    updated: { value: today },
    ...(newStorage ? {
      context_type: { value: deriveContextType(newStorage, remoteRoot, contextTypes) },
      context_name: { value: deriveContextName(newStorage, remoteRoot), quote: true },
    } : {}),
  };
  return setFrontmatterFields(replaced, updates);
}

export function markExternalFileTextMissing(
  text: string,
  folderOrFilePath: string,
  today: string,
  reason = 'External file not found',
): string {
  const fm = parseFrontmatter(text);
  const affected = descendantOrSame(fm.storage_folder || '', folderOrFilePath) ||
    descendantOrSame(fm.remote_path || fm.proton_path || '', folderOrFilePath);
  if (!affected) return text;
  return setFrontmatterFields(text, {
    status: { value: 'missing' },
    updated: { value: today },
    missing_reason: { value: reason, quote: true },
  });
}
