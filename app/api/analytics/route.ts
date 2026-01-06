import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/database/connection";
import { EventLog } from "@/lib/database/events/eventSchema";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // 1. Aggregáció: Napi bontás (Timeline & Heatmap)
    const dailyStats = await EventLog.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          netChange: { $sum: "$delta" },
          income: { $sum: { $cond: [{ $gt: ["$delta", 0] }, "$delta", 0] } },
          expense: { $sum: { $cond: [{ $lt: ["$delta", 0] }, "$delta", 0] } },
          transactionCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } } // Időrendben növekvő
    ]);

    // 2. Legnagyobb tranzakciók (Top Movers)
    const topGains = await EventLog.find({ userId, delta: { $gt: 0 } })
      .sort({ delta: -1 })
      .limit(3)
      .lean();

    const topLosses = await EventLog.find({ userId, delta: { $lt: 0 } })
      .sort({ delta: 1 }) // Legkisebb (legnegatívabb) számok
      .limit(3)
      .lean();

    // 3. Összesített statisztikák (KPI)
    const totalStats = await EventLog.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalIn: { $sum: { $cond: [{ $gt: ["$delta", 0] }, "$delta", 0] } },
          totalOut: { $sum: { $cond: [{ $lt: ["$delta", 0] }, "$delta", 0] } },
          netTotal: { $sum: "$delta" }
        }
      }
    ]);

    return NextResponse.json({
      dailyStats,
      topEvents: { gains: topGains, losses: topLosses },
      summary: totalStats[0] || { totalIn: 0, totalOut: 0, netTotal: 0 }
    });

  } catch (error: any) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}