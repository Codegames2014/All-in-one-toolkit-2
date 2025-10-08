import { PageHeader } from "@/components/page-header";
import { DownloaderUI } from "./downloader-ui";
import { Suspense } from "react";

export default function YouTubeDownloaderPage() {
  return (
    <div>
      <PageHeader
        title="YouTube Video Downloader"
        description="Paste a YouTube video URL to start."
      />
      <div className="mt-8">
        <Suspense fallback={<div>Loading...</div>}>
            <DownloaderUI service="youtube" />
        </Suspense>
      </div>
    </div>
  );
}
