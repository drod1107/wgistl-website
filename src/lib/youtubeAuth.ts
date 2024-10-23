// lib/youtubeAuth.ts
interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}

interface PlaylistCreateResponse {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
    };
    channelTitle: string;
    defaultLanguage?: string;
  };
  status: {
    privacyStatus: string;
  };
}

export class YouTubeOAuthManager {
  private config: OAuthConfig;
  private currentToken: string | null = null;
  private tokenExpiry: number = 0;
  
  constructor(config: OAuthConfig) {
    // Validate config
    if (!config.clientId || !config.clientSecret || !config.refreshToken) {
      console.error('Missing OAuth configuration:', {
        hasClientId: !!config.clientId,
        hasClientSecret: !!config.clientSecret,
        hasRefreshToken: !!config.refreshToken
      });
      throw new Error('Missing required OAuth configuration');
    }
    this.config = config;
  }

  /**
   * Gets a valid access token, refreshing if necessary
   */
  async getValidToken(): Promise<string> {
    const now = Date.now();
    console.log('Checking token validity:', {
      hasCurrentToken: !!this.currentToken,
      timeUntilExpiry: this.tokenExpiry - now
    });
    
    // If token exists and isn't expired (with 5 minute buffer)
    if (this.currentToken && this.tokenExpiry > now + 300000) {
      console.log('Using existing token');
      return this.currentToken;
    }

    console.log('Token expired or missing, refreshing...');
    // Otherwise refresh the token
    return this.refreshAccessToken();
  }

  /**
   * Refreshes the access token using the refresh token
   */
  private async refreshAccessToken(): Promise<string> {
    try {
      console.log('Starting token refresh with config:', {
        clientIdPrefix: this.config.clientId.substring(0, 8) + '...',
        clientIdType: this.config.clientId.includes('.apps.googleusercontent.com') ? 'Web App' : 'Other',
        refreshTokenPrefix: this.config.refreshToken.substring(0, 8) + '...',
      });
  
      const params = new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: this.config.refreshToken,
        grant_type: 'refresh_token'
      });
  
      console.log('Token refresh request URL:', 'https://oauth2.googleapis.com/token');
      console.log('Request parameters:', params.toString().replace(/secret=([^&]+)/, 'secret=REDACTED'));
  
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });
  
      console.log('Token response details:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Token refresh error:', errorData);
        throw new Error(
          `Failed to refresh token: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`
        );
      }
  
      const data: TokenResponse = await response.json();
      this.currentToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);
      
      return data.access_token;
    } catch (error) {
      console.error('Detailed refresh token error:', error);
      throw error;
    }
  }

  /**
   * Creates a new playlist
   */
  async createPlaylist(
    title: string,
    description: string,
    privacyStatus: 'private' | 'unlisted' | 'public'
  ): Promise<string> {
    try {
      console.log('Creating playlist:', { title, privacyStatus });
      
      const token = await this.getValidToken();

      const response = await fetch(
        'https://www.googleapis.com/youtube/v3/playlists?part=snippet,status',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            snippet: {
              title,
              description,
            },
            status: {
              privacyStatus,
            },
          }),
        }
      );

      console.log('Playlist creation response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Playlist creation error details:', errorData);
        throw new Error(
          `Failed to create playlist: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`
        );
      }

      const data: PlaylistCreateResponse = await response.json();
      
      console.log('Successfully created playlist:', data.id);

      if (!data.id) {
        throw new Error('No playlist ID returned from YouTube API');
      }

      return data.id;
    } catch (error) {
      console.error('Error creating YouTube playlist:', error);
      throw error;
    }
  }

  /**
   * Adds a video to a playlist
   */
  async addVideoToPlaylist(playlistId: string, videoId: string): Promise<void> {
    try {
      console.log('Adding video to playlist:', { playlistId, videoId });
      
      const token = await this.getValidToken();

      const response = await fetch(
        'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            snippet: {
              playlistId,
              resourceId: {
                kind: 'youtube#video',
                videoId,
              },
            },
          }),
        }
      );

      console.log('Add video response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Add video error details:', errorData);
        throw new Error(
          `Failed to add video to playlist: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`
        );
      }

      console.log('Successfully added video to playlist');
    } catch (error) {
      console.error('Error adding video to playlist:', error);
      throw error;
    }
  }

  /**
   * Gets videos from a playlist
   */
  async getPlaylistVideos(playlistId: string, maxResults: number = 50): Promise<any[]> {
    try {
      console.log('Fetching playlist videos:', { playlistId, maxResults });
      
      const token = await this.getValidToken();

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${maxResults}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Get playlist videos response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Get playlist videos error details:', errorData);
        throw new Error(
          `Failed to get playlist videos: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`
        );
      }

      const data = await response.json();
      console.log('Successfully retrieved playlist videos');
      
      return data.items;
    } catch (error) {
      console.error('Error getting playlist videos:', error);
      throw error;
    }
  }
}