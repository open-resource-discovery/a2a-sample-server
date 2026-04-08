import { v4 as uuidv4 } from "uuid";
import { getResponse } from "../services/weatherService.js";
import type { Message, Task } from "../types/a2a.js";
import { formatTask } from "../utils/protocolFormatter.js";

interface MessageSendParams {
  message: Message;
}

export async function handleMessageSend(params: unknown): Promise<Record<string, unknown>> {
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

  try {
    // Get response from LLM
    const response = await getResponse(userText);

    const task: Task = {
      id: taskId,
      contextId,
      status: {
        state: "TASK_STATE_COMPLETED",
        message: {
          role: "ROLE_AGENT",
          parts: [{ text: response }],
          messageId: uuidv4(),
          contextId,
          taskId,
        },
        timestamp: new Date().toISOString(),
      },
    };

    return formatTask(task, "0.3.0");
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
              text: `Houston, we have a problem! ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          messageId: uuidv4(),
          contextId,
          taskId,
        },
        timestamp: new Date().toISOString(),
      },
    };

    return formatTask(task, "0.3.0");
  }
}
