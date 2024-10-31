import { JWT } from 'google-auth-library';
import { createLogger } from './logger';

const logger = createLogger('ServerGoogleAuth');

let cachedAuth: JWT | null = null;

export async function getGoogleAuthClient() {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL || 
        !process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
        logger.error('Missing required service account credentials');
        throw new Error('Service account credentials not configured');
    }

    if (cachedAuth) {
        return cachedAuth;
    }

    try {
        // Create a new JWT client using service account credentials
        const auth = new JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
            key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/drive.file']
        });

        // Verify the credentials work by getting an access token
        await auth.authorize();
        
        // Cache the authenticated client
        cachedAuth = auth;
        
        logger.info('Google auth client created successfully');
        return auth;

    } catch (error) {
        logger.error('Failed to create Google auth client', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw new Error('Failed to initialize Google authentication');
    }
}