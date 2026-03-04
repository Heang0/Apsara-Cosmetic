// Simple test to check environment loading
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

const envPath = path.resolve(process.cwd(), '.env.local');
console.log('Current directory:', process.cwd());
console.log('Looking for .env.local at:', envPath);
console.log('File exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    console.log('File content preview:', content.substring(0, 50) + '...');
    
    const result = dotenv.config({ path: envPath });
    console.log('Dotenv result:', result.error ? 'Error' : 'Success');
    console.log('MONGODB_URI after load:', process.env.MONGODB_URI ? 'Found' : 'Not found');
    console.log('ADMIN_EMAIL after load:', process.env.ADMIN_EMAIL ? 'Found' : 'Not found');
}
