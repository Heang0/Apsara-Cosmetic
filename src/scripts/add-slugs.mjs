import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

async function addSlugsToProducts() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('apsara');
    const products = db.collection('products');
    
    const productsWithoutSlugs = await products.find({ slug: { $exists: false } }).toArray();
    console.log(`Found ${productsWithoutSlugs.length} products without slugs`);
    
    for (const product of productsWithoutSlugs) {
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
      let existingProduct = await products.findOne({ slug: slug, _id: { $ne: product._id } });
      let counter = 1;
      while (existingProduct) {
        slug = product.nameEn.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') + counter;
        existingProduct = await products.findOne({ slug: slug, _id: { $ne: product._id } });
        counter++;
      }
      
      await products.updateOne(
        { _id: product._id },
        { $set: { slug: slug } }
      );
      
      console.log(`Updated product: ${product.nameEn} -> ${slug}`);
    }
    
    console.log('✅ All products updated with slugs!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    process.exit(0);
  }
}

addSlugsToProducts();
