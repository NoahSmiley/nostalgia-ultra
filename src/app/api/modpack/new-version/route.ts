import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const MODPACK_API_SECRET = process.env.MODPACK_API_SECRET;

export async function POST(request: NextRequest) {
  // Verify authorization
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!MODPACK_API_SECRET || token !== MODPACK_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { version, commitSha, changelog } = body;

    if (!version || !commitSha) {
      return NextResponse.json(
        { error: 'Missing required fields: version, commitSha' },
        { status: 400 }
      );
    }

    // Create or update the modpack version
    const modpackVersion = await prisma.modpackVersion.upsert({
      where: { version },
      create: {
        version,
        commitSha,
        changelogMd: changelog || `Release ${version}`,
      },
      update: {
        commitSha,
        changelogMd: changelog || `Release ${version}`,
        releasedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      version: modpackVersion,
    });
  } catch (error) {
    console.error('Error creating modpack version:', error);
    return NextResponse.json(
      { error: 'Failed to create modpack version' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch all versions
export async function GET() {
  try {
    const versions = await prisma.modpackVersion.findMany({
      orderBy: { releasedAt: 'desc' },
    });

    return NextResponse.json(versions);
  } catch (error) {
    console.error('Error fetching modpack versions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch modpack versions' },
      { status: 500 }
    );
  }
}
