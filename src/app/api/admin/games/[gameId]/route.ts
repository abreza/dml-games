import { NextRequest, NextResponse } from "next/server";
import { Game } from "@/types/game";
import { getRedisClient } from "@/lib/redis";
import { sanitizeText } from "@/utils/gameUtils";

export async function PUT(request: NextRequest, { params }: any) {
  try {
    const redis = await getRedisClient();
    const { gameId } = await params;
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

    const existingGameData = await redis.get(`game:${gameId}`);

    if (!existingGameData) {
      return NextResponse.json({ error: "بازی یافت نشد" }, { status: 404 });
    }

    const existingGame: Game = JSON.parse(existingGameData);

    const updatedGame: Game = {
      ...existingGame,
      songName: sanitizeText(songName),
      singerName: sanitizeText(singerName),
      language,
      startTime: start,
      endTime: end,
      textHint: sanitizeText(textHint) || undefined,
      imageUrl: imageUrl?.trim() || undefined,
      updatedAt: new Date(),
    };

    await redis.set(`game:${gameId}`, JSON.stringify(updatedGame));

    return NextResponse.json({
      success: true,
      game: updatedGame,
    });
  } catch (error) {
    console.error("Error updating game:", error);
    return NextResponse.json(
      { error: "خطا در بروزرسانی بازی" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: any) {
  try {
    const redis = await getRedisClient();
    const { gameId } = await params;

    const existingGameData = await redis.get(`game:${gameId}`);

    if (!existingGameData) {
      return NextResponse.json({ error: "بازی یافت نشد" }, { status: 404 });
    }

    await redis.del(`game:${gameId}`);
    await redis.sRem("games:ids", gameId);

    return NextResponse.json({
      success: true,
      message: "بازی با موفقیت حذف شد",
    });
  } catch (error) {
    console.error("Error deleting game:", error);
    return NextResponse.json({ error: "خطا در حذف بازی" }, { status: 500 });
  }
}
