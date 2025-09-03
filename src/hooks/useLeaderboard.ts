import { useState, useEffect, useRef } from "react";
import { Game } from "../types/game";
import { PlayerLeaderboard } from "../types/api";
import { fetchGameLeaderboard } from "../services/gameService";

interface UseLeaderboardProps {
  game: Game | null;
  isPlaying: boolean;
}

export const useLeaderboard = ({ game, isPlaying }: UseLeaderboardProps) => {
  const [players, setPlayers] = useState<PlayerLeaderboard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const leaderboardRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (game && isPlaying) {
      startLeaderboardUpdates();
    } else {
      stopLeaderboardUpdates();
    }

    return () => stopLeaderboardUpdates();
  }, [game, isPlaying]);

  const startLeaderboardUpdates = () => {
    if (leaderboardRef.current) {
      clearInterval(leaderboardRef.current);
    }

    // Initial load
    updateLeaderboard();

    // Update every 10 seconds
    leaderboardRef.current = setInterval(updateLeaderboard, 10000);
  };

  const stopLeaderboardUpdates = () => {
    if (leaderboardRef.current) {
      clearInterval(leaderboardRef.current);
      leaderboardRef.current = null;
    }
  };

  const updateLeaderboard = async () => {
    if (!game) return;

    setIsLoading(true);
    try {
      const leaderboard = await fetchGameLeaderboard(game.id);
      setPlayers(leaderboard);
    } catch (error) {
      console.error("Error updating leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const forceUpdate = async () => {
    await updateLeaderboard();
  };

  return {
    players,
    isLoading,
    updateLeaderboard: forceUpdate,
    stopLeaderboardUpdates,
  };
};
