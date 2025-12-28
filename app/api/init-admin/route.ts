import { initAdminUser } from "@/lib/auth/init-admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await initAdminUser();
    return NextResponse.json({
      status: "success",
      message: "Admin user initialized",
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

