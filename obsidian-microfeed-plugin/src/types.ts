export interface MicrofeedSettings {
  apiUrl: string;
  apiKey: string;
  defaultStatus: 'published' | 'unpublished' | 'unlisted';
}

export interface MediaFile {
  type: 'audio' | 'video' | 'image' | 'document' | 'external_url';
  url: string;
  title?: string;
  description?: string;
}

export interface ParsedContent {
  title: string;
  content: string;
  mediaFiles: MediaFile[];
  frontMatter: Record<string, any>;
}

export interface MicrofeedItem {
  title: string;
  status: 'published' | 'unpublished' | 'unlisted';
  attachment?: {
    category: 'audio' | 'video' | 'image' | 'document' | 'external_url';
    url: string;
    mime_type?: string;
    size_in_bytes?: number;
    duration_in_seconds?: number;
  };
  url?: string;
  content_html: string;
  image?: string;
  date_published_ms?: number;
  _microfeed?: {
    'itunes:title'?: string;
    'itunes:block'?: boolean;
    'itunes:episodeType'?: 'full' | 'trailer' | 'bonus';
    'itunes:season'?: number;
    'itunes:episode'?: number;
    'itunes:explicit'?: boolean;
  };
}

export interface PresignedUrlResponse {
  presigned_url: string;
  media_url: string;
}