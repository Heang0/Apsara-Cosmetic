import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import QRCode from 'qrcode';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { BAKONG_QR_TTL_MS } from '@/lib/bakong-payment';
import { enforceSameOrigin } from '@/lib/request-origin';

const cleanEnvValue = (value?: string) => {
  if (!value) return '';
  return String(value).trim().replace(/^['"]|['"]$/g, '');
};

const renderQrCode = (khqrString: string) =>
  QRCode.toDataURL(khqrString, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 320,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });

export async function POST(request: Request) {
  try {
    const originError = enforceSameOrigin(request);
    if (originError) {
      return originError;
    }

    const body = await request.json();

    const orderIdRaw = String(body?.orderId || '').trim();
    if (!orderIdRaw || !mongoose.Types.ObjectId.isValid(orderIdRaw)) {
      return NextResponse.json(
        { error: 'Valid orderId is required' },
        { status: 400 }
      );
    }

    const orderId = orderIdRaw;

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

    await connectDB();
    const order = await Order.findById(orderId).select(
      'total orderNumber paymentStatus orderStatus bakongQrCode bakongExpiresAt'
    );

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.paymentStatus === 'paid') {
      return NextResponse.json(
        { error: 'Order is already paid' },
        { status: 409 }
      );
    }

    if (order.orderStatus === 'cancelled') {
      return NextResponse.json(
        { error: 'Order is no longer payable' },
        { status: 410 }
      );
    }

    const amount = Number(order.total);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Order total is invalid' },
        { status: 400 }
      );
    }

    const billNumber = String(order.orderNumber || body?.orderNumber || `ORDER-${Date.now()}`).slice(0, 25);
    const existingExpiryMs = order.bakongExpiresAt ? new Date(order.bakongExpiresAt).getTime() : 0;

    if (order.bakongQrCode && existingExpiryMs > Date.now()) {
      const qrCode = await renderQrCode(String(order.bakongQrCode));
      const khqrAmount = isUSD
        ? Number(amount.toFixed(2))
        : Math.round(amount * exchangeRate);

      return NextResponse.json({
        qrCode,
        merchantName,
        amountUSD: Number(amount.toFixed(2)),
        amountKHR: isUSD ? null : khqrAmount,
        currency: isUSD ? 'USD' : 'KHR',
        orderId,
        expiresAt: new Date(existingExpiryMs).toISOString()
      });
    }

    const { BakongKHQR, IndividualInfo, khqrData } = await import('bakong-khqr');
    const khqr = new BakongKHQR();

    const khqrAmount = isUSD
      ? Number(amount.toFixed(2))
      : Math.round(amount * exchangeRate);
    const expiresAtMs = Date.now() + BAKONG_QR_TTL_MS;

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
    const qrCode = await renderQrCode(khqrString);

    await Order.findByIdAndUpdate(orderId, {
      bakongTransactionId: md5,
      bakongQrCode: khqrString,
      bakongExpiresAt: new Date(expiresAtMs)
    });

    return NextResponse.json({
      qrCode,
      md5,
      merchantName,
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
