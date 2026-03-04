'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { ShoppingBagIcon, CreditCardIcon, MapPinIcon } from '@heroicons/react/24/outline';
import axios, { AxiosError } from 'axios';

interface CartItem {
  _id: string;
  name: string;
  nameEn: string;
  price: number;
  quantity: number;
  image?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { items, totalPrice, clearCart, validateCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    province: '',
    notes: '',
  });

  // Validate cart on page load
  useEffect(() => {
    const validateCartBeforeCheckout = async () => {
      if (items.length > 0) {
        await validateCart();
      }
    };
    validateCartBeforeCheckout();
  }, []); // Runs once on mount

  useEffect(() => {
    const hasItems = items.length > 0;
    const sessionItems = sessionStorage.getItem('checkoutItems');
    
    if (!hasItems && !sessionItems) {
      router.push('/products');
    }
    
    if (hasItems) {
      sessionStorage.setItem('checkoutItems', JSON.stringify(items));
    }
  }, [items, router]);

  const shippingFee = 1.50;
  const subtotal = totalPrice;
  const total = subtotal + shippingFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${year}${month}${day}-${random}`;
  };

  const getOptimizedImage = (url: string, width: number = 100) => {
    if (!url) return '';
    if (url.includes('cloudinary')) {
      return url.replace('/upload/', '/upload/w_' + width + ',c_fill,q_auto,f_auto/');
    }
    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate cart before submitting
      await validateCart();

      const currentItems: CartItem[] = items.length > 0 ? items : JSON.parse(sessionStorage.getItem('checkoutItems') || '[]');
      
      const orderNumber = generateOrderNumber();
      const orderData = {
        orderNumber,
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: {
            street: formData.street,
            city: formData.city,
            province: formData.province,
          },
        },
        items: currentItems.map((item: CartItem) => ({
          product: item._id,
          name: item.name,
          nameEn: item.nameEn,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
          image: item.image,
        })),
        subtotal,
        shippingFee,
        total,
        notes: formData.notes,
      };

      console.log('Creating order:', orderData);

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const order = await orderRes.json();
      setOrderId(order._id);
      setOrderNumber(order.orderNumber);

      const qrRes = await axios.post('/api/bakong/create-qr', {
        amount: total,
        orderId: order.orderNumber,
        customerName: formData.name,
      });

      console.log('QR Response:', qrRes.data);

      if (qrRes.data.qrCode) {
        setQrCode(qrRes.data.qrCode);
      } else {
        throw new Error('No QR code in response');
      }

    } catch (error) {
      console.error('Checkout error:', error);
      
      let errorMessage = 'Unknown error occurred';
      
      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.error || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      alert(language === 'km' 
        ? 'មានបញ្ហាក្នុងការកុម្ម៉ង់: ' + errorMessage
        : 'Checkout failed: ' + errorMessage);
      
      setLoading(false);
    }
  };

  const handlePaymentComplete = () => {
    clearCart();
    sessionStorage.removeItem('checkoutItems');
    router.push('/order-confirmation/' + orderId);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const checkoutTitle = language === 'km' ? 'ការបញ្ជាទិញ' : 'Checkout';
  const contactInfoText = language === 'km' ? 'ព័ត៌មានទំនាក់ទំនង' : 'Contact Information';
  const shippingText = language === 'km' ? 'អាសយដ្ឋានដឹកជញ្ជូន' : 'Shipping Address';
  const orderSummaryText = language === 'km' ? 'សង្ខេបការបញ្ជាទិញ' : 'Order Summary';
  const placeOrderText = language === 'km' ? 'បញ្ជាទិញ' : 'Place Order';
  const scanQRText = language === 'km' ? 'ស្កេន QR ដើម្បីបង់ប្រាក់' : 'Scan QR to Pay';
  const confirmPaymentText = language === 'km' ? 'បញ្ជាក់ការបង់ប្រាក់' : 'Confirm Payment';

  if (qrCode) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 text-center">
            <h1 className="khmer-text text-2xl font-bold mb-4">{scanQRText}</h1>
            <div className="bg-gray-50 p-4 rounded-lg inline-block mb-6">
              <img 
                src={qrCode} 
                alt="Bakong QR" 
                className="w-64 h-64 mx-auto"
                onError={(e) => {
                  e.currentTarget.src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Payment+QR';
                }}
              />
            </div>
            <p className="text-sm text-gray-500 mb-2">
              {language === 'km' ? 'ចំនួនទឹកប្រាក់:' : 'Amount:'} {formatPrice(total)}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {language === 'km' ? 'លេខកុម្ម៉ង់:' : 'Order ID:'} {orderNumber}
            </p>
            <button
              onClick={handlePaymentComplete}
              className="bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition"
            >
              <span className={language === 'km' ? 'khmer-text' : 'english-text'}>{confirmPaymentText}</span>
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <h1 className="khmer-text text-2xl sm:text-3xl font-light text-gray-900 mb-8">{checkoutTitle}</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCardIcon className="w-5 h-5 text-gray-400" />
                <h2 className="khmer-text text-lg font-medium">{contactInfoText}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder={language === 'km' ? 'ឈ្មោះពេញ' : 'Full Name'}
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder={language === 'km' ? 'លេខទូរស័ព្ទ' : 'Phone Number'}
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPinIcon className="w-5 h-5 text-gray-400" />
                <h2 className="khmer-text text-lg font-medium">{shippingText}</h2>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  name="street"
                  placeholder={language === 'km' ? 'អាសយដ្ឋានលម្អិត' : 'Street Address'}
                  required
                  value={formData.street}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="city"
                    placeholder={language === 'km' ? 'ទីក្រុង/ស្រុក' : 'City/District'}
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                  />
                  <input
                    type="text"
                    name="province"
                    placeholder={language === 'km' ? 'ខេត្ត' : 'Province'}
                    required
                    value={formData.province}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                  />
                </div>
                <textarea
                  name="notes"
                  placeholder={language === 'km' ? 'កំណត់ចំណាំ (មិនចាំបាច់)' : 'Order Notes (optional)'}
                  rows={3}
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <h2 className="khmer-text text-lg font-medium mb-4">{orderSummaryText}</h2>
              
              <div className="space-y-4 mb-4 max-h-96 overflow-auto">
                {items.map((item: CartItem) => (
                  <div key={item._id} className="flex gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img 
                          src={getOptimizedImage(item.image, 100)}
                          alt={language === 'km' ? item.name : item.nameEn}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBagIcon className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <p className={'text-sm font-medium text-gray-900 ' + (language === 'km' ? 'khmer-text' : 'english-text')}>
                        {language === 'km' ? item.name : item.nameEn}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} x {formatPrice(item.price)}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="english-text text-sm font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={language === 'km' ? 'khmer-text' : 'english-text'}>
                    {language === 'km' ? 'សរុបរង' : 'Subtotal'}
                  </span>
                  <span className="english-text">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={language === 'km' ? 'khmer-text' : 'english-text'}>
                    {language === 'km' ? 'ថ្លៃដឹកជញ្ជូន' : 'Shipping'}
                  </span>
                  <span className="english-text">{formatPrice(shippingFee)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-gray-100">
                  <span className={language === 'km' ? 'khmer-text' : 'english-text'}>
                    {language === 'km' ? 'សរុប' : 'Total'}
                  </span>
                  <span className="english-text">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
              >
                <span className={language === 'km' ? 'khmer-text' : 'english-text'}>
                  {loading ? (language === 'km' ? 'កំពុងដំណើរការ...' : 'Processing...') : placeOrderText}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}