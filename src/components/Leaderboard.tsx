import React from "react";
import { Users } from "lucide-react";
import { LeaderboardItem } from "./LeaderboardItem";

interface Player {
  userId: number;
  userName: string;
  score: number;
  position?: number;
}

interface LeaderboardProps {
  players: Player[];
  currentUserId?: number;
  isInlineGame: boolean;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  players,
  currentUserId,
  isInlineGame,
}) => {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Users className="w-5 h-5 text-telegram-hint" />
        <h3 className="text-lg font-bold text-telegram-text">
          {isInlineGame ? "رتبه بندی بازی" : "رتبه بندی گروه"}
        </h3>
      </div>

      {players.length > 0 ? (
        <div className="space-y-2">
          {players.slice(0, 10).map((player, index) => (
            <LeaderboardItem
              key={player.userId}
              player={player}
              index={index}
              isCurrentUser={player.userId === currentUserId}
            />
          ))}

          {players.length === 0 && (
            <div className="text-center text-telegram-hint py-4 text-sm">
              🏆 امتیازات از سرور تلگرام بارگذاری می‌شود...
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-telegram-hint py-8">
          هنوز هیچکس بازی نکرده! اولین نفر باش! 🚀
        </div>
      )}
    </div>
  );
};
