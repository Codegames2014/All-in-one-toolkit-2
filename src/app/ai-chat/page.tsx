import { PageHeader } from "@/components/page-header";
import { AIChatUI } from "./ai-chat-ui";
import { Suspense } from "react";

export default function AIChatPage() {
  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="AI Chat"
        description="Have a conversation with an advanced AI. Ask it anything!"
      />
      <div className="mt-8 flex-1 flex flex-col">
        <Suspense fallback={<div>Loading...</div>}>
          <AIChatUI />
        </Suspense>
      </div>
    </div>
  );
}
