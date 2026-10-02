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

export interface SetupCheck {
  detail: string;
  label: string;
  ok: boolean;
}

export interface SetupStatus {
  checks: SetupCheck[];
  ready: boolean;
}

export interface LoginResult {
  output: string;
  url: string | null;
}

export interface StorageProvider {
  createFolder(parentPath: string, name: string): Promise<void>;
  downloadFile(remotePath: string, destinationFolder: string): Promise<StoredFile>;
  listFolders(parentPath: string): Promise<string[]>;
  renameFolder(oldPath: string, newName: string): Promise<void>;
  stat(remotePath: string): Promise<StoredFile>;
  trashFolder(remotePath: string): Promise<void>;
  uploadFile(input: UploadFileInput): Promise<StoredFile>;

  /** Reports whether this machine is ready to use the provider (tooling installed, signed in, root reachable). */
  checkSetup?(remoteRoot: string): Promise<SetupStatus>;
  /** Starts the provider's interactive sign-in, if it has one. */
  login?(onUrl?: (url: string) => void): Promise<LoginResult>;
}
