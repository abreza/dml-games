"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { GameBoard } from "@/components/GameBoard";
import { HintModal } from "@/components/HintModal";
import { Game, GameSession, GameStatus } from "@/types/game";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { useGameTimer } from "@/hooks/useGameTimer";
import {
  startGame,
  fetchGameData,
  fetchUserSession,
  guessLetter,
  getTextHint,
  getImageHint,
} from "@/services/gameService";
import { formatUserName, isTimeCritical } from "@/utils/gameUtils";
import { ArrowLeft, Eye } from "lucide-react";
import { preserveQueryParams } from "@/utils/navigationUtils";

type GameState = "loading" | "playing" | "completed";

interface HintModalState {
  isOpen: boolean;
  type: "text" | "image";
  content: string;
}

interface GamePageProps {
  params: Promise<{
    gameId: string;
  }>;
}

const GamePage: React.FC<GamePageProps> = ({ params }) => {
  const router = useRouter();
  const { gameId } = use(params);

  const [gameState, setGameState] = useState<GameState>("loading");
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [currentSession, setCurrentSession] = useState<GameSession | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    if (gameId && user?.id) {
      initializeGame();
    }
  }, [gameId, user?.id]);

  const getGameStatus = (game: Game) => {
    const now = new Date();
    const start = new Date(game.startTime);
    const end = new Date(game.endTime);

    if (now < start) return GameStatus.UPCOMING;
    if (now >= start && now <= end) return GameStatus.ACTIVE;
    return GameStatus.ENDED;
  };

  const initializeGame = async () => {
    setIsLoading(true);
    setGameState("loading");
    setError(null);

    try {
      const game = await fetchGameData(gameId);
      const gameStatus = getGameStatus(game);

      setCurrentGame(game);

      const existingSession = await fetchUserSession(gameId, user!.id);

      if (existingSession) {
        setCurrentSession(existingSession);

        if (existingSession.isCompleted) {
          setGameState("completed");
        } else if (gameStatus === GameStatus.ACTIVE) {
          setGameState("playing");
        } else {
          setGameState("completed");
        }
      } else {
        if (gameStatus === GameStatus.ACTIVE) {
          const { session } = await startGame({
            gameId,
            userId: user!.id,
            userName: formatUserName(user!),
          });

          setCurrentSession(session);
          setGameState("playing");
        } else {
          if (gameStatus === GameStatus.ENDED) {
            router.push(`/game/${gameId}/results`);
            return;
          } else {
            setError("بازی هنوز شروع نشده است");
            return;
          }
        }
      }

      triggerHapticFeedback("medium");
    } catch (error) {
      console.error("Error initializing game:", error);
      setError(error instanceof Error ? error.message : "خطا در بارگذاری بازی");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuessLetter = async (letter: string) => {
    if (
      !currentSession?.userId ||
      !currentGame ||
      isLoading ||
      gameState !== "playing"
    )
      return;

    setIsLoading(true);
    try {
      const { session, isCorrect } = await guessLetter(
        currentGame.id,
        currentSession.userId,
        letter
      );

      setCurrentSession(session);
      triggerHapticFeedback(isCorrect ? "light" : "medium");

      if (session.isCompleted) {
        setGameState("completed");
      }
    } catch (error) {
      console.error("Error guessing letter:", error);
      alert(error instanceof Error ? error.message : "خطا در حدس زدن");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseTextHint = async () => {
    if (
      !currentSession?.userId ||
      !currentGame ||
      isLoading ||
      gameState !== "playing"
    )
      return;

    setIsLoading(true);
    try {
      const { session, textHint } = await getTextHint(
        currentGame.id,
        currentSession.userId
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
      alert(error instanceof Error ? error.message : "خطا در دریافت راهنمایی");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseImageHint = async () => {
    if (
      !currentSession?.userId ||
      !currentGame ||
      isLoading ||
      gameState !== "playing"
    )
      return;

    setIsLoading(true);
    try {
      const { session, imageUrl } = await getImageHint(
        currentGame.id,
        currentSession.userId
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
      alert(error instanceof Error ? error.message : "خطا در دریافت راهنمایی");
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
      setGameState("completed");
    }
    stopTimer();
  }

  const handleBackToGames = () => {
    stopTimer();
    const preservedUrl = preserveQueryParams("/");
    router.push(preservedUrl);
  };

  const handleViewResults = () => {
    stopTimer();
    const preservedUrl = preserveQueryParams(`/game/${gameId}/results`);
    router.push(preservedUrl);
  };

  const handleCloseHint = () => {
    setHintModal({ ...hintModal, isOpen: false });
  };

  const renderContent = () => {
    if (error) {
      return (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{error}</div>
          <div className="space-y-2">
            <button
              onClick={initializeGame}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mr-2"
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
      );
    }

    if (gameState === "loading" || !currentGame || !currentSession) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-telegram-hint">در حال بارگذاری...</p>
        </div>
      );
    }

    if (gameState === "completed") {
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <div className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
              تبریک! بازی تمام شد
            </div>
            <div className="text-green-600 dark:text-green-300 text-lg font-semibold mb-4">
              امتیاز نهایی: {currentSession.score}
            </div>

            <div className="space-y-3">
              <button
                onClick={handleViewResults}
                className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors mx-auto"
              >
                <Eye className="w-5 h-5" />
                مشاهده نتایج کامل و رتبه‌بندی
              </button>

              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleBackToGames}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  بازگشت به لیست
                </button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-green-200 dark:border-green-700">
              <div className="text-sm space-y-2">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                  <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                    جواب صحیح:
                  </div>
                  <div className="text-green-700 dark:text-green-300">
                    <strong>{currentGame.songName}</strong> توسط{" "}
                    <strong>{currentGame.singerName}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/30 dark:bg-gray-800/30 rounded p-2">
                    <div>حروف اشتباه: {currentSession.wrongLetters.length}</div>
                  </div>
                  <div className="bg-white/30 dark:bg-gray-800/30 rounded p-2">
                    <div>
                      راهنمایی:{" "}
                      {(currentSession.usedTextHint ? 1 : 0) +
                        (currentSession.usedImageHint ? 1 : 0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <button
            onClick={handleBackToGames}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            بازگشت به لیست
          </button>

          <div className="flex items-center gap-2">
            {isTimeCritical(timeLeft) && (
              <div className="text-red-600 font-bold text-sm animate-pulse">
                ⏰ {Math.floor(timeLeft / 60)}:
                {(timeLeft % 60).toString().padStart(2, "0")}
              </div>
            )}
          </div>
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
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          {renderContent()}
        </div>
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

export default GamePage;
