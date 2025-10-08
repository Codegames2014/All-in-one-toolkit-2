import { PageHeader } from "@/components/page-header";
import { CalculatorUI } from "./calculator-ui";

export default function CalculatorPage() {
  return (
    <div className="flex flex-col h-full items-center justify-center">
      <div className="w-full max-w-md">
        <PageHeader
          title="Basic Calculator"
          description="Perform simple arithmetic operations."
        />
        <div className="mt-8">
          <CalculatorUI />
        </div>
      </div>
    </div>
  );
}
