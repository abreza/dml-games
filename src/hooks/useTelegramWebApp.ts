import { useState, useEffect } from "react";
import { TelegramUser, GameParams } from "../types/telegram";

export const useTelegramWebApp = () => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [gameParams, setGameParams] = useState<GameParams>({});
  const [isReady, setIsReady] = useState(false);
  const [colorScheme, setColorScheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const tg = typeof window !== "undefined" ? window.Telegram?.WebApp : null;

    const applyColorScheme = (scheme: "light" | "dark") => {
      setColorScheme(scheme);
      if (scheme === "dark") {
        document.body.classList.add("dark");
      } else {
        document.body.classList.remove("dark");
      }
    };

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

    if (typeof window !== "undefined") {
      const prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      applyColorScheme(prefersDark ? "dark" : "light");
    }
    setIsReady(true);

    if (params.user_id) {
      const firstName = urlParams.get("first_name");
      const lastName = urlParams.get("last_name");
      const username = urlParams.get("username");

      if (firstName) {
        setUser({
          id: parseInt(params.user_id),
          first_name: decodeURIComponent(firstName),
          last_name: lastName ? decodeURIComponent(lastName) : undefined,
          username: username ? decodeURIComponent(username) : undefined,
        });

        console.log(
          `User data from URL: ${firstName} ${lastName || "(no last name)"} (@${
            username || "no username"
          })`
        );
      } else {
        setUser({
          id: parseInt(params.user_id),
          first_name: "Player",
          last_name: "",
        });

        console.log(`Using fallback user data for user_id: ${params.user_id}`);
      }
    } else if (tg?.initDataUnsafe?.user) {
      setUser(tg.initDataUnsafe.user);
      console.log(
        `User data from Telegram WebApp: ${tg.initDataUnsafe.user.first_name} ${
          tg.initDataUnsafe.user.last_name || "(no last name)"
        }`
      );
    } else {
      console.log("No user data available");
    }
  }, []);

  const triggerHapticFeedback = (
    style: "light" | "medium" | "heavy" = "medium"
  ) => {
    const tg = typeof window !== "undefined" ? window.Telegram?.WebApp : null;
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred(style);
    }
  };

  const getCurrentQueryParams = (): string => {
    if (typeof window === "undefined") return "";
    return window.location.search;
  };

  return {
    user,
    gameParams,
    isReady,
    colorScheme,
    triggerHapticFeedback,
    getCurrentQueryParams,
  };
};
