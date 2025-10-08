"use server";

import { translateText, type TranslateTextInput } from "@/ai/flows/translate-text";
import { z } from "zod";

const FormSchema = z.object({
  sourceLanguage: z.string(),
  targetLanguage: z.string(),
  text: z.string(),
});

type TranslationResult = {
  success: boolean;
  data?: string;
  error?: string;
};

export async function handleTranslation(
  input: TranslateTextInput
): Promise<TranslationResult> {
  const parsed = FormSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Invalid input." };
  }

  try {
    const { translatedText } = await translateText(parsed.data);
    return { success: true, data: translatedText };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }
}
