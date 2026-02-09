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

    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const events = await prisma.apiEvent.findMany({
      where: { projectId, timestamp: { gte: last24h } },
      select: {
        method: true,
        path: true,
        statusCode: true,
        responseTimeMs: true,
      },
    });

    // Group by method + path
    const endpointMap = new Map<
      string,
      {
        method: string;
        path: string;
        totalRequests: number;
        errorCount: number;
        totalResponseTime: number;
        responseTimes: number[];
      }
    >();

    for (const event of events) {
      const key = `${event.method} ${event.path}`;
      if (!endpointMap.has(key)) {
        endpointMap.set(key, {
          method: event.method,
          path: event.path,
          totalRequests: 0,
          errorCount: 0,
          totalResponseTime: 0,
          responseTimes: [],
        });
      }
      const endpoint = endpointMap.get(key)!;
      endpoint.totalRequests++;
      if (event.statusCode >= 400) endpoint.errorCount++;
      endpoint.totalResponseTime += event.responseTimeMs;
      endpoint.responseTimes.push(event.responseTimeMs);
    }

    const endpoints = Array.from(endpointMap.values())
      .map((ep) => {
        const sorted = ep.responseTimes.sort((a, b) => a - b);
        const p95Index = Math.floor(sorted.length * 0.95);
        return {
          method: ep.method,
          path: ep.path,
          totalRequests: ep.totalRequests,
          errorRate: Math.round((ep.errorCount / ep.totalRequests) * 10000) / 100,
          avgResponseTime: Math.round(ep.totalResponseTime / ep.totalRequests),
          p95ResponseTime: sorted.length > 0 ? sorted[p95Index] : 0,
        };
      })
      .sort((a, b) => b.totalRequests - a.totalRequests);

    return NextResponse.json({ endpoints });
  } catch (error) {
    console.error('Analytics endpoints error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
