"use client";

import React, { useState, useEffect, useRef } from "react";
import { GameBoard } from "../components/GameBoard";
import { GamesList } from "../components/GamesList";
import { HintModal } from "../components/HintModal";
import { Leaderboard } from "../components/Leaderboard";
import { Game, GameSession } from "../types/game";

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: any;
  ready: () => void;
  expand: () => void;
  close: () => void;
  MainButton: {
    setText: (text: string) => void;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: "light" | "medium" | "heavy") => void;
  };
  colorScheme: "light" | "dark";
}

interface GameParams {
  user_id?: string;
  chat_id?: string;
  message_id?: string;
  query_id?: string;
  inline_message_id?: string;
  chat_instance?: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

const MainPage = () => {
  const [gameState, setGameState] = useState<
    "selecting" | "playing" | "loading"
  >("selecting");
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [currentSession, setCurrentSession] = useState<GameSession | null>(
    null
  );
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [gameParams, setGameParams] = useState<GameParams>({});
  const [hintModal, setHintModal] = useState<{
    isOpen: boolean;
    type: "text" | "image";
    content: string;
  }>({
    isOpen: false,
    type: "text",
    content: "",
  });
  const [players, setPlayers] = useState<any[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const tg = typeof window !== "undefined" ? window.Telegram?.WebApp : null;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const params: GameParams = {
      user_id: urlParams.get("user_id") || undefined,
      chat_id: urlParams.get("chat_id") || undefined,
      message_id: urlParams.get("message_id") || undefined,
      query_id: urlParams.get("query_id") || undefined,
      inline_message_id: urlParams.get("inline_message_id") || undefined,
      chat_instance: urlParams.get("chat_instance") || undefined,
    };

    setGameParams(params);

    if (tg) {
      setTimeout(() => {
        tg.ready();
        tg.expand();
      }, 500);
    }
    if (params.user_id) {
      setUser({
        id: parseInt(params.user_id),
      });
    }
  }, [tg]);

  useEffect(() => {
    if (currentSession && currentGame) {
      startTimer();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentSession, currentGame]);

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const updateTimer = () => {
      if (!currentGame) return;

      const now = new Date();
      const endTime = new Date(currentGame.endTime);
      const remaining = Math.max(
        0,
        Math.floor((endTime.getTime() - now.getTime()) / 1000)
      );

      setTimeLeft(remaining);

      if (remaining <= 0 && currentSession && !currentSession.isCompleted) {
        handleGameEnd();
      }
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);
  };

  const handleGameSelect = async (gameId: string) => {
    if (!user?.id) {
      alert("خطا: اطلاعات کاربر موجود نیست");
      return;
    }

    setIsLoading(true);
    setGameState("loading");

    try {
      const response = await fetch("/api/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameId,
          userId: user.id,
          userName: `${user.first_name}${
            user.last_name ? ` ${user.last_name}` : ""
          }`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentGame(data.game);
        setCurrentSession(data.session);
        setGameState("playing");

        if (tg?.HapticFeedback) {
          tg.HapticFeedback.impactOccurred("medium");
        }
      } else {
        alert(data.error || "خطا در شروع بازی");
        setGameState("selecting");
      }
    } catch (error) {
      console.error("Error starting game:", error);
      alert("خطا در ارتباط با سرور");
      setGameState("selecting");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuessLetter = async (letter: string) => {
    if (!currentSession || !currentGame || isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/games/${currentGame.id}/session/${currentSession.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "guess_letter",
            letter,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setCurrentSession(data.session);

        if (tg?.HapticFeedback) {
          tg.HapticFeedback.impactOccurred(data.isCorrect ? "light" : "medium");
        }

        if (data.session.isCompleted) {
          await saveScore(data.session.score);
        }
      } else {
        alert(data.error || "خطا در حدس زدن");
      }
    } catch (error) {
      console.error("Error guessing letter:", error);
      alert("خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseTextHint = async () => {
    if (!currentSession || !currentGame || isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/games/${currentGame.id}/session/${currentSession.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "use_text_hint",
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setCurrentSession(data.session);
        setHintModal({
          isOpen: true,
          type: "text",
          content: data.textHint,
        });

        if (tg?.HapticFeedback) {
          tg.HapticFeedback.impactOccurred("medium");
        }
      } else {
        alert(data.error || "خطا در دریافت راهنمایی");
      }
    } catch (error) {
      console.error("Error using text hint:", error);
      alert("خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseImageHint = async () => {
    if (!currentSession || !currentGame || isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/games/${currentGame.id}/session/${currentSession.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "use_image_hint",
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setCurrentSession(data.session);
        setHintModal({
          isOpen: true,
          type: "image",
          content: data.imageUrl,
        });

        if (tg?.HapticFeedback) {
          tg.HapticFeedback.impactOccurred("medium");
        }
      } else {
        alert(data.error || "خطا در دریافت راهنمایی");
      }
    } catch (error) {
      console.error("Error using image hint:", error);
      alert("خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  };

  const saveScore = async (score: number) => {
    if (!user?.id || !currentGame || !currentSession) return;

    try {
      const userName = `${user.first_name}${
        user.last_name ? ` ${user.last_name}` : ""
      }`;

      const requestBody: any = {
        userId: user.id,
        userName: userName,
        score: score,
        clicks: 0,
      };

      if (gameParams.inline_message_id) {
        requestBody.inlineMessageId = gameParams.inline_message_id;
      } else if (gameParams.chat_id && gameParams.message_id) {
        requestBody.chatId = parseInt(gameParams.chat_id);
        requestBody.messageId = parseInt(gameParams.message_id);
      }

      const response = await fetch("/api/scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success && data.scores) {
        setPlayers(data.scores);
        console.log("Score saved successfully");
      }
    } catch (error) {
      console.error("Error saving score:", error);
    }
  };

  const handleGameEnd = () => {
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

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleBackToGames = () => {
    setGameState("selecting");
    setCurrentGame(null);
    setCurrentSession(null);
    setTimeLeft(0);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          {gameState === "loading" && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-telegram-hint">در حال بارگذاری...</p>
            </div>
          )}

          {gameState === "selecting" && (
            <GamesList onGameSelect={handleGameSelect} />
          )}

          {gameState === "playing" && currentGame && currentSession && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <button
                  onClick={handleBackToGames}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  ← بازگشت به لیست
                </button>

                {timeLeft <= 60 && timeLeft > 0 && (
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
          )}
        </div>

        {players.length > 0 && (
          <Leaderboard
            players={players}
            currentUserId={user?.id}
            isInlineGame={!!gameParams.inline_message_id}
          />
        )}
      </div>

      <HintModal
        isOpen={hintModal.isOpen}
        type={hintModal.type}
        content={hintModal.content}
        onClose={() => setHintModal({ ...hintModal, isOpen: false })}
      />
    </div>
  );
};

export default MainPage;
