import React from "react";

interface Player {
  userId: number;
  userName: string;
  score: number;
  position?: number;
}

interface LeaderboardItemProps {
  player: Player;
  index: number;
  isCurrentUser: boolean;
}

export const LeaderboardItem: React.FC<LeaderboardItemProps> = ({
  player,
  index,
  isCurrentUser,
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
        return "bg-gray-200 text-gray-700";
    }
  };

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg ${
        isCurrentUser
          ? "bg-blue-500/20 border border-blue-500/30"
          : "bg-telegram-bg/30"
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
        <span className="font-medium text-telegram-text">
          {player.userName}
          {isCurrentUser && " (شما)"}
        </span>
      </div>
      <span className="font-bold text-green-500">{player.score}</span>
    </div>
  );
};
