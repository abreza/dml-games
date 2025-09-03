import React from "react";

interface ProgressBarProps {
  progress: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = "",
}) => {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-3 ${className}`}>
      <div
        className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  );
};
