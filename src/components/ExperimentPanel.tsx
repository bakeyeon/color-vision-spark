
import React, { useState, useRef } from "react";
import GradientBar from "./GradientBar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface TrialResult {
  trial: number;
  numBlocks: number;
  orientation: "horizontal" | "vertical";
  subtle: boolean;
  start: number;
  end: number;
  estimate: number | null;
  duration: number;
}

const TRIALS_COUNT = 6;
const MIN_BLOCKS = 8;
const MAX_BLOCKS = 30;

function randomInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}
function randomOrientation(): "horizontal" | "vertical" {
  return Math.random() > 0.5 ? "horizontal" : "vertical";
}

function randomSubtlety(): boolean {
  // 60% major transitions, 40% subtle
  return Math.random() > 0.6;
}

interface ExperimentPanelProps {
  onComplete(results: TrialResult[]): void;
}

const ExperimentPanel: React.FC<ExperimentPanelProps> = ({ onComplete }) => {
  const [trialIdx, setTrialIdx] = useState(0);
  const [answers, setAnswers] = useState<TrialResult[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [timerOn, setTimerOn] = useState(false);
  const [trialStart, setTrialStart] = useState<number | null>(null);

  // Define all trial config up front to ensure "fair" randomization
  const trials = React.useMemo(() => {
    return Array.from({ length: TRIALS_COUNT }).map((_, i) => {
      const subtle = randomSubtlety();
      const numBlocks = subtle
        ? randomInt(16, MAX_BLOCKS)
        : randomInt(MIN_BLOCKS, 16);
      return {
        trial: i + 1,
        numBlocks,
        orientation: randomOrientation(),
        subtle,
      };
    });
  }, []);

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
      ...tCfg,
      start: trialStart ?? 0,
      end: trialEnd,
      estimate,
      duration: (trialEnd - (trialStart ?? trialEnd)) / 1000,
    };
    setAnswers((prev) => [...prev, result]);

    setTimeout(() => {
      if (trialIdx + 1 < trials.length) {
        setTrialIdx(trialIdx + 1);
      } else {
        onComplete([...answers, result]);
      }
    }, 400);

    setInputVal(""); // Clear input while moving to next
  };

  const current = trials[trialIdx];

  // Subtlety: disables grid lines for "subtle" mode, else enables soft borders
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
          {current.subtle ? (
            <span>Smoother gradient; edges are challenging to see.</span>
          ) : (
            <span>Strong color differences between blocks; easier to count.</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center py-6">
        <GradientBar
          numBlocks={current.numBlocks}
          orientation={current.orientation}
          blockSize={34}
          className={current.subtle ? "border-none shadow-none" : ""}
        />
        {!current.subtle ? (
          <div className="absolute mt-[-2.9rem] w-full flex pointer-events-none select-none">
            {Array.from({ length: current.numBlocks - 1 }).map((_, idx) => (
              <div
                key={idx}
                className="border-r border-white/30"
                style={{
                  height: current.orientation === "horizontal" ? 36 : "100%",
                  width: current.orientation === "horizontal" ? "1px" : "100%",
                  ...(current.orientation === "vertical"
                    ? { width: 34, height: "1px", borderBottom: "1px solid rgba(255,255,255,0.30)", borderRight: "none" }
                    : {}),
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
        </form>
        <div className="text-xs text-muted-foreground">
          <span>Time: {elapsed.toFixed(1)} sec</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export type { TrialResult };
export default ExperimentPanel;
