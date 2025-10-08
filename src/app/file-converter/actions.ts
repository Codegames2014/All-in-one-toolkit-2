"use server";

import { convertFile, type ConvertFileInput } from "@/ai/flows/convert-file";
import { z } from "zod";

const FormSchema = z.object({
  fileDataUri: z.string().startsWith("data:"),
  targetFormat: z.string().min(1, "Please select a target format."),
});

type ConversionResult = {
  success: boolean;
  data?: {
    convertedFileDataUri: string;
    filename: string;
  };
  error?: string;
};

export async function handleFileConversion(
  input: ConvertFileInput
): Promise<ConversionResult> {
  const parsed = FormSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Invalid input." };
  }

  try {
    const result = await convertFile(parsed.data);
    return { success: true, data: result };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }
}
