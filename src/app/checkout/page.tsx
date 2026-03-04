'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { ShoppingBagIcon, MapPinIcon, PlusIcon } from '@heroicons/react/24/outline';
import axios, { AxiosError } from 'axios';

interface CartItem {
  _id: string;
  name: string;
  nameEn: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  isDefault: boolean;
}

interface PaymentCheckResponse {
  status: 'pending' | 'paid' | 'error';
  message?: string;
  retryAfterMs?: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { user } = useAuth();
  const { items, totalPrice, clearCart, validateCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [khqrRaw, setKhqrRaw] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'error'>('pending');
  const [paymentMessage, setPaymentMessage] = useState('');
  const [paymentCheckTick, setPaymentCheckTick] = useState(0);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    province: '',
    notes: '',
  });
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    province: '',
    isDefault: false,
  });
  const BAKONG_LOGO_URL = 'https://bakong.nbc.gov.kh/images/favicon.png';

  // Load saved addresses
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const savedAddresses = localStorage.getItem('userAddresses');
    if (savedAddresses) {
      const addresses = JSON.parse(savedAddresses);
      setSavedAddresses(addresses);

      // Select default address if exists
      const defaultAddress = addresses.find((a: Address) => a.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
        setFormData({
          name: defaultAddress.name,
          email: user.email || '',
          phone: defaultAddress.phone,
          street: defaultAddress.street,
          city: defaultAddress.city,
          province: defaultAddress.province,
          notes: '',
        });
      }
    }
  }, [user]);

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

  useEffect(() => {
    if (!orderId || !qrCode || paymentStatus === 'paid') {
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const checkPayment = async () => {
      try {
        const response = await fetch(`/api/bakong/check-payment?orderId=${orderId}`, {
          cache: 'no-store'
        });
        const data: PaymentCheckResponse = await response.json();

        if (data.status === 'paid') {
          setPaymentStatus('paid');
          setPaymentMessage(language === 'km'
            ? 'បានបញ្ជាក់ការបង់ប្រាក់ដោយស្វ័យប្រវត្តិ'
            : 'Payment confirmed automatically');
          clearCart();
          sessionStorage.removeItem('checkoutItems');
          setTimeout(() => {
            router.push('/order-confirmation/' + orderId);
          }, 1200);
          return;
        }

        if (data.status === 'error') {
          setPaymentStatus('error');
          setPaymentMessage(data.message || 'Payment check failed. Retrying...');
        } else {
          setPaymentStatus('pending');
          setPaymentMessage(data.message || (language === 'km'
            ? 'កំពុងរង់ចាំការបញ្ជាក់ការបង់ប្រាក់...'
            : 'Waiting for payment confirmation...'));
        }

        const nextDelay = Math.max(3000, Number(data.retryAfterMs) || 4000);
        if (!cancelled) {
          timeoutId = setTimeout(checkPayment, nextDelay);
        }
      } catch (error) {
        setPaymentStatus('error');
        setPaymentMessage(language === 'km'
          ? 'បណ្តាញត្រួតពិនិត្យការបង់ប្រាក់មានបញ្ហា, កំពុងព្យាយាមម្តងទៀត...'
          : 'Payment verification network issue, retrying...');
        if (!cancelled) {
          timeoutId = setTimeout(checkPayment, 7000);
        }
      }
    };

    checkPayment();

    return () => {
      cancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [orderId, qrCode, paymentStatus, paymentCheckTick, language, clearCart, router]);

  const handleAddressSelect = (addressId: string) => {
    const address = savedAddresses.find(a => a.id === addressId);
    if (address) {
      setSelectedAddressId(addressId);
      setFormData({
        name: address.name,
        email: user?.email || '',
        phone: address.phone,
        street: address.street,
        city: address.city,
        province: address.province,
        notes: formData.notes,
      });
    }
  };

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();

    const newAddressObj: Address = {
      id: Date.now().toString(),
      ...newAddress,
    };

    let updatedAddresses = [...savedAddresses, newAddressObj];

    if (newAddress.isDefault || savedAddresses.length === 0) {
      updatedAddresses = updatedAddresses.map(addr => ({
        ...addr,
        isDefault: addr.id === newAddressObj.id,
      }));
    }

    localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses));
    setSavedAddresses(updatedAddresses);
    setSelectedAddressId(newAddressObj.id);
    setFormData({
      name: newAddressObj.name,
      email: user?.email || '',
      phone: newAddressObj.phone,
      street: newAddressObj.street,
      city: newAddressObj.city,
      province: newAddressObj.province,
      notes: formData.notes,
    });

    setShowAddressForm(false);
    setNewAddress({
      name: '',
      phone: '',
      street: '',
      city: '',
      province: '',
      isDefault: false,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const shippingFee = 1.50;
  const subtotal = totalPrice;
  const total = subtotal + shippingFee;

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
        // Attach telegramChatId so the backend can send payment confirmation via Telegram
        telegramChatId: typeof window !== 'undefined' ? (localStorage.getItem('telegramChatId') || undefined) : undefined,
      };

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
        orderId: order._id,
        orderNumber: order.orderNumber,
        customerName: formData.name,
      });

      if (qrRes.data.qrCode) {
        setQrCode(qrRes.data.qrCode);
        setKhqrRaw(qrRes.data.khqr || null);
        setPaymentStatus('pending');
        setPaymentMessage(language === 'km'
          ? 'សូមស្កេន QR ហើយរង់ចាំការបញ្ជាក់ស្វ័យប្រវត្តិ'
          : 'Please scan the QR and wait for automatic confirmation');
        setLoading(false);
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  if (qrCode) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 text-center">
            <h1 className={language === 'km' ? 'khmer-text text-2xl font-bold mb-4' : 'english-text text-2xl font-bold mb-4'}>
              {language === 'km' ? 'ស្កេន QR ដើម្បីបង់ប្រាក់' : 'Scan QR to Pay'}
            </h1>
            <div className="bg-gray-50 p-4 rounded-lg inline-block mb-4">
              <div className="relative w-64 h-64 mx-auto">
                <img
                  src={qrCode}
                  alt="Bakong QR"
                  className="w-64 h-64 mx-auto"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center">
                    <img src={BAKONG_LOGO_URL} alt="Bakong" className="w-8 h-8 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
            <p className={`text-sm text-gray-500 mb-1 ${language === 'km' ? 'khmer-text' : 'english-text'}`}>
              {language === 'km' ? 'ចំនួនទឹកប្រាក់:' : 'Amount:'} {formatPrice(total)}
            </p>
            <p className={`text-sm text-gray-500 mb-2 ${language === 'km' ? 'khmer-text' : 'english-text'}`}>
              {language === 'km' ? 'លេខកុម្ម៉ង់:' : 'Order ID:'} {orderNumber}
            </p>
            <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-blue-50 border border-blue-100 mb-3">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              <span className={`text-sm text-blue-700 font-medium ${language === 'km' ? 'khmer-text' : 'english-text'}`}>
                {paymentStatus === 'paid'
                  ? (language === 'km' ? 'បានបង់ប្រាក់រួចរាល់' : 'Paid')
                  : (language === 'km' ? 'កំពុងរង់ចាំការបញ្ជាក់...' : 'Waiting for confirmation...')}
              </span>
            </div>
            {paymentMessage && (
              <p className={`text-xs text-gray-500 mb-3 ${language === 'km' ? 'khmer-text' : 'english-text'}`}>{paymentMessage}</p>
            )}
            <button
              type="button"
              onClick={() => setPaymentCheckTick((prev) => prev + 1)}
              className={`text-xs px-4 py-2 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition ${language === 'km' ? 'khmer-text' : 'english-text'}`}
            >
              {language === 'km' ? 'ខ្ញុំបានបង់ហើយ ពិនិត្យឥឡូវ' : 'I already paid, check now'}
            </button>
            {khqrRaw && (
              <p className="text-[11px] text-gray-400 mt-3 break-all">
                KHQR Ref: {khqrRaw.slice(0, 36)}...
              </p>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <h1 className="khmer-text text-2xl sm:text-3xl font-light text-gray-900 mb-8">
          {language === 'km' ? 'ការបញ្ជាទិញ' : 'Checkout'}
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Saved Addresses */}
            {savedAddresses.length > 0 && !showAddressForm && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPinIcon className="w-5 h-5 text-gray-400" />
                  <h2 className="khmer-text text-lg font-medium">
                    {language === 'km' ? 'អាសយដ្ឋានរបស់ខ្ញុំ' : 'My Addresses'}
                  </h2>
                </div>

                <div className="space-y-3">
                  {savedAddresses.map((address) => (
                    <label
                      key={address.id}
                      className={`block p-4 border rounded-lg cursor-pointer transition ${selectedAddressId === address.id
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-400'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="selectedAddress"
                          checked={selectedAddressId === address.id}
                          onChange={() => handleAddressSelect(address.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="khmer-text font-medium">{address.name}</p>
                            {address.isDefault && (
                              <span className="text-xs bg-gray-900 text-white px-2 py-0.5 rounded">
                                {language === 'km' ? 'លំនាំដើម' : 'Default'}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{address.phone}</p>
                          <p className="text-sm text-gray-600">
                            {address.street}, {address.city}, {address.province}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddressForm(true)}
                  className="mt-4 w-full py-3 border-2 border-dashed border-gray-200 rounded-lg hover:border-gray-900 transition flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span className="khmer-text">
                    {language === 'km' ? 'បន្ថែមអាសយដ្ឋានថ្មី' : 'Add New Address'}
                  </span>
                </button>
              </div>
            )}

            {/* Add New Address Form */}
            {showAddressForm && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="khmer-text text-lg font-medium">
                    {language === 'km' ? 'បន្ថែមអាសយដ្ឋានថ្មី' : 'Add New Address'}
                  </h2>
                  {savedAddresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="text-sm text-gray-500 hover:text-gray-900"
                    >
                      {language === 'km' ? 'បោះបង់' : 'Cancel'}
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder={language === 'km' ? 'ឈ្មោះអ្នកទទួល' : 'Recipient Name'}
                    value={newAddress.name}
                    onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                    className={`w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 ${language === 'km' ? 'khmer-text' : ''}`}
                  />
                  <input
                    type="tel"
                    placeholder={language === 'km' ? 'លេខទូរស័ព្ទ' : 'Phone Number'}
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className={`w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 ${language === 'km' ? 'khmer-text' : ''}`}
                  />
                  <input
                    type="text"
                    placeholder={language === 'km' ? 'អាសយដ្ឋានលម្អិត' : 'Street Address'}
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    className={`w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 ${language === 'km' ? 'khmer-text' : ''}`}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder={language === 'km' ? 'ទីក្រុង' : 'City'}
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className={`w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 ${language === 'km' ? 'khmer-text' : ''}`}
                    />
                    <input
                      type="text"
                      placeholder={language === 'km' ? 'ខេត្ត' : 'Province'}
                      value={newAddress.province}
                      onChange={(e) => setNewAddress({ ...newAddress, province: e.target.value })}
                      className={`w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 ${language === 'km' ? 'khmer-text' : ''}`}
                    />
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newAddress.isDefault}
                      onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                      className="w-4 h-4 border-gray-300 rounded"
                    />
                    <span className="khmer-text text-sm text-gray-600">
                      {language === 'km' ? 'កំណត់ជាអាសយដ្ឋានលំនាំដើម' : 'Set as default address'}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddNewAddress}
                    className="w-full py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                  >
                    {language === 'km' ? 'រក្សាទុក' : 'Save Address'}
                  </button>
                </div>
              </div>
            )}

            {/* Manual Entry Form (shown if no saved addresses) */}
            {savedAddresses.length === 0 && !showAddressForm && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPinIcon className="w-5 h-5 text-gray-400" />
                  <h2 className="khmer-text text-lg font-medium">
                    {language === 'km' ? 'អាសយដ្ឋានដឹកជញ្ជូន' : 'Shipping Address'}
                  </h2>
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="name"
                    placeholder={language === 'km' ? 'ឈ្មោះពេញ' : 'Full Name'}
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 ${language === 'km' ? 'khmer-text' : ''}`}
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder={language === 'km' ? 'លេខទូរស័ព្ទ' : 'Phone Number'}
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 ${language === 'km' ? 'khmer-text' : ''}`}
                  />
                  <input
                    type="text"
                    name="street"
                    placeholder={language === 'km' ? 'អាសយដ្ឋានលម្អិត' : 'Street Address'}
                    required
                    value={formData.street}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 ${language === 'km' ? 'khmer-text' : ''}`}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="city"
                      placeholder={language === 'km' ? 'ទីក្រុង/ស្រុក' : 'City/District'}
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 ${language === 'km' ? 'khmer-text' : ''}`}
                    />
                    <input
                      type="text"
                      name="province"
                      placeholder={language === 'km' ? 'ខេត្ត' : 'Province'}
                      required
                      value={formData.province}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 ${language === 'km' ? 'khmer-text' : ''}`}
                    />
                  </div>
                  <textarea
                    name="notes"
                    placeholder={language === 'km' ? 'កំណត់ចំណាំ (មិនចាំបាច់)' : 'Order Notes (optional)'}
                    rows={3}
                    value={formData.notes}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 ${language === 'km' ? 'khmer-text' : ''}`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <h2 className="khmer-text text-lg font-medium mb-4">
                {language === 'km' ? 'សង្ខេបការបញ្ជាទិញ' : 'Order Summary'}
              </h2>

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
                  {loading ? (language === 'km' ? 'កំពុងដំណើរការ...' : 'Processing...') : (language === 'km' ? 'បញ្ជាទិញ' : 'Place Order')}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}

