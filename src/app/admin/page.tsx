"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { Game } from "../../types/game";
import { adminApi } from "../../services/adminApi";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { useGames } from "../../hooks/useGames";
import AuthModal from "@/components/admin/AuthModal";
import GameForm from "@/components/admin/GameForm";
import GamesTable from "@/components/admin/GamesTable";
import LeaderboardModal from "@/components/admin/LeaderboardModal";

interface PlayerLeaderboard {
  userId: number;
  userName: string;
  score: number;
  position?: number;
  isCompleted?: boolean;
  completedAt?: Date;
}

const AdminPage = () => {
  const {
    isAuthenticated,
    showAuthModal,
    authForm,
    authError,
    authLoading,
    handleAuth,
    handleLogout,
    updateAuthForm,
  } = useAdminAuth();

  const {
    games,
    loading: gamesLoading,
    saving,
    createGame,
    updateGame,
    deleteGame,
    createDefaultFormData,
  } = useGames(isAuthenticated);

  const [showForm, setShowForm] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<PlayerLeaderboard[]>(
    []
  );
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  const handleCreate = () => {
    setEditingGame(null);
    setShowForm(true);
  };

  const handleEdit = (game: Game) => {
    setEditingGame(game);
    setShowForm(true);
  };

  const handleSave = async (gameData: any) => {
    if (editingGame) {
      return await updateGame(editingGame.id, gameData);
    } else {
      return await createGame(gameData);
    }
  };

  const handleDelete = async (gameId: string) => {
    const result = await deleteGame(gameId);
    if (!result.success) {
      alert(`خطا در حذف بازی: ${result.error}`);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingGame(null);
  };

  const fetchLeaderboard = async (game: Game) => {
    setSelectedGame(game);
    setLeaderboardLoading(true);
    setShowLeaderboard(true);

    try {
      const data = await adminApi.fetchLeaderboard(game.id);
      setLeaderboardData(data.leaderboard || []);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      setLeaderboardData([]);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const handleCloseLeaderboard = () => {
    setShowLeaderboard(false);
    setSelectedGame(null);
    setLeaderboardData([]);
  };

  if (showAuthModal) {
    return (
      <AuthModal
        authForm={authForm}
        authError={authError}
        authLoading={authLoading}
        onAuth={handleAuth}
        onUpdateForm={updateAuthForm}
      />
    );
  }

  if (gamesLoading) {
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
          <div className="flex items-center gap-4">
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              بازی جدید
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              title="خروج از پنل"
            >
              <X className="w-5 h-5" />
              خروج
            </button>
          </div>
        </div>

        <GamesTable
          games={games}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewLeaderboard={fetchLeaderboard}
          onCreateNew={handleCreate}
        />

        <GameForm
          isOpen={showForm}
          editingGame={editingGame}
          saving={saving}
          onSave={handleSave}
          onClose={handleCloseForm}
          defaultFormData={createDefaultFormData()}
        />

        <LeaderboardModal
          isOpen={showLeaderboard}
          game={selectedGame}
          leaderboardData={leaderboardData}
          loading={leaderboardLoading}
          onClose={handleCloseLeaderboard}
        />
      </div>
    </div>
  );
};

export default AdminPage;
