import { PageHeader } from "@/components/page-header";
import { MemoryMatchUI } from "./memory-match-ui";
import { Suspense } from "react";

export default function MemoryMatchPage() {
  return (
    <div className="flex flex-col h-full items-center justify-center">
      <div className="w-full max-w-4xl text-center">
        <PageHeader
          title="Memory Match"
          description="Flip cards to find matching pairs. Test your memory!"
        />
        <div className="mt-8">
          <Suspense fallback={<div>Loading Game...</div>}>
            <MemoryMatchUI />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
