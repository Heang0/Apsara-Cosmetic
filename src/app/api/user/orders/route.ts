import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { getFirebaseAdminAuth } from '@/lib/firebase-admin';

const PAYMENT_WINDOW_MS = 24 * 60 * 60 * 1000; // 1 day

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decodedToken = await getFirebaseAdminAuth().verifyIdToken(token);
    const email = decodedToken.email;

    if (!email) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();

    const orders = await Order.find({ 'customer.email': email })
      .sort({ createdAt: -1 })
      .lean();

    const now = Date.now();

    const staleUnpaidIds = orders
      .filter((order: any) => {
        const isBakong = order.paymentMethod === 'bakong';
        const isUnpaid = order.paymentStatus !== 'paid';
        const ageMs = now - new Date(order.createdAt).getTime();
        return isBakong && isUnpaid && ageMs > PAYMENT_WINDOW_MS;
      })
      .map((order: any) => order._id);

    if (staleUnpaidIds.length > 0) {
      await Order.updateMany(
        { _id: { $in: staleUnpaidIds } },
        { $set: { paymentStatus: 'failed', orderStatus: 'cancelled' } }
      );
    }

    // Remove unpaid orders older than 1 day from account view.
    const visibleOrders = orders.filter((order: any) => {
      const isBakong = order.paymentMethod === 'bakong';
      const isUnpaid = order.paymentStatus !== 'paid';
      const ageMs = now - new Date(order.createdAt).getTime();
      return !(isBakong && isUnpaid && ageMs > PAYMENT_WINDOW_MS);
    });

    const withPayMeta = visibleOrders.map((order: any) => {
      const ageMs = now - new Date(order.createdAt).getTime();
      const isBakong = order.paymentMethod === 'bakong';
      const canPayNow = isBakong && order.paymentStatus !== 'paid' && ageMs <= PAYMENT_WINDOW_MS;

      return {
        ...order,
        _id: String(order._id),
        canPayNow,
        payUntil: canPayNow
          ? new Date(new Date(order.createdAt).getTime() + PAYMENT_WINDOW_MS).toISOString()
          : null
      };
    });

    return NextResponse.json(withPayMeta);
  } catch (error) {
    console.error('Get user orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
