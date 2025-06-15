
export type ClusterGroup =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7; // 7 is the "unresponsive" group

interface ClusterParams {
  results: Array<{
    estimate: number | null;
    numBlocks: number;
    duration: number;
  }>;
  correctTolerance?: number; // can configure how close an estimate is "correct", e.g., ±1 by default
  minAnswered?: number; // e.g., 3 out of 6
}

export function assignClusterGroup({
  results,
  correctTolerance = 1,
  minAnswered = Math.ceil(results.length / 2)
}: ClusterParams): ClusterGroup {
  const answered = results.filter(r => typeof r.estimate === "number" && Number.isFinite(r.estimate));
  if (answered.length < minAnswered) {
    return 7;
  }
  // Calculate correct answers (within ±tolerance)
  const correct = answered.filter(r =>
    Math.abs((r.estimate ?? 0) - r.numBlocks) <= correctTolerance
  );
  const correctRate = correct.length / results.length;
  const avgDuration = answered.reduce((s, r) => s + r.duration, 0) / answered.length || 0;

  // For demo: Use 3 bins for accuracy * 2 bins for speed = 6 clusters
  // Accuracy: low (≤33%), med (34–66%), high (≥67%)
  // Speed: slow (avg >5s), fast (avg ≤5s)
  let accTier = 1;
  if (correctRate >= 0.67) accTier = 3;
  else if (correctRate >= 0.34) accTier = 2;

  let speedTier = avgDuration <= 5 ? 1 : 2;

  // Tier mapping: (accTier-1)*2+speedTier = 1..6
  return ((accTier - 1) * 2 + speedTier) as ClusterGroup;
}
