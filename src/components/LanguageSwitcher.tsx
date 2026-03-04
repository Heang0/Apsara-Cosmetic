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

  const toggleLanguage = () => {
    setLanguage(language === 'km' ? 'en' : 'km');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1 px-2 py-1 hover:bg-gray-50 rounded-lg transition"
      title={language === 'km' ? 'Switch to English' : 'ប្តូរទៅខ្មែរ'}
    >
      <span className={`text-sm font-medium ${language === 'en' ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}>
        Eng
      </span>
      <span className="text-gray-300 text-sm">|</span>
      <span className={`khmer-text text-sm font-medium ${language === 'km' ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}>
        ខ្មែរ
      </span>
    </button>
  );
}