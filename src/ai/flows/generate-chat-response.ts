'use server';

/**
 * @fileOverview An AI agent for conversational chat.
 *
 * - generateChatResponse - A function that handles the chat response generation.
 * - GenerateChatResponseInput - The input type for the generateChatResponse function.
 * - GenerateChatResponseOutput - The return type for the generateChatResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const GenerateChatResponseInputSchema = z.object({
  history: z.array(ChatMessageSchema).describe("The conversation history."),
  prompt: z.string().describe('The latest user prompt.'),
});
export type GenerateChatResponseInput = z.infer<typeof GenerateChatResponseInputSchema>;

const GenerateChatResponseOutputSchema = z.object({
  response: z.string().describe('The AI\'s response.'),
});
export type GenerateChatResponseOutput = z.infer<typeof GenerateChatResponseOutputSchema>;

export async function generateChatResponse(input: GenerateChatResponseInput): Promise<GenerateChatResponseOutput> {
  return generateChatResponseFlow(input);
}

const generateChatResponseFlow = ai.defineFlow(
  {
    name: 'generateChatResponseFlow',
    inputSchema: GenerateChatResponseInputSchema,
    outputSchema: GenerateChatResponseOutputSchema,
  },
  async ({ history, prompt }) => {
    const { output } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: [
        ...history.map(msg => ({ role: msg.role, content: [{ text: msg.content }] })),
        { role: 'user', content: [{ text: prompt }] }
      ],
    });

    return { response: output!.text! };
  }
);
