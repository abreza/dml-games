import { NextRequest, NextResponse } from "next/server";
import { GameSession } from "@/types/game";
import { getRedisClient } from "@/lib/redis";

interface LeaderboardEntry {
  userId: number;
  userName: string;
  score: number;
  position: number;
  isCompleted: boolean;
  completedAt?: Date;
}

export async function GET(request: NextRequest, { params }: any) {
  try {
    const redis = await getRedisClient();
    const { gameId } = await params;

    const gameData = await redis.get(`game:${gameId}`);
    if (!gameData) {
      return NextResponse.json({ error: "بازی یافت نشد" }, { status: 404 });
    }

    const sessionKeys = await redis.keys(`session:${gameId}:*`);

    if (sessionKeys.length === 0) {
      return NextResponse.json({
        success: true,
        leaderboard: [],
        totalPlayers: 0,
      });
    }

    const sessionsData = await Promise.all(
      sessionKeys.map((key) => redis.get(key))
    );

    const leaderboard: LeaderboardEntry[] = [];

    for (const sessionData of sessionsData) {
      if (sessionData) {
        const session: GameSession = JSON.parse(sessionData);

        // Only include players who have made progress (either completed or lost points)
        if (session.isCompleted || session.score !== 1000) {
          leaderboard.push({
            userId: session.userId,
            userName: session.userName,
            score: session.score,
            position: 0,
            isCompleted: session.isCompleted,
            completedAt: session.completedAt
              ? new Date(session.completedAt)
              : undefined,
          });
        }
      }
    }

    leaderboard.sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score;
      }

      if (a.isCompleted && !b.isCompleted) return -1;
      if (!a.isCompleted && b.isCompleted) return 1;

      if (a.isCompleted && b.isCompleted && a.completedAt && b.completedAt) {
        return a.completedAt.getTime() - b.completedAt.getTime();
      }

      return 0;
    });

    leaderboard.forEach((entry, index) => {
      entry.position = index + 1;
    });

    return NextResponse.json({
      success: true,
      leaderboard,
      totalPlayers: leaderboard.length,
    });
  } catch (error) {
    console.error("Error fetching game leaderboard:", error);
    return NextResponse.json(
      { error: "خطا در دریافت رتبه‌بندی" },
      { status: 500 }
    );
  }
}
