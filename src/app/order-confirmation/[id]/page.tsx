'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { useLanguage } from '@/context/LanguageContext';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export default function OrderConfirmation() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      fetchOrder();
    }
  }, [params?.id]);

  const fetchOrder = async () => {
    try {
      const res = await fetch('/api/orders?id=' + params.id);
      const data = await res.json();
      setOrder(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-400">Loading...</div>
        </div>
      </Layout>
    );
  }

  const title = language === 'km' ? 'ការបញ្ជាទិញបានជោគជ័យ' : 'Order Confirmed';
  const message = language === 'km' 
    ? 'សូមអរគុណសម្រាប់ការបញ្ជាទិញរបស់អ្នក'
    : 'Thank you for your order';
  const orderNumberText = language === 'km' ? 'លេខកុម្ម៉ង់' : 'Order Number';
  const totalText = language === 'km' ? 'សរុប' : 'Total';
  const continueText = language === 'km' ? 'បន្តទិញទំនិញ' : 'Continue Shopping';

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 text-center">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="khmer-text text-2xl font-bold mb-2">{title}</h1>
          <p className="english-text text-gray-500 mb-6">{message}</p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-500 mb-1">{orderNumberText}</p>
            <p className="english-text font-medium mb-4">{order?.orderNumber}</p>
            
            <p className="text-sm text-gray-500 mb-1">{totalText}</p>
            <p className="english-text text-xl font-bold">{formatPrice(order?.total || 0)}</p>
          </div>

          <Link
            href="/products"
            className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            <span className={language === 'km' ? 'khmer-text' : 'english-text'}>{continueText}</span>
          </Link>
        </div>
      </div>
    </Layout>
  );
}