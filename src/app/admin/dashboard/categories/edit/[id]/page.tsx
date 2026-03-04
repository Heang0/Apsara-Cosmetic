'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function EditCategory() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    
    if (params?.id) {
      fetchCategory();
    }
  }, [params?.id]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/categories?id=' + params.id);
      
      if (!res.ok) {
        throw new Error('Failed to fetch category');
      }
      
      const category = await res.json();
      console.log('Fetched category:', category);
      
      setFormData({
        name: category.name || '',
        nameEn: category.nameEn || '',
        description: category.description || '',
        isActive: category.isActive ?? true,
      });
      
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load category');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/categories?id=' + params.id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/admin/dashboard/categories');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update category');
      }
    } catch (error) {
      setError('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="khmer-text text-gray-500">កំពុងផ្ទុក...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="khmer-text text-xl md:text-2xl font-bold text-gray-900">កែប្រែប្រភេទ</h1>
        <p className="english-text text-sm text-gray-500 mt-1">Edit Category</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
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
              className="khmer-text w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm md:text-base"
              placeholder="ឧទាហរណ៍: ផ្កា"
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
              className="english-text w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm md:text-base"
              placeholder="Example: Flowers"
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
              className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm"
              placeholder="Category description (optional)"
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-200"
            />
            <div>
              <label htmlFor="isActive" className="khmer-text text-sm text-gray-700">
                បង្ហាញនៅលើគេហទំព័រ
              </label>
              <p className="english-text text-xs text-gray-400">Active (visible in store)</p>
            </div>
          </div>

          <div className="flex flex-col-reverse md:flex-row justify-end gap-3 pt-4 border-t">
            <Link
              href="/admin/dashboard/categories"
              className="khmer-text text-center px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              បោះបង់
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="khmer-text px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
            >
              {saving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}