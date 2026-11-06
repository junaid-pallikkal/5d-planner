import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { ProjectDocumentSchema } from "@/lib/validation/project-schema";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ projects: [], offline: true });
    }

    const projects = await prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        thumbnail: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("API GET /api/projects error:", error);
    return NextResponse.json({ projects: [], error: "Database offline" }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = ProjectDocumentSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.format() },
        { status: 400 }
      );
    }

    const doc = validated.data;

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ success: true, offline: true, project: doc });
    }

    const saved = await prisma.project.upsert({
      where: { id: doc.id },
      create: {
        id: doc.id,
        name: doc.name,
        description: doc.description,
        settings: doc.settings as any,
        data: doc as any,
      },
      update: {
        name: doc.name,
        description: doc.description,
        settings: doc.settings as any,
        data: doc as any,
      },
    });

    return NextResponse.json({ success: true, project: saved });
  } catch (error) {
    console.error("API POST /api/projects error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
