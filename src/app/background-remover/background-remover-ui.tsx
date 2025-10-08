"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { handleBackgroundRemoval } from "./actions";
import { Download, Loader2, Upload, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function BackgroundRemoverUI() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if(file.size > 4 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'Please upload an image smaller than 4MB.'
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target?.result as string);
        setProcessedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const onRemoveBackground = () => {
    if (!originalImage) {
      toast({
        variant: "destructive",
        title: "No Image",
        description: "Please upload an image first.",
      });
      return;
    }

    startTransition(async () => {
      const result = await handleBackgroundRemoval(originalImage);
      if (result.success && result.data) {
        setProcessedImage(result.data);
      } else {
        toast({
          variant: "destructive",
          title: "Processing Failed",
          description: result.error,
        });
      }
    });
  };
  
  const downloadImage = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = 'background-removed.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-8">
        <Card>
            <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 space-y-2">
                    <Label htmlFor="image-upload">1. Upload your image</Label>
                    <Input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} disabled={isPending}/>
                    <p className="text-xs text-muted-foreground">Max file size: 4MB. PNG, JPG, WEBP accepted.</p>
                </div>
                <Button onClick={onRemoveBackground} disabled={isPending || !originalImage}>
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        "2. Remove Background"
                    )}
                </Button>
            </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-2 text-center">
                <h3 className="font-semibold">Original</h3>
                <Card className="min-h-[300px] flex items-center justify-center">
                    <CardContent className="p-2">
                    {originalImage ? (
                        <Image src={originalImage} alt="Original" width={400} height={400} className="max-w-full h-auto object-contain rounded-md" />
                    ) : (
                        <div className="text-muted-foreground flex flex-col items-center">
                            <Upload className="h-12 w-12"/>
                            <p>Upload an image to begin</p>
                        </div>
                    )}
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-2 text-center">
                <h3 className="font-semibold">Background Removed</h3>
                 <Card className="min-h-[300px] flex items-center justify-center">
                    <CardContent className="p-2 relative">
                    {isPending && <Skeleton className="w-[400px] h-[400px] max-w-full" />}
                    {!isPending && processedImage && (
                        <>
                            <Image src={processedImage} alt="Background removed" width={400} height={400} className="max-w-full h-auto object-contain rounded-md" />
                            <Button size="icon" className="absolute top-4 right-4" onClick={downloadImage}>
                                <Download className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                    {!isPending && !processedImage && (
                         <div className="text-muted-foreground flex flex-col items-center">
                            <ArrowRight className="h-12 w-12"/>
                            <p>Result will appear here</p>
                        </div>
                    )}
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
