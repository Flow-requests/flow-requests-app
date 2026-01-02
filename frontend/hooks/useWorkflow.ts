import { useState } from "react";
import Workflow from "../types/workflow";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import LogEntry from "../types/log-entry";
import Execution from "@/types/execution";
import EnvData from "@/types/env-data";
import WorkflowEngine from "@/services/workflow/workflow-engine";
import CustomNodeManager from "@/utils/custom-node-manager.util";
import PackageUtil from "@/utils/package.util";
import { Dexie } from "dexie";
import WorkflowAssistantService from "@/services/workflow/workflow-assistant.service";
import { convertResponsesDeltaToChatGenerationChunk } from "@langchain/openai";

function useWorkflow() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [isRunningWorkflow, setIsRunningWorkflow] = useState(false);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getWorkflows = async () => {
    try {
      const db = new Dexie("FlowRequests");
      db.version(1).stores({
        workflows: "++id",
      });
      let results = await db.workflows.toArray();
      results = results.map((item) => {
        const data = JSON.parse(item.data);
        return { id: item.id, name: data.name, data: JSON.parse(item.data) };
      });
      setWorkflows(results);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch workflows");
    }
  };

  const triggerWorkflow = async (workflowId: string) => {
    await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/workflows/${workflowId}/trigger`
    );
    toast.success("Workflow triggered successfully");
  };

  const deleteWorkflow = async (workflowId: string) => {
    const db = new Dexie("FlowRequests");
    db.version(1).stores({
      workflows: "++id",
    });
    await db.workflows.delete(workflowId);
    getWorkflows();
  };

  function getLogs(steps: any) {
    const logs: Array<{ step: string; output: any; input: any }> = [];
    Object.keys(steps).forEach((key) => {
      logs.push({
        step: key,
        output: steps[key].output,
        input: steps[key].input,
      });
    });
    return logs;
  }

  const runWorkflow = async (data: {
    isEditMode: boolean;
    workflowId: string;
    contextVariables: [];
    envData: EnvData[];
    name: string;
    originalWorkflow: {
      nodes: any[];
      edges: any[];
    };
    [key: string]: any;
  }) => {
    setIsRunningWorkflow(true);
    setIsLogsModalOpen(true);
    try {
      const db = new Dexie("FlowRequests");
      db.version(1).stores({
        plugins: "++id",
      });

      const results = await db.plugins.toArray();
      const packageUtil = new PackageUtil();
      const customNodeManager = new CustomNodeManager(results, packageUtil);
      const workflowEngine = new WorkflowEngine(customNodeManager);

      await workflowEngine.process(
        {
          nodes: data.nodes || [],
          envData: data.envData,
        },
        {}
      );

      const states = workflowEngine.getState();
      setLogs(getLogs(states.steps));
      toast.success("Workflow executed successfully");
    } catch (error: any) {
      if (error.response instanceof AxiosError) {
        toast.error(error.response.data.error);
      }
      setLogs([]);
    } finally {
      setIsRunningWorkflow(false);
    }
  };

  const getWorkflowById = async (id: string) => {
    const db = new Dexie("FlowRequests");
    db.version(1).stores({
      workflows: "++id",
    });
    const results = await db.workflows.toArray();
    const data = results.find((item) => item.id == id);
    setWorkflow(JSON.parse(data.data));
  };

  const updateWorkflow = async (data: {
    workflowId: string;
    contextVariables: [];
    envData: EnvData[];
    name: string;
    originalWorkflow: {
      nodes: any[];
      edges: any[];
    };
    [key: string]: any;
  }) => {
    const db = new Dexie("FlowRequests");
    db.version(1).stores({
      workflows: "++id",
    });
    await db.workflows.update(data.workflowId, {
      data: JSON.stringify(data),
    });
    toast.success("Workflow atualizado com sucesso");
  };

  const getCustomNodes = async () => {
    const db = new Dexie("FlowRequests");
    db.version(1).stores({
      plugins: "++id",
    });

    const results = await db.plugins.toArray();
    const packageUtil = new PackageUtil();
    const plugins = await packageUtil.load(results, {});
    return plugins.map((item) => item.getConfig());
  };

  const createWorkflow = async (data: {
    envData: EnvData[];
    name: string;
    nodes: Array<any>;
    originalWorkflow: {
      nodes: any[];
      edges: any[];
    };
    [key: string]: any;
  }) => {
    const db = new Dexie("FlowRequests");
    db.version(1).stores({
      workflows: "++id",
    });

    const workflowCreatedId = await db.workflows.add({
      data: JSON.stringify(data),
    });

    toast.success("Workflow created successfully");
    return { id: workflowCreatedId };
  };

  const fetchExecutions = async (workflowId: string) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/workflows/${workflowId}/executions`
      );
      setExecutions(response.data);
    } catch (error) {
      toast.error("Failed to fetch executions");
    } finally {
      setIsLoading(false);
    }
  };

  const getCustomNodesToUseAiAssistant = async () => {
    const db = new Dexie("FlowRequests");
    db.version(1).stores({
      plugins: "++id",
    });

    const results = await db.plugins.toArray();
    const packageUtil = new PackageUtil();
    return packageUtil.load(results, {});
  };

  const handleUserChatMessage = async (content: string, nodes: Array<any>) => {
    try {
      const customNodes = await getCustomNodesToUseAiAssistant();
      const workflowAssistant = new WorkflowAssistantService(customNodes);
      const answer = await workflowAssistant.processUserMessage(nodes, content);

      return {
        data: {
          result: answer,
        },
      };
    } catch (error) {
      console.log(error);
      return {
        data: {
          result: error.message || error.response.data.error.messa,
        },
      };
    }
  };

  return {
    workflows,
    getWorkflows,
    triggerWorkflow,
    deleteWorkflow,
    getWorkflowById,
    workflow,
    runWorkflow,
    logs,
    isLogsModalOpen,
    setIsLogsModalOpen,
    isRunningWorkflow,
    updateWorkflow,
    getCustomNodes,
    createWorkflow,
    executions,
    isLoading,
    fetchExecutions,
    handleUserChatMessage,
  };
}

export default useWorkflow;
