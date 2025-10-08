"use client";

import { useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { tools } from "@/lib/tools";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredTools = tools.filter(
    (tool) =>
      tool.href !== "/" && (
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );
  
  const allTools = tools.filter(tool => tool.href !== "/");

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="All-in-One Toolkit"
        description="Your one-stop destination for a variety of useful tools."
      />
      <div className="mt-8 mb-8 flex justify-center">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full max-w-lg">
              <Search className="mr-2 h-4 w-4" />
              Search for a tool...
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Search for a tool</DialogTitle>
            </DialogHeader>
            <Input
              type="text"
              placeholder="e.g., Calculator, Games, etc."
              className="w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            <div className="mt-4 max-h-[400px] overflow-y-auto">
              {searchTerm && filteredTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link href={tool.href} key={tool.name} onClick={() => setDialogOpen(false)}>
                    <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-accent">
                      <Icon className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-semibold">{tool.name}</p>
                        <p className="text-sm text-muted-foreground">{tool.description}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
              {searchTerm && filteredTools.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No tools found.</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {allTools.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <Link
              href={tool.href}
              key={tool.name}
              className="group"
            >
              <Card className="h-full transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 hover:border-primary animate-in fade-in-0 zoom-in-95"
               style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}>
                <CardHeader className="flex flex-col items-center justify-center text-center p-6">
                  <div className="p-4 bg-muted rounded-full mb-4">
                    <Icon className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-xl">
                    {tool.name}
                  </CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
