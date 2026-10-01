import { App, Modal, Notice, Setting } from 'obsidian';
import path from 'node:path';
import { DocumentType } from '../constants';
import { normalizeDocumentType } from '../domain/documentType';
import { defaultTitleForFile, normalizeUploadFilename } from '../domain/filename';
import { FileExternalizerService, RegisterFileInput } from '../services/fileExternalizerService';
import { FileExternalizerSettings } from '../settings';
import { FolderPickerModal } from './folderPickerModal';

interface NativeFileResult {
  canceled?: boolean;
  path?: string;
}

export class RegisterFileModal extends Modal {
  private readonly values: RegisterFileInput;
  private destinationEl: HTMLElement | null = null;
  private errorEl: HTMLElement | null = null;
  private fileStatusEl: HTMLElement | null = null;
  private pastePathSetting: Setting | null = null;
  private titleInput: { setValue(value: string): void } | null = null;
  private titleWasAuto = true;
  private uploadFilenameInput: { setValue(value: string): void } | null = null;
  private uploadFilenameWasAuto = true;

  constructor(
    app: App,
    private readonly service: FileExternalizerService,
    private readonly settings: FileExternalizerSettings,
  ) {
    super(app);
    this.values = {
      filePath: '',
      title: '',
      uploadFilename: '',
      documentType: 'Other',
      destinationFolder: settings.remoteRoot,
      shareLink: false,
    };
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('file-externalizer-modal');
    contentEl.createEl('h2', { text: 'Register External File' });

    this.errorEl = contentEl.createEl('div', { cls: 'file-externalizer-error' });
    this.errorEl.hide();

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.addClass('file-externalizer-hidden');
    contentEl.appendChild(fileInput);
    fileInput.onchange = () => {
      const chosen = fileInput.files && fileInput.files[0];
      const chosenPath = getFilePathFromInputFile(chosen);
      if (!chosenPath) {
        this.showPastePathField();
        this.showError('The fallback picker could not expose the selected file path. Paste the path below instead.');
        return;
      }
      this.setFilePath(chosenPath);
    };

    new Setting(contentEl)
      .setName('Local file')
      .setDesc('Choose the file from your computer. The plugin uploads it to the selected external storage folder and creates an Obsidian note for it.')
      .addButton((button) => {
        button.setButtonText('Choose file');
        button.onClick(async () => {
          try {
            const result = await chooseWithElectronDialog();
            if (result.path) {
              this.setFilePath(result.path);
              return;
            }
            if (result.canceled) return;
            fileInput.click();
          } catch (error) {
            console.error('Native file picker failed:', error);
            this.showPastePathField();
            this.showError('The native file picker failed. Paste the file path below instead.');
          }
        });
      });

    this.fileStatusEl = contentEl.createEl('div', {
      cls: 'file-externalizer-path',
      text: 'No file selected yet.',
    });

    this.pastePathSetting = new Setting(contentEl)
      .setName('Paste file path')
      .setDesc('Fallback only. This appears when Obsidian cannot get a usable path from the file picker.')
      .addText((text) => {
        text.setPlaceholder('/path/to/file.pdf');
        text.onChange((value) => this.setFilePath(value.trim(), false));
      });
    this.pastePathSetting.settingEl.addClass('file-externalizer-hidden');

    new Setting(contentEl)
      .setName('Note title')
      .setDesc('This becomes the title of the Obsidian note. It does not rename the uploaded external file.')
      .addText((text) => {
        this.titleInput = text;
        text.setPlaceholder('Choose a file to generate a title');
        text.onChange((value) => {
          this.values.title = value.trim();
          this.titleWasAuto = false;
        });
      });

    new Setting(contentEl)
      .setName('Upload filename')
      .setDesc('This is the filename stored externally. If you omit the extension, the source file extension is added automatically.')
      .addText((text) => {
        this.uploadFilenameInput = text;
        text.setPlaceholder('Choose a file to generate a filename');
        text.onChange((value) => {
          this.values.uploadFilename = value.trim();
          this.uploadFilenameWasAuto = false;
          this.hideError();
        });
      });

    new Setting(contentEl)
      .setName('Document type')
      .setDesc('This controls where the Obsidian external-file note is filed. It does not force an external folder layout.')
      .addDropdown((dropdown) => {
        for (const type of this.settings.documentTypes) dropdown.addOption(type, type);
        dropdown.setValue(this.values.documentType);
        dropdown.onChange((value) => {
          this.values.documentType = normalizeDocumentType(value, this.settings.documentTypes) as DocumentType;
          this.hideError();
        });
      });

    new Setting(contentEl)
      .setName('Destination folder')
      .setDesc('Choose the exact external storage folder where this file should be uploaded.')
      .addButton((button) => button
        .setButtonText('Choose folder')
        .onClick(() => this.openFolderPicker()));

    this.destinationEl = contentEl.createEl('div', {
      cls: 'file-externalizer-path',
      text: `Destination: ${this.values.destinationFolder}`,
    });

    new Setting(contentEl)
      .setName('Create share link')
      .setDesc('Not implemented yet for provider-neutral storage. Leave off for now.')
      .addToggle((toggle) => {
        toggle.setValue(this.values.shareLink);
        toggle.setDisabled(true);
        toggle.onChange((value) => { this.values.shareLink = value; });
      });

    new Setting(contentEl)
      .addButton((button) => {
        button.setButtonText('Register file');
        button.setCta();
        button.onClick(() => { void this.submit(); });
      })
      .addButton((button) => {
        button.setButtonText('Cancel');
        button.onClick(() => this.close());
      });
  }

  private setFilePath(filePath: string, updateTitle = true): void {
    const previousFileName = path.basename(this.values.filePath || '');
    this.values.filePath = filePath;
    if (this.fileStatusEl) {
      this.fileStatusEl.setText(filePath ? `Selected source file: ${filePath}` : 'No file selected yet.');
    }

    if (filePath && (this.uploadFilenameWasAuto || !this.values.uploadFilename || this.values.uploadFilename === previousFileName)) {
      this.values.uploadFilename = path.basename(filePath);
      this.uploadFilenameWasAuto = true;
      this.uploadFilenameInput?.setValue(this.values.uploadFilename);
    }

    if (filePath && updateTitle && (this.titleWasAuto || !this.values.title)) {
      const generated = defaultTitleForFile(filePath);
      this.values.title = generated;
      this.titleWasAuto = true;
      this.titleInput?.setValue(generated);
    }
    this.hideError();
  }

  private showPastePathField(): void {
    this.pastePathSetting?.settingEl.removeClass('file-externalizer-hidden');
  }

  private openFolderPicker(): void {
    if (!this.settings.remoteRoot) {
      this.showError('Configure File Externalizer remote root in plugin settings first.');
      return;
    }
    new FolderPickerModal(this.app, this.service, this.settings.remoteRoot, this.values.destinationFolder, (folderPath) => {
      this.values.destinationFolder = folderPath;
      this.updateDestinationPreview();
      this.hideError();
    }).open();
  }

  private updateDestinationPreview(): void {
    this.destinationEl?.setText(`Destination: ${this.values.destinationFolder}`);
  }

  private showError(message: string): void {
    if (!this.errorEl) return;
    this.errorEl.setText(message);
    this.errorEl.show();
  }

  private hideError(): void {
    this.errorEl?.hide();
  }

  private async submit(): Promise<void> {
    if (!this.values.filePath) {
      this.showError('Choose a file first.');
      return;
    }
    if (!this.values.title) {
      this.showError('Add a note title.');
      return;
    }
    try {
      this.values.uploadFilename = normalizeUploadFilename(this.values.uploadFilename, this.values.filePath);
    } catch (error) {
      this.showError(error instanceof Error ? error.message : String(error));
      return;
    }
    this.uploadFilenameInput?.setValue(this.values.uploadFilename);
    this.values.documentType = normalizeDocumentType(this.values.documentType, this.settings.documentTypes);
    if (!this.settings.remoteRoot) {
      this.showError('Configure File Externalizer remote root in plugin settings first.');
      return;
    }

    const progress = new Notice('Uploading external file...', 0);
    await sleep(75);

    try {
      const result = await this.service.registerFile(this.values);
      progress.hide();
      new Notice(`Created ${result.link}`);
      this.close();
      await this.service.openCreatedNote(result.notePath);
    } catch (error) {
      progress.hide();
      const message = error instanceof Error ? error.message : String(error);
      this.showError(message);
      new Notice('Register File failed. See developer console.');
      console.error('Register File failed:', error);
    }
  }
}

function getFilePathFromInputFile(file: File | null): string {
  return file && ('path' in file || 'webkitRelativePath' in file)
    ? String((file as File & { path?: string }).path || file.webkitRelativePath || '')
    : '';
}

async function chooseWithElectronDialog(): Promise<NativeFileResult> {
  const dialog = getElectronDialog();
  if (!dialog || typeof dialog.showOpenDialog !== 'function') return {};

  const result = await dialog.showOpenDialog({
    title: 'Choose external file',
    properties: ['openFile'],
  });

  if (!result || result.canceled) return { canceled: true };
  if (!result.filePaths || !result.filePaths.length) return { path: '' };
  return { path: result.filePaths[0] };
}

function getElectronDialog(): { showOpenDialog?: (options: unknown) => Promise<{ canceled?: boolean; filePaths?: string[] }> } | null {
  try {
    const electron = require('electron') as {
      dialog?: unknown;
      remote?: { dialog?: unknown };
    };
    return (electron.remote?.dialog || electron.dialog || null) as { showOpenDialog?: (options: unknown) => Promise<{ canceled?: boolean; filePaths?: string[] }> } | null;
  } catch {
    return null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
