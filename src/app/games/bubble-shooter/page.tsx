import { PageHeader } from "@/components/page-header";
import { BubbleShooterUI } from "./bubble-shooter-ui";
import { Suspense } from "react";

export default function BubbleShooterPage() {
  return (
    <div className="flex flex-col h-full items-center justify-center">
      <div className="w-full max-w-lg text-center">
        <PageHeader
          title="Bubble Shooter"
          description="Aim and shoot to pop the bubbles. Match three or more of the same color!"
        />
        <div className="mt-8">
          <Suspense fallback={<div>Loading Game...</div>}>
            <BubbleShooterUI />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
