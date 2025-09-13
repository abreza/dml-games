"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Leaderboard } from "@/components/Leaderboard";
import { Game, GameSession } from "@/types/game";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { fetchGameData, fetchUserSession } from "@/services/gameService";
import { formatTime } from "@/utils/gameUtils";
import { ArrowLeft, Play, Trophy, Users } from "lucide-react";
import { preserveQueryParams } from "@/utils/navigationUtils";

interface GameResultsPageProps {
  params: Promise<{
    gameId: string;
  }>;
}

const GameResultsPage: React.FC<GameResultsPageProps> = ({ params }) => {
  const router = useRouter();
  const { gameId } = use(params);

  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [currentSession, setCurrentSession] = useState<GameSession | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user, triggerHapticFeedback } = useTelegramWebApp();

  const { players, updateLeaderboard } = useLeaderboard({
    game: currentGame,
    isPlaying: true,
  });

  const getGameStatus = useCallback((game?: Game | null) => {
    game = game || currentGame;
    if (!game) return null;

    const now = new Date();
    const startTime = new Date(game.startTime);
    const endTime = new Date(game.endTime);

    if (now < startTime) {
      return {
        label: "آغاز نشده",
        color: "text-blue-600",
        isActive: false,
        isEnded: false,
        isUpcoming: true,
      };
    }

    if (now >= startTime && now <= endTime) {
      return {
        label: "در حال اجرا",
        color: "text-green-600",
        isActive: true,
        isEnded: false,
        isUpcoming: false,
      };
    }

    return {
      label: "تمام شده",
      color: "text-gray-600",
      isActive: false,
      isEnded: true,
      isUpcoming: false,
    };
  }, []);

  const initializeGameResults = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const game = await fetchGameData(gameId);
      setCurrentGame(game);

      const gameStatus = getGameStatus(game);

      if (user?.id) {
        const session = await fetchUserSession(gameId, user!.id);
        if (session) {
          setCurrentSession(session);
        } else {
          setCurrentSession(null);
          setIsLoading(false);
          if (gameStatus?.isUpcoming) {
            setError("این بازی هنوز شروع نشده است");
            return;
          }
        }
      }

      await updateLeaderboard();
      triggerHapticFeedback("light");
    } catch (error) {
      console.error("Error loading game results:", error);
      setError(
        error instanceof Error ? error.message : "خطا در بارگذاری نتایج"
      );
    } finally {
      setIsLoading(false);
    }
  }, [gameId, getGameStatus, user?.id]);

  useEffect(() => {
    if (gameId) {
      initializeGameResults();
    }
  }, [gameId, initializeGameResults]);

  const handleBackToGames = () => {
    const preservedUrl = preserveQueryParams("/");
    router.push(preservedUrl);
  };

  const handlePlayGame = () => {
    if (currentGame) {
      const gameStatus = getGameStatus(currentGame);

      if (gameStatus?.isActive) {
        const preservedUrl = preserveQueryParams(`/game/${gameId}`);
        router.push(preservedUrl);
      } else if (gameStatus?.isEnded) {
        alert("این بازی به پایان رسیده است");
      } else {
        alert("این بازی هنوز شروع نشده است");
      }
    }
  };

  const gameStatus = getGameStatus();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-telegram-hint">
                در حال بارگذاری نتایج...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">{error}</div>
              <div className="space-y-2">
                <button
                  onClick={initializeGameResults}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors mr-2"
                >
                  تلاش مجدد
                </button>
                <button
                  onClick={handleBackToGames}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  بازگشت به لیست
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="text-center py-12">
              <p className="text-telegram-hint">اطلاعات بازی یافت نشد</p>
              <button
                onClick={handleBackToGames}
                className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                بازگشت به لیست
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={handleBackToGames}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-800 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              بازگشت به لیست
            </button>

            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-600">نتایج بازی</span>
            </div>
          </div>

          {gameStatus && (
            <div className="mb-6 text-center">
              <div className={`text-sm font-medium ${gameStatus.color} mb-2`}>
                وضعیت بازی: {gameStatus.label}
              </div>
              <div className="text-xs text-telegram-hint">
                {gameStatus.isEnded
                  ? `پایان: ${formatTime(currentGame.endTime)}`
                  : gameStatus.isActive
                  ? "بازی در حال اجراست"
                  : `شروع: ${formatTime(currentGame.startTime)}`}
              </div>
            </div>
          )}

          {currentSession ? (
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-xl p-4 text-center mb-6">
              <div className="text-2xl mb-2">
                {currentSession.isCompleted ? "🎉" : "⏰"}
              </div>
              <div className="text-lg font-bold text-purple-800 dark:text-purple-200">
                {currentSession.isCompleted
                  ? "تبریک! بازی تمام شد"
                  : "بازی ناتمام"}
              </div>
              <div className="text-purple-600 dark:text-purple-300 text-lg font-semibold mt-1">
                امتیاز شما: {currentSession.score}
              </div>

              <div className="mt-4 flex gap-2 justify-center">
                {gameStatus?.isActive && (
                  <button
                    onClick={handlePlayGame}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <Play className="w-4 h-4" />
                    {currentSession.isCompleted ? "بازی دوباره" : "ادامه بازی"}
                  </button>
                )}
                <button
                  onClick={handleBackToGames}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  بازی‌های دیگر
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-gray-100 to-blue-100 dark:from-gray-800 dark:to-blue-900 rounded-xl p-4 text-center mb-6">
              <div className="text-2xl mb-2">👀</div>
              <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                نتایج بازی
              </div>
              <div className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                شما در این بازی شرکت نکردید
              </div>
              <div className="mt-4 flex gap-2 justify-center">
                {gameStatus?.isActive && (
                  <button
                    onClick={handlePlayGame}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <Play className="w-4 h-4" />
                    شروع بازی
                  </button>
                )}
                <button
                  onClick={handleBackToGames}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  بازی‌های دیگر
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
              <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                نام آهنگ:
              </div>
              <div className="text-lg font-bold text-green-700 dark:text-green-300">
                {currentGame.songName}
              </div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
              <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                نام خواننده:
              </div>
              <div className="text-lg font-bold text-green-700 dark:text-green-300">
                {currentGame.singerName}
              </div>
            </div>
          </div>

          {currentSession && (
            <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-4 mb-6">
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3">
                عملکرد شما
              </h3>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex justify-between">
                  <span>حروف اشتباه:</span>
                  <span className="font-medium text-red-600">
                    {currentSession.wrongLetters.length}
                    {currentSession.wrongLetters.length > 0 &&
                      ` (-${currentSession.wrongLetters.length * 20})`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>استفاده از راهنمایی متنی:</span>
                  <span
                    className={
                      currentSession.usedTextHint
                        ? "text-yellow-600"
                        : "text-green-600"
                    }
                  >
                    {currentSession.usedTextHint
                      ? "استفاده شده (-30)"
                      : "استفاده نشده"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>استفاده از راهنمایی تصویری:</span>
                  <span
                    className={
                      currentSession.usedImageHint
                        ? "text-orange-600"
                        : "text-green-600"
                    }
                  >
                    {currentSession.usedImageHint
                      ? "استفاده شده (-100)"
                      : "استفاده نشده"}
                  </span>
                </div>
                {currentSession.completedAt && (
                  <div className="flex justify-between">
                    <span>زمان تکمیل:</span>
                    <span className="font-medium text-green-600">
                      {new Date(currentSession.completedAt).toLocaleTimeString(
                        "fa-IR"
                      )}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>وضعیت آهنگ:</span>
                  <span
                    className={
                      currentSession.isSongGuessed
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {currentSession.isSongGuessed
                      ? "حدس زده شد (+100)"
                      : "حدس زده نشد"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>وضعیت خواننده:</span>
                  <span
                    className={
                      currentSession.isSingerGuessed
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {currentSession.isSingerGuessed
                      ? "حدس زده شد (+100)"
                      : "حدس زده نشد"}
                  </span>
                </div>
              </div>

              {currentSession.wrongLetters.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="text-sm text-red-800 dark:text-red-200 font-medium mb-2">
                    حروف اشتباه:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {currentSession.wrongLetters.map((letter, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 rounded text-sm"
                      >
                        {letter}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {players.length > 0 && (
            <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-4 mb-6">
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                آمار کلی بازی
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {players.length}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    کل شرکت‌کنندگان
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {players.filter((p) => p.isCompleted).length}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    تکمیل کننده
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {players.length > 0 && currentGame && (
          <Leaderboard players={players} currentUserId={user?.id} />
        )}
      </div>
    </div>
  );
};

export default GameResultsPage;
