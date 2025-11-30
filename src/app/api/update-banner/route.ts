import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET - Fetch the latest update for the banner
export async function GET() {
  try {
    // Get the most recent highlighted update from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const latestUpdate = await prisma.serverUpdate.findFirst({
      where: {
        isHighlight: true,
        createdAt: { gte: sevenDaysAgo },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!latestUpdate) {
      return NextResponse.json({ show: false });
    }

    return NextResponse.json({
      show: true,
      id: latestUpdate.id,
      title: latestUpdate.title,
      message: latestUpdate.description,
    });
  } catch (error) {
    console.error("Error fetching update banner:", error);
    return NextResponse.json({ show: false });
  }
}
