import TelegramBot from 'node-telegram-bot-api';

// Initialize bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN || '');

export async function sendTelegramMessage(chatId: string | number, message: string) {
  try {
    await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    return true;
  } catch (error) {
    console.error('Telegram send error:', error);
    return false;
  }
}

export async function sendOrderNotification(order: any) {
  const adminChatId = process.env.TELEGRAM_CHAT_ID;
  
  if (!adminChatId) {
    console.log('No TELEGRAM_CHAT_ID configured');
    return false;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const message = `
🛍️ <b>New Order Received!</b>

📋 <b>Order #:</b> ${order.orderNumber}
👤 <b>Customer:</b> ${order.customer.name}
📧 <b>Email:</b> ${order.customer.email}
📞 <b>Phone:</b> ${order.customer.phone}
📍 <b>Address:</b> ${order.customer.address.street}, ${order.customer.address.city}, ${order.customer.address.province}

🛒 <b>Items:</b>
${order.items.map((item: any) => `• ${item.name} x${item.quantity} - ${formatPrice(item.total)}`).join('\n')}

💰 <b>Subtotal:</b> ${formatPrice(order.subtotal)}
🚚 <b>Shipping:</b> ${formatPrice(order.shippingFee)}
💳 <b>Total:</b> ${formatPrice(order.total)}

💵 <b>Payment Status:</b> ${order.paymentStatus}
📦 <b>Order Status:</b> ${order.orderStatus}
📅 <b>Date:</b> ${new Date(order.createdAt).toLocaleString()}
`;

  return sendTelegramMessage(adminChatId, message);
}

export async function sendUserLoginNotification(user: any) {
  const adminChatId = process.env.TELEGRAM_CHAT_ID;
  
  if (!adminChatId) return false;

  const message = `
👤 <b>New User Login/Registration</b>

📧 <b>Email:</b> ${user.email}
👤 <b>Name:</b> ${user.name}
📞 <b>Phone:</b> ${user.phone || 'Not provided'}
📅 <b>Time:</b> ${new Date().toLocaleString()}
`;

  return sendTelegramMessage(adminChatId, message);
}

export async function sendLowStockNotification(product: any) {
  const adminChatId = process.env.TELEGRAM_CHAT_ID;
  
  if (!adminChatId) return false;

  const message = `
⚠️ <b>Low Stock Alert!</b>

📦 <b>Product:</b> ${product.name} / ${product.nameEn}
📊 <b>Current Stock:</b> ${product.stock}
🆔 <b>ID:</b> ${product._id}

Please restock soon!
`;

  return sendTelegramMessage(adminChatId, message);
}