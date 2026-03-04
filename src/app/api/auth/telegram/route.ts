import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { sendUserLoginNotification } from '@/lib/telegram';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { telegramId, telegramUsername, firstName, lastName, photoUrl } = await request.json();

    await connectDB();

    // Check if user exists
    let user = await User.findOne({ telegramId });

    if (!user) {
      // Create new user from Telegram data
      user = await User.create({
        name: `${firstName} ${lastName || ''}`.trim(),
        email: `${telegramId}@telegram.user`, // Temporary email
        telegramId,
        telegramUsername,
        password: crypto.randomBytes(20).toString('hex'), // Random password
        isVerified: true,
        lastLogin: new Date(),
      });
    } else {
      // Update last login
      user.lastLogin = new Date();
      await user.save();
    }

    // Send notification to admin
    await sendUserLoginNotification({
      email: user.email,
      name: user.name,
      phone: user.phone || 'N/A',
    });

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        name: user.name,
        telegramId: user.telegramId 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        telegramUsername: user.telegramUsername,
      },
    });

  } catch (error) {
    console.error('Telegram auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}