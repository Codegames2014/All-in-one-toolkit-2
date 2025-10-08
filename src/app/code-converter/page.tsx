import { PageHeader } from "@/components/page-header";
import { CodeConverterUI } from "./code-converter-ui";
import { Suspense } from "react";

export default function CodeConverterPage() {
  return (
    <div>
      <PageHeader
        title="AI Code Converter"
        description="Translate code from one programming language to another with ease."
      />
      <div className="mt-8">
        <Suspense fallback={<div>Loading...</div>}>
          <CodeConverterUI />
        </Suspense>
      </div>
    </div>
  );
}
