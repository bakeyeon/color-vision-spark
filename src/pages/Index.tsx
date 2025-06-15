import React, { useState } from "react";
import ExperimentPanel, { TrialResult } from "@/components/ExperimentPanel";
import Questionnaire, { QuestionnaireData } from "@/components/Questionnaire";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { assignClusterGroup, ClusterGroup } from "@/lib/userCluster";
import ResultSummary from "@/components/ResultSummary";

// Marine group names and descriptions
const groupDetails: Record<
  ClusterGroup,
  { name: string; description: string; emoji?: string }
> = {
  1: {
    name: "Blue Marlin",
    description:
      "Fast recognition, sensitive to color differences, strong intuition - A sensory fish with sensitive eyes. “Color calls me!”",
    emoji: "🐟"
  },
  2: {
    name: "Pufferfish",
    description:
      "Round, slow to color differences but stable - “Whether it’s mint or Tiffany, pretty things are pretty anyway~”",
    emoji: "🐡"
  },
  3: {
    name: "Mandarinfish",
    description:
      "Extreme color enthusiast. Rich in language sense - “This is… a little more cobalt.” Can distinguish even subtle differences!",
    emoji: "🐠"
  },
  4: {
    name: "Loach",
    description:
      "Text-centric brain, insensitive to color - “More interested in sentence structure than color.”",
    emoji: "🦠"
  },
  5: {
    name: "Squid",
    description:
      "Weak in color recognition but rich in imagination - “This color… resembles my mood.” Owner of poetic sensibility!",
    emoji: "🦑"
  },
  6: {
    name: "Flatfish",
    description:
      "Slow in response, focused on context rather than color - “I see color… but is that important?” Avoidant interpreter!",
    emoji: "🦦"
  },
  7: {
    name: "Mola mola",
    description:
      'A user who skipped more than half the questions - "I don\'t like the question..." A delicate boss surprisingly weak to stress despite the highest weight class in the ocean!',
    emoji: "🐡"
  }
};

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

  // Assign cluster only when summary is shown and results exist
  const clusterGroup: ClusterGroup | null =
    phase === "summary" && results.length > 0
      ? assignClusterGroup({ results })
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 via-white to-blue-50 flex flex-col items-center px-2 lg:px-0">
      <header className="pt-10 pb-4 flex flex-col items-center w-full">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-800 drop-shadow mb-2 font-serif">
          Color Gradient Perception Experiment
        </h1>
        <p className="text-lg text-blue-500 max-w-2xl mb-2">
          Test your ability to detect subtle color transitions.
        </p>
      </header>

      <main className="flex flex-col items-center w-full">
        {phase === "intro" && (
          <Card className="max-w-2xl w-full mx-auto border-2 shadow-xl bg-white/90 backdrop-blur-sm ring-1 ring-blue-300">
            <CardHeader>
              <CardTitle>
                🐟 <span className="text-blue-700 drop-shadow">What kind of fish are you?</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-base text-blue-700">
              <div className="italic text-blue-600 mb-2">"Among fish that react to colors, what kind of visual-linguistic sense are you?"</div>
              <p className="mb-3">
                The way we see colors varies from person to person.
                <br /><br />
                Some people immediately distinguish between sky blue and mint, and others say, "What's the difference?"
                <br /><br />
                Like fish swimming in the ocean, our senses also read the world in different patterns.
                <br />
                <span className="font-semibold text-blue-900">What kind of color sense are you?</span>
              </p>
              <ul className="list-disc ml-5 mb-2 text-blue-700/90">
                <li>
                  You'll be shown a color gradient bar made of <b className="text-blue-900">8–30 adjacent blocks</b> per trial, always smoothly aligned.
                </li>
                <li>
                  <b className="text-blue-900">Your task:</b> Count how many perceptually distinct color segments (visible divisions) you can spot—even if the colors seem very similar!
                </li>
                <li>
                  Colors always move smoothly from <span className="font-medium text-blue-600">white</span>
                  {" → "}
                  <span className="font-medium text-blue-300">light blue</span>
                  {" → "}
                  <span className="font-medium text-blue-800">dark blue</span>
                  {" → "}
                  <span className="font-medium text-cyan-600">cyan</span>
                  {" → "}
                  <span className="font-medium text-green-700">green</span>.
                </li>
                <li>
                  Some trials use <span className="text-blue-400/70">subtle gradients</span>; others use sharper divisions.
                </li>
              </ul>
              <div className="mb-4 text-blue-900">Click <span className="px-2 py-1 bg-blue-100 rounded font-medium">Start</span> when you're ready. There is no time limit, and your response time will be recorded.</div>
              <hr className="my-4 border-blue-200" />
              <div className="text-xs text-center text-blue-500 leading-snug">
                * Your participation is voluntary and all data collected will be used for research purposes only.<br />
                If you have any questions, please contact <a href="mailto:hyeyeon.park@hhu.de" className="underline text-blue-700">hyeyeon.park@hhu.de</a>.
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                className="bg-gradient-to-r from-blue-400 via-blue-600 to-cyan-500 text-white shadow"
                onClick={start}
              >
                Start Experiment
              </Button>
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
              {/* Casual persona result + histogram graphs */}
              {clusterGroup !== null && (
                <ResultSummary
                  group={clusterGroup}
                  correctRate={
                    results.length > 0
                      ? results.filter((r) => r.estimate !== null && Math.abs((r.estimate ?? 0) - r.numBlocks) <= 1).length / results.length
                      : 0
                  }
                  avgSpeed={
                    results.length > 0
                      ? results.filter((r) => typeof r.duration === "number").reduce((s, r) => s + r.duration, 0) / results.length
                      : 0
                  }
                />
              )}

              <div className="text-base mb-2 font-semibold">
                Your trial data:
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="px-2 py-1 text-xs font-medium text-left">#</th>
                      <th className="px-2 py-1 text-xs font-medium text-left">Bar</th>
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
                        <td className="px-2 py-1">{res.subtle ? "Subtle" : "Distinct"}</td>
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
