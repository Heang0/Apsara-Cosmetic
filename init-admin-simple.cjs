// Simple JavaScript version - no TypeScript, no emojis
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
console.log('Loading .env from:', envPath);

if (fs.existsSync(envPath)) {
    const result = dotenv.config({ path: envPath });
    console.log('Dotenv loaded:', result.error ? 'Error' : 'Success');
} else {
    console.log('.env.local file not found!');
    process.exit(1);
}

console.log('\nEnvironment check:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL ? 'Found' : 'Not found');

async function initAdmin() {
    let client;
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI not found in environment');
        }

        console.log('\nConnecting to MongoDB...');
        client = new MongoClient(uri);
        await client.connect();
        console.log('Connected to MongoDB successfully');

        const db = client.db('apsara');
        const admins = db.collection('admins');

        // Admin credentials
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@apsara.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
        const adminName = process.env.ADMIN_NAME || 'Apsara Admin';

        console.log(`\nSetting up admin: ${adminEmail}`);

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        // Check if admin exists
        const existingAdmin = await admins.findOne({ email: adminEmail.toLowerCase() });

        if (existingAdmin) {
            console.log('Admin already exists, updating password...');
            
            await admins.updateOne(
                { email: adminEmail.toLowerCase() },
                { 
                    $set: { 
                        password: hashedPassword,
                        name: adminName,
                        updatedAt: new Date()
                    } 
                }
            );
            console.log('Password updated successfully');
        } else {
            console.log('Creating new admin...');
            
            await admins.insertOne({
                email: adminEmail.toLowerCase(),
                password: hashedPassword,
                name: adminName,
                role: 'superadmin',
                isEnvAdmin: true,
                createdAt: new Date()
            });
            console.log('Admin created successfully');
        }

        console.log('\n✓ Admin initialization complete!');
        console.log('Email:', adminEmail);
        console.log('Password:', '*'.repeat(adminPassword.length));
        console.log('Login at: http://localhost:3000/admin/login');

    } catch (error) {
        console.error('\n✗ Error:', error.message);
    } finally {
        if (client) {
            await client.close();
            console.log('MongoDB connection closed');
        }
        process.exit(0);
    }
}

initAdmin();