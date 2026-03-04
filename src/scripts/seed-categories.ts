import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const sampleCategories = [
  {
    name: 'ផ្កា',
    nameEn: 'Flowers',
    description: 'Traditional Khmer flowers',
    isActive: true,
    order: 1,
  },
  {
    name: 'ថែទាំស្បែក',
    nameEn: 'Skincare',
    description: 'Natural skincare products',
    isActive: true,
    order: 2,
  },
  {
    name: 'គ្រឿងអលង្ការ',
    nameEn: 'Jewelry',
    description: 'Traditional Khmer jewelry',
    isActive: true,
    order: 3,
  },
  {
    name: 'ទឹកអប់',
    nameEn: 'Perfume',
    description: 'Khmer fragrances',
    isActive: true,
    order: 4,
  },
];

async function seedCategories() {
  try {
    await connectDB();
    await Category.deleteMany({});
    await Category.insertMany(sampleCategories);
    console.log('✅ Categories seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();
