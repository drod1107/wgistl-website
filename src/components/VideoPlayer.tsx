// components/VideoPlayer.tsx
'use client'

import { useState } from 'react';
import Image from 'next/image';

interface VideoPlayerProps {
  title: string;
  description: string;
  videoUrl: string;
  thumbnail?: string;
  createdAt: string;
  videoId: string;
  onDelete: (videoId: string) => void;
}

export default function VideoPlayer({
  title,
  description,
  videoUrl,
  thumbnail,
  createdAt,
  videoId,
  onDelete
}: VideoPlayerProps) {
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch('/api/deleteVideo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete video');
      }

      onDelete(videoId); // Notify parent component to remove this video from the list
    } catch (error) {
      console.error('Error deleting video:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="relative aspect-video">
        {!isIframeLoaded && thumbnail && (
          <Image
            src={thumbnail}
            alt={`Thumbnail for ${title}`}
            className="absolute top-0 left-0 w-full h-full object-cover"
            width={640}
            height={360}
          />
        )}
        
        {!isIframeLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-black bg-opacity-70 rounded-full flex items-center justify-center">
              <div className="w-0 h-0 border-t-8 border-t-transparent border-l-16 border-l-white border-b-8 border-b-transparent ml-1" />
            </div>
          </div>
        )}

        <iframe
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-300 ${
            isIframeLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          src={videoUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsIframeLoaded(true)}
        />
      </div>
      
      <div className="p-4 flex flex-col gap-2">
        <h3 className="text-lg font-semibold line-clamp-2" title={title}>
          {title}
        </h3>
        
        <div className="text-sm text-gray-600">
          <p>{formatDate(createdAt)}</p>
        </div>
        
        {description && description !== "undefined" && (
          <p className="text-gray-700 line-clamp-3" title={description}>
            {description}
          </p>
        )}
        
        {/* Delete Button */}
        <button
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          onClick={() => setShowDeleteModal(true)}
        >
          Delete Video
        </button>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
              <p className="text-lg font-semibold mb-4">
                Are you sure you want to delete this video? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
