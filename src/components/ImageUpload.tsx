'use client';

import { useState } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ImageUploadProps {
  onImageSelected: (file: File, preview: string) => void;
  onImageRemove: (index: number) => void;
  index: number;
  preview?: string;
}

export default function ImageUpload({ onImageSelected, onImageRemove, index, preview }: ImageUploadProps) {
  const [imagePreview, setImagePreview] = useState(preview || '');
  const [error, setError] = useState('');

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

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const previewUrl = reader.result as string;
      setImagePreview(previewUrl);
      onImageSelected(file, previewUrl);
    };
    reader.readAsDataURL(file);
    setError('');
  };

  const handleRemove = () => {
    setImagePreview('');
    onImageRemove(index);
  };

  return (
    <div className="space-y-2">
      {!imagePreview ? (
        <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-gray-400 transition block">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="text-center">
            <PhotoIcon className="w-8 h-8 mx-auto text-gray-400" />
            <p className="khmer-text text-xs text-gray-600 mt-1">ចុចដើម្បីបន្ថែមរូបភាព</p>
            <p className="english-text text-xs text-gray-400 mt-1">Click to add image</p>
          </div>
        </label>
      ) : (
        <div className="relative border rounded-lg overflow-hidden group">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-24 object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
