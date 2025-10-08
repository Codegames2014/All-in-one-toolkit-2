"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- Color Conversion Utilities ---

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    s /= 100;
    l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => `0${c.toString(16)}`.slice(-2);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, v = max;
    const d = max - min;
    s = max === 0 ? 0 : d / max;
    if (max !== min) {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)];
}

function rgbToCmyk(r: number, g: number, b: number): [number, number, number, number] {
    r /= 255; g /= 255; b /= 255;
    const k = 1 - Math.max(r, g, b);
    if (k === 1) return [0, 0, 0, 100];
    const c = (1 - r - k) / (1 - k);
    const m = (1 - g - k) / (1 - k);
    const y = (1 - b - k) / (1 - k);
    return [Math.round(c * 100), Math.round(m * 100), Math.round(y * 100), Math.round(k * 100)];
}

const ColorInfoBox = ({ label, value }: { label: string; value: string }) => {
    const { toast } = useToast();
    const copyToClipboard = () => {
        navigator.clipboard.writeText(value);
        toast({ title: "Copied!", description: `${label}: ${value}` });
    };
    return (
        <Card className="p-3 text-center cursor-pointer hover:bg-muted" onClick={copyToClipboard}>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-mono font-semibold">{value}</p>
        </Card>
    );
};


export function ColorPickerUI() {
  const [hue, setHue] = useState(181);
  const [saturation, setSaturation] = useState(54);
  const [lightness, setLightness] = useState(43);
  const { toast } = useToast();

  const saturationCanvasRef = useRef<HTMLCanvasElement>(null);

  const [rgb, hex] = useMemo(() => {
    const [r, g, b] = hslToRgb(hue, saturation, lightness);
    return [[r, g, b], rgbToHex(r, g, b)];
  }, [hue, saturation, lightness]);
  
  const [hsv, cmyk] = useMemo(() => {
      const [r, g, b] = rgb;
      return [rgbToHsv(r,g,b), rgbToCmyk(r,g,b)];
  }, [rgb])

  const drawSaturationCanvas = useCallback(() => {
    const canvas = saturationCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const { width, height } = canvas;

    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.fillRect(0, 0, width, height);

    const whiteGradient = ctx.createLinearGradient(0, 0, width, 0);
    whiteGradient.addColorStop(0, "rgba(255,255,255,1)");
    whiteGradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = whiteGradient;
    ctx.fillRect(0, 0, width, height);

    const blackGradient = ctx.createLinearGradient(0, 0, 0, height);
    blackGradient.addColorStop(0, "rgba(0,0,0,0)");
    blackGradient.addColorStop(1, "rgba(0,0,0,1)");
    ctx.fillStyle = blackGradient;
    ctx.fillRect(0, 0, width, height);
  }, [hue]);

  useEffect(() => {
    drawSaturationCanvas();
  }, [hue, drawSaturationCanvas]);

  const handleCanvasInteraction = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = saturationCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = Math.min(Math.max(0, clientX - rect.left), rect.width);
    const y = Math.min(Math.max(0, clientY - rect.top), rect.height);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imageData = ctx.getImageData(x, y, 1, 1).data;
    const [h, s, l] = rgbToHsl(imageData[0], imageData[1], imageData[2]);

    setHue(h);
    setSaturation(s);
    setLightness(l);
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
      handleCanvasInteraction(e);
      const onMouseMove = (moveEvent: MouseEvent) => handleCanvasInteraction(moveEvent as any);
      const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
      };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
  };
  
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
      handleCanvasInteraction(e);
      const onTouchMove = (moveEvent: TouchEvent) => handleCanvasInteraction(moveEvent as any);
      const onTouchEnd = () => {
          document.removeEventListener('touchmove', onTouchMove);
          document.removeEventListener('touchend', onTouchEnd);
      };
      document.addEventListener('touchmove', onTouchMove);
      document.addEventListener('touchend', onTouchEnd);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!", description: `${label}: ${text}` });
  };

  return (
    <div className="space-y-6">
       <Card>
           <CardContent className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-[100px_1fr] gap-4">
               <div className="w-full md:w-[100px] h-[100px] md:h-full rounded-md border" style={{ backgroundColor: hex }} />
               <div className="flex flex-col gap-4">
                    <div className="relative w-full h-48 cursor-crosshair rounded-md overflow-hidden">
                       <canvas 
                          ref={saturationCanvasRef} 
                          width="300" height="200" 
                          className="w-full h-full"
                          onMouseDown={handleMouseDown}
                          onTouchStart={handleTouchStart}
                        />
                         <div
                            className="absolute w-4 h-4 rounded-full border-2 border-white pointer-events-none"
                            style={{ 
                                left: `${(saturation / 100) * 100}%`, // Approximation
                                top: `${(1 - (lightness / 100)) * 100}%`, // Approximation
                                transform: 'translate(-50%, -50%)',
                                mixBlendMode: 'difference'
                            }}
                        />
                    </div>
                    <div>
                        <Slider
                            value={[hue]}
                            max={360}
                            step={1}
                            onValueChange={(v) => setHue(v[0])}
                            className="[&>span]:bg-transparent [&>span>span]:h-5 [&>span>span]:w-5"
                            style={{background: 'linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)'}}
                        />
                    </div>
               </div>
           </CardContent>
       </Card>
        <Card>
            <CardContent className="p-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="md:col-span-1 p-3 flex flex-col justify-center gap-2">
                     <Label htmlFor="hex-input">HEX</Label>
                    <div className="flex items-center gap-2">
                        <Input id="hex-input" value={hex} readOnly className="font-mono"/>
                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(hex, "HEX")}><Copy className="w-4 h-4"/></Button>
                    </div>
                </div>
                <ColorInfoBox label="RGB" value={`${rgb[0]}, ${rgb[1]}, ${rgb[2]}`} />
                <ColorInfoBox label="HSL" value={`${hue}°, ${saturation}%, ${lightness}%`} />
                <ColorInfoBox label="HSV" value={`${hsv[0]}°, ${hsv[1]}%, ${hsv[2]}%`} />
                <ColorInfoBox label="CMYK" value={`${cmyk[0]}%, ${cmyk[1]}%, ${cmyk[2]}%, ${cmyk[3]}%`} />
            </CardContent>
        </Card>
    </div>
  );
}
