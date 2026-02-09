import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const prisma = new PrismaClient();

function generateApiKey(): string {
  return `pk_live_${crypto.randomBytes(16).toString('hex')}`;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.alertEvent.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.apiEvent.deleteMany();
  await prisma.dashboard.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const passwordHash = await bcrypt.hash('password123', 12);
  const user = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: 'demo@pulseai.dev',
      name: 'Demo User',
      passwordHash,
      role: 'user',
    },
  });
  console.log(`✅ Created user: ${user.email}`);

  // Create projects
  const project1 = await prisma.project.create({
    data: {
      id: uuidv4(),
      name: 'Production API',
      description: 'Main production API server',
      apiKey: generateApiKey(),
      userId: user.id,
    },
  });
  console.log(`✅ Created project: ${project1.name} (API Key: ${project1.apiKey})`);

  const project2 = await prisma.project.create({
    data: {
      id: uuidv4(),
      name: 'Staging API',
      description: 'Staging environment API',
      apiKey: generateApiKey(),
      userId: user.id,
    },
  });
  console.log(`✅ Created project: ${project2.name}`);

  // Generate API events for last 7 days
  const endpoints = [
    { method: 'GET', path: '/api/users', baseTime: 30, errorRate: 0.02 },
    { method: 'GET', path: '/api/users/:id', baseTime: 25, errorRate: 0.05 },
    { method: 'POST', path: '/api/users', baseTime: 80, errorRate: 0.03 },
    { method: 'PUT', path: '/api/users/:id', baseTime: 60, errorRate: 0.04 },
    { method: 'DELETE', path: '/api/users/:id', baseTime: 20, errorRate: 0.01 },
    { method: 'GET', path: '/api/products', baseTime: 45, errorRate: 0.02 },
    { method: 'GET', path: '/api/products/:id', baseTime: 35, errorRate: 0.03 },
    { method: 'POST', path: '/api/orders', baseTime: 120, errorRate: 0.08 },
    { method: 'GET', path: '/api/orders', baseTime: 55, errorRate: 0.02 },
    { method: 'GET', path: '/api/health', baseTime: 5, errorRate: 0.001 },
  ];

  const statusCodes = {
    success: [200, 201, 204],
    clientError: [400, 401, 403, 404, 422],
    serverError: [500, 502, 503],
  };

  const userAgents = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'PostmanRuntime/7.32.0',
    'axios/1.6.0',
    'node-fetch/3.3.0',
  ];

  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const events = [];

  console.log('📊 Generating API events...');

  for (let i = 0; i < 5000; i++) {
    const endpoint = randomChoice(endpoints);
    const timestamp = new Date(now - Math.random() * sevenDaysMs);
    const isError = Math.random() < endpoint.errorRate;

    // Add some variance and occasional spikes
    let responseTime = endpoint.baseTime + randomInt(-10, 30);
    if (Math.random() < 0.05) responseTime *= randomInt(3, 10); // Occasional spikes

    const statusCode = isError
      ? Math.random() < 0.3
        ? randomChoice(statusCodes.serverError)
        : randomChoice(statusCodes.clientError)
      : randomChoice(statusCodes.success);

    events.push({
      id: uuidv4(),
      projectId: project1.id,
      method: endpoint.method,
      path: endpoint.path,
      statusCode,
      responseTimeMs: Math.max(1, responseTime),
      requestSize: randomInt(100, 5000),
      responseSize: randomInt(200, 50000),
      ipAddress: `${randomInt(1, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 255)}`,
      userAgent: randomChoice(userAgents),
      timestamp,
    });
  }

  await prisma.apiEvent.createMany({ data: events });
  console.log(`✅ Created ${events.length} API events for ${project1.name}`);

  // Create alerts
  const alert1 = await prisma.alert.create({
    data: {
      id: uuidv4(),
      projectId: project1.id,
      name: 'High Response Time',
      conditionType: 'response_time_avg',
      threshold: 500,
      isActive: true,
    },
  });

  const alert2 = await prisma.alert.create({
    data: {
      id: uuidv4(),
      projectId: project1.id,
      name: 'Error Rate Spike',
      conditionType: 'error_rate',
      threshold: 5,
      isActive: true,
    },
  });

  console.log(`✅ Created ${2} alert rules`);

  // Create some alert events
  await prisma.alertEvent.createMany({
    data: [
      {
        id: uuidv4(),
        alertId: alert1.id,
        message: 'Avg response time 623ms exceeds threshold of 500ms',
        severity: 'warning',
        resolved: true,
        triggeredAt: new Date(now - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: uuidv4(),
        alertId: alert2.id,
        message: 'Error rate 7.2% exceeds threshold of 5%',
        severity: 'critical',
        resolved: false,
        triggeredAt: new Date(now - 6 * 60 * 60 * 1000),
      },
      {
        id: uuidv4(),
        alertId: alert1.id,
        message: 'Avg response time 891ms exceeds threshold of 500ms',
        severity: 'critical',
        resolved: false,
        triggeredAt: new Date(now - 1 * 60 * 60 * 1000),
      },
    ],
  });
  console.log(`✅ Created 3 alert events`);

  // Create dashboard
  await prisma.dashboard.create({
    data: {
      id: uuidv4(),
      projectId: project1.id,
      name: 'Overview Dashboard',
      config: JSON.stringify({
        widgets: [
          { type: 'timeseries', metric: 'requests', period: '24h' },
          { type: 'timeseries', metric: 'avg_response_time', period: '24h' },
          { type: 'endpoints', limit: 10 },
        ],
      }),
    },
  });
  console.log(`✅ Created default dashboard`);

  console.log('\n🎉 Seeding complete!');
  console.log(`\n📋 Demo Credentials:`);
  console.log(`   Email: demo@pulseai.dev`);
  console.log(`   Password: password123`);
  console.log(`   API Key: ${project1.apiKey}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
