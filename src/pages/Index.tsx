
import React, { useState } from "react";
import ExperimentPanel, { TrialResult } from "@/components/ExperimentPanel";
import Questionnaire, { QuestionnaireData } from "@/components/Questionnaire";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AppHome: React.FC = () => {
  const [phase, setPhase] = useState<"intro" | "experiment" | "summary" | "questionnaire" | "done">("intro");
  const [results, setResults] = useState<TrialResult[]>([]);
  const [demographics, setDemographics] = useState<QuestionnaireData | null>(null);

  const start = () => setPhase("experiment");

  const handleExperimentComplete = (res: TrialResult[]) => {
    setResults(res);
    setPhase("summary");
  };
  const handleQuestionnaire = (d: QuestionnaireData) => {
    setDemographics(d);
    setPhase("done");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-2 lg:px-0">
      <header className="pt-10 pb-4 flex flex-col items-center w-full">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">
          Color Gradient Perception Experiment
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mb-2">
          Test your ability to detect subtle color transitions.
        </p>
      </header>

      <main className="flex flex-col items-center w-full">
        {phase === "intro" && (
          <Card className="max-w-2xl w-full mx-auto border-2 shadow-lg">
            <CardHeader>
              <CardTitle>
                Visual Perception Research Task
              </CardTitle>
            </CardHeader>
            <CardContent className="text-base text-muted-foreground">
              <ul className="list-disc ml-5 mb-2">
                <li>Each trial shows a color gradient bar made of <b>8–30 adjacent blocks</b>, always aligned smoothly.</li>
                <li>
                  <b>Your task</b>: Count how many perceptually distinct color segments (visible divisions) you can see in the bar—even if the colors are very similar!
                </li>
                <li>
                  Colors will always move smoothly from <span className="font-medium text-blue-700">white</span> → <span className="font-medium text-blue-400">light blue</span> → <span className="font-medium text-blue-800">dark blue</span> → <span className="font-medium text-cyan-600">cyan</span> → <span className="font-medium text-green-700">green</span>.
                </li>
                <li>
                  Some trials use <span className="text-muted-foreground">subtle gradients</span>; others use sharp divisions.
                </li>
              </ul>
              <div className="mb-4">Click "Start" when ready. There is no time limit, but your response time will be recorded.</div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button onClick={start}>Start Experiment</Button>
            </CardFooter>
          </Card>
        )}

        {phase === "experiment" && (
          <ExperimentPanel onComplete={handleExperimentComplete} />
        )}

        {phase === "summary" && (
          <Card className="max-w-3xl w-full mx-auto shadow-lg border-2 mt-10">
            <CardHeader>
              <CardTitle>Experiment Complete!</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-base mb-2">
                <b>Your results:</b>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="px-2 py-1 text-xs font-medium text-left">#</th>
                      <th className="px-2 py-1 text-xs font-medium text-left">Bar</th>
                      <th className="px-2 py-1 text-xs font-medium text-left">Orientation</th>
                      <th className="px-2 py-1 text-xs font-medium text-left">Transition</th>
                      <th className="px-2 py-1 text-xs font-medium text-left">Est. Segments</th>
                      <th className="px-2 py-1 text-xs font-medium text-left">Actual Blocks</th>
                      <th className="px-2 py-1 text-xs font-medium text-left">Time (s)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((res, i) => (
                      <tr key={i} className="odd:bg-background even:bg-muted/50">
                        <td className="px-2 py-1">{i + 1}</td>
                        <td className="px-2 py-1">▇</td>
                        <td className="px-2 py-1">{res.orientation}</td>
                        <td className="px-2 py-1">{res.subtle ? 'Subtle' : 'Distinct'}</td>
                        <td className="px-2 py-1 font-bold">{res.estimate}</td>
                        <td className="px-2 py-1">{res.numBlocks}</td>
                        <td className="px-2 py-1">{res.duration.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={() => setPhase("questionnaire")}>
                Continue to Final Questions
              </Button>
            </CardFooter>
          </Card>
        )}

        {phase === "questionnaire" && (
          <Questionnaire onComplete={handleQuestionnaire} />
        )}

        {phase === "done" && (
          <Card className="max-w-lg w-full mx-auto my-20 text-center">
            <CardHeader>
              <CardTitle>Thank you for participating!</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2">Your input is invaluable for color perception research.</div>
              <div className="text-muted-foreground text-xs">
                The experiment data exists only in your browser for privacy.<br />
                Want to try again? Reload the page.
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default AppHome;
