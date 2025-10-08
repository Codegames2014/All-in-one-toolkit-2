'use server';

/**
 * @fileOverview An AI agent for converting code from one language to another.
 *
 * - convertCode - A function that handles the code conversion process.
 * - ConvertCodeInput - The input type for the convertCode function.
 * - ConvertCodeOutput - The return type for the convertCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConvertCodeInputSchema = z.object({
  sourceCode: z.string().describe('The source code to convert.'),
  sourceLanguage: z.string().describe('The programming language of the source code.'),
  targetLanguage: z.string().describe('The programming language to convert the code to.'),
});
export type ConvertCodeInput = z.infer<typeof ConvertCodeInputSchema>;

const ConvertCodeOutputSchema = z.object({
  convertedCode: z.string().describe('The converted code in the target language.'),
});
export type ConvertCodeOutput = z.infer<typeof ConvertCodeOutputSchema>;

export async function convertCode(input: ConvertCodeInput): Promise<ConvertCodeOutput> {
  return convertCodeFlow(input);
}

const convertCodePrompt = ai.definePrompt({
  name: 'convertCodePrompt',
  input: {schema: ConvertCodeInputSchema},
  output: {schema: ConvertCodeOutputSchema},
  prompt: `You are an expert code converter. Convert the following {{sourceLanguage}} code to {{targetLanguage}}. Only output the raw code, with no explanations or markdown formatting.

Source Code:
\`\`\`{{sourceLanguage}}
{{{sourceCode}}}
\`\`\`
`,
});

const convertCodeFlow = ai.defineFlow(
  {
    name: 'convertCodeFlow',
    inputSchema: ConvertCodeInputSchema,
    outputSchema: ConvertCodeOutputSchema,
  },
  async input => {
    const {output} = await convertCodePrompt(input);
    return output!;
  }
);
