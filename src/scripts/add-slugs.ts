import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

async function addSlugsToProducts() {
  try {
    await connectDB();
    
    const products = await Product.find({ slug: { $exists: false } });
    console.log(`Found ${products.length} products without slugs`);
    
    for (const product of products) {
      // Generate slug from English name
      let slug = product.nameEn
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      // If slug is empty, use a default
      if (!slug) {
        slug = 'product-' + Date.now();
      }
      
      // Check if slug exists
      let existingProduct = await Product.findOne({ slug, _id: { $ne: product._id } });
      let counter = 1;
      while (existingProduct) {
        slug = product.nameEn.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') + counter;
        existingProduct = await Product.findOne({ slug, _id: { $ne: product._id } });
        counter++;
      }
      
      product.slug = slug;
      await product.save();
      console.log(`Updated product: ${product.nameEn} -> ${slug}`);
    }
    
    console.log('✅ All products updated with slugs!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addSlugsToProducts();