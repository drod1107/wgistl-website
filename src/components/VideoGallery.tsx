// components/VideoGallery.tsx
'use client'

import { useState, useEffect } from 'react';
import { DriveFile, DriveErrorType, DriveAPIResponse, DriveErrorDetails } from '@/types/drive';
import VideoPlayer from './VideoPlayer';

interface VideoGalleryProps {
  folderId: string;
}

interface GalleryError {
  type: DriveErrorType;
  message: string;
  details?: DriveErrorDetails;
}

const VideoGallery = ({ folderId }: VideoGalleryProps) => {
  const [videos, setVideos] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<GalleryError | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/getVideos?folderId=${folderId}`);
        const data = await response.json() as DriveAPIResponse;

        if (!response.ok) {
          setError({
            type: data.type || DriveErrorType.FOLDER_ERROR,
            message: data.error || data.message || 'Failed to fetch videos',
            details: data.details
          });
          return;
        }

        if (!data.files) {
          throw new Error('Invalid response format: missing files array');
        }

        setVideos(data.files);
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError({
          type: DriveErrorType.NETWORK_ERROR,
          message: err instanceof Error ? err.message : 'Failed to load videos',
          details: {
            error: err instanceof Error ? err.message : undefined
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (folderId) {
      fetchVideos();
    }
  }, [folderId]);

  const handleDelete = (videoId: string) => {
    setVideos((prevVideos) => prevVideos.filter((video) => video.id !== videoId));
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center p-8">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    let errorMessage = error.message;
    switch (error.type) {
      case DriveErrorType.UNAUTHORIZED:
        errorMessage = 'Access denied. Please check your permissions.';
        break;
      case DriveErrorType.NETWORK_ERROR:
        errorMessage = 'There has been a network error, or no videos have been uploaded yet.';
        break;
    }

    return (
      <div className="w-full h-full flex justify-center items-center p-8">
        <div className="text-center">
          <p className="text-lg text-red-600">{errorMessage}</p>
          {error.details?.message && (
            <p className="text-sm text-red-500 mt-2">{error.details.message}</p>
          )}
        </div>
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div className="w-full h-full flex justify-center items-center p-8">
        <p className="text-lg text-gray-600">No videos found in this folder</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {videos.map((video) => (
          <div key={video.id} className="w-full">
            <VideoPlayer
              title={video.name}
              description={video.description || ''}
              videoUrl={video.webViewLink}
              thumbnail={video.thumbnailLink}
              createdAt={video.createdTime}
              videoId={video.id}
              onDelete={handleDelete}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoGallery;
