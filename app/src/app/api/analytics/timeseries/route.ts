import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import { getTimePeriod } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const payload = authenticateRequest(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const metric = searchParams.get('metric') || 'requests';
    const period = searchParams.get('period') || '24h';

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: payload.userId },
    });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const { start, end, bucketMinutes } = getTimePeriod(period);

    const events = await prisma.apiEvent.findMany({
      where: {
        projectId,
        timestamp: { gte: start, lte: end },
      },
      select: {
        statusCode: true,
        responseTimeMs: true,
        timestamp: true,
      },
      orderBy: { timestamp: 'asc' },
    });

    // Group events into time buckets
    const buckets = new Map<string, typeof events>();
    const bucketMs = bucketMinutes * 60 * 1000;

    for (const event of events) {
      const bucketStart = new Date(
        Math.floor(event.timestamp.getTime() / bucketMs) * bucketMs
      );
      const key = bucketStart.toISOString();
      if (!buckets.has(key)) {
        buckets.set(key, []);
      }
      buckets.get(key)!.push(event);
    }

    // Generate all buckets (including empty ones)
    const timeseries: Array<{
      timestamp: string;
      value: number;
    }> = [];

    let current = new Date(Math.floor(start.getTime() / bucketMs) * bucketMs);
    while (current <= end) {
      const key = current.toISOString();
      const bucketEvents = buckets.get(key) || [];

      let value = 0;
      switch (metric) {
        case 'requests':
          value = bucketEvents.length;
          break;
        case 'avg_response_time':
          value =
            bucketEvents.length > 0
              ? Math.round(
                  bucketEvents.reduce((sum, e) => sum + e.responseTimeMs, 0) / bucketEvents.length
                )
              : 0;
          break;
        case 'error_rate':
          value =
            bucketEvents.length > 0
              ? Math.round(
                  (bucketEvents.filter((e) => e.statusCode >= 400).length / bucketEvents.length) *
                    10000
                ) / 100
              : 0;
          break;
        case 'p95_response_time': {
          const times = bucketEvents.map((e) => e.responseTimeMs).sort((a, b) => a - b);
          const idx = Math.floor(times.length * 0.95);
          value = times.length > 0 ? times[idx] : 0;
          break;
        }
        default:
          value = bucketEvents.length;
      }

      timeseries.push({ timestamp: key, value });
      current = new Date(current.getTime() + bucketMs);
    }

    return NextResponse.json({ timeseries, metric, period });
  } catch (error) {
    console.error('Analytics timeseries error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
