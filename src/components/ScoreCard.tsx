import React from "react";

interface ScoreCardProps {
  score: number;
  clicks: number;
  targetClicks: number;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
  score,
  clicks,
  targetClicks,
}) => {
  return (
    <div className="bg-telegram-bg/50 rounded-lg p-6 space-y-2">
      <div className="text-3xl font-bold text-green-500">امتیاز: {score}</div>
      <div className="text-telegram-hint text-sm">
        تعداد کلیک: {clicks}/{targetClicks}
      </div>
    </div>
  );
};
