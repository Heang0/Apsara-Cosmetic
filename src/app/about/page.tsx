'use client';

import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { useLanguage } from '@/context/LanguageContext';
import {
  HeartIcon,
  SparklesIcon,
  GlobeAsiaAustraliaIcon,
  UserGroupIcon,
  CheckBadgeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

export default function AboutPage() {
  const { language } = useLanguage();

  const title = language === 'km' ? 'អំពីយើង' : 'About Us';
  const subtitle = language === 'km'
    ? 'ស្វែងយល់ពីរឿងរ៉ាវរបស់គ្លូមី'
    : 'Discover the story behind Glowme';

  const storyTitle = language === 'km' ? 'រឿងរ៉ាវរបស់យើង' : 'Our Story';
  const storyText1 = language === 'km'
    ? 'គ្លូមី គឺជាហាងលក់ផលិតផលគ្រឿងសំអាងពីប្រទេសជប៉ុនដែលមានគុណភាពខ្ពស់។ យើងជឿជាក់លើការផ្តល់ជូននូវផលិតផលល្អបំផុតពីប្រទេសជប៉ុន ដើម្បីថែរក្សាសម្រស់របស់អ្នក។'
    : 'Glowme is your trusted source for premium Japanese skincare and cosmetics. We believe in bringing the best of Japan\'s beauty innovations to help you look and feel your best.';

  const storyText2 = language === 'km'
    ? 'យើងជ្រើសរើសតែផលិតផលល្បីៗពីប្រទេសជប៉ុនប៉ុណ្ណោះ ដូចជា Keana Nadeshiko, Skin Aqua និងយីហោល្បីៗជាច្រើនទៀត ដែលធានាបានពីគុណភាព និងប្រសិទ្ធភាព។'
    : 'We carefully select only the most trusted Japanese brands like Keana Nadeshiko, Skin Aqua, and many more, ensuring authentic quality and proven results.';

  const missionTitle = language === 'km' ? 'បេសកកម្មរបស់យើង' : 'Our Mission';
  const missionText = language === 'km'
    ? 'ផ្តល់ជូននូវផលិតផលគ្រឿងសំអាងពីប្រទេសជប៉ុនដែលមានគុណភាពខ្ពស់ ប្រកបដោយភាពពិតប្រាកដ និងតម្លៃសមរម្យ ដើម្បីជួយឱ្យអ្នកមានសម្រស់ស្រស់ស្អាត។'
    : 'To provide authentic, high-quality Japanese beauty products at affordable prices, helping you achieve beautiful, healthy skin.';

  const values = [
    {
      icon: HeartIcon,
      titleKm: 'គុណភាពជប៉ុន',
      titleEn: 'Japanese Quality',
      descKm: 'ផលិតផលទាំងអស់មានគុណភាពខ្ពស់ពីប្រទេសជប៉ុន',
      descEn: 'All products feature premium Japanese quality'
    },
    {
      icon: SparklesIcon,
      titleKm: 'ផលិតផលពិត 100%',
      titleEn: '100% Authentic',
      descKm: 'ធានាផលិតផលពិតគ្រប់យ៉ាងពីប្រទេសជប៉ុន',
      descEn: 'Guaranteed authentic products direct from Japan'
    },
    {
      icon: GlobeAsiaAustraliaIcon,
      titleKm: 'យីហោល្បីៗ',
      titleEn: 'Top Brands',
      descKm: 'មានតែយីហោល្បីៗដូចជា Keana Nadeshiko, Skin Aqua',
      descEn: 'Only top brands like Keana Nadeshiko, Skin Aqua'
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-gray-50 to-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="khmer-text text-4xl sm:text-5xl font-light text-gray-900 mb-4">
            {title}
          </h1>
          <p className={`text-xl text-gray-500 max-w-2xl mx-auto ${language === 'km' ? 'khmer-text' : ''}`}>
            {subtitle}
          </p>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="khmer-text text-3xl font-light text-gray-900 mb-6">
              {storyTitle}
            </h2>
            <p className={`text-gray-600 mb-4 leading-relaxed ${language === 'km' ? 'khmer-text' : ''}`}>
              {storyText1}
            </p>
            <p className={`text-gray-600 mb-6 leading-relaxed ${language === 'km' ? 'khmer-text' : ''}`}>
              {storyText2}
            </p>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <CheckBadgeIcon className="w-8 h-8 text-gray-900" />
              </div>
              <div>
                <p className={`font-medium text-gray-900 ${language === 'km' ? 'khmer-text' : ''}`}>
                  {language === 'km' ? 'ទទួលស្គាល់ដោយ' : 'Certified by'}
                </p>
                <p className="text-sm text-gray-500">Ministry of Commerce, Cambodia</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1611085583191-a3b181a88401?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Traditional Khmer ingredients"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden mt-8">
              <img
                src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Glowme products"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="khmer-text text-3xl font-light text-gray-900 mb-6">
            {missionTitle}
          </h2>
          <p className={`text-xl text-gray-600 leading-relaxed ${language === 'km' ? 'khmer-text' : ''}`}>
            {missionText}
          </p>
        </div>
      </div>

      {/* Values Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="khmer-text text-3xl font-light text-gray-900 text-center mb-12">
          {language === 'km' ? 'តម្លៃស្នូលរបស់យើង' : 'Our Core Values'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div key={index} className="text-center p-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-gray-900" />
                </div>
                <h3 className="khmer-text font-medium text-gray-900 mb-2">
                  {language === 'km' ? value.titleKm : value.titleEn}
                </h3>
                <p className={`text-sm text-gray-500 ${language === 'km' ? 'khmer-text' : ''}`}>
                  {language === 'km' ? value.descKm : value.descEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="khmer-text text-3xl font-light text-gray-900 mb-4">
              {language === 'km' ? 'តាមដានយើងខ្ញុំ' : 'Follow Us'}
            </h2>
            <p className={`text-gray-500 max-w-2xl mx-auto ${language === 'km' ? 'khmer-text' : ''}`}>
              {language === 'km' 
                ? 'តាមដានគណនីបណ្តាញសង្គមរបស់យើងខ្ញុំសម្រាប់ព័ត៌មានថ្មីៗ'
                : 'Follow our social media accounts for the latest updates'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Facebook */}
            <a
              href="https://www.facebook.com/Glowme.Store"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-lg transition group"
            >
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className={`font-medium ${language === 'km' ? 'khmer-text' : 'english-text'}`}>
                Facebook
              </span>
            </a>

            {/* Telegram */}
            <a
              href="https://t.me/Glowme_Store"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-lg transition group"
            >
              <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              <span className={`font-medium ${language === 'km' ? 'khmer-text' : 'english-text'}`}>
                Telegram
              </span>
            </a>

            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@glowme_storee"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-white p-6 rounded-xl border border-gray-200 hover:border-black hover:shadow-lg transition group"
            >
              <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
              <span className={`font-medium ${language === 'km' ? 'khmer-text' : 'english-text'}`}>
                TikTok
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="khmer-text text-3xl font-light mb-4">
            {language === 'km' ? 'រកឃើញភាពខុសគ្នា' : 'Discover the Difference'}
          </h2>
          <p className={`text-gray-300 mb-8 ${language === 'km' ? 'khmer-text' : ''}`}>
            {language === 'km'
              ? 'សាកល្បងផលិតផលរបស់យើងថ្ងៃនេះ ហើយមានអារម្មណ៍ថាមានភាពខុសគ្នា'
              : 'Try our products today and feel the difference'}
          </p>
          <Link
            href="/products"
            className={`inline-block bg-white text-gray-900 px-8 py-3 rounded-lg hover:bg-gray-100 transition ${language === 'km' ? 'khmer-text' : ''}`}
          >
            {language === 'km' ? 'ទិញឥឡូវនេះ' : 'Shop Now'}
          </Link>
        </div>
      </div>
    </Layout>
  );
}