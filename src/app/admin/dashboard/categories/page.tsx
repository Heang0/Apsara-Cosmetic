'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Category {
  _id: string;
  name: string;
  nameEn: string;
  description?: string;
  isActive: boolean;
  productCount?: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      
      // Get product counts
      const categoriesWithCount = await Promise.all(
        data.map(async (cat: Category) => {
          try {
            const productsRes = await fetch('/api/products?category=' + encodeURIComponent(cat.name));
            const products = await productsRes.json();
            return { ...cat, productCount: products.length || 0 };
          } catch {
            return { ...cat, productCount: 0 };
          }
        })
      );
      
      setCategories(categoriesWithCount);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('តើអ្នកប្រាកដថាចង់លុបប្រភេទនេះទេ?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/categories?id=' + id, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token },
      });

      if (res.ok) {
        setCategories(categories.filter(c => c._id !== id));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch('/api/categories?id=' + id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      setCategories(categories.map(c => 
        c._id === id ? { ...c, isActive: !currentStatus } : c
      ));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">កំពុងផ្ទុក...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="khmer-text text-2xl font-bold text-gray-900">ប្រភេទផលិតផល</h1>
          <p className="english-text text-sm text-gray-500 mt-1">
            {categories.length} categories total
          </p>
        </div>
        <Link
          href="/admin/dashboard/categories/new"
          className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span className="khmer-text">បន្ថែមថ្មី</span>
        </Link>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">🏷️</div>
          <h3 className="khmer-text text-lg font-medium text-gray-900 mb-2">មិនទាន់មានប្រភេទផលិតផលនៅឡើយទេ</h3>
          <p className="english-text text-gray-500 mb-4">No categories yet</p>
          <Link
            href="/admin/dashboard/categories/new"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="khmer-text">បង្កើតប្រភេទថ្មី</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category._id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="khmer-text text-lg font-semibold text-gray-900">{category.name}</h3>
                    <p className="english-text text-sm text-gray-500">{category.nameEn}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={'/admin/dashboard/categories/edit/' + category._id}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(category._id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-50"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {category.description && (
                  <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {category.productCount || 0} products
                  </span>
                  <button
                    onClick={() => toggleStatus(category._id, category.isActive)}
                    className={'px-3 py-1 rounded-full text-xs font-medium ' + (
                      category.isActive
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    {category.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
