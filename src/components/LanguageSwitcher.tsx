'use client';

import { useLanguage } from '@/context/LanguageContext';
import { useEffect, useState } from 'react';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(window.location.pathname.startsWith('/admin'));
  }, []);

  if (isAdmin) return null;

  // Simple className strings - no template literals with variables
  const getKmClass = () => {
    let baseClass = 'px-3 py-1.5 rounded-lg text-sm font-medium transition khmer-text';
    if (language === 'km') {
      return baseClass + ' bg-gray-900 text-white';
    }
    return baseClass + ' text-gray-600 hover:text-gray-900 hover:bg-gray-100';
  };

  const getEnClass = () => {
    let baseClass = 'px-3 py-1.5 rounded-lg text-sm font-medium transition english-text';
    if (language === 'en') {
      return baseClass + ' bg-gray-900 text-white';
    }
    return baseClass + ' text-gray-600 hover:text-gray-900 hover:bg-gray-100';
  };

  return (
    <div className="flex items-center space-x-1 ml-4 border-l border-gray-300 pl-4">
      <button
        onClick={() => setLanguage('km')}
        className={getKmClass()}
      >
        ខ្មែរ
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={getEnClass()}
      >
        EN
      </button>
    </div>
  );
}
