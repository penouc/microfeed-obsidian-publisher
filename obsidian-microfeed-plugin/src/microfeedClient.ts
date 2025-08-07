import { MicrofeedItem, PresignedUrlResponse, MediaFile } from './types';
import { requestUrl } from 'obsidian';

export class MicrofeedClient {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey;
  }

  async createItem(item: MicrofeedItem): Promise<any> {
    const response = await requestUrl({
      url: `${this.apiUrl}/api/items/`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-MicrofeedAPI-Key': this.apiKey,
      },
      body: JSON.stringify(item),
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Failed to create item: ${response.status}. ${response.text}`);
    }

    return response.json;
  }

  async updateItem(itemId: string, item: MicrofeedItem): Promise<any> {
    const response = await requestUrl({
      url: `${this.apiUrl}/api/items/${itemId}/`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-MicrofeedAPI-Key': this.apiKey,
      },
      body: JSON.stringify(item),
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Failed to update item: ${response.status}. ${response.text}`);
    }

    return response.json;
  }

  async getPresignedUrl(category: string, filePath: string, itemId?: string): Promise<PresignedUrlResponse> {
    const payload: any = {
      category,
      full_local_file_path: filePath,
    };

    if (itemId) {
      payload.item_id = itemId;
    }

    const response = await requestUrl({
      url: `${this.apiUrl}/api/media_files/presigned_urls/`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-MicrofeedAPI-Key': this.apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Failed to get presigned URL: ${response.status}. ${response.text}`);
    }

    return response.json;
  }

  async uploadFile(presignedUrl: string, file: File | Blob): Promise<void> {
    const arrayBuffer = await file.arrayBuffer();
    const response = await requestUrl({
      url: presignedUrl,
      method: 'PUT',
      body: arrayBuffer,
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Failed to upload file: ${response.status}`);
    }
  }

  async uploadMediaFile(file: File | Blob, category: string, fileName: string, itemId?: string): Promise<string> {
    try {
      // Get presigned URL
      const presignedResponse = await this.getPresignedUrl(category, fileName, itemId);
      
      // Upload file
      await this.uploadFile(presignedResponse.presigned_url, file);
      
      // Return the media URL
      return presignedResponse.media_url;
    } catch (error) {
      console.error('Error uploading media file:', error);
      throw error;
    }
  }

  getMimeType(fileName: string, mediaType: string): string {
    const extension = fileName.toLowerCase().split('.').pop() || '';
    
    const mimeTypes: Record<string, string> = {
      // Audio
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'm4a': 'audio/mp4',
      'aac': 'audio/aac',
      'ogg': 'audio/ogg',
      'flac': 'audio/flac',
      
      // Video
      'mp4': 'video/mp4',
      'mov': 'video/quicktime',
      'avi': 'video/x-msvideo',
      'mkv': 'video/x-matroska',
      'webm': 'video/webm',
      'm4v': 'video/mp4',
      
      // Images
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      
      // Documents
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
      'rtf': 'application/rtf',
    };

    return mimeTypes[extension] || `${mediaType}/*`;
  }

  async getFileSize(file: File | Blob): Promise<number> {
    return file.size;
  }

  async getMediaDuration(file: File): Promise<number | undefined> {
    return new Promise((resolve) => {
      if (file.type.startsWith('audio/')) {
        const audio = new Audio();
        audio.onloadedmetadata = () => {
          resolve(Math.round(audio.duration));
        };
        audio.onerror = () => resolve(undefined);
        audio.src = URL.createObjectURL(file);
      } else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
          resolve(Math.round(video.duration));
          URL.revokeObjectURL(video.src);
        };
        video.onerror = () => {
          resolve(undefined);
          URL.revokeObjectURL(video.src);
        };
        video.src = URL.createObjectURL(file);
      } else {
        resolve(undefined);
      }
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      // Test by trying to fetch feed (which requires valid API setup)
      const response = await requestUrl({
        url: `${this.apiUrl}/api/feed/`,
        method: 'GET',
        headers: {
          'X-MicrofeedAPI-Key': this.apiKey,
        },
      });
      
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}