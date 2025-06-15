
import React from "react";
import { groupImages } from "./ResultSummary";

type Fish = {
  id: number;
  name: string;
  emoji?: string;
  description: string;
  imageAlt?: string;
  // Will use emoji as placeholder if no image is given.
  src?: string; // Optionally include image src
};

interface FishComparisonProps {
  left: Fish | undefined;
  right: Fish | undefined;
  mainFishId?: number; // Main/result fish group ID
}

// Defensive: display nothing or fallback content if fish is missing
const FishComparison: React.FC<FishComparisonProps> = ({ left, right, mainFishId }) => {
  // Get image for mainFishId, if provided
  const mainFishImg = mainFishId && groupImages[mainFishId as keyof typeof groupImages];

  if (!left || !right) {
    return (
      <div className="text-red-500 text-center font-bold p-4">
        "Whoops! Something went wrong finding your fish comparison."
      </div>
    );
  }

  return (
    <div className="mb-8 flex flex-col items-center w-full">
      <div className="text-lg font-semibold mb-4 text-center">
        Which fish are closest to me?
      </div>
      {/* Show main fish image above comparison row if available */}
      {mainFishImg?.src && (
        <div className="flex justify-center mb-4">
          <img
            src={mainFishImg.src}
            alt={mainFishImg.alt}
            className="w-20 h-20 object-contain rounded-xl border-[6px] border-white"
            style={{
              background: "linear-gradient(180deg, #a5e4ff 0%, #fafeff 100%)",
              boxShadow: "0 0 0 8px #2772ed", // 8px thick blue border (proportionally)
              borderColor: "#fff",
            }}
          />
        </div>
      )}
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
};

export default FishComparison;
