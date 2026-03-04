'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EyeIcon, TruckIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface Order {
  _id: string;
  orderNumber: string;
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
    quantity: number;
    price: number;
    total: number;
  }>;
  total: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/orders', {
        headers: {
          'Authorization': 'Bearer ' + token,
        },
      });
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string, trackingNumber?: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/orders?id=' + orderId, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({ 
          orderStatus: status,
          trackingNumber: trackingNumber 
        }),
      });

      if (res.ok) {
        fetchOrders();
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Error:', error);
    }
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

  const getPaymentColor = (status: string) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">កំពុងផ្ទុក...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="khmer-text text-2xl font-bold text-gray-900 mb-2">ការបញ្ជាទិញ</h1>
        <p className="english-text text-gray-500">Manage customer orders</p>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Order #</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Customer</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Date</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Items</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Total</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Payment</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Tracking</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <span className="font-medium">{order.orderNumber}</span>
                  </td>
                  <td className="py-4 px-6">
                    <p className="khmer-text font-medium">{order.customer.name}</p>
                    <p className="english-text text-xs text-gray-500">{order.customer.phone}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-600">{formatDate(order.createdAt)}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm">{order.items.length} items</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="english-text font-medium">{formatPrice(order.total)}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={'px-2 py-1 rounded-full text-xs ' + getPaymentColor(order.paymentStatus)}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={'px-2 py-1 rounded-full text-xs ' + getStatusColor(order.orderStatus)}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {order.trackingNumber ? (
                      <span className="text-xs text-gray-600">{order.trackingNumber}</span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="khmer-text text-xl font-bold">ព័ត៌មានការបញ្ជាទិញ</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Order Info */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="khmer-text text-sm text-gray-500 mb-1">លេខកុម្ម៉ង់</p>
                    <p className="english-text font-medium">{selectedOrder.orderNumber}</p>
                  </div>
                  <div>
                    <p className="khmer-text text-sm text-gray-500 mb-1">កាលបរិច្ឆេទ</p>
                    <p className="english-text">{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="khmer-text font-medium mb-3">ព័ត៌មានអតិថិជន</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">ឈ្មោះ</p>
                      <p className="khmer-text">{selectedOrder.customer.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">អ៊ីមែល</p>
                      <p className="english-text">{selectedOrder.customer.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">ទូរស័ព្ទ</p>
                      <p className="english-text">{selectedOrder.customer.phone}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 mb-1">អាសយដ្ឋាន</p>
                      <p className="english-text">
                        {selectedOrder.customer.address.street}, {selectedOrder.customer.address.city}, {selectedOrder.customer.address.province}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="khmer-text font-medium mb-3">ទំនិញ</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="khmer-text">
                          {item.name} x{item.quantity}
                        </span>
                        <span className="english-text">{formatPrice(item.total)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between font-bold mt-4 pt-4 border-t">
                    <span className="khmer-text">សរុប</span>
                    <span className="english-text">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>

                {/* Order Status Update */}
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="khmer-text font-medium mb-3">បច្ចុប្បន្នភាព</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">ស្ថានភាពការបញ្ជាទិញ</label>
                      <select
                        value={selectedOrder.orderStatus}
                        onChange={(e) => updateOrderStatus(selectedOrder._id, e.target.value, selectedOrder.trackingNumber)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-2">លេខតាមដាន (Tracking Number)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={selectedOrder.trackingNumber || ''}
                          onChange={(e) => setSelectedOrder({...selectedOrder, trackingNumber: e.target.value})}
                          placeholder="Enter tracking number"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                        />
                        <button
                          onClick={() => updateOrderStatus(selectedOrder._id, selectedOrder.orderStatus, selectedOrder.trackingNumber)}
                          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                        >
                          រក្សាទុក
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">ស្ថានភាពការទូទាត់</p>
                      <span className={'px-3 py-1.5 rounded-full text-sm ' + getPaymentColor(selectedOrder.paymentStatus)}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
