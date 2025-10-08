"use server";

import { generateChatResponse, type GenerateChatResponseInput } from "@/ai/flows/generate-chat-response";
import { z } from "zod";

const FormSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })),
  prompt: z.string().min(1, "Message cannot be empty."),
});

type ChatResult = {
  success: boolean;
  data?: string;
  error?: string;
};

export async function handleChat(
  input: GenerateChatResponseInput
): Promise<ChatResult> {
  const parsed = FormSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Invalid input." };
  }

  try {
    const { response } = await generateChatResponse(parsed.data);
    return { success: true, data: response };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }
}
