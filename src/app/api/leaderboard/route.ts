import { NextResponse } from "next/server";
import { GameSession } from "@/types/game";
import { getRedisClient } from "@/lib/redis";

interface PlayerStats {
  userId: number;
  userName: string;
  totalGames: number;
  completedGames: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  completionRate: number;
  lastPlayed?: Date;
}

export async function GET() {
  try {
    const redis = await getRedisClient();

    const [gameIds, allSessionKeys] = await Promise.all([
      redis.sMembers("games:ids"),
      redis.keys("session:*"),
    ]);

    if (!gameIds || gameIds.length === 0) {
      return NextResponse.json({
        success: true,
        leaderboard: [],
        totalPlayers: 0,
        totalGames: 0,
        stats: {
          totalPlayers: 0,
          totalGames: 0,
          totalSessions: 0,
          completedSessions: 0,
        },
      });
    }

    if (allSessionKeys.length === 0) {
      return NextResponse.json({
        success: true,
        leaderboard: [],
        totalPlayers: 0,
        totalGames: gameIds.length,
        stats: {
          totalPlayers: 0,
          totalGames: gameIds.length,
          totalSessions: 0,
          completedSessions: 0,
        },
      });
    }

    const sessionsData = await redis.mGet(allSessionKeys);

    const userStats = new Map<number, PlayerStats>();
    let totalSessions = 0;
    let completedSessions = 0;

    for (const sessionData of sessionsData) {
      if (sessionData) {
        const session: GameSession = JSON.parse(sessionData);
        if (gameIds.includes(session.gameId) === false) {
          continue;
        }

        if (session.isCompleted || session.score !== 1000) {
          totalSessions++;

          if (session.isCompleted) {
            completedSessions++;
          }

          const userId = session.userId;
          const currentStats = userStats.get(userId);

          if (currentStats) {
            currentStats.totalGames++;
            if (session.isCompleted) {
              currentStats.completedGames++;
            }
            currentStats.totalScore += session.score;
            currentStats.bestScore = Math.max(
              currentStats.bestScore,
              session.score
            );

            const lastPlayed = new Date(session.startedAt);
            if (
              !currentStats.lastPlayed ||
              lastPlayed > currentStats.lastPlayed
            ) {
              currentStats.lastPlayed = lastPlayed;
            }
          } else {
            userStats.set(userId, {
              userId,
              userName: session.userName,
              totalGames: 1,
              completedGames: session.isCompleted ? 1 : 0,
              totalScore: session.score,
              averageScore: session.score,
              bestScore: session.score,
              completionRate: session.isCompleted ? 100 : 0,
              lastPlayed: new Date(session.startedAt),
            });
          }
        }
      }
    }

    const leaderboard: PlayerStats[] = Array.from(userStats.values()).map(
      (stats) => ({
        ...stats,
        averageScore: Math.round(stats.totalScore / stats.totalGames),
        completionRate: Math.round(
          (stats.completedGames / stats.totalGames) * 100
        ),
      })
    );

    leaderboard.sort((a, b) => {
      if (a.completionRate !== b.completionRate) {
        return b.completionRate - a.completionRate;
      }

      if (a.totalGames !== b.totalGames) {
        return b.totalGames - a.totalGames;
      }

      if (a.averageScore !== b.averageScore) {
        return b.averageScore - a.averageScore;
      }

      return b.bestScore - a.bestScore;
    });

    const stats = {
      totalPlayers: leaderboard.length,
      totalGames: gameIds.length,
      totalSessions,
      completedSessions,
      completionRate:
        totalSessions > 0
          ? Math.round((completedSessions / totalSessions) * 100)
          : 0,
      averageScore:
        totalSessions > 0
          ? Math.round(
              leaderboard.reduce((sum, p) => sum + p.totalScore, 0) /
                totalSessions
            )
          : 0,
    };

    return NextResponse.json({
      success: true,
      leaderboard,
      stats,
    });
  } catch (error) {
    console.error("Error fetching global leaderboard:", error);
    return NextResponse.json(
      { error: "خطا در دریافت رتبه‌بندی کلی" },
      { status: 500 }
    );
  }
}
