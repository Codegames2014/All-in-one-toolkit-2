import { PageHeader } from "@/components/page-header";
import { ChessUI } from "./chess-ui";
import { Suspense } from "react";

export default function ChessPage() {
  return (
    <div className="flex flex-col h-full items-center justify-center">
      <div className="w-full max-w-xl text-center">
        <PageHeader
          title="Chess"
          description="The ultimate game of strategy. White moves first."
        />
        <div className="mt-8">
            <Suspense fallback={<div>Loading Game...</div>}>
                <ChessUI />
            </Suspense>
        </div>
      </div>
    </div>
  );
}
