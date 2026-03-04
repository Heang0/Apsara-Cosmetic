import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { sendOrderNotification, sendLowStockNotification } from '@/lib/telegram';
import { sendOrderReceipt, sendAdminNotification } from '@/lib/email';

// GET all orders (for admin)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    await connectDB();
    
    if (id) {
      const order = await Order.findById(id);
      if (!order) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(order);
    }

    const orders = await Order.find({}).sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('GET orders error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to fetch orders: ' + errorMessage },
      { status: 500 }
    );
  }
}

// POST create new order
export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectDB();

    // Update product stock
    for (const item of body.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    const order = await Order.create({
      ...body,
      orderStatus: 'pending',
      paymentStatus: 'pending',
    });

    // Send Telegram notifications
    try {
      await sendOrderNotification(order);
      
      // Check for low stock products
      for (const item of body.items) {
        const product = await Product.findById(item.product);
        if (product && product.stock < 5) {
          await sendLowStockNotification(product);
        }
      }
    } catch (telegramError) {
      console.error('Telegram notification error:', telegramError);
      // Don't fail the order if telegram fails
    }

    // Send email receipts
    try {
      // Send receipt to customer
      await sendOrderReceipt(order, order.customer.email);
      
      // Send notification to admin
      await sendAdminNotification(order);
      
      console.log('✅ Emails sent successfully for order:', order.orderNumber);
    } catch (emailError) {
      console.error('❌ Failed to send emails:', emailError);
      // Don't fail the order if email fails
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('POST order error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to create order: ' + errorMessage },
      { status: 500 }
    );
  }
}

// PUT update order status
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    await connectDB();
    
    const order = await Order.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('PUT order error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to update order: ' + errorMessage },
      { status: 500 }
    );
  }
}