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
      className="p-2 hover:bg-gray-50 rounded-full transition flex items-center justify-center"
      title={language === 'km' ? 'Switch to English' : 'ប្តូរទៅខ្មែរ'}
    >
      <span className="text-base">{language === 'km' ? '🇰🇭' : '🇺🇸'}</span>
    </button>
  );
}