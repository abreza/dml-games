import React from "react";
import { Trophy, Clock } from "lucide-react";
import { LeaderboardItem } from "./LeaderboardItem";

interface Player {
  userId: number;
  userName: string;
  score: number;
  position?: number;
  isCompleted?: boolean;
  completedAt?: Date;
}

interface LeaderboardProps {
  players: Player[];
  currentUserId?: number;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  players,
  currentUserId,
}) => {
  const completedPlayers = players.filter((p) => p.isCompleted);
  const activePlayers = players.filter((p) => !p.isCompleted);

  return (
    <div className="mt-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-telegram-hint" />
        <h3 className="text-lg font-bold text-telegram-text">
          رتبه بندی این بازی
        </h3>
      </div>

      {players.length > 0 ? (
        <div className="space-y-4">
          {completedPlayers.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-green-600 border-b border-green-200 pb-1">
                تکمیل شده ({completedPlayers.length})
              </div>
              {completedPlayers.slice(0, 10).map((player, index) => (
                <LeaderboardItem
                  key={`completed-${player.userId}`}
                  player={player}
                  index={index}
                  isCurrentUser={player.userId === currentUserId}
                  showStatus={true}
                />
              ))}
            </div>
          )}

          {activePlayers.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-blue-600 border-b border-blue-200 pb-1">
                در حال بازی ({activePlayers.length})
              </div>
              {activePlayers.slice(0, 10).map((player, index) => (
                <LeaderboardItem
                  key={`active-${player.userId}`}
                  player={player}
                  index={completedPlayers.length + index}
                  isCurrentUser={player.userId === currentUserId}
                  showStatus={true}
                />
              ))}
            </div>
          )}

          {players.length > 20 && (
            <div className="text-center text-xs text-telegram-hint">
              و {players.length - 20} بازیکن دیگر...
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-telegram-hint py-8">
          هنوز هیچکس بازی نکرده! اولین نفر باش!
        </div>
      )}

      <div className="text-center text-xs text-telegram-hint mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center gap-1">
          <Clock className="w-3 h-3" />
          <span>رتبه‌بندی هر 10 ثانیه بروزرسانی می‌شود</span>
        </div>
      </div>
    </div>
  );
};
