import React, { useState, useRef } from "react";
import GradientBar from "./GradientBar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface TrialResult {
  trial: number;
  numBlocks: number;
  estimate: number | null;
  duration: number;
  subtle: boolean;
  level: number; // 1=easiest, 2=subtle, 3=super subtle
  colorEnd: [number, number, number]; // RGB endpoint for the bar
}

const TRIALS_COUNT = 12;

const BASE_BLUE: [number, number, number] = [0, 56, 168];
const WHITE: [number, number, number] = [255, 255, 255];
const INTERMEDIATE_ENDPOINTS: [number, number, number][] = [
  [100, 150, 255], // Pale blue
  [94, 166, 246],  // Powder blue
  [143, 180, 240], // Sky-ish
  [170, 205, 244], // Pastel blue
];

// Generate a gradient endpoint that’s always “between blue and white”
function randomEndpoint(): [number, number, number] {
  const r = Math.random();
  if (r < 0.2) return BASE_BLUE;
  if (r < 0.5) return INTERMEDIATE_ENDPOINTS[Math.floor(Math.random() * INTERMEDIATE_ENDPOINTS.length)];
  return WHITE;
}

function randomInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

// Difficulty configuration
function generateTrialSet() {
  // [min, max, subtle, level]
  const blocksConfig: [number, number, boolean, number][] = [
    [8, 15, false, 1],
    [9, 17, false, 1],

    [16, 25, true, 2],
    [15, 22, true, 2],

    [20, 30, true, 3],
    [22, 28, true, 3],
  ];
  // Duplicate to make 12
  let configs = [...blocksConfig, ...blocksConfig];
  // Shuffle
  for (let i = configs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [configs[i], configs[j]] = [configs[j], configs[i]];
  }
  // Map to structure
  return configs.map(([minB, maxB, subtle, level], i) => ({
    trial: i + 1,
    numBlocks: randomInt(minB, maxB),
    subtle: subtle,
    level: level,
    colorEnd: randomEndpoint(),
  }));
}

interface ExperimentPanelProps {
  onComplete(results: TrialResult[], skips: number): void;
}

const ExperimentPanel: React.FC<ExperimentPanelProps> = ({ onComplete }) => {
  const [trialIdx, setTrialIdx] = useState(0);
  const [answers, setAnswers] = useState<TrialResult[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [timerOn, setTimerOn] = useState(false);
  const [trialStart, setTrialStart] = useState<number | null>(null);
  const [skipCount, setSkipCount] = useState(0);

  // Define all trials up front
  const trials = React.useMemo(() => generateTrialSet(), []);

  // Timer logic
  const timerRef = useRef<number | undefined>(undefined);
  const [elapsed, setElapsed] = useState(0);
  React.useEffect(() => {
    if (timerOn) {
      setElapsed(0);
      setTrialStart(performance.now());
      timerRef.current = window.setInterval(() => {
        setElapsed((e) => e + 0.1);
      }, 100);
      return () => clearInterval(timerRef.current);
    } else {
      clearInterval(timerRef.current);
    }
  }, [timerOn, trialIdx]);

  React.useEffect(() => {
    // Start timing on each trial
    setTimerOn(true);
    setInputVal("");
  }, [trialIdx]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const estimate = parseInt(inputVal, 10);
    if (!Number.isFinite(estimate) || estimate <= 0) {
      toast({
        variant: "destructive",
        title: "Input a valid number!",
      });
      return;
    }

    const tCfg = trials[trialIdx];
    const trialEnd = performance.now();
    setTimerOn(false);

    const result: TrialResult = {
      trial: tCfg.trial,
      numBlocks: tCfg.numBlocks,
      subtle: tCfg.subtle,
      estimate,
      duration: (trialEnd - (trialStart ?? trialEnd)) / 1000,
      level: tCfg.level,
      colorEnd: tCfg.colorEnd, // Should always be [number, number, number]
    };

    const updatedAnswers = [...answers, result];
    setAnswers(updatedAnswers);

    setTimeout(() => {
      if (trialIdx + 1 < trials.length) {
        setTrialIdx(trialIdx + 1);
      } else {
        localStorage.setItem("experimentResults", JSON.stringify(updatedAnswers));
        onComplete(updatedAnswers, skipCount);
      }
    }, 400);

    setInputVal(""); // Clear input while moving to next
  };

  const handleSkip = () => {
    const tCfg = trials[trialIdx];
    setTimerOn(false);

    // Record a skipped trial with null estimate
    const result: TrialResult = {
      trial: tCfg.trial,
      numBlocks: tCfg.numBlocks,
      subtle: tCfg.subtle,
      estimate: null,
      duration: 0,
      level: tCfg.level,
      colorEnd: tCfg.colorEnd,
    };

    const updatedAnswers = [...answers, result];
    const newSkipCount = skipCount + 1;
    setAnswers(updatedAnswers);
    setSkipCount(newSkipCount);

    setTimeout(() => {
      if (trialIdx + 1 < trials.length) {
        setTrialIdx(trialIdx + 1);
      } else {
        localStorage.setItem("experimentResults", JSON.stringify(updatedAnswers));
        onComplete(updatedAnswers, newSkipCount);
      }
    }, 400);

    setInputVal(""); // Clear input while moving to next
  };

  const current = trials[trialIdx];

  return (
    <Card className="max-w-3xl w-full mx-auto mt-8 shadow-xl border-2">
      <CardHeader>
        <CardTitle>
          <span className="text-lg text-primary font-bold">
            Trial {trialIdx + 1} of {TRIALS_COUNT}
          </span>
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Count or estimate the <b>number of distinct color segments</b> visible in the bar below.<br />
          {current.level === 1 ? (
            <span>More visible edges. Easiest to count.</span>
          ) : current.level === 2 ? (
            <span>Subtle boundaries between colors. More difficult.</span>
          ) : (
            <span>Very subtle, almost seamless color transitions. Most challenging!</span>
          )}
          <div className="text-xs mt-1">
            <span className="font-semibold">Note:</span>{" "}
            Gradient may end at blue, white, or a pale/pastel blue.
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center py-6">
        <GradientBar
          numBlocks={current.numBlocks}
          subtle={current.subtle}
          colorEnd={current.colorEnd}
          className={current.subtle ? "border-none shadow-none" : ""}
          totalWidth={600}
        />
        {!current.subtle ? (
          <div className="absolute mt-[-2.9rem] w-full flex pointer-events-none select-none">
            {Array.from({ length: current.numBlocks - 1 }).map((_, idx) => (
              <div
                key={idx}
                className="border-r border-white/30"
                style={{
                  height: 36,
                  width: "1px",
                }}
              />
            ))}
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-col gap-2 items-center">
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <Input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min={1}
            max={50}
            value={inputVal}
            onChange={e => setInputVal(e.target.value.replace(/[^\d]/g, ""))}
            className="w-28 text-lg"
            required
            autoFocus
            placeholder="Segments?"
            disabled={!timerOn}
          />
          <Button type="submit" disabled={!timerOn || inputVal === ""}>
            Submit
          </Button>
          <Button type="button" variant="secondary" onClick={handleSkip} disabled={!timerOn}>
            Skip
          </Button>
        </form>
        <div className="text-xs text-gray-500 mt-1">
          Skipped: {skipCount} / {TRIALS_COUNT}
        </div>
      </CardFooter>
    </Card>
  );
};

export type { TrialResult };
export default ExperimentPanel;
