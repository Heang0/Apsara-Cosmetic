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

interface ImageFile {
  file: File;
  preview: string;
}

export default function NewProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [images, setImages] = useState<ImageFile[]>([]);
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
    setImages([...images, { file, preview }]);
  };

  const handleImageRemove = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
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
    
    for (const image of images) {
      const formData = new FormData();
      formData.append('image', image.file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await res.json();
      uploadedUrls.push(data.url);
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (images.length === 0) {
      alert('សូមបន្ថែមរូបភាពយ៉ាងហោចណាស់មួយ');
      return;
    }

    setUploading(true);
    setLoading(true);

    try {
      // Upload images to Cloudinary
      const imageUrls = await uploadImagesToCloudinary();
      
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
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
      alert('An error occurred while uploading images');
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="mb-6 md:mb-8">
        <h1 className="khmer-text text-xl md:text-2xl font-bold text-gray-900">បន្ថែមផលិតផលថ្មី</h1>
        <p className="english-text text-sm text-gray-500 mt-1">Add New Product</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Product Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="khmer-text">ឈ្មោះ (ខ្មែរ)</span>{' '}
                <span className="english-text text-xs text-gray-400">(Khmer)</span>{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="khmer-text w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="ឧ: ប្រេងដូង"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="english-text">Name (English)</span>{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                className="english-text w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="Ex: Coconut Oil"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="khmer-text">ការពិពណ៌នា</span>{' '}
                <span className="english-text text-xs text-gray-400">(Description)</span>
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="Product description..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="english-text">Price ($)</span>{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="english-text">Stock</span>{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="khmer-text">ប្រភេទ</span>{' '}
                <span className="english-text text-xs text-gray-400">(Category)</span>{' '}
                <span className="text-red-500">*</span>
              </label>
              {loadingCategories ? (
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                  Loading...
                </div>
              ) : categories.length > 0 ? (
                <select
                  required
                  onChange={handleCategoryChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                  defaultValue=""
                >
                  <option value="" disabled>ជ្រើសរើសប្រភេទ / Select category</option>
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
                <div>
                  <span className="khmer-text text-sm text-gray-700">ដាក់លក់បញ្ចុះតម្លៃ</span>
                  <p className="english-text text-xs text-gray-400">Put on sale</p>
                </div>
              </label>
            </div>

            {formData.isOnSale && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="english-text">Sale Price ($)</span>{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
            )}
          </div>

          {/* Right Column - Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="khmer-text">រូបភាពផលិតផល</span>{' '}
              <span className="english-text text-xs text-gray-400">(Product Images)</span>{' '}
              <span className="text-red-500">*</span>
            </label>
            <p className="khmer-text text-xs text-gray-400 mb-4">
              អាចបន្ថែមបានរហូតដល់ 5 រូប (រូបទីមួយនឹងក្លាយជារូបមេ)
            </p>
            <p className="english-text text-xs text-gray-400 mb-4">
              Up to 5 images (first image will be main)
            </p>
            
            <div className="space-y-3">
              {images.map((img, index) => (
                <ImageUpload
                  key={index}
                  index={index}
                  preview={img.preview}
                  onImageSelected={handleImageSelected}
                  onImageRemove={handleImageRemove}
                />
              ))}
              
              {images.length < 5 && (
                <ImageUpload
                  index={images.length}
                  onImageSelected={handleImageSelected}
                  onImageRemove={handleImageRemove}
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse md:flex-row justify-end gap-3 mt-6 pt-6 border-t">
          <Link
            href="/admin/dashboard/products"
            className="khmer-text text-center px-6 py-2 text-sm text-gray-700 hover:text-gray-900 transition border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            បោះបង់
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="khmer-text px-6 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
          >
            {uploading ? 'កំពុងបង្ហោះរូបភាព...' : loading ? 'កំពុងរក្សាទុក...' : 'បន្ថែមផលិតផល'}
          </button>
        </div>
      </form>
    </div>
  );
}
