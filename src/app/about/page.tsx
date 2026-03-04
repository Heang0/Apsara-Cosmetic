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
    ? 'ស្វែងយល់ពីរឿងរ៉ាវរបស់អប្សរា' 
    : 'Discover the story behind Apsara';

  const storyTitle = language === 'km' ? 'រឿងរ៉ាវរបស់យើង' : 'Our Story';
  const storyText1 = language === 'km'
    ? 'អប្សរា បានចាប់ផ្តើមពីក្តីស្រមៃចង់ថែរក្សា និងផ្សព្វផ្សាយនូវសម្រស់បែបប្រពៃណីខ្មែរ។ យើងជឿជាក់ថា សម្រស់ពិតប្រាកដកើតចេញពីធម្មជាតិ និងប្រពៃណីដ៏ល្អប្រណិតរបស់ខ្មែរ។'
    : 'Apsara began with a dream to preserve and promote traditional Khmer beauty. We believe that true beauty comes from nature and the exquisite traditions of Cambodia.';

  const storyText2 = language === 'km'
    ? 'យើងប្រើប្រាស់គ្រឿងផ្សំធម្មជាតិសុទ្ធសាធ ដែលប្រមូលផ្តុំពីគ្រប់តំបន់ទូទាំងប្រទេសកម្ពុជា ដោយរួមបញ្ចូលជាមួយនឹងបច្ចេកវិទ្យាទំនើប ដើម្បីបង្កើតផលិតផលដែលមានគុណភាពខ្ពស់ និងមានសុវត្ថិភាពសម្រាប់អ្នកប្រើប្រាស់។'
    : 'We use 100% natural ingredients sourced from all regions of Cambodia, combined with modern technology to create high-quality, safe products for our customers.';

  const missionTitle = language === 'km' ? 'បេសកកម្មរបស់យើង' : 'Our Mission';
  const missionText = language === 'km'
    ? 'ផ្តល់ជូននូវផលិតផលគ្រឿងសំអាងដែលមានគុណភាពខ្ពស់ ប្រកបដោយភាពពិតប្រាកដ និងប្រកបដោយក្រមសីលធម៌ ខណៈពេលដែលគាំទ្រដល់សហគមន៍មូលដ្ឋាន និងថែរក្សាបេតិកភណ្ឌវប្បធម៌ខ្មែរ។'
    : 'To provide high-quality, authentic, and ethically made cosmetic products while supporting local communities and preserving Khmer cultural heritage.';

  const values = [
    {
      icon: HeartIcon,
      titleKm: 'គុណភាពខ្ពស់',
      titleEn: 'Quality First',
      descKm: 'យើងប្រើប្រាស់តែគ្រឿងផ្សំល្អបំផុត និងមានសុវត្ថិភាព',
      descEn: 'We use only the finest and safest ingredients'
    },
    {
      icon: SparklesIcon,
      titleKm: 'ធម្មជាតិសុទ្ធ',
      titleEn: '100% Natural',
      descKm: 'ផលិតផលទាំងអស់គ្មានជាតិគីមីបង្កគ្រោះថ្នាក់',
      descEn: 'All products are free from harmful chemicals'
    },
    {
      icon: GlobeAsiaAustraliaIcon,
      titleKm: 'ខ្មែរដើម',
      titleEn: 'Khmer Heritage',
      descKm: 'រក្សានូវរូបមន្តបុរាណខ្មែរ',
      descEn: 'Preserving ancient Khmer formulas'
    },
    {
      icon: UserGroupIcon,
      titleKm: 'គាំទ្រសហគមន៍',
      titleEn: 'Community Support',
      descKm: 'ជួយដល់កសិករ និងសហគមន៍មូលដ្ឋាន',
      descEn: 'Supporting local farmers and communities'
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
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
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
            <p className="text-gray-600 mb-4 leading-relaxed">
              {storyText1}
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {storyText2}
            </p>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <CheckBadgeIcon className="w-8 h-8 text-gray-900" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
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
                alt="Apsara products"
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
          <p className="text-xl text-gray-600 leading-relaxed">
            {missionText}
          </p>
        </div>
      </div>

      {/* Values Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="khmer-text text-3xl font-light text-gray-900 text-center mb-12">
          {language === 'km' ? 'តម្លៃស្នូលរបស់យើង' : 'Our Core Values'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <p className="text-sm text-gray-500">
                  {language === 'km' ? value.descKm : value.descEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="khmer-text text-3xl font-light mb-4">
            {language === 'km' ? 'រកឃើញភាពខុសគ្នា' : 'Discover the Difference'}
          </h2>
          <p className="text-gray-300 mb-8">
            {language === 'km' 
              ? 'សាកល្បងផលិតផលរបស់យើងថ្ងៃនេះ ហើយមានអារម្មណ៍ថាមានភាពខុសគ្នា'
              : 'Try our products today and feel the difference'}
          </p>
          <Link
            href="/products"
            className="inline-block bg-white text-gray-900 px-8 py-3 rounded-lg hover:bg-gray-100 transition"
          >
            {language === 'km' ? 'ទិញឥឡូវនេះ' : 'Shop Now'}
          </Link>
        </div>
      </div>
    </Layout>
  );
}