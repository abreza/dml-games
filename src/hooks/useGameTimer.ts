import { useState, useEffect, useRef } from "react";
import { Game, GameSession } from "../types/game";

interface UseGameTimerProps {
  game: Game | null;
  session: GameSession | null;
  onGameEnd: () => void;
}

export const useGameTimer = ({
  game,
  session,
  onGameEnd,
}: UseGameTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (game && session) {
      startTimer();
    } else {
      stopTimer();
    }

    return () => stopTimer();
  }, [game, session]);

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const updateTimer = () => {
      if (!game) return;

      const now = new Date();
      const endTime = new Date(game.endTime);
      const remaining = Math.max(
        0,
        Math.floor((endTime.getTime() - now.getTime()) / 1000)
      );

      setTimeLeft(remaining);

      if (remaining <= 0 && session && !session.isCompleted) {
        onGameEnd();
        stopTimer();
      }
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return {
    timeLeft,
    formatTime,
    stopTimer,
  };
};
