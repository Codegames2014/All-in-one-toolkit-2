import { PageHeader } from "@/components/page-header";
import { AdvancedCalculatorUI } from "./advanced-calculator-ui";

export default function AdvancedCalculatorPage() {
  return (
    <div className="flex flex-col h-full items-center justify-center">
      <div className="w-full max-w-lg">
        <PageHeader
          title="Advanced Calculator"
          description="Perform scientific and complex calculations."
        />
        <div className="mt-8">
          <AdvancedCalculatorUI />
        </div>
      </div>
    </div>
  );
}
