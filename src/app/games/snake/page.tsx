import { PageHeader } from "@/components/page-header";
import { SnakeUI } from "./snake-ui";
import { Suspense } from "react";

export default function SnakePage() {
  return (
    <div className="flex flex-col h-full items-center justify-center">
      <div className="w-full max-w-xl text-center">
        <PageHeader
          title="Snake"
          description="Use the arrow keys to control the snake, eat the food, and don't run into yourself!"
        />
        <div className="mt-8">
          <Suspense fallback={<div>Loading Game...</div>}>
            <SnakeUI />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
