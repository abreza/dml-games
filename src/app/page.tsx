"use client";

import React, { useState } from "react";
import { GameBoard } from "../components/GameBoard";
import { GamesList } from "../components/GamesList";
import { HintModal } from "../components/HintModal";
import { Leaderboard } from "../components/Leaderboard";
import { Game, GameSession } from "../types/game";
import { useTelegramWebApp } from "../hooks/useTelegramWebApp";
import { useGameTimer } from "../hooks/useGameTimer";
import { useLeaderboard } from "../hooks/useLeaderboard";
import {
  startGame,
  guessLetter,
  getTextHint,
  getImageHint,
} from "../services/gameService";
import {
  formatUserName,
  validateUserId,
  showAlert,
  isTimeCritical,
} from "../utils/gameUtils";

type GameState = "loading" | "selecting" | "playing";

interface HintModalState {
  isOpen: boolean;
  type: "text" | "image";
  content: string;
}

const MainPage = () => {
  const [gameState, setGameState] = useState<GameState>("selecting");
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [currentSession, setCurrentSession] = useState<GameSession | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hintModal, setHintModal] = useState<HintModalState>({
    isOpen: false,
    type: "text",
    content: "",
  });

  const { user, triggerHapticFeedback } = useTelegramWebApp();

  const { timeLeft, stopTimer } = useGameTimer({
    game: currentGame,
    session: currentSession,
    onGameEnd: handleGameEnd,
  });

  const { players, updateLeaderboard } = useLeaderboard({
    game: currentGame,
    isPlaying: gameState === "playing",
  });

  const handleGameSelect = async (gameId: string) => {
    if (!validateUserId(user?.id)) {
      showAlert("خطا: اطلاعات کاربر موجود نیست");
      return;
    }

    setIsLoading(true);
    setGameState("loading");

    try {
      const { game, session } = await startGame({
        gameId,
        userId: user!.id,
        userName: formatUserName(user!),
      });

      setCurrentGame(game);
      setCurrentSession(session);
      setGameState("playing");
      triggerHapticFeedback("medium");
    } catch (error) {
      console.error("Error starting game:", error);
      showAlert(error instanceof Error ? error.message : "خطا در شروع بازی");
      setGameState("selecting");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuessLetter = async (letter: string) => {
    if (!currentSession || !currentGame || isLoading) return;

    setIsLoading(true);
    try {
      const { session, isCorrect } = await guessLetter(
        currentGame.id,
        currentSession.id,
        letter
      );

      setCurrentSession(session);
      triggerHapticFeedback(isCorrect ? "light" : "medium");

      if (session.isCompleted) {
        await updateLeaderboard();
      }
    } catch (error) {
      console.error("Error guessing letter:", error);
      showAlert(error instanceof Error ? error.message : "خطا در حدس زدن");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseTextHint = async () => {
    if (!currentSession || !currentGame || isLoading) return;

    setIsLoading(true);
    try {
      const { session, textHint } = await getTextHint(
        currentGame.id,
        currentSession.id
      );

      setCurrentSession(session);
      setHintModal({
        isOpen: true,
        type: "text",
        content: textHint,
      });
      triggerHapticFeedback("medium");
    } catch (error) {
      console.error("Error using text hint:", error);
      showAlert(
        error instanceof Error ? error.message : "خطا در دریافت راهنمایی"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseImageHint = async () => {
    if (!currentSession || !currentGame || isLoading) return;

    setIsLoading(true);
    try {
      const { session, imageUrl } = await getImageHint(
        currentGame.id,
        currentSession.id
      );

      setCurrentSession(session);
      setHintModal({
        isOpen: true,
        type: "image",
        content: imageUrl,
      });
      triggerHapticFeedback("medium");
    } catch (error) {
      console.error("Error using image hint:", error);
      showAlert(
        error instanceof Error ? error.message : "خطا در دریافت راهنمایی"
      );
    } finally {
      setIsLoading(false);
    }
  };

  function handleGameEnd() {
    if (currentSession && !currentSession.isCompleted) {
      setCurrentSession((prev) =>
        prev
          ? {
              ...prev,
              isCompleted: true,
              completedAt: new Date(),
            }
          : null
      );
    }
    stopTimer();
  }

  const handleBackToGames = () => {
    setGameState("selecting");
    setCurrentGame(null);
    setCurrentSession(null);
    stopTimer();
  };

  const handleCloseHint = () => {
    setHintModal({ ...hintModal, isOpen: false });
  };

  const renderGameContent = () => {
    switch (gameState) {
      case "loading":
        return (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-telegram-hint">در حال بارگذاری...</p>
          </div>
        );

      case "selecting":
        return <GamesList onGameSelect={handleGameSelect} />;

      case "playing":
        return (
          currentGame &&
          currentSession && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <button
                  onClick={handleBackToGames}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  ← بازگشت به لیست
                </button>

                {isTimeCritical(timeLeft) && (
                  <div className="text-red-600 font-bold text-sm animate-pulse">
                    ⏰ {Math.floor(timeLeft / 60)}:
                    {(timeLeft % 60).toString().padStart(2, "0")}
                  </div>
                )}
              </div>

              <GameBoard
                game={currentGame}
                session={currentSession}
                timeLeft={timeLeft}
                onGuessLetter={handleGuessLetter}
                onUseTextHint={handleUseTextHint}
                onUseImageHint={handleUseImageHint}
                isLoading={isLoading}
              />
            </div>
          )
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          {renderGameContent()}
        </div>

        {players.length > 0 && currentGame && gameState === "playing" && (
          <Leaderboard players={players} currentUserId={user?.id} />
        )}
      </div>

      <HintModal
        isOpen={hintModal.isOpen}
        type={hintModal.type}
        content={hintModal.content}
        onClose={handleCloseHint}
      />
    </div>
  );
};

export default MainPage;
