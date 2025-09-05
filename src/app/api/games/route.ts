import { NextRequest, NextResponse } from "next/server";
import { Game, GameSession } from "@/types/game";
import { getRedisClient } from "@/lib/redis";

const sanitizeGameForPublic = (game: Game) => {
  const now = new Date();
  const startTime = new Date(game.startTime);
  const endTime = new Date(game.endTime);

  if (now >= startTime && now <= endTime) {
    return game;
  }

  return {
    id: game.id,
    songName: "",
    singerName: "",
    startTime: game.startTime,
    endTime: game.endTime,
    textHint: undefined,
    imageUrl: undefined,
    createdAt: game.createdAt,
    updatedAt: game.updatedAt,
  };
};

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

    const now = new Date();

    const processedGames = games.map((game) => {
      const endTime = new Date(game.endTime);
      const isFinished = now > endTime;

      if (isFinished) {
        return game;
      } else {
        return sanitizeGameForPublic(game);
      }
    });

    processedGames.sort((a, b) => {
      const aStart = new Date(a.startTime);
      const bStart = new Date(b.startTime);
      return bStart.getTime() - aStart.getTime();
    });

    return NextResponse.json({ success: true, games: processedGames });
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
    const { gameId, userId, userName } = body;

    if (!gameId || !userId || !userName) {
      return NextResponse.json(
        { error: "gameId, userId, and userName are required" },
        { status: 400 }
      );
    }

    const gameData = await redis.get(`game:${gameId}`);
    if (!gameData) {
      return NextResponse.json({ error: "بازی یافت نشد" }, { status: 404 });
    }

    const game: Game = JSON.parse(gameData);
    const now = new Date();
    const startTime = new Date(game.startTime);
    const endTime = new Date(game.endTime);

    if (now < startTime) {
      return NextResponse.json(
        {
          error: "بازی هنوز شروع نشده است",
          timeUntilStart: Math.floor(
            (startTime.getTime() - now.getTime()) / 1000
          ),
        },
        { status: 400 }
      );
    }

    if (now > endTime) {
      return NextResponse.json(
        { error: "بازی به پایان رسیده است" },
        { status: 400 }
      );
    }

    const existingSessionData = await redis.get(`session:${gameId}:${userId}`);
    if (existingSessionData) {
      const existingSession: GameSession = JSON.parse(existingSessionData);

      return NextResponse.json({
        success: true,
        game: game,
        session: existingSession,
      });
    }

    const sessionId = `${gameId}_${userId}_${Date.now()}`;

    const guessedSongLetters = new Array(game.songName.length).fill(false);
    const guessedSingerLetters = new Array(game.singerName.length).fill(false);

    const newSession: GameSession = {
      id: sessionId,
      gameId: gameId,
      userId: userId,
      userName: userName,
      startedAt: new Date(),
      completedAt: undefined,
      score: 1000,
      wrongLetters: [],
      usedTextHint: false,
      usedImageHint: false,
      guessedSongLetters: guessedSongLetters,
      guessedSingerLetters: guessedSingerLetters,
      isSongGuessed: false,
      isSingerGuessed: false,
      isCompleted: false,
    };

    await redis.set(`session:${gameId}:${userId}`, JSON.stringify(newSession));

    console.log(
      `Game session created for user ${userName} (${userId}) in game ${gameId}`
    );

    return NextResponse.json({
      success: true,
      game: game,
      session: newSession,
    });
  } catch (error) {
    console.error("Error starting game:", error);
    return NextResponse.json({ error: "خطا در شروع بازی" }, { status: 500 });
  }
}
