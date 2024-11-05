// components/VideoPlayer.tsx
// 'use client' directive for Next.js to use client-side rendering
'use client'

// Importing necessary hooks from React and Next.js components
import { useState } from 'react';
import Image from 'next/image';

// Defining the TypeScript interface for the component's props
interface VideoPlayerProps {
  title: string; // Title of the video
  description: string; // Description of the video
  // videoUrl: string; // URL to the video
  thumbnail?: string; // Optional thumbnail URL
  createdAt: string; // Date when the video was created
  videoId: string; // Unique identifier for the video
  onDelete: (videoId: string) => void; // Callback function to handle video deletion
}

// Default export of the VideoPlayer component
export default function VideoPlayer({
  title,
  description,
  // videoUrl,
  thumbnail,
  createdAt,
  videoId,
  onDelete
}: VideoPlayerProps) {
  const [isIframeLoaded, setIsIframeLoaded] = useState(false); // State to track if the iframe is loaded
  const [showDeleteModal, setShowDeleteModal] = useState(false); // State to show/hide the delete confirmation modal
  const [isDeleting, setIsDeleting] = useState(false); // State to track if the video is being deleted

  // Function to handle video deletion
  const handleDelete = async () => {
    setIsDeleting(true); // Set deleting state to true
    try {
      // Make a POST request to delete the video
      const response = await fetch('/api/deleteVideo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Set content type to JSON
        },
        body: JSON.stringify({ videoId }), // Send videoId in the request body
      });

      // Handle non-OK response
      if (!response.ok) {
        throw new Error('Failed to delete video');
      }

      onDelete(videoId); // Notify the parent component about the deletion
    } catch (error) {
      console.error('Error deleting video:', error); // Log error if any
    } finally {
      setIsDeleting(false); // Reset deleting state
      setShowDeleteModal(false); // Close the delete confirmation modal
    }
  };

  // Function to format the date string into a readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // JSX rendering the component
  return (
    <div className="flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="relative aspect-video bg-black">
        {/* Conditionally display the thumbnail image if the iframe is not loaded */}
        {!isIframeLoaded && thumbnail && (
          <Image
            src={thumbnail}
            alt={`Thumbnail for ${title}`}
            className="absolute top-0 left-0 w-full h-full object-contain" // Changed from object-cover
            width={640}
            height={360}
          />
        )}

        {/* Conditionally display a play button overlay if the iframe is not loaded */}
        {!isIframeLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-black bg-opacity-70 rounded-full flex items-center justify-center">
              <div className="w-0 h-0 border-t-8 border-t-transparent border-l-16 border-l-white border-b-8 border-b-transparent ml-1" />
            </div>
          </div>
        )}

        {/* Iframe for video playback, with a transition effect on load */}
        <iframe
          className={`absolute center w-full h-full transition-all object-contain}`}
          src={`https://drive.google.com/file/d/${videoId}/preview?embedded=true`} // Video source URL
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" // Allow specific features
          onLoad={() => setIsIframeLoaded(true)} // Set iframe loaded state on load
        />
      </div>

      {/* Video details and actions */}
      <div className="p-4 flex flex-col gap-2">
        <h3 className="text-lg font-semibold line-clamp-2" title={title}>
          {title} {/* Display video title */}
        </h3>

        <div className="text-sm text-gray-600">
          <p>{formatDate(createdAt)}</p> {/* Display formatted creation date */}
        </div>

        {/* Conditionally display video description */}
        {description && description !== "undefined" && (
          <p className="text-gray-700 line-clamp-3" title={description}>
            {description}
          </p>
        )}

        {/* Delete Button */}
        <button
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          onClick={() => setShowDeleteModal(true)} // Show modal on click
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
                  onClick={() => setShowDeleteModal(false)} // Close modal on cancel
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={handleDelete} // Confirm deletion
                  disabled={isDeleting} // Disable button if deleting
                >
                  {isDeleting ? 'Deleting...' : 'Confirm'} {/* Show loading state */}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

