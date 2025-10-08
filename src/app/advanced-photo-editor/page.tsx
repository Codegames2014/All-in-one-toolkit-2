import { PageHeader } from "@/components/page-header";
import { AdvancedPhotoEditorUI } from "./advanced-photo-editor-ui";
import { Suspense } from "react";

export default function AdvancedPhotoEditorPage() {
  return (
    <div>
      <PageHeader
        title="Advanced Photo Editor"
        description="Upload an image and use a text prompt to perform AI-powered edits."
      />
      <div className="mt-8">
        <Suspense fallback={<div>Loading...</div>}>
          <AdvancedPhotoEditorUI />
        </Suspense>
      </div>
    </div>
  );
}
