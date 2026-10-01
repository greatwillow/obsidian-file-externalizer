import { Notice, Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, FileExternalizerSettings, normalizeSettings } from './settings';
import { findExternalFileNote } from './platform/obsidianVault';
import { FileExternalizerService } from './services/fileExternalizerService';
import { RegisterFileModal } from './ui/registerFileModal';
import { FileExternalizerSettingTab } from './ui/settingsTab';

export default class FileExternalizerPlugin extends Plugin {
  settings: FileExternalizerSettings = DEFAULT_SETTINGS;
  private service: FileExternalizerService | null = null;

  async onload(): Promise<void> {
    await this.loadSettings();
    this.service = new FileExternalizerService(this.app, this.settings);
    this.addSettingTab(new FileExternalizerSettingTab(this.app, this));

    this.addCommand({
      id: 'register-file',
      name: 'Register File',
      callback: () => {
        if (!this.service) return;
        new RegisterFileModal(this.app, this.service, this.settings).open();
      },
    });

    this.addCommand({
      id: 'open-external-file',
      name: 'Open External File',
      callback: () => { void this.openExternalFileCommand(); },
    });

    this.addCommand({
      id: 'validate-external-file-notes',
      name: 'Validate External File Notes',
      callback: () => { void this.validateExternalFileNotesCommand(); },
    });
  }

  async loadSettings(): Promise<void> {
    this.settings = normalizeSettings({ ...DEFAULT_SETTINGS, ...await this.loadData() as Partial<FileExternalizerSettings> });
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  private async openExternalFileCommand(): Promise<void> {
    if (!this.service) return;
    const noteFile = findExternalFileNote(this.app);
    if (!noteFile) {
      new Notice('Open an external-file note first.');
      return;
    }

    const progress = new Notice('Opening external file...', 0);
    await sleep(75);
    try {
      const result = await this.service.openExternalFile(noteFile);
      progress.hide();
      new Notice(result.cacheHit ? 'Opened cached external file.' : 'Downloaded and opened external file.');
    } catch (error) {
      progress.hide();
      new Notice('Open External File failed. See developer console.');
      console.error('Open External File failed:', error);
    }
  }

  private async validateExternalFileNotesCommand(): Promise<void> {
    if (!this.service) return;
    const progress = new Notice('Validating external-file notes...', 0);
    await sleep(75);
    try {
      const result = await this.service.validateExternalFileNotes();
      progress.hide();
      new Notice(`External-file validation complete: ${result.found} found, ${result.missing} missing, ${result.changed} notes updated${result.errors ? `, ${result.errors} errors skipped` : ''}.`);
    } catch (error) {
      progress.hide();
      new Notice('Validate External File Notes failed. See developer console.');
      console.error('Validate External File Notes failed:', error);
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
