// @/app/api/accounts/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/database/connection";
import { Balance } from "@/lib/database/accounts/models/manualAssetSchema";

export async function GET() {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Nincs bejelentkezve" }, { status: 401 });
    }

    // A session.user.id-t stringé alakítjuk a biztonság kedvéért
    const currentUserId = String(session.user.id);

    // Keresés az accounts kollekcióban, ahol a userId (String) = currentUserId
    const userData = await Balance.findOne({ userId: currentUserId }).lean();

    if (!userData) {
      return NextResponse.json({ 
        error: "User not found in accounts", 
        debug: {
            loggedUserId: currentUserId,
            loggedUserName: session.user.name,
            collection: "accounts"
        }
      }, { status: 404 });
    }

    return NextResponse.json(userData);

  } catch (error: any) {
    return NextResponse.json({ error: "Szerver hiba", message: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = String(session.user.id);
    const { label, newBalance } = await req.json();

    if (!label || newBalance === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // MongoDB Query:
    // 1. Find document with matching userId AND where manualAssets array has an item with this label
    // 2. Use $set with the positional operator ($) to update ONLY that specific item's balance
    const result = await Balance.updateOne(
      { 
        userId: currentUserId, 
        "manualAssets.label": label 
      },
      { 
        $set: { "manualAssets.$.balance": Number(newBalance) } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Balance updated" });

  } catch (error: any) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Server error", message: error.message }, { status: 500 });
  }
}