import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import { sendLowStockNotification } from '@/lib/telegram';
import { verifyAdminRequest } from '@/lib/admin-auth';
import { enforceSameOrigin } from '@/lib/request-origin';
import { validateOrderCustomerPayload, validateOrderUpdatePayload } from '@/lib/validation';
import { writeAuditLog } from '@/lib/audit-log';

// GET all orders (for admin)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const adminAuth = verifyAdminRequest(request);

    await connectDB();

    if (id) {
      const order = await Order.findById(id);
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      if (adminAuth.ok) {
        return NextResponse.json(order);
      }

      return NextResponse.json({
        _id: order._id,
        orderNumber: order.orderNumber,
        total: order.total,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
      });
    }

    if (!adminAuth.ok) {
      return adminAuth.response;
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
    const originError = enforceSameOrigin(request);
    if (originError) {
      return originError;
    }

    const body = await request.json();
    await connectDB();

    const { userId, ...incomingOrderData } = body;
    const validatedCustomer = validateOrderCustomerPayload(incomingOrderData);
    if (!validatedCustomer.ok) {
      return NextResponse.json(
        { error: validatedCustomer.error },
        { status: 400 }
      );
    }
    const requestedItems = Array.isArray(incomingOrderData.items) ? incomingOrderData.items : [];
    if (requestedItems.length === 0) {
      return NextResponse.json(
        { error: 'Order must include at least one item' },
        { status: 400 }
      );
    }

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

    const productIds: string[] = Array.from(new Set(
      requestedItems
        .map((item: any) => String(item?.product || '').trim())
        .filter((id: string) => mongoose.Types.ObjectId.isValid(id))
    ));

    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = new Map(products.map((product: any) => [String(product._id), product]));
    const quantityByProductId = new Map<string, number>();

    for (const item of requestedItems) {
      const productId = String(item?.product || '').trim();
      const quantity = Math.max(1, Number(item?.quantity || 0));
      quantityByProductId.set(productId, (quantityByProductId.get(productId) || 0) + quantity);
    }

    const missingProductId = productIds.find((id) => !productMap.has(id));
    if (missingProductId) {
      return NextResponse.json(
        { error: 'One or more products are no longer available' },
        { status: 400 }
      );
    }

    for (const [productId, quantity] of quantityByProductId.entries()) {
      const product: any = productMap.get(productId);
      if (!product || Number(product.stock || 0) < quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for product ${product?.nameEn || product?.name || productId}` },
          { status: 409 }
        );
      }
    }

    const normalizedItems: Array<{
      product: any;
      name: string;
      nameEn: string;
      quantity: number;
      price: number;
      total: number;
      image: string;
    }> = requestedItems.map((item: any) => {
      const productId = String(item?.product || '').trim();
      const product: any = productMap.get(productId);
      const quantity = Math.max(1, Number(item?.quantity || 0));
      const unitPrice = product.isOnSale && product.salePrice ? Number(product.salePrice) : Number(product.price);

      return {
        product: product._id,
        name: product.name,
        nameEn: product.nameEn,
        quantity,
        price: unitPrice,
        total: unitPrice * quantity,
        image: Array.isArray(product.images) ? product.images[0] || '' : '',
      };
    });

    const subtotal = normalizedItems.reduce((sum: number, item) => sum + item.total, 0);
    const shippingFee = 1.5;
    const discount = 0;
    const total = subtotal + shippingFee - discount;

    const stockOps = normalizedItems.map((item: any) => ({
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
      ...validatedCustomer.data,
      items: normalizedItems,
      subtotal,
      shippingFee,
      discount,
      total,
      telegramChatId: resolvedTelegramChatId || undefined,
      orderStatus: 'pending',
      paymentStatus: 'pending'
    });

    // Send notifications asynchronously so order response returns faster.
    void (async () => {
      try {
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
    const originError = enforceSameOrigin(request);
    if (originError) {
      return originError;
    }

    const adminAuth = verifyAdminRequest(request);
    if (!adminAuth.ok) {
      return adminAuth.response;
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const validated = validateOrderUpdatePayload(body);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    await connectDB();

    const order = await Order.findByIdAndUpdate(
      id,
      { ...validated.data, updatedAt: new Date() },
      { new: true }
    );

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    await writeAuditLog({
      request,
      action: 'order.update',
      resourceType: 'order',
      resourceId: String(order._id),
      admin: adminAuth.admin,
      metadata: validated.data as Record<string, unknown>,
    });

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
