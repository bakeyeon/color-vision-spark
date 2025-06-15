
import React from "react";
import { getGradientColors } from "@/lib/gradient-utils";

interface GradientBarProps {
  numBlocks: number;
  subtle?: boolean;
  totalWidth?: number; // Total width in px, all blocks sum to this
  className?: string;
}

function randomWidths(numBlocks: number, total: number): number[] {
  // Generate random positive floats, normalize so their sum is 1, then multiply by total
  const raw = Array.from({ length: numBlocks }, () => Math.random() + 0.5);
  const sum = raw.reduce((a, b) => a + b, 0);
  const widths = raw.map(v => Math.round((v / sum) * total));
  // Fix rounding issues so total is exact:
  let diff = total - widths.reduce((a, b) => a + b, 0);
  // Adjust random blocks to fix total width
  while (diff !== 0) {
    if (diff > 0) {
      const i = Math.floor(Math.random() * widths.length);
      widths[i]++;
      diff--;
    } else {
      const nonzeroIdxs = widths.map((w, idx) => (w > 1 ? idx : -1)).filter(i => i >= 0);
      if (nonzeroIdxs.length === 0) break;
      const i = nonzeroIdxs[Math.floor(Math.random() * nonzeroIdxs.length)];
      widths[i]--;
      diff++;
    }
  }
  return widths;
}

const GradientBar: React.FC<GradientBarProps> = ({
  numBlocks,
  subtle,
  totalWidth = 600,
  className = "",
}) => {
  const colors = getGradientColors(numBlocks);
  const widths = React.useMemo(() => randomWidths(numBlocks, totalWidth), [numBlocks, totalWidth]);

  return (
    <div
      className={`flex flex-row rounded overflow-hidden border border-border shadow-md ${className}`}
      style={{
        width: `${totalWidth}px`,
        height: `36px`,
        transition: "box-shadow 0.2s",
        background: "#fff",
        maxWidth: "100vw",
      }}
      tabIndex={0}
    >
      {colors.map((color, idx) => (
        <div
          key={idx}
          style={{
            width: widths[idx],
            height: "100%",
            background: color,
            transition: "background 0.3s",
          }}
        />
      ))}
    </div>
  );
};

export default GradientBar;

