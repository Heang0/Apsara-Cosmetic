'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Category {
  _id: string;
  name: string;
  nameEn: string;
}

export default function EditProduct() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
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
    images: [] as string[],
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchProduct();
    fetchCategories();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch('/api/products?id=' + params.id);
      const data = await res.json();
      
      setFormData({
        name: data.name || '',
        nameEn: data.nameEn || '',
        description: data.description || '',
        price: data.price?.toString() || '',
        category: data.category || '',
        categoryEn: data.categoryEn || '',
        stock: data.stock?.toString() || '',
        isOnSale: data.isOnSale || false,
        salePrice: data.salePrice?.toString() || '',
        images: data.images || [],
      });
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Error:', error);
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/products?id=' + params.id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          salePrice: formData.salePrice ? parseFloat(formData.salePrice) : undefined,
        }),
      });

      if (res.ok) {
        router.push('/admin/dashboard/products');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update product');
      }
    } catch (error) {
      setError('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="khmer-text text-2xl font-bold text-gray-900 mb-2">កែប្រែផលិតផល</h1>
        <p className="english-text text-gray-500">Edit Product</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="khmer-text">ឈ្មោះ (ខ្មែរ)</span> <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="khmer-text w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="english-text">Name (English)</span> <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                className="english-text w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="khmer-text">ការពិពណ៌នា</span>
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="english-text">Price</span> <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="english-text">Stock</span> <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="khmer-text">ប្រភេទ</span> <span className="text-red-500">*</span>
              </label>
              <select
                required
                onChange={handleCategoryChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={categories.find(c => c.name === formData.category)?._id || ''}
              >
                <option value="" disabled>ជ្រើសរើសប្រភេទ</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name} / {cat.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.isOnSale}
                  onChange={(e) => setFormData({ ...formData, isOnSale: e.target.checked })}
                  className="w-4 h-4 text-gray-900 border-gray-300 rounded"
                />
                <span className="khmer-text text-sm">ដាក់លក់បញ្ចុះតម្លៃ</span>
              </label>
            </div>

            {formData.isOnSale && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="english-text">Sale Price</span> <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="khmer-text">រូបភាព</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {formData.images.map((img, index) => (
                <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img src={img} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
          <Link
            href="/admin/dashboard/products"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            បោះបង់
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក'}
          </button>
        </div>
      </form>
    </div>
  );
}