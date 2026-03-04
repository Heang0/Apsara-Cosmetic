'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { getFirebaseAuth } from '@/lib/firebase';
import { signInWithCustomToken } from 'firebase/auth';

declare global {
  interface Window {
    onTelegramAuth?: (user: any) => void;
  }
}

export default function TelegramLogin() {
  const { language } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const handleTelegramAuth = async (telegramUser: any) => {
      setLoading(true);
      try {
        const res = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: telegramUser.id,
            first_name: telegramUser.first_name,
            last_name: telegramUser.last_name,
            username: telegramUser.username,
            photo_url: telegramUser.photo_url,
            auth_date: telegramUser.auth_date,
            hash: telegramUser.hash,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          // Store telegramChatId in localStorage so checkout can attach it to orders
          if (telegramUser.id) {
            localStorage.setItem('telegramChatId', String(telegramUser.id));
          }
          const firebaseAuth = getFirebaseAuth();
          await signInWithCustomToken(firebaseAuth, data.firebaseToken);
          router.push('/account');
        } else {
          alert(data.error || 'Telegram login failed');
        }
      } catch (error) {
        console.error('Telegram auth error:', error);
        alert('Login failed');
      } finally {
        setLoading(false);
      }
    };

    // Telegram widget requires bot username without leading '@'
    const rawBotUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || '';
    const botUsername = rawBotUsername.replace(/^@+/, '');

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '8');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-userpic', 'true');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.async = true;

    window.onTelegramAuth = handleTelegramAuth;

    const container = document.getElementById('telegram-login-container');
    if (container) {
      container.innerHTML = '';
      container.appendChild(script);
    }

    return () => {
      delete window.onTelegramAuth;
      if (container) container.innerHTML = '';
    };
  }, [mounted, router]);

  if (!mounted) {
    return <div className="w-full h-12 bg-gray-100 rounded-lg animate-pulse"></div>;
  }

  return (
    <div className="w-full">
      <div id="telegram-login-container" className="flex justify-center"></div>
      {loading && (
        <p className={`text-sm text-gray-500 text-center mt-2 ${language === 'km' ? 'khmer-text' : ''}`}>
          {language === 'km' ? 'កំពុងដំណើរការ...' : 'Processing...'}
        </p>
      )}
    </div>
  );
}
