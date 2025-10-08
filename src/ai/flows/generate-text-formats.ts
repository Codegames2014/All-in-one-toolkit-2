'use server';

/**
 * @fileOverview Text generation AI agent.
 *
 * - generateTextFormats - A function that handles the text generation process.
 * - GenerateTextFormatsInput - The input type for the generateTextFormats function.
 * - GenerateTextFormatsOutput - The return type for the generateTextFormats function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTextFormatsInputSchema = z.object({
  prompt: z.string().describe('The prompt to generate text from.'),
});
export type GenerateTextFormatsInput = z.infer<typeof GenerateTextFormatsInputSchema>;

const GenerateTextFormatsOutputSchema = z.object({
  text: z.string().describe('The generated text.'),
});
export type GenerateTextFormatsOutput = z.infer<typeof GenerateTextFormatsOutputSchema>;

export async function generateTextFormats(input: GenerateTextFormatsInput): Promise<GenerateTextFormatsOutput> {
  return generateTextFormatsFlow(input);
}

const generateTextFormatsPrompt = ai.definePrompt({
  name: 'generateTextFormatsPrompt',
  input: {schema: GenerateTextFormatsInputSchema},
  output: {schema: GenerateTextFormatsOutputSchema},
  prompt: `You are a creative writing assistant. Please generate text based on the following prompt: {{{prompt}}}`,
});

const generateTextFormatsFlow = ai.defineFlow(
  {
    name: 'generateTextFormatsFlow',
    inputSchema: GenerateTextFormatsInputSchema,
    outputSchema: GenerateTextFormatsOutputSchema,
  },
  async input => {
    const {output} = await generateTextFormatsPrompt(input);
    return output!;
  }
);
