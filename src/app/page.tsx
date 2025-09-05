"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Trophy, Clock, Eye, History, Music } from "lucide-react";
import { Game, GameStatus } from "../types/game";
import { fetchGameLeaderboard } from "../services/gameService";
import { useTelegramWebApp } from "../hooks/useTelegramWebApp";
import { preserveQueryParams } from "../utils/navigationUtils";

interface GameWithCompletion extends Game {
  isCompletedByUser?: boolean;
  userScore?: number;
  userPosition?: number;
}

const GamesListPage = () => {
  const router = useRouter();
  const { user } = useTelegramWebApp();

  const [games, setGames] = useState<GameWithCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveGames = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/games");
      const data = await response.json();

      if (data.success) {
        const fetchedGames: Game[] = data.games || [];

        if (user?.id) {
          const completionPromises = fetchedGames.map(async (game) => {
            try {
              const leaderboard = await fetchGameLeaderboard(game.id);
              const userEntry = leaderboard.find(
                (player) => player.userId === user.id
              );

              return {
                ...game,
                isCompletedByUser: userEntry?.isCompleted || false,
                userScore: userEntry?.score,
                userPosition: userEntry?.position,
              };
            } catch (error) {
              console.error(
                `Error fetching leaderboard for game ${game.id}:`,
                error
              );
              return {
                ...game,
                isCompletedByUser: false,
              };
            }
          });

          const gamesWithCompletion = await Promise.all(completionPromises);
          setGames(gamesWithCompletion);
        } else {
          setGames(
            fetchedGames.map((game) => ({ ...game, isCompletedByUser: false }))
          );
        }
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

  useEffect(() => {
    fetchActiveGames();
    const interval = setInterval(fetchActiveGames, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

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

  const getButtonConfig = (game: GameWithCompletion, gameStatus: any) => {
    if (gameStatus.status === GameStatus.ENDED) {
      return {
        text: "مشاهده نتایج",
        icon: <History className="w-4 h-4" />,
        className:
          "bg-purple-600 text-white hover:bg-purple-700 active:scale-95",
        canClick: true,
        showUserStats: true,
        action: "view_results",
      };
    }

    if (game.isCompletedByUser && gameStatus.isActive) {
      return {
        text: "مشاهده نتایج",
        icon: <Eye className="w-4 h-4" />,
        className:
          "bg-purple-600 text-white hover:bg-purple-700 active:scale-95",
        canClick: true,
        showUserStats: true,
        action: "view_results",
      };
    }

    if (gameStatus.isActive) {
      return {
        text: game.isCompletedByUser ? "بازبینی" : "شروع بازی",
        icon: <Play className="w-4 h-4" />,
        className: "bg-green-600 text-white hover:bg-green-700 active:scale-95",
        canClick: true,
        showUserStats: false,
        action: "play_game",
      };
    }

    if (gameStatus.status === GameStatus.UPCOMING) {
      return {
        text: "منتظر شروع",
        icon: <Play className="w-4 h-4" />,
        className: "bg-blue-100 text-blue-700 hover:bg-blue-200",
        canClick: false,
        showUserStats: false,
        action: "wait",
      };
    }

    return {
      text: "مشاهده نتایج",
      icon: <Eye className="w-4 h-4" />,
      className: "bg-gray-600 text-white hover:bg-gray-700 active:scale-95",
      canClick: true,
      showUserStats: false,
      action: "view_results",
    };
  };

  const handleGameSelect = (game: GameWithCompletion, gameStatus: any) => {
    const buttonConfig = getButtonConfig(game, gameStatus);

    if (!buttonConfig.canClick) {
      if (gameStatus.status === GameStatus.UPCOMING) {
        alert(
          `بازی هنوز شروع نشده است. ${formatDuration(
            gameStatus.timeUntilStart
          )} دیگر شروع می‌شود.`
        );
      }
      return;
    }

    switch (buttonConfig.action) {
      case "play_game":
        const playUrl = preserveQueryParams(`/game/${game.id}`);
        router.push(playUrl);
        break;
      case "view_results":
        const resultsUrl = preserveQueryParams(`/game/${game.id}/results`);
        router.push(resultsUrl);
        break;
      default:
        const defaultUrl = preserveQueryParams(`/game/${game.id}`);
        router.push(defaultUrl);
    }
  };

  const activeAndUpcomingGames = games.filter((game) => {
    const status = getGameStatus(game);
    return (
      status.status === GameStatus.ACTIVE ||
      status.status === GameStatus.UPCOMING
    );
  });

  const finishedGames = games.filter((game) => {
    const status = getGameStatus(game);
    return status.status === GameStatus.ENDED;
  });

  const renderGameCard = (game: GameWithCompletion) => {
    const gameStatus = getGameStatus(game);
    const buttonConfig = getButtonConfig(game, gameStatus);
    const hasGameData = game.songName && game.singerName;
    const isFinished = gameStatus.status === GameStatus.ENDED;

    return (
      <div
        key={game.id}
        className={`
          bg-white dark:bg-gray-800 rounded-xl p-4 border-2 transition-all
          ${
            game.isCompletedByUser
              ? "border-purple-300 shadow-lg bg-purple-50 dark:bg-purple-900/20"
              : gameStatus.isActive
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

            {buttonConfig.showUserStats && game.userScore !== undefined && (
              <div className="mt-2 text-sm">
                <div className="text-purple-700 dark:text-purple-300 font-medium">
                  امتیاز شما: {game.userScore}
                  {game.userPosition && ` • رتبه ${game.userPosition}`}
                </div>
              </div>
            )}

            {!hasGameData && gameStatus.status === GameStatus.UPCOMING && (
              <div className="mt-2 text-sm text-telegram-hint">
                جزئیات بازی پس از شروع نمایش داده می‌شود
              </div>
            )}

            {isFinished && hasGameData && (
              <div className="mt-2 space-y-1">
                <div className="text-sm">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-700 dark:text-green-300">
                      {game.songName}
                    </span>
                    <span className="text-telegram-hint">توسط</span>
                    <span className="font-medium text-blue-700 dark:text-blue-300">
                      {game.singerName}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              game.isCompletedByUser
                ? "bg-purple-100 text-purple-800 border-purple-300"
                : gameStatus.color
            }`}
          >
            {game.isCompletedByUser ? "شرکت کردید" : gameStatus.label}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-telegram-hint">
            {gameStatus.isActive && hasGameData && (
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

            {gameStatus.status === GameStatus.UPCOMING &&
              !game.isCompletedByUser && (
                <div className="text-blue-600">
                  {formatDuration(gameStatus.timeUntilStart)} تا شروع
                </div>
              )}
          </div>

          <button
            onClick={() => handleGameSelect(game, gameStatus)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
              ${buttonConfig.className}
              ${!buttonConfig.canClick ? "cursor-not-allowed" : ""}
            `}
          >
            {buttonConfig.icon}
            {buttonConfig.text}
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
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
            بازی موجود نیست
          </h3>
          <p className="text-telegram-hint">
            در حال حاضر هیچ بازی‌ای موجود نیست. لطفاً بعداً دوباره بررسی کنید.
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

        {/* Active and Upcoming Games */}
        {activeAndUpcomingGames.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="font-semibold text-telegram-text">
                بازی‌های فعال و آینده ({activeAndUpcomingGames.length})
              </h3>
            </div>
            {activeAndUpcomingGames.map(renderGameCard)}
          </div>
        )}

        {/* Finished Games */}
        {finishedGames.length > 0 && (
          <div className="space-y-3">
            {activeAndUpcomingGames.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6"></div>
            )}
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-gray-500" />
              <h3 className="font-semibold text-telegram-text">
                بازی‌های گذشته ({finishedGames.length})
              </h3>
            </div>
            <div className="text-sm text-telegram-hint mb-3">
              می‌توانید نتایج و رتبه‌بندی بازی‌های گذشته را مشاهده کنید
            </div>
            {finishedGames.map(renderGameCard)}
          </div>
        )}

        <div className="text-center text-xs text-telegram-hint">
          لیست هر 30 ثانیه بروزرسانی می‌شود
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default GamesListPage;
