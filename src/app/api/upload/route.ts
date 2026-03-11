import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { verifyAdminRequest, getBearerTokenFromRequest } from '@/lib/admin-auth';
import { getFirebaseAdminAuth } from '@/lib/firebase-admin';
import { getClientIp, takeRateLimit } from '@/lib/rate-limit';
import { enforceSameOrigin } from '@/lib/request-origin';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  [key: string]: any;
}

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const originError = enforceSameOrigin(request);
    if (originError) {
      return originError;
    }

    const ip = getClientIp(request);
    const uploadLimit = takeRateLimit(`upload:${ip}`, 20, 10 * 60 * 1000);
    if (!uploadLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many uploads. Please try again later.' },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    const kind = String(formData.get('kind') || 'product').toLowerCase();

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
    const maxSize = kind === 'profile' ? 5 * 1024 * 1024 : 8 * 1024 * 1024;

    if (!allowedTypes.has(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type' },
        { status: 400 }
      );
    }

    if (file.size <= 0 || file.size > maxSize) {
      return NextResponse.json(
        { error: `Image must be smaller than ${kind === 'profile' ? '5MB' : '8MB'}` },
        { status: 400 }
      );
    }

    if (kind === 'profile') {
      const token = getBearerTokenFromRequest(request);
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      try {
        await getFirebaseAdminAuth().verifyIdToken(token);
      } catch {
        return NextResponse.json({ error: 'Invalid user token' }, { status: 401 });
      }
    } else {
      const adminAuth = verifyAdminRequest(request);
      if (!adminAuth.ok) {
        return adminAuth.response;
      }
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadOptions = kind === 'profile'
      ? {
          folder: 'apsara/profiles',
          transformation: [
            { width: 512, height: 512, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
          ],
        }
      : {
          folder: 'apsara/products',
          transformation: [
            { width: 600, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ],
        };

    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, uploadResult) => {
          if (error) {
            reject(error);
          } else {
            resolve(uploadResult as CloudinaryUploadResult);
          }
        }
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to upload image: ' + errorMessage },
      { status: 500 }
    );
  }
}
