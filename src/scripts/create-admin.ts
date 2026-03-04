import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

import connectDB from '@/lib/mongodb';
import Admin from '@/models/Admin';

async function createAdmin() {
    try {
        await connectDB();

        const admin = await Admin.create({
            username: 'admin',
            password: 'admin123',
            role: 'superadmin',
        });

        console.log('✅ Admin created successfully!');
        console.log('Username: admin');
        console.log('Password: admin123');
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
}

createAdmin();