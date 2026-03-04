import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
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
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      return NextResponse.json(order);
    }

    const orders = await Order.find({}).sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('GET orders error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Failed to fetch orders: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// POST create new order
export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectDB();

    const { userId, ...incomingOrderData } = body;
    let resolvedTelegramChatId =
      typeof incomingOrderData.telegramChatId === 'string'
        ? incomingOrderData.telegramChatId.trim()
        : '';

    if (typeof userId === 'string' && userId.trim() && mongoose.Types.ObjectId.isValid(userId.trim())) {
      const userRecord = await User.findById(userId.trim()).select('telegramChatId');
      if (userRecord?.telegramChatId) {
        resolvedTelegramChatId = String(userRecord.telegramChatId);
      }
    }

    // Update product stock in one batch to reduce checkout latency.
    const stockOps = (incomingOrderData.items || []).map((item: any) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { stock: -Number(item.quantity || 0) } }
      }
    }));

    if (stockOps.length > 0) {
      await Product.bulkWrite(stockOps);
    }

    const order = await Order.create({
      ...incomingOrderData,
      telegramChatId: resolvedTelegramChatId || undefined,
      orderStatus: 'pending',
      paymentStatus: 'pending'
    });

    // Send notifications asynchronously so order response returns faster.
    void (async () => {
      try {
        await sendOrderNotification(order);

        const productIds = (incomingOrderData.items || []).map((item: any) => item.product);
        if (productIds.length === 0) {
          return;
        }

        const lowStockProducts = await Product.find({
          _id: { $in: productIds },
          stock: { $lt: 5 }
        });

        await Promise.all(
          lowStockProducts.map((product: any) => sendLowStockNotification(product))
        );
      } catch (telegramError) {
        console.error('Telegram notification error:', telegramError);
      }
    })();

    void (async () => {
      try {
        await Promise.all([
          sendOrderReceipt(order, order.customer.email),
          sendAdminNotification(order)
        ]);
      } catch (emailError) {
        console.error('Failed to send emails:', emailError);
      }
    })();

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('POST order error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Failed to create order: ${errorMessage}` },
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
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('PUT order error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Failed to update order: ${errorMessage}` },
      { status: 500 }
    );
  }
}
