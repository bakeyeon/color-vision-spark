import React from "react";

type SummaryChartProps = {
  title: string;
  data: { bin: string; count: number }[];
  userBin: string;
  userPercentile: number;
  annotation: string;
  color?: string;
  chartStyle?: "vertical-slider"; // Optionally allow other styles in the future
};

const SummaryChart: React.FC<SummaryChartProps> = ({
  title,
  data,
  userBin,
  userPercentile,
  annotation,
  color = "#2596be",
  chartStyle = "vertical-slider"
}) => {
  // Find the matching bin
  const userBarIdx = data.findIndex((d) => d.bin === userBin);

  if (chartStyle === "vertical-slider") {
    // SVG-based custom vertical bar chart
    const maxCount = Math.max(...data.map((d) => d.count));
    const chartW = 380;
    const chartH = 210;
    const barGap = 22;
    const barW = 24;
    const sliderTopRadius = 14;
    const barBottomRadius = 12;
    const barBaseY = chartH - 28;
    const labelY = chartH - 8;

    // Gradients: user bar is blue-pink, others are blue-light blue
    const getBarGradient = (idx: number) => {
      if (idx === userBarIdx) return "url(#userGradient)";
      return "url(#otherGradient)";
    };

    return (
      <div className="mb-6 w-full max-w-xl mx-auto">
        <div className="font-semibold mb-1 ml-2">{title}</div>
        <div className="bg-muted rounded-xl p-4 flex flex-col items-center border border-blue-100 shadow">
          <svg width={chartW} height={chartH} viewBox={`0 0 ${chartW} ${chartH}`} className="select-none">
            <defs>
              {/* User bar gradient */}
              <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="10%" stopColor="#38b6ff" />
                <stop offset="90%" stopColor="#edc2fa" />
              </linearGradient>
              {/* Other bars gradient */}
              <linearGradient id="otherGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#cfeeff" />
                <stop offset="100%" stopColor="#78c3ff" />
              </linearGradient>
            </defs>
            {/* Bars */}
            {data.map((entry, idx) => {
              const x = 30 + idx * (barW + barGap);
              const barHeight = Math.max(18, (entry.count / maxCount) * (chartH - 65)); // min height 18
              const barY = barBaseY - barHeight;
              // Highlight user bar
              const isUser = idx === userBarIdx;
              return (
                <g key={entry.bin}>
                  {/* Bar */}
                  <rect
                    x={x}
                    y={barY}
                    width={barW}
                    height={barHeight}
                    rx={barBottomRadius}
                    fill={getBarGradient(idx)}
                    stroke={isUser ? "#2393fc" : "#b1c7e1"}
                    strokeWidth={isUser ? 5 : 2}
                    />
                  {/* Knob/circle */}
                  <circle
                    cx={x + barW / 2}
                    cy={barY}
                    r={sliderTopRadius}
                    fill={isUser ? "#2393fc" : "#eef6fc"}
                    stroke="#9ecaed"
                    strokeWidth={isUser ? 4 : 3}
                    style={{ filter: "drop-shadow(0 1px 3px #3ad6fc20)" }}
                  />
                  {/* Bar/bin label */}
                  <text
                    x={x + barW / 2}
                    y={labelY}
                    textAnchor="middle"
                    fontSize="11"
                    fill={isUser ? "#195091" : "#6776a7"}
                    fontWeight={isUser ? "bold" : "normal"}
                  >
                    {entry.bin}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="mt-2 text-sm text-center">
            <span className="font-semibold">Percentile:</span>{" "}
            <span className="font-bold text-primary">{Math.round(userPercentile)}%</span><br />
            <span className="text-muted-foreground">{annotation}</span>
          </div>
        </div>
      </div>
    );
  }

  // fallback (should never occur in current usage)
  return (
    <div className="mb-6 w-full max-w-lg mx-auto">
      <div className="font-semibold mb-1 ml-2">{title}</div>
      <div className="bg-muted rounded p-2 text-center">No chart style selected.</div>
    </div>
  );
};
export default SummaryChart;
