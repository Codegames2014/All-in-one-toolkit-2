import { PageHeader } from "@/components/page-header";
import { TextGeneratorUI } from "./text-generator-ui";
import { Suspense } from "react";

export default function TextGeneratorPage() {
  return (
    <div>
      <PageHeader
        title="AI Text Generator"
        description="Generate poems, scripts, emails, and more from a simple prompt."
      />
      <div className="mt-8">
        <Suspense fallback={<div>Loading...</div>}>
            <TextGeneratorUI />
        </Suspense>
      </div>
    </div>
  );
}
