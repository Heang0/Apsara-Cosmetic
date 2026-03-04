import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

const cleanEnvValue = (value?: string) => {
  if (!value) return '';
  return String(value).trim().replace(/^['"]|['"]$/g, '');
};

const buildQrImageUrl = (khqrString: string) => {
  return [
    'https://quickchart.io/qr',
    '?size=320',
    '&ecLevel=M',
    '&margin=2',
    `&text=${encodeURIComponent(khqrString)}`
  ].join('');
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const amount = Number(body?.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    const orderIdRaw = String(body?.orderId || '').trim();
    const orderId = orderIdRaw || '';
    const orderNumberRaw = String(body?.orderNumber || body?.billNumber || '').trim();
    const billNumber = (orderNumberRaw || orderIdRaw || `ORDER-${Date.now()}`).slice(0, 25);

    const bakongAccountId = cleanEnvValue(process.env.BAKONG_ACCOUNT_ID);
    const merchantName = cleanEnvValue(process.env.BAKONG_MERCHANT_NAME);
    const merchantCity = cleanEnvValue(process.env.BAKONG_MERCHANT_CITY || 'Phnom Penh');
    const storeLabel = cleanEnvValue(process.env.BAKONG_STORE_LABEL || 'SITE-A');
    const terminalLabel = cleanEnvValue(process.env.BAKONG_TERMINAL_LABEL || 'WEB-A');
    const currency = cleanEnvValue(process.env.BAKONG_CURRENCY || 'USD').toUpperCase();
    const exchangeRate = Number(process.env.BAKONG_EXCHANGE_RATE || 4100);
    const isUSD = currency !== 'KHR';

    if (!bakongAccountId || !merchantName) {
      return NextResponse.json(
        { error: 'Missing BAKONG_ACCOUNT_ID or BAKONG_MERCHANT_NAME in environment' },
        { status: 500 }
      );
    }

    const { BakongKHQR, IndividualInfo, khqrData } = await import('bakong-khqr');
    const khqr = new BakongKHQR();

    const khqrAmount = isUSD
      ? Number(amount.toFixed(2))
      : Math.round(amount * exchangeRate);
    const expiresAtMs = Date.now() + (15 * 60 * 1000);

    const optionalData = {
      currency: isUSD ? khqrData.currency.usd : khqrData.currency.khr,
      amount: khqrAmount,
      billNumber,
      storeLabel,
      terminalLabel,
      expirationTimestamp: expiresAtMs
    };

    const individualInfo = new IndividualInfo(
      bakongAccountId,
      merchantName,
      merchantCity,
      optionalData
    );

    const khqrResponse = khqr.generateIndividual(individualInfo);
    const statusCode = khqrResponse?.status?.code;

    if (statusCode !== 0 || !khqrResponse?.data?.qr || !khqrResponse?.data?.md5) {
      return NextResponse.json(
        { error: khqrResponse?.status?.message || 'Failed to generate KHQR' },
        { status: 502 }
      );
    }

    const khqrString = khqrResponse.data.qr;
    const md5 = khqrResponse.data.md5;

    // Persist MD5 reference for dynamic payment-status checks.
    if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
      await connectDB();
      await Order.findByIdAndUpdate(orderId, {
        bakongTransactionId: md5,
        bakongQrCode: khqrString
      });
    }

    return NextResponse.json({
      qrCode: buildQrImageUrl(khqrString),
      khqr: khqrString,
      md5,
      amountUSD: Number(amount.toFixed(2)),
      amountKHR: isUSD ? null : khqrAmount,
      currency: isUSD ? 'USD' : 'KHR',
      orderId,
      expiresAt: new Date(expiresAtMs).toISOString()
    });
  } catch (error) {
    console.error('Bakong KHQR generation error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate Bakong KHQR';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
