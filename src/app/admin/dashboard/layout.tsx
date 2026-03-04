'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  HomeIcon, 
  CubeIcon, 
  TagIcon,
  ShoppingCartIcon,
  UsersIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

const menuItems = [
  { href: '/admin/dashboard', icon: HomeIcon, nameKm: 'ផ្ទាំងគ្រប់គ្រង', nameEn: 'Dashboard' },
  { href: '/admin/dashboard/products', icon: CubeIcon, nameKm: 'ផលិតផល', nameEn: 'Products' },
  { href: '/admin/dashboard/categories', icon: TagIcon, nameKm: 'ប្រភេទ', nameEn: 'Categories' },
  { href: '/admin/dashboard/orders', icon: ShoppingCartIcon, nameKm: 'ការបញ្ជាទិញ', nameEn: 'Orders' },
  { href: '/admin/dashboard/customers', icon: UsersIcon, nameKm: 'អតិថិជន', nameEn: 'Customers' },
  { href: '/admin/dashboard/reports', icon: ChartBarIcon, nameKm: 'របាយការណ៍', nameEn: 'Reports' },
  { href: '/admin/dashboard/settings', icon: Cog6ToothIcon, nameKm: 'ការកំណត់', nameEn: 'Settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const userStr = localStorage.getItem('adminUser');
    
    if (!token) {
      router.push('/admin/login');
      return;
    }
    
    if (userStr) {
      try {
        setAdmin(JSON.parse(userStr));
      } catch (e) {
        console.error('Failed to parse admin user');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  // Pre-compute className strings to avoid template literal issues
  const mobileSidebarClass = 'fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 z-50 md:hidden ' + 
    (isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full');

  const desktopSidebarClass = 'hidden md:block fixed top-0 left-0 bottom-0 bg-white border-r border-gray-200 transition-all duration-300 z-30 ' + 
    (isSidebarOpen ? 'w-64' : 'w-20');

  const mainContentClass = 'transition-all duration-300 ' + 
    (isSidebarOpen ? 'md:ml-64' : 'md:ml-20') + 
    ' pt-16 md:pt-0';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg mr-3"
            >
              {isMobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
            <h2 className="khmer-text text-xl font-bold">អប្សរា</h2>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <div className={mobileSidebarClass}>
        <nav className="p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const linkClass = 'flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 transition ' + 
              (isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900');
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={linkClass}
              >
                <Icon className="w-5 h-5" />
                <div>
                  <p className="khmer-text text-sm">{item.nameKm}</p>
                  <p className="english-text text-xs text-gray-400">{item.nameEn}</p>
                </div>
              </Link>
            );
          })}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition mt-4"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <div>
              <p className="khmer-text text-sm">ចាកចេញ</p>
              <p className="english-text text-xs text-gray-400">Logout</p>
            </div>
          </button>
        </nav>
      </div>

      {/* Desktop Sidebar */}
      <div className={desktopSidebarClass}>
        <div className="p-6 border-b border-gray-200">
          {isSidebarOpen ? (
            <>
              <h2 className="khmer-text text-xl font-bold text-gray-900">អប្សរា</h2>
              <p className="english-text text-xs text-gray-400 mt-1">Admin Panel</p>
            </>
          ) : (
            <h2 className="khmer-text text-xl font-bold text-center">អ</h2>
          )}
        </div>

        <nav className="p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const linkClass = 'flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 transition ' + 
              (isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900');
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={linkClass}
              >
                <Icon className="w-5 h-5" />
                {isSidebarOpen && (
                  <div>
                    <p className="khmer-text text-sm">{item.nameKm}</p>
                    <p className="english-text text-xs text-gray-400">{item.nameEn}</p>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          {isSidebarOpen ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 px-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="khmer-text text-sm font-medium text-gray-900 truncate">
                    {admin?.name || 'អ្នកគ្រប់គ្រង'}
                  </p>
                  <p className="english-text text-xs text-gray-400 truncate">
                    {admin?.email || ''}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <div>
                  <p className="khmer-text text-sm">ចាកចេញ</p>
                  <p className="english-text text-xs text-gray-400">Logout</p>
                </div>
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex justify-center p-2 text-gray-600 hover:text-red-600 transition"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1 hidden md:block"
        >
          <svg className={'w-4 h-4 transform transition-transform ' + (!isSidebarOpen ? 'rotate-180' : '')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className={mainContentClass}>
        <div className="p-4 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
