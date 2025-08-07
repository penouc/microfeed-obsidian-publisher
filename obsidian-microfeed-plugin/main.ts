import { App, Editor, MarkdownView, Modal, Notice, Plugin, TFile } from 'obsidian';
import { MicrofeedSettings, MicrofeedSettingTab, DEFAULT_SETTINGS } from 'src/settings';
import { ContentParser } from 'src/contentParser';
import { ImageGenerator } from 'src/imageGenerator';
import { MicrofeedClient } from 'src/microfeedClient';
import { MicrofeedItem, ParsedContent, MediaFile } from 'src/types';

export default class MicrofeedPlugin extends Plugin {
  settings: MicrofeedSettings;
  public imageGenerator: ImageGenerator;

  async onload() {
    await this.loadSettings();

    this.imageGenerator = new ImageGenerator();

    // Add ribbon icon
    const ribbonIconEl = this.addRibbonIcon('upload', 'Publish to Microfeed', (evt: MouseEvent) => {
      this.publishCurrentNote();
    });
    ribbonIconEl.addClass('microfeed-ribbon-class');

    // Add command
    this.addCommand({
      id: 'publish-to-microfeed',
      name: 'Publish to Microfeed',
      callback: () => {
        this.publishCurrentNote();
      }
    });

    // Add command for publishing with custom settings
    this.addCommand({
      id: 'publish-to-microfeed-with-options',
      name: 'Publish to Microfeed with options',
      callback: () => {
        this.publishWithOptions();
      }
    });

    // Add command for generating magazine-style preview
    this.addCommand({
      id: 'generate-magazine-preview',
      name: 'Generate Magazine Style Preview',
      callback: () => {
        this.generateMagazinePreview();
      }
    });

    // Add command for testing all styles
    this.addCommand({
      id: 'test-all-magazine-styles',
      name: 'Test All Magazine Styles',
      callback: () => {
        this.testAllMagazineStyles();
      }
    });

    // Add settings tab
    this.addSettingTab(new MicrofeedSettingTab(this.app, this));
  }

  onunload() {
    // Clean up
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  private async publishCurrentNote() {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!activeView) {
      new Notice('No active markdown note found');
      return;
    }

    const file = activeView.file;
    if (!file) {
      new Notice('No file found');
      return;
    }

    await this.publishNote(file);
  }

  private async publishWithOptions() {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!activeView) {
      new Notice('No active markdown note found');
      return;
    }

    const file = activeView.file;
    if (!file) {
      new Notice('No file found');
      return;
    }

    new PublishOptionsModal(this.app, this, file).open();
  }

  private async generateMagazinePreview() {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!activeView) {
      new Notice('No active markdown note found');
      return;
    }

    const file = activeView.file;
    if (!file) {
      new Notice('No file found');
      return;
    }

    new MagazineStyleModal(this.app, this, file).open();
  }

  private async testAllMagazineStyles() {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!activeView) {
      new Notice('No active markdown note found');
      return;
    }

    const file = activeView.file;
    if (!file) {
      new Notice('No file found');
      return;
    }

    const notice = new Notice('正在生成所有风格的预览图片...', 0);
    
    try {
      // Read file content
      const content = await this.app.vault.read(file);
      const parsedContent = ContentParser.parseMarkdownContent(content, file.name);
      
      // Get all available styles
      const styles = this.imageGenerator.getAvailableStyles();
      
      // Generate images for all styles
      const results: { styleName: string; success: boolean; error?: string }[] = [];
      
      for (const style of styles.slice(0, 5)) { // 限制为前5种风格以避免过长的处理时间
        try {
          const imageBlob = await this.imageGenerator.generateWithStyle(
            parsedContent.title,
            parsedContent.content,
            style.id
          );
          
          // 可以选择保存到本地或展示
          results.push({ styleName: style.name, success: true });
          console.log(`Successfully generated style: ${style.name}`);
          
        } catch (error) {
          results.push({ 
            styleName: style.name, 
            success: false, 
            error: error.message 
          });
          console.error(`Failed to generate style ${style.name}:`, error);
        }
      }
      
      notice.hide();
      
      const successCount = results.filter(r => r.success).length;
      new Notice(`完成！成功生成 ${successCount}/${results.length} 种风格的图片`);
      
      // 显示详细结果
      console.log('Magazine style generation results:', results);
      
    } catch (error) {
      notice.hide();
      new Notice(`测试失败: ${error.message}`);
      console.error('Test all styles error:', error);
    }
  }

  async generateSpecificStyle(file: TFile, styleId: string): Promise<Blob> {
    const content = await this.app.vault.read(file);
    const parsedContent = ContentParser.parseMarkdownContent(content, file.name);
    
    return this.imageGenerator.generateWithStyle(
      parsedContent.title,
      parsedContent.content,
      styleId
    );
  }

  async publishNote(file: TFile, customOptions?: Partial<MicrofeedItem>): Promise<void> {
    // Validate settings
    if (!this.settings.apiUrl || !this.settings.apiKey) {
      new Notice('Please configure API URL and API Key in settings');
      return;
    }

    const publishNotice = new Notice('Publishing to Microfeed...', 0);

    try {
      // Read file content
      const content = await this.app.vault.read(file);
      
      // Parse markdown content
      const parsedContent = ContentParser.parseMarkdownContent(content, file.name);
      
      // Create Microfeed client
      const client = new MicrofeedClient(this.settings.apiUrl, this.settings.apiKey);
      
      // Build the item
      const item = await this.buildMicrofeedItem(parsedContent, client, file, customOptions);
      
      // Publish to Microfeed
      const result = await client.createItem(item);
      
      publishNotice.hide();
      new Notice('✅ Successfully published to Microfeed!');
      
      console.log('Published item:', result);
      
    } catch (error) {
      publishNotice.hide();
      new Notice(`❌ Failed to publish: ${error.message}`);
      console.error('Publish error:', error);
    }
  }

  private async buildMicrofeedItem(
    parsedContent: ParsedContent, 
    client: MicrofeedClient, 
    file: TFile,
    customOptions?: Partial<MicrofeedItem>
  ): Promise<MicrofeedItem> {
    const item: MicrofeedItem = {
      title: parsedContent.title,
      status: customOptions?.status || parsedContent.frontMatter.status || this.settings.defaultStatus,
      content_html: this.markdownToHtml(parsedContent.content),
      date_published_ms: Date.now(),
    };

    // Handle main attachment and images
    const mainAttachment = ContentParser.selectMainAttachment(parsedContent.mediaFiles);
    if (mainAttachment) {
      await this.processMainAttachment(item, mainAttachment, client, file);
      
      // If the main attachment is an image, also set it as the item's image
      if (mainAttachment.type === 'image' && item.attachment?.url) {
        item.image = item.attachment.url;
        console.log('📸 Using main attachment image as item image');
      }
    }

    // Process additional images that might be used as the main image
    await this.processDocumentImages(item, parsedContent, client, file);

    // Handle image generation if no image and auto-generate is enabled
    if (!item.image && this.settings.autoGenerateImage) {
      await this.generateAndUploadImage(item, parsedContent, client);
    }

    // Add iTunes metadata from front matter
    if (Object.keys(parsedContent.frontMatter).some(key => key.startsWith('itunes:'))) {
      item._microfeed = {};
      
      const itunesFields = [
        'itunes:title', 'itunes:block', 'itunes:episodeType', 
        'itunes:season', 'itunes:episode', 'itunes:explicit'
      ];
      
      for (const field of itunesFields) {
        if (parsedContent.frontMatter[field] !== undefined) {
          (item._microfeed as any)[field] = parsedContent.frontMatter[field];
        }
      }
    }

    // Apply custom options
    if (customOptions) {
      Object.assign(item, customOptions);
    }

    return item;
  }

  private async processMainAttachment(
    item: MicrofeedItem, 
    mediaFile: MediaFile, 
    client: MicrofeedClient, 
    file: TFile
  ): Promise<void> {
    if (mediaFile.type === 'external_url') {
      item.attachment = {
        category: 'external_url',
        url: mediaFile.url,
      };
      return;
    }

    // For local files, we need to read and upload them
    const mediaPath = this.resolveMediaPath(mediaFile.url, file);
    const mediaFile_obj = await this.getFileFromPath(mediaPath);
    
    if (mediaFile_obj) {
      const fileName = mediaFile_obj.name;
      const mediaUrl = await client.uploadMediaFile(
        await this.app.vault.readBinary(mediaFile_obj) as any, 
        mediaFile.type, 
        fileName
      );
      
      item.attachment = {
        category: mediaFile.type,
        url: mediaUrl,
        mime_type: client.getMimeType(fileName, mediaFile.type),
        size_in_bytes: (await this.app.vault.readBinary(mediaFile_obj)).byteLength,
      };

      // Add duration for audio/video
      if (mediaFile.type === 'audio' || mediaFile.type === 'video') {
        const blob = new Blob([await this.app.vault.readBinary(mediaFile_obj)]);
        const duration = await client.getMediaDuration(new File([blob], fileName));
        if (duration) {
          item.attachment.duration_in_seconds = duration;
        }
      }
    }
  }

  private async processDocumentImages(
    item: MicrofeedItem,
    parsedContent: ParsedContent,
    client: MicrofeedClient,
    file: TFile
  ): Promise<void> {
    // Find the first image in the document that could be used as the main image
    const imageFiles = parsedContent.mediaFiles.filter(f => f.type === 'image');
    
    if (imageFiles.length > 0 && !item.image) {
      const firstImage = imageFiles[0];
      
      if (firstImage.type === 'external_url') {
        // External image URL
        item.image = firstImage.url;
        console.log('🖼️ Using external image as item image:', firstImage.url);
      } else {
        // Local image file - need to upload
        const mediaPath = this.resolveMediaPath(firstImage.url, file);
        const mediaFile_obj = await this.getFileFromPath(mediaPath);
        
        if (mediaFile_obj) {
          try {
            console.log('📤 Uploading document image to R2...');
            const fileName = mediaFile_obj.name;
            const mediaUrl = await client.uploadMediaFile(
              await this.app.vault.readBinary(mediaFile_obj) as any,
              'image',
              fileName
            );
            
            item.image = mediaUrl;
            console.log('✅ Successfully uploaded document image:', mediaUrl);
          } catch (error) {
            console.warn('⚠️ Failed to upload document image:', error);
          }
        }
      }
    }

    // Process all other images in the document and update content HTML
    await this.processContentImages(item, parsedContent, client, file);
  }

  private async processContentImages(
    item: MicrofeedItem,
    parsedContent: ParsedContent,
    client: MicrofeedClient,
    file: TFile
  ): Promise<void> {
    // Find all local images in content that need to be uploaded
    const localImages = parsedContent.mediaFiles.filter(f => 
      f.type === 'image' && !f.url.startsWith('http')
    );

    if (localImages.length === 0) {
      return;
    }

    console.log(`📷 Found ${localImages.length} local images to process in content`);

    let updatedContent = item.content_html || '';

    for (const imageFile of localImages) {
      const mediaPath = this.resolveMediaPath(imageFile.url, file);
      const mediaFile_obj = await this.getFileFromPath(mediaPath);
      
      if (mediaFile_obj) {
        try {
          const fileName = mediaFile_obj.name;
          const mediaUrl = await client.uploadMediaFile(
            await this.app.vault.readBinary(mediaFile_obj) as any,
            'image',
            fileName
          );
          
          // Replace the local image path with the uploaded URL in content
          updatedContent = updatedContent.replace(
            new RegExp(this.escapeRegExp(imageFile.url), 'g'),
            mediaUrl
          );
          
          console.log(`✅ Replaced image ${imageFile.url} with ${mediaUrl}`);
        } catch (error) {
          console.warn(`⚠️ Failed to upload content image ${imageFile.url}:`, error);
        }
      }
    }

    // Update the content HTML
    item.content_html = updatedContent;
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private async generateAndUploadImage(
    item: MicrofeedItem, 
    parsedContent: ParsedContent, 
    client: MicrofeedClient
  ): Promise<void> {
    try {
      console.log('🎨 Starting magazine-style image generation with QR code...');
      console.log(`📝 Title: ${parsedContent.title.substring(0, 50)}...`);
      
      // 使用新的时尚杂志风格生成器（包含二维码）
      const imageBlob = await this.imageGenerator.generateRandomStyle(
        parsedContent.title, 
        parsedContent.content
      );
      
      const fileName = `magazine-style-${Date.now()}.png`;
      const imageUrl = await client.uploadMediaFile(imageBlob, 'image', fileName);
      
      item.image = imageUrl;
      
      console.log('✅ Successfully generated and uploaded magazine-style image with QR code');
      console.log(`📸 Image URL: ${imageUrl}`);
    } catch (error) {
      console.warn('⚠️ Magazine-style generation failed, trying fallback:', error);
      
      // 回退到基础生成方法
      try {
        console.log('🔄 Using fallback image generation (Bento style)...');
        const imageBlob = await this.imageGenerator.generateThumbnail(
          parsedContent.title, 
          parsedContent.content
        );
        
        const fileName = `fallback-${Date.now()}.png`;
        const imageUrl = await client.uploadMediaFile(imageBlob, 'image', fileName);
        
        item.image = imageUrl;
        console.log('✅ Fallback image generation successful');
        console.log(`📸 Fallback Image URL: ${imageUrl}`);
      } catch (fallbackError) {
        console.error('❌ Both magazine-style and fallback image generation failed:', fallbackError);
        console.error('📋 Error details:', fallbackError.message);
      }
    }
  }

  private resolveMediaPath(mediaUrl: string, currentFile: TFile): string {
    if (mediaUrl.startsWith('http')) {
      return mediaUrl; // External URL
    }
    
    // Resolve relative path
    const currentDir = currentFile.parent?.path || '';
    if (mediaUrl.startsWith('./')) {
      return `${currentDir}/${mediaUrl.slice(2)}`;
    } else if (mediaUrl.startsWith('../')) {
      // Handle relative paths
      const parts = currentDir.split('/');
      const urlParts = mediaUrl.split('/');
      let i = 0;
      while (urlParts[i] === '..' && i < urlParts.length) {
        parts.pop();
        i++;
      }
      return `${parts.join('/')}/${urlParts.slice(i).join('/')}`;
    } else {
      return mediaUrl; // Assume it's a vault-relative path
    }
  }

  private async getFileFromPath(path: string): Promise<TFile | null> {
    if (path.startsWith('http')) {
      return null; // External URLs can't be read as files
    }
    
    const file = this.app.vault.getAbstractFileByPath(path);
    return file instanceof TFile ? file : null;
  }

  private markdownToHtml(markdown: string): string {
    // Simple markdown to HTML conversion
    // In a real implementation, you might want to use a library like marked
    return markdown
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.+)$/gm, '<p>$1</p>')
      .replace(/<p><h([1-6])>/g, '<h$1>')
      .replace(/<\/h([1-6])><\/p>/g, '</h$1>');
  }
}

class PublishOptionsModal extends Modal {
  plugin: MicrofeedPlugin;
  file: TFile;
  status: 'published' | 'unpublished' | 'unlisted' = 'published';

  constructor(app: App, plugin: MicrofeedPlugin, file: TFile) {
    super(app);
    this.plugin = plugin;
    this.file = file;
    this.status = plugin.settings.defaultStatus;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl('h2', { text: 'Publish Options' });

    // Status selector
    const statusContainer = contentEl.createDiv();
    statusContainer.createEl('label', { text: 'Publication Status:' });
    
    const statusSelect = statusContainer.createEl('select');
    ['published', 'unlisted', 'unpublished'].forEach(status => {
      const option = statusSelect.createEl('option', { 
        text: status.charAt(0).toUpperCase() + status.slice(1),
        value: status 
      });
      if (status === this.status) {
        option.selected = true;
      }
    });

    statusSelect.addEventListener('change', (e) => {
      this.status = (e.target as HTMLSelectElement).value as any;
    });

    // Buttons
    const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });
    
    const cancelButton = buttonContainer.createEl('button', { text: 'Cancel' });
    cancelButton.addEventListener('click', () => this.close());
    
    const publishButton = buttonContainer.createEl('button', { 
      text: 'Publish',
      cls: 'mod-cta'
    });
    publishButton.addEventListener('click', async () => {
      this.close();
      await this.plugin.publishNote(this.file, { status: this.status });
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

class MagazineStyleModal extends Modal {
  plugin: MicrofeedPlugin;
  file: TFile;
  selectedStyleId: string = '';
  previewContainer: HTMLElement;

  constructor(app: App, plugin: MicrofeedPlugin, file: TFile) {
    super(app);
    this.plugin = plugin;
    this.file = file;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('magazine-style-modal');

    contentEl.createEl('h2', { text: '杂志风格预览器' });
    contentEl.createEl('p', { text: '选择一种设计风格来预览您的内容' });

    // Style selector
    const selectorContainer = contentEl.createDiv({ cls: 'style-selector-container' });
    selectorContainer.createEl('label', { text: '选择设计风格:' });
    
    const styleSelect = selectorContainer.createEl('select', { cls: 'style-select' });
    const randomOption = styleSelect.createEl('option', { 
      text: '🎲 随机风格',
      value: 'random' 
    });
    randomOption.selected = true;
    
    // Add all available styles
    const styles = this.plugin.imageGenerator.getAvailableStyles();
    styles.forEach(style => {
      styleSelect.createEl('option', { 
        text: `${this.getStyleEmoji(style.id)} ${style.name}`,
        value: style.id 
      });
    });

    styleSelect.addEventListener('change', (e) => {
      this.selectedStyleId = (e.target as HTMLSelectElement).value;
    });

    // Preview container
    this.previewContainer = contentEl.createDiv({ cls: 'preview-container' });
    this.previewContainer.innerHTML = '<p>点击"生成预览"来查看效果</p>';

    // Buttons
    const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });
    
    const previewButton = buttonContainer.createEl('button', { 
      text: '生成预览',
      cls: 'mod-cta'
    });
    previewButton.addEventListener('click', () => this.generatePreview());

    const randomButton = buttonContainer.createEl('button', { text: '随机生成' });
    randomButton.addEventListener('click', () => {
      styleSelect.value = 'random';
      this.selectedStyleId = 'random';
      this.generatePreview();
    });
    
    const closeButton = buttonContainer.createEl('button', { text: '关闭' });
    closeButton.addEventListener('click', () => this.close());

    // Add some styling
    const style = document.createElement('style');
    style.textContent = `
      .magazine-style-modal {
        min-width: 600px;
        max-width: 800px;
      }
      .style-selector-container {
        margin: 20px 0;
      }
      .style-select {
        width: 100%;
        padding: 8px;
        margin-top: 5px;
        border-radius: 4px;
        border: 1px solid var(--background-modifier-border);
      }
      .preview-container {
        margin: 20px 0;
        padding: 20px;
        border: 1px solid var(--background-modifier-border);
        border-radius: 8px;
        min-height: 200px;
        background: var(--background-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
      }
      .preview-image {
        max-width: 100%;
        max-height: 400px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      .modal-button-container {
        display: flex;
        gap: 10px;
        margin-top: 20px;
      }
      .loading-spinner {
        border: 3px solid var(--background-modifier-border);
        border-top: 3px solid var(--interactive-accent);
        border-radius: 50%;
        width: 30px;
        height: 30px;
        animation: spin 1s linear infinite;
        margin: 0 auto;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  private getStyleEmoji(styleId: string): string {
    const emojiMap: { [key: string]: string } = {
      'minimalist': '⚪',
      'bold-modern': '⚡',
      'elegant-vintage': '🎭',
      'futuristic-tech': '🚀',
      'scandinavian': '❄️',
      'art-deco': '💎',
      'japanese-minimalism': '🎋',
      'postmodern-deconstruction': '🧩',
      'punk': '🎸',
      'british-rock': '🇬🇧',
      'black-metal': '⚫',
      'memphis-design': '🌈',
      'cyberpunk': '🔮',
      'pop-art': '🎨',
      'deconstructed-swiss': '🏔️',
      'vaporwave': '🌸',
      'neo-expressionism': '🎭',
      'extreme-minimalism': '⬜',
      'neo-futurism': '✨',
      'surrealist-collage': '🎪',
      'neo-baroque': '👑',
      'liquid-morphism': '💧',
      'hypersensory-minimalism': '🔍',
      'neo-expressionist-data': '📊',
      'victorian': '🏛️',
      'bauhaus': '🔺',
      'constructivism': '🔴',
      'german-expressionism': '🎬'
    };
    return emojiMap[styleId] || '🎨';
  }

  private async generatePreview() {
    const loadingEl = this.previewContainer;
    loadingEl.innerHTML = '<div class="loading-spinner"></div><p>正在生成预览...</p>';

    try {
      const styleId = this.selectedStyleId === 'random' ? undefined : this.selectedStyleId;
      const imageBlob = await this.plugin.generateSpecificStyle(this.file, styleId || '');
      
      // Convert blob to data URL for display
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        loadingEl.innerHTML = `
          <img src="${imageUrl}" alt="Magazine Style Preview" class="preview-image" />
          <div style="margin-top: 10px; font-size: 12px; color: var(--text-muted);">
            风格: ${this.getSelectedStyleName()}
          </div>
        `;
      };
      reader.readAsDataURL(imageBlob);
      
    } catch (error) {
      loadingEl.innerHTML = `<p style="color: var(--text-error);">生成预览失败: ${error.message}</p>`;
      console.error('Preview generation failed:', error);
    }
  }

  private getSelectedStyleName(): string {
    if (this.selectedStyleId === 'random' || !this.selectedStyleId) {
      return '随机风格';
    }
    
    const styles = this.plugin.imageGenerator.getAvailableStyles();
    const style = styles.find(s => s.id === this.selectedStyleId);
    return style ? style.name : '未知风格';
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
    
    // Remove the added styles
    const styleEl = document.querySelector('style[data-magazine-modal]');
    if (styleEl) {
      styleEl.remove();
    }
  }
}