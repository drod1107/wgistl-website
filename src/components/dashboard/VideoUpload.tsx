'use client';

import { useRef, useState } from 'react';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { DriveClient, DriveError } from '@/lib/DriveClient';
import { Progress } from '@/components/ui/progress';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

interface VideoUploadProps {
  folderId: string;
}

export default function VideoUpload({ folderId }: VideoUploadProps) {
  const [state, setState] = useState({
    file: null as File | null,
    uploading: false,
    progress: 0,
    error: null as string | null,
    title: '',
    description: '',
    success: false
  });

  const { token } = useGoogleAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!state.file || !token) return;

    setState(prev => ({ ...prev, uploading: true, progress: 0, error: null }));
    try {
      const driveClient = new DriveClient(token);
      await driveClient.uploadFile(state.file, folderId, {
        title: state.title || state.file.name,
        description: state.description,
      });

      // First set progress to 100%
      setState(prev => ({ ...prev, progress: 100 }));
      
      // Wait a moment to show the completed progress
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Then show success state
      setState(prev => ({ 
        ...prev, 
        uploading: false,
        error: null, 
        success: true,
        file: null,
        title: '',
        description: ''
      }));

      // Reset success state after 3 seconds
      setTimeout(() => {
        setState(prev => ({ ...prev, success: false }));
        window.location.reload();
      }, 3000);

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        uploading: false, 
        progress: 0, 
        error: error instanceof DriveError ? error.message : 'Upload failed. Try again.' 
      }));
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setState(prev => ({ 
        ...prev, 
        file,
        error: null,
        success: false
      }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setState(prev => ({ 
        ...prev, 
        file,
        error: null,
        success: false
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-title-2 font-display font-bold text-gray-900">
          Upload New Video
        </h2>
      </div>

      <form onSubmit={handleUpload} className="space-y-6">
        {/* File Drop Zone */}
        <div 
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors
            ${state.file ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'}
            ${state.uploading ? 'pointer-events-none opacity-50' : ''}`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="video/*"
            className="hidden"
          />

          <div className="space-y-4">
            {state.file ? (
              <>
                <div className="w-16 h-16 mx-auto rounded-full bg-primary-100 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-primary-500" />
                </div>
                <div>
                  <p className="text-lg font-medium text-primary-700">{state.file.name}</p>
                  <p className="text-sm text-primary-600">Click to change file</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-500" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    Drop your video here or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports MP4, MOV, and other common video formats
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* File Details */}
        {state.file && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={state.title}
                onChange={(e) => setState(prev => ({ ...prev, title: e.target.value }))}
                className="input w-full"
                placeholder="Enter video title"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={state.description}
                onChange={(e) => setState(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="input w-full"
                placeholder="Enter video description"
              />
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {state.uploading && (
          <div className="space-y-2 animate-fade-in">
            <Progress value={state.progress} />
            <p className="text-sm text-center text-gray-600">
              Uploading... {state.progress.toFixed(0)}%
            </p>
          </div>
        )}

        {/* Success Message */}
        {state.success && (
          <div className="rounded-lg bg-green-50 p-4 animate-fade-in">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Upload successful! Refreshing gallery...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {state.error && (
          <div className="rounded-lg bg-red-50 p-4 animate-fade-in">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">
                  {state.error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Button */}
        {state.file && (
          <button
            type="submit"
            disabled={state.uploading || !state.file}
            className="btn-primary w-full"
          >
            {state.uploading ? 'Uploading...' : 'Upload Video'}
          </button>
        )}
      </form>
    </div>
  );
}