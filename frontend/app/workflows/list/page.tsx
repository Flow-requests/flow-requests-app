"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import useWorkflow from "@/hooks/useWorkflow";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToastContainer, toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const WorkflowsList = () => {
  const { importFlows, exportFlows, deleteWorkflow, workflows, getWorkflows } =
    useWorkflow();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
  const promptText = `Role: You are an expert integration engineer specializing in workflow automation and JSON schema mapping.
Task: Convert a custom "Flow Remote Execution" JSON object into a standard n8n workflow JSON file.
Input Data:  ${selectedWorkflow ? JSON.stringify(selectedWorkflow.data) : ""}
Mapping Rules:
Nodes:
type: "start" → Map to n8n-nodes-base.manualTrigger (Version 1).
type: "api" → Map to n8n-nodes-base.httpRequest (Version 4.1).
HTTP Request Logic:
Use the endpoint field from the source for the n8n url.
Use the method field (GET, POST, etc.).
If body contains data, set sendBody: true, specifyBody: "json", and format the jsonBody.
Expressions: - Translate source syntax {{this.state.steps.[NODE_NAME].output}} into n8n expression syntax {{ $[NODE_NAME].item.json }} or {{ $json }} if it refers to the immediate previous node.
Layout: - Preserve the x and y coordinates but scale them (e.g., multiply by 1.2) to fit the n8n grid.
Connections:
Reconstruct the connections object based on the edges or the sequential order defined in the source.
Output Format:
Return only the raw JSON code for the n8n workflow. Ensure the JSON is valid and ready to be imported or pasted directly into n8n.
Why this works:
Role Definition: By assigning the "Integration Engineer" role, the AI prioritizes technical accuracy in the JSON structure.
Explicit Mapping: It explicitly tells the AI which n8n node types to use for your specific source types (e.g., mapping "start" to "manualTrigger").
Version Control: Specifying typeVersion: 4.1 for the HTTP Request ensures compatibility with the latest n8n features.
Expression Handling: It solves the hardest part of conversion: translating how data is referenced between steps (from this.state.steps to $json).
Output Constraint: By asking for "only raw JSON," you ensure the response is clean and can be saved directly as a .json file.`;

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      toast.success("Prompt copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy prompt");
    }
  };

  useEffect(() => {
    getWorkflows();
  }, []);

  return (
    <div className="container mx-auto">
      <ToastContainer />
      <h1 className="text-4xl font-bold">Flows</h1>
      <br />
      <Link href={"/workflows/new"}>
        <Button>Create a Flow</Button>
      </Link>
      &nbsp;
      <Link href={"/install-custom-plugins"}>
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
                        <Link href={`/workflows/edit?id=${workflow.id}`}>
                          <span>Edit</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedWorkflow(workflow);
                          setIsModalOpen(true);
                        }}
                      >
                        Convert to N8N
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert to N8N</DialogTitle>
          </DialogHeader>
          <Textarea
            value={promptText}
            readOnly
            rows={20}
            style={{ height: "250px" }}
          />
          <DialogFooter>
            <Button onClick={copyPrompt}>Copy the prompt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkflowsList;
