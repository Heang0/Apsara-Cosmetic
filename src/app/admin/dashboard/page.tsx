'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CubeIcon, CurrencyDollarIcon, ShoppingCartIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const productsRes = await fetch('/api/products');
      const products = await productsRes.json();
      setStats(prev => ({ ...prev, totalProducts: products.length }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="khmer-text text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="english-text text-gray-500">Welcome to your admin dashboard</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <CubeIcon className="w-8 h-8 text-gray-400" />
              <span className="text-3xl font-bold text-gray-900">{stats.totalProducts}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Total Products</h3>
            <p className="text-sm text-gray-400 mt-1">ផលិតផលសរុប</p>
            <Link 
              href="/admin/dashboard/products" 
              className="mt-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              Manage Products <ArrowRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <ShoppingCartIcon className="w-8 h-8 text-gray-400" />
              <span className="text-3xl font-bold text-gray-900">{stats.totalOrders}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Total Orders</h3>
            <p className="text-sm text-gray-400 mt-1">ការបញ្ជាទិញសរុប</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <CurrencyDollarIcon className="w-8 h-8 text-gray-400" />
              <span className="text-3xl font-bold text-gray-900"></span>
            </div>
            <h3 className="text-gray-600 font-medium">Total Revenue</h3>
            <p className="text-sm text-gray-400 mt-1">ចំណូលសរុប</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/admin/dashboard/products/new"
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-900 transition text-center group"
            >
              <p className="font-medium text-gray-900 group-hover:text-gray-900">➕ Add New Product</p>
              <p className="text-sm text-gray-500 mt-1">បន្ថែមផលិតផលថ្មី</p>
            </Link>
            <Link
              href="/admin/dashboard/products"
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-900 transition text-center group"
            >
              <p className="font-medium text-gray-900 group-hover:text-gray-900">📦 Manage Products</p>
              <p className="text-sm text-gray-500 mt-1">គ្រប់គ្រងផលិតផល</p>
            </Link>
            <Link
              href="/"
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-900 transition text-center group"
            >
              <p className="font-medium text-gray-900 group-hover:text-gray-900">👁️ View Website</p>
              <p className="text-sm text-gray-500 mt-1">មើលគេហទំព័រ</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
