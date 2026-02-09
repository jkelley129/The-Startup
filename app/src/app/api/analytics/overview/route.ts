import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const payload = authenticateRequest(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: payload.userId },
    });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last48h = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    // Current period stats
    const currentEvents = await prisma.apiEvent.findMany({
      where: { projectId, timestamp: { gte: last24h } },
      select: { statusCode: true, responseTimeMs: true },
    });

    // Previous period stats for comparison
    const previousEvents = await prisma.apiEvent.findMany({
      where: { projectId, timestamp: { gte: last48h, lt: last24h } },
      select: { statusCode: true, responseTimeMs: true },
    });

    const totalRequests = currentEvents.length;
    const prevTotalRequests = previousEvents.length;

    const errorCount = currentEvents.filter((e) => e.statusCode >= 400).length;
    const prevErrorCount = previousEvents.filter((e) => e.statusCode >= 400).length;

    const errorRate = totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0;
    const prevErrorRate = prevTotalRequests > 0 ? (prevErrorCount / prevTotalRequests) * 100 : 0;

    const avgResponseTime =
      totalRequests > 0
        ? currentEvents.reduce((sum, e) => sum + e.responseTimeMs, 0) / totalRequests
        : 0;
    const prevAvgResponseTime =
      prevTotalRequests > 0
        ? previousEvents.reduce((sum, e) => sum + e.responseTimeMs, 0) / prevTotalRequests
        : 0;

    const sortedTimes = currentEvents.map((e) => e.responseTimeMs).sort((a, b) => a - b);
    const p95Index = Math.floor(sortedTimes.length * 0.95);
    const p95ResponseTime = sortedTimes.length > 0 ? sortedTimes[p95Index] : 0;

    return NextResponse.json({
      totalRequests,
      errorRate: Math.round(errorRate * 100) / 100,
      avgResponseTime: Math.round(avgResponseTime),
      p95ResponseTime,
      changes: {
        requests: prevTotalRequests > 0
          ? Math.round(((totalRequests - prevTotalRequests) / prevTotalRequests) * 100)
          : 0,
        errorRate: Math.round((errorRate - prevErrorRate) * 100) / 100,
        avgResponseTime: prevAvgResponseTime > 0
          ? Math.round(((avgResponseTime - prevAvgResponseTime) / prevAvgResponseTime) * 100)
          : 0,
      },
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
