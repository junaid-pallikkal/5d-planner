import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { TEMPLATES_LIST } from "@/constants/templates";
import { ProjectDocumentSchema } from "@/lib/validation/project-schema";

interface RouteContext {
  params: Promise<{
    projectId: string;
  }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { projectId } = await params;

    // Check built-in templates first
    const templateMatch = TEMPLATES_LIST.find((t) => t.id === projectId);
    if (templateMatch) {
      return NextResponse.json({ project: templateMatch });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Project not found in server DB" }, { status: 404 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project: project.data });
  } catch (error) {
    console.error("API GET /api/projects/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { projectId } = await params;
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

    const updated = await prisma.project.upsert({
      where: { id: projectId },
      create: {
        id: projectId,
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

    return NextResponse.json({ success: true, project: updated });
  } catch (error) {
    console.error("API PUT /api/projects/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { projectId } = await params;

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ success: true, offline: true });
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API DELETE /api/projects/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
