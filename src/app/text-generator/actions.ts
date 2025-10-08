"use server";

import { generateTextFormats, type GenerateTextFormatsInput } from "@/ai/flows/generate-text-formats";
import { z } from "zod";

const FormSchema = z.object({
  prompt: z.string(),
});

type GenerationResult = {
  success: boolean;
  data?: string;
  error?: string;
};

export async function handleTextGeneration(
  input: GenerateTextFormatsInput
): Promise<GenerationResult> {
  const parsed = FormSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Invalid input." };
  }

  try {
    const { text } = await generateTextFormats(parsed.data);
    return { success: true, data: text };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }
}
