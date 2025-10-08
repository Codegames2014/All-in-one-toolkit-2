import { PageHeader } from "@/components/page-header";
import { LudoUI } from "./ludo-ui";
import { Suspense } from "react";

export default function LudoPage() {
  return (
    <div className="flex flex-col h-full items-center justify-center">
      <div className="w-full max-w-4xl text-center">
        <PageHeader
          title="Ludo"
          description="The classic multiplayer board game. Get all your tokens home to win!"
        />
        <div className="mt-8">
          <Suspense fallback={<div>Loading Game...</div>}>
            <LudoUI />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
