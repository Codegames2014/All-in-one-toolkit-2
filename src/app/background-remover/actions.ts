"use server";

import { removePhotoBackground } from "@/ai/flows/remove-photo-background";
import { z } from "zod";

const DataUriSchema = z.string().startsWith("data:image/");

type RemovalResult = {
  success: boolean;
  data?: string;
  error?: string;
};

export async function handleBackgroundRemoval(
  photoDataUri: string
): Promise<RemovalResult> {
  const parsed = DataUriSchema.safeParse(photoDataUri);

  if (!parsed.success) {
    return { success: false, error: "Invalid image format provided." };
  }

  try {
    const { backgroundRemovedPhotoDataUri } = await removePhotoBackground({
      photoDataUri,
    });
    return { success: true, data: backgroundRemovedPhotoDataUri };
  } catch (e) {
    console.error(e);
    const errorMessage =
      e instanceof Error ? e.message : "An unknown error occurred during background removal.";
    return { success: false, error: errorMessage };
  }
}
