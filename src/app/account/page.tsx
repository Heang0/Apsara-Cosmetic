'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { 
  UserIcon, 
  ShoppingBagIcon, 
  MapPinIcon, 
  HeartIcon,
  ArrowRightIcon,
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
  CubeIcon,
  DocumentTextIcon,
  CreditCardIcon,
  PlusIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  total: number;
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  items: Array<{
    name: string;
    nameEn: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
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

export default function AccountPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    province: '',
    isDefault: false,
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchOrders();
    fetchAddresses();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return;
      
      const token = await firebaseUser.getIdToken();
      
      const res = await fetch('/api/user/orders', {
        headers: {
          'Authorization': 'Bearer ' + token,
        },
      });
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = () => {
    // Load addresses from localStorage
    const savedAddresses = localStorage.getItem('userAddresses');
    if (savedAddresses) {
      setAddresses(JSON.parse(savedAddresses));
    }
  };

  const saveAddresses = (newAddresses: Address[]) => {
    setAddresses(newAddresses);
    localStorage.setItem('userAddresses', JSON.stringify(newAddresses));
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newAddress: Address = {
      id: Date.now().toString(),
      ...addressForm,
    };

    let updatedAddresses = [...addresses, newAddress];
    
    // If this is the first address or marked as default, update others
    if (addressForm.isDefault || addresses.length === 0) {
      updatedAddresses = updatedAddresses.map(addr => ({
        ...addr,
        isDefault: addr.id === newAddress.id,
      }));
    }

    saveAddresses(updatedAddresses);
    setShowAddressForm(false);
    setAddressForm({
      name: '',
      phone: '',
      street: '',
      city: '',
      province: '',
      isDefault: false,
    });
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm({
      name: address.name,
      phone: address.phone,
      street: address.street,
      city: address.city,
      province: address.province,
      isDefault: address.isDefault,
    });
    setShowAddressForm(true);
  };

  const handleUpdateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingAddress) return;

    let updatedAddresses = addresses.map(addr =>
      addr.id === editingAddress.id
        ? { ...addressForm, id: addr.id }
        : addr
    );

    // Handle default logic
    if (addressForm.isDefault) {
      updatedAddresses = updatedAddresses.map(addr => ({
        ...addr,
        isDefault: addr.id === editingAddress.id,
      }));
    }

    saveAddresses(updatedAddresses);
    setShowAddressForm(false);
    setEditingAddress(null);
    setAddressForm({
      name: '',
      phone: '',
      street: '',
      city: '',
      province: '',
      isDefault: false,
    });
  };

  const handleDeleteAddress = (id: string) => {
    if (confirm(language === 'km' ? 'តើអ្នកប្រាកដថាចង់លុបអាសយដ្ឋាននេះទេ?' : 'Are you sure you want to delete this address?')) {
      const updatedAddresses = addresses.filter(addr => addr.id !== id);
      saveAddresses(updatedAddresses);
    }
  };

  const setDefaultAddress = (id: string) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    }));
    saveAddresses(updatedAddresses);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-gray-100 text-gray-700';
      case 'processing': return 'bg-gray-100 text-gray-700';
      case 'shipped': return 'bg-gray-100 text-gray-700';
      case 'delivered': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-gray-100 text-gray-500 line-through';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending': return <ClockIcon className="w-4 h-4" />;
      case 'processing': return <CubeIcon className="w-4 h-4" />;
      case 'shipped': return <TruckIcon className="w-4 h-4" />;
      case 'delivered': return <CheckCircleIcon className="w-4 h-4" />;
      default: return <DocumentTextIcon className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    if (language === 'km') {
      switch(status) {
        case 'pending': return 'កំពុងរង់ចាំ';
        case 'processing': return 'កំពុងរៀបចំ';
        case 'shipped': return 'កំពុងដឹកជញ្ជូន';
        case 'delivered': return 'បានដឹកជញ្ជូន';
        case 'cancelled': return 'បានបោះបង់';
        default: return status;
      }
    }
    return status;
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
      month: 'short',
      day: 'numeric',
    });
  };

  if (!user) return null;

  const tabs = [
    { 
      id: 'orders', 
      nameKm: 'ការបញ្ជាទិញ', 
      nameEn: 'Orders', 
      icon: ShoppingBagIcon,
      count: orders.length
    },
    { 
      id: 'profile', 
      nameKm: 'ព័ត៌មានផ្ទាល់ខ្លួន', 
      nameEn: 'Profile', 
      icon: UserIcon 
    },
    { 
      id: 'addresses', 
      nameKm: 'អាសយដ្ឋាន', 
      nameEn: 'Addresses', 
      icon: MapPinIcon,
      count: addresses.length
    },
  ];

  const stats = [
    { label: language === 'km' ? 'សរុប' : 'Total', value: orders.length },
    { label: language === 'km' ? 'បានដឹកជញ្ជូន' : 'Delivered', value: orders.filter(o => o.orderStatus === 'delivered').length },
    { label: language === 'km' ? 'កំពុងដំណើរការ' : 'Processing', value: orders.filter(o => o.orderStatus === 'processing' || o.orderStatus === 'pending').length },
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="khmer-text text-2xl sm:text-3xl font-light text-gray-900">
            {language === 'km' ? 'គណនីរបស់ខ្ញុំ' : 'My Account'}
          </h1>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8 overflow-x-auto">
          <div className="flex gap-8 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 px-1 flex items-center gap-2 text-sm font-medium transition border-b-2 ${
                    isActive 
                      ? 'border-gray-900 text-gray-900' 
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className={language === 'km' ? 'khmer-text' : 'english-text'}>
                    {language === 'km' ? tab.nameKm : tab.nameEn}
                  </span>
                  {tab.count !== undefined && (
                    <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* Mini Stats */}
              <div className="grid grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <p className="text-2xl font-light text-gray-900">{stat.value}</p>
                    <p className="khmer-text text-xs text-gray-400 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Orders List */}
              {loading ? (
                <div className="space-y-4">
                  {[1,2,3].map((i) => (
                    <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg"></div>
                  ))}
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <button
                      key={order._id}
                      onClick={() => setSelectedOrder(order)}
                      className="w-full text-left border border-gray-200 rounded-lg p-4 hover:border-gray-900 transition group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">{order.orderNumber}</p>
                        <span className={`khmer-text text-xs px-2 py-1 rounded ${getStatusColor(order.orderStatus)}`}>
                          {getStatusText(order.orderStatus)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <p className="text-gray-500">{formatDate(order.createdAt)}</p>
                        <p className="english-text font-medium">{formatPrice(order.total)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingBagIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="khmer-text text-gray-400">
                    {language === 'km' ? 'មិនទាន់មានការបញ្ជាទិញនៅឡើយទេ' : 'No orders yet'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <UserIcon className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <h2 className="khmer-text text-xl font-medium text-gray-900">{user.name}</h2>
                <p className="text-sm text-gray-400 mt-1">{user.email}</p>
              </div>

              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="khmer-text text-xs text-gray-400 mb-1">
                    {language === 'km' ? 'ឈ្មោះ' : 'Name'}
                  </p>
                  <p className="khmer-text text-gray-900">{user.name}</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Email</p>
                  <p className="english-text text-gray-900">{user.email}</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="khmer-text text-xs text-gray-400 mb-1">
                    {language === 'km' ? 'សមាជិកតាំងពី' : 'Member since'}
                  </p>
                  <p className="khmer-text text-gray-900">
                    {user.metadata?.createdAt ? formatDate(user.metadata.createdAt) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div>
              {/* Address List */}
              {addresses.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {addresses.map((address) => (
                    <div key={address.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="w-5 h-5 text-gray-400" />
                          {address.isDefault && (
                            <span className="khmer-text text-xs bg-gray-900 text-white px-2 py-1 rounded">
                              {language === 'km' ? 'លំនាំដើម' : 'Default'}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditAddress(address)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <PencilIcon className="w-4 h-4 text-gray-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <TrashIcon className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="khmer-text font-medium">{address.name}</p>
                        <p className="text-sm text-gray-600">{address.phone}</p>
                        <p className="text-sm text-gray-600">
                          {address.street}, {address.city}, {address.province}
                        </p>
                      </div>

                      {!address.isDefault && (
                        <button
                          onClick={() => setDefaultAddress(address.id)}
                          className="mt-3 text-xs text-gray-500 hover:text-gray-900"
                        >
                          {language === 'km' ? 'កំណត់ជាលំនាំដើម' : 'Set as default'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MapPinIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="khmer-text text-gray-400 mb-4">
                    {language === 'km' ? 'មិនទាន់មានអាសយដ្ឋាននៅឡើយទេ' : 'No addresses yet'}
                  </p>
                </div>
              )}

              {/* Add Address Button */}
              <button
                onClick={() => setShowAddressForm(true)}
                className="w-full py-3 border-2 border-dashed border-gray-200 rounded-lg hover:border-gray-900 transition flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <PlusIcon className="w-5 h-5" />
                <span className="khmer-text">
                  {language === 'km' ? 'បន្ថែមអាសយដ្ឋាន' : 'Add Address'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Address Form Modal */}
        {(showAddressForm || editingAddress) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/20" onClick={() => {
              setShowAddressForm(false);
              setEditingAddress(null);
              setAddressForm({
                name: '',
                phone: '',
                street: '',
                city: '',
                province: '',
                isDefault: false,
              });
            }} />
            <div className="relative bg-white rounded-lg max-w-md w-full">
              <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
                <h3 className="khmer-text font-medium">
                  {editingAddress 
                    ? (language === 'km' ? 'កែប្រែអាសយដ្ឋាន' : 'Edit Address')
                    : (language === 'km' ? 'បន្ថែមអាសយដ្ឋាន' : 'Add Address')
                  }
                </h3>
                <button 
                  onClick={() => {
                    setShowAddressForm(false);
                    setEditingAddress(null);
                    setAddressForm({
                      name: '',
                      phone: '',
                      street: '',
                      city: '',
                      province: '',
                      isDefault: false,
                    });
                  }} 
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={editingAddress ? handleUpdateAddress : handleAddAddress} className="p-4 space-y-4">
                <div>
                  <label className="khmer-text block text-sm text-gray-600 mb-1">
                    {language === 'km' ? 'ឈ្មោះអ្នកទទួល' : 'Recipient Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.name}
                    onChange={(e) => setAddressForm({...addressForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
                  />
                </div>
                <div>
                  <label className="khmer-text block text-sm text-gray-600 mb-1">
                    {language === 'km' ? 'លេខទូរស័ព្ទ' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
                  />
                </div>
                <div>
                  <label className="khmer-text block text-sm text-gray-600 mb-1">
                    {language === 'km' ? 'អាសយដ្ឋានលម្អិត' : 'Street Address'}
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({...addressForm, street: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="khmer-text block text-sm text-gray-600 mb-1">
                      {language === 'km' ? 'ទីក្រុង' : 'City'}
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
                    />
                  </div>
                  <div>
                    <label className="khmer-text block text-sm text-gray-600 mb-1">
                      {language === 'km' ? 'ខេត្ត' : 'Province'}
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.province}
                      onChange={(e) => setAddressForm({...addressForm, province: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})}
                    className="w-4 h-4 border-gray-300 rounded"
                  />
                  <label htmlFor="isDefault" className="khmer-text text-sm text-gray-600">
                    {language === 'km' ? 'កំណត់ជាអាសយដ្ឋានលំនាំដើម' : 'Set as default address'}
                  </label>
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                  >
                    {language === 'km' ? 'រក្សាទុក' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddressForm(false);
                      setEditingAddress(null);
                      setAddressForm({
                        name: '',
                        phone: '',
                        street: '',
                        city: '',
                        province: '',
                        isDefault: false,
                      });
                    }}
                    className="flex-1 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    {language === 'km' ? 'បោះបង់' : 'Cancel'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/20" onClick={() => setSelectedOrder(null)} />
            <div className="relative bg-white rounded-lg max-w-lg w-full max-h-[80vh] overflow-auto">
              <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
                <h3 className="khmer-text font-medium">
                  {language === 'km' ? 'ព័ត៌មានការបញ្ជាទិញ' : 'Order Details'}
                </h3>
                <button onClick={() => setSelectedOrder(null)} className="p-1 hover:bg-gray-100 rounded">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <p className="khmer-text text-xs text-gray-400 mb-1">
                    {language === 'km' ? 'លេខកុម្ម៉ង់' : 'Order Number'}
                  </p>
                  <p className="font-medium">{selectedOrder.orderNumber}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="khmer-text text-xs text-gray-400 mb-1">
                      {language === 'km' ? 'កាលបរិច្ឆេទ' : 'Date'}
                    </p>
                    <p className="text-sm">{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                  <div>
                    <p className="khmer-text text-xs text-gray-400 mb-1">
                      {language === 'km' ? 'ស្ថានភាព' : 'Status'}
                    </p>
                    <p className="khmer-text text-sm">{getStatusText(selectedOrder.orderStatus)}</p>
                  </div>
                </div>

                <div>
                  <p className="khmer-text text-xs text-gray-400 mb-2">
                    {language === 'km' ? 'ទំនិញ' : 'Items'}
                  </p>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex gap-3">
                        {/* Product Image */}
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={language === 'km' ? item.name : item.nameEn}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <CubeIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1">
                          <p className="khmer-text text-sm font-medium text-gray-900">
                            {language === 'km' ? item.name : item.nameEn}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.quantity} x {formatPrice(item.price)}
                          </p>
                        </div>
                        
                        {/* Total */}
                        <p className="english-text text-sm font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-between font-medium">
                  <span className="khmer-text">{language === 'km' ? 'សរុប' : 'Total'}</span>
                  <span className="english-text">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}