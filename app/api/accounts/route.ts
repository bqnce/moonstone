import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/database/connection";
import { Balance } from "@/lib/database/accounts/models/manualAssetSchema";
import mongoose from "mongoose";

// GET: Adatok lekérése
export async function GET() {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUserId = String(session.user.id);
    
    // Lean lekérdezés a gyorsaságért
    let userData = await Balance.findOne({ userId: currentUserId }).lean();

    // Ha nincs adat, üres szerkezetet adunk vissza
    if (!userData) {
       return NextResponse.json({ userId: currentUserId, manualAssets: [], updatedAt: new Date() });
    }

    return NextResponse.json(userData);
  } catch (error: any) {
    return NextResponse.json({ error: "Server error", message: error.message }, { status: 500 });
  }
}

// POST: Új eszköz létrehozása (JAVÍTVA)
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { label, balance, currency, category, subCategory } = await req.json();

    if (!label || balance === undefined || !currency || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newAsset = {
      _id: new mongoose.Types.ObjectId(),
      label,
      balance: Number(balance),
      currency,
      category,
      subCategory: subCategory || "General",
      // updatedAt-et kivettük, mert a sémában nincs benne, a szülő dokumentum pedig automatikusan frissül
    };

    // JAVÍTÁS: Kivettük a $setOnInsert-ből az updatedAt-et
    await Balance.findOneAndUpdate(
      { userId: session.user.id },
      { 
        $push: { manualAssets: newAsset }
        // A Mongoose timestamps: true opciója automatikusan kezeli az updatedAt-et
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, message: "Asset created", asset: newAsset });

  } catch (error: any) {
    console.error("Create Error:", error);
    return NextResponse.json({ error: "Server error", message: error.message }, { status: 500 });
  }
}

// PUT: Meglévő egyenleg szerkesztése
export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, newBalance } = await req.json();

    const result = await Balance.updateOne(
      { userId: session.user.id, "manualAssets._id": new mongoose.Types.ObjectId(id) },
      { 
        $set: { 
          "manualAssets.$.balance": Number(newBalance)
          // Itt sem kell manuális dátum, a parent updatedAt frissül magától
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Az ID-t a URL paramétereiből szedjük ki
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    // $pull: Kiveszi a tömbből azt az elemet, aminek egyezik az _id-ja
    const result = await Balance.updateOne(
      { userId: session.user.id },
      { $pull: { manualAssets: { _id: new mongoose.Types.ObjectId(id) } } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Item not found or already deleted" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}