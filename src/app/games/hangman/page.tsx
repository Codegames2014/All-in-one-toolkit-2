import { PageHeader } from "@/components/page-header";
import { HangmanUI } from "./hangman-ui";
import { Suspense } from "react";

export default function HangmanPage() {
  return (
    <div className="flex flex-col h-full items-center justify-center">
      <div className="w-full max-w-4xl text-center">
        <PageHeader
          title="Hangman"
          description="Guess the word before you run out of attempts!"
        />
        <div className="mt-8">
          <Suspense fallback={<div>Loading Game...</div>}>
            <HangmanUI />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
