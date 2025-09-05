"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Music,
  Users,
  Trophy,
} from "lucide-react";
import { Game } from "../../types/game";

interface GameForm extends Omit<Game, "id" | "createdAt" | "updatedAt"> {
  id?: string;
}

interface PlayerLeaderboard {
  userId: number;
  userName: string;
  score: number;
  position?: number;
  isCompleted?: boolean;
  completedAt?: Date;
}

const AdminPage = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<PlayerLeaderboard[]>(
    []
  );
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<GameForm>({
    songName: "",
    singerName: "",
    startTime: new Date(),
    endTime: new Date(),
    textHint: "",
    imageUrl: "",
  });

  const fetchLeaderboard = async (game: Game) => {
    setSelectedGame(game);
    setLeaderboardLoading(true);
    setShowLeaderboard(true);

    try {
      const response = await fetch(`/api/games/${game.id}/leaderboard`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboardData(data.leaderboard || []);
      } else {
        console.error("Failed to fetch leaderboard");
        setLeaderboardData([]);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      setLeaderboardData([]);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await fetch("/api/admin/games");
      if (response.ok) {
        const data = await response.json();
        setGames(data.games || []);
      }
    } catch (error) {
      console.error("Failed to fetch games:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    const now = new Date();
    const endTime = new Date(now.getTime() + 60 * 60 * 1000);

    setFormData({
      songName: "",
      singerName: "",
      startTime: now,
      endTime: endTime,
      textHint: "",
      imageUrl: "",
    });
    setEditingGame(null);
  };

  const handleCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (game: Game) => {
    setFormData({
      id: game.id,
      songName: game.songName,
      singerName: game.singerName,
      startTime: new Date(game.startTime),
      endTime: new Date(game.endTime),
      textHint: game.textHint || "",
      imageUrl: game.imageUrl || "",
    });
    setEditingGame(game);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.songName.trim() || !formData.singerName.trim()) {
      alert("لطفاً تمام فیلدهای اجباری را پر کنید");
      return;
    }

    if (formData.endTime <= formData.startTime) {
      alert("زمان پایان باید بعد از زمان شروع باشد");
      return;
    }

    setSaving(true);

    try {
      const url = editingGame
        ? `/api/admin/games/${editingGame.id}`
        : "/api/admin/games";
      const method = editingGame ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchGames();
        setShowForm(false);
        resetForm();
      } else {
        const errorData = await response.json();
        alert(`خطا: ${errorData.error || "عملیات ناموفق بود"}`);
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("خطا در ذخیره اطلاعات");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (gameId: string) => {
    if (!confirm("آیا از حذف این بازی مطمئن هستید؟")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/games/${gameId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchGames();
      } else {
        alert("خطا در حذف بازی");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("خطا در حذف بازی");
    }
  };

  const getGameStatus = (game: Game) => {
    const now = new Date();
    const start = new Date(game.startTime);
    const end = new Date(game.endTime);

    if (now < start)
      return {
        status: "upcoming",
        label: "آینده",
        color: "bg-blue-100 text-blue-800",
      };
    if (now >= start && now <= end)
      return {
        status: "active",
        label: "فعال",
        color: "bg-green-100 text-green-800",
      };
    return {
      status: "ended",
      label: "تمام شده",
      color: "bg-gray-100 text-gray-800",
    };
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">مدیریت بازی‌ها</h1>
            <p className="text-gray-600 mt-2">مدیریت بازی‌های حدس آهنگ</p>
          </div>
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            بازی جدید
          </button>
        </div>

        {/* Games List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {games.length === 0 ? (
            <div className="p-12 text-center">
              <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                هیچ بازی‌ای موجود نیست
              </h3>
              <p className="text-gray-500 mb-6">اولین بازی خود را ایجاد کنید</p>
              <button
                onClick={handleCreate}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ایجاد بازی جدید
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                      آهنگ
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                      خواننده
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                      شروع
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                      پایان
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                      وضعیت
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {games.map((game) => {
                    const status = getGameStatus(game);
                    return (
                      <tr key={game.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {game.songName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {game.singerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(game.startTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(game.endTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <button
                              onClick={() => handleEdit(game)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title="ویرایش بازی"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => fetchLeaderboard(game)}
                              className="text-green-600 hover:text-green-900 transition-colors"
                              title="مشاهده رتبه‌بندی"
                            >
                              <Users className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(game.id)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="حذف بازی"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingGame ? "ویرایش بازی" : "ایجاد بازی جدید"}
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نام آهنگ *
                      </label>
                      <input
                        type="text"
                        value={formData.songName}
                        onChange={(e) =>
                          setFormData({ ...formData, songName: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="نام آهنگ"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نام خواننده *
                      </label>
                      <input
                        type="text"
                        value={formData.singerName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            singerName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="نام خواننده"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        زمان شروع *
                      </label>
                      <input
                        type="datetime-local"
                        value={new Date(
                          formData.startTime.getTime() -
                            formData.startTime.getTimezoneOffset() * 60000
                        )
                          .toISOString()
                          .slice(0, 16)}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startTime: new Date(e.target.value),
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        زمان پایان *
                      </label>
                      <input
                        type="datetime-local"
                        value={new Date(
                          formData.endTime.getTime() -
                            formData.endTime.getTimezoneOffset() * 60000
                        )
                          .toISOString()
                          .slice(0, 16)}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            endTime: new Date(e.target.value),
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      راهنمایی متنی
                    </label>
                    <textarea
                      value={formData.textHint}
                      onChange={(e) =>
                        setFormData({ ...formData, textHint: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="راهنمایی متنی (اختیاری)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      لینک تصویر
                    </label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, imageUrl: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 space-x-reverse mt-8">
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={saving}
                  >
                    لغو
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        در حال ذخیره...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        ذخیره
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Modal */}
        {showLeaderboard && selectedGame && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-yellow-600" />
                      رتبه‌بندی بازی
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {selectedGame.songName} - {selectedGame.singerName}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowLeaderboard(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {leaderboardLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {leaderboardData.length}
                        </div>
                        <div className="text-sm text-blue-800">
                          کل شرکت‌کنندگان
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {leaderboardData.filter((p) => p.isCompleted).length}
                        </div>
                        <div className="text-sm text-green-800">
                          تکمیل کننده
                        </div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {leaderboardData.length > 0
                            ? Math.max(...leaderboardData.map((p) => p.score))
                            : 0}
                        </div>
                        <div className="text-sm text-orange-800">
                          بالاترین امتیاز
                        </div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {leaderboardData.length > 0
                            ? Math.round(
                                leaderboardData.reduce(
                                  (sum, p) => sum + p.score,
                                  0
                                ) / leaderboardData.length
                              )
                            : 0}
                        </div>
                        <div className="text-sm text-purple-800">
                          میانگین امتیاز
                        </div>
                      </div>
                    </div>

                    {/* Leaderboard */}
                    {leaderboardData.length > 0 ? (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          رتبه‌بندی بازیکنان
                        </h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {leaderboardData.map((player, index) => (
                            <div
                              key={player.userId}
                              className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                                index < 3
                                  ? "bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-300"
                                  : "bg-white border border-gray-200"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                    index === 0
                                      ? "bg-yellow-500 text-white"
                                      : index === 1
                                      ? "bg-gray-400 text-white"
                                      : index === 2
                                      ? "bg-orange-600 text-white"
                                      : "bg-gray-200 text-gray-700"
                                  }`}
                                >
                                  {index + 1}
                                </span>
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">
                                      {player.userName}
                                    </span>
                                    {player.isCompleted ? (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        ✓ تکمیل شده
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        در حال بازی
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    ID: {player.userId}
                                    {player.completedAt && (
                                      <span className="mr-2">
                                        • تکمیل:{" "}
                                        {new Date(
                                          player.completedAt
                                        ).toLocaleString("fa-IR")}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-left">
                                <span
                                  className={`font-bold text-lg ${
                                    player.isCompleted
                                      ? "text-green-600"
                                      : "text-blue-600"
                                  }`}
                                >
                                  {player.score.toLocaleString("fa-IR")}
                                </span>
                                <div className="text-xs text-gray-500">
                                  امتیاز
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          هیچ بازیکنی موجود نیست
                        </h3>
                        <p className="text-gray-500">
                          هنوز هیچکس در این بازی شرکت نکرده است
                        </p>
                      </div>
                    )}

                    {/* Export Options */}
                    {leaderboardData.length > 0 && (
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-600">
                            آخرین بروزرسانی:{" "}
                            {new Date().toLocaleString("fa-IR")}
                          </div>
                          <button
                            onClick={() => {
                              const csvContent = [
                                [
                                  "رتبه",
                                  "نام",
                                  "امتیاز",
                                  "وضعیت",
                                  "زمان تکمیل",
                                ].join(","),
                                ...leaderboardData.map((player, index) =>
                                  [
                                    index + 1,
                                    `"${player.userName}"`,
                                    player.score,
                                    player.isCompleted
                                      ? "تکمیل شده"
                                      : "در حال بازی",
                                    player.completedAt
                                      ? new Date(
                                          player.completedAt
                                        ).toLocaleString("fa-IR")
                                      : "-",
                                  ].join(",")
                                ),
                              ].join("\n");

                              const blob = new Blob([csvContent], {
                                type: "text/csv;charset=utf-8;",
                              });
                              const link = document.createElement("a");
                              const url = URL.createObjectURL(blob);
                              link.setAttribute("href", url);
                              link.setAttribute(
                                "download",
                                `leaderboard_${selectedGame.songName}_${
                                  new Date().toISOString().split("T")[0]
                                }.csv`
                              );
                              link.style.visibility = "hidden";
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            دانلود CSV
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        onClick={() => setShowLeaderboard(false)}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        بستن
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
