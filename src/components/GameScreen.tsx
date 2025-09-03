import React from "react";
import { GameStats } from "./GameStats";
import { ProgressBar } from "./ProgressBar";
import { ClickButton } from "./ClickButton";

interface GameScreenProps {
  timeLeft: number;
  clicks: number;
  targetClicks: number;
  onClick: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  timeLeft,
  clicks,
  targetClicks,
  onClick,
}) => {
  const progress = (clicks / targetClicks) * 100;

  return (
    <div className="text-center space-y-6">
      <div className="space-y-4">
        <GameStats
          timeLeft={timeLeft}
          clicks={clicks}
          targetClicks={targetClicks}
        />
        <ProgressBar progress={progress} />
      </div>

      <ClickButton
        onClick={onClick}
        clicks={clicks}
        targetClicks={targetClicks}
      />

      <div className="text-telegram-hint text-sm">
        {clicks >= targetClicks
          ? "🎉 آفرین! منتظر نتیجه باش..."
          : `${targetClicks - clicks} کلیک مونده!`}
      </div>
    </div>
  );
};
