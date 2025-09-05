import { getRedisClient } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: any) {
  try {
    const redis = await getRedisClient();
    const { gameId } = await params;
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const sessionData = await redis.get(`session:${gameId}:${userId}`);
    if (!sessionData) {
      return NextResponse.json({ error: "جلسه یافت نشد" }, { status: 404 });
    }

    const session = JSON.parse(sessionData);

    return NextResponse.json({
      success: true,
      session,
    });
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json({ error: "خطا در دریافت جلسه" }, { status: 500 });
  }
}
