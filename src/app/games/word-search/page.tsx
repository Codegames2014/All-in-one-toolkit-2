import { PageHeader } from "@/components/page-header";
import { WordSearchUI } from "./word-search-ui";
import { Suspense } from "react";

export default function WordSearchPage() {
  return (
    <div className="flex flex-col h-full items-center justify-center">
      <div className="w-full max-w-2xl text-center">
        <PageHeader
          title="Word Search"
          description="Find all the hidden words in the grid. Click and drag to select."
        />
        <div className="mt-8">
          <Suspense fallback={<div>Loading Game...</div>}>
            <WordSearchUI />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
