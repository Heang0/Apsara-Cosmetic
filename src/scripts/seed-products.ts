import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local from project root using absolute path
const envPath = path.resolve(process.cwd(), '.env.local');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('MONGODB_URI starts with:', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'Not found');

// Import after env is loaded
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

const sampleProducts = [
  {
    name: 'រំយោល',
    nameEn: 'Rom Yol',
    description: 'Traditional Khmer fragrant flower',
    price: 10,
    category: 'ផ្កា',
    categoryEn: 'Flowers',
    images: ['https://res.cloudinary.com/demo/image/upload/flower1.jpg'],
    stock: 50,
    isOnSale: false,
  },
  {
    name: 'ម្លិះ',
    nameEn: 'Malis',
    description: 'Jasmine - Khmer traditional fragrance',
    price: 10,
    category: 'ផ្កា',
    categoryEn: 'Flowers',
    images: ['https://res.cloudinary.com/demo/image/upload/jasmine.jpg'],
    stock: 45,
    isOnSale: false,
  },
  {
    name: 'បណ្ដោងស្រោប Lip Oil',
    nameEn: 'Lip Oil',
    description: 'Moisturizing lip oil with natural ingredients',
    price: 5,
    category: 'ថែទាំស្បែក',
    categoryEn: 'Skincare',
    images: ['https://res.cloudinary.com/demo/image/upload/lipoil.jpg'],
    stock: 30,
    isOnSale: true,
    salePrice: 4,
  },
  {
    name: 'កុលាប',
    nameEn: 'Koulap',
    description: 'Rose - Classic Khmer beauty',
    price: 10,
    category: 'ផ្កា',
    categoryEn: 'Flowers',
    images: ['https://res.cloudinary.com/demo/image/upload/rose.jpg'],
    stock: 25,
    isOnSale: false,
  },
  {
    name: 'បណ្ដោង Coquette',
    nameEn: 'Coquette Charm',
    description: 'Elegant decorative charm',
    price: 3,
    category: 'គ្រឿងអលង្ការ',
    categoryEn: 'Jewelry',
    images: ['https://res.cloudinary.com/demo/image/upload/coquette.jpg'],
    stock: 100,
    isOnSale: false,
  },
  {
    name: 'ប្រេងដូងក្រអូប',
    nameEn: 'Scented Coconut Oil',
    description: 'Natural coconut oil for hair and body',
    price: 8,
    category: 'ថែទាំស្បែក',
    categoryEn: 'Skincare',
    images: ['https://res.cloudinary.com/demo/image/upload/coconutoil.jpg'],
    stock: 60,
    isOnSale: true,
    salePrice: 6.5,
  },
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    
    console.log('Clearing existing products...');
    await Product.deleteMany({});
    
    console.log('Inserting sample products...');
    const result = await Product.insertMany(sampleProducts);
    console.log('Inserted ' + result.length + ' products successfully');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
