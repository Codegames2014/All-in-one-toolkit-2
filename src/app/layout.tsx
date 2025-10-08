"use client";

import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { useState, useEffect } from "react";
import { LoadingScreen } from "@/components/loading-screen";

// Metadata is not supported in client components, but we can keep it for static analysis
// export const metadata: Metadata = {
//   title: "All-in-One Toolkit",
//   description: "A collection of useful tools for everyday tasks.",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>All-in-One Toolkit</title>
        <meta name="description" content="A collection of useful tools for everyday tasks." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        {loading ? (
          <LoadingScreen />
        ) : (
          <>
            <AppShell>{children}</AppShell>
            <Toaster />
          </>
        )}
      </body>
    </html>
  );
}
