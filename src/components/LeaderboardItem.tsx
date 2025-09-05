import React from "react";
import { CheckCircle, Play } from "lucide-react";

interface Player {
  userId: number;
  userName: string;
  score: number;
  position?: number;
  isCompleted?: boolean;
  completedAt?: Date;
}

interface LeaderboardItemProps {
  player: Player;
  index: number;
  isCurrentUser: boolean;
  showStatus?: boolean;
}

export const LeaderboardItem: React.FC<LeaderboardItemProps> = ({
  player,
  index,
  isCurrentUser,
  showStatus = false,
}) => {
  const getRankStyle = (index: number) => {
    switch (index) {
      case 0:
        return "bg-yellow-500 text-white";
      case 1:
        return "bg-gray-400 text-white";
      case 2:
        return "bg-orange-600 text-white";
      default:
        return "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200";
    }
  };

  const getStatusIcon = () => {
    if (!showStatus) return null;

    if (player.isCompleted) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else {
      return <Play className="w-4 h-4 text-blue-500" />;
    }
  };

  const getScoreColor = () => {
    if (player.isCompleted) {
      return "text-green-600 dark:text-green-400";
    } else {
      return "text-blue-600 dark:text-blue-400";
    }
  };

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg transition-all ${
        isCurrentUser
          ? "bg-blue-500/20 border border-blue-500/30"
          : "bg-telegram-bg/30 dark:bg-gray-700/50"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankStyle(
            index
          )}`}
        >
          {index + 1}
        </span>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium text-telegram-text">
              {player.userName}
              {isCurrentUser && " (شما)"}
            </span>
            {getStatusIcon()}
          </div>
          {showStatus && player.isCompleted && player.completedAt && (
            <span className="text-xs text-telegram-hint">
              تکمیل شده:{" "}
              {new Date(player.completedAt).toLocaleTimeString("fa-IR")}
            </span>
          )}
        </div>
      </div>
      <span className={`font-bold ${getScoreColor()}`}>{player.score}</span>
    </div>
  );
};
