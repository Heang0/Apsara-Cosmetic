'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Product {
  _id: string;
  name: string;
  nameEn: string;
  price: number;
  category: string;
  categoryEn: string;
  stock: number;
  images: string[];
  isOnSale?: boolean;
  salePrice?: number;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/products?id=' + id, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token },
      });

      if (res.ok) {
        setProducts(products.filter(p => p._id !== id));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
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
          <h1 className="khmer-text text-2xl font-bold text-gray-900 mb-2">ផលិតផល</h1>
          <p className="english-text text-gray-500">Manage your products</p>
        </div>
        <Link
          href="/admin/dashboard/products/new"
          className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span className="khmer-text">បន្ថែមថ្មី</span>
        </Link>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">រូបភាព</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">ឈ្មោះ</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">ប្រភេទ</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">តម្លៃ</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">ស្តុក</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">ស្ថានភាព</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-gray-600">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const displayPrice = product.isOnSale && product.salePrice ? product.salePrice : product.price;
                const originalPrice = product.isOnSale ? product.price : null;
                
                return (
                  <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                        {product.images?.[0] ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-gray-300">📦</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="khmer-text font-medium text-gray-900">{product.name}</p>
                      <p className="english-text text-xs text-gray-500">{product.nameEn}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="khmer-text">{product.category}</p>
                      <p className="english-text text-xs text-gray-500">{product.categoryEn}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <p className="english-text font-medium">{formatPrice(displayPrice)}</p>
                        {originalPrice && (
                          <p className="english-text text-xs text-gray-400 line-through">
                            {formatPrice(originalPrice)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={'px-2 py-1 rounded-full text-xs ' + (product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                        {product.stock > 0 ? product.stock + ' in stock' : 'Out of stock'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {product.isOnSale ? (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">On Sale</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">Regular</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={'/admin/dashboard/products/edit/' + product._id}
                          className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-gray-100"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
