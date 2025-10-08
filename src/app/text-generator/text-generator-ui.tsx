"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { handleTextGeneration } from "./actions";
import { useState, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const FormSchema = z.object({
  prompt: z
    .string()
    .min(10, "Please enter a prompt of at least 10 characters."),
});

type FormValues = z.infer<typeof FormSchema>;

export function TextGeneratorUI() {
  const [generatedText, setGeneratedText] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    startTransition(async () => {
        setGeneratedText("");
      const result = await handleTextGeneration(data);
      if (result.success) {
        setGeneratedText(result.data!);
      } else {
        toast({
          variant: "destructive",
          title: "Generation Failed",
          description: result.error,
        });
      }
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Your Prompt</CardTitle>
              <CardDescription>
                Describe what you want the AI to write. Be as specific as you
                can.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder='e.g., "Write a short, optimistic poem about the sunrise."'
                        className="min-h-[200px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Generate Text"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      <Card className="bg-muted">
        <CardHeader>
          <CardTitle>Generated Text</CardTitle>
          <CardDescription>The AI's response will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          {isPending && !generatedText && (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          <p className="whitespace-pre-wrap">{generatedText}</p>
        </CardContent>
      </Card>
    </div>
  );
}
