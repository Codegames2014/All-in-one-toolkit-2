'use server';

/**
 * @fileOverview A currency conversion AI agent.
 *
 * - convertCurrency - A function that handles the currency conversion process.
 * - ConvertCurrencyInput - The input type for the convertCurrency function.
 * - ConvertCurrencyOutput - The return type for the convertCurrency function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Note: These are placeholder rates and not live data.
const exchangeRates: Record<string, number> = {
  USD: 1.0,
  EUR: 0.93,
  JPY: 157.0,
  GBP: 0.79,
  AUD: 1.5,
  CAD: 1.37,
  CHF: 0.9,
  CNY: 7.25,
  HKD: 7.8,
  NZD: 1.63,
  INR: 83.5,
  BRL: 5.4,
  RUB: 88.0,
  ZAR: 18.0,
  MXN: 18.5,
  SGD: 1.35,
  AED: 3.67,
  ARS: 900.0,
  BDT: 117.0,
  BHD: 0.38,
  CLP: 940.0,
  CZK: 23.0,
  DKK: 6.9,
  EGP: 47.5,
  FJD: 2.25,
  HUF: 370.0,
  IDR: 16400.0,
  ILS: 3.75,
  ISK: 139.0,
  JOD: 0.71,
  KES: 128.0,
  KWD: 0.31,
  LKR: 305.0,
  MAD: 10.0,
  MYR: 4.7,
  NOK: 10.6,
  NPR: 133.0,
  OMR: 0.38,
  PHP: 58.5,
  PKR: 278.0,
  PLN: 4.0,
  QAR: 3.64,
  RON: 4.6,
  SAR: 3.75,
  SEK: 10.5,
  THB: 36.5,
  TRY: 32.8,
  TWD: 32.3,
  UAH: 40.5,
  VND: 25400.0,
};

const ConvertCurrencyInputSchema = z.object({
  amount: z.number().describe('The amount of money to convert.'),
  sourceCurrency: z.string().describe('The currency to convert from.'),
  targetCurrency: z.string().describe('The currency to convert to.'),
});
export type ConvertCurrencyInput = z.infer<typeof ConvertCurrencyInputSchema>;

const ConvertCurrencyOutputSchema = z.object({
  convertedAmount: z.number().describe('The converted amount.'),
});
export type ConvertCurrencyOutput = z.infer<typeof ConvertCurrencyOutputSchema>;

export async function convertCurrency(input: ConvertCurrencyInput): Promise<ConvertCurrencyOutput> {
  return convertCurrencyFlow(input);
}

const convertCurrencyFlow = ai.defineFlow(
  {
    name: 'convertCurrencyFlow',
    inputSchema: ConvertCurrencyInputSchema,
    outputSchema: ConvertCurrencyOutputSchema,
  },
  async ({ amount, sourceCurrency, targetCurrency }) => {
    const sourceRate = exchangeRates[sourceCurrency];
    const targetRate = exchangeRates[targetCurrency];

    if (!sourceRate || !targetRate) {
      throw new Error('Invalid currency provided.');
    }

    const amountInUSD = amount / sourceRate;
    const convertedAmount = amountInUSD * targetRate;
    
    return { convertedAmount: parseFloat(convertedAmount.toFixed(2)) };
  }
);
