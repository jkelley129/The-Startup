import {
  registerSchema,
  loginSchema,
  createProjectSchema,
  createEventSchema,
  createAlertSchema,
} from '../app/src/lib/validations';

describe('Input Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should accept valid registration data', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = registerSchema.safeParse({
        email: 'not-an-email',
        name: 'Test User',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        name: 'Test User',
        password: 'short',
      });
      expect(result.success).toBe(false);
    });

    it('should reject short name', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        name: 'T',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should accept valid login data', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createProjectSchema', () => {
    it('should accept valid project data', () => {
      const result = createProjectSchema.safeParse({
        name: 'My API Project',
        description: 'A test project',
      });
      expect(result.success).toBe(true);
    });

    it('should accept without description', () => {
      const result = createProjectSchema.safeParse({ name: 'My API Project' });
      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const result = createProjectSchema.safeParse({ name: '' });
      expect(result.success).toBe(false);
    });

    it('should reject overly long name', () => {
      const result = createProjectSchema.safeParse({ name: 'a'.repeat(101) });
      expect(result.success).toBe(false);
    });
  });

  describe('createEventSchema', () => {
    it('should accept valid event data', () => {
      const result = createEventSchema.safeParse({
        method: 'GET',
        path: '/api/users',
        statusCode: 200,
        responseTimeMs: 45,
      });
      expect(result.success).toBe(true);
    });

    it('should accept all HTTP methods', () => {
      const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
      methods.forEach((method) => {
        const result = createEventSchema.safeParse({
          method,
          path: '/test',
          statusCode: 200,
          responseTimeMs: 10,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid HTTP method', () => {
      const result = createEventSchema.safeParse({
        method: 'INVALID',
        path: '/test',
        statusCode: 200,
        responseTimeMs: 10,
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid status codes', () => {
      const result = createEventSchema.safeParse({
        method: 'GET',
        path: '/test',
        statusCode: 99,
        responseTimeMs: 10,
      });
      expect(result.success).toBe(false);
    });

    it('should reject negative response times', () => {
      const result = createEventSchema.safeParse({
        method: 'GET',
        path: '/test',
        statusCode: 200,
        responseTimeMs: -1,
      });
      expect(result.success).toBe(false);
    });

    it('should accept optional fields', () => {
      const result = createEventSchema.safeParse({
        method: 'POST',
        path: '/api/orders',
        statusCode: 201,
        responseTimeMs: 120,
        requestSize: 500,
        responseSize: 1200,
        ipAddress: '192.168.1.1',
        userAgent: 'TestAgent/1.0',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('createAlertSchema', () => {
    it('should accept valid alert data', () => {
      const result = createAlertSchema.safeParse({
        projectId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'High Latency Alert',
        conditionType: 'response_time_avg',
        threshold: 500,
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid condition type', () => {
      const result = createAlertSchema.safeParse({
        projectId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test Alert',
        conditionType: 'invalid_type',
        threshold: 100,
      });
      expect(result.success).toBe(false);
    });

    it('should reject negative threshold', () => {
      const result = createAlertSchema.safeParse({
        projectId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test Alert',
        conditionType: 'error_rate',
        threshold: -5,
      });
      expect(result.success).toBe(false);
    });

    it('should accept all valid condition types', () => {
      const types = ['response_time_avg', 'error_rate', 'request_count', 'p95_latency'];
      types.forEach((conditionType) => {
        const result = createAlertSchema.safeParse({
          projectId: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Test',
          conditionType,
          threshold: 100,
        });
        expect(result.success).toBe(true);
      });
    });
  });
});
