'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Product {
    _id: string;
    name: string;
    nameEn: string;
    price: number;
    category: string;
    categoryEn: string;
    stock: number;
    isOnSale?: boolean;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`/api/products?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (res.ok) {
                setProducts(products.filter(p => p._id !== id));
            }
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="khmer-text text-2xl font-bold text-gray-900 mb-2">Products</h1>
                    <p className="english-text text-gray-500">Manage your products</p>
                </div>
                <Link
                    href="/admin/dashboard/products/new"
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition flex items-center space-x-2"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Add Product</span>
                </Link>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="bg-gray-100 h-16 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Name</th>
                                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Category</th>
                                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Price</th>
                                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Stock</th>
                                <th className="text-right py-4 px-6 text-sm font-medium text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-6">
                                        <div>
                                            <p className="khmer-text font-medium text-gray-900">{product.name}</p>
                                            <p className="english-text text-sm text-gray-500">{product.nameEn}</p>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="text-gray-900">{product.category}</p>
                                        <p className="english-text text-sm text-gray-500">{product.categoryEn}</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="text-gray-900">${product.price}</p>
                                        {product.isOnSale && (
                                            <span className="text-xs text-red-500">On Sale</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2 py-1 rounded-full text-xs ${product.stock > 0
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex justify-end space-x-3">
                                            <Link
                                                href={`/admin/dashboard/products/edit/${product._id}`}
                                                className="text-gray-600 hover:text-gray-900"
                                            >
                                                <PencilIcon className="w-5 h-5" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(product._id)}
                                                className="text-gray-600 hover:text-red-600"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}