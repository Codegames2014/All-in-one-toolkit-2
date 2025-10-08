import { PageHeader } from "@/components/page-header";
import { LogoGeneratorUI } from "./logo-generator-ui";
import { Suspense } from "react";

export default function LogoGeneratorPage() {
  return (
    <div>
      <PageHeader
        title="AI Logo Generator"
        description="Describe the logo you want to create and let AI do the rest."
      />
      <div className="mt-8">
        <Suspense fallback={<div>Loading...</div>}>
          <LogoGeneratorUI />
        </Suspense>
      </div>
    </div>
  );
}
