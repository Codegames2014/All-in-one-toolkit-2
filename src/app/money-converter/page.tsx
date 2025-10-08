import { PageHeader } from "@/components/page-header";
import { MoneyConverterUI } from "./money-converter-ui";
import { Suspense } from "react";

export default function MoneyConverterPage() {
  return (
    <div>
      <PageHeader
        title="Money Converter"
        description="Convert values between different currencies."
      />
      <div className="mt-8">
        <Suspense fallback={<div>Loading...</div>}>
          <MoneyConverterUI />
        </Suspense>
      </div>
    </div>
  );
}
