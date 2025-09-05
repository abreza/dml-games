import { NextRequest, NextResponse } from "next/server";
import { Game } from "@/types/game";
import { getRedisClient } from "@/lib/redis";

export async function GET(request: NextRequest, { params }: any) {
  try {
    const redis = await getRedisClient();
    const { gameId } = await params;

    const gameData = await redis.get(`game:${gameId}`);

    if (!gameData) {
      return NextResponse.json({ error: "بازی یافت نشد" }, { status: 404 });
    }

    const game: Game = JSON.parse(gameData);

    return NextResponse.json({ success: true, game });
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json({ error: "خطا در دریافت جلسه" }, { status: 500 });
  }
}
