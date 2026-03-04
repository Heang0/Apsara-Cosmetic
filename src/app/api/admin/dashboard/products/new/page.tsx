'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewProduct() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        nameEn: '',
        description: '',
        price: '',
        category: '',
        categoryEn: '',
        stock: '',
        images: [''],
        isOnSale: false,
        salePrice: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
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
                alert(data.error || 'Failed to create product');
            }
        } catch (error) {
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="khmer-text text-2xl font-bold text-gray-900 mb-2">Add New Product</h1>
                <p className="english-text text-gray-500">Create a new product</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Khmer Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name (Khmer) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900"
                        />
                    </div>

                    {/* English Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name (English) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.nameEn}
                            onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900"
                        />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900"
                        />
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Price ($) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900"
                        />
                    </div>

                    {/* Stock */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stock <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            required
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900"
                        />
                    </div>

                    {/* Category Khmer */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category (Khmer) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900"
                        />
                    </div>

                    {/* Category English */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category (English) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.categoryEn}
                            onChange={(e) => setFormData({ ...formData, categoryEn: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900"
                        />
                    </div>

                    {/* Sale Option */}
                    <div className="md:col-span-2">
                        <label className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                checked={formData.isOnSale}
                                onChange={(e) => setFormData({ ...formData, isOnSale: e.target.checked })}
                                className="w-4 h-4 text-gray-900 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">Put on sale</span>
                        </label>
                    </div>

                    {/* Sale Price */}
                    {formData.isOnSale && (
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sale Price ($) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={formData.salePrice}
                                onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900"
                            />
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-end space-x-4">
                    <Link
                        href="/admin/dashboard/products"
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Product'}
                    </button>
                </div>
            </form>
        </div>
    );
}