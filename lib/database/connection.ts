// @/lib/database/connection.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.DB_CONNECTION!;

if (!MONGODB_URI) {
  throw new Error("Kérlek add hozzá a DB_CONNECTION-t a .env fájlhoz!");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      // Itt is maradhat a biztonság kedvéért, de az URL az elsődleges
      dbName: "moonstoneDB", 
      bufferCommands: false,
    }).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}