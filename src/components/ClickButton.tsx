import React from "react";

interface ClickButtonProps {
  onClick: () => void;
  clicks: number;
  targetClicks: number;
}

export const ClickButton: React.FC<ClickButtonProps> = ({
  onClick,
  clicks,
  targetClicks,
}) => {
  return (
    <button
      onClick={onClick}
      className="w-64 h-64 mx-auto bg-gradient-to-br from-red-500 to-pink-500 rounded-full shadow-xl active:scale-95 transition-all duration-100 flex items-center justify-center text-white font-bold text-2xl"
      style={{
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
      }}
    >
      <div className="text-center">
        <div className="text-4xl mb-2">👆</div>
        <div>کلیک کن!</div>
      </div>
    </button>
  );
};
