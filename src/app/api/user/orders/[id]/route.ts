import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { getFirebaseAdminAuth } from '@/lib/firebase-admin';

const PAYMENT_WINDOW_MS = 24 * 60 * 60 * 1000; // 1 day

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const order = await Order.findOne({
      _id: id,
      'customer.email': email
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const ageMs = Date.now() - new Date(order.createdAt).getTime();
    const isBakong = order.paymentMethod === 'bakong';
    const isUnpaid = order.paymentStatus !== 'paid';
    const isExpired = isBakong && isUnpaid && ageMs > PAYMENT_WINDOW_MS;

    if (isExpired) {
      order.paymentStatus = 'failed';
      order.orderStatus = 'cancelled';
      await order.save();

      return NextResponse.json(
        { error: 'Payment window expired for this order' },
        { status: 410 }
      );
    }

    return NextResponse.json({
      ...order.toObject(),
      _id: String(order._id),
      canPayNow: isBakong && isUnpaid,
      payUntil: (isBakong && isUnpaid)
        ? new Date(new Date(order.createdAt).getTime() + PAYMENT_WINDOW_MS).toISOString()
        : null
    });
  } catch (error) {
    console.error('Get single order error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
