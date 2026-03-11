import { Kantumruy_Pro, Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google';

// Khmer Font - Kantumruy Pro (Modern, clean Khmer font)
export const khmerFont = Kantumruy_Pro({
  subsets: ['khmer'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-khmer',
});

// English Font - Plus Jakarta Sans (Modern, professional, premium feel)
export const englishFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
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
