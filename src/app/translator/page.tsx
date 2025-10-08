import { PageHeader } from "@/components/page-header";
import { TranslatorUI } from "./translator-ui";
import { Suspense } from "react";

export default function TranslatorPage() {
  return (
    <div>
      <PageHeader
        title="Text Translator"
        description="Translate text between a wide variety of languages with the power of AI."
      />
      <div className="mt-8">
        <Suspense fallback={<div>Loading...</div>}>
          <TranslatorUI />
        </Suspense>
      </div>
    </div>
  );
}
