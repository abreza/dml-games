import React from "react";
import { Play, Clock, Target } from "lucide-react";

interface WaitingScreenProps {
  isInlineGame: boolean;
  onStart: () => void;
  gameDuration: number;
  targetClicks: number;
}

export const WaitingScreen: React.FC<WaitingScreenProps> = ({
  isInlineGame,
  onStart,
  gameDuration,
  targetClicks,
}) => {
  return (
    <div className="text-center space-y-6">
      <div className="space-y-4">
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Target className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-telegram-text">
          🎯 چالش کلیک سریع
        </h1>
        <p className="text-telegram-hint text-sm leading-relaxed">
          {gameDuration} ثانیه فرصت داری تا {targetClicks} بار کلیک کنی!
          <br />
          اگر زودتر تموم کنی، زمان باقیمونده امتیاز توه!
        </p>
        {isInlineGame && (
          <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-3">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              🎮 بازی گروهی - با بقیه رقابت کن!
            </p>
          </div>
        )}
      </div>

      <div className="bg-telegram-bg/50 rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-center gap-2 text-telegram-hint">
          <Clock className="w-4 h-4" />
          <span>مدت زمان: {gameDuration} ثانیه</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-telegram-hint">
          <Target className="w-4 h-4" />
          <span>هدف: {targetClicks} کلیک</span>
        </div>
      </div>

      <button
        onClick={onStart}
        className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center gap-3"
      >
        <Play className="w-6 h-6" />
        شروع بازی
      </button>
    </div>
  );
};
