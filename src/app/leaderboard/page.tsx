"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Users,
  TrendingUp,
  Medal,
  Award,
  ArrowLeft,
  RefreshCw,
  Calendar,
  BarChart3,
} from "lucide-react";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { preserveQueryParams } from "@/utils/navigationUtils";

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

interface GlobalStats {
  totalPlayers: number;
  totalGames: number;
  totalSessions: number;
  completedSessions: number;
  completionRate: number;
  averageScore: number;
}

interface GlobalLeaderboardResponse {
  success: boolean;
  leaderboard: PlayerStats[];
  stats: GlobalStats;
  error?: string;
}

const GlobalLeaderboardPage = () => {
  const router = useRouter();
  const { user } = useTelegramWebApp();

  const [leaderboard, setLeaderboard] = useState<PlayerStats[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGlobalLeaderboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch("/api/leaderboard");
      const data: GlobalLeaderboardResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || "خطا در دریافت رتبه‌بندی");
      }

      setLeaderboard(data.leaderboard);
      setGlobalStats(data.stats);
    } catch (err) {
      console.error("Error fetching global leaderboard:", err);
      setError(err instanceof Error ? err.message : "خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchGlobalLeaderboard();
  }, [fetchGlobalLeaderboard]);

  const handleRefresh = () => {
    fetchGlobalLeaderboard(true);
  };

  const handleBackToGames = () => {
    const preservedUrl = preserveQueryParams("/");
    router.push(preservedUrl);
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return (
          <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        );
      case 1:
        return <Medal className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
      case 2:
        return (
          <Award className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        );
      default:
        return (
          <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
            {index + 1}
          </span>
        );
    }
  };

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 border-yellow-300 dark:border-yellow-700";
      case 1:
        return "bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700/50 dark:to-gray-600/50 border-gray-300 dark:border-gray-600";
      case 2:
        return "bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 border-orange-300 dark:border-orange-700";
      default:
        return "bg-white dark:bg-gray-700/50 border-gray-200 dark:border-gray-600";
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fa-IR", {
      month: "short",
      day: "numeric",
    });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
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
            onClick={() => fetchGlobalLeaderboard()}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            تلاش مجدد
          </button>
        </div>
      );
    }

    if (!globalStats || leaderboard.length === 0) {
      return (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            هیچ آماری موجود نیست
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            هنوز هیچ بازیکنی در بازی‌ها شرکت نکرده است.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            رتبه‌بندی کلی
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            آمار و رتبه‌بندی همه بازی‌ها
          </p>
        </div>

        {/* Global Statistics */}
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
          <h3 className="font-bold text-purple-800 dark:text-purple-200 mb-3 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            آمار کلی
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-3 text-center border border-white/50 dark:border-gray-700/50">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {globalStats.totalPlayers.toLocaleString("fa-IR")}
              </div>
              <div className="text-sm text-purple-800 dark:text-purple-200">
                کل بازیکنان
              </div>
            </div>
            <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-3 text-center border border-white/50 dark:border-gray-700/50">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {globalStats.totalGames.toLocaleString("fa-IR")}
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-200">
                کل بازی‌ها
              </div>
            </div>
            <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-3 text-center border border-white/50 dark:border-gray-700/50">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {globalStats.completionRate}%
              </div>
              <div className="text-sm text-green-800 dark:text-green-200">
                نرخ تکمیل
              </div>
            </div>
            <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-3 text-center border border-white/50 dark:border-gray-700/50">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {globalStats.averageScore.toLocaleString("fa-IR")}
              </div>
              <div className="text-sm text-orange-800 dark:text-orange-200">
                میانگین امتیاز
              </div>
            </div>
          </div>
        </div>

        {/* Top Players */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              برترین بازیکنان ({leaderboard.length})
            </h3>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
              title="بروزرسانی"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          <div className="space-y-2">
            {leaderboard.slice(0, 20).map((player, index) => (
              <div
                key={player.userId}
                className={`border rounded-xl p-4 transition-all ${getRankStyle(
                  index
                )} ${
                  player.userId === user?.id
                    ? "ring-2 ring-purple-500 dark:ring-purple-400 ring-opacity-50"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8">
                      {getRankIcon(index)}
                    </div>
                    <div className="flex flex-col">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {player.userName}
                        {player.userId === user?.id && (
                          <span className="text-purple-600 dark:text-purple-400 text-sm mr-1">
                            (شما)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-3">
                        <span>
                          {player.totalGames.toLocaleString("fa-IR")} بازی
                        </span>
                        <span>
                          {player.completedGames.toLocaleString("fa-IR")} تکمیل
                        </span>
                        {player.lastPlayed && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(player.lastPlayed)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {player.averageScore.toLocaleString("fa-IR")}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      میانگین امتیاز
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded border border-white/30 dark:border-gray-700/30">
                    <div className="font-bold text-green-600 dark:text-green-400">
                      {player.completionRate}%
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      نرخ تکمیل
                    </div>
                  </div>
                  <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded border border-white/30 dark:border-gray-700/30">
                    <div className="font-bold text-blue-600 dark:text-blue-400">
                      {player.bestScore.toLocaleString("fa-IR")}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      بهترین امتیاز
                    </div>
                  </div>
                  <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded border border-white/30 dark:border-gray-700/30">
                    <div className="font-bold text-purple-600 dark:text-purple-400">
                      {player.totalScore.toLocaleString("fa-IR")}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      کل امتیاز
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {leaderboard.length > 20 && (
            <div className="text-center text-xs text-gray-600 dark:text-gray-400">
              و {(leaderboard.length - 20).toLocaleString("fa-IR")} بازیکن
              دیگر...
            </div>
          )}
        </div>

        <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
          آخرین بروزرسانی: {new Date().toLocaleTimeString("fa-IR")}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={handleBackToGames}
              className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              بازگشت به لیست
            </button>

            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="font-medium text-purple-600 dark:text-purple-400">
                آمار کلی
              </span>
            </div>
          </div>

          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default GlobalLeaderboardPage;
