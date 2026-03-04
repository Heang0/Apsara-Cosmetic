import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendOrderReceipt(order: any, userEmail: string) {
  try {
    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(price);
    };

    const formatDate = (date: string) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    // Generate items HTML
    const itemsList = order.items.map((item: any) => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px; text-align: left;">
          <div style="font-weight: 500;">${item.nameEn || item.name}</div>
        </td>
        <td style="padding: 12px; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right;">${formatPrice(item.price)}</td>
        <td style="padding: 12px; text-align: right; font-weight: 500;">${formatPrice(item.price * item.quantity)}</td>
      </tr>
    `).join('');

    // English-only HTML email template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - Apsara</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        </style>
      </head>
      <body style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        
        <!-- Main Container -->
        <div style="background-color: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; font-size: 32px; margin: 0;">APSARA</h1>
            <p style="color: #ccc; font-size: 14px; margin: 5px 0 0;">Cosmetics</p>
          </div>

          <!-- Success Badge -->
          <div style="padding: 30px 30px 20px; text-align: center;">
            <div style="background-color: #e6f7e6; color: #2e7d32; width: 60px; height: 60px; border-radius: 30px; display: inline-flex; align-items: center; justify-content: center; font-size: 30px; margin-bottom: 20px;">✓</div>
            <h2 style="color: #1a1a1a; font-size: 24px; margin: 0 0 10px;">Order Confirmed!</h2>
            <p style="color: #666; font-size: 16px; margin: 0;">Thank you for your purchase</p>
          </div>

          <!-- Greeting -->
          <div style="padding: 0 30px 20px;">
            <p style="font-size: 16px; margin: 0;">Hello <strong>${order.customer.name}</strong>,</p>
            <p style="color: #666; margin: 10px 0 0;">Your order has been successfully confirmed and will be processed soon.</p>
          </div>

          <!-- Order Info Cards -->
          <div style="padding: 0 30px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px;">
              <div style="background-color: #f5f5f5; border-radius: 12px; padding: 20px;">
                <p style="margin: 0 0 5px; font-size: 12px; color: #666;">Order Number</p>
                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1a1a1a;">${order.orderNumber}</p>
              </div>
              <div style="background-color: #f5f5f5; border-radius: 12px; padding: 20px;">
                <p style="margin: 0 0 5px; font-size: 12px; color: #666;">Order Date</p>
                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1a1a1a;">${formatDate(order.createdAt)}</p>
              </div>
            </div>
          </div>

          <!-- Customer Info -->
          <div style="padding: 0 30px 30px;">
            <h3 style="color: #1a1a1a; font-size: 18px; margin: 0 0 15px;">Shipping Address</h3>
            <div style="background-color: #f5f5f5; border-radius: 12px; padding: 20px;">
              <p style="margin: 0 0 5px;"><strong>${order.customer.name}</strong></p>
              <p style="margin: 0 0 5px; color: #666;">${order.customer.email}</p>
              <p style="margin: 0 0 5px; color: #666;">${order.customer.phone}</p>
              <p style="margin: 0; color: #666;">${order.customer.address.street}, ${order.customer.address.city}, ${order.customer.address.province}</p>
            </div>
          </div>

          <!-- Order Items -->
          <div style="padding: 0 30px 30px;">
            <h3 style="color: #1a1a1a; font-size: 18px; margin: 0 0 15px;">Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse; background-color: #f5f5f5; border-radius: 12px; overflow: hidden;">
              <thead>
                <tr style="background-color: #e0e0e0;">
                  <th style="padding: 15px; text-align: left;">Product</th>
                  <th style="padding: 15px; text-align: center;">Qty</th>
                  <th style="padding: 15px; text-align: right;">Price</th>
                  <th style="padding: 15px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
              <tfoot style="background-color: #e8e8e8;">
                <tr>
                  <td colspan="3" style="padding: 15px; text-align: right; font-weight: 600;">Subtotal:</td>
                  <td style="padding: 15px; text-align: right; font-weight: 600;">${formatPrice(order.subtotal)}</td>
                </tr>
                <tr>
                  <td colspan="3" style="padding: 15px; text-align: right; font-weight: 600;">Shipping:</td>
                  <td style="padding: 15px; text-align: right; font-weight: 600;">${formatPrice(order.shippingFee)}</td>
                </tr>
                <tr>
                  <td colspan="3" style="padding: 15px; text-align: right; font-weight: 600; border-top: 2px solid #ddd;">Total:</td>
                  <td style="padding: 15px; text-align: right; font-weight: 600; border-top: 2px solid #ddd;">${formatPrice(order.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Payment Status -->
          <div style="padding: 0 30px 30px;">
            <div style="background-color: #f5f5f5; border-radius: 12px; padding: 20px;">
              <p style="margin: 0 0 10px;"><strong>Payment Status:</strong> 
                <span style="display: inline-block; background-color: #2e7d32; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; margin-left: 10px;">
                  ${order.paymentStatus}
                </span>
              </p>
              <p style="margin: 0 0 0;"><strong>Order Status:</strong> 
                <span style="display: inline-block; background-color: #1976d2; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; margin-left: 10px;">
                  ${order.orderStatus}
                </span>
              </p>
            </div>
          </div>

          <!-- Track Order Button -->
          <div style="padding: 0 30px 40px; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/orders/${order._id}" 
               style="display: inline-block; background-color: #1a1a1a; color: white; text-decoration: none; padding: 14px 40px; border-radius: 30px; font-weight: 500; font-size: 16px; transition: background-color 0.3s;">
              Track Your Order
            </a>
          </div>

          <!-- Footer -->
          <div style="background-color: #f5f5f5; padding: 30px; text-align: center; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px; margin: 0 0 10px;">Need help? Contact us at <a href="mailto:support@apsara.com" style="color: #1a1a1a; text-decoration: none;">support@apsara.com</a></p>
            <p style="color: #999; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} Apsara Cosmetics. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    const info = await transporter.sendMail({
      from: '"Apsara" <orders@apsara.com>',
      to: userEmail,
      subject: `Order Confirmed! #${order.orderNumber}`,
      html: emailHtml,
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

export async function sendAdminNotification(order: any) {
  try {
    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(price);
    };

    const formatDate = (date: string) => {
      return new Date(date).toLocaleString('en-US');
    };

    const itemsList = order.items.map((item: any) => 
      `• ${item.name} x${item.quantity} - ${formatPrice(item.total)}`
    ).join('\n');

    const emailText = `
New Order Received!

Order #: ${order.orderNumber}
Date: ${formatDate(order.createdAt)}

Customer:
Name: ${order.customer.name}
Email: ${order.customer.email}
Phone: ${order.customer.phone}
Address: ${order.customer.address.street}, ${order.customer.address.city}, ${order.customer.address.province}

Items:
${itemsList}

Subtotal: ${formatPrice(order.subtotal)}
Shipping: ${formatPrice(order.shippingFee)}
Total: ${formatPrice(order.total)}

Payment Status: ${order.paymentStatus}
Order Status: ${order.orderStatus}

View in Admin: ${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard/orders
    `;

    const info = await transporter.sendMail({
      from: '"Apsara" <orders@apsara.com>',
      to: process.env.ADMIN_EMAIL,
      subject: `🛍️ New Order #${order.orderNumber}`,
      text: emailText,
    });

    console.log('Admin notification sent:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('Error sending admin notification:', error);
    return { success: false, error };
  }
}