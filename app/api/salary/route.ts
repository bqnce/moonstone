import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/database/connection";
import { Balance } from "@/lib/database/accounts/models/manualAssetSchema";
import { EventLog } from "@/lib/database/events/eventSchema";

export async function POST(req: Request) {
  try {
    // 1. ADATBÁZIS KAPCSOLAT
    await connectToDatabase();

    // 2. AUTHENTIKÁCIÓ (userId a Contextből, NEM a body-ból)
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Ez a hiteles userId, a kliens nem tudja meghamisítani
    const secureUserId = String(session.user.id);

    // 3. INPUT VALIDÁCIÓ (Csak az intent: MI és MENNYI)
    const { accountId, amount } = await req.json();

    if (!accountId || amount === undefined) {
      return NextResponse.json({ error: "Missing accountId or amount" }, { status: 400 });
    }
    
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) {
        return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // 4. ADATOK LEKÉRÉSE (A valóság forrása az adatbázis)
    // Megkeressük a usert, akinek van ilyen nevű manualAsset-je (accountId alapján)
    const userDoc = await Balance.findOne({ 
      userId: secureUserId,
      "manualAssets._id": accountId 
    });

    if (!userDoc) {
      return NextResponse.json({ error: "Account not found or access denied" }, { status: 404 });
    }

    // Megkeressük a konkrét alszámlát (pl. "Savings")
    const asset = userDoc.manualAssets.find((a: any) => a._id.toString() === accountId);

    if (!asset) {
      return NextResponse.json({ error: "Asset sub-document not found" }, { status: 404 });
    }

    // 5. SZÁMÍTÁS (Server-side calculation)
    const previousBalance = asset.balance;
    const newBalance = previousBalance + numericAmount;

    // 6. EVENT LOG CREATION (Mielőtt mentenénk, előkészítjük a logot)
    // Minden adatot a meglévő DB objektumból szedünk, nem a klienstől!
    await EventLog.create({
      userId: secureUserId,
      accountId: accountId,
      category: asset.category,       // DB-ből
      subcategory: asset.subCategory || asset.subcategory, // DB-ből
      source: "SALARY",
      delta: numericAmount,
      balanceAfter: newBalance,       // Szerver számolta
      currency: asset.currency,       // DB-ből
      timestamp: new Date()
    });

    // 7. STATE UPDATE (Frissítjük a fő rekordot)
    asset.balance = newBalance;
    userDoc.updatedAt = new Date();
    
    await userDoc.save();

    return NextResponse.json({ 
      success: true, 
      message: "Salary processed successfully",
      debug: {
        previousBalance,
        delta: numericAmount,
        newBalance
      }
    });

  } catch (error: any) {
    console.error("Salary API Error:", error);
    return NextResponse.json({ error: "Server error", message: error.message }, { status: 500 });
  }
}