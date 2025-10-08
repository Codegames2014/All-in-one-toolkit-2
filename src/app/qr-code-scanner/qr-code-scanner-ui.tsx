
"use client";

import { useState, useRef, useEffect } from "react";
import jsQR from "jsqr";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Camera, CameraOff, Copy, ExternalLink, RefreshCw } from "lucide-react";
import { Dialog, DialogHeader, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export function QRCodeScannerUI() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsScanning(true);
      } catch (error) {
        console.error("Error accessing camera:", error);
        setHasCameraPermission(false);
        toast({
          variant: "destructive",
          title: "Camera Access Denied",
          description: "Please enable camera permissions to use the scanner.",
        });
      }
    };

    getCameraPermission();
    
    // Cleanup function to stop video stream
    return () => {
        if(videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [toast]);

  useEffect(() => {
    let animationFrameId: number;

    const tick = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && isScanning) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (canvas) {
          const context = canvas.getContext("2d");
          if (context) {
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert",
            });

            if (code) {
              setScanResult(code.data);
              setIsScanning(false);
              toast({ title: "QR Code Detected!", description: "Scan successful."});
            }
          }
        }
      }
      if (isScanning) {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    if (isScanning) {
        animationFrameId = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isScanning, toast]);
  
  const resetScanner = () => {
    setScanResult(null);
    setIsScanning(true);
  }

  const copyToClipboard = () => {
    if(scanResult) {
        navigator.clipboard.writeText(scanResult);
        toast({ title: "Copied to clipboard!"});
    }
  }

  const isUrl = (text: string | null): text is string => {
    if (!text) return false;
    try {
        new URL(text);
        return true;
    } catch (_) {
        return false;
    }
  }


  return (
    <div className="w-full h-full">
      <div className="relative w-full h-full bg-black flex items-center justify-center">
          {hasCameraPermission === null && (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Camera className="w-12 h-12" />
                  <p>Requesting camera permission...</p>
              </div>
          )}
           {hasCameraPermission === false && (
              <div className="flex flex-col items-center gap-2 text-destructive">
                  <CameraOff className="w-12 h-12" />
                  <p>Camera access denied.</p>
              </div>
          )}
          <video
              ref={videoRef}
              className={hasCameraPermission ? "w-full h-full object-cover" : "hidden"}
              autoPlay
              muted
              playsInline
          />
           {isScanning && hasCameraPermission && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3/4 max-w-md aspect-square border-4 border-primary/50 rounded-md animate-pulse" />
              </div>
          )}
      </div>
       <canvas ref={canvasRef} style={{ display: 'none' }} />

      <Dialog open={!!scanResult} onOpenChange={(isOpen) => !isOpen && resetScanner()}>
          <DialogContent>
            <DialogHeader>
                <DialogTitle>Scan Result</DialogTitle>
                <CardDescription>The content of the QR code is displayed below.</CardDescription>
            </DialogHeader>
            <div>
              <p className="p-4 bg-muted rounded-md break-words font-mono text-sm">{scanResult}</p>
            </div>
            <DialogFooter className="sm:justify-start gap-2">
                <Button onClick={copyToClipboard} variant="outline"><Copy className="mr-2"/>Copy</Button>
                {isUrl(scanResult) && (
                    <Button asChild>
                        <a href={scanResult} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2"/>Open Link
                        </a>
                    </Button>
                )}
                 <Button onClick={resetScanner}><RefreshCw className="mr-2"/>Scan Again</Button>
            </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}
