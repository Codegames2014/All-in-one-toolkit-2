"use client";

import { useState, useTransition } from "react";
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
import { handleFileConversion } from "./actions";
import { Loader2, Upload, Download, FileType, AlertCircle } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";

const targetFormats = ["PNG", "JPEG", "WEBP", "PDF"];

export function FileConverterUI() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState("PNG");
  const [convertedFileUri, setConvertedFileUri] = useState<string | null>(null);
  const [convertedFilename, setConvertedFilename] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload a file smaller than 4MB.",
        });
        return;
      }
      setSourceFile(file);
      setConvertedFileUri(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        setSourcePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onConvert = () => {
    if (!sourceFile || !sourcePreview || !targetFormat) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please upload a file and select a target format.",
      });
      return;
    }

    startTransition(async () => {
      const result = await handleFileConversion({
        fileDataUri: sourcePreview,
        targetFormat,
      });

      if (result.success && result.data) {
        setConvertedFileUri(result.data.convertedFileDataUri);
        setConvertedFilename(result.data.filename);
      } else {
        toast({
          variant: "destructive",
          title: "Conversion Failed",
          description: result.error,
        });
      }
    });
  };
  
  const downloadFile = () => {
    if (!convertedFileUri || !convertedFilename) return;
    const link = document.createElement("a");
    link.href = convertedFileUri;
    link.download = convertedFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="space-y-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>This tool is experimental and may not work with all file types.</AlertTitle>
      </Alert>
      <Card>
        <CardHeader>
          <CardTitle>File Converter</CardTitle>
          <CardDescription>
            Upload a file, choose the format you want to convert it to, and let the AI handle the rest.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="file-upload">1. Upload File</Label>
              <Input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">Max file size: 4MB.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-format">2. Convert To</Label>
              <Select value={targetFormat} onValueChange={setTargetFormat} disabled={isPending}>
                <SelectTrigger id="target-format">
                  <SelectValue placeholder="Target Format" />
                </SelectTrigger>
                <SelectContent>
                  {targetFormats.map((format) => (
                    <SelectItem key={format} value={format}>
                      {format}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-center pt-4">
             <Button onClick={onConvert} disabled={isPending || !sourceFile}>
                {isPending ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Converting...
                    </>
                ) : (
                    "3. Convert File"
                )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {convertedFileUri && (
        <Card>
            <CardHeader>
                <CardTitle>Conversion Complete</CardTitle>
                <CardDescription>Your converted file is ready for download.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 text-center">
                 <FileType className="w-16 h-16 text-primary" />
                 <p className="font-semibold">{convertedFilename}</p>
                 <Button onClick={downloadFile}>
                    <Download className="mr-2" />
                    Download File
                </Button>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
