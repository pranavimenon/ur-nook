import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

const ALLOWED_UNITS = ['cm', 'in', 'ft'];

/**
 * Loads a project only if it exists AND belongs to `userId`. Deliberately
 * returns the same "not found" result whether the project doesn't exist at
 * all or just belongs to someone else — never reveals that a project with
 * that id exists but isn't yours.
 */
async function getOwnedProject(id: string, userId: string) {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project || project.userId !== userId) return null;
  return project;
}

type RouteContext = { params: Promise<{ id: string }> };

/** GET /api/projects/:id — full project, only if you own it. */
export async function GET(req: Request, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { id } = await params;
  const project = await getOwnedProject(id, userId);
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  return NextResponse.json(project);
}

/** PUT /api/projects/:id — partial update; only fields present in the body are touched. */
export async function PUT(req: Request, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { id } = await params;
  const existing = await getOwnedProject(id, userId);
  if (!existing) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  const body = await req.json().catch(() => ({}));

  if (body.unitPreference !== undefined && !ALLOWED_UNITS.includes(body.unitPreference)) {
    return NextResponse.json({ error: `unitPreference must be one of: ${ALLOWED_UNITS.join(', ')}` }, { status: 400 });
  }
  if (body.furnitureItems !== undefined && !Array.isArray(body.furnitureItems)) {
    return NextResponse.json({ error: 'furnitureItems must be an array' }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = String(body.name).trim();
  if (body.unitPreference !== undefined) data.unitPreference = body.unitPreference;
  if (body.roomDimensions !== undefined) data.roomDimensions = body.roomDimensions;
  if (body.furnitureItems !== undefined) data.furnitureItems = body.furnitureItems;
  if (body.vastuNotes !== undefined) data.vastuNotes = body.vastuNotes;
  if (body.thumbnail !== undefined) data.thumbnail = body.thumbnail;

  const project = await prisma.project.update({ where: { id }, data });
  return NextResponse.json(project);
}

/** DELETE /api/projects/:id — only if you own it. */
export async function DELETE(req: Request, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { id } = await params;
  const existing = await getOwnedProject(id, userId);
  if (!existing) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  await prisma.project.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
