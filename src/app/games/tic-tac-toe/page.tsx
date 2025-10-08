import { PageHeader } from "@/components/page-header";
import { TicTacToeUI } from "./tic-tac-toe-ui";

export default function TicTacToePage() {
  return (
    <div className="flex flex-col h-full items-center justify-center">
      <div className="w-full max-w-md text-center">
        <PageHeader
          title="Tic-Tac-Toe"
          description="Try to get three in a row to win!"
        />
        <div className="mt-8">
          <TicTacToeUI />
        </div>
      </div>
    </div>
  );
}