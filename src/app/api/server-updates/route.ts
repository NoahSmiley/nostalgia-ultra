import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET - Fetch all server updates
export async function GET() {
  try {
    const updates = await db.serverUpdate.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(updates);
  } catch (error) {
    console.error("Error fetching server updates:", error);
    return NextResponse.json(
      { error: "Failed to fetch updates" },
      { status: 500 }
    );
  }
}

// POST - Create a new server update (admin only)
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, changes, isHighlight } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const update = await db.serverUpdate.create({
      data: {
        title,
        description,
        changes: changes || [],
        isHighlight: isHighlight || false,
      },
    });

    return NextResponse.json(update, { status: 201 });
  } catch (error) {
    console.error("Error creating server update:", error);
    return NextResponse.json(
      { error: "Failed to create update" },
      { status: 500 }
    );
  }
}
