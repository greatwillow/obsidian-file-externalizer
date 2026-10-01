import { App, PluginSettingTab, Setting } from 'obsidian';
import type FileExternalizerPlugin from '../main';
import { normalizeSettings } from '../settings';

export class FileExternalizerSettingTab extends PluginSettingTab {
  constructor(app: App, private readonly plugin: FileExternalizerPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl('h2', { text: 'File Externalizer' });

    new Setting(containerEl)
      .setName('Remote root')
      .setDesc('Top-level external storage folder used by the folder picker.')
      .addText((text) => text
        .setPlaceholder('/remote/path/to/files')
        .setValue(this.plugin.settings.remoteRoot)
        .onChange(async (value) => {
          this.plugin.settings.remoteRoot = value.trim().replace(/\/+$/g, '');
          await this.save();
        }));

    new Setting(containerEl)
      .setName('External notes folder')
      .setDesc('Vault folder where external-file notes are created.')
      .addText((text) => text
        .setPlaceholder('External Files')
        .setValue(this.plugin.settings.externalNotesFolder)
        .onChange(async (value) => {
          this.plugin.settings.externalNotesFolder = value.trim();
          await this.save();
        }));

    new Setting(containerEl)
      .setName('Cache folder')
      .setDesc('Vault-local cache folder for downloaded/opened external files.')
      .addText((text) => text
        .setPlaceholder('File Externalizer Cache')
        .setValue(this.plugin.settings.cacheFolder)
        .onChange(async (value) => {
          this.plugin.settings.cacheFolder = value.trim();
          await this.save();
        }));

    new Setting(containerEl)
      .setName('Document types')
      .setDesc('Comma-separated note filing categories. Include Other as a catch-all.')
      .addTextArea((text) => text
        .setPlaceholder('Documents, Images, Media, Archives, Other')
        .setValue(this.plugin.settings.documentTypes.join(', '))
        .onChange(async (value) => {
          this.plugin.settings.documentTypes = splitList(value);
          await this.save();
        }));

    new Setting(containerEl)
      .setName('Context types')
      .setDesc('Comma-separated first-level remote folder names used for context metadata.')
      .addTextArea((text) => text
        .setPlaceholder('Projects, Areas, People, Organizations, General')
        .setValue(this.plugin.settings.contextTypes.join(', '))
        .onChange(async (value) => {
          this.plugin.settings.contextTypes = splitList(value);
          await this.save();
        }));
  }

  private async save(): Promise<void> {
    this.plugin.settings = normalizeSettings(this.plugin.settings);
    await this.plugin.saveSettings();
  }
}

function splitList(value: string): string[] {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}
