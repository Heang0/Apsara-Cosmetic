import { Kantumruy_Pro, Inter, Playfair_Display } from 'next/font/google';

// Khmer Font - Kantumruy Pro (Modern, clean Khmer font)
export const khmerFont = Kantumruy_Pro({
  subsets: ['khmer'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-khmer',
});

// English Font - Inter (Professional, highly readable)
export const englishFont = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-english',
});

// Optional: Elegant font for headings
export const headingFont = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-heading',
});
