export interface StoredFile {
  modifiedTime: string;
  path: string;
  size: number;
}

export interface UploadFileInput {
  localPath: string;
  remoteFolder: string;
  remoteName: string;
}

export interface StorageProvider {
  createFolder(parentPath: string, name: string): Promise<void>;
  downloadFile(remotePath: string, destinationFolder: string): Promise<StoredFile>;
  listFolders(parentPath: string): Promise<string[]>;
  renameFolder(oldPath: string, newName: string): Promise<void>;
  stat(remotePath: string): Promise<StoredFile>;
  trashFolder(remotePath: string): Promise<void>;
  uploadFile(input: UploadFileInput): Promise<StoredFile>;
}
