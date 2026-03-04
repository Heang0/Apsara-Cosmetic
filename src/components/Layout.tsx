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
    ? 'សេវាដឹកជញ្ជូនឥតគិតថ្លៃ សម្រាប់ការបញ្ជាទិញលើស $40'
    : 'Free shipping on orders over $40';

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="bg-gray-900 text-white text-center py-2 text-sm">
        <p className={language === 'km' ? 'khmer-text' : 'english-text'}>
          {bannerText}
        </p>
      </div>

      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <Link href="/products" className="flex items-center">
              <span className="khmer-text text-2xl sm:text-3xl font-bold text-gray-900">អប្សរា</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <span className={language === 'km' ? 'khmer-text' : 'english-text'}>
                    {language === 'km' ? item.labelKm : item.labelEn}
                  </span>
                </Link>
              ))}
            </div>

            {/* Right side icons */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Cart Icon */}
              <Link href="/cart" className="relative p-2 hover:bg-gray-50 rounded-full transition">
                <ShoppingCartIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center english-text">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* User Icon - Links to login or account */}
              {isAuthenticated ? (
                <Link 
                  href="/account" 
                  className="p-2 hover:bg-gray-50 rounded-full transition flex items-center gap-2"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="hidden sm:block text-sm text-gray-700">
                    {user?.name?.split(' ')[0] || 'Account'}
                  </span>
                </Link>
              ) : (
                <Link 
                  href="/login" 
                  className="p-2 hover:bg-gray-50 rounded-full transition"
                >
                  <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                </Link>
              )}

              <LanguageSwitcher />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 hover:bg-gray-50 rounded-lg transition"
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
              <div className="flex flex-col space-y-3">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block py-2 px-4 hover:bg-gray-50 rounded-lg transition"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className={language === 'km' ? 'khmer-text' : 'english-text'}>
                      {language === 'km' ? item.labelKm : item.labelEn}
                    </span>
                  </Link>
                ))}
                {!isAuthenticated && (
                  <Link
                    href="/login"
                    className="block py-2 px-4 text-gray-700 hover:bg-gray-50 rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {language === 'km' ? 'ចូល' : 'Login'}
                  </Link>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      <main className="flex-grow pb-16">
        {children}
      </main>

      <footer className="bg-gray-50 border-t border-gray-100 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p className={language === 'km' ? 'khmer-text' : 'english-text'}>
            {language === 'km' 
              ? '© 2024 អប្សរា រក្សាសិទ្ធិគ្រប់យ៉ាង'
              : '© 2024 Apsara. All rights reserved.'
            }
          </p>
        </div>
      </footer>

      <FloatingCart />
    </div>
  );
}