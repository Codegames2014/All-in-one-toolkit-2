"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { handleLogoGeneration } from "./actions";
import type { GenerateLogoInput } from "@/ai/flows/generate-logo";
import { Download, Loader2, Wand2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const logoStyles = ["Minimalist", "Modern", "Vintage", "Abstract", "Funky", "Geometric", "Hand-drawn"];
const colorPreferences = ["Vibrant", "Pastel", "Monochrome", "Earthy Tones", "Cool Tones", "Warm Tones"];

export function LogoGeneratorUI() {
  const [formData, setFormData] = useState<GenerateLogoInput>({
    text: "",
    style: "Modern",
    color: "Vibrant",
  });
  const [generatedLogos, setGeneratedLogos] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleSelectChange = (name: 'style' | 'color') => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onGenerate = () => {
    if (!formData.text) {
      toast({
        variant: "destructive",
        title: "Missing Text",
        description: "Please enter the text for your logo.",
      });
      return;
    }

    startTransition(async () => {
      setGeneratedLogos([]);
      const promises = Array(4)
        .fill(null)
        .map(() => handleLogoGeneration(formData));

      const results = await Promise.all(promises);
      const successfulCreations = results
        .filter((r) => r.success && r.data)
        .map((r) => r.data!);

      if (successfulCreations.length > 0) {
        setGeneratedLogos(successfulCreations);
      } else {
        toast({
          variant: "destructive",
          title: "Generation Failed",
          description: results[0]?.error || "An unknown error occurred.",
        });
      }
    });
  };

  const downloadImage = (dataUri: string) => {
    const link = document.createElement("a");
    link.href = dataUri;
    link.download = "generated-logo.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Describe Your Logo</CardTitle>
          <CardDescription>
            Provide details about your brand, and the AI will generate logo
            concepts for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="text">Logo Text</Label>
            <Input
              id="text"
              name="text"
              placeholder='e.g., "Innovate AI" or "The Daily Grind"'
              value={formData.text}
              onChange={handleInputChange}
              disabled={isPending}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="style">Style</Label>
              <Select name="style" value={formData.style} onValueChange={handleSelectChange('style')} disabled={isPending}>
                <SelectTrigger id="style">
                  <SelectValue placeholder="Select a style" />
                </SelectTrigger>
                <SelectContent>
                  {logoStyles.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color Preference</Label>
               <Select name="color" value={formData.color} onValueChange={handleSelectChange('color')} disabled={isPending}>
                <SelectTrigger id="color">
                  <SelectValue placeholder="Select colors" />
                </SelectTrigger>
                <SelectContent>
                  {colorPreferences.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
           <div className="flex justify-end">
            <Button
              onClick={onGenerate}
              disabled={isPending || !formData.text}
              className="w-full md:w-auto"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Logos
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {(isPending || generatedLogos.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Logos</CardTitle>
            <CardDescription>Click on a logo to download it.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {isPending &&
                generatedLogos.length === 0 &&
                Array(4)
                  .fill(null)
                  .map((_, i) => (
                    <Skeleton key={i} className="w-full aspect-square rounded-lg" />
                  ))}
              {generatedLogos.map((logo, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer"
                  onClick={() => downloadImage(logo)}
                >
                  <Image
                    src={logo}
                    alt={`Generated Logo ${index + 1}`}
                    width={250}
                    height={250}
                    className="w-full h-auto object-contain rounded-lg border bg-white"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Download className="h-8 w-8 text-white" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
