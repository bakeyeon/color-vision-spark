
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

type SummaryChartProps = {
  title: string;
  data: { bin: string; count: number }[];
  userBin: string;
  userPercentile: number;
  annotation: string;
  color?: string;
};

const SummaryChart: React.FC<SummaryChartProps> = ({
  title,
  data,
  userBin,
  userPercentile,
  annotation,
  color = "#2596be"
}) => {
  // Find the matching bin
  const userBarIdx = data.findIndex((d) => d.bin === userBin);

  return (
    <div className="mb-6 w-full max-w-lg mx-auto">
      <div className="font-semibold mb-1 ml-2">{title}</div>
      <div className="bg-muted rounded p-2">
        <ResponsiveContainer width="100%" height={170}>
          <BarChart data={data}>
            <XAxis dataKey="bin" tick={{fontSize: 12}} />
            <YAxis allowDecimals={false} width={30}/>
            <Tooltip />
            <Bar
              dataKey="count"
              fill={color}
              isAnimationActive={false}
            >
              {data.map((entry, idx) =>
                <rect
                  key={entry.bin}
                  x={null}
                  y={null}
                  width={null}
                  height={null}
                  fill={idx === userBarIdx ? "#46c5ab" : color}
                  opacity={idx === userBarIdx ? 1 : 0.85}
                />
              )}
            </Bar>
            {/* Mark the user's bin */}
            {userBarIdx >= 0 && (
              <ReferenceLine
                x={userBin}
                stroke="#e86969"
                label={{
                  value: "You",
                  position: "top",
                  fill: "#e86969",
                  fontWeight: "bold",
                  fontSize: 13
                }}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
        <div className="text-xs text-center mt-1">
          <span className="font-semibold">Percentile:</span>{" "}
          <span className="font-bold text-primary">{Math.round(userPercentile)}%</span><br />
          <span className="text-muted-foreground">{annotation}</span>
        </div>
      </div>
    </div>
  );
};
export default SummaryChart;
