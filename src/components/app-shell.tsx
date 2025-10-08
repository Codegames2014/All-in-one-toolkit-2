"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import { tools } from "@/lib/tools";
import { Button } from "./ui/button";
import { Bot } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { PageLoader } from "./page-loader";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const getTitle = (path: string) => {
    if (path === '/') return 'Dashboard';
    const tool = tools.find(t => t.href === path);
    return tool ? tool.name : path.substring(1).split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  return (
    <div className="bg-background/10 backdrop-blur-lg">
      <SidebarProvider>
        <PageLoader />
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                  <Bot className="text-primary" />
                </Link>
              </Button>
              <h1 className="text-lg font-headline font-semibold">
                All-in-One Toolkit
              </h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {tools.map((tool) => {
                if(tool.name === 'Dashboard') return null; // Already in header
                const Icon = tool.icon;
                return (
                  <SidebarMenuItem key={tool.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === tool.href}
                      tooltip={{
                        children: tool.name,
                      }}
                    >
                      <Link href={tool.href}>
                        <Icon />
                        <span>{tool.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="flex items-center justify-center p-2">
              <ThemeToggle />
            </div>
            <p className="text-xs text-muted-foreground p-2 text-center">
              &copy; 2024 All-in-One Toolkit
            </p>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <div className="flex items-center gap-2 p-2 border-b">
            <SidebarTrigger />
            <h2 className="text-lg font-semibold font-headline text-muted-foreground capitalize">
              {getTitle(pathname)}
            </h2>
          </div>
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
