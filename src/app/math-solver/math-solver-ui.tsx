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
import { Input } from "@/components/ui/input";
import { handleMathProblem } from "./actions";
import { useState, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const FormSchema = z.object({
  problem: z.string().min(3, "Please enter a valid math problem."),
});

type FormValues = z.infer<typeof FormSchema>;

export function MathSolverUI() {
  const [solution, setSolution] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      problem: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    startTransition(async () => {
      setSolution("");
      const result = await handleMathProblem(data);
      if (result.success) {
        setSolution(result.data!);
      } else {
        toast({
          variant: "destructive",
          title: "Solver Failed",
          description: result.error,
        });
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Math Problem</CardTitle>
              <CardDescription>
                Enter an equation or a word problem for the AI to solve.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="problem"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder='e.g., "Solve for x: 2x + 5 = 15" or "What is 15% of 200?"'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isPending} className="w-full md:w-auto">
                {isPending ? <Loader2 className="animate-spin" /> : "Solve Problem"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {(isPending || solution) && (
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Solution</CardTitle>
            <CardDescription>
              The AI-powered step-by-step solution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isPending && !solution && (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{solution}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
