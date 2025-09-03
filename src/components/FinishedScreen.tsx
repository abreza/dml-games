import React from "react";
import { Trophy } from "lucide-react";
import { ScoreCard } from "./ScoreCard";

interface FinishedScreenProps {
  clicks: number;
  targetClicks: number;
  score: number;
  onReset: () => void;
}

export const FinishedScreen: React.FC<FinishedScreenProps> = ({
  clicks,
  targetClicks,
  score,
  onReset,
}) => {
  return (
    <div className="text-center space-y-6">
      <div className="space-y-4">
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
          <Trophy className="w-12 h-12 text-white" />
        </div>

        <h2 className="text-2xl font-bold text-telegram-text">
          {clicks >= targetClicks ? "🎉 تبریک!" : "⏰ تمام شد!"}
        </h2>

        <ScoreCard score={score} clicks={clicks} targetClicks={targetClicks} />
      </div>

      <button
        onClick={onReset}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-xl font-bold shadow-lg active:scale-95 transition-all duration-200"
      >
        بازی مجدد
      </button>
    </div>
  );
};
