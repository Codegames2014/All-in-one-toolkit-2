"use server";

import { buildApp, type BuildAppInput, type BuildAppOutput } from "@/ai/flows/build-app";
import { z } from "zod";

const FormSchema = z.object({
  prompt: z.string().min(10, "Prompt must be at least 10 characters long."),
  features: z.array(z.string()).optional(),
});

type BuildResult = {
  success: boolean;
  data?: BuildAppOutput;
  error?: string;
};

export async function handleAppGeneration(
  input: BuildAppInput
): Promise<BuildResult> {
  const parsed = FormSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Invalid input provided." };
  }

  try {
    const result = await buildApp(parsed.data);
    return { success: true, data: result };
  } catch (e) {
    console.error(e);
    const errorMessage =
      e instanceof Error ? e.message : "An unknown error occurred during app generation.";
    return { success: false, error: errorMessage };
  }
}
