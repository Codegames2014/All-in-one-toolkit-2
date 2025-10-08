import { PageHeader } from "@/components/page-header";
import { DownloaderUI } from "../youtube-downloader/downloader-ui"; // Re-using the same UI component
import { Suspense } from "react";

export default function FacebookDownloaderPage() {
  return (
    <div>
      <PageHeader
        title="Facebook Video Downloader"
        description="Paste a Facebook video URL to start."
      />
      <div className="mt-8">
        <Suspense fallback={<div>Loading...</div>}>
            <DownloaderUI service="facebook" />
        </Suspense>
      </div>
    </div>
  );
}
