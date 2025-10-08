import { PageHeader } from "@/components/page-header";
import { Game2048UI } from "./2048-ui";
import { Suspense } from "react";

export default function Game2048Page() {
  return (
    <div className="flex flex-col h-full items-center justify-center">
      <div className="w-full max-w-md text-center">
        <PageHeader
          title="2048"
          description="Use your arrow keys to slide tiles and combine them to reach 2048!"
        />
        <div className="mt-8">
          <Suspense fallback={<div>Loading Game...</div>}>
            <Game2048UI />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
