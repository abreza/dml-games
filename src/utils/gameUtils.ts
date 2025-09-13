import { Game } from "../types/game";
import { GAME_STATUS, GAME_STATUS_LABELS } from "../constants/adminConstants";

import { TelegramUser } from "../types/telegram";

export const sanitizeText = (text: string): string => {
  if (!text) return "";
  return text.trim().replace(/\s+/g, " ").replace(/ي/g, "ی").replace(/ك/g, "ک");
};

export const normalizeForComparison = (
  text: string,
  language: "fa" | "en"
): string => {
  const sanitized = sanitizeText(text);
  if (language === "en") {
    return sanitized.toUpperCase();
  }
  return sanitized;
};

export const formatUserName = (user: TelegramUser): string => {
  if (!user) return "بازیکن";

  let fullName = user.first_name || "بازیکن";

  if (user.last_name && user.last_name.trim()) {
    fullName += " " + user.last_name;
  }

  fullName = fullName.trim();
  if (fullName.length > 30) {
    fullName = fullName.substring(0, 27) + "...";
  }

  return fullName;
};

export const formatTime = (date: Date | string): string => {
  return new Date(date).toLocaleDateString("fa-IR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours} ساعت و ${minutes} دقیقه`;
  }
  if (minutes > 0) {
    return `${minutes} دقیقه`;
  }
  return `کمتر از یک دقیقه`;
};

export const isTimeCritical = (timeLeft: number): boolean => {
  return timeLeft <= 60 && timeLeft > 0;
};

export const getGameStatus = (game: Game) => {
  const now = new Date();
  const start = new Date(game.startTime);
  const end = new Date(game.endTime);

  if (now < start) {
    const timeUntilStart = Math.floor((start.getTime() - now.getTime()) / 1000);
    return {
      status: GAME_STATUS.UPCOMING,
      ...GAME_STATUS_LABELS[GAME_STATUS.UPCOMING],
      timeText: `شروع: ${formatTime(start)}`,
      timeUntilStart,
      isActive: false,
      isEnded: false,
      color:
        "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700",
    };
  }

  if (now >= start && now <= end) {
    const timeLeft = Math.floor((end.getTime() - now.getTime()) / 1000);
    return {
      status: GAME_STATUS.ACTIVE,
      ...GAME_STATUS_LABELS[GAME_STATUS.ACTIVE],
      timeText: `باقی‌مانده: ${formatDuration(timeLeft)}`,
      timeLeft,
      isActive: true,
      isEnded: false,
      color:
        "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-900 border-green-300 dark:border-green-700",
    };
  }

  return {
    status: GAME_STATUS.ENDED,
    ...GAME_STATUS_LABELS[GAME_STATUS.ENDED],
    timeText: `پایان: ${formatTime(end)}`,
    isActive: false,
    isEnded: true,
    color:
      "bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600",
  };
};

export const formatDateTime = (date: Date) => {
  return new Date(date).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDateTimeInput = (date: Date) => {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};

export const downloadLeaderboardCSV = (
  leaderboardData: any[],
  gameName: string
) => {
  const csvContent = [
    ["رتبه", "نام", "امتیاز", "وضعیت", "زمان تکمیل"].join(","),
    ...leaderboardData.map((player, index) =>
      [
        index + 1,
        `"${player.userName}"`,
        player.score,
        player.isCompleted ? "تکمیل شده" : "در حال بازی",
        player.completedAt
          ? new Date(player.completedAt).toLocaleString("fa-IR")
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
    `leaderboard_${gameName}_${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
