"use client";

import FlowBuilder from "@/components/flow-builder";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect } from "react";
import useWorkflow from "@/hooks/useWorkflow";

export default async function Home() {
  const { workflow, getWorkflowById } = useWorkflow();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    getWorkflowById(id);
  }, []);

  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex h-16 items-center border-b px-4">
        <h1 className="text-xl font-bold">Flow Request Builder</h1>
        <Link className="ml-auto" href="/workflows">
          <Button>Go to Flows</Button>
        </Link>
      </div>
      <div className="flex-1">
        <FlowBuilder flowName={workflow?.name} workflowToEdit={workflow} />
      </div>
    </main>
  );
}
