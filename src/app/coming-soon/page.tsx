import { PageHeader } from "@/components/page-header";
import { Construction } from "lucide-react";

export default function ComingSoonPage() {
  return (
    <div className="flex flex-col h-[60vh] items-center justify-center text-center">
      <Construction className="h-24 w-24 text-primary mb-4" />
      <PageHeader
        title="Feature Under Construction"
        description="We're working hard to bring this tool to you. Please check back later!"
      />
    </div>
  );
}
