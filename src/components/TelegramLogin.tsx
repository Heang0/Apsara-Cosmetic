'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

declare global {
  interface Window {
    TelegramLoginWidget: any;
  }
}

export default function TelegramLogin() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleTelegramAuth = (telegramUser: any) => {
    setLoading(true);
    
    // Send to our backend
    fetch('/api/auth/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(telegramUser),
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/account');
      } else {
        alert(language === 'km' ? 'ចូលប្រើប្រាស់មិនបានជោគជ័យ' : 'Login failed');
      }
    })
    .catch(err => {
      console.error('Auth error:', err);
      alert(language === 'km' ? 'មានបញ្ហាក្នុងការចូលប្រើប្រាស់' : 'Login error');
    })
    .finally(() => setLoading(false));
  };

  // Load Telegram widget
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || '');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '8');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-userpic', 'true');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.async = true;
    
    window.onTelegramAuth = handleTelegramAuth;
    
    document.getElementById('telegram-login-container')?.appendChild(script);
    
    return () => {
      delete window.onTelegramAuth;
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div id="telegram-login-container" className="min-h-[60px]"></div>
      {loading && (
        <div className="text-sm text-gray-500">
          {language === 'km' ? 'កំពុងដំណើរការ...' : 'Processing...'}
        </div>
      )}
    </div>
  );
}