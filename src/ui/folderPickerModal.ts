import { App, Modal, Notice } from 'obsidian';
import { joinRemotePath, normalizeRemoteFolder, parentRemotePath, pathName, isRemoteRoot, descendantOrSame } from '../domain/paths';
import { FileExternalizerService } from '../services/fileExternalizerService';
import { ConfirmTextModal, NewFolderModal, RenameFolderModal } from './simpleModals';

export class FolderPickerModal extends Modal {
  private readonly expanded = new Set<string>();
  private readonly folderCache = new Map<string, string[]>();
  private readonly loading = new Set<string>();
  private errorEl: HTMLElement | null = null;
  private pathEl: HTMLElement | null = null;
  private selectedPath: string;
  private treeEl: HTMLElement | null = null;

  constructor(
    app: App,
    private readonly service: FileExternalizerService,
    private readonly remoteRoot: string,
    initialPath: string,
    private readonly onChoose: (folderPath: string) => void,
  ) {
    super(app);
    this.selectedPath = normalizeRemoteFolder(initialPath, remoteRoot);
    this.expanded.add(remoteRoot);
    this.expandAncestors(this.selectedPath);
  }

  onOpen(): void {
    this.modalEl.addClass('file-externalizer-modal-frame');
    this.contentEl.empty();
    this.contentEl.addClass('file-externalizer-modal');
    this.contentEl.createEl('h2', { text: 'Choose Destination Folder' });
    this.contentEl.createEl('p', {
      cls: 'file-externalizer-help',
      text: 'Select a folder in the tree. Folder lists are cached while this picker is open, and nearby folders preload in the background.',
    });

    this.pathEl = this.contentEl.createEl('div', { cls: 'file-externalizer-current-path' });
    this.errorEl = this.contentEl.createEl('div', { cls: 'file-externalizer-error' });
    this.errorEl.hide();

    const toolbar = this.contentEl.createEl('div', { cls: 'file-externalizer-toolbar' });
    this.createButton(toolbar, 'Use selected folder', 'mod-cta', () => this.choose());
    this.createButton(toolbar, 'New folder', '', () => this.createFolderSelected());
    this.createButton(toolbar, 'Rename selected', '', () => this.renameSelected());
    this.createButton(toolbar, 'Delete selected', 'mod-warning', () => this.deleteSelected());
    this.createButton(toolbar, 'Refresh', '', () => this.refreshSelected());

    this.treeEl = this.contentEl.createEl('div', { cls: 'file-externalizer-folder-tree' });
    this.renderTree();
    void this.ensureLoaded(this.remoteRoot, true);
  }

  private choose(): void {
    this.onChoose(this.selectedPath);
    this.close();
  }

  private createButton(parent: HTMLElement, text: string, cls: string, onClick: () => void): HTMLButtonElement {
    const button = parent.createEl('button', { text });
    button.type = 'button';
    if (cls) button.addClass(cls);
    button.onclick = onClick;
    return button;
  }

  private expandAncestors(folderPath: string): void {
    let current = normalizeRemoteFolder(folderPath, this.remoteRoot);
    while (current && current !== this.remoteRoot) {
      this.expanded.add(parentRemotePath(current, this.remoteRoot));
      current = parentRemotePath(current, this.remoteRoot);
    }
  }

  private renderTree(): void {
    if (!this.treeEl || !this.pathEl) return;
    this.pathEl.setText(`Selected folder: ${this.selectedPath}`);
    this.treeEl.empty();
    this.renderNode(this.remoteRoot, 0);
  }

  private renderNode(folderPath: string, depth: number): void {
    if (!this.treeEl) return;
    const row = this.treeEl.createEl('div', { cls: 'file-externalizer-tree-row' });
    if (folderPath === this.selectedPath) row.addClass('is-selected');
    row.style.setProperty('--depth', String(depth));

    const toggle = row.createEl('button', { cls: 'file-externalizer-tree-toggle' });
    toggle.type = 'button';
    const loadedChildren = this.folderCache.get(folderPath);
    const hasLoadedChildren = Array.isArray(loadedChildren) && loadedChildren.length > 0;
    toggle.setText(this.expanded.has(folderPath) ? '▾' : '▸');
    toggle.onclick = (event) => {
      event.stopPropagation();
      void this.toggleFolder(folderPath);
    };

    const name = row.createEl('button', { cls: 'file-externalizer-tree-name' });
    name.type = 'button';
    name.createEl('span', { text: pathName(folderPath, this.remoteRoot) });
    name.onclick = () => this.selectFolder(folderPath);
    name.ondblclick = () => { void this.toggleFolder(folderPath); };
    row.createEl('span', { cls: 'file-externalizer-tree-status', text: this.loading.has(folderPath) ? 'Loading...' : '' });

    if (this.expanded.has(folderPath)) {
      if (!loadedChildren) {
        this.treeEl.createEl('div', { cls: 'file-externalizer-tree-muted', text: 'Loading...' }).style.setProperty('--depth', String(depth + 1));
      } else if (!hasLoadedChildren) {
        this.treeEl.createEl('div', { cls: 'file-externalizer-tree-muted', text: 'No subfolders' }).style.setProperty('--depth', String(depth + 1));
      } else {
        for (const child of loadedChildren) this.renderNode(joinRemotePath(folderPath, child), depth + 1);
      }
    }
  }

  private selectFolder(folderPath: string): void {
    this.selectedPath = normalizeRemoteFolder(folderPath, this.remoteRoot);
    this.expandAncestors(this.selectedPath);
    this.hideError();
    this.renderTree();
    void this.ensureLoaded(this.selectedPath, true);
  }

  private async toggleFolder(folderPath: string): Promise<void> {
    if (this.expanded.has(folderPath)) {
      this.expanded.delete(folderPath);
      this.renderTree();
      return;
    }
    this.expanded.add(folderPath);
    this.renderTree();
    await this.ensureLoaded(folderPath, true);
  }

  private async ensureLoaded(folderPath: string, preload: boolean): Promise<void> {
    const normalized = normalizeRemoteFolder(folderPath, this.remoteRoot);
    if (this.folderCache.has(normalized) || this.loading.has(normalized)) return;
    this.loading.add(normalized);
    this.renderTree();
    try {
      const children = await this.service.provider.listFolders(normalized);
      this.folderCache.set(normalized, children);
      if (preload) this.preloadChildren(normalized, children);
    } catch (error) {
      this.showError(error instanceof Error ? error.message : String(error));
    } finally {
      this.loading.delete(normalized);
      this.renderTree();
    }
  }

  private preloadChildren(parentPath: string, children: string[]): void {
    for (const child of children.slice(0, 12)) {
      const childPath = joinRemotePath(parentPath, child);
      if (!this.folderCache.has(childPath) && !this.loading.has(childPath)) {
        void this.service.provider.listFolders(childPath).then((folders) => this.folderCache.set(childPath, folders)).catch(() => undefined);
      }
    }
  }

  private async refreshSelected(): Promise<void> {
    this.folderCache.delete(this.selectedPath);
    await this.ensureLoaded(this.selectedPath, true);
  }

  private createFolderSelected(): void {
    new NewFolderModal(this.app, this.selectedPath, (folderName) => { void this.performCreateFolder(folderName); }).open();
  }

  private async performCreateFolder(folderName: string): Promise<void> {
    const parentPath = this.selectedPath;
    const newPath = joinRemotePath(parentPath, folderName);
    const notice = new Notice('Creating remote folder...', 0);
    try {
      await this.service.provider.createFolder(parentPath, folderName);
      const current = this.folderCache.get(parentPath) || [];
      if (!current.includes(folderName)) this.folderCache.set(parentPath, [...current, folderName].sort((a, b) => a.localeCompare(b)));
      this.folderCache.set(newPath, []);
      this.selectedPath = newPath;
      this.expanded.add(parentPath);
      this.expandAncestors(newPath);
      this.renderTree();
      new Notice('Folder created.');
    } catch (error) {
      this.showError(error instanceof Error ? error.message : String(error));
      new Notice('Create folder failed. See developer console.');
      console.error('Create folder failed:', error);
    } finally {
      notice.hide();
    }
  }

  private renameSelected(): void {
    if (isRemoteRoot(this.selectedPath, this.remoteRoot)) {
      this.showError('The root folder cannot be renamed here.');
      return;
    }
    new RenameFolderModal(this.app, this.selectedPath, pathName(this.selectedPath, this.remoteRoot), (newName) => { void this.performRename(newName); }).open();
  }

  private async performRename(newName: string): Promise<void> {
    const oldPath = this.selectedPath;
    const newPath = joinRemotePath(parentRemotePath(oldPath, this.remoteRoot), newName);
    const notice = new Notice('Renaming folder and updating notes...', 0);
    try {
      await this.service.renameFolder(oldPath, newName);
      this.remapFolderCache(oldPath, newPath);
      this.selectedPath = newPath;
      this.expandAncestors(newPath);
      this.renderTree();
      new Notice('Folder renamed and affected notes updated.');
    } catch (error) {
      this.showError(error instanceof Error ? error.message : String(error));
      new Notice('Rename failed. See developer console.');
      console.error('Rename folder failed:', error);
    } finally {
      notice.hide();
    }
  }

  private deleteSelected(): void {
    if (isRemoteRoot(this.selectedPath, this.remoteRoot)) {
      this.showError('The root folder cannot be deleted here.');
      return;
    }
    const folderName = pathName(this.selectedPath, this.remoteRoot);
    const message = `This will move ${this.selectedPath} to remote trash and remove matching local cache files. Existing Obsidian notes that reference files under this folder will be marked missing.`;
    new ConfirmTextModal(this.app, 'Delete Folder', message, folderName, 'Delete folder', () => { void this.performDelete(); }).open();
  }

  private async performDelete(): Promise<void> {
    const oldPath = this.selectedPath;
    const notice = new Notice('Moving folder to trash...', 0);
    try {
      await this.service.trashFolder(oldPath);
      this.removeFolderFromCache(oldPath);
      this.selectedPath = parentRemotePath(oldPath, this.remoteRoot);
      this.renderTree();
      new Notice('Folder moved to trash.');
    } catch (error) {
      this.showError(error instanceof Error ? error.message : String(error));
      new Notice('Delete failed. See developer console.');
      console.error('Delete folder failed:', error);
    } finally {
      notice.hide();
    }
  }

  private remapFolderCache(oldPath: string, newPath: string): void {
    const next = new Map<string, string[]>();
    for (const [key, value] of this.folderCache.entries()) {
      if (descendantOrSame(key, oldPath)) next.set(key.replace(oldPath, newPath), value);
      else next.set(key, value);
    }
    this.folderCache.clear();
    for (const [key, value] of next.entries()) this.folderCache.set(key, value);
    this.folderCache.delete(parentRemotePath(oldPath, this.remoteRoot));
    this.folderCache.delete(parentRemotePath(newPath, this.remoteRoot));
  }

  private removeFolderFromCache(folderPath: string): void {
    const parent = parentRemotePath(folderPath, this.remoteRoot);
    const name = pathName(folderPath, this.remoteRoot);
    const siblings = this.folderCache.get(parent);
    if (siblings) this.folderCache.set(parent, siblings.filter((folder) => folder !== name));
    for (const key of Array.from(this.folderCache.keys())) {
      if (descendantOrSame(key, folderPath)) this.folderCache.delete(key);
    }
  }

  private showError(message: string): void {
    if (!this.errorEl) return;
    this.errorEl.setText(message);
    this.errorEl.show();
  }

  private hideError(): void {
    this.errorEl?.hide();
  }
}
