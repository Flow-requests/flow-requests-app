import z from "zod";

const DEFAULT_VALUES = {
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
};

const VALIDATION_BY_NODE_TYPES: {
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

const INITIAL_NODES = [
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

export { DEFAULT_VALUES, VALIDATION_BY_NODE_TYPES, INITIAL_NODES };
