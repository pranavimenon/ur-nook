import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { DEFAULT_ROOM_DIMENSIONS } from '@/lib/defaults';

const ALLOWED_UNITS = ['cm', 'in', 'ft'];

// Lightweight fields only — the dashboard grid doesn't need full room/furniture
// data, just enough to render a card. Full data is fetched per-project when opened.
const LIST_SELECT = {
  id: true,
  name: true,
  unitPreference: true,
  thumbnail: true,
  createdAt: true,
  updatedAt: true,
} as const;

/** GET /api/projects — every project belonging to the signed-in user. */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    select: LIST_SELECT,
  });
  return NextResponse.json(projects);
}

/** POST /api/projects — create a new project owned by the signed-in user. */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }
  if (body.unitPreference !== undefined && !ALLOWED_UNITS.includes(body.unitPreference)) {
    return NextResponse.json({ error: `unitPreference must be one of: ${ALLOWED_UNITS.join(', ')}` }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      userId,
      name,
      unitPreference: body.unitPreference || 'cm',
      roomDimensions: body.roomDimensions || DEFAULT_ROOM_DIMENSIONS,
      furnitureItems: body.furnitureItems || [],
      vastuNotes: body.vastuNotes ?? null,
      thumbnail: body.thumbnail ?? null,
    },
  });
  return NextResponse.json(project, { status: 201 });
}
