import { PageHeader } from "@/components/page-header";
import { BackgroundRemoverUI } from "./background-remover-ui";
import { Suspense } from "react";

export default function BackgroundRemoverPage() {
  return (
    <div>
      <PageHeader
        title="Photo Background Remover"
        description="Upload an image and let AI automatically remove the background for you."
      />
      <div className="mt-8">
        <Suspense fallback={<div>Loading...</div>}>
            <BackgroundRemoverUI />
        </Suspense>
      </div>
    </div>
  );
}
