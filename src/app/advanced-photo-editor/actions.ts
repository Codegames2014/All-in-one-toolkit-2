"use server";

import { editPhoto, type EditPhotoInput } from "@/ai/flows/edit-photo";
import { z } from "zod";

const FormSchema = z.object({
  photoDataUri: z.string().startsWith("data:image/"),
  prompt: z.string().min(3, "Prompt must be at least 3 characters long."),
});

type EditResult = {
  success: boolean;
  data?: string;
  error?: string;
};

export async function handlePhotoEdit(
  input: EditPhotoInput
): Promise<EditResult> {
  const parsed = FormSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Invalid input provided." };
  }

  try {
    const { editedPhotoDataUri } = await editPhoto(parsed.data);
    return { success: true, data: editedPhotoDataUri };
  } catch (e) {
    console.error(e);
    const errorMessage =
      e instanceof Error ? e.message : "An unknown error occurred during the edit.";
    return { success: false, error: errorMessage };
  }
}
