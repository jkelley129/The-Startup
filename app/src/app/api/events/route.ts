import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import { createEventSchema, createEventBatchSchema } from '@/lib/validations';
import { checkRateLimit } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    // Authenticate via API key or JWT
    const apiKey = request.headers.get('x-api-key');
    let projectId: string;

    if (apiKey) {
      const rateLimit = checkRateLimit(`apikey:${apiKey}`, 1000, 60000);
      if (!rateLimit.allowed) {
        return NextResponse.json(
          { error: 'Rate limit exceeded', resetAt: rateLimit.resetAt },
          { status: 429 }
        );
      }

      const project = await prisma.project.findUnique({ where: { apiKey } });
      if (!project) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
      }
      projectId = project.id;
    } else {
      const payload = authenticateRequest(request);
      if (!payload) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await request.json();
      if (!body.projectId) {
        return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
      }

      const project = await prisma.project.findFirst({
        where: { id: body.projectId, userId: payload.userId },
      });
      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      projectId = project.id;

      // Handle batch events
      if (body.events && Array.isArray(body.events)) {
        const batchValidation = createEventBatchSchema.safeParse(body);
        if (!batchValidation.success) {
          return NextResponse.json(
            { error: 'Validation failed', details: batchValidation.error.flatten() },
            { status: 400 }
          );
        }

        const events = await prisma.apiEvent.createMany({
          data: batchValidation.data.events.map((event) => ({
            projectId,
            method: event.method,
            path: event.path,
            statusCode: event.statusCode,
            responseTimeMs: event.responseTimeMs,
            requestSize: event.requestSize || 0,
            responseSize: event.responseSize || 0,
            ipAddress: event.ipAddress || '',
            userAgent: event.userAgent || '',
            timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
          })),
        });

        return NextResponse.json({ created: events.count }, { status: 201 });
      }

      // Single event via JWT
      const validation = createEventSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const event = await prisma.apiEvent.create({
        data: {
          projectId,
          method: validation.data.method,
          path: validation.data.path,
          statusCode: validation.data.statusCode,
          responseTimeMs: validation.data.responseTimeMs,
          requestSize: validation.data.requestSize || 0,
          responseSize: validation.data.responseSize || 0,
          ipAddress: validation.data.ipAddress || '',
          userAgent: validation.data.userAgent || '',
          timestamp: validation.data.timestamp ? new Date(validation.data.timestamp) : new Date(),
        },
      });

      return NextResponse.json({ event }, { status: 201 });
    }

    // API key path - parse body after auth
    const body = await request.json();

    // Handle batch
    if (body.events && Array.isArray(body.events)) {
      const batchValidation = createEventBatchSchema.safeParse(body);
      if (!batchValidation.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: batchValidation.error.flatten() },
          { status: 400 }
        );
      }

      const events = await prisma.apiEvent.createMany({
        data: batchValidation.data.events.map((event) => ({
          projectId,
          method: event.method,
          path: event.path,
          statusCode: event.statusCode,
          responseTimeMs: event.responseTimeMs,
          requestSize: event.requestSize || 0,
          responseSize: event.responseSize || 0,
          ipAddress: event.ipAddress || '',
          userAgent: event.userAgent || '',
          timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
        })),
      });

      return NextResponse.json({ created: events.count }, { status: 201 });
    }

    // Single event via API key
    const validation = createEventSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const event = await prisma.apiEvent.create({
      data: {
        projectId,
        method: validation.data.method,
        path: validation.data.path,
        statusCode: validation.data.statusCode,
        responseTimeMs: validation.data.responseTimeMs,
        requestSize: validation.data.requestSize || 0,
        responseSize: validation.data.responseSize || 0,
        ipAddress: validation.data.ipAddress || '',
        userAgent: validation.data.userAgent || '',
        timestamp: validation.data.timestamp ? new Date(validation.data.timestamp) : new Date(),
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = authenticateRequest(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: payload.userId },
    });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const [events, total] = await Promise.all([
      prisma.apiEvent.findMany({
        where: { projectId },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.apiEvent.count({ where: { projectId } }),
    ]);

    return NextResponse.json({ events, total, limit, offset });
  } catch (error) {
    console.error('List events error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
