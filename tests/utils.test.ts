import { formatNumber, formatDuration, getTimePeriod, checkRateLimit, sanitize } from '../app/src/lib/utils';

describe('Utility Functions', () => {
  describe('formatNumber', () => {
    it('should format millions', () => {
      expect(formatNumber(1500000)).toBe('1.5M');
      expect(formatNumber(1000000)).toBe('1.0M');
    });

    it('should format thousands', () => {
      expect(formatNumber(1500)).toBe('1.5K');
      expect(formatNumber(1000)).toBe('1.0K');
    });

    it('should pass through small numbers', () => {
      expect(formatNumber(999)).toBe('999');
      expect(formatNumber(0)).toBe('0');
    });
  });

  describe('formatDuration', () => {
    it('should format sub-millisecond', () => {
      expect(formatDuration(0.5)).toBe('<1ms');
    });

    it('should format milliseconds', () => {
      expect(formatDuration(45)).toBe('45ms');
      expect(formatDuration(999)).toBe('999ms');
    });

    it('should format seconds', () => {
      expect(formatDuration(1500)).toBe('1.5s');
      expect(formatDuration(5000)).toBe('5.0s');
    });

    it('should format minutes', () => {
      expect(formatDuration(90000)).toBe('1.5m');
    });
  });

  describe('getTimePeriod', () => {
    it('should return correct boundaries for 1h', () => {
      const result = getTimePeriod('1h');
      const diffMs = result.end.getTime() - result.start.getTime();
      expect(diffMs).toBeCloseTo(60 * 60 * 1000, -2);
      expect(result.bucketMinutes).toBe(5);
    });

    it('should return correct boundaries for 24h', () => {
      const result = getTimePeriod('24h');
      const diffMs = result.end.getTime() - result.start.getTime();
      expect(diffMs).toBeCloseTo(24 * 60 * 60 * 1000, -2);
      expect(result.bucketMinutes).toBe(60);
    });

    it('should return correct boundaries for 7d', () => {
      const result = getTimePeriod('7d');
      const diffMs = result.end.getTime() - result.start.getTime();
      expect(diffMs).toBeCloseTo(7 * 24 * 60 * 60 * 1000, -2);
    });

    it('should default to 24h for unknown period', () => {
      const result = getTimePeriod('unknown');
      const diffMs = result.end.getTime() - result.start.getTime();
      expect(diffMs).toBeCloseTo(24 * 60 * 60 * 1000, -2);
    });
  });

  describe('checkRateLimit', () => {
    it('should allow requests within limit', () => {
      const key = `test-${Date.now()}`;
      const result = checkRateLimit(key, 10, 60000);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it('should deny requests exceeding limit', () => {
      const key = `test-deny-${Date.now()}`;
      for (let i = 0; i < 5; i++) {
        checkRateLimit(key, 5, 60000);
      }
      const result = checkRateLimit(key, 5, 60000);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });
  });

  describe('sanitize', () => {
    it('should escape HTML characters', () => {
      expect(sanitize('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
    });

    it('should handle normal text', () => {
      expect(sanitize('Hello World')).toBe('Hello World');
    });

    it('should escape ampersands', () => {
      expect(sanitize('a & b')).toBe('a &amp; b');
    });

    it('should escape single quotes', () => {
      expect(sanitize("it's")).toBe('it&#x27;s');
    });
  });
});
