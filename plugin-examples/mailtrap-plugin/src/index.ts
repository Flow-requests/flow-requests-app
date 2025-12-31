import axios from "axios";
import {
  NodeBase,
  NodeConfig,
  NodeInput,
  NodeReturn,
} from "core-package-mini-n8n";

class MailtrapNode extends NodeBase {
  constructor(state: any) {
    super(state);
  }

  getConfig(): NodeConfig {
    return {
      name: "MailtrapPlugin", // Name e type needs to be the same
      type: "MailtrapPlugin", // Name e type needs to be the same
      description: "Mailtrap plugin to allow send email fake inbox",
      properties: [
        {
          label: "Token",
          name: "token",
          type: "text",
          required: true,
          default: null,
        },
        {
          label: "Api url",
          name: "api",
          type: "text",
          required: true,
          default: null,
        },
        {
          label: "Subject",
          name: "subject",
          type: "text",
          required: true,
          default: null,
        },
        {
          label: "Email text",
          name: "text",
          type: "text",
          required: true,
          default: null,
        },
        {
          label: "From",
          name: "from",
          type: "text",
          required: true,
          default: null,
        },
        {
          label: "To",
          name: "to",
          type: "text",
          required: true,
          default: null,
        },
        {
          label: "Repo name",
          name: "repoName",
          type: "text",
          required: false,
          default: null,
          conditionShow: [
            {
              keyCheck: "operation",
              valueExpected: "getSpecificRepo",
            },
          ],
        },
      ],
    };
  }

  async execute(node: NodeInput): Promise<NodeReturn> {
    const setting = node.settings;
    if (!setting.token) {
      throw new Error("You need to provide a Mailtrap token");
    }

    if (!setting.subject) {
      throw new Error("You need to provide a subject");
    }

    if (!setting.text) {
      throw new Error("You need to provide a text");
    }

    if (!setting.from) {
      throw new Error("You need to provide a 'from' email");
    }

    if (!setting.to) {
      throw new Error("You need to provide a 'to' email");
    }

    await axios.post(
      this.parseExpression(setting.api),
      {
        from: {
          email: this.parseExpression(setting.from),
          name: "test",
        },
        to: [
          {
            email: this.parseExpression(setting.to),
          },
        ],
        subject: this.parseExpression(setting.subject),
        text: this.parseExpression(setting.text),
      },
      {
        headers: {
          Authorization: `Bearer ${this.parseExpression(setting.token)}`,
        },
      }
    );

    return { ok: true };
  }
}

export default MailtrapNode;
