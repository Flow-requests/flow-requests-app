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
    console.log(id);
    // const data = await db.workflows.where({ id: id }).toArray();
    const results = await db.workflows.toArray();

    const data = results.find((item) => item.id == id);

    console.log(results);
    console.log(data);
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
    console.log(data.workflowId);
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
    console.log(plugins[0].getConfig());

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

  const handleUserChatMessage = async (content: string, nodes: Array<any>) => {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/workflows-assistant`,
      {
        currentNodes: nodes || [],
        prompt: content,
      }
    );

    return response;
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
