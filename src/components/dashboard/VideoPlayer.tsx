'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Calendar, Info, Play, Trash2 } from 'lucide-react';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { DriveClient } from '@/lib/DriveClient';

interface VideoPlayerProps {
  title: string;
  description: string;
  thumbnailUrl?: string;
  createdAt: string;
  videoId: string;
}

export default function VideoPlayer({
  title,
  description,
  thumbnailUrl,
  createdAt,
  videoId
}: VideoPlayerProps) {
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { token } = useGoogleAuth();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDelete = async () => {
    if (!token || isDeleting) return;
    
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        setIsDeleting(true);
        const driveClient = new DriveClient(token);
        await driveClient.deleteFile(videoId);
        window.location.reload();
      } catch (error) {
        console.error('Failed to delete video:', error);
        alert('Failed to delete video. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="group card hover:shadow-prominent transition-all duration-300">
      {/* Video Container */}
      <div className="relative aspect-video rounded-lg overflow-hidden bg-surface-secondary">
        {!isIframeLoaded && (
          <>
            {thumbnailUrl ? (
              <Image
                src={thumbnailUrl}
                alt={title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-surface-tertiary">
                <div className="rounded-xl bg-surface-secondary/80 backdrop-blur-sm p-4">
                  <Play className="w-8 h-8 text-content-secondary" />
                </div>
              </div>
            )}
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => setIsIframeLoaded(true)}
                className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center transform transition-transform group-hover:scale-110 shadow-prominent"
                aria-label="Play video"
              >
                <Play className="w-8 h-8 text-hero ml-1" />
              </button>
            </div>
          </>
        )}

        {/* Video iFrame */}
        <iframe
          className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
            isIframeLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          src={`https://drive.google.com/file/d/${videoId}/preview`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsIframeLoaded(true)}
        />
      </div>

      {/* Video Info */}
      <div className="p-4">
        <div className="flex justify-between items-start gap-4">
          <h3 className="font-semibold text-content-primary line-clamp-2 flex-1">
            {title}
          </h3>
          <div className="flex-shrink-0 flex items-center gap-2">
            {description && (
              <button 
                onClick={() => setShowDetails(!showDetails)}
                className="p-2 hover:bg-surface-secondary rounded-full transition-colors"
                aria-label="Toggle details"
              >
                <Info className={`w-5 h-5 transition-colors ${
                  showDetails ? 'text-hero' : 'text-content-secondary'
                }`} />
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 hover:bg-red-50 rounded-full text-red-500 hover:text-red-600 transition-colors"
              aria-label="Delete video"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Metadata */}
        <div className="flex items-center gap-2 mt-2 text-sm text-content-secondary">
          <Calendar className="w-4 h-4" />
          <time dateTime={createdAt}>{formatDate(createdAt)}</time>
        </div>

        {/* Description (Collapsible) */}
        {description && showDetails && (
          <div className="mt-4 p-4 rounded-lg bg-surface-secondary/50 text-content-secondary text-sm">
            {description}
          </div>
        )}
      </div>
    </div>
  );
}