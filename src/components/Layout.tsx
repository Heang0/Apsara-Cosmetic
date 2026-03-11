'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon, ShoppingCartIcon, UserIcon } from '@heroicons/react/24/outline';
import LanguageSwitcher from './LanguageSwitcher';
import FloatingCart from './FloatingCart';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();
  const { language } = useLanguage();
  const { totalItems } = useCart();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    setIsAdmin(pathname?.startsWith('/admin') || false);
  }, [pathname]);

  const menuItems = [
    { href: '/products', labelKm: 'ផលិតផល', labelEn: 'Products' },
    { href: '/about', labelKm: 'អំពីយើង', labelEn: 'About' },
    { href: '/contact', labelKm: 'ទំនាក់ទំនង', labelEn: 'Contact' },
  ];

  const bannerText = language === 'km'
    ? 'សេវាដឹកជញ្ជូនឥតគិតថ្លៃ សម្រាប់ការបញ្ជាទិញលើស $25'
    : 'Free shipping on orders over $25.';

  if (isAdmin) {
    return <>{children}</>;
  }


  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Banner */}
      <div className="bg-gray-900 text-white text-center py-2.5 text-sm">
        <p className={language === 'km' ? 'khmer-text' : 'english-text'}>
          {bannerText}
        </p>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <Link href="/products" className="flex items-center gap-2">
              <span className={language === 'km' ? 'khmer-text text-2xl sm:text-3xl font-bold text-gray-900' : 'english-text text-2xl sm:text-3xl font-bold text-gray-900'}>
                {language === 'km' ? 'គ្លូមី' : 'Glowme'}
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-10">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                >
                  <span className={language === 'km' ? 'khmer-text' : 'english-text'}>
                    {language === 'km' ? item.labelKm : item.labelEn}
                  </span>
                </Link>
              ))}
            </div>

            {/* Right side icons */}
            <div className="flex items-center space-x-1 sm:space-x-3">
              {/* Cart Icon */}
              <Link href="/cart" className="relative p-2.5 hover:bg-gray-100 rounded-full transition">
                <ShoppingCartIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center english-text">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* User Icon */}
              {isAuthenticated ? (
                <Link
                  href="/account"
                  className="p-2.5 hover:bg-gray-100 rounded-full transition flex items-center gap-2"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {user?.name?.split(' ')[0] || 'Account'}
                  </span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="p-2.5 hover:bg-gray-100 rounded-full transition"
                >
                  <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                </Link>
              )}

              <LanguageSwitcher />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6 text-gray-700" />
                ) : (
                  <Bars3Icon className="w-6 h-6 text-gray-700" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <div className="flex flex-col space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block py-3 px-4 hover:bg-gray-50 rounded-lg transition font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className={language === 'km' ? 'khmer-text' : 'english-text'}>
                      {language === 'km' ? item.labelKm : item.labelEn}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className={language === 'km' ? 'khmer-text text-gray-500' : 'english-text text-gray-500'}>
            {language === 'km'
              ? '© 2026 គ្លូមី រក្សាសិទ្ធិគ្រប់យ៉ាង'
              : '© 2026 Glowme. All rights reserved.'
            }
          </p>
        </div>
      </footer>

      <FloatingCart />
    </div>
  );
}