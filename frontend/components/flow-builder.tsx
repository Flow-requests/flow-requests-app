"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Panel,
  type Connection,
  type Edge,
  type NodeTypes,
  useStoreApi,
} from "reactflow";
import "reactflow/dist/style.css";
import { ToastContainer, toast } from "react-toastify";
import yaml from "js-yaml";

import { StartNode } from "./nodes/start-node";
import { ApiNode } from "./nodes/api-node";
import { ConditionNode } from "./nodes/condition-node";
import { LoopNode } from "./nodes/loop-node";
import NodeConfigPanel from "./node-config-panel";
import { Button } from "@/components/ui/button";
import {
  GitBranch,
  PlusCircle,
  Save,
  Target,
  Shield,
  Play,
  Upload,
  Globe,
  Info,
  List,
  Settings,
} from "lucide-react";
import { z } from "zod";
import { CodeNode } from "./nodes/code-node";
import { EnvDataModal } from "./env-data-modal";
import { LogsModal } from "./logs-modal";
import { SettingsModal } from "./settings-modal";
import { AddCurlModal } from "./add-curl-modal";
import { FlowSidebar } from "./flow-sidebar";
import { CustomNode } from "./nodes/custom-node";
import ExecutionsDrawer from "./executions-drawer";
import { useRouter } from "next/navigation";
import useWorkflow from "@/hooks/useWorkflow";
import NativeNodeType from "@/types/native-node-type.type";
import Message from "@/types/message";
import EnvData from "@/types/env-data";
import VariableInput from "./variable-input";
import TYPE_OPTION_MENU from "@/types/type-option-menu";
import ChatComponent from "./chat-component";

const validationDataNodeTypes: {
  [key: string]: z.ZodObject<{ [key: string]: any }>;
} = {
  api: z.object({
    endpoint: z.string().min(3),
    method: z.enum(["GET", "POST", "DELETE", "PUT"]),
  }),
  start: z.object({}),
  condition: z.object({
    condition: z.object({
      left: z.any(),
      operator: z.string(),
      right: z.any(),
    }),
  }),
  code: z.object({
    code: z.string(),
  }),
  loop: z.object({
    source: z.string(),
  }),
};

const initialNodes = [
  {
    id: "1",
    type: "start",
    position: { x: 250, y: 100 },
    data: {
      label: "Start",
      name: "trigger_start_1",
    },
  },
];

const initialEdges: Array<{ [key: string]: any }> = [];

interface FlowBuilderProps {
  flowName?: string;
  onFlowNameChange?: (name: string) => void;
  workflowToEdit: any;
}

export default function FlowBuilder({
  workflowToEdit,
  flowName,
}: FlowBuilderProps) {
  const router = useRouter();
  const reactFlowWrapper = useRef(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [workflowId, setWorkflowId] = useState(null);
  const [defaultDataByNodeTypes, setDefaultDataByNodeTypes] = useState<{
    [key: string]: any;
  }>({
    api: {
      label: "API",
      name: "",
      endpoint: "https://webhook.site/18eb8dca-7fba-4512-bf61-21392e905b60",
      method: "GET",
      headers: null,
      body: null,
    },
    start: {
      label: "Start",
      name: "",
    },
    condition: {
      data: {
        label: "Condition",
        name: "",
        condition: {
          left: "1",
          operator: "==",
          right: "1",
        },
        trueLabel: "True",
        falseLabel: "False",
      },
    },
    code: {
      code: "function node() { console.log('Hello World') }",
    },
    loop: {
      label: "Loop",
      name: "",
      source: "",
    },
  });
  const [nodeTypes, setNodeTypes] = useState<NodeTypes>({
    start: StartNode,
    api: ApiNode,
    condition: ConditionNode,
    code: CodeNode,
    loop: LoopNode,
  });
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] =
    // @ts-ignore
    useEdgesState<Array<{ [key: string]: any }>>(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [customNodes, setCustomNodes] = useState<any[]>([]);
  const [httpRequestNodes, setHttpRequestNodes] = useState<any[]>([]);
  const [envData, setenvData] = useState<EnvData[]>([]);
  const [isEnvDataModalOpen, setIsEnvDataModalOpen] = useState(false);
  const [settingsData, setSettingsData] = useState<any[]>([
    { id: "openRouterToken", key: "openRouterToken", value: "" },
  ]);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAddCurlModalOpen, setIsAddCurlModalOpen] = useState(false);
  const [optionsMenu, setOptionsMenu] = useState<Array<string>>([
    "{{this.state.faker.person.firstName()}}",
    "{{this.state.faker.person.lastName()}}",
    "{{this.state.faker.person.fullName()}}",
    "{{this.state.faker.person.gender()}}",
    "{{this.state.faker.person.sex()}}",
    "{{this.state.faker.person.jobTitle()}}",
    "{{this.state.faker.person.jobArea()}}",
    "{{this.state.faker.person.jobDescriptor()}}",
    "{{this.state.faker.person.jobType()}}",
    "{{this.state.faker.person.prefix()}}",
    "{{this.state.faker.person.suffix()}}",
    "{{this.state.faker.person.middleName()}}",
    "{{this.state.faker.person.bio()}}",
    "{{this.state.faker.location.streetAddress()}}",
    "{{this.state.faker.location.city()}}",
    "{{this.state.faker.location.state()}}",
    "{{this.state.faker.location.zipCode()}}",
    "{{this.state.faker.location.country()}}",
    "{{this.state.faker.location.countryCode()}}",
    "{{this.state.faker.location.latitude()}}",
    "{{this.state.faker.location.longitude()}}",
    "{{this.state.faker.location.direction()}}",
    "{{this.state.faker.location.ordinalDirection()}}",
    "{{this.state.faker.location.nearbyGPSCoordinate()}}",
    "{{this.state.faker.location.timeZone()}}",
    "{{this.state.faker.location.streetName()}}",
    "{{this.state.faker.location.streetSuffix()}}",
    "{{this.state.faker.location.buildingNumber()}}",
    "{{this.state.faker.location.secondaryAddress()}}",
    "{{this.state.faker.internet.email()}}",
    "{{this.state.faker.internet.userName()}}",
    "{{this.state.faker.internet.password()}}",
    "{{this.state.faker.internet.url()}}",
    "{{this.state.faker.internet.domainName()}}",
    "{{this.state.faker.internet.domainSuffix()}}",
    "{{this.state.faker.internet.domainWord()}}",
    "{{this.state.faker.internet.ip()}}",
    "{{this.state.faker.internet.ipv6()}}",
    "{{this.state.faker.internet.port()}}",
    "{{this.state.faker.internet.userAgent()}}",
    "{{this.state.faker.internet.httpMethod()}}",
    "{{this.state.faker.internet.httpStatusCode()}}",
    "{{this.state.faker.internet.color()}}",
    "{{this.state.faker.internet.mac()}}",
    "{{this.state.faker.internet.emoji()}}",
    "{{this.state.faker.company.name()}}",
    "{{this.state.faker.company.suffix()}}",
    "{{this.state.faker.company.catchPhrase()}}",
    "{{this.state.faker.company.bs()}}",
    "{{this.state.faker.company.catchPhraseAdjective()}}",
    "{{this.state.faker.company.catchPhraseDescriptor()}}",
    "{{this.state.faker.company.catchPhraseNoun()}}",
    "{{this.state.faker.company.bsAdjective()}}",
    "{{this.state.faker.company.bsBuzz()}}",
    "{{this.state.faker.company.bsNoun()}}",
    "{{this.state.faker.finance.account()}}",
    "{{this.state.faker.finance.accountName()}}",
    "{{this.state.faker.finance.amount()}}",
    "{{this.state.faker.finance.bic()}}",
    "{{this.state.faker.finance.bitcoinAddress()}}",
    "{{this.state.faker.finance.creditCardCVV()}}",
    "{{this.state.faker.finance.creditCardIssuer()}}",
    "{{this.state.faker.finance.creditCardNumber()}}",
    "{{this.state.faker.finance.currencyCode()}}",
    "{{this.state.faker.finance.currencyName()}}",
    "{{this.state.faker.finance.currencySymbol()}}",
    "{{this.state.faker.finance.ethereumAddress()}}",
    "{{this.state.faker.finance.iban()}}",
    "{{this.state.faker.finance.litecoinAddress()}}",
    "{{this.state.faker.finance.mask()}}",
    "{{this.state.faker.finance.pin()}}",
    "{{this.state.faker.finance.routingNumber()}}",
    "{{this.state.faker.finance.transactionDescription()}}",
    "{{this.state.faker.finance.transactionType()}}",
    "{{this.state.faker.date.past()}}",
    "{{this.state.faker.date.future()}}",
    "{{this.state.faker.date.between()}}",
    "{{this.state.faker.date.recent()}}",
    "{{this.state.faker.date.soon()}}",
    "{{this.state.faker.date.birthdate()}}",
    "{{this.state.faker.date.month()}}",
    "{{this.state.faker.date.weekday()}}",
    "{{this.state.faker.lorem.word()}}",
    "{{this.state.faker.lorem.words()}}",
    "{{this.state.faker.lorem.sentence()}}",
    "{{this.state.faker.lorem.sentences()}}",
    "{{this.state.faker.lorem.paragraph()}}",
    "{{this.state.faker.lorem.paragraphs()}}",
    "{{this.state.faker.lorem.text()}}",
    "{{this.state.faker.lorem.lines()}}",
    "{{this.state.faker.lorem.slug()}}",
    "{{this.state.faker.phone.number()}}",
    "{{this.state.faker.phone.imei()}}",
    "{{this.state.faker.image.avatar()}}",
    "{{this.state.faker.image.url()}}",
    "{{this.state.faker.image.urlLoremFlickr()}}",
    "{{this.state.faker.image.urlPicsumPhotos()}}",
    "{{this.state.faker.image.urlPlaceholder()}}",
    "{{this.state.faker.image.dataUri()}}",
    "{{this.state.faker.animal.type()}}",
    "{{this.state.faker.animal.dog()}}",
    "{{this.state.faker.animal.cat()}}",
    "{{this.state.faker.animal.snake()}}",
    "{{this.state.faker.animal.bear()}}",
    "{{this.state.faker.animal.lion()}}",
    "{{this.state.faker.animal.cetacean()}}",
    "{{this.state.faker.animal.horse()}}",
    "{{this.state.faker.animal.bird()}}",
    "{{this.state.faker.animal.cow()}}",
    "{{this.state.faker.animal.fish()}}",
    "{{this.state.faker.animal.crocodilia()}}",
    "{{this.state.faker.animal.insect()}}",
    "{{this.state.faker.animal.rabbit()}}",
    "{{this.state.faker.vehicle.vehicle()}}",
    "{{this.state.faker.vehicle.manufacturer()}}",
    "{{this.state.faker.vehicle.model()}}",
    "{{this.state.faker.vehicle.type()}}",
    "{{this.state.faker.vehicle.fuel()}}",
    "{{this.state.faker.vehicle.vin()}}",
    "{{this.state.faker.vehicle.color()}}",
    "{{this.state.faker.vehicle.vrm()}}",
    "{{this.state.faker.commerce.department()}}",
    "{{this.state.faker.commerce.productName()}}",
    "{{this.state.faker.commerce.price()}}",
    "{{this.state.faker.commerce.productAdjective()}}",
    "{{this.state.faker.commerce.productMaterial()}}",
    "{{this.state.faker.commerce.product()}}",
    "{{this.state.faker.database.column()}}",
    "{{this.state.faker.database.type()}}",
    "{{this.state.faker.database.collation()}}",
    "{{this.state.faker.database.engine()}}",
    "{{this.state.faker.music.genre()}}",
    "{{this.state.faker.music.songName()}}",
    "{{this.state.faker.system.fileName()}}",
    "{{this.state.faker.system.commonFileName()}}",
    "{{this.state.faker.system.mimeType()}}",
    "{{this.state.faker.system.commonFileType()}}",
    "{{this.state.faker.system.commonFileExt()}}",
    "{{this.state.faker.system.fileType()}}",
    "{{this.state.faker.system.fileExt()}}",
    "{{this.state.faker.system.directoryPath()}}",
    "{{this.state.faker.system.filePath()}}",
    "{{this.state.faker.system.semver()}}",
    "{{this.state.faker.science.chemicalElement()}}",
    "{{this.state.faker.science.unit()}}",
    "{{this.state.faker.airline.airplane()}}",
    "{{this.state.faker.airline.airport()}}",
    "{{this.state.faker.airline.airline()}}",
    "{{this.state.faker.airline.aircraftType()}}",
    "{{this.state.faker.airline.flightNumber()}}",
    "{{this.state.faker.airline.seat()}}",
    "{{this.state.faker.airline.recordLocator()}}",
    "{{this.state.faker.color.human()}}",
    "{{this.state.faker.color.space()}}",
    "{{this.state.faker.color.cssSupportedFunction()}}",
    "{{this.state.faker.color.cssSupportedSpace()}}",
    "{{this.state.faker.color.rgb()}}",
    "{{this.state.faker.color.hsl()}}",
    "{{this.state.faker.color.hwb()}}",
    "{{this.state.faker.color.cmyk()}}",
    "{{this.state.faker.color.lab()}}",
    "{{this.state.faker.color.lch()}}",
    "{{this.state.faker.color.colorByCSSColorSpace()}}",
    "{{this.state.faker.git.branch()}}",
    "{{this.state.faker.git.commitEntry()}}",
    "{{this.state.faker.git.commitMessage()}}",
    "{{this.state.faker.git.commitSha()}}",
    "{{this.state.faker.git.shortSha()}}",
    "{{this.state.faker.hacker.abbreviation()}}",
    "{{this.state.faker.hacker.adjective()}}",
    "{{this.state.faker.hacker.noun()}}",
    "{{this.state.faker.hacker.verb()}}",
    "{{this.state.faker.hacker.ingverb()}}",
    "{{this.state.faker.hacker.phrase()}}",
    "{{this.state.faker.helpers.arrayElement()}}",
    "{{this.state.faker.helpers.arrayElements()}}",
    "{{this.state.faker.helpers.shuffle()}}",
    "{{this.state.faker.helpers.unique()}}",
    "{{this.state.faker.helpers.mustache()}}",
    "{{this.state.faker.helpers.createCard()}}",
    "{{this.state.faker.helpers.contextualCard()}}",
    "{{this.state.faker.helpers.userCard()}}",
    "{{this.state.faker.helpers.createTransaction()}}",
    "{{this.state.faker.helpers.rangeToNumber()}}",
    "{{this.state.faker.helpers.regexpStyleStringParse()}}",
    "{{this.state.faker.helpers.fromRegExp()}}",
    "{{this.state.faker.helpers.replaceSymbolWithNumber()}}",
    "{{this.state.faker.helpers.replaceSymbols()}}",
    "{{this.state.faker.helpers.slugify()}}",
    "{{this.state.faker.helpers.enumValue()}}",
    "{{this.state.faker.helpers.objectKey()}}",
    "{{this.state.faker.helpers.objectValue()}}",
    "{{this.state.faker.helpers.weightedArrayElement()}}",
    "{{this.state.faker.datatype.boolean()}}",
    "{{this.state.faker.datatype.number()}}",
    "{{this.state.faker.datatype.float()}}",
    "{{this.state.faker.datatype.datetime()}}",
    "{{this.state.faker.datatype.string()}}",
    "{{this.state.faker.datatype.uuid()}}",
    "{{this.state.faker.datatype.json()}}",
    "{{this.state.faker.datatype.hexadecimal()}}",
    "{{this.state.faker.random.word()}}",
    "{{this.state.faker.random.words()}}",
    "{{this.state.faker.random.locale()}}",
    "{{this.state.faker.string.alpha()}}",
    "{{this.state.faker.string.alphanumeric()}}",
    "{{this.state.faker.string.binary()}}",
    "{{this.state.faker.string.hexadecimal()}}",
    "{{this.state.faker.string.numeric()}}",
    "{{this.state.faker.string.octal()}}",
    "{{this.state.faker.string.symbol()}}",
    "{{this.state.faker.string.fromCharacters()}}",
    "{{this.state.faker.string.uuid()}}",
    "{{this.state.faker.string.nanoid()}}",
    "{{this.state.faker.number.int()}}",
    "{{this.state.faker.number.float()}}",
    "{{this.state.faker.number.bigInt()}}",
  ]);

  const {
    updateWorkflow,
    runWorkflow,
    logs,
    isLogsModalOpen,
    setIsLogsModalOpen,
    isRunningWorkflow,
    getCustomNodes,
    createWorkflow,
    handleUserChatMessage,
  } = useWorkflow();

  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your workflow assistant. Describe what workflow you'd like to create, and I'll help you build it step by step.",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);

  const addNewNode = (data: { [key: string]: any }) => {
    const httpRequestNodeItem: { [key: string]: any } = httpRequestNodes.find(
      (item) => {
        return item.label == data.label;
      }
    );

    if (httpRequestNodeItem) {
      addNode(data.type, { ...httpRequestNodeItem });
      return;
    }

    const customData: { [key: string]: any } = {};
    const nodeToAdd = data;
    if (nodeToAdd?.properties?.length > 0) {
      nodeToAdd.properties.forEach((item: any) => {
        customData[item.name] = item.default || "";
      });
    }

    if (nodeToAdd.type == "condition") {
      customData.condition = {
        ...customData,
      };
    }

    addNode(nodeToAdd.type, customData);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        const doc = yaml.load(content) as any;
        let items: any[] = [];
        for (const item of doc.collection) {
          if (item.children) {
            for (const child of item.children) {
              items.push({
                description: `${item.name} - ${child.name}`,
                name: `${item.name
                  .toLowerCase()
                  .replace(/\s|-/g, "_")}_${child.name
                  .toLowerCase()
                  .replace(/\s|-/g, "_")}`,
                url: child.url,
                method: child.method,
                body: Object.keys(child.body || {}).map((key) => ({
                  key: key,
                  value: child.body[key],
                  expression: "raw",
                })),
                headers: child.headers
                  ? child.headers.map((h: any) => ({
                      key: h.name,
                      value: h.value,
                      expression: "raw",
                    }))
                  : [],
              });
            }
          } else {
            let requestBody: { [key: string]: any } = {};
            Object.keys(item.body || {}).forEach((key) => {
              let value = item.body[key];
              try {
                value = JSON.parse(item.body[key]);
                requestBody = {
                  ...requestBody,
                  ...value,
                };
              } catch (error) {
                requestBody[key] = item.body[key];
              }
            });

            console.log(requestBody);
            items.push({
              description: `${item.name}`,
              name: item.name.toLowerCase().replace(/\s|-/g, "_"),
              url: item.url,
              method: item.method,
              body: Object.keys(requestBody || {}).map((key) => ({
                key: key,
                value: requestBody[key],
              })),
              headers: item.headers
                ? item.headers.map((h: any) => ({
                    key: h.name,
                    value: h.value,
                  }))
                : [],
            });
          }
        }

        items = items.map((item) => {
          return {
            type: "api",
            label: item.name,
            icon: Globe,
            name: item.name,
            endpoint: item.url,
            method: item.method,
            headers: item.headers,
            body: item.body,
            description: item.description,
            color: "text-blue-500",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
          };
        });

        console.log(items);
        setHttpRequestNodes([...items]);
        toast.success(`Uploaded ${items.length} API requests`);
      } catch (err) {
        console.error(err);
        toast.error("Error parsing YAML file");
      }
    };
    reader.readAsText(file);
  };

  const editNode = (data: { [key: string]: any }) => {
    let items: Array<any> = [...nodes];
    items = items.map((item) => {
      if (item.id == data?.id) {
        return data;
      }
      return item;
    });

    setNodes([...items]);
  };

  const handleSendMessage = async (content: string) => {
    try {
      const response = await handleUserChatMessage(content, [
        ...nodes,
        ...httpRequestNodes,
      ]);

      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content,
          sender: "user",
          timestamp: new Date(),
        },
      ]);

      if (typeof response.data.result == "string") {
        setChatMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            content: `${response.data.result}`,
            sender: "assistant",
            timestamp: new Date(),
          },
        ]);

        return;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: `Node generated is: ${JSON.stringify(
            response.data.result,
            null,
            2
          )}`,
          sender: "assistant",
          timestamp: new Date(),
        },
      ]);

      const hasEdit =
        nodes.find((item) => item?.id == response.data.result?.id) != null;
      if (!hasEdit) {
        addNewNode(response.data.result);
      } else {
        editNode(response.data.result);
      }
    } catch (error: any) {
      if (error?.response?.data?.error) {
        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            content,
            sender: "user",
            timestamp: new Date(),
          },
        ]);

        setChatMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            content: `I'm sorry, but I couldn't generate the node. Error: ${error.response.data.error}`,
            sender: "assistant",
            timestamp: new Date(),
          },
        ]);
      }

      console.log(error);
    }
  };

  const onConnect = (params: Connection | Edge) => {
    const mapNodesById: { [key: string]: any } = {};

    for (let index = 0; index < nodes.length; index += 1) {
      const item = nodes[index];
      mapNodesById[item.id] = item;
    }

    // @ts-ignore
    const nodeByType = mapNodesById[params?.source];
    const isSourceConditionNode = nodeByType && nodeByType.type == "condition";
    const isSourceLoopNode = nodeByType && nodeByType.type == "loop";
    if (isSourceConditionNode || isSourceLoopNode) {
      // @ts-ignore
      params.parentId = params.source;
      // @ts-ignore
      params.pathCondition = params.sourceHandle;
    } else {
      const sourceEdge = edges.filter((edge) => edge.target == params.source);
      //@ts-ignore
      if (sourceEdge[0] && sourceEdge[0].parentId) {
        // @ts-ignore
        params.parentId = sourceEdge[0].parentId;
        // @ts-ignore
        params.pathCondition = sourceEdge[0].pathCondition;
      }
    }

    setEdges((eds) => addEdge(params, eds));
  };

  const onNodeClick = (_: any, node: any) => {
    setSelectedNode({ ...node });
  };

  const onNodeConfigChange = (nodeId: string, newData: any = {}) => {
    setNodes((nds) => [
      ...nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...newData,
            },
          };
        }
        return node;
      }),
    ]);
  };

  const addNode = (type: string, customData: { [key: string]: any }) => {
    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
    const data = {
      ...defaultDataByNodeTypes[type],
      label: type.charAt(0).toUpperCase() + type.slice(1),
      name: `trigger_${typeLabel}_${nodes.length + 1}`.toLowerCase(),
      ...customData,
    };

    setOptionsOfMenu(TYPE_OPTION_MENU.NEW_NODE, data.name);

    const newNode = {
      id: `${nodes.length + 1}`,
      type,
      position: {
        x: 250,
        y: nodes.length > 0 ? nodes[nodes.length - 1].position.y + 150 : 100,
      },
      data,
    };

    setNodes((nds) => [...nds, { ...newNode }]);
  };

  const closeConfigPanel = () => {
    setSelectedNode(null);
  };

  const duplicateNode = (nodeId: string) => {
    const node = nodes.find((node) => node.id === nodeId);
    if (!node) {
      return;
    }

    // @ts-ignore
    const typeLabel = node.type.charAt(0).toUpperCase() + node.type.slice(1);
    const newNode = {
      id: `${nodes.length + 2}`,
      type: node.type,
      position: {
        x: 250,
        y: nodes.length > 0 ? nodes[nodes.length - 1].position.y + 150 : 100,
      },
      data: { ...node.data },
    };

    // @ts-ignore
    newNode.data.label = node.type.charAt(0).toUpperCase() + node.type.slice(1);
    newNode.data.name = `trigger_${typeLabel}_${
      nodes.length + 1
    }`.toLowerCase();
    setNodes((nds) => [...nds, { ...newNode }]);
  };

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
      // @ts-ignore
      if (selectedNode && selectedNode.id === nodeId) {
        setSelectedNode(null);
      }
    },
    [selectedNode, setNodes, setEdges]
  );

  const parseToSave = (
    item: { [key: string]: any },
    mapNodesById: { [key: string]: any },
    ignoreNodeById: { [key: string]: any },
    index: number
  ) => {
    if (item.type == NativeNodeType.start) {
      return {
        type: item.type,
        name: item.data.name,
        input: {},
        output: {},
      };
    } else if (item.type == NativeNodeType.code) {
      return {
        type: item.type,
        name: item.data.name,
        setting: {
          code: btoa(unescape(encodeURIComponent(item.data.code))),
          params: item.data.params,
        },
        input: {},
        output: {},
      };
    } else if (item.type == NativeNodeType.api) {
      return {
        type: item.type,
        name: item.data.name,
        setting: {
          method: item.data.method,
          url: item.data.endpoint,
          headers: item.data.headers,
          body: item.data.body,
        },
        input: {},
        output: {},
      };
    } else if (item.type == NativeNodeType.condition) {
      // @ts-ignore
      const left = item?.data?.condition?.left;
      const leftType = left.startsWith("this.state") ? "expression" : "raw";
      // @ts-ignore
      const right = item?.data?.condition?.right;
      const rightType = right.startsWith("this.state") ? "expression" : "raw";

      // @ts-ignore
      const operator = item?.data?.condition?.operator;

      const itemToAdd = {
        type: item.type,
        name: item.data.name,
        setting: {
          condition: {
            left: {
              type: leftType,
              value: left,
            },
            right: {
              type: rightType,
              value: right,
            },
            operator: operator,
          },
          success: [],
          fail: [],
        },
        input: {},
        output: {},
      };

      // @ts-ignore
      itemToAdd.setting.success = edges
        .filter((option: { [key: string]: any }) => {
          return (
            // @ts-ignore
            option.parentId == item.id && option.pathCondition == "true"
          );
        })
        .map((option: { [key: string]: any }) => {
          const node = mapNodesById[option.target];
          ignoreNodeById[node.id] = true;
          return parseToSave(node, mapNodesById, ignoreNodeById, index);
        });

      // @ts-ignore
      itemToAdd.setting.fail = edges
        .filter((option: { [key: string]: any }) => {
          return (
            // @ts-ignore
            option.parentId == item.id && option.pathCondition == "false"
          );
        })
        .map((option: { [key: string]: any }) => {
          const node = mapNodesById[option.target];
          ignoreNodeById[node.id] = true;
          return parseToSave(node, mapNodesById, ignoreNodeById, index);
        });

      return itemToAdd;
    } else if (item.type == NativeNodeType.loop) {
      const itemToAdd = {
        type: item.type,
        name: item.data.name,
        setting: {
          source: item.data.source || [],
          nodes: [],
        },
        input: {},
        output: {},
      };

      // @ts-ignore
      itemToAdd.setting.nodes = edges
        .filter((option: { [key: string]: any }) => {
          return (
            // @ts-ignore
            option.parentId == item.id && option.pathCondition == "loop"
          );
        })
        .map((option: { [key: string]: any }, index: number) => {
          const node = mapNodesById[option.target];
          ignoreNodeById[node.id] = true;
          return parseToSave(node, mapNodesById, ignoreNodeById, index);
        });

      return itemToAdd;
    }

    const itemData = item.data;
    delete itemData.isCustomNode;
    delete itemData.name;

    const typeLabel = item.type.charAt(0).toUpperCase() + item.type.slice(1);
    item.data.name = `trigger_${typeLabel}_${index + 1}`.toLowerCase();

    return {
      type: item.type,
      name: item.data.name,
      setting: itemData,
      input: {},
      output: {},
    };
  };

  const saveWorkflow = async (isTest: boolean = false) => {
    if (nodes.length == 0) {
      toast.error("You need at least one node to start the Worflow");
      return;
    }

    const triggerEvent = nodes[0].type;
    const workflow: { [key: string]: any } = {
      triggerEvent,
      nodes: [],
    };

    const mapNodesById: { [key: string]: any } = {};
    const nodesToProcess = [...nodes];
    for (let index = 0; index < nodesToProcess.length; index += 1) {
      const item = nodesToProcess[index];
      // @ts-ignore

      const isCustomNode = !validationDataNodeTypes[item.type];
      if (isCustomNode) {
        const schema = {};

        // @ts-ignore
        item.data.properties
          .filter((property: any) => property.required)
          .forEach((property: { [key: string]: any }) => {
            if (property.name) {
              if (property.required) {
                // @ts-ignore
                schema[property.name] = z.string();
              } else {
                // @ts-ignore
                schema[property.name] = z.string().optional();
              }
            }
          });

        const schemaValidation = z.object(schema);
        const result = schemaValidation.safeParse(item.data);
        if (!result.success) {
          toast.error(
            `You need to fill the information of the node ${item.data.name}`
          );
          return;
        }
      } else {
        // @ts-ignore
        const schemaValidation = validationDataNodeTypes[item.type] as z.Schema;
        const result = schemaValidation.safeParse(item.data);

        if (!result.success) {
          toast.error(
            // @ts-ignore
            `You need to fill the information of the node ${item.data.name}`
          );
          return;
        }
      }

      mapNodesById[item.id] = item;
    }

    const ignoreNodeById: { [key: string]: boolean } = {};
    for (let index = 0; index < nodesToProcess.length; index += 1) {
      const item = nodesToProcess[index];
      if (ignoreNodeById[item.id]) {
        continue;
      }

      workflow.nodes.push(
        parseToSave(item, mapNodesById, ignoreNodeById, index)
      );
    }

    if (isTest) {
      runWorkflow({
        isEditMode: workflowToEdit != null,
        workflowId: workflowToEdit?.id,
        contextVariables: [],
        envData: [...envData],
        name: flowName || "",
        originalWorkflow: {
          nodes: [...nodes],
          edges: [...edges],
        },
        ...workflow,
      });
      return;
    }

    if (workflowId) {
      await updateWorkflow({
        workflowId: workflowId,
        contextVariables: [],
        name: flowName || "",
        envData: [...envData],
        originalWorkflow: {
          nodes: [...nodes],
          edges: [...edges],
        },
        ...workflow,
      });
    } else {
      const workflowCreated = await createWorkflow({
        contextVariables: [],
        envData: [...envData],
        name: flowName || "",
        originalWorkflow: {
          nodes: [...nodes],
          edges: [...edges],
        },
        nodes: [...workflow.nodes],
      });

      setTimeout(() => {
        router.push(`/workflows/${workflowCreated.id}/edit`);
      }, 1000);
    }
  };

  const loadCustomNodes = async () => {
    const customNodes = await getCustomNodes();
    const items: any[] = [];
    const itemsTypes: any = {};
    const defaultDataByNodeTypesToCustomNodes: { [key: string]: any } = {};
    customNodes.forEach((node: any) => {
      itemsTypes[node.name] = CustomNode;
      const defaultData: { [key: string]: any } = {};
      node.properties.forEach((prop: any) => {
        defaultData[prop.name] = prop.default;
      });

      defaultDataByNodeTypesToCustomNodes[node.name] = {
        ...defaultData,
        properties: node.properties,
        isCustomNode: node.isCustomNode,
      };

      items.push({
        type: node.name,
        label: node.name,
        icon: GitBranch,
        description: node.description,
        color: "text-blue-500",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
      });
    });

    setCustomNodes(items);
    setNodeTypes({ ...nodeTypes, ...itemsTypes });
    setDefaultDataByNodeTypes({
      ...defaultDataByNodeTypes,
      ...defaultDataByNodeTypesToCustomNodes,
    });
  };

  const setOptionsOfMenu = (
    type: string,
    values: Array<string> | string | EnvData[]
  ) => {
    if (type == TYPE_OPTION_MENU.ENV_DATA) {
      const items: EnvData[] = values as EnvData[];
      setOptionsMenu((oldOptionsMenu) => [
        ...oldOptionsMenu,
        ...items.map((item) => `{{this.state.envData.${item.key}}}`),
      ]);
    } else if (type == TYPE_OPTION_MENU.NEW_NODE) {
      const item: string = values as string;
      setOptionsMenu((oldOptionsMenu) => [
        ...oldOptionsMenu,
        `{{this.state.steps.${item}.output}}`,
      ]);
    } else if (type == TYPE_OPTION_MENU.NEW_MANY_NODES) {
      let items: Array<string> = values as Array<string>;
      items = items.map((item) => `{{this.state.steps.${item}.output}}`);
      setOptionsMenu((oldOptionsMenu) => [...oldOptionsMenu, ...items]);
    }
  };

  useEffect(() => {
    if (workflowToEdit) {
      loadCustomNodes().then(() => {
        workflowToEdit.originalWorkflow.nodes =
          workflowToEdit.originalWorkflow.nodes.map(
            (node: any, index: number) => {
              const type = node.type;
              const nodeDefaultData = defaultDataByNodeTypes[type];
              node.data.isCustomNode = nodeDefaultData.isCustomNode || false;
              const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
              node.data.name = `trigger_${typeLabel}_${
                index + 1
              }`.toLowerCase();
              return node;
            }
          );

        let nodesName: Array<string> =
          workflowToEdit.originalWorkflow.nodes.map(
            (item: { [key: string]: any }) => item?.data?.name
          );

        setNodes(workflowToEdit.originalWorkflow.nodes);
        setEdges(workflowToEdit.originalWorkflow.edges);
        setWorkflowId(workflowToEdit.id);
        setenvData([...workflowToEdit.envData]);
        setOptionsOfMenu(TYPE_OPTION_MENU.NEW_MANY_NODES, nodesName);
        setOptionsOfMenu(TYPE_OPTION_MENU.ENV_DATA, workflowToEdit.envData);
      });
    }
  }, [workflowToEdit]);

  useEffect(() => {
    document.title = `${flowName} - Flow Request Builder`;
  }, [flowName]);

  useEffect(() => {
    if (!workflowToEdit) {
      loadCustomNodes();
    }
  }, []);

  useEffect(() => {
    const savedSettings = localStorage.getItem("appSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettingsData(
          parsed.length > 0
            ? parsed
            : [{ id: "openRouterToken", key: "openRouterToken", value: "" }]
        );
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    }
  }, []);

  return (
    <div className="relative h-full">
      <ReactFlowProvider>
        <div ref={reactFlowWrapper} className="w-full h-[calc(100vh-4rem)]">
          <ReactFlow
            nodes={nodes.map((node) => ({
              ...node,
              data: {
                ...node.data,
                deleteNode: () => deleteNode(node.id),
                duplicateNode: () => duplicateNode(node.id),
              },
            }))}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="w-full h-full"
          >
            <Controls />
            <Background />
            <Panel position="top-right" className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsSettingsModalOpen(true)}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Collections
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => saveWorkflow(true)}
              >
                <Play className="mr-2 h-4 w-4" />
                Run Flow
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEnvDataModalOpen(true)}
              >
                <List className="mr-2 h-4 w-4" />
                Env Data
              </Button>
              <Button size="sm" onClick={() => saveWorkflow()}>
                <Save className="mr-2 h-4 w-4" />
                Save Flow
              </Button>
            </Panel>
            <Panel position="top-left" className="mt-4">
              <FlowSidebar
                onAddNode={addNode}
                httpRequestNodes={httpRequestNodes}
                customNodes={customNodes}
                onAddCurl={() => setIsAddCurlModalOpen(true)}
              />
            </Panel>
          </ReactFlow>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".yaml,.yml"
            style={{ display: "none" }}
          />

          <ChatComponent
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            placeholder="Need help with workflow creation?"
            maxHeight="300px"
            className="w-90 h-[400px]"
            title="Workflow Assistant"
            isFloating={true}
            defaultPosition={{ x: 350, y: 100 }}
            defaultMinimized={true}
          />
        </div>
        {selectedNode && (
          <NodeConfigPanel
            optionsMenu={optionsMenu}
            node={selectedNode}
            onChange={onNodeConfigChange}
            onClose={closeConfigPanel}
            isOpen={!!selectedNode}
          />
        )}
        <EnvDataModal
          isOpen={isEnvDataModalOpen}
          onClose={() => setIsEnvDataModalOpen(false)}
          envData={envData}
          onSave={(data) => {
            setOptionsOfMenu(TYPE_OPTION_MENU.ENV_DATA, data);
            setenvData(data);
          }}
        />
        <LogsModal
          isOpen={isLogsModalOpen}
          onClose={() => setIsLogsModalOpen(false)}
          logs={logs}
          isLoading={isRunningWorkflow}
        />
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          settings={settingsData}
          onSave={(data) => {
            setSettingsData(data);
            localStorage.setItem("appSettings", JSON.stringify(data));
          }}
        />
        <AddCurlModal
          isOpen={isAddCurlModalOpen}
          onClose={() => setIsAddCurlModalOpen(false)}
          onSave={(nodeData) => {
            addNode("api", nodeData);
          }}
        />
      </ReactFlowProvider>
      <ToastContainer />
    </div>
  );
}
