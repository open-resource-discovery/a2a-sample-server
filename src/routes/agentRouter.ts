import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { agentRegistry } from "../agents/index.js";
import { config } from "../config.js";
import type { Task, Message } from "../types/a2a.js";
import { JSON_RPC_ERRORS, A2A_ERRORS, type JsonRpcRequest } from "../types/jsonRpc.js";
import type { BaseAgent } from "../agents/baseAgent.js";
import { validateAuth } from "../middleware/auth.js";
import { formatTask } from "../utils/protocolFormatter.js";
import { handleStreamingSend } from "../handlers/messageStreamSend.js";

interface AgentParams {
  agentId: string;
  [key: string]: string;
}

export const agentRouter = Router();

// List all available agents
agentRouter.get("/", (_req: Request, res: Response) => {
  const agents = agentRegistry.getAll().map((agent) => {
    const def = agent.getDefinition();
    return {
      id: def.id,
      name: def.name,
      description: def.description,
      protocolVersion: def.protocolVersion ?? "0.3.0",
      url: `${config.serverUrl}/agents/${def.id}/`,
      agentCardUrl: `${config.serverUrl}/agents/${def.id}/agent.json`,
    };
  });
  res.json({ agents });
});

// Agent card endpoints
agentRouter.get("/:agentId/agent.json", (req: Request<AgentParams>, res: Response) => {
  const agentId = req.params.agentId;
  const agent = agentRegistry.get(agentId);
  if (!agent) {
    return res.status(404).json({ error: "Agent not found", agentId });
  }

  // Check authentication if agent has security schemes
  const def = agent.getDefinition();
  const authResult = validateAuth(req, def.securitySchemes);
  if (!authResult.authenticated) {
    return res.status(401).json({ error: authResult.error || "Unauthorized" });
  }

  const baseUrl = `${config.serverUrl}/agents/${agentId}`;
  res.json(agent.getAgentCard(baseUrl));
});

agentRouter.get("/:agentId/agent-card.json", (req: Request<AgentParams>, res: Response) => {
  const agentId = req.params.agentId;
  const agent = agentRegistry.get(agentId);
  if (!agent) {
    return res.status(404).json({ error: "Agent not found", agentId });
  }

  // Check authentication if agent has security schemes
  const def = agent.getDefinition();
  const authResult = validateAuth(req, def.securitySchemes);
  if (!authResult.authenticated) {
    return res.status(401).json({ error: authResult.error || "Unauthorized" });
  }

  const baseUrl = `${config.serverUrl}/agents/${agentId}`;
  res.json(agent.getAgentCard(baseUrl));
});

// JSON-RPC endpoint for each agent
agentRouter.post("/:agentId/", async (req: Request<AgentParams>, res: Response) => {
  const agentId = req.params.agentId;
  const agent = agentRegistry.get(agentId);
  if (!agent) {
    return res.status(404).json({ error: "Agent not found", agentId });
  }

  // Check authentication if agent has security schemes
  const def = agent.getDefinition();
  const authResult = validateAuth(req, def.securitySchemes);
  if (!authResult.authenticated) {
    return res.status(401).json({
      jsonrpc: "2.0",
      id: null,
      error: {
        code: -32001,
        message: authResult.error || "Unauthorized",
      },
    });
  }

  const request = req.body as JsonRpcRequest;

  // Validate JSON-RPC request
  if (request.jsonrpc !== "2.0" || !request.method) {
    return res.json({
      jsonrpc: "2.0",
      id: request.id ?? null,
      error: {
        code: JSON_RPC_ERRORS.INVALID_REQUEST,
        message: "Invalid JSON-RPC request",
      },
    });
  }

  try {
    if (request.method === "SendMessage" || request.method === "message/send") {
      const result = await handleAgentMessageSend(request.params, agent);
      return res.json({
        jsonrpc: "2.0",
        id: request.id,
        result,
      });
    }

    if (request.method === "message/stream" || request.method === "SendStreamingMessage") {
      if (!agent.supportsStreaming()) {
        return res.json({
          jsonrpc: "2.0",
          id: request.id,
          error: {
            code: A2A_ERRORS.INTERNAL_ERROR,
            message: `Agent '${agentId}' does not support streaming`,
          },
        });
      }

      return await handleStreamingSend(request.params, agent, res, request.id);
    }

    return res.json({
      jsonrpc: "2.0",
      id: request.id,
      error: {
        code: JSON_RPC_ERRORS.METHOD_NOT_FOUND,
        message: `Method not found: ${request.method}`,
      },
    });
  } catch (error) {
    return res.json({
      jsonrpc: "2.0",
      id: request.id,
      error: {
        code: A2A_ERRORS.INTERNAL_ERROR,
        message: error instanceof Error ? error.message : "Internal error",
      },
    });
  }
});

interface MessageSendParams {
  message: Message;
}

async function handleAgentMessageSend(
  params: unknown,
  agent: BaseAgent,
): Promise<Record<string, unknown>> {
  const { message } = params as MessageSendParams;

  // Extract text from message parts
  const userText = message.parts
    .map((p) => {
      if ("text" in p) {
        return p.text;
      }
      return "";
    })
    .filter(Boolean)
    .join(" ");

  const taskId = message.taskId || uuidv4();
  const contextId = message.contextId || uuidv4();
  const version = agent.getProtocolVersion();

  try {
    const parts = await agent.handleMessageWithParts(userText);

    const task: Task = {
      id: taskId,
      contextId,
      status: {
        state: "TASK_STATE_COMPLETED",
        message: {
          role: "ROLE_AGENT",
          parts,
          messageId: uuidv4(),
          contextId,
          taskId,
        },
        timestamp: new Date().toISOString(),
      },
    };

    return formatTask(task, version);
  } catch (error) {
    const task: Task = {
      id: taskId,
      contextId,
      status: {
        state: "TASK_STATE_FAILED",
        message: {
          role: "ROLE_AGENT",
          parts: [
            {
              text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          messageId: uuidv4(),
          contextId,
          taskId,
        },
        timestamp: new Date().toISOString(),
      },
    };

    return formatTask(task, version);
  }
}
