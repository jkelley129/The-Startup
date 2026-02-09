import {
  detectAnomalyZScore,
  detectResponseTimeAnomaly,
  detectErrorRateAnomaly,
  detectTrafficAnomaly,
  percentile,
  calculateStats,
} from '../app/src/lib/anomaly';

describe('Anomaly Detection Engine', () => {
  describe('detectAnomalyZScore', () => {
    it('should return normal for values within threshold', () => {
      const historical = [100, 102, 98, 101, 99, 103, 97, 100, 101, 99];
      const result = detectAnomalyZScore(101, historical);
      expect(result.isAnomaly).toBe(false);
      expect(result.direction).toBe('normal');
    });

    it('should detect high anomalies', () => {
      const historical = [100, 102, 98, 101, 99, 103, 97, 100, 101, 99];
      const result = detectAnomalyZScore(150, historical);
      expect(result.isAnomaly).toBe(true);
      expect(result.direction).toBe('high');
    });

    it('should detect low anomalies', () => {
      const historical = [100, 102, 98, 101, 99, 103, 97, 100, 101, 99];
      const result = detectAnomalyZScore(50, historical);
      expect(result.isAnomaly).toBe(true);
      expect(result.direction).toBe('low');
    });

    it('should handle insufficient data gracefully', () => {
      const result = detectAnomalyZScore(100, [99, 101]);
      expect(result.isAnomaly).toBe(false);
      expect(result.message).toContain('Insufficient');
    });

    it('should handle zero standard deviation', () => {
      const historical = [100, 100, 100, 100, 100];
      const result = detectAnomalyZScore(100, historical);
      expect(result.isAnomaly).toBe(false);

      const anomalyResult = detectAnomalyZScore(110, historical);
      expect(anomalyResult.isAnomaly).toBe(true);
    });

    it('should respect custom threshold', () => {
      const historical = [100, 102, 98, 101, 99, 103, 97, 100, 101, 99];
      const strictResult = detectAnomalyZScore(110, historical, 1.0);
      expect(strictResult.isAnomaly).toBe(true);

      const lenientResult = detectAnomalyZScore(110, historical, 10.0);
      expect(lenientResult.isAnomaly).toBe(false);
    });

    it('should produce score between 0 and 1', () => {
      const historical = [100, 102, 98, 101, 99, 103, 97, 100, 101, 99];
      const result = detectAnomalyZScore(120, historical);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });
  });

  describe('detectResponseTimeAnomaly', () => {
    it('should detect response time spikes', () => {
      const historical = [45, 50, 42, 48, 51, 47, 43, 49, 46, 50];
      const result = detectResponseTimeAnomaly(200, historical);
      expect(result.isAnomaly).toBe(true);
      expect(result.direction).toBe('high');
    });

    it('should not flag normal response times', () => {
      const historical = [45, 50, 42, 48, 51, 47, 43, 49, 46, 50];
      const result = detectResponseTimeAnomaly(48, historical);
      expect(result.isAnomaly).toBe(false);
    });
  });

  describe('detectErrorRateAnomaly', () => {
    it('should detect error rate spikes', () => {
      const historical = [1.0, 1.2, 0.8, 1.1, 0.9, 1.0, 1.3, 0.7, 1.1, 0.9];
      const result = detectErrorRateAnomaly(8.5, historical);
      expect(result.isAnomaly).toBe(true);
    });
  });

  describe('detectTrafficAnomaly', () => {
    it('should detect traffic spikes', () => {
      const historical = [1000, 1050, 980, 1020, 1010, 990, 1030, 1000, 970, 1040];
      const result = detectTrafficAnomaly(5000, historical);
      expect(result.isAnomaly).toBe(true);
    });

    it('should detect traffic drops', () => {
      const historical = [1000, 1050, 980, 1020, 1010, 990, 1030, 1000, 970, 1040];
      const result = detectTrafficAnomaly(100, historical);
      expect(result.isAnomaly).toBe(true);
      expect(result.direction).toBe('low');
    });
  });

  describe('percentile', () => {
    it('should calculate percentiles correctly', () => {
      const sorted = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      expect(percentile(sorted, 50)).toBe(5.5);
      expect(percentile(sorted, 0)).toBe(1);
      expect(percentile(sorted, 100)).toBe(10);
    });

    it('should handle empty arrays', () => {
      expect(percentile([], 50)).toBe(0);
    });

    it('should handle single element', () => {
      expect(percentile([42], 50)).toBe(42);
    });
  });

  describe('calculateStats', () => {
    it('should calculate all statistics correctly', () => {
      const values = [10, 20, 30, 40, 50];
      const stats = calculateStats(values);

      expect(stats.mean).toBe(30);
      expect(stats.min).toBe(10);
      expect(stats.max).toBe(50);
      expect(stats.stddev).toBeGreaterThan(0);
      expect(stats.p50).toBe(30);
      expect(stats.p95).toBeGreaterThan(40);
    });

    it('should handle empty arrays', () => {
      const stats = calculateStats([]);
      expect(stats.mean).toBe(0);
      expect(stats.median).toBe(0);
      expect(stats.stddev).toBe(0);
    });
  });
});
