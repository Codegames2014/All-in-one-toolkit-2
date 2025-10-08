'use server';

/**
 * @fileOverview An AI agent that builds a new Next.js app page based on a prompt.
 *
 * - buildApp - A function that generates the code for a new app page.
 * - BuildAppInput - The input type for the buildApp function.
 * - BuildAppOutput - The return type for the buildApp function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const BuildAppInputSchema = z.object({
  prompt: z.string().describe('A detailed description of the application to be built.'),
  features: z.array(z.string()).optional().describe('A list of pre-defined features to include in the app.'),
});
export type BuildAppInput = z.infer<typeof BuildAppInputSchema>;

export const BuildAppOutputSchema = z.object({
    code: z.string().describe('The generated TypeScript code for the Next.js React component.'),
});
export type BuildAppOutput = z.infer<typeof BuildAppOutputSchema>;

export async function buildApp(input: BuildAppInput): Promise<BuildAppOutput> {
  return buildAppFlow(input);
}

const buildAppPrompt = ai.definePrompt({
  name: 'buildAppPrompt',
  input: {schema: BuildAppInputSchema},
  output: {schema: BuildAppOutputSchema},
  prompt: `You are an expert Next.js and Tailwind CSS developer. Your task is to generate the code for a new application page based on a user's prompt.

  **Instructions:**
  1.  Generate a single, self-contained Next.js page component using React and TypeScript.
  2.  The component must be a default export.
  3.  The component must be a "use client" component.
  4.  Use Tailwind CSS for styling and layout. Make it look modern, clean, and professional.
  5.  Use components from the shadcn/ui library where appropriate (e.g., <Card>, <Button>, <Input>, <Label>).
  6.  Use lucide-react for icons.
  7.  Do NOT include any external imports other than 'react', 'lucide-react', and '@/components/ui/*'.
  8.  Do NOT add any comments to the generated code.
  9.  The generated code should be the complete content of a single .tsx file.
  10. If the prompt asks for functionality that requires backend logic or state management, implement it using React hooks ('useState', 'useEffect', etc.) directly within the component.

  **User Prompt:**
  "{{prompt}}"

  {{#if features}}
  **Include Features:**
  The user has requested to include ideas from the following existing features. You can use them as inspiration for the UI and functionality:
  {{#each features}}
  - {{{this}}}
  {{/each}}
  {{/if}}

  Generate the complete, runnable code for the page component now.
  `,
});

const buildAppFlow = ai.defineFlow(
  {
    name: 'buildAppFlow',
    inputSchema: BuildAppInputSchema,
    outputSchema: BuildAppOutputSchema,
  },
  async input => {
    const {output} = await buildAppPrompt(input);
    return output!;
  }
);
