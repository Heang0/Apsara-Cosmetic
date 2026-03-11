import mongoose from 'mongoose';

const getMongoUri = (): string => {
  const mongodbUri = process.env.MONGODB_URI?.trim();
  if (!mongodbUri) {
    throw new Error('Missing MONGODB_URI. Set it in Vercel Project Settings > Environment Variables');
  }
  return mongodbUri;
};

// Define the cached connection type
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Declare global mongoose cache
declare global {
  var mongoose: MongooseCache;
}

// Initialize cached connection
let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of silence
      family: 4, // Use IPv4, skip trying IPv6
    };

    cached.promise = mongoose.connect(getMongoUri(), opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
