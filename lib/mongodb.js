import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_SERVER_SELECTION_TIMEOUT_MS =
  Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS) || 10000;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) {
    console.warn("⚠️ MONGODB_URI is not defined. Skipping database connection.");
    return null;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: MONGODB_SERVER_SELECTION_TIMEOUT_MS,
    });
  }

  const currentPromise = cached.promise;

  try {
    cached.conn = await currentPromise;
    return cached.conn;
  } catch (error) {
    if (cached.promise === currentPromise) {
      cached.promise = null;
    }
    console.error("❌ Failed to connect to MongoDB:", error.message);
    return null;
  }
}

export default connectToDatabase;
