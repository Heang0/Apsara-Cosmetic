import { NextResponse } from 'next/server';

// Simple QR code generator using QR Server API as fallback
function generateQRCode(data: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
}

export async function POST(request: Request) {
  try {
    const { amount, orderId, customerName } = await request.json();

    // Get Bakong credentials from env
    const bakongAccountId = process.env.BAKONG_ACCOUNT_ID;
    const merchantName = process.env.BAKONG_MERCHANT_NAME || 'Apsara';
    const storeLabel = process.env.BAKONG_STORE_LABEL || 'SITE-A';

    if (!bakongAccountId) {
      return NextResponse.json(
        { error: 'Bakong account ID not configured' },
        { status: 500 }
      );
    }

    // Create payment data in Bakong format
    const paymentData = {
      type: 'bakong',
      accountId: bakongAccountId,
      merchantName: merchantName,
      storeLabel: storeLabel,
      amount: amount,
      currency: 'USD',
      orderId: orderId,  // Fixed: using the variable from request
      customerName: customerName,
      timestamp: Date.now(),
      description: `Payment for order ${orderId}`
    };

    // Convert to JSON string for QR code
    const jsonString = JSON.stringify(paymentData);
    
    // Generate QR code using QR Server API
    const qrCodeUrl = generateQRCode(jsonString);

    return NextResponse.json({
      qrCode: qrCodeUrl,
      amount: amount,
      orderId: orderId,  // Fixed: using the variable from request
    });

  } catch (error) {
    console.error('Bakong QR generation error:', error);
    
    // Fallback: Generate a simple QR with order info
    const { amount, orderId } = await request.json(); // Added this line to get variables in catch block
    
    const fallbackData = {
      message: 'Payment QR',
      orderId: orderId,
      amount: amount,
      account: process.env.BAKONG_ACCOUNT_ID
    };
    
    const fallbackQR = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify(fallbackData))}`;
    
    return NextResponse.json({
      qrCode: fallbackQR,
      amount: amount,
      orderId: orderId,
      note: 'Using fallback QR generator'
    });
  }
}