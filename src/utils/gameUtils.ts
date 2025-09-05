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
