import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

export async function POST(request: Request) {
  try {
    const { productIds } = await request.json();
    
    if (!productIds || !Array.isArray(productIds)) {
      return NextResponse.json(
        { error: 'Product IDs array is required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Fetch all products in one query
    const products = await Product.find({
      _id: { $in: productIds }
    });

    // Create a map for quick lookup
    const productMap = new Map();
    products.forEach(product => {
      productMap.set(product._id.toString(), {
        _id: product._id,
        name: product.name,
        nameEn: product.nameEn,
        price: product.isOnSale && product.salePrice ? product.salePrice : product.price,
        originalPrice: product.price,
        isOnSale: product.isOnSale,
        images: product.images,
        slug: product.slug,
        exists: true,
        stock: product.stock,
      });
    });

    return NextResponse.json({
      products: Object.fromEntries(productMap),
      missingIds: productIds.filter(id => !productMap.has(id))
    });

  } catch (error) {
    console.error('Cart validation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to validate cart: ' + errorMessage },
      { status: 500 }
    );
  }
}