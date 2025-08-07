import { ParsedContent, MediaFile } from './types';

export class ContentParser {
  private static readonly MEDIA_EXTENSIONS = {
    audio: ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac'],
    video: ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'],
    image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    document: ['.pdf', '.doc', '.docx', '.txt', '.rtf']
  };

  static parseMarkdownContent(content: string, fileName: string): ParsedContent {
    const lines = content.split('\n');
    let frontMatterEnd = 0;
    let frontMatter: Record<string, any> = {};
    
    // Parse front matter if it exists
    if (lines[0].trim() === '---') {
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '---') {
          frontMatterEnd = i + 1;
          break;
        }
      }
      
      if (frontMatterEnd > 0) {
        const frontMatterContent = lines.slice(1, frontMatterEnd - 1).join('\n');
        frontMatter = this.parseFrontMatter(frontMatterContent);
      }
    }

    const bodyContent = lines.slice(frontMatterEnd).join('\n');
    const title = frontMatter.title || this.extractTitleFromContent(bodyContent) || fileName.replace(/\.md$/, '');
    
    // Extract media files from markdown
    const mediaFiles = this.extractMediaFiles(bodyContent);
    
    // Clean content by removing media links that will be used as attachments
    const cleanContent = this.cleanContent(bodyContent, mediaFiles);

    return {
      title,
      content: cleanContent,
      mediaFiles,
      frontMatter
    };
  }

  private static parseFrontMatter(content: string): Record<string, any> {
    const frontMatter: Record<string, any> = {};
    const lines = content.split('\n');
    
    for (const line of lines) {
      const match = line.match(/^([^:]+):\\s*(.*)$/);
      if (match) {
        const [, key, value] = match;
        frontMatter[key.trim()] = this.parseYamlValue(value.trim());
      }
    }
    
    return frontMatter;
  }

  private static parseYamlValue(value: string): any {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value.match(/^\d+$/)) return parseInt(value);
    if (value.match(/^\d+\.\d+$/)) return parseFloat(value);
    if (value.startsWith('"') && value.endsWith('"')) return value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1);
    return value;
  }

  private static extractTitleFromContent(content: string): string | null {
    const match = content.match(/^#\\s+(.+)$/m);
    return match ? match[1].trim() : null;
  }

  private static extractMediaFiles(content: string): MediaFile[] {
    const mediaFiles: MediaFile[] = [];
    
    // Match markdown links and images
    const linkRegex = /!?\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    
    while ((match = linkRegex.exec(content)) !== null) {
      const [fullMatch, alt, url] = match;
      const isImage = fullMatch.startsWith('!');
      
      if (this.isExternalUrl(url)) {
        // External URL
        mediaFiles.push({
          type: 'external_url',
          url,
          title: alt || undefined,
        });
      } else {
        // Local file - determine type by extension
        const mediaType = this.getMediaType(url);
        if (mediaType) {
          mediaFiles.push({
            type: mediaType,
            url,
            title: alt || undefined,
          });
        }
      }
    }

    // Also look for bare URLs that might be media
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
    while ((match = urlRegex.exec(content)) !== null) {
      const url = match[0];
      const mediaType = this.getMediaType(url);
      if (mediaType && !mediaFiles.some(f => f.url === url)) {
        mediaFiles.push({
          type: mediaType,
          url,
        });
      }
    }

    return mediaFiles;
  }

  private static isExternalUrl(url: string): boolean {
    return url.startsWith('http://') || url.startsWith('https://');
  }

  private static getMediaType(url: string): 'audio' | 'video' | 'image' | 'document' | null {
    const lowerUrl = url.toLowerCase();
    
    for (const [type, extensions] of Object.entries(this.MEDIA_EXTENSIONS)) {
      if (extensions.some(ext => lowerUrl.includes(ext))) {
        return type as 'audio' | 'video' | 'image' | 'document';
      }
    }
    
    return null;
  }

  private static cleanContent(content: string, mediaFiles: MediaFile[]): string {
    let cleanedContent = content;
    
    // Remove media files that will be used as main attachments
    for (const mediaFile of mediaFiles) {
      if (mediaFile.type !== 'external_url') {
        // Remove markdown image/link syntax for local files
        const escapedUrl = mediaFile.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        cleanedContent = cleanedContent.replace(
          new RegExp(`!?\\[([^\\]]*)\\]\\(${escapedUrl}\\)`, 'g'),
          ''
        );
      }
    }
    
    return cleanedContent.trim();
  }

  static selectMainAttachment(mediaFiles: MediaFile[]): MediaFile | null {
    // Priority: audio > video > image > document > external_url
    const priorities = ['audio', 'video', 'image', 'document', 'external_url'];
    
    for (const priority of priorities) {
      const file = mediaFiles.find(f => f.type === priority);
      if (file) return file;
    }
    
    return null;
  }
}