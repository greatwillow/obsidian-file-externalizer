import { App, Notice, PluginSettingTab, Setting } from 'obsidian';
import type { SetupStatus } from '../providers/storageProvider';
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

    this.displaySetup(containerEl);

    containerEl.createEl('h3', { text: 'Storage' });

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

  private displaySetup(containerEl: HTMLElement): void {
    containerEl.createEl('h3', { text: 'Setup on this computer' });
    containerEl.createEl('p', {
      cls: 'file-externalizer-help',
      text: 'Each person signs in to Proton on their own computer. Nothing secret is stored in the vault.',
    });

    const statusEl = containerEl.createEl('div', { cls: 'file-externalizer-setup-status' });
    const loginLinkEl = containerEl.createEl('div', { cls: 'file-externalizer-help' });
    loginLinkEl.hide();

    const refresh = async () => {
      statusEl.empty();
      statusEl.createEl('div', { text: 'Checking...' });
      const service = this.plugin.getService();
      if (!service) return;
      try {
        renderStatus(statusEl, await service.checkSetup());
      } catch (error) {
        statusEl.empty();
        statusEl.createEl('div', { text: `Check failed: ${error instanceof Error ? error.message : String(error)}` });
      }
    };

    new Setting(containerEl)
      .setName('Status')
      .setDesc('Checks the Proton Drive CLI, your sign-in, and access to the remote root.')
      .addButton((button) => button
        .setButtonText('Check again')
        .onClick(() => { void refresh(); }))
      .addButton((button) => button
        .setButtonText('Log in to Proton')
        .setCta()
        .onClick(async () => {
          const service = this.plugin.getService();
          if (!service) return;
          button.setDisabled(true);
          const progress = new Notice('Finish signing in to Proton in your browser...', 0);
          try {
            await service.login((url) => {
              loginLinkEl.empty();
              loginLinkEl.appendText("If your browser didn't open, ");
              loginLinkEl.createEl('a', { href: url, text: 'open the Proton sign-in page' });
              loginLinkEl.appendText('.');
              loginLinkEl.show();
            });
            new Notice('Signed in to Proton.');
          } catch (error) {
            new Notice(`Proton sign-in did not finish: ${error instanceof Error ? error.message : String(error)}`, 10000);
          } finally {
            progress.hide();
            loginLinkEl.hide();
            button.setDisabled(false);
            void refresh();
          }
        }));

    new Setting(containerEl)
      .setName('Proton Drive CLI path')
      .setDesc('Leave empty to find proton-drive automatically (PATH, ~/.local/bin, Homebrew).')
      .addText((text) => text
        .setPlaceholder('Auto-detect')
        .setValue(this.plugin.settings.protonCliPath)
        .onChange(async (value) => {
          this.plugin.settings.protonCliPath = value.trim();
          await this.save();
        }));

    void refresh();
  }

  private async save(): Promise<void> {
    this.plugin.settings = normalizeSettings(this.plugin.settings);
    await this.plugin.saveSettings();
  }
}

function renderStatus(el: HTMLElement, status: SetupStatus): void {
  el.empty();
  for (const check of status.checks) {
    const row = el.createEl('div', { cls: `file-externalizer-setup-check ${check.ok ? 'is-ok' : 'is-failed'}` });
    row.createEl('span', { text: check.ok ? '✓ ' : '✗ ' });
    row.createEl('strong', { text: `${check.label}: ` });
    row.appendText(check.detail);
  }
}

function splitList(value: string): string[] {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}
