import { requestUrl } from 'obsidian';

export interface TwitterSettings {
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
}

export class TwitterClient {
  private settings: TwitterSettings;
  private baseUrl = 'https://api.twitter.com/2';

  constructor(settings: TwitterSettings) {
    this.settings = settings;
  }

  isConfigured(): boolean {
    return !!(
      this.settings.apiKey &&
      this.settings.apiSecret &&
      this.settings.accessToken &&
      this.settings.accessTokenSecret &&
      this.settings.bearerToken
    );
  }

  async postTweet(text: string): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('Twitter API credentials are not configured');
    }

    try {
      const response = await requestUrl({
        url: `${this.baseUrl}/tweets`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.settings.bearerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text
        }),
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error(`Twitter API error: ${response.status} ${response.text}`);
      }

      return response.json;
    } catch (error) {
      console.error('Error posting to Twitter:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      const response = await requestUrl({
        url: `${this.baseUrl}/users/me`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.settings.bearerToken}`,
        },
      });

      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error('Twitter connection test failed:', error);
      return false;
    }
  }

  formatTweetText(title: string, url: string, summary?: string): string {
    let tweet = '';
    
    switch (this.settings.postFormat) {
      case 'title_only':
        tweet = title;
        break;
      case 'title_with_link':
        tweet = `${title} ${url}`;
        break;
      case 'title_with_summary':
        const truncatedSummary = summary ? this.truncateText(summary, 100) : '';
        tweet = `${title}\n\n${truncatedSummary}\n${url}`;
        break;
    }

    if (this.settings.includeHashtags && this.settings.customHashtags) {
      const hashtags = this.settings.customHashtags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.startsWith('#'))
        .join(' ');
      
      if (hashtags) {
        tweet += ` ${hashtags}`;
      }
    }

    // Ensure tweet is within character limit
    return this.truncateText(tweet, 280);
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    
    return text.substring(0, maxLength - 3) + '...';
  }
}