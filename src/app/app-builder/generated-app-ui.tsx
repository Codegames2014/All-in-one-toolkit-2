"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Check, Clipboard } from "lucide-react";
import { useState } from "react";

export function GeneratedAppUI({ generatedCode }: { generatedCode: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode).then(() => {
      setCopied(true);
      toast({
        title: "Copied to Clipboard",
        description: "You can now paste the code into your new file.",
      });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative">
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-4 right-4 z-10"
        onClick={copyToClipboard}
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Clipboard className="h-4 w-4" />
        )}
        <span className="sr-only">Copy Code</span>
      </Button>
      <ScrollArea className="h-96 rounded-md border bg-muted">
        <pre className="p-4 text-sm">
          <code>{generatedCode}</code>
        </pre>
      </ScrollArea>
    </div>
  );
}
