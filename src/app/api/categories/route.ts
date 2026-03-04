import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';

// GET all categories or single category by ID
export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const category = await Category.findById(id);
      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(category);
    }
    
    const categories = await Category.find({}).sort({ order: 1 });
    return NextResponse.json(categories);
    
  } catch (error) {
    console.error('❌ GET categories error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to fetch categories: ' + errorMessage },
      { status: 500 }
    );
  }
}

// POST create new category
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.name || !body.nameEn) {
      return NextResponse.json(
        { error: 'Name (Khmer) and Name (English) are required' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    const category = await Category.create({
      name: body.name.trim(),
      nameEn: body.nameEn.trim(),
      description: body.description || '',
      isActive: body.isActive ?? true,
      order: body.order || 0,
    });
    
    return NextResponse.json(category, { status: 201 });
    
  } catch (error) {
    console.error('❌ POST categories error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation failed: ' + errorMessage },
        { status: 400 }
      );
    }
    
    if (error instanceof Error && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create category: ' + errorMessage },
      { status: 500 }
    );
  }
}

// PUT update category
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    const category = await Category.findByIdAndUpdate(id, body, { 
      new: true,
      runValidators: true 
    });
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('PUT categories error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation failed: ' + errorMessage },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update category: ' + errorMessage },
      { status: 500 }
    );
  }
}

// DELETE category
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    const category = await Category.findByIdAndDelete(id);
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('DELETE categories error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to delete category: ' + errorMessage },
      { status: 500 }
    );
  }
}