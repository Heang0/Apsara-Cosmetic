import type { Metadata } from 'next';
import { khmerFont, englishFont } from '@/lib/fonts';
import { LanguageProvider } from '@/context/LanguageContext';
import { CartProvider } from '@/context/CartContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'អប្សរា - Apsara',
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
      <body className="font-english antialiased">
        <LanguageProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
