"use server";

import { solveMathProblem, type SolveMathProblemInput } from "@/ai/flows/solve-math-problems";
import { z } from "zod";

const FormSchema = z.object({
  problem: z.string(),
});

type SolverResult = {
  success: boolean;
  data?: string;
  error?: string;
};

export async function handleMathProblem(
  input: SolveMathProblemInput
): Promise<SolverResult> {
  const parsed = FormSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Invalid input." };
  }

  try {
    const { solution } = await solveMathProblem(parsed.data);
    return { success: true, data: solution };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }
}
