import { useState, useEffect } from "react";
import { Game } from "../types/game";
import { adminApi, GameForm } from "../services/adminApi";
import { ADMIN_CONFIG } from "../constants/adminConstants";

export const useGames = (isAuthenticated: boolean) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchGames();
    }
  }, [isAuthenticated]);

  const fetchGames = async () => {
    try {
      const data = await adminApi.fetchGames();
      setGames(data.games || []);
    } catch (error) {
      console.error("Failed to fetch games:", error);
    } finally {
      setLoading(false);
    }
  };

  const createGame = async (gameData: GameForm) => {
    setSaving(true);
    try {
      await adminApi.createGame(gameData);
      await fetchGames();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setSaving(false);
    }
  };

  const updateGame = async (gameId: string, gameData: GameForm) => {
    setSaving(true);
    try {
      await adminApi.updateGame(gameId, gameData);
      await fetchGames();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setSaving(false);
    }
  };

  const deleteGame = async (gameId: string) => {
    try {
      await adminApi.deleteGame(gameId);
      await fetchGames();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const createDefaultFormData = (): GameForm => {
    const now = new Date();
    const endTime = new Date(
      now.getTime() + ADMIN_CONFIG.DEFAULT_GAME_DURATION
    );

    return {
      songName: "",
      singerName: "",
      startTime: now,
      endTime: endTime,
      textHint: "",
      imageUrl: "",
    };
  };

  return {
    games,
    loading,
    saving,
    fetchGames,
    createGame,
    updateGame,
    deleteGame,
    createDefaultFormData,
  };
};
