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

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const isTimeCritical = (timeLeft: number): boolean => {
  return timeLeft <= 60 && timeLeft > 0;
};

export const getTimeWarningClass = (timeLeft: number): string => {
  if (timeLeft <= 30) {
    return "text-red-600 font-bold animate-pulse";
  } else if (timeLeft <= 60) {
    return "text-orange-600 font-bold";
  }
  return "text-telegram-hint";
};

export const validateUserId = (userId?: number): boolean => {
  return typeof userId === "number" && userId > 0;
};

export const showAlert = (message: string): void => {
  if (typeof window !== "undefined") {
    alert(message);
  }
};

export const formatScore = (score: number): string => {
  return score.toLocaleString("fa-IR");
};

export const getUserDisplayName = (user: TelegramUser): string => {
  if (user.username) {
    return `@${user.username}`;
  }

  return formatUserName(user);
};

export const logUserInfo = (user: TelegramUser | null): void => {
  if (user) {
    console.log(
      `User info: ID=${user.id}, Name="${formatUserName(user)}", Username=${
        user.username || "none"
      }`
    );
  } else {
    console.log("No user information available");
  }
};
