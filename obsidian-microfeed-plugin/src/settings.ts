import { App, PluginSettingTab, Setting } from 'obsidian';
import MicrofeedPlugin from '../main';
import { MicrofeedClient } from './microfeedClient';

export interface MicrofeedSettings {
  apiUrl: string;
  apiKey: string;
  defaultStatus: 'published' | 'unpublished' | 'unlisted';
  autoGenerateImage: boolean;
  imageTemplate: 'simple' | 'detailed';
  twitter: {
    apiKey: string;
    apiSecret: string;
    accessToken: string;
    accessTokenSecret: string;
    bearerToken: string;
    enabled: boolean;
    autoPost: boolean;
    postFormat: 'title_only' | 'title_with_link' | 'title_with_summary';
    includeHashtags: boolean;
    customHashtags: string;
  };
}

export const DEFAULT_SETTINGS: MicrofeedSettings = {
  apiUrl: 'https://your-microfeed-instance.com',
  apiKey: '',
  defaultStatus: 'published',
  autoGenerateImage: true,
  imageTemplate: 'detailed',
  twitter: {
    apiKey: '',
    apiSecret: '',
    accessToken: '',
    accessTokenSecret: '',
    bearerToken: '',
    enabled: false,
    autoPost: false,
    postFormat: 'title_with_link',
    includeHashtags: false,
    customHashtags: '#microfeed'
  }
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

    // Twitter/X Integration Settings
    containerEl.createEl('h3', { text: 'Twitter/X Integration' });

    // Enable Twitter Integration
    new Setting(containerEl)
      .setName('Enable Twitter/X Integration')
      .setDesc('Allow posting to Twitter/X when publishing content')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.twitter.enabled)
        .onChange(async (value) => {
          this.plugin.settings.twitter.enabled = value;
          await this.plugin.saveSettings();
          this.display(); // Refresh the settings UI
        }));

    if (this.plugin.settings.twitter.enabled) {
      // API Key
      new Setting(containerEl)
        .setName('Twitter API Key')
        .setDesc('Your Twitter API Key (also called Consumer Key)')
        .addText(text => {
          text.inputEl.type = 'password';
          text
            .setPlaceholder('Enter your API Key')
            .setValue(this.plugin.settings.twitter.apiKey)
            .onChange(async (value) => {
              this.plugin.settings.twitter.apiKey = value;
              await this.plugin.saveSettings();
            });
        });

      // API Secret
      new Setting(containerEl)
        .setName('Twitter API Secret')
        .setDesc('Your Twitter API Secret (also called Consumer Secret)')
        .addText(text => {
          text.inputEl.type = 'password';
          text
            .setPlaceholder('Enter your API Secret')
            .setValue(this.plugin.settings.twitter.apiSecret)
            .onChange(async (value) => {
              this.plugin.settings.twitter.apiSecret = value;
              await this.plugin.saveSettings();
            });
        });

      // Access Token
      new Setting(containerEl)
        .setName('Twitter Access Token')
        .setDesc('Your Twitter Access Token')
        .addText(text => {
          text.inputEl.type = 'password';
          text
            .setPlaceholder('Enter your Access Token')
            .setValue(this.plugin.settings.twitter.accessToken)
            .onChange(async (value) => {
              this.plugin.settings.twitter.accessToken = value;
              await this.plugin.saveSettings();
            });
        });

      // Access Token Secret
      new Setting(containerEl)
        .setName('Twitter Access Token Secret')
        .setDesc('Your Twitter Access Token Secret')
        .addText(text => {
          text.inputEl.type = 'password';
          text
            .setPlaceholder('Enter your Access Token Secret')
            .setValue(this.plugin.settings.twitter.accessTokenSecret)
            .onChange(async (value) => {
              this.plugin.settings.twitter.accessTokenSecret = value;
              await this.plugin.saveSettings();
            });
        });

      // Bearer Token
      new Setting(containerEl)
        .setName('Twitter Bearer Token')
        .setDesc('Your Twitter Bearer Token (for OAuth 2.0)')
        .addText(text => {
          text.inputEl.type = 'password';
          text
            .setPlaceholder('Enter your Bearer Token')
            .setValue(this.plugin.settings.twitter.bearerToken)
            .onChange(async (value) => {
              this.plugin.settings.twitter.bearerToken = value;
              await this.plugin.saveSettings();
            });
        });

      // Test Twitter Connection Button
      new Setting(containerEl)
        .setName('Test Twitter Connection')
        .setDesc('Test your Twitter API connection')
        .addButton(button => button
          .setButtonText('Test Connection')
          .onClick(async () => {
            const { twitter } = this.plugin.settings;
            if (!twitter.apiKey || !twitter.apiSecret || !twitter.accessToken || !twitter.accessTokenSecret || !twitter.bearerToken) {
              this.showNotice('Please configure all Twitter API credentials first', 'error');
              return;
            }

            button.setButtonText('Testing...');
            button.setDisabled(true);

            try {
              const { TwitterClient } = await import('./twitterClient');
              const client = new TwitterClient(twitter);
              const isConnected = await client.testConnection();
              
              if (isConnected) {
                this.showNotice('✅ Twitter connection successful!', 'success');
              } else {
                this.showNotice('❌ Twitter connection failed. Check your credentials.', 'error');
              }
            } catch (error) {
              this.showNotice(`❌ Twitter connection error: ${error.message}`, 'error');
            } finally {
              button.setButtonText('Test Connection');
              button.setDisabled(false);
            }
          }));

      // Auto-post to Twitter
      new Setting(containerEl)
        .setName('Auto-post to Twitter/X')
        .setDesc('Automatically post to Twitter when publishing to Microfeed')
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.twitter.autoPost)
          .onChange(async (value) => {
            this.plugin.settings.twitter.autoPost = value;
            await this.plugin.saveSettings();
          }));

      // Post Format
      new Setting(containerEl)
        .setName('Twitter Post Format')
        .setDesc('Choose how your content appears on Twitter')
        .addDropdown(dropdown => dropdown
          .addOption('title_only', 'Title only')
          .addOption('title_with_link', 'Title + Microfeed link')
          .addOption('title_with_summary', 'Title + Summary + Link')
          .setValue(this.plugin.settings.twitter.postFormat)
          .onChange(async (value: 'title_only' | 'title_with_link' | 'title_with_summary') => {
            this.plugin.settings.twitter.postFormat = value;
            await this.plugin.saveSettings();
          }));

      // Include Hashtags
      new Setting(containerEl)
        .setName('Include Hashtags')
        .setDesc('Include custom hashtags in Twitter posts')
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.twitter.includeHashtags)
          .onChange(async (value) => {
            this.plugin.settings.twitter.includeHashtags = value;
            await this.plugin.saveSettings();
          }));

      // Custom Hashtags
      new Setting(containerEl)
        .setName('Custom Hashtags')
        .setDesc('Comma-separated hashtags to include (e.g., #microfeed #blog)')
        .addText(text => text
          .setPlaceholder('#microfeed, #obsidian')
          .setValue(this.plugin.settings.twitter.customHashtags)
          .onChange(async (value) => {
            this.plugin.settings.twitter.customHashtags = value;
            await this.plugin.saveSettings();
          }));
    }

    // Help Section
    containerEl.createEl('h3', { text: 'Help' });
    
    const helpDiv = containerEl.createDiv();
    helpDiv.innerHTML = `
      <p><strong>How to use:</strong></p>
      <ol>
        <li>Configure your Microfeed API URL and API Key above</li>
        <li>Optional: Set up Twitter/X integration for automatic posting</li>
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
      
      <p><strong>Twitter/X Integration:</strong></p>
      <p>To set up Twitter/X posting:</p>
      <ol>
        <li>Go to <a href="https://developer.twitter.com">developer.twitter.com</a></li>
        <li>Create a new app and get your API credentials</li>
        <li>Enable OAuth 1.0a and OAuth 2.0 in your app settings</li>
        <li>Enter your credentials in the Twitter/X settings above</li>
        <li>Test the connection before enabling auto-posting</li>
      </ol>
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