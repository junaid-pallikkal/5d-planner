import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { TEMPLATES_LIST } from "@/constants/templates";

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
