import { ParsedContent, MediaFile } from './types';
import { MicrofeedClient } from './microfeedClient';
import { TFile, Vault } from 'obsidian';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import { visit } from 'unist-util-visit';
import type { Image } from 'mdast';

export class ContentParser {
  private static readonly MEDIA_EXTENSIONS = {
    audio: ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac'],
    video: ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'],
    image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    document: ['.pdf', '.doc', '.docx', '.txt', '.rtf']
  };

  static parseMarkdownContent(content: string, fileName: string): ParsedContent {
    console.log('🔧 Parsing markdown content with remark...');
    console.log('📄 File name:', fileName);
    console.log('📐 Content length:', content.length, 'characters');
    
    try {
      // Parse markdown using remark
      const tree = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkFrontmatter, ['yaml', 'toml'])
        .parse(content);

      console.log('🌳 Parsed AST structure:');
      console.log(JSON.stringify(tree, null, 2));

      let frontMatter: Record<string, any> = {};
      let title = '';
      const mediaFiles: MediaFile[] = [];

      // Extract frontmatter
      visit(tree, 'yaml', (node: any) => {
        console.log('📋 Found YAML frontmatter:', node.value);
        try {
          const yamlLines = node.value.split('\n');
          for (const line of yamlLines) {
            const match = line.match(/^([^:]+):\s*(.*)$/);
            if (match) {
              const [, key, value] = match;
              frontMatter[key.trim()] = this.parseYamlValue(value.trim());
            }
          }
          console.log('✅ Parsed frontmatter:', frontMatter);
        } catch (error) {
          console.warn('⚠️ Failed to parse YAML frontmatter:', error);
        }
      });

      // Extract title from frontmatter or first heading
      if (frontMatter.title) {
        title = frontMatter.title;
        console.log('📌 Title from frontmatter:', title);
      } else {
        visit(tree, 'heading', (node: any) => {
          if (node.depth === 1 && !title) {
            // Extract text from heading children
            const headingText = this.extractTextFromNodes(node.children);
            title = headingText;
            console.log('📌 Title from H1 heading:', title);
            return false; // Stop visiting after first h1
          }
        });
      }

      // Fallback to filename if no title found
      if (!title) {
        title = fileName.replace(/\.md$/, '');
        console.log('📌 Title from filename:', title);
      }

      // Extract media files (images, links to media)
      visit(tree, 'image', (node: any) => {
        const mediaType = this.getMediaType(node.url);
        if (mediaType) {
          const mediaFile: MediaFile = {
            type: mediaType,
            url: node.url,
            title: node.alt || undefined,
          };
          mediaFiles.push(mediaFile);
          console.log(`🖼️ Found standard image: "${node.url}" (alt: "${node.alt}", type: ${mediaType})`);
        }
      });

      // Also extract Obsidian WikiLink images from text content
      // Pattern: ![[filename]] or ![[filename|alt text]]
      const wikiLinkPattern = /!\[\[([^\]|]+)(\|([^\]]+))?\]\]/g;
      let wikiMatch;
      while ((wikiMatch = wikiLinkPattern.exec(content)) !== null) {
        const [fullMatch, filename, , altText] = wikiMatch;
        const mediaType = this.getMediaType(filename);
        if (mediaType) {
          const mediaFile: MediaFile = {
            type: mediaType,
            url: filename, // Use filename as URL for WikiLinks
            title: altText || undefined,
          };
          mediaFiles.push(mediaFile);
          console.log(`🔗 Found WikiLink image: "${filename}" (alt: "${altText || ''}", type: ${mediaType}, full: "${fullMatch}")`);
        }
      }

      // Extract links that might be media files
      visit(tree, 'link', (node: any) => {
        const mediaType = this.getMediaType(node.url);
        if (mediaType) {
          const linkText = this.extractTextFromNodes(node.children);
          const mediaFile: MediaFile = {
            type: mediaType,
            url: node.url,
            title: linkText || undefined,
          };
          mediaFiles.push(mediaFile);
          console.log(`🔗 Found media link: "${node.url}" (text: "${linkText}", type: ${mediaType})`);
        }
      });

      // Extract text content (remove frontmatter and media references)
      const contentTree = structuredClone(tree);
      
      // Remove frontmatter nodes
      contentTree.children = contentTree.children.filter((node: any) => 
        node.type !== 'yaml' && node.type !== 'toml'
      );

      // Convert back to markdown for content
      const cleanContent = unified()
        .use(remarkStringify, {
          bullet: '-',
          fences: true,
          incrementListMarker: false,
        })
        .stringify(contentTree);

      console.log('📊 Parsing results:');
      console.log('  📌 Title:', title);
      console.log('  📋 Frontmatter keys:', Object.keys(frontMatter));
      console.log('  🎬 Media files found:', mediaFiles.length);
      console.log('  📝 Content length:', cleanContent.length, 'characters');

      return {
        title,
        content: this.cleanContent(cleanContent, mediaFiles),
        mediaFiles,
        frontMatter
      };

    } catch (error) {
      console.error('❌ Error parsing with remark, falling back to regex:', error);
      return this.parseMarkdownContentRegex(content, fileName);
    }
  }

  /**
   * Fallback regex-based parsing (original method)
   */
  private static parseMarkdownContentRegex(content: string, fileName: string): ParsedContent {
    console.log('🔄 Using regex fallback for markdown parsing...');
    
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

  /**
   * Extract text content from AST nodes
   */
  private static extractTextFromNodes(nodes: any[]): string {
    if (!nodes) return '';
    
    return nodes.map(node => {
      if (node.type === 'text') {
        return node.value;
      } else if (node.children) {
        return this.extractTextFromNodes(node.children);
      }
      return '';
    }).join('');
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
    
    console.log(`🔍 Extracting media files from content (${content.length} characters)`);
    
    // Match markdown links and images
    const linkRegex = /!?\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    
    while ((match = linkRegex.exec(content)) !== null) {
      const [fullMatch, alt, url] = match;
      const isImage = fullMatch.startsWith('!');
      
      console.log(`📋 Found markdown link: "${fullMatch}" -> URL: "${url}", isImage: ${isImage}`);
      
      if (this.isExternalUrl(url)) {
        // External URL
        mediaFiles.push({
          type: 'external_url',
          url,
          title: alt || undefined,
        });
        console.log(`🌐 Added external URL: ${url}`);
      } else {
        // Local file - determine type by extension
        const mediaType = this.getMediaType(url);
        console.log(`📄 Local file "${url}" detected as type: ${mediaType}`);
        if (mediaType) {
          mediaFiles.push({
            type: mediaType,
            url,
            title: alt || undefined,
          });
          console.log(`📎 Added local media file: ${url} (${mediaType})`);
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

  /**
   * Process markdown content by uploading local images and replacing their paths with remote URLs
   */
  static async processLocalImages(content: string, vault: Vault, microfeedClient: MicrofeedClient, basePath: string): Promise<string> {
    console.log('🔄 Processing local images in markdown content using remark...');
    
    try {
      // Parse markdown using remark
      const tree = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkFrontmatter)
        .parse(content);

      // Extract all images from the AST
      const allImages: Array<{alt: string, url: string, node?: Image, isWikiLink?: boolean, fullMatch?: string}> = [];
      
      // Standard markdown images
      visit(tree, 'image', (node: Image) => {
        allImages.push({
          alt: node.alt || '',
          url: node.url,
          node: node,
          isWikiLink: false
        });
      });

      // Obsidian WikiLink images
      const wikiLinkPattern = /!\[\[([^\]|]+)(\|([^\]]+))?\]\]/g;
      let wikiMatch;
      while ((wikiMatch = wikiLinkPattern.exec(content)) !== null) {
        const [fullMatch, filename, , altText] = wikiMatch;
        const mediaType = this.getMediaType(filename);
        if (mediaType) {
          allImages.push({
            alt: altText || '',
            url: filename,
            isWikiLink: true,
            fullMatch: fullMatch
          });
        }
      }

      // Log all found images
      console.log('📋 Found images in markdown using remark:');
      if (allImages.length === 0) {
        console.log('   No images found');
        return content;
      }

      allImages.forEach((img, index) => {
        const isLocal = !this.isExternalUrl(img.url);
        const type = isLocal ? '📁 LOCAL' : '🌐 REMOTE';
        const format = img.isWikiLink ? 'WikiLink' : 'Standard';
        console.log(`   ${index + 1}. ${type} (${format}): "${img.url}" (alt: "${img.alt}")`);
      });

      const processedImages: Set<string> = new Set();
      const urlReplacements: Map<string, string> = new Map();

      // Process each local image
      for (const imageInfo of allImages) {
        const { url: imagePath, isWikiLink, fullMatch } = imageInfo;
        
        // Skip if already processed or if it's an external URL
        if (processedImages.has(imagePath) || this.isExternalUrl(imagePath)) {
          continue;
        }
        
        console.log(`📸 Processing local image: ${imagePath}`);
        console.log(`📂 Base path: ${basePath}`);
        console.log(`🔗 Is WikiLink: ${isWikiLink}`);
        
        try {
          let resolvedPath: string;
          
          if (isWikiLink) {
            // For WikiLinks, try the filename directly first
            resolvedPath = imagePath;
            console.log(`🔍 WikiLink resolved path: ${resolvedPath}`);
          } else {
            // For standard markdown, resolve relative path
            resolvedPath = this.resolveImagePath(imagePath, basePath);
            console.log(`🔍 Standard resolved path: ${resolvedPath}`);
          }
          
          // Check if file exists in vault - try multiple possible paths
          let file = vault.getAbstractFileByPath(resolvedPath);
          console.log(`📁 File exists at resolved path: ${!!file}`);
          
          // If not found, try some alternative paths
          if (!file) {
            let alternativePaths: string[] = [];
            
            if (isWikiLink) {
              // For WikiLinks, search in common attachment folders
              alternativePaths = [
                `attachments/${imagePath}`,
                `assets/${imagePath}`,
                `images/${imagePath}`,
                `files/${imagePath}`,
                `.obsidian/plugins/obsidian-microfeed-plugin/${imagePath}`, // Plugin folder
                imagePath.replace(/\s+/g, '%20'), // URL encode spaces
                imagePath.replace(/\s+/g, '_'), // Replace spaces with underscores
                imagePath.replace(/\s+/g, '-'), // Replace spaces with dashes
              ];
            } else {
              // For standard markdown images
              alternativePaths = [
                imagePath, // Try the original path as-is
                imagePath.startsWith('./') ? imagePath.substring(2) : imagePath, // Remove ./
                imagePath.startsWith('../') ? imagePath : `../${imagePath}`, // Try with ../
              ];
            }
            
            console.log(`❓ File not found at resolved path, trying ${alternativePaths.length} alternatives...`);
            for (const altPath of alternativePaths) {
              console.log(`🔍 Trying alternative path: "${altPath}"`);
              file = vault.getAbstractFileByPath(altPath);
              if (file) {
                console.log(`✅ Found file at alternative path: "${altPath}"`);
                resolvedPath = altPath; // Update resolved path for later use
                break;
              }
            }
          }
          
          // Last resort: search all files in vault by name
          if (!file && isWikiLink) {
            console.log(`🔍 Last resort: searching entire vault for file named "${imagePath}"`);
            const allFiles = vault.getFiles();
            file = allFiles.find((f: TFile) => f.name === imagePath);
            if (file) {
              console.log(`✅ Found file in vault: ${file.path}`);
              resolvedPath = file.path;
            }
          }
          
          if (!file || !(file instanceof TFile)) {
            console.warn(`⚠️ Image file not found after trying all methods:`);
            console.warn(`   Original: "${imagePath}"`);
            console.warn(`   Resolved: "${resolvedPath}"`);
            console.warn(`   Base: "${basePath}"`);
            console.warn(`   Is WikiLink: ${isWikiLink}`);
            
            // List some files in the vault for debugging
            if (isWikiLink) {
              const allFiles = vault.getFiles().filter((f: TFile) => f.name.toLowerCase().includes('image') || f.name.toLowerCase().includes('pasted'));
              console.warn(`   Similar files in vault:`, allFiles.slice(0, 10).map((f: TFile) => `"${f.name}" (${f.path})`));
            } else {
              // List files in the directory for debugging
              const baseDir = basePath.split('/').slice(0, -1).join('/');
              const parentFolder = vault.getAbstractFileByPath(baseDir || '.');
              if (parentFolder && 'children' in parentFolder) {
                const children = (parentFolder as any).children || [];
                console.warn(`   Available files in ${baseDir || 'root'}:`, 
                  children.map((f: any) => f.name).join(', '));
              }
            }
            continue;
          }
          
          // Read file data
          const fileData = await vault.readBinary(file);
          const blob = new Blob([fileData], { type: this.getImageMimeType(file.name) });
          
          console.log(`📤 Uploading image: ${file.name} (${blob.size} bytes)`);
          
          // Upload to Microfeed
          const remoteUrl = await microfeedClient.uploadMediaFile(blob, 'image', file.name);
          
          console.log(`✅ Image uploaded successfully!`);
          console.log(`📍 Original path: ${imagePath}`);
          console.log(`🌐 Remote URL: ${remoteUrl}`);
          
          // Store the replacement
          if (isWikiLink && fullMatch) {
            urlReplacements.set(fullMatch, `![${imageInfo.alt}](${remoteUrl})`);
            console.log(`📝 WikiLink replacement: "${fullMatch}" → "![${imageInfo.alt}](${remoteUrl})"`);
          } else {
            urlReplacements.set(imagePath, remoteUrl);
          }
          processedImages.add(imagePath);
          
        } catch (error) {
          console.error(`❌ Failed to upload image ${imagePath}:`, error);
          // Continue processing other images even if one fails
        }
      }

      // Update all image URLs in the AST (for standard markdown images)
      visit(tree, 'image', (node: Image) => {
        const replacement = urlReplacements.get(node.url);
        if (replacement) {
          console.log(`🔄 Updating AST: ${node.url} → ${replacement}`);
          node.url = replacement;
        }
      });

      // Convert AST back to markdown
      let processedContent = unified()
        .use(remarkStringify, {
          bullet: '-',
          fences: true,
          incrementListMarker: false,
        })
        .stringify(tree);

      // Handle WikiLink replacements (not handled by AST)
      for (const [wikiLink, replacement] of urlReplacements) {
        if (wikiLink.startsWith('![[')) {
          console.log(`🔄 Replacing WikiLink in content: ${wikiLink} → ${replacement}`);
          processedContent = processedContent.replace(wikiLink, replacement);
        }
      }

      console.log(`✨ Finished processing images using remark. Processed ${processedImages.size} images.`);
      return processedContent;
      
    } catch (error) {
      console.error('❌ Error processing markdown with remark:', error);
      console.log('🔄 Falling back to regex-based processing...');
      // Fallback to original regex method if remark fails
      return this.processLocalImagesRegex(content, vault, microfeedClient, basePath);
    }
  }

  /**
   * Fallback regex-based image processing (original method)
   */
  private static async processLocalImagesRegex(content: string, vault: Vault, microfeedClient: MicrofeedClient, basePath: string): Promise<string> {
    console.log('🔄 Using regex fallback for image processing...');
    
    let processedContent = content;
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    const processedImages: Set<string> = new Set();

    while ((match = imageRegex.exec(content)) !== null) {
      const [, alt, imagePath] = match;
      
      if (processedImages.has(imagePath) || this.isExternalUrl(imagePath)) {
        continue;
      }
      
      try {
        const resolvedPath = this.resolveImagePath(imagePath, basePath);
        const file = vault.getAbstractFileByPath(resolvedPath);
        
        if (!file || !(file instanceof TFile)) {
          continue;
        }
        
        const fileData = await vault.readBinary(file);
        const blob = new Blob([fileData], { type: this.getImageMimeType(file.name) });
        
        const remoteUrl = await microfeedClient.uploadMediaFile(blob, 'image', file.name);
        
        const escapedImagePath = imagePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const imageRegexForReplace = new RegExp(`!\\[([^\\]]*)\\]\\(${escapedImagePath}\\)`, 'g');
        processedContent = processedContent.replace(imageRegexForReplace, `![${alt}](${remoteUrl})`);
        
        processedImages.add(imagePath);
      } catch (error) {
        console.error(`❌ Failed to upload image ${imagePath}:`, error);
      }
    }
    
    return processedContent;
  }

  /**
   * Resolve relative image paths to absolute paths within vault
   */
  private static resolveImagePath(imagePath: string, basePath: string): string {
    console.log(`🔧 Resolving path: "${imagePath}" relative to "${basePath}"`);
    
    // Remove any leading/trailing whitespace
    imagePath = imagePath.trim();
    basePath = basePath.trim();
    
    if (imagePath.startsWith('/')) {
      // Absolute path from vault root
      const result = imagePath.substring(1);
      console.log(`📍 Absolute path resolved to: "${result}"`);
      return result;
    }
    
    if (imagePath.startsWith('./') || imagePath.startsWith('../')) {
      // Relative path
      const baseDir = basePath.split('/').slice(0, -1).join('/');
      console.log(`📂 Base directory: "${baseDir}"`);
      
      const resolvedParts: string[] = [];
      const pathParts = imagePath.split('/').filter(p => p); // Remove empty parts
      const baseParts = baseDir ? baseDir.split('/').filter(p => p) : [];
      
      // Start with base directory parts
      resolvedParts.push(...baseParts);
      console.log(`🏗️ Starting with base parts: [${baseParts.join(', ')}]`);
      
      for (const part of pathParts) {
        if (part === '.') {
          // Current directory, skip
          console.log(`⏭️ Skipping current directory: "${part}"`);
          continue;
        } else if (part === '..') {
          // Parent directory
          const popped = resolvedParts.pop();
          console.log(`⬆️ Going up one level, removed: "${popped}"`);
        } else if (part) {
          resolvedParts.push(part);
          console.log(`➕ Added part: "${part}"`);
        }
      }
      
      const result = resolvedParts.join('/');
      console.log(`🎯 Relative path resolved to: "${result}"`);
      return result;
    }
    
    // Relative path without ./ prefix - assume relative to current file
    const baseDir = basePath.split('/').slice(0, -1).join('/');
    const result = baseDir ? `${baseDir}/${imagePath}` : imagePath;
    console.log(`📝 Simple relative path resolved to: "${result}"`);
    return result;
  }

  /**
   * Get MIME type for image files
   */
  private static getImageMimeType(fileName: string): string {
    const extension = fileName.toLowerCase().split('.').pop() || '';
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
    };
    return mimeTypes[extension] || 'image/jpeg';
  }
}