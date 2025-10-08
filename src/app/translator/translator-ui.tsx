"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { handleTranslation } from "./actions";
import { useState, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { ArrowRightLeft, Loader2 } from "lucide-react";

const languages = [
  "English", "Spanish", "French", "German", "Mandarin", "Japanese", "Korean", "Russian", "Arabic", "Hindi"
];

const FormSchema = z.object({
  sourceLanguage: z.string().min(1, "Please select a source language."),
  targetLanguage: z.string().min(1, "Please select a target language."),
  text: z.string().min(1, "Please enter text to translate."),
});

type FormValues = z.infer<typeof FormSchema>;

export function TranslatorUI() {
  const [translatedText, setTranslatedText] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      sourceLanguage: "English",
      targetLanguage: "Spanish",
      text: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    startTransition(async () => {
      const result = await handleTranslation(data);
      if (result.success) {
        setTranslatedText(result.data!);
      } else {
        toast({
          variant: "destructive",
          title: "Translation Failed",
          description: result.error,
        });
      }
    });
  };

  const swapLanguages = () => {
    const source = form.getValues("sourceLanguage");
    const target = form.getValues("targetLanguage");
    form.setValue("sourceLanguage", target);
    form.setValue("targetLanguage", source);
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
                <FormField
                    control={form.control}
                    name="sourceLanguage"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>From</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Select a source language" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {languages.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="text"
                    render={({ field }) => (
                    <FormItem>
                        <FormControl>
                        <Textarea
                            placeholder="Enter text to translate..."
                            className="min-h-[200px] resize-y"
                            {...field}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            
            <div className="space-y-4">
                <FormField
                    control={form.control}
                    name="targetLanguage"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>To</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Select a target language" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {languages.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <Card className="min-h-[208px] bg-muted">
                    <CardContent className="p-4">
                        <p className="whitespace-pre-wrap">{translatedText || "Translation will appear here."}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
        <div className="flex justify-center items-center gap-4">
            <Button type="submit" disabled={isPending} className="min-w-[150px] bg-accent text-accent-foreground hover:bg-accent/90">
            {isPending ? (
                <Loader2 className="animate-spin" />
            ) : (
                "Translate"
            )}
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={swapLanguages}>
                <ArrowRightLeft />
                <span className="sr-only">Swap languages</span>
            </Button>
        </div>
      </form>
    </Form>
  );
}
