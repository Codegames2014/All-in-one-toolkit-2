"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { handleChat } from "./actions";
import { Loader2, Send, User, Bot } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "model";
  content: string;
};

export function AIChatUI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const onSendMessage = () => {
    if (!prompt) return;

    const newMessages: Message[] = [...messages, { role: "user", content: prompt }];
    setMessages(newMessages);
    setPrompt("");

    startTransition(async () => {
      const result = await handleChat({
        history: messages,
        prompt,
      });

      if (result.success && result.data) {
        setMessages([...newMessages, { role: "model", content: result.data }]);
      } else {
        toast({
          variant: "destructive",
          title: "Message Failed",
          description: result.error,
        });
         // Remove the user's message if the API call failed
        setMessages(messages);
      }
    });
  };
  
  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if(viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  return (
    <Card className="flex-1 flex flex-col">
        <CardContent className="p-6 flex-1 flex flex-col gap-4">
            <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
                <div className="space-y-6">
                {messages.map((message, index) => (
                    <div
                    key={index}
                    className={cn(
                        "flex items-start gap-4",
                        message.role === "user" ? "justify-end" : "justify-start"
                    )}
                    >
                    {message.role === "model" && (
                        <Avatar>
                            <AvatarFallback><Bot /></AvatarFallback>
                        </Avatar>
                    )}
                    <div
                        className={cn(
                        "max-w-md rounded-lg p-3",
                        message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                    >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                     {message.role === "user" && (
                        <Avatar>
                            <AvatarFallback><User /></AvatarFallback>
                        </Avatar>
                    )}
                    </div>
                ))}
                {isPending && (
                    <div className="flex items-start gap-4">
                        <Avatar>
                            <AvatarFallback><Bot /></AvatarFallback>
                        </Avatar>
                        <div className="max-w-md rounded-lg p-3 bg-muted flex items-center">
                            <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                    </div>
                )}
                </div>
            </ScrollArea>
            <div className="flex items-center gap-2">
            <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSendMessage()}
                placeholder="Type your message..."
                disabled={isPending}
            />
            <Button onClick={onSendMessage} disabled={isPending || !prompt}>
                {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                <Send className="h-4 w-4" />
                )}
                <span className="sr-only">Send</span>
            </Button>
            </div>
        </CardContent>
    </Card>
  );
}
