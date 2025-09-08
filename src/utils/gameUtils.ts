import { Game } from "../types/game";
import { GAME_STATUS, GAME_STATUS_LABELS } from "../constants/adminConstants";

import { TelegramUser } from "../types/telegram";

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

export const formatTime = (date: Date): string => {
  return new Date(date).toLocaleDateString("fa-IR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const isTimeCritical = (timeLeft: number): boolean => {
  return timeLeft <= 60 && timeLeft > 0;
};

export const getGameStatus = (game: Game) => {
  const now = new Date();
  const start = new Date(game.startTime);
  const end = new Date(game.endTime);

  if (now < start) {
    return {
      status: GAME_STATUS.UPCOMING,
      ...GAME_STATUS_LABELS[GAME_STATUS.UPCOMING],
    };
  }

  if (now >= start && now <= end) {
    return {
      status: GAME_STATUS.ACTIVE,
      ...GAME_STATUS_LABELS[GAME_STATUS.ACTIVE],
    };
  }

  return {
    status: GAME_STATUS.ENDED,
    ...GAME_STATUS_LABELS[GAME_STATUS.ENDED],
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
