"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Download, Loader2 } from "lucide-react";

export function DownloaderUI({ service }: { service: string }) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDownload = () => {
    if (!url) {
      toast({
        variant: "destructive",
        title: "No URL",
        description: `Please enter a ${service} URL.`,
      });
      return;
    }
    
    setIsLoading(true);
    // NOTE: Actual download logic is not implemented due to policy restrictions.
    // This is a placeholder UI.
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Functionality Not Implemented",
        description: `The video download feature for ${service} is for demonstration purposes only.`,
      });
    }, 2000);
  };

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="capitalize">{service} Downloader</CardTitle>
        <CardDescription>Enter the URL of the video you want to download.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="url-input">Video URL</Label>
          <Input 
            id="url-input" 
            placeholder={`https://${service}.com/watch?v=...`}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
            />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleDownload} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Fetching...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
