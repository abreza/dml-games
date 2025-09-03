/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { DebugInfo } from "../components/DebugInfo";
import { WaitingScreen } from "../components/WaitingScreen";
import { GameScreen } from "../components/GameScreen";
import { FinishedScreen } from "../components/FinishedScreen";
import { Leaderboard } from "../components/Leaderboard";

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    chat?: {
      id: number;
      title: string;
      type: string;
    };
  };
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

interface Player {
  userId: number;
  userName: string;
  score: number;
  position?: number;
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

const GAME_DURATION = 30;
const TARGET_CLICKS = 100;

const Game = () => {
  const [gameState, setGameState] = useState<
    "waiting" | "playing" | "finished"
  >("waiting");
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [players, setPlayers] = useState<Player[]>([]);
  const [user, setUser] = useState<any>(null);
  const [gameParams, setGameParams] = useState<GameParams>({});
  const [isInlineGame, setIsInlineGame] = useState(false);
  const [isScoreSaving, setIsScoreSaving] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gameStartTimeRef = useRef<number | null>(null);
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
    setIsInlineGame(!!params.inline_message_id);

    console.log("🎮 Game URL params:", params);
    console.log("🔍 Current URL:", window.location.href);

    if (tg) {
      console.log("📱 Telegram WebApp object:", {
        initData: tg.initData,
        initDataUnsafe: tg.initDataUnsafe,
      });

      setTimeout(() => {
        tg.ready();
        tg.expand();

        const userData = tg.initDataUnsafe?.user;
        const chatData = tg.initDataUnsafe?.chat;

        console.log("👤 User data from Telegram:", userData);
        console.log("💬 Chat data from Telegram:", chatData);

        let finalUser = userData;
        let finalChat = chatData;

        if (!finalUser && params.user_id) {
          console.log("⚠️ No user data from Telegram, using URL params");
          finalUser = {
            id: parseInt(params.user_id),
            first_name: "Player",
          };
        }

        if (!finalChat && params.chat_id) {
          console.log("⚠️ No chat data from Telegram, using URL params");
          finalChat = {
            id: parseInt(params.chat_id),
            title: "Game Chat",
            type: "group",
          };
        }

        setUser(finalUser);

        console.log("✅ Final game state:", {
          user: finalUser,
          chat: finalChat,
          isInline: !!params.inline_message_id,
          params,
        });
      }, 500);
    } else {
      console.log("❌ Telegram WebApp not available");

      if (params.user_id) {
        setUser({
          id: parseInt(params.user_id),
          first_name: "Player",
        });
      }
    }
  }, [tg]);

  useEffect(() => {
    if (
      user?.id &&
      (gameParams.inline_message_id ||
        (gameParams.chat_id && gameParams.message_id))
    ) {
      loadGameScores();
    }
  }, [user, gameParams]);

  const loadGameScores = async () => {
    if (!user?.id) {
      console.log("No user ID available for loading scores");
      return;
    }

    try {
      console.log("Loading game scores...");

      let url = `/api/scores?userId=${user.id}`;

      if (gameParams.inline_message_id) {
        url += `&inlineMessageId=${encodeURIComponent(
          gameParams.inline_message_id
        )}`;
      } else if (gameParams.chat_id && gameParams.message_id) {
        url += `&chatId=${gameParams.chat_id}&messageId=${gameParams.message_id}`;
      } else {
        console.log("Missing game identification parameters");
        return;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success && data.scores) {
        setPlayers(data.scores);
        console.log(`Loaded ${data.scores.length} scores from Telegram`);
      } else {
        console.log("No scores found or API error:", data);
      }
    } catch (error) {
      console.error("Failed to load scores:", error);
    }
  };

  const saveScore = async (playerScore: number) => {
    if (!user?.id) {
      console.log("No user data available for saving score");
      return;
    }

    if (isScoreSaving) {
      console.log("Score save already in progress...");
      return;
    }

    setIsScoreSaving(true);

    try {
      const userName = `${user.first_name}${
        user.last_name ? ` ${user.last_name}` : ""
      }`;

      const requestBody: any = {
        userId: user.id,
        userName: userName,
        score: playerScore,
        clicks: clicks,
      };

      if (gameParams.inline_message_id) {
        requestBody.inlineMessageId = gameParams.inline_message_id;
        console.log(
          "Saving score for inline game:",
          gameParams.inline_message_id
        );
      } else if (gameParams.chat_id && gameParams.message_id) {
        requestBody.chatId = parseInt(gameParams.chat_id);
        requestBody.messageId = parseInt(gameParams.message_id);
        console.log(
          `Saving score for chat game: ${gameParams.chat_id}/${gameParams.message_id}`
        );
      } else {
        console.error("Missing game identification for score saving");
        setIsScoreSaving(false);
        return;
      }

      console.log("Submitting score to Telegram:", requestBody);

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
        console.log("Score saved successfully to Telegram");

        if (tg?.HapticFeedback) {
          tg.HapticFeedback.impactOccurred("medium");
        }
      } else {
        console.error("Failed to save score:", data);
        alert("خطا در ذخیره امتیاز. دوباره تلاش کنید.");
      }
    } catch (error) {
      console.error("Error saving score:", error);
      alert("خطا در ذخیره امتیاز. دوباره تلاش کنید.");
    } finally {
      setIsScoreSaving(false);
    }
  };

  const startGame = useCallback(() => {
    setGameState("playing");
    setClicks(0);
    setTimeLeft(GAME_DURATION);
    setScore(0);
    gameStartTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred("light");
    }
  }, [tg]);

  const endGame = useCallback(() => {
    setGameState("finished");
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleClick = useCallback(() => {
    if (gameState !== "playing") return;

    const newClickCount = clicks + 1;
    setClicks(newClickCount);

    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred("light");
    }

    if (newClickCount >= TARGET_CLICKS) {
      const elapsedTime = gameStartTimeRef.current
        ? (Date.now() - gameStartTimeRef.current) / 1000
        : GAME_DURATION;
      const remainingTime = Math.max(0, GAME_DURATION - elapsedTime);
      const finalScore = Math.floor(remainingTime);

      setScore(finalScore);
      saveScore(finalScore);
      endGame();
    }
  }, [gameState, clicks, tg, endGame]);

  const resetGame = () => {
    setGameState("waiting");
    setClicks(0);
    setTimeLeft(GAME_DURATION);
    setScore(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <DebugInfo tg={tg} user={user} gameParams={gameParams} />
      <div className="max-w-md mx-auto">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          {gameState === "waiting" && (
            <WaitingScreen
              isInlineGame={isInlineGame}
              onStart={startGame}
              gameDuration={GAME_DURATION}
              targetClicks={TARGET_CLICKS}
            />
          )}
          {gameState === "playing" && (
            <GameScreen
              timeLeft={timeLeft}
              clicks={clicks}
              targetClicks={TARGET_CLICKS}
              onClick={handleClick}
            />
          )}
          {gameState === "finished" && (
            <FinishedScreen
              clicks={clicks}
              targetClicks={TARGET_CLICKS}
              score={score}
              onReset={resetGame}
            />
          )}

          {isScoreSaving && (
            <div className="mt-4 text-center">
              <div className="text-blue-600 text-sm">
                🏆 در حال ذخیره امتیاز در تلگرام...
              </div>
            </div>
          )}
        </div>

        <Leaderboard
          players={players}
          currentUserId={user?.id}
          isInlineGame={isInlineGame}
        />
      </div>
    </div>
  );
};

export default Game;
