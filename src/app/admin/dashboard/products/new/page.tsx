'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageUpload from '@/components/ImageUpload';

interface Category {
  _id: string;
  name: string;
  nameEn: string;
}

interface LocalImage {
  file: File;
  preview: string;
  id: string;
}

export default function NewProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [localImages, setLocalImages] = useState<LocalImage[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    description: '',
    price: '',
    category: '',
    categoryEn: '',
    stock: '',
    isOnSale: false,
    salePrice: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleImageSelected = (file: File, preview: string) => {
    // Check for duplicate
    const isDuplicate = localImages.some(img => 
      img.file.name === file.name && img.file.size === file.size
    );

    if (isDuplicate) {
      alert('រូបភាពនេះត្រូវបានបន្ថែមរួចហើយ');
      return;
    }

    const newImage: LocalImage = {
      file,
      preview,
      id: Date.now() + '-' + Math.random().toString(36).substr(2, 9)
    };

    setLocalImages([...localImages, newImage]);
  };

  const handleImageRemove = (index: number) => {
    setLocalImages(localImages.filter((_, i) => i !== index));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedCat = categories.find(c => c._id === selectedId);
    if (selectedCat) {
      setFormData({
        ...formData,
        category: selectedCat.name,
        categoryEn: selectedCat.nameEn
      });
    }
  };

  const uploadImagesToCloudinary = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    setUploading(true);

    try {
      for (let i = 0; i < localImages.length; i++) {
        const image = localImages[i];
        const formData = new FormData();
        formData.append('image', image.file);
        
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!res.ok) {
          throw new Error(`Failed to upload image ${i + 1}`);
        }
        
        const data = await res.json();
        uploadedUrls.push(data.url);
      }
      
      return uploadedUrls;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (localImages.length === 0) {
      alert('សូមបន្ថែមរូបភាពយ៉ាងហោចណាស់មួយ');
      return;
    }

    setLoading(true);

    try {
      // Upload images to Cloudinary only when saving
      const imageUrls = await uploadImagesToCloudinary();
      
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({
          name: formData.name,
          nameEn: formData.nameEn,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          categoryEn: formData.categoryEn,
          stock: parseInt(formData.stock),
          isOnSale: formData.isOnSale,
          salePrice: formData.salePrice ? parseFloat(formData.salePrice) : undefined,
          images: imageUrls,
        }),
      });

      if (res.ok) {
        router.push('/admin/dashboard/products');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while creating product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="khmer-text text-2xl font-bold text-gray-900">បន្ថែមផលិតផលថ្មី</h1>
        <p className="english-text text-gray-500 mt-1">Add New Product</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Product Info */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="khmer-text">ឈ្មោះ (ខ្មែរ)</span>
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="khmer-text w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="ឧ: ប្រេងដូង"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="english-text">Name (English)</span>
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                className="english-text w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="Ex: Coconut Oil"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="khmer-text">ការពិពណ៌នា</span>
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="Product description..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="english-text">Price ($)</span>
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="english-text">Stock</span>
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="khmer-text">ប្រភេទ</span>
                <span className="text-red-500 ml-1">*</span>
              </label>
              {loadingCategories ? (
                <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                  Loading...
                </div>
              ) : categories.length > 0 ? (
                <select
                  required
                  onChange={handleCategoryChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                  defaultValue=""
                >
                  <option value="" disabled>ជ្រើសរើសប្រភេទ</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name} / {cat.nameEn}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-sm text-amber-600">
                  No categories found. Please create a category first.
                </div>
              )}
            </div>

            <input type="hidden" name="category" value={formData.category} />
            <input type="hidden" name="categoryEn" value={formData.categoryEn} />

            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.isOnSale}
                  onChange={(e) => setFormData({ ...formData, isOnSale: e.target.checked })}
                  className="w-4 h-4 text-gray-900 border-gray-300 rounded"
                />
                <span className="khmer-text text-sm text-gray-700">ដាក់លក់បញ្ចុះតម្លៃ</span>
              </label>
            </div>

            {formData.isOnSale && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="english-text">Sale Price ($)</span>
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
            )}
          </div>

          {/* Right Column - Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="khmer-text">រូបភាពផលិតផល</span>
              <span className="text-red-500 ml-1">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-4">
              អាចបន្ថែមបានរហូតដល់ 5 រូប (រូបទីមួយនឹងក្លាយជារូបមេ)
            </p>
            
            <div className="space-y-4">
              {localImages.map((img, index) => (
                <div key={img.id} className="relative border rounded-lg p-2 bg-gray-50">
                  <img 
                    src={img.preview} 
                    alt={`Preview ${index + 1}`} 
                    className="w-full h-32 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleImageRemove(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
              
              {localImages.length < 5 && (
                <ImageUpload
                  index={localImages.length}
                  onImageSelected={handleImageSelected}
                  onImageRemove={handleImageRemove}
                />
              )}
            </div>

            <p className="text-xs text-gray-400 mt-4">
              {localImages.length}/5 រូបភាព
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
          <Link
            href="/admin/dashboard/products"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            បោះបង់
          </Link>
          <button
            type="submit"
            disabled={loading || uploading}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
          >
            {uploading 
              ? 'កំពុងបង្ហោះរូបភាព...' 
              : loading 
                ? 'កំពុងរក្សាទុក...' 
                : 'បន្ថែមផលិតផល'
            }
          </button>
        </div>
      </form>
    </div>
  );
}