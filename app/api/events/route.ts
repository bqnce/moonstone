import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/database/connection";
import { EventLog } from "@/lib/database/events/eventSchema";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    
    // 1. Auth Check
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse Query Parameters
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20"); // Default 20 items
    const page = parseInt(searchParams.get("page") || "1");
    const source = searchParams.get("source"); // Optional: Filter by "MANUAL", "SALARY", etc.
    const category = searchParams.get("category"); // Optional: Filter by "cash", "bank", etc.

    // 3. Build Query Object
    const query: any = { userId: session.user.id };

    if (source) query.source = source.toUpperCase();
    if (category) query.category = category;

    // 4. Execute Query with Pagination
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      EventLog.find(query)
        .sort({ timestamp: -1 }) // Newest first
        .skip(skip)
        .limit(limit)
        .lean(), // Convert Mongoose docs to plain JS objects for better performance
      EventLog.countDocuments(query)
    ]);

    // 5. Return Response
    return NextResponse.json({
      data: events,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    console.error("Fetch Events Error:", error);
    return NextResponse.json({ error: "Server error", message: error.message }, { status: 500 });
  }
}