import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import type { BaseAgent } from "../agents/baseAgent.js";
import type { Message, Task, TaskStatus, Artifact } from "../types/a2a.js";
import {
  formatStreamTask,
  formatTaskStatusUpdateEvent,
  formatTaskArtifactUpdateEvent,
} from "../utils/protocolFormatter.js";

interface MessageSendParams {
  message: Message;
}

function writeSseEvent(res: Response, data: Record<string, unknown>): void {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export async function handleStreamingSend(
  params: unknown,
  agent: BaseAgent,
  res: Response,
  requestId: string | number | null = null,
): Promise<void> {
  const { message } = params as MessageSendParams;
  const version = agent.getProtocolVersion();

  const userText = message.parts
    .map((p) => {
      if ("text" in p) return p.text;
      return "";
    })
    .filter(Boolean)
    .join(" ");

  const taskId = message.taskId || uuidv4();
  const contextId = message.contextId || uuidv4();

  // Set SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  // Send initial "submitted" task with user message in history
  const submittedTask: Task = {
    id: taskId,
    contextId,
    status: {
      state: "TASK_STATE_SUBMITTED",
      timestamp: new Date().toISOString(),
    },
    history: [
      {
        ...message,
        contextId,
        taskId,
      },
    ],
  };
  writeSseEvent(res, {
    jsonrpc: "2.0",
    id: requestId,
    result: formatStreamTask(submittedTask, version),
  });

  // Send "working" status
  const workingStatus: TaskStatus = {
    state: "TASK_STATE_WORKING",
    timestamp: new Date().toISOString(),
  };
  writeSseEvent(res, {
    jsonrpc: "2.0",
    id: requestId,
    result: formatTaskStatusUpdateEvent({ taskId, contextId, status: workingStatus }, version),
  });

  // Stream artifact chunks
  let fullText = "";

  try {
    for await (const textChunk of agent.handleMessageStream(userText)) {
      fullText += textChunk;

      const artifact: Artifact = {
        artifactId: `${taskId}-response`,
        name: "response",
        parts: [{ text: textChunk }],
      };

      writeSseEvent(res, {
        jsonrpc: "2.0",
        id: requestId,
        result: formatTaskArtifactUpdateEvent(
          { taskId, contextId, artifact, append: true },
          version,
        ),
      });
    }

    // Send completed status with full message
    const completedStatus: TaskStatus = {
      state: "TASK_STATE_COMPLETED",
      timestamp: new Date().toISOString(),
      message: {
        role: "ROLE_AGENT",
        parts: [{ text: fullText }],
        messageId: uuidv4(),
        contextId,
        taskId,
      },
    };
    writeSseEvent(res, {
      jsonrpc: "2.0",
      id: requestId,
      result: formatTaskStatusUpdateEvent({ taskId, contextId, status: completedStatus }, version),
    });
  } catch (error) {
    // Send failed status
    const failedStatus: TaskStatus = {
      state: "TASK_STATE_FAILED",
      timestamp: new Date().toISOString(),
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
    };
    writeSseEvent(res, {
      jsonrpc: "2.0",
      id: requestId,
      result: formatTaskStatusUpdateEvent({ taskId, contextId, status: failedStatus }, version),
    });
  }

  // End stream naturally (no [DONE] sentinel per spec)
  res.end();
}
