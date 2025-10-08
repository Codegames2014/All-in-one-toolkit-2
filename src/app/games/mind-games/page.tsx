import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Brain, Lightbulb, Puzzle } from "lucide-react";
import Link from "next/link";

const puzzles = [
    {
        name: "Memory Match",
        description: "Test your memory by matching pairs.",
        icon: Brain,
        href: "/games/memory-match",
    },
    {
        name: "Logic Puzzles",
        description: "Solve challenging logic grids.",
        icon: Lightbulb,
        href: "/games/logic-puzzles",
    },
    {
        name: "Sudoku",
        description: "The classic number placement puzzle.",
        icon: Puzzle,
        href: "/games/sudoku",
    }
]

export default function MindGamesPage() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Mind Games"
        description="A collection of puzzles to challenge your brain."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {puzzles.map((game) => {
          const Icon = game.icon;
          return (
            <Link href={game.href} key={game.name} className="group">
              <Card className="h-full transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 hover:border-primary">
                <CardHeader className="flex flex-col items-center justify-center text-center p-6">
                  <div className="p-4 bg-muted rounded-full mb-4">
                    <Icon className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-xl">
                    {game.name}
                  </CardTitle>
                  <CardDescription>{game.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
