// This file provides a service for proxying audio files to bypass CORS restrictions
// It uses the Supabase Edge Function to fetch audio files from external sources

import { env } from '@/utils/env';

interface AudioProxyOptions {
  cacheResults?: boolean;
  timeout?: number;
}

class AudioProxyService {
  private cache: Map<string, Blob>;
  private defaultOptions: AudioProxyOptions = {
    cacheResults: true,
    timeout: 30000 // 30 seconds timeout
  };

  constructor() {
    this.cache = new Map();
  }

  /**
   * Proxies an audio file through our server to bypass CORS restrictions
   * @param url The original URL of the audio file
   * @param options Options for the proxy request
   * @returns A URL that can be used to access the audio file
   */
  async getProxiedAudioUrl(url: string, options?: AudioProxyOptions): Promise<string> {
    const opts = { ...this.defaultOptions, ...options };
    
    // Check if the URL is already proxied
    if (url.startsWith(`${env.SUPABASE_URL}/functions/v1/audio-proxy`)) {
      return url;
    }
    
    // Check cache if enabled
    if (opts.cacheResults) {
      const cachedBlob = this.cache.get(url);
      if (cachedBlob) {
        return URL.createObjectURL(cachedBlob);
      }
    }
    
    try {
      // Create a proxied URL through our Supabase Edge Function
      const encodedUrl = encodeURIComponent(url);
      const proxyUrl = `${env.SUPABASE_URL}/functions/v1/audio-proxy?url=${encodedUrl}`;
      
      // Fetch the audio file through our proxy
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), opts.timeout);
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Proxy request failed with status ${response.status}`);
      }
      
      // Get the audio data as a blob
      const blob = await response.blob();
      
      // Cache the result if enabled
      if (opts.cacheResults) {
        this.cache.set(url, blob);
      }
      
      // Create a local URL for the blob
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error proxying audio file:', error);
      
      // Fall back to the original URL if proxying fails
      // This might still fail due to CORS, but it's better than nothing
      return url;
    }
  }
  
  /**
   * Clears the cache of proxied audio files
   */
  clearCache(): void {
    // Revoke all object URLs to prevent memory leaks
    this.cache.forEach((blob, url) => {
      URL.revokeObjectURL(URL.createObjectURL(blob));
    });
    
    this.cache.clear();
  }
}

// Export a singleton instance
export const audioProxyService = new AudioProxyService();

export default audioProxyService;
