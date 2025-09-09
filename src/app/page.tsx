"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Play, Trophy, Clock, Eye, History } from "lucide-react";
import { Game, GameStatus } from "../types/game";
import { fetchGames } from "../services/gameService";
import { useTelegramWebApp } from "../hooks/useTelegramWebApp";
import { preserveQueryParams } from "../utils/navigationUtils";

interface GameWithCompletion extends Game {
  isCompletedByUser?: boolean;
  userScore?: number;
}

const GamesListPage = () => {
  const router = useRouter();
  const { user } = useTelegramWebApp();

  const [games, setGames] = useState<GameWithCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveGames = useCallback(async () => {
    if (!games.length) {
      setLoading(true);
    }
    setError(null);
    try {
      const fetchedGames = await fetchGames(user?.id);
      setGames(fetchedGames);
    } catch (err) {
      console.error("Error fetching games:", err);
      setError(err instanceof Error ? err.message : "خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }, [user?.id, games.length]);

  useEffect(() => {
    if (user) {
      fetchActiveGames();
    }
    const interval = setInterval(fetchActiveGames, 30000);
    return () => clearInterval(interval);
  }, [user, fetchActiveGames]);

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
        color:
          "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700",
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
        color:
          "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700",
        timeText: `باقی‌مانده: ${formatDuration(timeLeft)}`,
        timeUntilStart: 0,
        isActive: true,
      };
    }

    return {
      status: GameStatus.ENDED,
      label: "تمام شده",
      color:
        "bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600",
      timeText: `پایان: ${formatTime(end)}`,
      timeUntilStart: 0,
      isActive: false,
    };
  };

  const formatTime = (date: Date | string) => {
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
    if (hours > 0) {
      return `${hours} ساعت و ${minutes} دقیقه`;
    }
    if (minutes > 0) {
      return `${minutes} دقیقه`;
    }
    return `کمتر از یک دقیقه`;
  };

  const getButtonConfig = (game: GameWithCompletion, gameStatus: any) => {
    if (gameStatus.status === GameStatus.ENDED) {
      return {
        text: "مشاهده نتایج",
        icon: <History className="w-4 h-4" />,
        className:
          "bg-purple-600 hover:bg-purple-700 text-white active:scale-95",
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
          "bg-purple-600 hover:bg-purple-700 text-white active:scale-95",
        canClick: true,
        showUserStats: true,
        action: "view_results",
      };
    }

    if (gameStatus.isActive) {
      return {
        text: game.isCompletedByUser ? "بازبینی" : "شروع بازی",
        icon: <Play className="w-4 h-4" />,
        className: "bg-green-600 hover:bg-green-700 text-white active:scale-95",
        canClick: true,
        showUserStats: false,
        action: "play_game",
      };
    }

    if (gameStatus.status === GameStatus.UPCOMING) {
      return {
        text: "منتظر شروع",
        icon: <Clock className="w-4 h-4" />,
        className:
          "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",
        canClick: false,
        showUserStats: false,
        action: "wait",
      };
    }

    return {
      text: "مشاهده نتایج",
      icon: <Eye className="w-4 h-4" />,
      className: "bg-gray-600 hover:bg-gray-700 text-white active:scale-95",
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
        router.push(preserveQueryParams(`/game/${game.id}`));
        break;
      case "view_results":
        router.push(preserveQueryParams(`/game/${game.id}/results`));
        break;
    }
  };

  const handleViewGlobalLeaderboard = () => {
    const preservedUrl = preserveQueryParams("/leaderboard");
    router.push(preservedUrl);
  };

  const activeAndUpcomingGames = games.filter(
    (game) => getGameStatus(game).status !== GameStatus.ENDED
  );
  const finishedGames = games.filter(
    (game) => getGameStatus(game).status === GameStatus.ENDED
  );

  const renderGameCard = (game: GameWithCompletion) => {
    const gameStatus = getGameStatus(game);
    const buttonConfig = getButtonConfig(game, gameStatus);
    const hasGameData = game.songName && game.singerName;
    const isFinished = gameStatus.status === GameStatus.ENDED;

    return (
      <div
        key={game.id}
        className={`bg-white dark:bg-gray-800 rounded-xl p-4 border transition-all shadow-sm ${
          game.isCompletedByUser
            ? "border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20"
            : gameStatus.isActive
            ? "border-green-300 dark:border-green-700"
            : "border-gray-200 dark:border-gray-700"
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 pr-4">
            <div className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-1 mb-2">
              <Clock className="w-4 h-4" />
              <span>{gameStatus.timeText}</span>
            </div>
            {isFinished && hasGameData ? (
              <div className="space-y-1">
                <div className="font-medium text-green-700 dark:text-green-300">
                  {game.songName}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  {game.singerName}
                </div>
              </div>
            ) : (
              <div className="font-semibold text-lg text-gray-900 dark:text-white">
                بازی حدس آهنگ
              </div>
            )}
            {buttonConfig.showUserStats && game.userScore !== undefined && (
              <div className="mt-2 text-sm text-purple-700 dark:text-purple-300 font-medium">
                امتیاز شما: {game.userScore}
              </div>
            )}
          </div>

          <div
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              game.isCompletedByUser
                ? "bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700"
                : gameStatus.color
            }`}
          >
            {game.isCompletedByUser ? "شرکت کردید" : gameStatus.label}
          </div>
        </div>

        <button
          onClick={() => handleGameSelect(game, gameStatus)}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            buttonConfig.className
          } ${!buttonConfig.canClick ? "cursor-not-allowed opacity-70" : ""}`}
        >
          {buttonConfig.icon}
          {buttonConfig.text}
        </button>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              در حال بارگذاری...
            </p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
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
          <Trophy className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            بازی موجود نیست
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            در حال حاضر هیچ بازی‌ای موجود نیست. لطفاً بعداً دوباره بررسی کنید.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            🎵 حدس آهنگ
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            بازی مورد نظر خود را انتخاب کنید
          </p>
        </div>

        {activeAndUpcomingGames.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                بازی‌های فعال و آینده ({activeAndUpcomingGames.length})
              </h3>
            </div>
            {activeAndUpcomingGames.map(renderGameCard)}
          </div>
        )}

        {finishedGames.length > 0 && (
          <div className="space-y-3">
            {activeAndUpcomingGames.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6"></div>
            )}
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                بازی‌های گذشته ({finishedGames.length})
              </h3>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              می‌توانید نتایج و رتبه‌بندی بازی‌های گذشته را مشاهده کنید
            </div>
            {finishedGames.map(renderGameCard)}
          </div>
        )}

        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          لیست هر 30 ثانیه بروزرسانی می‌شود
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl relative border border-gray-200/50 dark:border-gray-700/50">
          <button
            onClick={handleViewGlobalLeaderboard}
            className="absolute top-4 left-4 w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center shadow-lg z-10"
            title="مشاهده رتبه‌بندی کلی"
          >
            <Trophy className="w-5 h-5" />
          </button>

          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default GamesListPage;
