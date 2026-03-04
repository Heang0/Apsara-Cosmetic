import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '@/lib/mongodb';
import Admin from '@/models/Admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

async function initAdmin() {
  try {
    await connectDB();
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@apsara.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const adminName = process.env.ADMIN_NAME || 'Apsara Admin';

    console.log('Setting up admin with email:', adminEmail);

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminEmail.toLowerCase() });
    
    if (existingAdmin) {
      console.log('Admin already exists with email:', adminEmail);
      
      // Update password if needed
      const passwordMatch = await existingAdmin.comparePassword(adminPassword);
      if (!passwordMatch) {
        console.log('Updating admin password...');
        existingAdmin.password = adminPassword;
        await existingAdmin.save();
        console.log('Admin password updated');
      } else {
        console.log('Admin credentials are up to date');
      }
    } else {
      // Create new admin
      console.log('Creating new admin...');
      await Admin.create({
        email: adminEmail.toLowerCase(),
        password: adminPassword,
        name: adminName,
        role: 'superadmin',
        isEnvAdmin: true,
      });
      console.log('Admin created successfully!');
    }
    
    console.log('\nAdmin Login Details:');
    console.log('Email:', adminEmail);
    console.log('Password:', '*'.repeat(adminPassword.length));
    console.log('\nLogin at: http://localhost:3000/admin/login');
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing admin:', error);
    process.exit(1);
  }
}

initAdmin();