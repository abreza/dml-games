import React from "react";
import { Clock, Target } from "lucide-react";

interface GameStatsProps {
  timeLeft: number;
  clicks: number;
  targetClicks: number;
}

export const GameStats: React.FC<GameStatsProps> = ({
  timeLeft,
  clicks,
  targetClicks,
}) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2 text-telegram-hint">
        <Clock className="w-5 h-5" />
        <span className="font-mono text-lg">{timeLeft}s</span>
      </div>
      <div className="flex items-center gap-2 text-telegram-hint">
        <Target className="w-5 h-5" />
        <span className="font-mono text-lg">
          {clicks}/{targetClicks}
        </span>
      </div>
    </div>
  );
};
