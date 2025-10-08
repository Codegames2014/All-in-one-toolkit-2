"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export function PhotoEditorUI() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturate: 100,
    grayscale: 0,
    sepia: 0,
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleFilterChange = (filterName: keyof typeof filters) => (value: number[]) => {
      setFilters(prev => ({...prev, [filterName]: value[0]}));
  }

  const resetFilters = () => {
    setFilters({
        brightness: 100,
        contrast: 100,
        saturate: 100,
        grayscale: 0,
        sepia: 0,
    })
  }

  const imageStyle = {
    filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%)`
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <Card className="md:col-span-1">
        <CardContent className="p-6 space-y-6">
            <div>
              <Label htmlFor="picture" className="mb-2 block">Upload Image</Label>
              <Input id="picture" type="file" accept="image/*" onChange={handleImageUpload} />
            </div>
          <div className="space-y-4">
            <div>
                <Label>Brightness ({filters.brightness}%)</Label>
                <Slider value={[filters.brightness]} max={200} step={1} onValueChange={handleFilterChange('brightness')} />
            </div>
            <div>
                <Label>Contrast ({filters.contrast}%)</Label>
                <Slider value={[filters.contrast]} max={200} step={1} onValueChange={handleFilterChange('contrast')} />
            </div>
            <div>
                <Label>Saturation ({filters.saturate}%)</Label>
                <Slider value={[filters.saturate]} max={200} step={1} onValueChange={handleFilterChange('saturate')} />
            </div>
            <div>
                <Label>Grayscale ({filters.grayscale}%)</Label>
                <Slider value={[filters.grayscale]} max={100} step={1} onValueChange={handleFilterChange('grayscale')} />
            </div>
            <div>
                <Label>Sepia ({filters.sepia}%)</Label>
                <Slider value={[filters.sepia]} max={100} step={1} onValueChange={handleFilterChange('sepia')} />
            </div>
          </div>
          <Button onClick={resetFilters} variant="secondary" className="w-full">Reset Filters</Button>
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardContent className="p-6 flex items-center justify-center h-full min-h-[400px]">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt="Uploaded for editing"
              width={500}
              height={500}
              className="max-w-full max-h-[60vh] object-contain transition-all"
              style={imageStyle}
            />
          ) : (
            <div className="text-center text-muted-foreground">
                <Upload className="mx-auto h-12 w-12" />
                <p className="mt-2">Upload an image to start editing</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
