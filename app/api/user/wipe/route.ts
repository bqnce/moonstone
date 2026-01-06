import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/database/connection";
import { EventLog } from "@/lib/database/events/eventSchema";
// Importáld be a többi modelledet is (pl. Account, ManualAsset), ha van külön
// import { Account } from ...

export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // 1. Töröljük az összes Eventet
    await EventLog.deleteMany({ userId });

    // 2. Ha vannak manuális számlák vagy egyéb adatok, azokat is itt töröld:
    // await ManualAsset.deleteMany({ userId });
    
    // MEGJEGYZÉS: A felhasználót magát NEM töröljük, csak az adatait.

    return NextResponse.json({ message: "All user data wiped successfully" });
  } catch (error: any) {
    console.error("Wipe Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}