import { NextRequest, NextResponse } from "next/server";
import { Game } from "@/types/game";
import { getRedisClient } from "@/lib/redis";
import { sanitizeText } from "@/utils/gameUtils";

export async function GET() {
  try {
    const redis = await getRedisClient();

    const gameIds = await redis.sMembers("games:ids");

    if (!gameIds || gameIds.length === 0) {
      return NextResponse.json({ success: true, games: [] });
    }

    const gamesData = await Promise.all(
      gameIds.map((id) => redis.get(`game:${id}`))
    );

    const games: Game[] = gamesData
      .filter((data): data is string => data !== null)
      .map((data) => JSON.parse(data));

    games.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ success: true, games });
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const redis = await getRedisClient();
    const body = await request.json();
    const {
      songName,
      singerName,
      startTime,
      endTime,
      textHint,
      imageUrl,
      language = "fa",
    } = body;

    if (!songName?.trim() || !singerName?.trim()) {
      return NextResponse.json(
        { error: "نام بازی، نام آهنگ و نام خواننده الزامی هستند" },
        { status: 400 }
      );
    }

    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: "زمان شروع و پایان الزامی هستند" },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      return NextResponse.json(
        { error: "زمان پایان باید بعد از زمان شروع باشد" },
        { status: 400 }
      );
    }

    const gameId =
      Date.now().toString() + Math.random().toString(36).substr(2, 9);

    const newGame: Game = {
      id: gameId,
      songName: sanitizeText(songName),
      singerName: sanitizeText(singerName),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      language,
      textHint: sanitizeText(textHint) || undefined,
      imageUrl: imageUrl?.trim() || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await redis.set(`game:${gameId}`, JSON.stringify(newGame));

    await redis.sAdd("games:ids", gameId);

    return NextResponse.json({ success: true, game: newGame });
  } catch (error) {
    console.error("Error creating game:", error);
    return NextResponse.json({ error: "خطا در ایجاد بازی" }, { status: 500 });
  }
}
