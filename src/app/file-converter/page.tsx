import { PageHeader } from "@/components/page-header";
import { FileConverterUI } from "./file-converter-ui";
import { Suspense } from "react";

export default function FileConverterPage() {
  return (
    <div>
      <PageHeader
        title="AI File Converter"
        description="Convert files from one format to another using generative AI."
      />
      <div className="mt-8">
        <Suspense fallback={<div>Loading...</div>}>
          <FileConverterUI />
        </Suspense>
      </div>
    </div>
  );
}
