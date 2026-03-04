'use client';

import { useState, useRef } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ImageUploadProps {
  onImageSelected: (file: File, preview: string) => void;
  onImageRemove: (index: number) => void;
  index: number;
  preview?: string;
}

export default function ImageUpload({ onImageSelected, onImageRemove, index, preview }: ImageUploadProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(preview || null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('សូមជ្រើសរើសឯកសាររូបភាព');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('រូបភាពត្រូវតែតូចជាង 5MB');
      return;
    }

    // Create preview only - NO UPLOAD
    const reader = new FileReader();
    reader.onloadend = () => {
      const previewUrl = reader.result as string;
      setImagePreview(previewUrl);
      onImageSelected(file, previewUrl);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setImagePreview(null);
    onImageRemove(index);
  };

  return (
    <div className="relative">
      {!imagePreview ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition bg-gray-50">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id={`image-upload-${index}`}
          />
          <label
            htmlFor={`image-upload-${index}`}
            className="cursor-pointer block text-center"
          >
            <PhotoIcon className="w-8 h-8 mx-auto text-gray-400" />
            <p className="khmer-text text-sm text-gray-600 mt-1">ចុចដើម្បីបន្ថែមរូបភាព</p>
            <p className="english-text text-xs text-gray-400">Click to add image</p>
          </label>
          {error && (
            <p className="text-xs text-red-500 text-center mt-2">{error}</p>
          )}
        </div>
      ) : (
        <div className="relative border rounded-lg overflow-hidden group">
          <img 
            src={imagePreview} 
            alt="Preview" 
            className="w-full h-32 object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}