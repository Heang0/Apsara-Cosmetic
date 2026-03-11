'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { getFirebaseAuth } from '@/lib/firebase';
import { 
  ArrowLeftIcon,
  ShoppingBagIcon,
  MapPinIcon,
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      province: string;
    };
  };
  items: Array<{
    name: string;
    nameEn: string;
    quantity: number;
    price: number;
    total: number;
    image?: string;
  }>;
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  statusHistory?: Array<{
    status: string;
    timestamp: string;
    note?: string;
  }>;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return; // Wait for auth to load
    
    if (!user) {
      router.replace('/');
      return;
    }
    if (params?.id) {
      fetchOrder();
    }
  }, [params?.id, user, authLoading]);

  const fetchOrder = async () => {
    try {
      const firebaseUser = getFirebaseAuth().currentUser;
      if (!firebaseUser) {
        setError('Please login again');
        setLoading(false);
        return;
      }

      const token = await firebaseUser.getIdToken();
      const res = await fetch(`/api/user/orders/${params.id}`, {
        headers: {
          'Authorization': 'Bearer ' + token,
        },
      });
      
      if (!res.ok) {
        throw new Error('Order not found');
      }
      
      const data = await res.json();
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Order not found');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(language === 'km' ? 'km-KH' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending': return <ClockIcon className="w-5 h-5" />;
      case 'processing': return <ShoppingBagIcon className="w-5 h-5" />;
      case 'shipped': return <TruckIcon className="w-5 h-5" />;
      case 'delivered': return <CheckCircleIcon className="w-5 h-5" />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    if (language === 'km') {
      switch(status) {
        case 'pending': return 'កំពុងរង់ចាំ';
        case 'processing': return 'កំពុងដំណើរការ';
        case 'shipped': return 'កំពុងដឹកជញ្ជូន';
        case 'delivered': return 'បានដឹកជញ្ជូន';
        case 'cancelled': return 'បានបោះបង់';
        default: return status;
      }
    }
    return status;
  };

  const getTrackingSteps = () => {
    const steps: Array<{ status: string; label: string; date: Date | null }> = [
      { status: 'pending', label: language === 'km' ? 'កំពុងរង់ចាំ' : 'Pending', date: null },
      { status: 'processing', label: language === 'km' ? 'កំពុងដំណើរការ' : 'Processing', date: null },
      { status: 'shipped', label: language === 'km' ? 'កំពុងដឹកជញ្ជូន' : 'Shipped', date: null },
      { status: 'delivered', label: language === 'km' ? 'បានដឹកជញ្ជូន' : 'Delivered', date: null },
    ];

    // Use status history if available, otherwise fallback to current status
    if (order?.statusHistory && order.statusHistory.length > 0) {
      order.statusHistory.forEach((history) => {
        const stepIndex = steps.findIndex(s => s.status === history.status);
        if (stepIndex !== -1) {
          steps[stepIndex].date = new Date(history.timestamp);
        }
      });
    } else {
      // Fallback: estimate based on current status
      const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
      const currentStatusIndex = statusOrder.indexOf(order?.orderStatus || 'pending');

      if (order) {
        const orderDate = new Date(order.createdAt);
        steps[0].date = orderDate;

        if (currentStatusIndex >= 1) {
          steps[1].date = new Date(orderDate.getTime() + 24 * 60 * 60 * 1000);
        }
        if (currentStatusIndex >= 2) {
          steps[2].date = new Date(orderDate.getTime() + 48 * 60 * 60 * 1000);
        }
        if (currentStatusIndex >= 3) {
          steps[3].date = new Date(orderDate.getTime() + 72 * 60 * 60 * 1000);
        }
      }
    }

    return steps;
  };

  const formatTrackingDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString(language === 'km' ? 'km-KH' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/account" className="text-gray-600 hover:text-gray-900">
            ← {language === 'km' ? 'ត្រលប់ទៅគណនី' : 'Back to Account'}
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={`max-w-4xl mx-auto px-4 py-8 ${language === 'km' ? 'khmer-text' : 'english-text'}`}>
        {/* Back button */}
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span className={language === 'km' ? 'khmer-text' : 'english-text'}>{language === 'km' ? 'ត្រលប់ទៅគណនី' : 'Back to Account'}</span>
        </Link>

        {/* Order Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {language === 'km' ? 'ការបញ្ជាទិញ' : 'Order'} <span className={language === 'km' ? 'khmer-text' : 'english-text'}>{order.orderNumber}</span>
              </h1>
              <p className="text-gray-500">
                {formatDate(order.createdAt)}
              </p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${getStatusColor(order.orderStatus)}`}>
              {getStatusIcon(order.orderStatus)}
              <span className={`font-medium ${language === 'km' ? 'khmer-text' : 'english-text'}`}>{getStatusText(order.orderStatus)}</span>
            </div>
          </div>

          {/* Tracking Timeline */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-6">
              {language === 'km' ? 'ការតាមដានការបញ្ជាទិញ' : 'Order Tracking'}
            </h3>
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                  style={{
                    width: order.orderStatus === 'pending' || order.orderStatus === 'processing' ? '25%' :
                           order.orderStatus === 'shipped' ? '66%' : 
                           order.orderStatus === 'delivered' ? '100%' : '0%'
                  }}
                />
              </div>

              {/* Steps */}
              <div className="relative grid grid-cols-4 gap-2">
                {getTrackingSteps().map((step, index) => {
                  const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
                  const currentIndex = statusOrder.indexOf(order.orderStatus);
                  const isCompleted = currentIndex === -1 ? index === 0 : index <= currentIndex;
                  const isCurrent = currentIndex === -1 ? index === 0 : index === currentIndex;

                  return (
                    <div key={step.status} className="flex flex-col items-center">
                      {/* Circle */}
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                        ${isCompleted 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-300'}
                        ${isCurrent ? 'ring-4 ring-green-200 scale-110' : ''}
                      `}>
                        {isCompleted ? (
                          <CheckCircleIcon className="w-5 h-5" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-300" />
                        )}
                      </div>

                      {/* Label */}
                      <p className={`
                        text-xs font-medium mt-2 text-center
                        ${isCompleted ? 'text-green-700' : 'text-gray-400'}
                      `}>
                        {step.label}
                      </p>

                      {/* Date */}
                      {step.date && (
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTrackingDate(step.date)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tracking Info */}
          {order.trackingNumber && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-1">
                {language === 'km' ? 'លេខតាមដាន' : 'Tracking Number'}
              </p>
              <p className={`font-medium ${language === 'km' ? 'khmer-text' : 'english-text'}`}>{order.trackingNumber}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-medium mb-4">
                {language === 'km' ? 'ទំនិញក្នុងការបញ្ជាទិញ' : 'Order Items'}
              </h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={language === 'km' ? item.name : item.nameEn}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBagIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-medium text-gray-900 ${language === 'km' ? 'khmer-text' : 'english-text'}`}>
                        {language === 'km' ? item.name : item.nameEn}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {item.quantity} x {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {formatPrice(item.total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={`text-gray-600 ${language === 'km' ? 'khmer-text' : 'english-text'}`}>
                    {language === 'km' ? 'សរុបរង' : 'Subtotal'}
                  </span>
                  <span className="font-medium">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={`text-gray-600 ${language === 'km' ? 'khmer-text' : 'english-text'}`}>
                    {language === 'km' ? 'ថ្លៃដឹកជញ្ជូន' : 'Shipping'}
                  </span>
                  <span className="font-medium">{formatPrice(order.shippingFee)}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2">
                  <span className={language === 'km' ? 'khmer-text' : 'english-text'}>{language === 'km' ? 'សរុប' : 'Total'}</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPinIcon className="w-5 h-5 text-gray-400" />
                <h2 className={`font-medium ${language === 'km' ? 'khmer-text' : 'english-text'}`}>
                  {language === 'km' ? 'អាសយដ្ឋានដឹកជញ្ជូន' : 'Shipping Address'}
                </h2>
              </div>
              <div className="space-y-1 text-sm">
                <p className={`font-medium ${language === 'km' ? 'khmer-text' : 'english-text'}`}>{order.customer.name}</p>
                <p className="text-gray-600">{order.customer.phone}</p>
                <p className="text-gray-600">
                  {order.customer.address.street}<br />
                  {order.customer.address.city}, {order.customer.address.province}
                </p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCardIcon className="w-5 h-5 text-gray-400" />
                <h2 className={`font-medium ${language === 'km' ? 'khmer-text' : 'english-text'}`}>
                  {language === 'km' ? 'ព័ត៌មានការទូទាត់' : 'Payment Info'}
                </h2>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={`text-gray-600 ${language === 'km' ? 'khmer-text' : 'english-text'}`}>
                    {language === 'km' ? 'ស្ថានភាព' : 'Status'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {order.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={`text-gray-600 ${language === 'km' ? 'khmer-text' : 'english-text'}`}>
                    {language === 'km' ? 'វិធីបង់ប្រាក់' : 'Method'}
                  </span>
                  <span className="font-medium">Bakong</span>
                </div>
              </div>
            </div>

            {/* Need Help? */}
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <p className={`text-sm text-gray-600 mb-2 ${language === 'km' ? 'khmer-text' : 'english-text'}`}>
                {language === 'km' ? 'ត្រូវការជំនួយ?' : 'Need help?'}
              </p>
              <Link
                href="/contact"
                className={`text-sm text-gray-900 hover:underline ${language === 'km' ? 'khmer-text' : 'english-text'}`}
              >
                {language === 'km' ? 'ទាក់ទងមកយើង' : 'Contact us'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
