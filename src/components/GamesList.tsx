import React, { useEffect, useState } from "react";
import { Play, Trophy, Clock } from "lucide-react";
import { Game, GameStatus } from "../types/game";

interface GamesListProps {
  onGameSelect: (gameId: string) => void;
}

export const GamesList: React.FC<GamesListProps> = ({ onGameSelect }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveGames();

    const interval = setInterval(fetchActiveGames, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveGames = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/games");
      const data = await response.json();

      if (data.success) {
        setGames(data.games || []);
      } else {
        setError("خطا در دریافت بازی‌ها");
      }
    } catch (error) {
      console.error("Error fetching games:", error);
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const getGameStatus = (game: Game) => {
    const now = new Date();
    const start = new Date(game.startTime);
    const end = new Date(game.endTime);

    if (now < start) {
      const timeUntilStart = Math.floor(
        (start.getTime() - now.getTime()) / 1000
      );
      return {
        status: GameStatus.UPCOMING,
        label: "آغاز نشده",
        color: "bg-blue-100 text-blue-800 border-blue-300",
        timeText: `شروع: ${formatTime(start)}`,
        timeUntilStart,
        isActive: false,
      };
    }

    if (now >= start && now <= end) {
      const timeLeft = Math.floor((end.getTime() - now.getTime()) / 1000);
      return {
        status: GameStatus.ACTIVE,
        label: "در حال اجرا",
        color: "bg-green-100 text-green-800 border-green-300",
        timeText: `باقی‌مانده: ${formatDuration(timeLeft)}`,
        timeUntilStart: 0,
        isActive: true,
      };
    }

    return {
      status: GameStatus.ENDED,
      label: "تمام شده",
      color: "bg-gray-100 text-gray-800 border-gray-300",
      timeText: `پایان: ${formatTime(end)}`,
      timeUntilStart: 0,
      isActive: false,
    };
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleDateString("fa-IR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleGameSelect = async (gameId: string, gameStatus: any) => {
    if (!gameStatus.isActive) {
      if (gameStatus.status === GameStatus.UPCOMING) {
        alert(
          `بازی هنوز شروع نشده است. ${formatDuration(
            gameStatus.timeUntilStart
          )} دیگر شروع می‌شود.`
        );
      } else {
        alert("این بازی به پایان رسیده است.");
      }
      return;
    }

    onGameSelect(gameId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-telegram-hint">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchActiveGames}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-telegram-text mb-2">
          بازی فعالی موجود نیست
        </h3>
        <p className="text-telegram-hint">
          در حال حاضر هیچ بازی‌ای در حال اجرا نیست. لطفاً بعداً دوباره بررسی
          کنید.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-telegram-text mb-2">
          🎵 بازی‌های حدس آهنگ
        </h2>
        <p className="text-telegram-hint">بازی مورد نظر خود را انتخاب کنید</p>
      </div>

      <div className="space-y-3">
        {games.map((game) => {
          const gameStatus = getGameStatus(game);
          const isActive = gameStatus.isActive;

          const hasGameData = game.songName && game.singerName;

          return (
            <div
              key={game.id}
              className={`
                bg-white dark:bg-gray-800 rounded-xl p-4 border-2 transition-all
                ${
                  isActive
                    ? "border-green-300 shadow-lg"
                    : gameStatus.status === GameStatus.UPCOMING
                    ? "border-blue-300 shadow-sm"
                    : "border-gray-200 shadow-sm"
                }
              `}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <div className="text-telegram-hint text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{gameStatus.timeText}</span>
                    </div>
                  </div>

                  {!hasGameData &&
                    gameStatus.status === GameStatus.UPCOMING && (
                      <div className="mt-2 text-sm text-telegram-hint">
                        جزئیات بازی پس از شروع نمایش داده می‌شود
                      </div>
                    )}
                </div>

                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${gameStatus.color}`}
                >
                  {gameStatus.label}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-telegram-hint">
                  {isActive && hasGameData && (
                    <>
                      {game.textHint && (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-600">💡</span>
                          <span>راهنمایی متنی</span>
                        </div>
                      )}
                      {game.imageUrl && (
                        <div className="flex items-center gap-1">
                          <span className="text-orange-600">🖼️</span>
                          <span>راهنمایی تصویری</span>
                        </div>
                      )}
                    </>
                  )}

                  {gameStatus.status === GameStatus.UPCOMING && (
                    <div className="text-blue-600">
                      {formatDuration(gameStatus.timeUntilStart)} تا شروع
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleGameSelect(game.id, gameStatus)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                    ${
                      isActive
                        ? "bg-green-600 text-white hover:bg-green-700 active:scale-95"
                        : gameStatus.status === GameStatus.UPCOMING
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }
                  `}
                >
                  <Play className="w-4 h-4" />
                  {isActive
                    ? "شروع بازی"
                    : gameStatus.status === GameStatus.UPCOMING
                    ? "منتظر شروع"
                    : "پایان یافته"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center text-xs text-telegram-hint">
        لیست هر 30 ثانیه بروزرسانی می‌شود
      </div>
    </div>
  );
};
