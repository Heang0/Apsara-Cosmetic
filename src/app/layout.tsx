import type { Metadata } from 'next';
import { khmerFont, englishFont } from '@/lib/fonts';
import { LanguageProvider } from '@/context/LanguageContext';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'គ្លូមី - Glowme',
  description: 'Traditional Khmer cosmetics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const fontVariables = khmerFont.variable + ' ' + englishFont.variable;

  return (
    <html lang="km" className={fontVariables}>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
      </head>
      <body className="font-english antialiased">
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}