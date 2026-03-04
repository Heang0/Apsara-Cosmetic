'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    HomeIcon,
    CubeIcon,
    ArrowRightOnRectangleIcon,
    UserIcon
} from '@heroicons/react/24/outline';

interface AdminUser {
    id: string;
    email: string;
    name: string;
    role: string;
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [admin, setAdmin] = useState<AdminUser | null>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        const userStr = localStorage.getItem('adminUser');

        if (!token) {
            router.push('/admin/login');
        } else {
            setIsAuthenticated(true);
            if (userStr) {
                try {
                    setAdmin(JSON.parse(userStr));
                } catch (e) {
                    console.error('Failed to parse admin user');
                }
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        router.push('/admin/login');
    };

    if (!isAuthenticated) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 fixed h-full">
                <div className="p-6">
                    <h2 className="khmer-text text-xl font-bold text-gray-900">អប្សរា</h2>
                    <p className="english-text text-sm text-gray-500">Admin Panel</p>
                </div>

                <nav className="mt-6">
                    <Link
                        href="/admin/dashboard"
                        className="flex items-center space-x-3 px-6 py-3 text-gray-700 hover:bg-gray-50"
                    >
                        <HomeIcon className="w-5 h-5" />
                        <span>Dashboard</span>
                    </Link>

                    <Link
                        href="/admin/dashboard/products"
                        className="flex items-center space-x-3 px-6 py-3 text-gray-700 hover:bg-gray-50"
                    >
                        <CubeIcon className="w-5 h-5" />
                        <span>Products</span>
                    </Link>
                </nav>

                <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {admin?.name || 'Admin'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {admin?.email || ''}
                            </p>
                            <p className="text-xs text-gray-400 capitalize">{admin?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 w-full"
                    >
                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-64">
                <div className="p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}