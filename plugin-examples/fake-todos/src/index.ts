import axios from "axios";
import {
  NodeBase,
  NodeConfig,
  NodeInput,
  NodeReturn,
} from "core-package-mini-n8n";

class FakeTodosNode extends NodeBase {
  constructor(state: any) {
    super(state);
  }

  getConfig(): NodeConfig {
    return {
      name: "FakeTodos", // Name e type needs to be the same
      type: "FakeTodos", // Name e type needs to be the same
      description: "fake todos plugin",
      ai_description: "Node to make api or http request to get fake todos",
      properties: [
        {
          label: "Operation",
          name: "operation",
          type: "select",
          required: true,
          default: "getAll",
          options: [
            {
              label: "Get all",
              value: "getAll",
            },
            {
              label: "Get by id",
              value: "getById",
            },
            {
              label: "Delete by id",
              value: "deleteById",
            },
            {
              label: "Create todo",
              value: "createTodo",
            },
          ],
        },
        {
          label: "Id",
          name: "id",
          type: "text",
          required: false,
          default: null,
          conditionShow: [
            {
              keyCheck: "operation",
              valueExpected: "getById",
            },
          ],
        },
        {
          label: "Id",
          name: "id",
          type: "text",
          required: false,
          default: null,
          conditionShow: [
            {
              keyCheck: "operation",
              valueExpected: "deleteById",
            },
          ],
        },
        {
          label: "Description",
          name: "todo",
          type: "text",
          required: false,
          default: null,
          conditionShow: [
            {
              keyCheck: "operation",
              valueExpected: "createTodo",
            },
          ],
        },
        {
          label: "Is done?",
          name: "todo",
          type: "select",
          required: false,
          default: false,
          options: [
            {
              label: "Yes",
              value: "true",
            },
            {
              label: "No",
              value: "false",
            },
          ],
          conditionShow: [
            {
              keyCheck: "operation",
              valueExpected: "createTodo",
            },
          ],
        },
        {
          label: "User id",
          name: "userId",
          type: "text",
          required: false,
          default: null,
          conditionShow: [
            {
              keyCheck: "operation",
              valueExpected: "createTodo",
            },
          ],
        },
      ],
    };
  }

  async execute(node: NodeInput): Promise<NodeReturn> {
    const setting = node.settings;
    if (setting.operation == "getAll") {
      const { data } = await axios.get("https://dummyjson.com/todos");
      return data;
    } else if (setting.operation == "getById") {
      if (!setting.id) {
        throw new Error("You need to provide the id");
      }

      const { data } = await axios.get(
        `https://dummyjson.com/todos/${this.parseExpression(setting.id)}`
      );

      return data;
    } else if (setting.operation == "deleteById") {
      if (!setting.id) {
        throw new Error("You need to provide the id");
      }

      await axios.delete(
        `https://dummyjson.com/todos/${this.parseExpression(setting.id)}`
      );

      return { removed: true };
    } else if (setting.operation == "createTodo") {
      await axios.post(`https://dummyjson.com/todos`, {
        todo: setting.todo,
        completed: setting.completed,
        userId: setting.userId,
      });
      return { created: true };
    }

    return { ok: true };
  }
}

export default FakeTodosNode;
