import { PageHeader } from "@/components/page-header";
import { AsteroidsUI } from "./asteroids-ui";
import { Suspense } from "react";

export default function AsteroidsPage() {
  return (
    <div className="flex flex-col h-full items-center justify-center">
      <div className="w-full max-w-4xl text-center">
        <PageHeader
          title="Asteroids"
          description="Use arrow keys to move and space to shoot. Survive as long as you can!"
        />
        <div className="mt-8">
          <Suspense fallback={<div>Loading Game...</div>}>
            <AsteroidsUI />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
