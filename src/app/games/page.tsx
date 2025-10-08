"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { games } from "@/lib/games";
import Link from "next/link";

export default function GamesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredGames = games.filter(
    (game) =>
      game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Games"
        description="A collection of fun and engaging offline games to pass the time."
      />
      <div className="mt-8 mb-8">
        <Input
          type="text"
          placeholder="Search for a game..."
          className="w-full max-w-lg mx-auto"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {filteredGames.map((game, index) => {
          const Icon = game.icon;
          return (
            <Link
              href={game.href}
              key={game.name}
              className="group"
            >
              <Card 
                className="h-full transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 hover:border-primary animate-in fade-in-0 zoom-in-95"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
              >
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
