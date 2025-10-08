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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { handleCodeConversion } from "./actions";
import { ArrowRightLeft, Loader2, Clipboard, Check } from "lucide-react";

const languages = [
  "JavaScript", "Python", "Java", "C++", "TypeScript", "Go", "Ruby", "PHP", "Swift", "Kotlin", "Rust", "HTML", "CSS"
];

export function CodeConverterUI() {
  const [sourceLanguage, setSourceLanguage] = useState("JavaScript");
  const [targetLanguage, setTargetLanguage] = useState("Python");
  const [sourceCode, setSourceCode] = useState("");
  const [convertedCode, setConvertedCode] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const onConvert = () => {
    if (!sourceCode || !sourceLanguage || !targetLanguage) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill in all fields to convert the code.",
      });
      return;
    }
    startTransition(async () => {
      setConvertedCode("");
      const result = await handleCodeConversion({
        sourceLanguage,
        targetLanguage,
        sourceCode,
      });
      if (result.success && result.data) {
        setConvertedCode(result.data);
      } else {
        toast({
          variant: "destructive",
          title: "Conversion Failed",
          description: result.error,
        });
      }
    });
  };
  
  const swapLanguages = () => {
    const tempLang = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(tempLang);
  };
  
  const copyToClipboard = () => {
    if (!convertedCode) return;
    navigator.clipboard.writeText(convertedCode).then(() => {
      setCopied(true);
      toast({
        title: "Copied to Clipboard",
        description: "The converted code has been copied.",
      });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Convert Code</CardTitle>
          <CardDescription>
            Select the source and target languages, paste your code, and let the AI convert it for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div className="space-y-2">
              <Label htmlFor="source-lang">From</Label>
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger id="source-lang">
                  <SelectValue placeholder="Source Language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={`source-${lang}`} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="ghost" size="icon" className="self-end" onClick={swapLanguages}>
              <ArrowRightLeft className="h-5 w-5" />
            </Button>
            <div className="space-y-2">
              <Label htmlFor="target-lang">To</Label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger id="target-lang">
                  <SelectValue placeholder="Target Language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={`target-${lang}`} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source-code">Source Code</Label>
              <Textarea
                id="source-code"
                placeholder={`Enter ${sourceLanguage} code here...`}
                value={sourceCode}
                onChange={(e) => setSourceCode(e.target.value)}
                className="min-h-[300px] font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="converted-code">Converted Code</Label>
               <div className="relative">
                 <ScrollArea className="h-[300px] w-full rounded-md border bg-muted font-mono">
                    <pre className="p-4 text-sm">
                        <code>{isPending ? "Converting..." : convertedCode}</code>
                    </pre>
                 </ScrollArea>
                  {convertedCode && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2 z-10"
                      onClick={copyToClipboard}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clipboard className="h-4 w-4" />
                      )}
                    </Button>
                  )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button onClick={onConvert} disabled={isPending || !sourceCode}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Converting...
            </>
          ) : (
            "Convert Code"
          )}
        </Button>
      </div>
    </div>
  );
}
