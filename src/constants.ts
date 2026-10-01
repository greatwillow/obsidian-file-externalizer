export const PLUGIN_ID = 'file-externalizer';
export const COMMAND_REGISTER_FILE = `${PLUGIN_ID}:register-file`;
export const COMMAND_OPEN_EXTERNAL_FILE = `${PLUGIN_ID}:open-external-file`;
export const COMMAND_VALIDATE_EXTERNAL_FILE_NOTES = `${PLUGIN_ID}:validate-external-file-notes`;

export const DEFAULT_DOCUMENT_TYPES = ['Documents', 'Images', 'Media', 'Archives', 'Other'] as const;
export const DEFAULT_CONTEXT_TYPES = ['Projects', 'Areas', 'People', 'Organizations', 'General'] as const;

export type DocumentType = string;
export type ContextType = string;
