"use server";

import { convertCode, type ConvertCodeInput } from "@/ai/flows/convert-code";
import { z } from "zod";

const FormSchema = z.object({
  sourceLanguage: z.string().min(1, "Please select a source language."),
  targetLanguage: z.string().min(1, "Please select a target language."),
  sourceCode: z.string().min(1, "Please enter code to convert."),
});

type ConversionResult = {
  success: boolean;
  data?: string;
  error?: string;
};

export async function handleCodeConversion(
  input: ConvertCodeInput
): Promise<ConversionResult> {
  const parsed = FormSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Invalid input." };
  }

  try {
    const { convertedCode } = await convertCode(parsed.data);
    return { success: true, data: convertedCode };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }
}
