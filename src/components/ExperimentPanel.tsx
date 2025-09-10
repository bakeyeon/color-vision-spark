import React, { useState, useRef } from "react";
import GradientBar from "./GradientBar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { type KoreanBlueCategory, getRandomKoreanBlueCategory } from "@/lib/gradient-utils";
import ColorEmotionTest, { type ColorEmotionData } from "./ColorEmotionTest";

export interface TrialResult {
  trial: number;
  numBlocks: number;
  estimate: number | null;
  duration: number;
  subtle: boolean;
  level: number; // 1=easiest, 2=subtle, 3=super subtle
  colorEnd?: [number, number, number]; // RGB endpoint for the bar (optional for Korean categories)
  category: KoreanBlueCategory;
}

const TRIALS_COUNT = 6;

const BASE_BLUE: [number, number, number] = [0, 56, 168];
const WHITE: [number, number, number] = [255, 255, 255];
const INTERMEDIATE_ENDPOINTS: [number, number, number][] = [
  [100, 150, 255], // Pale blue
  [94, 166, 246],  // Powder blue
  [143, 180, 240], // Sky-ish
  [170, 205, 244], // Pastel blue
];

// Generate Korean blue category trials 
function getKoreanBlueTrialConfig(): { category: KoreanBlueCategory; colorEnd?: [number, number, number] } {
  const category = getRandomKoreanBlueCategory();
  
  // For Korean blue categories, we don't need colorEnd as it's defined by the category
  // For traditional mode, occasionally use original endpoints
  if (Math.random() < 0.2) {
    const r = Math.random();
    if (r < 0.3) return { category: 'traditional', colorEnd: BASE_BLUE };
    if (r < 0.6) return { category: 'traditional', colorEnd: INTERMEDIATE_ENDPOINTS[Math.floor(Math.random() * INTERMEDIATE_ENDPOINTS.length)] };
    return { category: 'traditional', colorEnd: WHITE };
  }
  
  return { category };
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
  // Shuffle
  for (let i = blocksConfig.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [blocksConfig[i], blocksConfig[j]] = [blocksConfig[j], blocksConfig[i]];
  }
  // Map to structure with Korean blue categories
  return blocksConfig.map(([minB, maxB, subtle, level], i) => {
    const { category, colorEnd } = getKoreanBlueTrialConfig();
    return {
      trial: i + 1,
      numBlocks: randomInt(minB, maxB),
      subtle: subtle,
      level: level,
      colorEnd: colorEnd,
      category: category,
    };
  });
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
      colorEnd: tCfg.colorEnd,
      category: tCfg.category,
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
      category: tCfg.category,
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

  // Get category description for user
  const getCategoryDescription = (category: KoreanBlueCategory) => {
    switch (category) {
      case 'blue-cyan':
        return "Blue transitioning toward cyan/teal (blue + green boundary)";
      case 'blue-violet':
        return "Blue transitioning toward violet/purple (blue + red boundary)";
      case 'blue-sky':
        return "Blue transitioning toward sky blue (blue + white)";
      case 'blue-navy':
        return "Blue transitioning toward navy (blue + black)";
      default:
        return "Traditional blue to white/pale blue gradient";
    }
  };

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
            <span className="font-semibold">Color Category:</span>{" "}
            {getCategoryDescription(current.category)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center py-6">
        <GradientBar
          numBlocks={current.numBlocks}
          subtle={current.subtle}
          colorEnd={current.colorEnd}
          category={current.category}
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



// --------------------------------------------- Final Edit ------------------------------------------


interface ExperimentPageProps {
  onComplete?: (results: TrialResult[], skips: number) => void;
}

const ExperimentPage: React.FC<ExperimentPageProps> = ({ onComplete }) => {
  // Just return the perception test directly - emotion test is handled in Index.tsx
  return <ExperimentPanel onComplete={onComplete} />;
};


export default ExperimentPage;
