"use server";

import { convertCurrency, type ConvertCurrencyInput } from "@/ai/flows/convert-currency";
import { z } from "zod";

const FormSchema = z.object({
  amount: z.coerce.number().positive("Amount must be a positive number."),
  sourceCurrency: z.string().min(1, "Please select a source currency."),
  targetCurrency: z.string().min(1, "Please select a target currency."),
});

type ConversionResult = {
  success: boolean;
  data?: number;
  error?: string;
};

export async function handleCurrencyConversion(
  input: ConvertCurrencyInput
): Promise<ConversionResult> {
  const parsed = FormSchema.safeParse(input);

  if (!parsed.success) {
    const issues = parsed.error.issues.map(i => i.message).join(' ');
    return { success: false, error: `Invalid input: ${issues}` };
  }

  try {
    const { convertedAmount } = await convertCurrency(parsed.data);
    return { success: true, data: convertedAmount };
  } catch (e) {
    console.error(e);
    const errorMessage =
      e instanceof Error ? e.message : "An unknown error occurred during conversion.";
    return { success: false, error: errorMessage };
  }
}
