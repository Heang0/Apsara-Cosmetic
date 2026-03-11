import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { verifyAdminRequest } from '@/lib/admin-auth';
import { enforceSameOrigin } from '@/lib/request-origin';
import { validateProductPayload } from '@/lib/validation';
import { writeAuditLog } from '@/lib/audit-log';

// GET - Public with optional filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    const category = searchParams.get('category');
    
    await connectDB();
    
    if (id) {
      const product = await Product.findById(id);
      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(product);
    }
    
    if (slug) {
      const product = await Product.findOne({ slug: slug });
      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(product);
    }
    
    let query = {};
    if (category) {
      query = { category: category };
    }
    
    const products = await Product.find(query).sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch (error) {
    console.error('GET products error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to fetch products: ' + errorMessage },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(request: Request) {
  try {
    const originError = enforceSameOrigin(request);
    if (originError) {
      return originError;
    }

    const adminAuth = verifyAdminRequest(request);
    if (!adminAuth.ok) {
      return adminAuth.response;
    }

    const body = await request.json();
    const validated = validateProductPayload(body);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    await connectDB();
    
    let slug = validated.data.nameEn
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    let existingProduct = await Product.findOne({ slug });
    let counter = 1;
    while (existingProduct) {
      slug = validated.data.nameEn.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + counter;
      existingProduct = await Product.findOne({ slug });
      counter++;
    }
    
    const product = await Product.create({
      name: validated.data.name,
      nameEn: validated.data.nameEn,
      slug: slug,
      description: validated.data.description,
      price: validated.data.price,
      category: validated.data.category,
      categoryEn: validated.data.categoryEn,
      images: validated.data.images,
      stock: validated.data.stock,
      isOnSale: validated.data.isOnSale,
      salePrice: validated.data.salePrice,
      createdAt: new Date(),
    });

    await writeAuditLog({
      request,
      action: 'product.create',
      resourceType: 'product',
      resourceId: String(product._id),
      admin: adminAuth.admin,
      metadata: { nameEn: product.nameEn, categoryEn: product.categoryEn },
    });
    
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('POST product error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to create product: ' + errorMessage },
      { status: 500 }
    );
  }
}

// PUT - Update product
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
    const validated = validateProductPayload(body);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    await connectDB();
    
    const product = await Product.findByIdAndUpdate(
      id,
      { ...validated.data, updatedAt: new Date() },
      { new: true }
    );

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    await writeAuditLog({
      request,
      action: 'product.update',
      resourceType: 'product',
      resourceId: String(product._id),
      admin: adminAuth.admin,
      metadata: { nameEn: product.nameEn, categoryEn: product.categoryEn },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('PUT product error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to update product: ' + errorMessage },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
export async function DELETE(request: Request) {
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
    
    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    await writeAuditLog({
      request,
      action: 'product.delete',
      resourceType: 'product',
      resourceId: String(product._id),
      admin: adminAuth.admin,
      metadata: { nameEn: product.nameEn },
    });
    
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('DELETE product error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to delete product: ' + errorMessage },
      { status: 500 }
    );
  }
}
