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
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: payload.userId },
    });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const alertEvents = await prisma.alertEvent.findMany({
      where: {
        alert: { projectId },
      },
      include: {
        alert: { select: { name: true, conditionType: true } },
      },
      orderBy: { triggeredAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ alertEvents });
  } catch (error) {
    console.error('List alert events error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
