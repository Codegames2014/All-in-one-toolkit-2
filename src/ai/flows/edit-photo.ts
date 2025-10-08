'use server';

/**
 * @fileOverview AI-powered photo editing flow.
 *
 * - editPhoto - A function that accepts an image and a text prompt to edit the image.
 * - EditPhotoInput - The input type for the editPhoto function.
 * - EditPhotoOutput - The return type for the editPhoto function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EditPhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to edit, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  prompt: z.string().describe('The text prompt describing the desired edits.'),
});
export type EditPhotoInput = z.infer<typeof EditPhotoInputSchema>;

const EditPhotoOutputSchema = z.object({
  editedPhotoDataUri: z
    .string()
    .describe(
      'The edited photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type EditPhotoOutput = z.infer<typeof EditPhotoOutputSchema>;

export async function editPhoto(input: EditPhotoInput): Promise<EditPhotoOutput> {
  return editPhotoFlow(input);
}

const editPhotoFlow = ai.defineFlow(
  {
    name: 'editPhotoFlow',
    inputSchema: EditPhotoInputSchema,
    outputSchema: EditPhotoOutputSchema,
  },
  async ({photoDataUri, prompt}) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: [
        {media: {url: photoDataUri}},
        {text: prompt},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('The model did not return an image.');
    }
    return {editedPhotoDataUri: media.url};
  }
);
