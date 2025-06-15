
import React from "react";
import { getGradientColors } from "@/lib/gradient-utils";

interface GradientBarProps {
  numBlocks: number;
  orientation?: "horizontal" | "vertical";
  blockSize?: number; // px
  className?: string;
}

const GradientBar: React.FC<GradientBarProps> = ({
  numBlocks,
  orientation = "horizontal",
  blockSize = 36,
  className = "",
}) => {
  const colors = getGradientColors(numBlocks);

  return (
    <div
      className={
        orientation === "horizontal"
          ? `flex flex-row rounded overflow-hidden border border-border shadow-md ${className}`
          : `flex flex-col rounded overflow-hidden border border-border shadow-md ${className}`
      }
      style={{
        width:
          orientation === "horizontal"
            ? `${blockSize * numBlocks}px`
            : `${blockSize}px`,
        height:
          orientation === "horizontal"
            ? `${blockSize}px`
            : `${blockSize * numBlocks}px`,
        transition: "box-shadow 0.2s",
        background: "#fff",
      }}
      tabIndex={0}
    >
      {colors.map((color, idx) =>
        orientation === "horizontal" ? (
          <div
            key={idx}
            style={{
              width: blockSize,
              height: "100%",
              background: color,
              transition: "background 0.3s",
            }}
          />
        ) : (
          <div
            key={idx}
            style={{
              height: blockSize,
              width: "100%",
              background: color,
              transition: "background 0.3s",
            }}
          />
        )
      )}
    </div>
  );
};

export default GradientBar;
