import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(request: Request) {
  try {
    await connectDB();
    
    // Get all orders to extract unique customers
    const orders = await Order.find({}).sort({ createdAt: -1 });
    
    // Create a map of unique customers by email
    const customerMap = new Map();
    
    orders.forEach(order => {
      const email = order.customer.email;
      if (!customerMap.has(email)) {
        customerMap.set(email, {
          id: order._id.toString(),
          name: order.customer.name,
          email: order.customer.email,
          phone: order.customer.phone,
          totalOrders: 1,
          totalSpent: order.total,
          firstOrder: order.createdAt,
          lastOrder: order.createdAt,
          addresses: [order.customer.address]
        });
      } else {
        const customer = customerMap.get(email);
        customer.totalOrders += 1;
        customer.totalSpent += order.total;
        if (new Date(order.createdAt) > new Date(customer.lastOrder)) {
          customer.lastOrder = order.createdAt;
        }
        if (!customer.addresses.some((addr: any) => 
          addr.street === order.customer.address.street &&
          addr.city === order.customer.address.city
        )) {
          customer.addresses.push(order.customer.address);
        }
      }
    });
    
    const customers = Array.from(customerMap.values());
    
    return NextResponse.json(customers);
  } catch (error) {
    console.error('GET customers error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to fetch customers: ' + errorMessage },
      { status: 500 }
    );
  }
}