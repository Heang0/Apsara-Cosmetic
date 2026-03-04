import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

const cleanEnvValue = (value?: string) => {
  if (!value) return '';
  return String(value).trim().replace(/^['"]|['"]$/g, '');
};

const getBakongBaseUrl = () => {
  const env = cleanEnvValue(process.env.BAKONG_ENV || 'sandbox').toLowerCase();
  const isProduction = ['production', 'prod', 'live'].includes(env);
  return isProduction
    ? 'https://api-bakong.nbc.gov.kh/v1'
    : 'https://sit-api-bakong.nbc.gov.kh/v1';
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = String(searchParams.get('orderId') || '').trim();

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid orderId' },
        { status: 400 }
      );
    }

    await connectDB();
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { status: 'error', message: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.paymentStatus === 'paid') {
      return NextResponse.json({ status: 'paid' });
    }

    const md5 = String(order.bakongTransactionId || '').trim();
    if (!md5) {
      return NextResponse.json({
        status: 'pending',
        retryAfterMs: 4000,
        message: 'Waiting for payment reference...'
      });
    }

    const accessToken = cleanEnvValue(process.env.BAKONG_TOKEN);
    if (!accessToken) {
      return NextResponse.json({
        status: 'pending',
        retryAfterMs: 8000,
        message: 'Bakong token is not configured on server'
      });
    }

    const response = await fetch(`${getBakongBaseUrl()}/check_transaction_by_md5`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/plain, */*',
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'apsara-bakong-check/1.0'
      },
      body: JSON.stringify({ md5 }),
      cache: 'no-store'
    });

    const data = await response.json().catch(() => ({}));
    const responseCode = data?.responseCode ?? data?.response_code;
    const isPaid = responseCode === 0 || responseCode === '0';

    if (isPaid) {
      order.paymentStatus = 'paid';
      if (order.orderStatus === 'pending') {
        order.orderStatus = 'processing';
      }
      await order.save();

      return NextResponse.json({ status: 'paid' });
    }

    return NextResponse.json({
      status: 'pending',
      retryAfterMs: response.ok ? 4000 : 8000
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to check payment';
    console.error('Bakong check-payment error:', message);
    return NextResponse.json({
      status: 'pending',
      retryAfterMs: 10000,
      message: 'Payment check temporarily unavailable'
    });
  }
}
