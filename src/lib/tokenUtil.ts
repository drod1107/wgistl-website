// lib/tokenUtil.ts

import { createLogger } from './logger';
import type { LogData } from '@/types/logger';

const logger = createLogger('TokenUtil');

interface TokenConfig {
 clientId: string;
 clientSecret: string;
 refreshToken: string;
}

interface TokenInfo {
 accessToken: string;
 expiresAt: number;  // Unix timestamp
}

/**
* Manages OAuth2 token lifecycle including caching and refresh
*/
export class TokenManager {
  private config: TokenConfig;
  private currentToken: TokenInfo | null = null;
  private refreshPromise: Promise<string> | null = null;
  
  // Buffer time before token expiry to trigger refresh (5 minutes)
  private static readonly TOKEN_REFRESH_BUFFER = 300000;

  constructor(config: TokenConfig) {
   this.validateConfig(config);
   this.config = config;
  }

  /**
   * Validates the required configuration parameters
   */
  private validateConfig(config: TokenConfig): void {
   if (!config.clientId || !config.clientSecret || !config.refreshToken) {
     logger.error('Missing required OAuth configuration parameters');
     throw new Error('Missing required OAuth configuration parameters');
   }
  }

  /**
   * Returns a valid access token, refreshing if necessary
   */
  async getValidToken(): Promise<string> {
   const now = Date.now();

   // If we have a valid token that's not near expiration, return it
   if (this.currentToken && this.currentToken.expiresAt > now + TokenManager.TOKEN_REFRESH_BUFFER) {
     logger.debug('Using cached token');
     return this.currentToken.accessToken;
   }

   // If a refresh is already in progress, wait for it
   if (this.refreshPromise) {
     logger.debug('Waiting for in-progress token refresh');
     return this.refreshPromise;
   }

   // Start a new refresh
   try {
     this.refreshPromise = this.refreshAccessToken();
     const token = await this.refreshPromise;
     return token;
   } finally {
     this.refreshPromise = null;
   }
  }

  /**
   * Refreshes the access token using the refresh token
   */
  private async refreshAccessToken(): Promise<string> {
   logger.info('Refreshing access token');

   const params = new URLSearchParams({
     client_id: this.config.clientId,
     client_secret: this.config.clientSecret,
     refresh_token: this.config.refreshToken,
     grant_type: 'refresh_token',
   });

   try {
     const response = await fetch('https://oauth2.googleapis.com/token', {
       method: 'POST',
       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
       body: params.toString(),
     });

     if (!response.ok) {
       const errorText = await response.text();
       const errorData: LogData = {
         message: 'Token refresh failed',
         status: response.status,
         errorText: errorText
       };
       
       logger.error('Token refresh failed', errorData);
       throw new Error(`Failed to refresh token: ${response.status} ${errorText}`);
     }

     const data = await response.json();
     
     this.currentToken = {
       accessToken: data.access_token,
       expiresAt: Date.now() + (data.expires_in * 1000),
     };

     logger.info('Token refreshed successfully', {
       expiresIn: data.expires_in,
       scope: data.scope,
     });

     return this.currentToken.accessToken;
     
   } catch (error) {
     const tokenError: LogData = {
       message: error instanceof Error ? error.message : 'Unknown error occurred',
       errorType: error instanceof Error ? error.name : 'UnknownError',
       stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
     };
     
     logger.error('Token refresh error', tokenError);
     throw new Error('Failed to refresh access token: ' + tokenError.message);
   }
  }

  /**
   * Invalidates the current token, forcing a refresh on next request
   */
  invalidateToken(): void {
   logger.info('Invalidating current token');
   this.currentToken = null;
  }
}

/**
* Creates a new TokenManager instance with the provided configuration
*/
export function createTokenManager(): TokenManager {
  return new TokenManager({
    clientId: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!,
    refreshToken: process.env.GOOGLE_SERVICE_ACCOUNT_REFRESH_TOKEN!
  });
}