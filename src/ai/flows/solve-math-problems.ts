'use server';

/**
 * @fileOverview Math problem solver flow using Genkit.
 *
 * - solveMathProblem - A function that solves math problems step by step.
 * - SolveMathProblemInput - The input type for the solveMathProblem function.
 * - SolveMathProblemOutput - The return type for the solveMathProblem function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SolveMathProblemInputSchema = z.object({
  problem: z.string().describe('The math problem to solve.'),
});

export type SolveMathProblemInput = z.infer<typeof SolveMathProblemInputSchema>;

const SolveMathProblemOutputSchema = z.object({
  solution: z.string().describe('The step-by-step solution to the math problem.'),
});

export type SolveMathProblemOutput = z.infer<typeof SolveMathProblemOutputSchema>;

export async function solveMathProblem(input: SolveMathProblemInput): Promise<SolveMathProblemOutput> {
  return solveMathProblemFlow(input);
}

const solveMathProblemPrompt = ai.definePrompt({
  name: 'solveMathProblemPrompt',
  input: {schema: SolveMathProblemInputSchema},
  output: {schema: SolveMathProblemOutputSchema},
  prompt: `You are an expert math tutor who can solve math problems step by step.

  Solve the following math problem, showing each step:
  {{{problem}}}
  `,
});

const solveMathProblemFlow = ai.defineFlow(
  {
    name: 'solveMathProblemFlow',
    inputSchema: SolveMathProblemInputSchema,
    outputSchema: SolveMathProblemOutputSchema,
  },
  async input => {
    const {output} = await solveMathProblemPrompt(input);
    return output!;
  }
);
