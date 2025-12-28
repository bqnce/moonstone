import clientPromise from "@/lib/database/connection";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();

    console.log("✅ Sikeres csatlakozás a MongoDB-hez!");
    console.log("Elérhető adatbázisok:", dbs.databases.map(db => db.name));

    return NextResponse.json({ 
      status: "success", 
      message: "Connected successfully to MongoDB",
      databases: dbs.databases.length 
    });
  } catch (error) {
    console.error("❌ Hiba a MongoDB csatlakozás során:", error);
    
    return NextResponse.json({ 
      status: "error", 
      message: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}