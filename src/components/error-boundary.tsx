"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class CADErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("CAD Engine Error Caught:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 h-full w-full flex flex-col items-center justify-center bg-[#090d16] text-foreground p-6 select-none">
          <div className="max-w-md w-full p-6 rounded-2xl border border-destructive/30 bg-destructive/5 backdrop-blur-xl flex flex-col items-center text-center space-y-4 shadow-2xl">
            <div className="h-12 w-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold tracking-tight text-foreground">
                {this.props.fallbackTitle || "Architectural Engine Notice"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-3 font-mono">
                {this.state.error?.message || "An issue occurred while rendering the CAD workspace."}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-xs space-x-1.5"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retry Rendering</span>
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
