'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useLanguage } from '@/context/LanguageContext';
import { MagnifyingGlassIcon, EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  firstOrder: string;
  lastOrder: string;
  addresses: Array<{
    street: string;
    city: string;
    province: string;
  }>;
}

export default function CustomersPage() {
  const { language } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [searchQuery, customers]);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/customers', {
        headers: {
          'Authorization': 'Bearer ' + token,
        },
      });
      const data = await res.json();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    if (searchQuery.trim() === '') {
      setFilteredCustomers(customers);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = customers.filter(customer => 
      customer.name.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      customer.phone.includes(query)
    );
    setFilteredCustomers(filtered);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const pageTitle = language === 'km' ? 'អតិថិជន' : 'Customers';
  const pageSubtitle = language === 'km' ? 'គ្រប់គ្រងអតិថិជន' : 'Manage your customers';
  const searchPlaceholder = language === 'km' ? 'ស្វែងរកអតិថិជន...' : 'Search customers...';
  const totalOrdersText = language === 'km' ? 'ការបញ្ជាទិញសរុប' : 'Total Orders';
  const totalSpentText = language === 'km' ? 'ទឹកប្រាក់សរុប' : 'Total Spent';
  const firstOrderText = language === 'km' ? 'ការបញ្ជាទិញដំបូង' : 'First Order';
  const lastOrderText = language === 'km' ? 'ការបញ្ជាទិញចុងក្រោយ' : 'Last Order';
  const contactInfoText = language === 'km' ? 'ព័ត៌មានទំនាក់ទំនង' : 'Contact Information';
  const addressText = language === 'km' ? 'អាសយដ្ឋាន' : 'Address';
  const noCustomersText = language === 'km' ? 'មិនទាន់មានអតិថិជននៅឡើយទេ' : 'No customers yet';

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">{language === 'km' ? 'កំពុងផ្ទុក...' : 'Loading...'}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="khmer-text text-2xl font-bold text-gray-900 mb-2">{pageTitle}</h1>
          <p className="english-text text-gray-500">{pageSubtitle}</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Customers Grid */}
        {filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="khmer-text text-gray-400 text-lg">{noCustomersText}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                onClick={() => setSelectedCustomer(customer)}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition cursor-pointer"
              >
                {/* Customer Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="khmer-text text-lg font-medium text-gray-900 mb-1">
                      {customer.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <EnvelopeIcon className="w-4 h-4" />
                      <span className="english-text">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <PhoneIcon className="w-4 h-4" />
                      <span className="english-text">{customer.phone}</span>
                    </div>
                  </div>
                  <div className="bg-gray-100 rounded-full px-3 py-1">
                    <span className="english-text text-sm font-medium">
                      #{customer.totalOrders}
                    </span>
                  </div>
                </div>

                {/* Customer Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">{totalOrdersText}</p>
                    <p className="english-text text-lg font-semibold">{customer.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">{totalSpentText}</p>
                    <p className="english-text text-lg font-semibold">{formatPrice(customer.totalSpent)}</p>
                  </div>
                </div>

                {/* Order Dates */}
                <div className="text-xs text-gray-400">
                  <p>{firstOrderText}: <span className="english-text">{formatDate(customer.firstOrder)}</span></p>
                  <p>{lastOrderText}: <span className="english-text">{formatDate(customer.lastOrder)}</span></p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Customer Detail Modal */}
        {selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="khmer-text text-xl font-bold">{selectedCustomer.name}</h2>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                {/* Contact Info */}
                <div className="mb-6">
                  <h3 className="khmer-text font-medium mb-3">{contactInfoText}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <EnvelopeIcon className="w-4 h-4" />
                      <span className="english-text">{selectedCustomer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <PhoneIcon className="w-4 h-4" />
                      <span className="english-text">{selectedCustomer.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Addresses */}
                <div className="mb-6">
                  <h3 className="khmer-text font-medium mb-3">{addressText}</h3>
                  {selectedCustomer.addresses.map((addr, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-gray-600 mb-2">
                      <MapPinIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="english-text text-sm">
                        {addr.street}, {addr.city}, {addr.province}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">{totalOrdersText}</p>
                    <p className="english-text text-2xl font-bold">{selectedCustomer.totalOrders}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">{totalSpentText}</p>
                    <p className="english-text text-2xl font-bold">{formatPrice(selectedCustomer.totalSpent)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}