import { PageHeader } from "@/components/page-header";
import { ColorPickerUI } from "./color-picker-ui";
import { Suspense } from "react";

export default function ColorPickerPage() {
  return (
    <div>
      <PageHeader
        title="Color Picker"
        description="Explore colors, create palettes, and get color information."
      />
      <div className="mt-8">
        <Suspense fallback={<div>Loading...</div>}>
          <ColorPickerUI />
        </Suspense>
      </div>
    </div>
  );
}
