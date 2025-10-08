"use client";

import { Bot } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

export function LoadingScreen() {
  const [progress, setProgress] = useState(13)
 
  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500)
    const timer2 = setTimeout(() => setProgress(100), 1200)
    return () => {
        clearTimeout(timer);
        clearTimeout(timer2);
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[101] flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 w-64">
        <div className="relative h-16 w-16">
            <Bot className="absolute inset-0 h-16 w-16 animate-pulse text-primary/50" />
            <Bot className="absolute inset-0 h-16 w-16 animate-ping text-primary" />
        </div>
        <p className="text-muted-foreground animate-pulse">Loading Toolkit...</p>
        <Progress value={progress} className="w-full mt-4" />
      </div>
    </div>
  );
}
