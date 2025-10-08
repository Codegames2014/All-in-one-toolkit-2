"use server";

import { generateLogo, type GenerateLogoInput } from "@/ai/flows/generate-logo";
import { z } from "zod";

const FormSchema = z.object({
  text: z.string().min(1, "Logo text cannot be empty."),
  style: z.string(),
  color: z.string(),
});

type GenerateResult = {
  success: boolean;
  data?: string;
  error?: string;
};

export async function handleLogoGeneration(
  input: GenerateLogoInput
): Promise<GenerateResult> {
  const parsed = FormSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Invalid input provided." };
  }

  try {
    const { logoDataUri } = await generateLogo(parsed.data);
    return { success: true, data: logoDataUri };
  } catch (e) {
    console.error(e);
    const errorMessage =
      e instanceof Error ? e.message : "An unknown error occurred during logo generation.";
    return { success: false, error: errorMessage };
  }
}
