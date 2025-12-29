import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/database/connection";
import { Balance } from "@/lib/database/accounts/models/manualAssetSchema";
import { EventLog } from "@/lib/database/events/eventSchema";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const secureUserId = String(session.user.id);

    // Fogadjuk az isHistorical flaget is
    const { accountId, amount, date, isHistorical } = await req.json();

    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) {
        return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // --- A) HISTORICAL RECORD LOGIKA (Balance módosítás nélkül) ---
    if (isHistorical) {
        // Mivel nincs account, generálunk adatokat a loghoz
        await EventLog.create({
            userId: secureUserId,
            accountId: "HISTORICAL_RECORD", // Jelzés, hogy ez nem valós számla
            category: "Income",
            subcategory: "Historical",
            source: "SALARY",
            delta: numericAmount,
            balanceAfter: 0, // Nem releváns, mivel nem változott egyenleg
            currency: "HUF", // A historical input mindig HUF a frontend szerint
            timestamp: new Date(),
            metadata: {
                month: date,
                note: "Historical record (balance not affected)"
            }
        });

        return NextResponse.json({ 
            success: true, 
            message: "Historical salary logged successfully" 
        });
    }

    // --- B) NORMÁL LOGIKA (Account update) ---
    // (Ez a rész változatlan, csak becsomagoltuk az else ágba)
    
    if (!accountId) {
      return NextResponse.json({ error: "Missing accountId" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(accountId)) {
      return NextResponse.json({ error: "Invalid accountId" }, { status: 400 });
    }
    
    const accountObjectId = new mongoose.Types.ObjectId(accountId);
    
    const userDoc = await Balance.findOne({ 
      userId: secureUserId,
      "manualAssets._id": accountObjectId
    });

    if (!userDoc) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const asset = userDoc.manualAssets.find(
      (a: any) => a._id.equals(accountObjectId)
    );

    if (!asset) {
      return NextResponse.json({ error: "Asset sub-document not found" }, { status: 404 });
    }

    const previousBalance = asset.balance;
    const newBalance = previousBalance + numericAmount;

    await EventLog.create({
      userId: secureUserId,
      accountId: accountId,
      category: asset.category,
      subcategory: asset.subCategory || asset.subcategory,
      source: "SALARY",
      delta: numericAmount,
      balanceAfter: newBalance,
      currency: asset.currency,
      timestamp: new Date(),
      metadata: {
        month: date
      }
    });

    asset.balance = newBalance;
    userDoc.updatedAt = new Date();
    await userDoc.save();

    return NextResponse.json({ 
      success: true, 
      message: "Salary processed successfully",
    });

  } catch (error: any) {
    console.error("Salary API Error:", error);
    return NextResponse.json({ error: "Server error", message: error.message }, { status: 500 });
  }
}