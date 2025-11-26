import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const versions = await prisma.modpackVersion.findMany({
      orderBy: { releasedAt: 'desc' },
      take: 10,
    });

    // Transform to the format expected by the frontend
    const formattedVersions = versions.map(v => ({
      name: `Version ${v.version}`,
      version: v.version,
      date: v.releasedAt.toISOString(),
      changes: v.changelogMd.split('\n').filter(line => line.trim().startsWith('-')).map(line => line.replace(/^-\s*/, '')),
      changelogMd: v.changelogMd,
    }));

    return NextResponse.json(formattedVersions);
  } catch (error) {
    console.error('Failed to fetch modpack versions:', error);
    return NextResponse.json([]);
  }
}
