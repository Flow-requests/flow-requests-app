"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React, { useEffect } from "react";
import useWorkflow from "@/hooks/useWorkflow";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToastContainer, toast } from "react-toastify";
import { Dexie } from "dexie";

const WorkflowsList = () => {
  const { triggerWorkflow, deleteWorkflow, workflows, getWorkflows } =
    useWorkflow();

  useEffect(() => {
    getWorkflows();
  }, []);

  const exportFlows = async () => {
    const db = new Dexie("FlowRequests");
    db.version(1).stores({
      workflows: "++id",
      plugins: "++id",
    });
    const workflowsResults = await (db as any).workflows.toArray();
    const pluginsResults = await (db as any).plugins.toArray();
    const exportData = {
      plugins: pluginsResults.map((item: any) => ({
        enabled: item.enabled,
        libraryName: item.libraryName,
        url: item.url,
      })),
      flows: workflowsResults.map((item: any) => ({
        id: item.id.toString(),
        data: item.data,
      })),
    };
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flows.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importFlows = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const data = JSON.parse(text);
        if (
          !data.plugins ||
          !Array.isArray(data.plugins) ||
          !data.flows ||
          !Array.isArray(data.flows)
        )
          throw new Error(
            "Invalid format: expected { plugins: [...], flows: [...] }"
          );
        const db = new Dexie("FlowRequests");
        db.version(1).stores({ workflows: "++id", plugins: "++id" });
        for (const plugin of data.plugins) {
          if (
            typeof plugin.enabled !== "boolean" ||
            typeof plugin.libraryName !== "string" ||
            typeof plugin.url !== "string"
          )
            throw new Error("Invalid plugin format");
          await (db as any).plugins.add({
            enabled: plugin.enabled,
            libraryName: plugin.libraryName,
            url: plugin.url,
          });
        }
        for (const flow of data.flows) {
          if (typeof flow.id !== "string" || typeof flow.data !== "string")
            throw new Error("Invalid flow format");
          await (db as any).workflows.add({ data: flow.data });
        }
        getWorkflows();
        toast.success("Flows and plugins imported successfully");
      } catch (error: any) {
        toast.error(error.message || "Failed to import");
      }
    };
    input.click();
  };

  return (
    <div className="container mx-auto">
      <ToastContainer />
      <h1 className="text-4xl font-bold">Flows</h1>
      <br />
      <Link href={"/workflows/new"}>
        <Button>Create a Flow</Button>
      </Link>
      &nbsp;
      <Link href={"/install-custom-packages"}>
        <Button variant="outline">Install plugins</Button>
      </Link>
      &nbsp;
      <Button onClick={exportFlows}>Export flows</Button>
      &nbsp;
      <Button onClick={importFlows} variant="outline">
        Import flows
      </Button>
      <br />
      <br />
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {workflows.map((workflow, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {workflow.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {workflow.name}
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <DropdownMenu dir="ltr">
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Actions</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="start">
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={() => deleteWorkflow(workflow.id)}
                      >
                        Delete
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href={`/workflows/${workflow.id}/edit`}>
                          <span>Edit</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WorkflowsList;
