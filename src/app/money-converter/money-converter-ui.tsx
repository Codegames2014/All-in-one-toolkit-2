"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { handleCurrencyConversion } from "./actions";
import { useState, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { ArrowRightLeft, Loader2 } from "lucide-react";

const currencies = [
  "USD", "EUR", "JPY", "GBP", "AUD", "CAD", "CHF", "CNY", "HKD", "NZD", "INR", "BRL", "RUB", "ZAR",
  "MXN", "SGD", "AED", "ARS", "BDT", "BHD", "CLP", "CZK", "DKK", "EGP", "FJD", "HUF", "IDR",
  "ILS", "ISK", "JOD", "KES", "KWD", "LKR", "MAD", "MYR", "NOK", "NPR", "OMR", "PHP", "PKR",
  "PLN", "QAR", "RON", "SAR", "SEK", "THB", "TRY", "TWD", "UAH", "VND",
];

const FormSchema = z.object({
  amount: z.coerce.number().positive({ message: "Please enter an amount greater than 0." }),
  sourceCurrency: z.string().min(1, "Please select a source currency."),
  targetCurrency: z.string().min(1, "Please select a target currency."),
});

type FormValues = z.infer<typeof FormSchema>;

export function MoneyConverterUI() {
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      amount: 1,
      sourceCurrency: "USD",
      targetCurrency: "EUR",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    startTransition(async () => {
      setConvertedAmount(null);
      const result = await handleCurrencyConversion(data);
      if (result.success) {
        setConvertedAmount(result.data!);
      } else {
        toast({
          variant: "destructive",
          title: "Conversion Failed",
          description: result.error,
        });
      }
    });
  };
  
  const swapCurrencies = () => {
    const source = form.getValues("sourceCurrency");
    const target = form.getValues("targetCurrency");
    form.setValue("sourceCurrency", target);
    form.setValue("targetCurrency", source);
  };


  return (
    <Card className="max-w-2xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Currency Converter</CardTitle>
              <CardDescription>
                Quickly convert between currencies. Rates are for demonstration only.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="1.00" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                  )}
                />
              <FormField
                control={form.control}
                name="sourceCurrency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetCurrency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex-col items-start gap-4">
                 <div className="flex items-center gap-4">
                    <Button type="submit" disabled={isPending}>
                        {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Converting...</> : "Convert"}
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={swapCurrencies}>
                        <ArrowRightLeft className="h-4 w-4" />
                        <span className="sr-only">Swap currencies</span>
                    </Button>
                 </div>
                 {convertedAmount !== null && (
                    <div className="text-2xl font-bold">
                        {form.getValues('amount')} {form.getValues('sourceCurrency')} = {convertedAmount} {form.getValues('targetCurrency')}
                    </div>
                 )}
            </CardFooter>
          </form>
        </Form>
    </Card>
  );
}
