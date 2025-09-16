
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
  // 리터러시 계산을 위한 새로운 파라미터
  colorEmotionAnswers?: number; // 컬러 이모션 테스트 응답 수 (0-3)
  mediaHours?: number; // 주간 미디어 이용 시간
}

// Weighted scoring: more subtle trials count more
const LEVEL_SCORE = {
  1: 1, // Easiest
  2: 2, // Subtle
  3: 3, // Very subtle
};

// 리터러시 레벨 계산 함수
function calculateLiteracyLevel(colorEmotionAnswers: number = 0, mediaHours: number = 0): number {
  // 고리터러시: 3개 응답 + 20시간 이상 = 3점
  if (colorEmotionAnswers === 3 && mediaHours >= 20) return 3;
  
  // 중리터러시: 2-3개 응답 + 10-19시간 = 2점
  if (colorEmotionAnswers >= 2 && mediaHours >= 10 && mediaHours < 20) return 2;
  
  // 저리터러시: 그 외 = 1점
  return 1;
}

export function assignClusterGroup({
  results,
  correctTolerance = 1,
  minAnswered = Math.ceil(results.length / 2),
  colorEmotionAnswers = 0,
  mediaHours = 0
}: ClusterParams): ClusterGroup {
  const answered = results.filter(r => typeof r.estimate === "number" && Number.isFinite(r.estimate));
  if (answered.length < minAnswered) {
    return 7;
  }
  // Calculate score: If answer within range, get the weight/score
  let weightedScore = 0;
  let maxScore = 0;
  answered.forEach(res => {
    const level = res.level ?? 1;
    maxScore += LEVEL_SCORE[level] ?? 1;
    if (Math.abs((res.estimate ?? 0) - res.numBlocks) <= correctTolerance) {
      weightedScore += LEVEL_SCORE[level] ?? 1;
    }
  });
  const correctRate = maxScore === 0 ? 0 : weightedScore / maxScore;
  const avgDuration = answered.reduce((s, r) => s + r.duration, 0) / answered.length || 0;
  
  // 리터러시 레벨 계산
  const literacyLevel = calculateLiteracyLevel(colorEmotionAnswers, mediaHours);

  /* 새로운 컬러피쉬 분류: 특징별 조건 매핑
   * 
   * 속도 구분:
   * - 빠름(fast): <=3초
   * - 중간(medium): 3-7초  
   * - 느림(slow): >7초
   * 
   * 정확도 구분:
   * - 높음(high): >=67%
   * - 중간(medium): 34-67%
   * - 낮음(low): <34%
   * 
   * 리터러시 구분:
   * - 고(high): 3점
   * - 중(medium): 2점
   * - 저(low): 1점
   */

  // 속도 레벨 계산
  let speedLevel: 'fast' | 'medium' | 'slow' = 'slow';
  if (avgDuration <= 3) speedLevel = 'fast';
  else if (avgDuration <= 7) speedLevel = 'medium';

  // 정확도 레벨 계산
  let accuracyLevel: 'high' | 'medium' | 'low' = 'low';
  if (correctRate >= 0.67) accuracyLevel = 'high';
  else if (correctRate >= 0.34) accuracyLevel = 'medium';

  // 리터러시 레벨 변환
  let literacyLevelName: 'high' | 'medium' | 'low' = 'low';
  if (literacyLevel === 3) literacyLevelName = 'high';
  else if (literacyLevel === 2) literacyLevelName = 'medium';

  /* 컬러피쉬 특징별 분류 (우선순위 순):
   * 1. 청새치: 빠름 + 정확도 높음 + 고리터러시
   * 2. 만다린피쉬: (빠름|중간) + (정확도 중간|높음) + 고리터러시
   * 3. 미꾸라지: 모든속도 + 정확도 낮음 + 고리터러시  
   * 4. 복어: (중간|느림) + 정확도 낮음 + 중리터러시
   * 5. 가자미: 느림 + 정확도 낮음 + 저리터러시
   * 6. 오징어: 나머지 모든 경우
   */

  // 1. 청새치: 빠름 + 정확도 높음 + 고리터러시
  if (speedLevel === 'fast' && accuracyLevel === 'high' && literacyLevelName === 'high') {
    return 1; // 청새치
  }

  // 2. 만다린피쉬: (빠름|중간) + (정확도 중간|높음) + 고리터러시 (청새치 제외)
  if ((speedLevel === 'fast' || speedLevel === 'medium') && 
      (accuracyLevel === 'medium' || accuracyLevel === 'high') && 
      literacyLevelName === 'high') {
    return 3; // 만다린피쉬
  }

  // 3. 미꾸라지: 모든속도 + 정확도 낮음 + 고리터러시
  if (accuracyLevel === 'low' && literacyLevelName === 'high') {
    return 4; // 미꾸라지
  }

  // 4. 복어: (중간|느림) + 정확도 낮음 + 중리터러시
  if ((speedLevel === 'medium' || speedLevel === 'slow') && 
      accuracyLevel === 'low' && 
      literacyLevelName === 'medium') {
    return 2; // 복어
  }

  // 5. 가자미: 느림 + 정확도 낮음 + 저리터러시
  if (speedLevel === 'slow' && accuracyLevel === 'low' && literacyLevelName === 'low') {
    return 6; // 가자미
  }

  // 6. 오징어: 나머지 모든 경우 (누락 방지)
  return 5; // 오징어
}
