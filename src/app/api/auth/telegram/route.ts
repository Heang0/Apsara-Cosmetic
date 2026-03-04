import { NextResponse } from 'next/server';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getFirebaseAdminAuth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const telegramData = await request.json();
    
    // Verify Telegram data authenticity
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const secret = crypto.createHash('sha256').update(botToken!).digest();
    
    const checkHash = telegramData.hash;
    delete telegramData.hash;
    
    const dataCheckString = Object.keys(telegramData)
      .sort()
      .map(key => `${key}=${telegramData[key]}`)
      .join('\n');
    
    const hash = crypto.createHmac('sha256', secret)
      .update(dataCheckString)
      .digest('hex');
    
    if (hash !== checkHash) {
      return NextResponse.json(
        { error: 'Invalid Telegram data' },
        { status: 401 }
      );
    }

    await connectDB();

    // Find or create user
    let user = await User.findOne({ telegramId: telegramData.id });

    if (!user) {
      // Create new user
      user = await User.create({
        name: `${telegramData.first_name} ${telegramData.last_name || ''}`.trim(),
        email: `telegram_${telegramData.id}@telegram.user`,
        telegramId: telegramData.id,
        telegramUsername: telegramData.username,
        telegramChatId: telegramData.id,
        photoURL: telegramData.photo_url,
        isVerified: true,
        createdAt: new Date(),
        lastLogin: new Date()
      });
    } else {
      // Update last login
      user.lastLogin = new Date();
      await user.save();
    }

    // Create Firebase custom token
    const firebaseToken = await getFirebaseAdminAuth().createCustomToken(user._id.toString());

    // Create JWT for your app
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
      firebaseToken,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        telegramUsername: user.telegramUsername,
        photoURL: user.photoURL
      }
    });

  } catch (error) {
    console.error('Telegram auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
