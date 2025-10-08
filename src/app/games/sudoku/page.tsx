import { PageHeader } from "@/components/page-header";
import { SudokuUI } from "./sudoku-ui";
import { Suspense } from "react";

export default function SudokuPage() {
  return (
    <div className="flex flex-col h-full items-center justify-center">
      <div className="w-full max-w-xl text-center">
        <PageHeader
          title="Sudoku"
          description="Fill the grid so that every row, column, and 3x3 box contains the digits 1 through 9."
        />
        <div className="mt-8">
            <Suspense fallback={<div>Loading Game...</div>}>
                <SudokuUI />
            </Suspense>
        </div>
      </div>
    </div>
  );
}
