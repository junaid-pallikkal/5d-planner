import React from "react";
import { EditorWorkspace } from "@/features/editor/editor-workspace";

interface EditorPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { projectId } = await params;

  return <EditorWorkspace projectId={projectId} />;
}
