// config/drive.ts

/**
 * Configuration constants for Google Drive operations
 */
export const DriveConfig = {
    /**
     * API endpoints
     */
    API: {
      BASE_URL: 'https://www.googleapis.com/drive/v3',
      UPLOAD_URL: 'https://www.googleapis.com/upload/drive/v3',
    },
  
    /**
     * Upload configuration
     */
    UPLOAD: {
      CHUNK_SIZE: 5 * 1024 * 1024, // 5MB chunks
    },
  
    /**
     * Default fields to request from the API
     */
    FILE_FIELDS: [
      'id',
      'name',
      'mimeType',
      'webViewLink',
      'thumbnailLink',
      'createdTime'
    ].join(','),
  
    /**
     * Error messages
     */
    ERRORS: {
      UPLOAD_FAILED: 'Failed to upload file',
      FOLDER_CREATION_FAILED: 'Failed to create folders',
      FOLDER_ACCESS_FAILED: 'Failed to access folder',
      UNAUTHORIZED: 'Unauthorized access to Drive',
    },
  } as const;
  
  export default DriveConfig;