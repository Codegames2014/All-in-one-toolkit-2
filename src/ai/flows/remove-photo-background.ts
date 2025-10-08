'use server';

/**
 * @fileOverview AI-powered background removal flow for photos.
 *
 * - removePhotoBackground - A function that accepts an image and removes its background.
 * - RemovePhotoBackgroundInput - The input type for the removePhotoBackground function.
 * - RemovePhotoBackgroundOutput - The return type for the removePhotoBackground function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RemovePhotoBackgroundInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo to remove the background from, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' /* example: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w+gYQQADhlV
      /YMgAAAABJRU5ErkJggg== */
    ),
});
export type RemovePhotoBackgroundInput = z.infer<typeof RemovePhotoBackgroundInputSchema>;

const RemovePhotoBackgroundOutputSchema = z.object({
  backgroundRemovedPhotoDataUri: z
    .string()
    .describe(
      'A photo with the background removed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' /* example: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w+gYQQADhlV
      /YMgAAAABJRU5ErkJggg== */
    ),
});
export type RemovePhotoBackgroundOutput = z.infer<typeof RemovePhotoBackgroundOutputSchema>;

export async function removePhotoBackground(
  input: RemovePhotoBackgroundInput
): Promise<RemovePhotoBackgroundOutput> {
  return removePhotoBackgroundFlow(input);
}

const removePhotoBackgroundPrompt = ai.definePrompt({
  name: 'removePhotoBackgroundPrompt',
  input: {schema: RemovePhotoBackgroundInputSchema},
  output: {schema: RemovePhotoBackgroundOutputSchema},
  prompt: [
    {
      media: {url: '{{photoDataUri}}'},
    },
    {
      text: 'Remove the background from this photo, and return the image as a data URI.',
    },
  ],
  model: 'googleai/gemini-2.5-flash-image-preview',
  config: {
    responseModalities: ['TEXT', 'IMAGE'],
  },
});

const removePhotoBackgroundFlow = ai.defineFlow(
  {
    name: 'removePhotoBackgroundFlow',
    inputSchema: RemovePhotoBackgroundInputSchema,
    outputSchema: RemovePhotoBackgroundOutputSchema,
  },
  async input => {
    const {media} = await removePhotoBackgroundPrompt(input);
    return {backgroundRemovedPhotoDataUri: media!.url!};
  }
);
