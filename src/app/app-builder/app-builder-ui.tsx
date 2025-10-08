"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { tools } from "@/lib/tools";
import { Wand2, Loader2 } from "lucide-react";
import { handleAppGeneration } from "./actions";
import { GeneratedAppUI } from "./generated-app-ui";
import { useToast } from "@/hooks/use-toast";

export function AppBuilderUI() {
  const [prompt, setPrompt] = useState(
    "A simple app to calculate tips and split bills between friends. It should have a clean interface and allow for custom tip percentages."
  );
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const availableFeatures = tools.filter(
    (tool) => tool.href !== "/" && tool.href !== "/coming-soon" && tool.href !== "/app-builder"
  );

  const handleFeatureToggle = (featureName: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureName)
        ? prev.filter((f) => f !== featureName)
        : [...prev, featureName]
    );
  };

  const handleGenerateApp = async () => {
    setIsPending(true);
    setGeneratedCode(null);

    try {
      const result = await handleAppGeneration({
        prompt,
        features: selectedFeatures,
      });

      if (result.success && result.data) {
        setGeneratedCode(result.data.code);
      } else {
        toast({
          variant: "destructive",
          title: "App Generation Failed",
          description: result.error,
        });
      }
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "An Unexpected Error Occurred",
        description: "Please check the console for more details.",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>1. Describe Your App</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g., 'A simple app to calculate tips and split bills between friends. It should have a clean interface and allow for custom tip percentages.'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[150px]"
            disabled={isPending}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Select Features to Include (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {availableFeatures.map((tool) => {
            const Icon = tool.icon;
            return (
              <Label
                key={tool.name}
                className={`relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 transition-colors hover:bg-accent hover:text-accent-foreground ${
                  selectedFeatures.includes(tool.name)
                    ? "border-primary bg-accent text-accent-foreground"
                    : ""
                } ${isPending ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              >
                <Checkbox
                  className="absolute top-2 left-2"
                  checked={selectedFeatures.includes(tool.name)}
                  onCheckedChange={() => handleFeatureToggle(tool.name)}
                  disabled={isPending}
                />
                <Icon className="h-8 w-8" />
                <span className="text-center text-sm font-medium">
                  {tool.name}
                </span>
              </Label>
            );
          })}
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleGenerateApp} disabled={isPending || !prompt}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating App...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate App
            </>
          )}
        </Button>
      </div>

      {(isPending || generatedCode) && (
        <Card>
            <CardHeader>
                <CardTitle>3. Generated App Code</CardTitle>
            </CardHeader>
            <CardContent>
                {isPending && !generatedCode && (
                    <div className="flex flex-col items-center justify-center gap-4 p-8">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-muted-foreground">The AI is building your app, this may take a moment...</p>
                    </div>
                )}
                {generatedCode && (
                    <GeneratedAppUI generatedCode={generatedCode} />
                )}
            </CardContent>
        </Card>
      )}
    </div>
  );
}
