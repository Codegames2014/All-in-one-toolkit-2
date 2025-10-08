import { PageHeader } from "@/components/page-header";
import { SnakesAndLaddersUI } from "./snakes-and-ladders-ui";
import { Suspense } from "react";

export default function SnakesAndLaddersPage() {
  return (
    <div className="flex flex-col h-full items-center justify-center">
      <div className="w-full max-w-4xl text-center">
        <PageHeader
          title="Snakes & Ladders"
          description="Roll the dice, climb the ladders, and avoid the snakes to win!"
        />
        <div className="mt-8">
          <Suspense fallback={<div>Loading Game...</div>}>
            <SnakesAndLaddersUI />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
