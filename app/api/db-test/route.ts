import { connectToDatabase } from "@/lib/database/connection"; // 1. Javított import (kapcsos zárójel)
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 2. Mongoose csatlakozás meghívása
    const mongooseInstance = await connectToDatabase();
    
    // 3. Hozzáférés a natív DB interface-hez a Mongoose-on keresztül
    // Fontos: ellenőrizzük, hogy van-e élő kapcsolat
    if (!mongooseInstance.connection.db) {
        throw new Error("Az adatbázis kapcsolat létrejött, de a DB objektum nem elérhető.");
    }

    const adminDb = mongooseInstance.connection.db.admin();
    const dbs = await adminDb.listDatabases();

    console.log("✅ Sikeres csatlakozás a MongoDB-hez (Mongoose)!");
    console.log("Elérhető adatbázisok:", dbs.databases.map((db: { name: string }) => db.name));

    return NextResponse.json({ 
      status: "success", 
      message: "Connected successfully to MongoDB via Mongoose",
      databases: dbs.databases.length,
      list: dbs.databases.map((db: { name: string }) => db.name)
    });

  } catch (error) {
    console.error("❌ Hiba a MongoDB csatlakozás során:", error);
    
    return NextResponse.json({ 
      status: "error", 
      message: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}