import { App, PluginSettingTab, Setting } from 'obsidian';
import MicrofeedPlugin from '../main';
import { MicrofeedClient } from './microfeedClient';

export interface MicrofeedSettings {
  apiUrl: string;
  apiKey: string;
  defaultStatus: 'published' | 'unpublished' | 'unlisted';
  autoGenerateImage: boolean;
  imageTemplate: 'simple' | 'detailed';
}

export const DEFAULT_SETTINGS: MicrofeedSettings = {
  apiUrl: 'https://your-microfeed-instance.com',
  apiKey: '',
  defaultStatus: 'published',
  autoGenerateImage: true,
  imageTemplate: 'detailed'
};

export class MicrofeedSettingTab extends PluginSettingTab {
  plugin: MicrofeedPlugin;

  constructor(app: App, plugin: MicrofeedPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Microfeed Publisher Settings' });

    // API URL Setting
    new Setting(containerEl)
      .setName('Microfeed API URL')
      .setDesc('The base URL of your Microfeed instance')
      .addText(text => text
        .setPlaceholder('https://your-domain.com')
        .setValue(this.plugin.settings.apiUrl)
        .onChange(async (value) => {
          this.plugin.settings.apiUrl = value;
          await this.plugin.saveSettings();
        }));

    // API Key Setting
    new Setting(containerEl)
      .setName('API Key')
      .setDesc('Your Microfeed API key (get it from /admin/settings/)')
      .addText(text => {
        text.inputEl.type = 'password';
        text
          .setPlaceholder('Enter your API key')
          .setValue(this.plugin.settings.apiKey)
          .onChange(async (value) => {
            this.plugin.settings.apiKey = value;
            await this.plugin.saveSettings();
          });
      });

    // Test Connection Button
    new Setting(containerEl)
      .setName('Test Connection')
      .setDesc('Test your API connection')
      .addButton(button => button
        .setButtonText('Test Connection')
        .setCta()
        .onClick(async () => {
          const { apiUrl, apiKey } = this.plugin.settings;
          if (!apiUrl || !apiKey) {
            this.showNotice('Please configure API URL and API Key first', 'error');
            return;
          }

          button.setButtonText('Testing...');
          button.setDisabled(true);

          try {
            const client = new MicrofeedClient(apiUrl, apiKey);
            const isConnected = await client.testConnection();
            
            if (isConnected) {
              this.showNotice('✅ Connection successful!', 'success');
            } else {
              this.showNotice('❌ Connection failed. Check your settings.', 'error');
            }
          } catch (error) {
            this.showNotice(`❌ Connection error: ${error.message}`, 'error');
          } finally {
            button.setButtonText('Test Connection');
            button.setDisabled(false);
          }
        }));

    // Default Status Setting
    new Setting(containerEl)
      .setName('Default Publication Status')
      .setDesc('Default status for published items')
      .addDropdown(dropdown => dropdown
        .addOption('published', 'Published')
        .addOption('unlisted', 'Unlisted')
        .addOption('unpublished', 'Unpublished')
        .setValue(this.plugin.settings.defaultStatus)
        .onChange(async (value: 'published' | 'unpublished' | 'unlisted') => {
          this.plugin.settings.defaultStatus = value;
          await this.plugin.saveSettings();
        }));

    containerEl.createEl('h3', { text: 'Image Generation' });

    // Auto Generate Image Setting
    new Setting(containerEl)
      .setName('Auto-generate thumbnails')
      .setDesc('Automatically generate thumbnail images for posts without images')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.autoGenerateImage)
        .onChange(async (value) => {
          this.plugin.settings.autoGenerateImage = value;
          await this.plugin.saveSettings();
        }));

    // Image Template Setting
    new Setting(containerEl)
      .setName('Image Template')
      .setDesc('Choose the style for auto-generated images')
      .addDropdown(dropdown => dropdown
        .addOption('simple', 'Simple (title only)')
        .addOption('detailed', 'Detailed (title + content preview)')
        .setValue(this.plugin.settings.imageTemplate)
        .onChange(async (value: 'simple' | 'detailed') => {
          this.plugin.settings.imageTemplate = value;
          await this.plugin.saveSettings();
        }));

    // Help Section
    containerEl.createEl('h3', { text: 'Help' });
    
    const helpDiv = containerEl.createDiv();
    helpDiv.innerHTML = `
      <p><strong>How to use:</strong></p>
      <ol>
        <li>Configure your Microfeed API URL and API Key above</li>
        <li>Open any markdown note in Obsidian</li>
        <li>Use the command palette (Cmd/Ctrl + P) and search for "Publish to Microfeed"</li>
        <li>The plugin will automatically parse your content and upload it</li>
      </ol>
      
      <p><strong>Supported media:</strong></p>
      <ul>
        <li>Audio: .mp3, .wav, .m4a, .aac, .ogg, .flac</li>
        <li>Video: .mp4, .mov, .avi, .mkv, .webm, .m4v</li>
        <li>Images: .jpg, .jpeg, .png, .gif, .webp, .svg</li>
        <li>Documents: .pdf, .doc, .docx, .txt, .rtf</li>
        <li>External URLs are also supported</li>
      </ul>
      
      <p><strong>Front matter support:</strong></p>
      <p>You can use YAML front matter to specify metadata:</p>
      <pre>---
title: My Post Title
status: published
itunes:explicit: false
itunes:season: 1
itunes:episode: 5
---</pre>
    `;
  }

  private showNotice(message: string, type: 'success' | 'error'): void {
    const notice = this.app.workspace.containerEl.createDiv({
      cls: `notice ${type === 'success' ? 'notice-success' : 'notice-error'}`
    });
    notice.textContent = message;
    
    setTimeout(() => {
      notice.remove();
    }, 5000);
  }
}