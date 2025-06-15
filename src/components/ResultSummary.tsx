import React from "react";
import SummaryChart from "./SummaryChart";
import { ClusterGroup } from "@/lib/userCluster";

// Update: All fish images point to your uploaded files and titles include original filename + '_new'
const groupImages: Record<ClusterGroup, { src: string; alt: string }> = {
  1: { src: "/lovable-uploads/536357f8-45d2-42fa-a4af-2f196fe6502c.png", alt: "Blue Marlin_bluemarlin_new" },
  2: { src: "/lovable-uploads/d14706b8-0490-4eba-8f5c-41e03631c302.png", alt: "Pufferfish_pufferfish_new" },
  3: { src: "/lovable-uploads/42080f31-1dc3-46d3-83e8-de77bd06332e.png", alt: "Mandarinfish_mandarinfish_new" },
  4: { src: "/lovable-uploads/184ba6d8-cbf9-434b-9374-5bd1c0001df8.png", alt: "Loach_loach_new" },
  5: { src: "/lovable-uploads/b5fc1cf1-a91f-4992-89de-79c80c55167e.png", alt: "Squid_squid_new" },
  6: { src: "/lovable-uploads/5664d52d-85f7-4eea-ae8c-bac7cc6026f4.png", alt: "Flatfish_flatfish_new" },
  7: { src: "/lovable-uploads/23c0dc77-72e1-4330-a98a-18e6c0840a0f.png", alt: "Mola mola_molamola_new" },
};

interface TrialResult {
  estimate: number | null;
  numBlocks: number;
  duration: number;
  subtle: boolean;
}
type ResultSummaryProps = {
  group: ClusterGroup;
  correctRate: number;
  avgSpeed: number;
  corrData?: { bin: string; count: number }[];
  corrUserBin?: string;
  corrUserPercentile?: number;
  spdData?: { bin: string; count: number }[];
  spdUserBin?: string;
  spdUserPercentile?: number;
};

const groupPersonas: Record<ClusterGroup, { title: string; headline: string; description: string; emoji: string; advice: string }> = {
  1: {
    title: "You are a Blue Marlin! 🐟",
    headline: "“Color calls me!”",
    description: "Fast recognition, sensitive to color differences, strong intuition - A sensory fish with sensitive eyes.",
    emoji: "🐟",
    advice: "You have a born visual acuity—a true observer of subtle worlds! Don’t forget to rest your eyes sometimes."
  },
  2: {
    title: "You are a Pufferfish! 🐡",
    headline: "“Whether it’s mint or Tiffany, pretty things are pretty anyway~”",
    description: "Round, slow to color differences but stable.",
    emoji: "🐡",
    advice: "Taking things easy, you find beauty everywhere. Keep your stability—but let your colors burst when you feel like it!"
  },
  3: {
    title: "You are a Mandarinfish! 🐠",
    headline: "“This is… a little more cobalt.”",
    description: "Extreme color enthusiast. Rich in language sense.",
    emoji: "🐠",
    advice: "You catch every hue and shade! Keep nurturing your artistic sense and communication skills."
  },
  4: {
    title: "You are a Loach! 🦠",
    headline: "“More interested in sentence structure than color.”",
    description: "Text-centric brain, less sensitive to color.",
    emoji: "🦠",
    advice: "Let colors complement your analytical mind; sometimes intuition is the key!"
  },
  5: {
    title: "You are a Squid! 🦑",
    headline: "“This color… resembles my mood.”",
    description: "Weak in color recognition but rich in imagination.",
    emoji: "🦑",
    advice: "Your poetic mind brings color to the world in its own way!"
  },
  6: {
    title: "You are a Flatfish! 🦦",
    headline: "“I see color… but is that important?”",
    description: "Slow in response, focused on context rather than color.",
    emoji: "🦦",
    advice: "You read between the lines! Trust yourself, but don’t ignore the obvious too much."
  },
  7: {
    title: "You are a mola mola! 🌊🐡",
    headline: "“If the world doesn’t suit me… it’s better to stay still.”",
    description: "As a mola mola, you are a delicate marine artist with intuitive judgment and sharp standards!\nYour own way of skipping answers when questions don’t satisfy you,\nthat’s also a sense 💎",
    emoji: "🐡",
    advice: "But don’t carry it all by yourself. Sometimes it’s okay to be sloppy!"
  },
};

// Export for useMemo in Index
export function makeHistogramData(userValue: number, bins: number, min: number, max: number) {
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

const ResultSummary: React.FC<ResultSummaryProps> = ({
  group, correctRate, avgSpeed,
  corrData, corrUserBin, corrUserPercentile,
  spdData, spdUserBin, spdUserPercentile
}) => {
  // Fallback to generating if not provided (for compatibility)
  const rate100 = Math.round(correctRate * 100);
  const corr =
    corrData && corrUserBin && typeof corrUserPercentile === "number"
      ? { data: corrData, userBin: corrUserBin, userPercentile: corrUserPercentile }
      : makeHistogramData(rate100, 8, 0, 100);

  const spd =
    spdData && spdUserBin && typeof spdUserPercentile === "number"
      ? { data: spdData, userBin: spdUserBin, userPercentile: spdUserPercentile }
      : makeHistogramData(avgSpeed, 6, 1, 15);

  const persona = groupPersonas[group];
  const fishImage = groupImages[group];

  return (
    <div className="flex flex-col items-center gap-2 mb-8">
      {/* Fish image for this group - now circular */}
      <div className="flex justify-center items-center mb-2">
        {fishImage?.src ? (
          <img
            src={fishImage.src}
            alt={fishImage.alt}
            className="w-52 h-52 object-contain rounded-full shadow-lg border-[8px] border-white"
            style={{
              background: "linear-gradient(180deg, #a5e4ff 0%, #fafeff 100%)",
              boxShadow: "0 0 0 20px #2772ed", // 20px thick blue border
              borderColor: "#fff",
            }}
          />
        ) : (
          <span className="text-7xl">{persona.emoji}</span>
        )}
      </div>
      <div className="mb-2 text-center">
        <div className="text-3xl md:text-4xl font-bold mb-1">
          {persona.title}
        </div>
        <div className="text-lg md:text-xl font-medium text-primary mb-2">{persona.headline}</div>
        <div className="text-base text-muted-foreground whitespace-pre-line mb-2">{persona.description}</div>
        <div className="italic text-gray-700">{persona.advice}</div>
      </div>
      {/* Vertical slider-style charts */}
      <SummaryChart
        title="Correct Answer Rate (%)"
        data={corr.data}
        userBin={corr.userBin}
        userPercentile={corr.userPercentile}
        annotation={corr.userPercentile > 95 ? "You have a sense of the top few percent!" :
          corr.userPercentile > 75 ? "You are well above average!" :
            corr.userPercentile > 60 ? "Solid sense! A reliable observer." :
              corr.userPercentile > 40 ? "Middle of the school. Still insightful!" :
                "Plenty of room to show your true colors!"
        }
        color="#1f9cd1"
        chartStyle="vertical-slider"
      />
      <SummaryChart
        title="Response Speed (s)"
        data={spd.data}
        userBin={spd.userBin}
        userPercentile={spd.userPercentile}
        annotation={spd.userPercentile < 5 ? "Lightning fast! World-class reactions!" :
          spd.userPercentile < 40 ? "Sharp and attentive!" :
            spd.userPercentile < 70 ? "Consistently focused." :
              "Taking your time isn't always bad!"
        }
        color="#7fdac3"
        chartStyle="vertical-slider"
      />
    </div>
  );
};

export { groupImages }; // for use in FishComparison
export default ResultSummary;
