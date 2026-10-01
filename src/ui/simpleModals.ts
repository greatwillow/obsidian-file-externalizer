import { Modal } from 'obsidian';

export class ConfirmTextModal extends Modal {
  private typed = '';

  constructor(
    app: ConstructorParameters<typeof Modal>[0],
    private readonly titleText: string,
    private readonly message: string,
    private readonly expectedText: string,
    private readonly actionLabel: string,
    private readonly onConfirm: () => void,
  ) {
    super(app);
  }

  onOpen(): void {
    this.contentEl.empty();
    this.contentEl.addClass('file-externalizer-modal');
    this.contentEl.createEl('h2', { text: this.titleText });
    this.contentEl.createEl('p', { cls: 'file-externalizer-help', text: this.message });
    this.contentEl.createEl('p', { cls: 'file-externalizer-help', text: `Type ${this.expectedText} to confirm.` });

    const input = this.contentEl.createEl('input');
    input.type = 'text';
    input.addClass('file-externalizer-confirm-input');
    input.oninput = () => { this.typed = input.value.trim(); };

    const actions = this.contentEl.createEl('div', { cls: 'file-externalizer-toolbar' });
    const confirm = actions.createEl('button', { text: this.actionLabel });
    confirm.type = 'button';
    confirm.addClass('mod-warning');
    confirm.onclick = () => {
      if (this.typed !== this.expectedText) return;
      this.close();
      this.onConfirm();
    };

    const cancel = actions.createEl('button', { text: 'Cancel' });
    cancel.type = 'button';
    cancel.onclick = () => this.close();
    input.focus();
  }
}

export class RenameFolderModal extends Modal {
  private newName: string;

  constructor(
    app: ConstructorParameters<typeof Modal>[0],
    private readonly currentPath: string,
    currentName: string,
    private readonly onRename: (newName: string) => void,
  ) {
    super(app);
    this.newName = currentName;
  }

  onOpen(): void {
    this.contentEl.empty();
    this.contentEl.addClass('file-externalizer-modal');
    this.contentEl.createEl('h2', { text: 'Rename Folder' });
    this.contentEl.createEl('p', { cls: 'file-externalizer-help', text: this.currentPath });

    const input = this.contentEl.createEl('input');
    input.type = 'text';
    input.value = this.newName;
    input.addClass('file-externalizer-confirm-input');
    input.oninput = () => { this.newName = input.value.trim(); };

    const actions = this.contentEl.createEl('div', { cls: 'file-externalizer-toolbar' });
    const rename = actions.createEl('button', { text: 'Rename' });
    rename.type = 'button';
    rename.addClass('mod-cta');
    rename.onclick = () => {
      if (!this.newName || this.newName.includes('/')) return;
      this.close();
      this.onRename(this.newName);
    };

    const cancel = actions.createEl('button', { text: 'Cancel' });
    cancel.type = 'button';
    cancel.onclick = () => this.close();
    input.focus();
    input.select();
  }
}

export class NewFolderModal extends Modal {
  private folderName = '';

  constructor(
    app: ConstructorParameters<typeof Modal>[0],
    private readonly parentPath: string,
    private readonly onCreate: (folderName: string) => void,
  ) {
    super(app);
  }

  onOpen(): void {
    this.contentEl.empty();
    this.contentEl.addClass('file-externalizer-modal');
    this.contentEl.createEl('h2', { text: 'New Folder' });
    this.contentEl.createEl('p', { cls: 'file-externalizer-help', text: `Create a folder under ${this.parentPath}` });

    const input = this.contentEl.createEl('input');
    input.type = 'text';
    input.placeholder = 'Folder name';
    input.addClass('file-externalizer-confirm-input');
    input.oninput = () => { this.folderName = input.value.trim(); };

    const actions = this.contentEl.createEl('div', { cls: 'file-externalizer-toolbar' });
    const create = actions.createEl('button', { text: 'Create folder' });
    create.type = 'button';
    create.addClass('mod-cta');
    create.onclick = () => {
      if (!this.folderName || this.folderName.includes('/')) return;
      this.close();
      this.onCreate(this.folderName);
    };

    const cancel = actions.createEl('button', { text: 'Cancel' });
    cancel.type = 'button';
    cancel.onclick = () => this.close();
    input.focus();
  }
}
