'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CubeIcon, CurrencyDollarIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const productsRes = await fetch('/api/products');
            const products = await productsRes.json();
            setStats(prev => ({ ...prev, totalProducts: products.length }));
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    return (
        <div>
            <h1 className="khmer-text text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="english-text text-gray-500 mb-8">Welcome to your admin dashboard</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <CubeIcon className="w-8 h-8 text-gray-400" />
                        <span className="text-2xl font-bold text-gray-900">{stats.totalProducts}</span>
                    </div>
                    <h3 className="text-gray-600">Total Products</h3>
                    <p className="text-sm text-gray-400">ផលិតផលសរុប</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <ShoppingCartIcon className="w-8 h-8 text-gray-400" />
                        <span className="text-2xl font-bold text-gray-900">{stats.totalOrders}</span>
                    </div>
                    <h3 className="text-gray-600">Total Orders</h3>
                    <p className="text-sm text-gray-400">ការបញ្ជាទិញសរុប</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <CurrencyDollarIcon className="w-8 h-8 text-gray-400" />
                        <span className="text-2xl font-bold text-gray-900">${stats.totalRevenue}</span>
                    </div>
                    <h3 className="text-gray-600">Total Revenue</h3>
                    <p className="text-sm text-gray-400">ចំណូលសរុប</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link
                        href="/admin/dashboard/products/new"
                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-900 transition text-center"
                    >
                        <p className="font-medium text-gray-900">Add New Product</p>
                        <p className="text-sm text-gray-500">បន្ថែមផលិតផលថ្មី</p>
                    </Link>
                    <Link
                        href="/admin/dashboard/products"
                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-900 transition text-center"
                    >
                        <p className="font-medium text-gray-900">Manage Products</p>
                        <p className="text-sm text-gray-500">គ្រប់គ្រងផលិតផល</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}