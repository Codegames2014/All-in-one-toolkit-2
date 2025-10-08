import { PageHeader } from "@/components/page-header";
import { MathSolverUI } from "./math-solver-ui";
import { Suspense } from "react";

export default function MathSolverPage() {
  return (
    <div>
      <PageHeader
        title="AI Math Problem Solver"
        description="Enter a math problem and get a step-by-step solution from AI."
      />
      <div className="mt-8">
        <Suspense fallback={<div>Loading...</div>}>
            <MathSolverUI />
        </Suspense>
      </div>
    </div>
  );
}
