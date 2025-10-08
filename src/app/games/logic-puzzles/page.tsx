import { PageHeader } from "@/components/page-header";
import { LogicPuzzleUI } from "./logic-puzzles-ui";
import { Suspense } from "react";

export default function LogicPuzzlesPage() {
  return (
    <div className="flex flex-col h-full items-center justify-center">
      <div className="w-full max-w-7xl text-center">
        <PageHeader
          title="Logic Puzzle"
          description="Use the clues to solve the famous Zebra Puzzle."
        />
        <div className="mt-8">
          <Suspense fallback={<div>Loading Puzzle...</div>}>
            <LogicPuzzleUI />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
