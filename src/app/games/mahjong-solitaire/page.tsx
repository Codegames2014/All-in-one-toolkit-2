import { PageHeader } from "@/components/page-header";
import { MahjongSolitaireUI } from "./mahjong-solitaire-ui";
import { Suspense } from "react";

export default function MahjongSolitairePage() {
  return (
    <div className="flex flex-col h-full items-center justify-center">
      <div className="w-full max-w-4xl text-center">
        <PageHeader
          title="Mahjong Solitaire"
          description="Match pairs of identical tiles to clear the board."
        />
        <div className="mt-8">
          <Suspense fallback={<div>Loading Game...</div>}>
            <MahjongSolitaireUI />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
