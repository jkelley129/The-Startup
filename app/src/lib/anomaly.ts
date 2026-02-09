/**
 * PulseAI Anomaly Detection Engine
 *
 * Uses statistical methods (Z-score, IQR) to detect anomalies in API metrics.
 * This is the MVP implementation - can be replaced with ML models in Phase 2.
 */

export interface DataPoint {
  value: number;
  timestamp: Date;
}

export interface AnomalyResult {
  isAnomaly: boolean;
  score: number; // 0-1, higher = more anomalous
  direction: 'high' | 'low' | 'normal';
  threshold: number;
  message: string;
}

/**
 * Calculate Z-score based anomaly detection
 * Z-score = (value - mean) / stddev
 * Values with |Z| > threshold are considered anomalies
 */
export function detectAnomalyZScore(
  currentValue: number,
  historicalValues: number[],
  zThreshold: number = 2.5
): AnomalyResult {
  if (historicalValues.length < 5) {
    return {
      isAnomaly: false,
      score: 0,
      direction: 'normal',
      threshold: zThreshold,
      message: 'Insufficient historical data for anomaly detection',
    };
  }

  const mean = historicalValues.reduce((a, b) => a + b, 0) / historicalValues.length;
  const variance =
    historicalValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    historicalValues.length;
  const stddev = Math.sqrt(variance);

  if (stddev === 0) {
    const isAnomaly = currentValue !== mean;
    return {
      isAnomaly,
      score: isAnomaly ? 1 : 0,
      direction: isAnomaly ? (currentValue > mean ? 'high' : 'low') : 'normal',
      threshold: zThreshold,
      message: isAnomaly
        ? `Value ${currentValue} differs from constant baseline ${mean}`
        : 'Value matches constant baseline',
    };
  }

  const zScore = (currentValue - mean) / stddev;
  const absZScore = Math.abs(zScore);
  const normalizedScore = Math.min(absZScore / (zThreshold * 2), 1);

  return {
    isAnomaly: absZScore > zThreshold,
    score: normalizedScore,
    direction: zScore > zThreshold ? 'high' : zScore < -zThreshold ? 'low' : 'normal',
    threshold: zThreshold,
    message: absZScore > zThreshold
      ? `Anomaly detected: Z-score ${zScore.toFixed(2)} exceeds threshold ±${zThreshold}`
      : `Normal: Z-score ${zScore.toFixed(2)} within threshold ±${zThreshold}`,
  };
}

/**
 * Detect response time anomalies for an endpoint
 */
export function detectResponseTimeAnomaly(
  currentAvgMs: number,
  historicalAvgsMs: number[]
): AnomalyResult {
  return detectAnomalyZScore(currentAvgMs, historicalAvgsMs, 2.5);
}

/**
 * Detect error rate anomalies
 */
export function detectErrorRateAnomaly(
  currentErrorRate: number,
  historicalErrorRates: number[]
): AnomalyResult {
  return detectAnomalyZScore(currentErrorRate, historicalErrorRates, 2.0);
}

/**
 * Detect traffic volume anomalies
 */
export function detectTrafficAnomaly(
  currentCount: number,
  historicalCounts: number[]
): AnomalyResult {
  return detectAnomalyZScore(currentCount, historicalCounts, 3.0);
}

/**
 * Calculate percentile value from sorted array
 */
export function percentile(sortedValues: number[], p: number): number {
  if (sortedValues.length === 0) return 0;
  const index = (p / 100) * (sortedValues.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sortedValues[lower];
  const weight = index - lower;
  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
}

/**
 * Calculate basic statistics for a dataset
 */
export function calculateStats(values: number[]): {
  mean: number;
  median: number;
  stddev: number;
  p50: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
} {
  if (values.length === 0) {
    return { mean: 0, median: 0, stddev: 0, p50: 0, p95: 0, p99: 0, min: 0, max: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;

  return {
    mean: Math.round(mean * 100) / 100,
    median: percentile(sorted, 50),
    stddev: Math.round(Math.sqrt(variance) * 100) / 100,
    p50: percentile(sorted, 50),
    p95: percentile(sorted, 95),
    p99: percentile(sorted, 99),
    min: sorted[0],
    max: sorted[sorted.length - 1],
  };
}
