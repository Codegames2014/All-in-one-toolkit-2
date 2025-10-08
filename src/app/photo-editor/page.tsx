import { PageHeader } from "@/components/page-header";
import { PhotoEditorUI } from "./photo-editor-ui";

export default function PhotoEditorPage() {
  return (
    <div>
      <PageHeader
        title="Photo Editor"
        description="Apply basic adjustments to your photos. (Filters are for demonstration purposes)"
      />
      <div className="mt-8">
        <PhotoEditorUI />
      </div>
    </div>
  );
}
