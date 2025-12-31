"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Page not found</h1>
        <Link href="/">
          <Button>Back to home</Button>
        </Link>
      </div>
    </main>
  );
}
