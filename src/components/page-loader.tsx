"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Progress } from "./ui/progress";

export function PageLoader() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // We're not using the built-in Next.js loading.js file
    // because we want a more global, persistent loading bar.
    // This effect will trigger on every route change.

    // Start loading on route change
    setLoading(true);

    // End loading after a short delay to ensure content has started rendering.
    // In a real app with data fetching, this would be tied to Suspense boundaries.
    const timer = setTimeout(() => {
      setLoading(false);
    }, 750); // Simulate loading time

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[102]">
      <Progress value={100} className="h-1 animate-pulse duration-[3000ms]" />
    </div>
  );
}
