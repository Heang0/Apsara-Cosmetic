const sanitizeString = (value: unknown, maxLength: number) => {
  return String(value || '').trim().slice(0, maxLength);
};

const sanitizeBoolean = (value: unknown, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
};

const sanitizeNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
};

export function validateProductPayload(body: any) {
  const name = sanitizeString(body?.name, 120);
  const nameEn = sanitizeString(body?.nameEn, 120);
  const description = sanitizeString(body?.description, 4000);
  const category = sanitizeString(body?.category, 120);
  const categoryEn = sanitizeString(body?.categoryEn, 120);
  const price = sanitizeNumber(body?.price);
  const stock = sanitizeNumber(body?.stock);
  const isOnSale = sanitizeBoolean(body?.isOnSale, false);
  const salePrice = body?.salePrice === undefined || body?.salePrice === null || body?.salePrice === ''
    ? undefined
    : sanitizeNumber(body.salePrice);
  const images = Array.isArray(body?.images)
    ? body.images
        .map((value: unknown) => sanitizeString(value, 1000))
        .filter(Boolean)
        .slice(0, 10)
    : [];

  if (!name || !nameEn || !category || !categoryEn) {
    return { ok: false as const, error: 'Name, English name, category, and English category are required' };
  }
  if (!Number.isFinite(price) || price <= 0) {
    return { ok: false as const, error: 'Price must be greater than 0' };
  }
  if (!Number.isInteger(stock) || stock < 0) {
    return { ok: false as const, error: 'Stock must be a non-negative integer' };
  }
  if (images.length === 0) {
    return { ok: false as const, error: 'At least one product image is required' };
  }
  if (isOnSale && (!Number.isFinite(salePrice) || Number(salePrice) <= 0 || Number(salePrice) >= price)) {
    return { ok: false as const, error: 'Sale price must be greater than 0 and lower than the regular price' };
  }

  return {
    ok: true as const,
    data: {
      name,
      nameEn,
      description,
      category,
      categoryEn,
      price: Number(price),
      stock: Number(stock),
      isOnSale,
      salePrice: isOnSale ? Number(salePrice) : undefined,
      images,
    }
  };
}

export function validateCategoryPayload(body: any, partial = false) {
  const name = sanitizeString(body?.name, 120);
  const nameEn = sanitizeString(body?.nameEn, 120);
  const description = sanitizeString(body?.description, 1000);
  const isActive = sanitizeBoolean(body?.isActive, true);
  const order = body?.order === undefined ? 0 : sanitizeNumber(body?.order);

  if (!partial && (!name || !nameEn)) {
    return { ok: false as const, error: 'Name and English name are required' };
  }
  if (body?.order !== undefined && (!Number.isInteger(order) || order < 0)) {
    return { ok: false as const, error: 'Order must be a non-negative integer' };
  }

  return {
    ok: true as const,
    data: {
      ...(name ? { name } : {}),
      ...(nameEn ? { nameEn } : {}),
      ...(body?.description !== undefined ? { description } : {}),
      ...(body?.isActive !== undefined ? { isActive } : {}),
      ...(body?.order !== undefined ? { order: Number(order) } : {}),
    }
  };
}

export function validateOrderCustomerPayload(body: any) {
  const customerName = sanitizeString(body?.customer?.name, 120);
  const customerEmail = sanitizeString(body?.customer?.email, 160).toLowerCase();
  const customerPhone = sanitizeString(body?.customer?.phone, 40);
  const street = sanitizeString(body?.customer?.address?.street, 220);
  const city = sanitizeString(body?.customer?.address?.city, 120);
  const province = sanitizeString(body?.customer?.address?.province, 120);
  const notes = sanitizeString(body?.notes, 1000);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!customerName || !customerEmail || !customerPhone || !street || !city || !province) {
    return { ok: false as const, error: 'Customer name, email, phone, and address are required' };
  }
  if (!emailRegex.test(customerEmail)) {
    return { ok: false as const, error: 'Customer email is invalid' };
  }

  return {
    ok: true as const,
    data: {
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        address: {
          street,
          city,
          province,
        },
      },
      notes,
    }
  };
}

export function validateOrderUpdatePayload(body: any) {
  const allowedOrderStatuses = new Set(['pending', 'processing', 'shipped', 'delivered', 'cancelled']);
  const allowedPaymentStatuses = new Set(['pending', 'paid', 'failed', 'refunded']);
  const update: Record<string, unknown> = {};

  if (body?.orderStatus !== undefined) {
    const orderStatus = sanitizeString(body.orderStatus, 20);
    if (!allowedOrderStatuses.has(orderStatus)) {
      return { ok: false as const, error: 'Invalid order status' };
    }
    update.orderStatus = orderStatus;
  }

  if (body?.paymentStatus !== undefined) {
    const paymentStatus = sanitizeString(body.paymentStatus, 20);
    if (!allowedPaymentStatuses.has(paymentStatus)) {
      return { ok: false as const, error: 'Invalid payment status' };
    }
    update.paymentStatus = paymentStatus;
  }

  if (body?.trackingNumber !== undefined) {
    update.trackingNumber = sanitizeString(body.trackingNumber, 120);
  }

  if (Object.keys(update).length === 0) {
    return { ok: false as const, error: 'No valid fields to update' };
  }

  return { ok: true as const, data: update };
}
