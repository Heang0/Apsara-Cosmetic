'use client';

import { createContext, useContext, useState, useEffect } from 'react';

type Language = 'km' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('km');

  // Check if we're in admin panel
  const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

  useEffect(() => {
    // Load saved language preference from localStorage (except in admin)
    if (!isAdminPath) {
      const savedLang = localStorage.getItem('language') as Language;
      if (savedLang && (savedLang === 'km' || savedLang === 'en')) {
        setLanguage(savedLang);
      }
    }
  }, [isAdminPath]);

  const handleSetLanguage = (lang: Language) => {
    // Don't change language in admin panel
    if (window.location.pathname.startsWith('/admin')) {
      return;
    }
    setLanguage(lang);
    localStorage.setItem('language', lang);
    
    // Force a re-render of the whole app
    window.location.reload();
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
