'use server';

/**
 * @fileOverview An AI agent for converting files from one format to another.
 *
 * - convertFile - A function that handles the file conversion process.
 * - ConvertFileInput - The input type for the convertFile function.
 * - ConvertFileOutput - The return type for the convertFile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConvertFileInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "The file to convert, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  targetFormat: z.string().describe('The desired output format for the file (e.g., PNG, JPEG, PDF).'),
});
export type ConvertFileInput = z.infer<typeof ConvertFileInputSchema>;

const ConvertFileOutputSchema = z.object({
  convertedFileDataUri: z
    .string()
    .describe(
      'The converted file, as a data URI that must include a MIME type and use Base64 encoding.'
    ),
   filename: z.string().describe('The recommended filename for the converted file, including the extension.'),
});
export type ConvertFileOutput = z.infer<typeof ConvertFileOutputSchema>;

export async function convertFile(input: ConvertFileInput): Promise<ConvertFileOutput> {
  return convertFileFlow(input);
}

const convertFilePrompt = ai.definePrompt({
  name: 'convertFilePrompt',
  input: {schema: ConvertFileInputSchema},
  output: {schema: ConvertFileOutputSchema},
  prompt: [
    {
      media: {url: '{{fileDataUri}}'},
    },
    {
      text: 'Convert this file to {{targetFormat}}. Return the converted file as a data URI. Also provide a suitable filename with the correct extension.',
    },
  ],
  model: 'googleai/gemini-2.5-flash-image-preview',
  config: {
    responseModalities: ['TEXT', 'IMAGE'],
  },
});

const convertFileFlow = ai.defineFlow(
  {
    name: 'convertFileFlow',
    inputSchema: ConvertFileInputSchema,
    outputSchema: ConvertFileOutputSchema,
  },
  async input => {
    const {output, media} = await convertFilePrompt(input);
    if (!media?.url || !output?.filename) {
      throw new Error('File conversion failed to produce an output file.');
    }
    return {convertedFileDataUri: media.url, filename: output.filename };
  }
);
