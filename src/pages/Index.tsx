import React, { useState, useMemo } from "react";
import ExperimentPanel, { TrialResult } from "@/components/ExperimentPanel";
import Questionnaire, { QuestionnaireData } from "@/components/Questionnaire";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { assignClusterGroup, ClusterGroup } from "@/lib/userCluster";
import ResultSummary, { groupImages } from "@/components/ResultSummary";
import { Share } from "lucide-react";
import FishComparison from "@/components/FishComparison";

// Updated fish type to include images and alt
type Fish = {
  id: number;
  name: string;
  emoji: string;
  description: string;
  src?: string;
  imageAlt?: string;
};

// Enhance fishList so each fish gets its src/alt from groupImages if available
const fishList: Array<Fish> = [
  {
    id: 1,
    name: "Blue Marlin",
    emoji: "🐟",
    description: "Fast recognition, sensitive to color differences, strong intuition - A sensory fish with sensitive eyes.",
    ...(groupImages[1] ? { src: groupImages[1].src, imageAlt: groupImages[1].alt } : {})
  },
  {
    id: 2,
    name: "Pufferfish",
    emoji: "🐡",
    description: "Round, slow to color differences but stable.",
    ...(groupImages[2] ? { src: groupImages[2].src, imageAlt: groupImages[2].alt } : {})
  },
  {
    id: 3,
    name: "Mandarinfish",
    emoji: "🐠",
    description: "Extreme color enthusiast. Rich in language sense.",
    ...(groupImages[3] ? { src: groupImages[3].src, imageAlt: groupImages[3].alt } : {})
  },
  {
    id: 4,
    name: "Loach",
    emoji: "🦠",
    description: "Text-centric brain, insensitive to color.",
    ...(groupImages[4] ? { src: groupImages[4].src, imageAlt: groupImages[4].alt } : {})
  },
  {
    id: 5,
    name: "Squid",
    emoji: "🦑",
    description: "Weak in color recognition but rich in imagination.",
    ...(groupImages[5] ? { src: groupImages[5].src, imageAlt: groupImages[5].alt } : {})
  },
  {
    id: 6,
    name: "Flatfish",
    emoji: "🦦",
    description: "Slow in response, focused on context rather than color.",
    ...(groupImages[6] ? { src: groupImages[6].src, imageAlt: groupImages[6].alt } : {})
  },
  {
    id: 7,
    name: "Mola mola",
    emoji: "🐡",
    description: "a delicate boss surprisingly weak to stress despite the highest weight class in the ocean!",
    ...(groupImages[7] ? { src: groupImages[7].src, imageAlt: groupImages[7].alt } : {})
  }
];

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
      "a delicate boss surprisingly weak to stress despite the highest weight class in the ocean!",
    emoji: "🐡"
  }
};

// Utility: picks, given the user's main group, the next closest group deterministically, prioritizing 6 (flatfish) and 7 (mola mola) if not assigned
function getClosestFish(userGroup: number): [typeof fishList[0], typeof fishList[0]] {
  const userIdx = fishList.findIndex(f => f.id === userGroup);
  if (userIdx === -1) {
    // fallback: show flatfish & mola mola
    const flatfish = fishList.find(f => f.name.toLowerCase() === "flatfish")!;
    const mola = fishList.find(f => f.name.toLowerCase().includes("mola"))!;
    return [mola, flatfish];
  }
  // Pick the user's own persona as the left
  const mainFish = fishList[userIdx];
  // If main is 7 (mola mola), next closest is flatfish
  if (mainFish.id === 7) {
    const flatfish = fishList.find(f => f.id === 6)!;
    return [mainFish, flatfish];
  }
  // If main is 6 (flatfish), next closest is mola mola
  if (mainFish.id === 6) {
    const mola = fishList.find(f => f.id === 7)!;
    return [mainFish, mola];
  }
  // Otherwise pick flatfish (6) as next closest unless already main, else the next in the list
  const flatfish = fishList.find(f => f.id === 6)!;
  if (mainFish.id !== 6) {
    return [mainFish, flatfish];
  }
  // Fallback: pick the next index as right
  const next = fishList[(userIdx + 1) % fishList.length];
  return [mainFish, next];
}

const AppHome: React.FC = () => {
  // Phases: intro -> experiment -> questionnaire -> summary
  const [phase, setPhase] = useState<"intro" | "experiment" | "questionnaire" | "summary">("intro");
  const [results, setResults] = useState<TrialResult[]>([]);
  const [demographics, setDemographics] = useState<QuestionnaireData | null>(null);

  const [skipCount, setSkipCount] = useState(0);

  // After experiment, go directly to questionnaire
  const handleExperimentComplete = (res: TrialResult[], skips: number) => {
    setResults(res);
    setSkipCount(skips);
    setPhase("questionnaire");
  };

  // After questionnaire, go to summary screen with persona/result
  const handleQuestionnaire = (d: QuestionnaireData) => {
    setDemographics(d);
    setPhase("summary");
  };

  const assignUserClusterGroup = (): ClusterGroup => {
    if (skipCount > 6) return 7;
    return assignClusterGroup({ results });
  };

  // Exclude the main group when picking the two closest fish for display
  function getClosestOtherFish(userGroup: number): [typeof fishList[0], typeof fishList[0]] {
    // Filter out the user's group
    const filtered = fishList.filter(f => f.id !== userGroup);
    // If both flatfish (6) and mola mola (7) are still present, use them
    const candidates = [filtered.find(f => f.id === 7), filtered.find(f => f.id === 6)]
      .filter(Boolean) as typeof fishList[0][];
    // If we already have two, return them
    if (candidates.length === 2) return [candidates[0], candidates[1]];
    // Otherwise, fill with first other unique fish(es) from filtered
    let rest = filtered.filter(
      f => !candidates.some(c => c.id === f.id)
    );
    while (candidates.length < 2 && rest.length > 0) {
      candidates.push(rest.shift()!);
    }
    // As absolute fallback, use any two from fishList not equal to userGroup and not repeated; 
    if (candidates.length < 2) {
      const others = fishList.filter(f => f.id !== userGroup && !candidates.includes(f));
      while (candidates.length < 2 && others.length > 0) candidates.push(others.shift()!);
    }
    // Defensive: if still not enough (very unlikely), duplicate one entry
    if (candidates.length === 1) candidates.push(candidates[0]);
    return [candidates[0], candidates[1]];
  }

  const clusterGroup: ClusterGroup | null =
    phase === "summary" && results.length > 0
      ? assignUserClusterGroup()
      : null;

  // Share functionality, using Web Share API if available, fallback to copying URL
  const handleShare = () => {
    const shareUrl = window.location.origin + "/";
    const shareText = "Discover your own colorfish! Try this Colorfish Test:";
    if (navigator.share) {
      navigator.share({
        title: "Colorfish Test",
        text: shareText,
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    }
  };

  const start = () => setPhase("experiment");

  // New: state for table toggle
  const [showTrialData, setShowTrialData] = useState(false);

  // Copy makeHistogramData to Index
  function makeHistogramData(userValue: number, bins: number, min: number, max: number) {
    // Gaussian distribution, user likely on upper end for demo; bin user appropriately.
    const range = max - min;
    const data: { bin: string; count: number }[] = [];
    const binStep = range / bins;
    let totalCount = 0;
    let userBinIdx = 0;
    for (let i = 0; i < bins; i++) {
      const from = min + i * binStep;
      const to = min + (i + 1) * binStep;
      const label = `${Math.round(from)}–${Math.round(to)}`;
      // Bell curve, slightly favoring middle, but random
      const center = (min + max) / 2;
      let base = Math.exp(-0.5 * Math.pow((from + to) / 2 - center, 2) / Math.pow(range / 3, 2));
      // Add some randomness:
      base = base * (10 + Math.random() * 5);
      const count = Math.round(base + Math.random() * 5);
      data.push({ bin: label, count });
      totalCount += count;

      // Find which bin user is in
      if (userValue >= from && userValue < to) userBinIdx = i;
    }
    // Place user in the right bin
    const userBin = data[userBinIdx]?.bin ?? data[0]?.bin;
    // Compute percentile (fake: % of bins below user)
    const userPercentile = ((userBinIdx + 1) / bins) * 100;
    return { data, userBin, userPercentile };
  }

  // Calculate correctRate and avgSpeed, memoize for stability. Only update when results change.
  const correctRate = useMemo(() => {
    if (!results.length) return 0;
    const N = results.length;
    const valid = results.filter(r => r.estimate !== null && Number.isFinite(r.estimate));
    const correct = valid.filter(r => Math.abs((r.estimate ?? 0) - r.numBlocks) <= 1); // consider +/-1 margin
    return valid.length ? correct.length / valid.length : 0;
  }, [results]);

  const avgSpeed = useMemo(() => {
    if (!results.length) return 0;
    const valid = results.filter(r => Number.isFinite(r.duration));
    const sum = valid.reduce((acc, r) => acc + (r.duration ?? 0), 0);
    return valid.length ? sum / valid.length : 0;
  }, [results]);

  // Memoize the histogram data using results and clusterGroup as dependencies
  const memoizedHistogram = useMemo(() => {
    const rate100 = Math.round(correctRate * 100);
    return {
      corrData: makeHistogramData(rate100, 8, 0, 100),
      spdData: makeHistogramData(avgSpeed, 6, 1, 15)
    };
  }, [correctRate, avgSpeed, clusterGroup]);

  return (
    <div className="cute-ocean-bg flex flex-col items-center px-2 lg:px-0">
      {/* Decorative coral SVGs (bottom corners) */}
      <div className="coral-corner" aria-hidden="true" />
      <div className="coral-corner right" aria-hidden="true" />
      <header className="pt-10 pb-4 flex flex-col items-center w-full">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-800 drop-shadow mb-2 font-serif font-cute">
          Colorfish Test
        </h1>
        {/* Removed subtitle */}
      </header>
      <main className="flex flex-col items-center w-full">
        {phase === "intro" && (
          <Card className="max-w-2xl w-full mx-auto border-2 shadow-xl bg-white/90 backdrop-blur-sm ring-1 ring-blue-300">
            <CardHeader>
              <CardTitle className="text-center">
                🐟 <span className="text-blue-700 drop-shadow">What kind of fish are you?</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-base text-blue-700 text-center bg-blue-50/90 rounded-md px-2 py-1">
              <div className="italic text-blue-600 mb-2">"Among fish that react to colors, what kind of visual-linguistic sense are you?"</div>
              {/* Intro image now appears here, right after the italic text */}
              <img
                src="/lovable-uploads/0caba236-82e1-45e5-a081-24f26810215c.png"
                alt="Cute pixel art of a sunfish and a dog"
                className="w-64 max-w-[90vw] h-auto mx-auto rounded-lg bg-white/80 mb-3"
              />
              <p className="mb-3">
                The way we see colors varies from person to person.
                <br /><br />
                Some people immediately distinguish between sky blue and mint, and others say, "What's the difference?"
                <br /><br />
                Like fish swimming in the ocean, our senses also read the world in different patterns.
                <br />
                <span className="font-semibold text-blue-900">What kind of color sense are you?</span>
              </p>
              <ul className="list-disc ml-5 mb-2 text-blue-700/90 text-center list-inside">
                <li>
                  You'll be shown a color gradient bar made of <b className="text-blue-900">8–30 adjacent blocks</b> per trial, always smoothly aligned.
                </li>
                <li>
                  <b className="text-blue-900">Your task:</b> Count how many perceptually distinct color segments (visible divisions) you can spot—even if the colors seem very similar!
                </li>
                <li>
                  Colors always move smoothly from <span className="font-medium text-blue-600">blue</span>
                  {" → "}
                  <span className="font-medium text-blue-400">pale blue</span>
                  {" → "}
                  <span className="font-medium text-blue-300">light blue</span>
                  {" → "}
                  <span className="font-medium text-blue-800">dark blue</span>
                  {" → "}
                  <span className="font-medium text-gray-100">white</span>.
                </li>
                <li>
                  Some trials use <span className="text-blue-400/70">very subtle gradients</span>; others use sharper divisions—watch for both!
                </li>
              </ul>
              <div className="mb-2 text-blue-900">
                Thank you for participating the test, I hope you'd enjoy it!
              </div>
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

        {phase === "questionnaire" && (
          <Questionnaire onComplete={handleQuestionnaire} />
        )}

        {/* Result/persona summary is after questionnaire */}
        {phase === "summary" && (
          <Card className="max-w-3xl w-full mx-auto shadow-lg border-2 mt-10">
            <CardContent>
              {/* Persona result + vertical bar charts */}
              {clusterGroup !== null && memoizedHistogram && (
                <ResultSummary
                  group={clusterGroup}
                  correctRate={correctRate}
                  avgSpeed={avgSpeed}
                  corrData={memoizedHistogram.corrData.data}
                  corrUserBin={memoizedHistogram.corrData.userBin}
                  corrUserPercentile={memoizedHistogram.corrData.userPercentile}
                  spdData={memoizedHistogram.spdData.data}
                  spdUserBin={memoizedHistogram.spdData.userBin}
                  spdUserPercentile={100 - memoizedHistogram.spdData.userPercentile}
                />
              )}

              {/* Button to toggle table */}
              <div className="my-4 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowTrialData((prev) => !prev)}
                  aria-expanded={showTrialData}
                  aria-controls="trial-data-table"
                  className="font-medium"
                >
                  {showTrialData ? "Hide full trial data" : "Check your full trial data"}
                </Button>
              </div>
              
              {/* Only this table is toggled, charts/persona stay rendered */}
              {showTrialData && (
                <div id="trial-data-table" className="overflow-x-auto mb-6 animate-fade-in">
                  <div className="text-base mb-2 font-semibold">
                    Your trial data:
                  </div>
                  <table className="w-full border">
                    <thead>
                      <tr className="bg-muted">
                        <th className="px-2 py-1 text-xs font-medium text-left">#</th>
                        <th className="px-2 py-1 text-xs font-medium text-left">Bar</th>
                        <th className="px-2 py-1 text-xs font-medium text-left">Transition</th>
                        <th className="px-2 py-1 text-xs font-medium text-left">Level</th>
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
                          <td className="px-2 py-1">
                            {res.level === 1 ? "Norm." : res.level === 2 ? "Subtle" : "Extra"}
                          </td>
                          <td className="px-2 py-1 font-bold">{res.estimate}</td>
                          <td className="px-2 py-1">{res.numBlocks}</td>
                          <td className="px-2 py-1">{res.duration.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* FishComparison, pass mainFishId and new image fields */}
              {clusterGroup !== null && (
                <FishComparison
                  left={getClosestOtherFish(clusterGroup)[0]}
                  right={getClosestOtherFish(clusterGroup)[1]}
                  mainFishId={clusterGroup}
                />
              )}

              {/* Centered share button */}
              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="gap-2"
                  aria-label="Share this test"
                >
                  <Share className="inline-block" />
                  Share this test with friends
                </Button>
              </div>
            </CardContent>
            {/* No CardFooter */}
          </Card>
        )}
      </main>
    </div>
  );
};

export default AppHome;

// NOTE TO USER: This file is very long and should be refactored into smaller components for better maintainability.
