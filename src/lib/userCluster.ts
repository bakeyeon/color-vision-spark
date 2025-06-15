
export type ClusterGroup =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7; // 7 is the "unresponsive" group

interface ClusterParams {
  results: Array<{
    estimate: number | null;
    numBlocks: number;
    duration: number;
    subtle?: boolean;
    level?: number;
  }>;
  correctTolerance?: number;
  minAnswered?: number;
}

// Weighted scoring: more subtle trials count more
const LEVEL_SCORE = {
  1: 1, // Easiest
  2: 2, // Subtle
  3: 3, // Very subtle
};

export function assignClusterGroup({
  results,
  correctTolerance = 1,
  minAnswered = Math.ceil(results.length / 2)
}: ClusterParams): ClusterGroup {
  const answered = results.filter(r => typeof r.estimate === "number" && Number.isFinite(r.estimate));
  if (answered.length < minAnswered) {
    return 7;
  }
  // Calculate score: If answer within range, get the weight/score
  let totalScore = 0;
  let maxScore = 0;
  answered.forEach(res => {
    const level = res.level ?? 1;
    maxScore += LEVEL_SCORE[level] ?? 1;
    if (Math.abs((res.estimate ?? 0) - res.numBlocks) <= correctTolerance) {
      totalScore += LEVEL_SCORE[level] ?? 1;
    }
  });
  const correctRate = maxScore === 0 ? 0 : totalScore / maxScore;
  const avgDuration = answered.reduce((s, r) => s + r.duration, 0) / answered.length || 0;

  // 3 accuracy bins × 2 speed bins = 6 clusters (plus unresponsive)
  let accTier = 1;
  if (correctRate >= 0.67) accTier = 3;
  else if (correctRate >= 0.34) accTier = 2;

  let speedTier = avgDuration <= 5 ? 1 : 2;
  return ((accTier - 1) * 2 + speedTier) as ClusterGroup;
}
