import { PageHeader } from "@/components/page-header";
import { CarRacingUI } from "./car-racing-ui";
import { Suspense } from "react";

export default function CarRacingPage() {
  return (
    <div className="flex flex-col h-full items-center justify-center">
      <div className="w-full max-w-4xl text-center">
        <PageHeader
          title="3D Car Racing"
          description="Use the arrow keys to control your car. Stay on the track!"
        />
        <div className="mt-8">
          <Suspense fallback={<div>Loading Game...</div>}>
            <CarRacingUI />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
