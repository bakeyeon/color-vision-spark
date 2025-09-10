import React, { useState, useRef, useEffect, useMemo } from "react";
import GradientBar from "./GradientBar";
import ColorEmotionTest, { type ColorEmotionData } from "./ColorEmotionTest";
import Questionnaire, { type QuestionnaireData } from "./Questionnaire";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  type KoreanBlueCategory,
  getRandomKoreanBlueCategory,
} from "@/lib/gradient-utils";

// ============================================================================
// Interfaces & Constants
// ============================================================================

/**
 * Defines the structure for the result of a single perception trial.
 */
export interface TrialResult {
  trial: number;
  numBlocks: number; // The actual number of color blocks
  estimate: number | null; // User's estimate (null if skipped)
  duration: number; // Time taken for the trial in seconds
  subtle: boolean; // Whether the gradient has subtle or hard edges
  level: number; // Difficulty level (1=easy, 2=medium, 3=hard)
  colorEnd?: [number, number, number]; // Optional RGB endpoint for 'traditional' gradients
  category: KoreanBlueCategory; // The color category being tested
}

// Total number of trials in the perception experiment.
const TRIALS_COUNT = 6;

// Google Apps Script URL for submitting the final data.
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwUaKGz7DmgLyYirCa3A1xKWO6A3pHLopmn0hbQGlWecgjON3spyS6FY8EU29fMQBG_/exec";

// ============================================================================
// Helper Functions for Trial Generation
// ============================================================================

/**
 * Generates a random integer within a specified range (inclusive).
 * @param min - The minimum value.
 * @param max - The maximum value.
 * @returns A random integer.
 */
function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/**
 * Creates a configuration for a single trial, determining its color category.
 */
function getKoreanBlueTrialConfig(): {
  category: KoreanBlueCategory;
  colorEnd?: [number, number, number];
} {
  const category = getRandomKoreanBlueCategory();

  // For most trials, the category itself defines the gradient.
  if (Math.random() < 0.2) {
    const BASE_BLUE: [number, number, number] = [0, 56, 168];
    const WHITE: [number, number, number] = [255, 255, 255];
    const INTERMEDIATE_ENDPOINTS: [number, number, number][] = [
      [100, 150, 255], // Pale blue
      [94, 166, 246], // Powder blue
      [143, 180, 240], // Sky-ish
      [170, 205, 244], // Pastel blue
    ];
    const r = Math.random();
    if (r < 0.3) return { category: "blue-white", colorEnd: BASE_BLUE };
    if (r < 0.6)
      return {
        category: "blue-white",
        colorEnd:
          INTERMEDIATE_ENDPOINTS[
            Math.floor(Math.random() * INTERMEDIATE_ENDPOINTS.length)
          ],
      };
    return { category: "blue-white", colorEnd: WHITE };
  }

  return { category };
}

/**
 * Generates a complete, shuffled set of trials for the perception experiment.
 */
function generateTrialSet(): Omit<TrialResult, "estimate" | "duration">[] {
  // Defines difficulty tiers: [minBlocks, maxBlocks, isSubtle, difficultyLevel]
  const blocksConfig: [number, number, boolean, number][] = [
    [8, 15, false, 1], // Easy
    [9, 17, false, 1], // Easy
    [16, 25, true, 2], // Medium
    [15, 22, true, 2], // Medium
    [20, 30, true, 3], // Hard
    [22, 28, true, 3], // Hard
  ];

  // Shuffle the difficulty configurations to randomize the trial order
  for (let i = blocksConfig.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [blocksConfig[i], blocksConfig[j]] = [blocksConfig[j], blocksConfig[i]];
  }

  // Map the shuffled configs to the final trial structure
  return blocksConfig.map(([minB, maxB, subtle, level], i) => {
    const { category, colorEnd } = getKoreanBlueTrialConfig();
    return {
      trial: i + 1,
      numBlocks: randomInt(minB, maxB),
      subtle,
      level,
      colorEnd,
      category,
    };
  });
}

// ============================================================================
// ExperimentPanel Component (Color Perception Test)
// ============================================================================

interface ExperimentPanelProps {
  onComplete(results: TrialResult[], skips: number): void;
}

const ExperimentPanel: React.FC<ExperimentPanelProps> = ({ onComplete }) => {
  // State management
  const [trialIdx, setTrialIdx] = useState(0);
  const [answers, setAnswers] = useState<TrialResult[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [timerOn, setTimerOn] = useState(false);
  const [trialStart, setTrialStart] = useState<number | null>(null);
  const [skipCount, setSkipCount] = useState(0);

  // Generate and memoize the full set of trials at the start
  const trials = useMemo(() => generateTrialSet(), []);

  // Effect to start the timer whenever a new trial begins
  useEffect(() => {
    setTimerOn(true);
    setInputVal("");
    setTrialStart(performance.now()); // Record the start time
  }, [trialIdx]);

  /**
   * Finishes the current trial, records the result, and advances to the next step.
   */
  const finishTrialAndAdvance = (result: TrialResult) => {
    setTimerOn(false);
    const updatedAnswers = [...answers, result];
    setAnswers(updatedAnswers);
    setInputVal(""); // Clear input for the next trial

    // Use a short delay before advancing to provide feedback to the user
    setTimeout(() => {
      if (trialIdx + 1 < trials.length) {
        setTrialIdx(trialIdx + 1);
      } else {
        // All trials are done, complete this part of the experiment
        onComplete(updatedAnswers, skipCount);
      }
    }, 400);
  };

  /**
   * Handles the submission of the user's answer.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const estimate = parseInt(inputVal, 10);

    // Basic validation
    if (!Number.isFinite(estimate) || estimate <= 0) {
      toast({
        variant: "destructive",
        title: "Please enter a valid number.",
      });
      return;
    }

    const trialEnd = performance.now();
    const currentTrialConfig = trials[trialIdx];

    const result: TrialResult = {
      ...currentTrialConfig,
      estimate,
      duration: (trialEnd - (trialStart ?? trialEnd)) / 1000,
    };

    finishTrialAndAdvance(result);
  };

  /**
   * Handles the user skipping a trial.
   */
  const handleSkip = () => {
    const newSkipCount = skipCount + 1;
    setSkipCount(newSkipCount);
    const currentTrialConfig = trials[trialIdx];

    // Record the trial as skipped with a null estimate and zero duration
    const result: TrialResult = {
      ...currentTrialConfig,
      estimate: null,
      duration: 0,
    };

    finishTrialAndAdvance(result);
  };

  /**
   * Provides a user-friendly description for the current color category.
   */
  const getCategoryDescription = (category: KoreanBlueCategory): string => {
    switch (category) {
      case "blue-cyan":
        return "blue + green boundary";
      case "blue-violet":
        return "blue + red boundary";
      case "blue-sky":
        return "blue + white boundary";
      case "blue-navy":
        return "blue + black boundary";
      default:
        return "blue + white boundary";
    }
  };

  // Get the configuration for the currently active trial
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
          Count or estimate the <b>number of distinct color segments</b> visible
          in the bar below.
          <br />
          {/* Difficulty description */}
          {current.level === 1
            ? "More visible edges. Easiest to count."
            : current.level === 2
            ? "Subtle boundaries between colors. More difficult."
            : "Very subtle, almost seamless color transitions. Most challenging!"}
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
          totalWidth={600}
        />
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
            onChange={(e) => setInputVal(e.target.value.replace(/[^\d]/g, ""))}
            className="w-28 text-lg"
            required
            autoFocus
            placeholder="Segments?"
            disabled={!timerOn}
          />
          <Button type="submit" disabled={!timerOn || inputVal === ""}>
            Submit
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleSkip}
            disabled={!timerOn}
          >
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

// ============================================================================
// ExperimentPage Component (Main Orchestrator)
// ============================================================================

/**
 * Manages the entire experiment flow, transitioning between the perception task,
 * the emotion association task, and the questionnaire.
 */
const ExperimentPage: React.FC = () => {
  // State to manage the current step of the experiment
  const [currentStep, setCurrentStep] = useState<
    "experiment" | "emotion" | "questionnaire" | "completed"
  >("experiment");

  // State to store results from each part of the experiment
  const [perceptionResults, setPerceptionResults] = useState<TrialResult[]>([]);
  const [emotionResults, setEmotionResults] = useState<ColorEmotionData | null>(
    null
  );

  /**
   * Asynchronously submits the final combined data to a Google Apps Script endpoint.
   */
  const submitDataToGoogleScript = async (payload: object) => {
    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", // Use no-cors for simple "fire-and-forget" requests to Google Scripts
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow",
        body: JSON.stringify(payload),
      });
      console.log("Data submission request sent successfully!");
    } catch (error) {
      console.error("Error sending data to Google Apps Script:", error);
    }
  };

  /**
   * Saves the collected data locally and triggers the remote submission.
   */
  const saveDataAndComplete = (
    experimentData: TrialResult[],
    emotionData: ColorEmotionData | null,
    questionnaireData: QuestionnaireData
  ) => {
    const finalPayload = {
      questionnaire: questionnaireData,
      experiment: experimentData,
      colorEmotion: emotionData,
      submitted_at: new Date().toISOString(),
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
    };

    // Save data to Google Sheets
    submitDataToGoogleScript(finalPayload);

    // Also save a backup to localStorage in the new format
    const datasetRaw = localStorage.getItem("experimentDataset");
    let dataset: any[] = datasetRaw ? JSON.parse(datasetRaw) : [];
    dataset.push(finalPayload);
    localStorage.setItem("experimentDataset", JSON.stringify(dataset));

    // Store individual components for backward compatibility
    localStorage.setItem("experimentResults", JSON.stringify(experimentData));
    localStorage.setItem("colorEmotionData", JSON.stringify(emotionData));
    localStorage.setItem("questionnaireData", JSON.stringify(questionnaireData));
  };

  // === Handlers for transitioning between experiment steps ===

  /**
   * 1. Called when the first part (perception test) is completed.
   */
  const handlePerceptionComplete = (results: TrialResult[], skips: number) => {
    console.log("Perception test complete! Results:", results, "Skips:", skips);
    setPerceptionResults(results);
    setCurrentStep("emotion"); // Advance to the emotion test
  };

  /**
   * 2. Called when the second part (emotion test) is completed.
   */
  const handleEmotionComplete = (data: ColorEmotionData) => {
    console.log("Emotion test complete! Data:", data);
    setEmotionResults(data);
    setCurrentStep("questionnaire"); // Advance to the questionnaire
  };

  /**
   * 3. Called when the user skips the emotion test.
   */
  const handleEmotionSkip = () => {
    console.log("Emotion test skipped.");
    setEmotionResults(null);
    setCurrentStep("questionnaire"); // Still go to questionnaire
  };

  /**
   * 4. Called when the questionnaire is completed.
   */
  const handleQuestionnaireComplete = (data: QuestionnaireData) => {
    console.log("Questionnaire complete! Data:", data);
    saveDataAndComplete(perceptionResults, emotionResults, data);
    setCurrentStep("completed");
  };

  // === Conditional Rendering Based on the Current Step ===

  if (currentStep === "experiment") {
    return (
      <div className="p-4 bg-gray-50 min-h-screen">
        <ExperimentPanel onComplete={handlePerceptionComplete} />
      </div>
    );
  }

  if (currentStep === "emotion") {
    return (
      <ColorEmotionTest
        onComplete={handleEmotionComplete}
        onSkip={handleEmotionSkip}
      />
    );
  }

  if (currentStep === "questionnaire") {
    return (
      <div className="p-4 bg-gray-50 min-h-screen">
        <Questionnaire onComplete={handleQuestionnaireComplete} />
      </div>
    );
  }

  // Final "Thank You" screen
  return (
    <div className="text-center p-8 mt-16">
      <h1 className="text-2xl font-bold mb-4">
        Thank you for your participation!
      </h1>
      <p>Your responses have been successfully submitted.</p>
    </div>
  );
};

export default ExperimentPage;
