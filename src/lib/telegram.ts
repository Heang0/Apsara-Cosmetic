import TelegramBot from 'node-telegram-bot-api';

// Initialize bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN || '');

export async function sendTelegramMessage(chatId: string | number, message: string) {
  try {
    await bot.sendMessage(chatId, message, { 
      parse_mode: 'HTML',
      disable_web_page_preview: true 
    });
    return true;
  } catch (error) {
    console.error('Telegram send error:', error);
    return false;
  }
}

export async function sendOrderNotification(order: any) {
  const groupChatId = process.env.TELEGRAM_CHAT_ID;
  
  if (!groupChatId) {
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
🚨 <b>NEW ORDER ALERT</b> 🚨

━━━━━━━━━━━━━━━━━━━━━
🆔 <b>Order:</b> <code>${order.orderNumber}</code>
👤 <b>Customer:</b> ${order.customer.name}
📞 <b>Phone:</b> <code>${order.customer.phone}</code>
━━━━━━━━━━━━━━━━━━━━━

📍 <b>Shipping Address:</b>
${order.customer.address.street}, ${order.customer.address.city}, ${order.customer.address.province}

🛒 <b>Items:</b>
${order.items.map((item: any) => `├ • ${item.name} x${item.quantity} - ${formatPrice(item.total)}`).join('\n')}
└─────────────────────
💰 <b>TOTAL: ${formatPrice(order.total)}</b>

━━━━━━━━━━━━━━━━━━━━━
`;

  return sendTelegramMessage(groupChatId, message);
}

export async function sendOrderConfirmationToUser(order: any, telegramChatId: string) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const message = `
✅ <b>Order Confirmed!</b>

Hello <b>${order.customer.name}</b>,

Your order has been successfully confirmed and will be processed soon.

━━━━━━━━━━━━━━━━━━━━━
🆔 <b>Order:</b> <code>${order.orderNumber}</code>
📅 <b>Date:</b> ${new Date(order.createdAt).toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━

🛒 <b>Items:</b>
${order.items.map((item: any) => `├ • ${item.name} x${item.quantity} - ${formatPrice(item.total)}`).join('\n')}
└─────────────────────
💰 <b>TOTAL: ${formatPrice(order.total)}</b>

━━━━━━━━━━━━━━━━━━━━━
📍 <b>Shipping to:</b>
${order.customer.address.street}, ${order.customer.address.city}, ${order.customer.address.province}

Thank you for shopping with Apsara! 🎉
`;

  return sendTelegramMessage(telegramChatId, message);
}

export async function sendOrderStatusUpdateToUser(order: any, telegramChatId: string, oldStatus: string, newStatus: string) {
  const statusEmoji = {
    'pending': '⏳',
    'processing': '🔄',
    'shipped': '🚚',
    'delivered': '✅',
    'cancelled': '❌'
  };

  const message = `
🔄 <b>Order Status Update</b>

Order <code>${order.orderNumber}</code>

${statusEmoji[oldStatus] || '⚪'} <b>${oldStatus}</b> → ${statusEmoji[newStatus] || '🟢'} <b>${newStatus}</b>

Track your order in your account:
${process.env.NEXT_PUBLIC_APP_URL}/account/orders/${order._id}
`;

  return sendTelegramMessage(telegramChatId, message);
}