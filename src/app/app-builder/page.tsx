import { PageHeader } from "@/components/page-header";
import { AppBuilderUI } from "./app-builder-ui";
import { Suspense } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default function AppBuilderPage() {
  return (
    <div>
      <PageHeader
        title="AI App Builder"
        description="Describe the application you want to build and select the features you want to include."
      />
      <Alert className="mt-4">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Developer Preview</AlertTitle>
        <AlertDescription>
          This tool generates the code for a new Next.js page component. You will need to manually create the file (e.g., `src/app/my-new-app/page.tsx`) and paste the generated code.
        </AlertDescription>
      </Alert>
      <div className="mt-8">
        <Suspense fallback={<div>Loading...</div>}>
          <AppBuilderUI />
        </Suspense>
      </div>
    </div>
  );
}
