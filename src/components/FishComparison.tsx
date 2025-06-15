
import React from "react";

type Fish = {
  id: number;
  name: string;
  emoji?: string;
  description: string;
  imageAlt?: string;
  // Will use emoji as placeholder if no image is given.
};

interface FishComparisonProps {
  left: Fish;
  right: Fish;
}

const FishComparison: React.FC<FishComparisonProps> = ({ left, right }) => (
  <div className="mb-8 flex flex-col items-center w-full">
    <div className="text-lg font-semibold mb-4 text-center">
      Which fish are closest to me?
    </div>
    <div className="w-full flex flex-col md:flex-row gap-4 justify-center items-stretch">
      {/* Left Fish */}
      <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col items-center shadow-sm">
        <div className="w-24 h-24 mb-2 rounded-full bg-gray-200 flex items-center justify-center text-5xl">
          {left.emoji ? (
            <span className="text-4xl" role="img" aria-label={left.name}>{left.emoji}</span>
          ) : (
            <span className="text-4xl">🐟</span>
          )}
        </div>
        <div className="font-bold text-blue-800 text-base mb-1">{left.name}</div>
        <div className="text-sm text-gray-700 text-center">{left.description}</div>
      </div>
      {/* Right Fish */}
      <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col items-center shadow-sm">
        <div className="w-24 h-24 mb-2 rounded-full bg-gray-200 flex items-center justify-center text-5xl">
          {right.emoji ? (
            <span className="text-4xl" role="img" aria-label={right.name}>{right.emoji}</span>
          ) : (
            <span className="text-4xl">🐟</span>
          )}
        </div>
        <div className="font-bold text-blue-800 text-base mb-1">{right.name}</div>
        <div className="text-sm text-gray-700 text-center">{right.description}</div>
      </div>
    </div>
  </div>
);

export default FishComparison;
