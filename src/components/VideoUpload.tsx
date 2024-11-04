'use client'

import { useRef, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { DriveErrorType, DriveErrorDetails, DriveAPIResponse } from '@/types/drive';

interface UploadState {
  file: File | null;
  uploading: boolean;
  progress: number;
  error: UploadError | null;
  title: string;
  description: string;
  folderId: string;
}

interface UploadError {
  type: DriveErrorType;
  message: string;
  details?: DriveErrorDetails;
}

interface VideoUploadProps {
  folderId: string;
}

export default function VideoUpload({ folderId }: VideoUploadProps) {
  const [state, setState] = useState<UploadState>({
    file: null,
    uploading: false,
    progress: 0,
    error: null,
    title: '',
    description: '',
    folderId,
  });
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval>>();

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setState(prevState => ({ ...prevState, file, error: null }));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setState(prevState => ({ ...prevState, [name]: value, error: null }));
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

  const uploadVideo = async () => {
    if (!state.file) return;

    setState(prevState => ({
      ...prevState,
      uploading: true,
      progress: 0,
      error: null,
    }));

    // Simulated progress updates
    progressIntervalRef.current = setInterval(() => {
      setState(prevState => ({
        ...prevState,
        progress: Math.min((prevState.progress || 0) + 10, 90)
      }));
    }, 500);

    try {
      const formData = new FormData();
      formData.append('file', state.file);
      formData.append('title', state.title || state.file.name);
      formData.append('description', state.description);
      formData.append('folderId', state.folderId);

      const response = await fetch('/api/uploadVideo', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json() as DriveAPIResponse;

      if (!response.ok) {
        throw {
          type: data.type || DriveErrorType.UPLOAD_ERROR,
          message: data.error || data.message || 'Upload failed',
          details: data.details
        };
      }

      clearUploadState();

      // Show completion state
      setState(prevState => ({
        ...prevState,
        progress: 100,
        uploading: false,
        file: null,
        title: '',
        description: '',
        error: null
      }));

      // Reload the page after a short delay to show the new video
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (err) {
      console.error('Upload error:', err);
      clearUploadState();
      
      setState(prevState => ({
        ...prevState,
        uploading: false,
        progress: 0,
        error: {
          type: (err as UploadError)?.type || DriveErrorType.UPLOAD_ERROR,
          message: (err as UploadError)?.message || 'Failed to upload video',
          details: (err as UploadError)?.details
        }
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
      folderId: state.folderId,
    });
  };

  const renderError = () => {
    if (!state.error) return null;

    let errorMessage = state.error.message;
    switch (state.error.type) {
      case DriveErrorType.UNAUTHORIZED:
        errorMessage = 'Access denied. Please check your permissions.';
        break;
      case DriveErrorType.NETWORK_ERROR:
        errorMessage = 'There has been a network error, or no videos have been uploaded yet.';
        break;
      // UPLOAD_ERROR uses the default message from the server
    }

    return (
      <div className="text-red-500 text-sm mt-4 p-3 bg-red-50 rounded-md">
        {errorMessage}
        {state.error.details?.message && (
          <div className="text-xs mt-1 text-red-400">
            {state.error.details.message}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          uploadVideo();
        }}
      >
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

        {renderError()}

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
}