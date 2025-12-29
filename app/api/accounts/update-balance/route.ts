import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/database/connection";
import { Balance } from "@/lib/database/accounts/models/manualAssetSchema";
import { EventLog } from "@/lib/database/events/eventSchema";

export async function POST(req: Request) {
  try {
    // 1. DB Csatlakozás
    await connectToDatabase();

    // 2. Auth Ellenőrzés
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secureUserId = String(session.user.id);

    // 3. Input Validáció
    // accountId: az asset _id-ja (vagy label, ha úgy döntöttünk korábban, de itt az ID pontosabb)
    // newBalance: az új egyenleg, amit a user beírt
    const { accountId, newBalance } = await req.json();

    if (!accountId || newBalance === undefined) {
      return NextResponse.json({ error: "Missing accountId or newBalance" }, { status: 400 });
    }

    const numericNewBalance = Number(newBalance);
    if (isNaN(numericNewBalance)) {
        return NextResponse.json({ error: "Invalid balance format" }, { status: 400 });
    }

    // 4. User és Account keresése
    const userDoc = await Balance.findOne({ 
      userId: secureUserId,
      "manualAssets._id": accountId 
    });

    if (!userDoc) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Megkeressük a konkrét assetet a tömbben
    const asset = userDoc.manualAssets.find((a: any) => a._id.toString() === accountId);

    if (!asset) {
      return NextResponse.json({ error: "Asset sub-document not found" }, { status: 404 });
    }

    // 5. DELTA Számítás (A Szerver az Igazság forrása)
    const previousBalance = asset.balance;
    const delta = numericNewBalance - previousBalance;

    // Ha nincs változás, ne csináljunk semmit (vagy jelezzük)
    if (delta === 0) {
      return NextResponse.json({ message: "No change in balance" });
    }

    // 6. EVENT LOG CREATION (Source: MANUAL)
    await EventLog.create({
      userId: secureUserId,
      accountId: accountId,
      category: asset.category,
      subcategory: asset.subCategory || asset.subcategory,
      source: "MANUAL",      // <--- Itt a lényeg!
      delta: delta,          // Kiszámolt különbség (+ vagy -)
      balanceAfter: numericNewBalance,
      currency: asset.currency,
      timestamp: new Date()
    });

    // 7. STATE UPDATE (Módosítjuk a fő rekordot)
    asset.balance = numericNewBalance;
    userDoc.updatedAt = new Date();
    
    await userDoc.save();

    return NextResponse.json({ 
      success: true, 
      message: "Balance manually updated",
      debug: {
        previous: previousBalance,
        new: numericNewBalance,
        delta: delta
      }
    });

  } catch (error: any) {
    console.error("Update Balance API Error:", error);
    return NextResponse.json({ error: "Server error", message: error.message }, { status: 500 });
  }
}