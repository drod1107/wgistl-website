// components/VideoUpload.tsx
'use client'

import { useRef, useState } from 'react';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { DriveClient, DriveError } from '@/lib/DriveClient';
import { Progress } from '@/components/ui/progress';

interface VideoUploadProps {
  folderId: string;
}

interface UploadState {
  file: File | null;
  uploading: boolean;
  progress: number;
  error: string | null;
  title: string;
  description: string;
}

const VideoUpload = ({ folderId }: VideoUploadProps) => {
  const [state, setState] = useState<UploadState>({
    file: null,
    uploading: false,
    progress: 0,
    error: null,
    title: '',
    description: '',
  });

  const { token, loading: authLoading, error: authError } = useGoogleAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval>>();

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setState(prev => ({ ...prev, file, error: null }));
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setState(prev => ({ ...prev, [name]: value, error: null }));
  };

  const clearUploadState = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = undefined;
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!state.file || !token) return;

    setState(prev => ({
      ...prev,
      uploading: true,
      progress: 0,
      error: null,
    }));

    // Simulated progress updates
    progressIntervalRef.current = setInterval(() => {
      setState(prev => ({
        ...prev,
        progress: Math.min((prev.progress || 0) + 10, 90)
      }));
    }, 500);

    try {
      const driveClient = new DriveClient(token);
      
      await driveClient.uploadFile(
        state.file,
        folderId,
        {
          title: state.title || state.file.name,
          description: state.description
        }
      );

      clearUploadState();

      // Show completion state
      setState({
        file: null,
        uploading: false,
        progress: 100,
        error: null,
        title: '',
        description: '',
      });

      // Reload the page after a short delay to show the new video
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (err) {
      console.error('Upload error:', err);
      
      clearUploadState();
      
      setState(prev => ({
        ...prev,
        uploading: false,
        progress: 0,
        error: err instanceof DriveError 
          ? err.message 
          : 'Failed to upload video. Please try again.'
      }));
    }
  };

  const removeFile = () => {
    clearUploadState();
    setState({
      file: null,
      uploading: false,
      progress: 0,
      error: null,
      title: state.title,
      description: state.description,
    });
  };

  if (authLoading) {
    return (
      <div className="w-full max-w-md mx-auto p-4">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="w-full max-w-md mx-auto p-4">
        <div className="text-red-500 text-center">
          Authentication error. Please try signing in again.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleUpload}>
        <div
          className={`border-2 border-dashed p-4 ${
            state.file ? 'border-blue-500' : 'border-gray-300'
          }`}
        >
          {state.file ? (
            <div className="flex items-center justify-between">
              <span className="text-green-600">{state.file.name}</span>
              <button
                type="button"
                onClick={removeFile}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ) : (
            <>
              <p className="mt-2 text-gray-600">Drag and drop your video here</p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInput}
                accept="video/*"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </>
          )}
        </div>

        <div className="mt-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={state.title}
            onChange={handleInputChange}
            className="block w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter video title"
          />
        </div>

        <div className="mt-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={state.description}
            onChange={handleInputChange}
            rows={3}
            className="block w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter video description"
          />
        </div>

        {state.uploading && (
          <div className="w-full space-y-2 mt-4">
            <Progress value={state.progress} className="w-full" />
            <p className="text-sm text-gray-500 text-center">
              {state.progress.toFixed(0)}% uploaded
            </p>
          </div>
        )}

        {state.error && (
          <div className="mt-4 p-3 bg-red-50 text-sm text-red-500 rounded-md">
            {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={state.uploading || !state.file}
          className="w-full p-2 bg-black b-2 bg-blue-500 text-white rounded disabled:bg-gray-300 mt-4"
        >
          {state.uploading ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>
    </div>
  );
};

export default VideoUpload;