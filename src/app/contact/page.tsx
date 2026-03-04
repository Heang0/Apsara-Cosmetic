'use client';

import { useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { useLanguage } from '@/context/LanguageContext';
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  ClockIcon,
  PaperAirplaneIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function ContactPage() {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    }, 1000);
  };

  const title = language === 'km' ? 'ទំនាក់ទំនង' : 'Contact Us';
  const subtitle = language === 'km'
    ? 'តើអ្នកមានសំណួរអ្វីចំពោះយើង? យើងរីករាយក្នុងការស្តាប់'
    : 'Have questions? We\'d love to hear from you';

  const contactInfo = [
    {
      icon: PhoneIcon,
      titleKm: 'ទូរស័ព្ទ',
      titleEn: 'Phone',
      details: ['+855 12 345 678', '+855 98 765 432'],
      action: 'tel:+85512345678'
    },
    {
      icon: EnvelopeIcon,
      titleKm: 'អ៊ីមែល',
      titleEn: 'Email',
      details: ['info@apsara.com', 'support@apsara.com'],
      action: 'mailto:info@apsara.com'
    },
    {
      icon: MapPinIcon,
      titleKm: 'អាសយដ្ឋាន',
      titleEn: 'Address',
      details: ['#123, Street 456', 'Phnom Penh, Cambodia'],
      action: 'https://maps.google.com/?q=Phnom+Penh+Cambodia'
    },
    {
      icon: ClockIcon,
      titleKm: 'ម៉ោងបើក',
      titleEn: 'Business Hours',
      details: ['Mon - Fri: 8:00 AM - 6:00 PM', 'Sat - Sun: 9:00 AM - 4:00 PM'],
      action: '#'
    }
  ];

  const faqs = [
    {
      qKm: 'តើខ្ញុំអាចតាមដានការបញ្ជាទិញរបស់ខ្ញុំដោយរបៀបណា?',
      qEn: 'How can I track my order?',
      aKm: 'អ្នកអាចតាមដានការបញ្ជាទិញរបស់អ្នកបានដោយចូលទៅកាន់គណនីរបស់អ្នក ហើយចុចលើ "ការបញ្ជាទិញរបស់ខ្ញុំ"។',
      aEn: 'You can track your order by logging into your account and clicking on "My Orders".'
    },
    {
      qKm: 'តើខ្ញុំអាចត្រឡប់ផលិតផលវិញបានទេ?',
      qEn: 'Can I return products?',
      aKm: 'បាទ/ចាស, អ្នកអាចត្រឡប់ផលិតផលវិញបានក្នុងរយៈពេល ១៤ ថ្ងៃបន្ទាប់ពីការទិញ។',
      aEn: 'Yes, you can return products within 14 days of purchase.'
    },
    {
      qKm: 'តើការដឹកជញ្ជូនចំណាយប៉ុន្មាន?',
      qEn: 'How much is shipping?',
      aKm: 'ការដឹកជញ្ជូនមានតម្លៃត្រឹមតែ ១.៥០$ ប៉ុណ្ណោះ និងឥតគិតថ្លៃសម្រាប់ការបញ្ជាទិញលើសពី ៤០$។',
      aEn: 'Shipping costs only $1.50 and is free for orders over $40.'
    },
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

      {/* Contact Info Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contactInfo.map((info, index) => {
            const Icon = info.icon;
            return (
              <a
                key={index}
                href={info.action}
                target={info.action.startsWith('http') ? '_blank' : undefined}
                rel={info.action.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition group"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gray-900 group-hover:text-white transition">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="khmer-text font-medium text-gray-900 mb-2">
                  {language === 'km' ? info.titleKm : info.titleEn}
                </h3>
                {info.details.map((detail, i) => (
                  <p key={i} className="text-sm text-gray-500">
                    {detail}
                  </p>
                ))}
              </a>
            );
          })}
        </div>
      </div>

      {/* Contact Form & Map */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="khmer-text text-2xl font-light text-gray-900 mb-6">
              {language === 'km' ? 'ផ្ញើសារមកយើង' : 'Send us a Message'}
            </h2>
            
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                <p className="text-green-700">
                  {language === 'km' 
                    ? 'សាររបស់អ្នកត្រូវបានផ្ញើដោយជោគជ័យ! យើងនឹងឆ្លើយតបទៅអ្នកវិញឆាប់ៗ។'
                    : 'Your message has been sent successfully! We\'ll get back to you soon.'}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder={language === 'km' ? 'ឈ្មោះពេញ' : 'Full Name'}
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
                />
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="tel"
                  placeholder={language === 'km' ? 'លេខទូរស័ព្ទ' : 'Phone Number'}
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
                />
                <input
                  type="text"
                  placeholder={language === 'km' ? 'ប្រធានបទ' : 'Subject'}
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
                />
              </div>
              <textarea
                rows={5}
                placeholder={language === 'km' ? 'សាររបស់អ្នក' : 'Your Message'}
                required
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  language === 'km' ? 'កំពុងផ្ញើ...' : 'Sending...'
                ) : (
                  <>
                    <span>{language === 'km' ? 'ផ្ញើសារ' : 'Send Message'}</span>
                    <PaperAirplaneIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Map */}
          <div>
            <h2 className="khmer-text text-2xl font-light text-gray-900 mb-6">
              {language === 'km' ? 'ទីតាំងរបស់យើង' : 'Our Location'}
            </h2>
            <div className="bg-gray-100 rounded-xl overflow-hidden aspect-video">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31249.31188020258!2d104.8809879!3d11.5448729!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3109513dc76a6be3%3A0x9c16e1b9c3b9e3a9!2sPhnom%20Penh!5e0!3m2!1sen!2skh!4v1700000000000!5m2!1sen!2skh"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="khmer-text text-3xl font-light text-gray-900 text-center mb-12">
            {language === 'km' ? 'សំណួរដែលគេសួរញឹកញាប់' : 'Frequently Asked Questions'}
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="khmer-text font-medium text-gray-900 mb-2">
                  {language === 'km' ? faq.qKm : faq.qEn}
                </h3>
                <p className="text-gray-500 text-sm">
                  {language === 'km' ? faq.aKm : faq.aEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="khmer-text text-3xl font-light mb-4">
            {language === 'km' ? 'ត្រៀមខ្លួនដើម្បីទិញទំនិញហើយឬនៅ?' : 'Ready to Shop?'}
          </h2>
          <p className="text-gray-300 mb-8">
            {language === 'km'
              ? 'ចូលមើលផលិតផលរបស់យើងថ្ងៃនេះ'
              : 'Browse our products today'}
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