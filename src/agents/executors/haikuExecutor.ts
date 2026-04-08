import { v4 as uuidv4 } from "uuid";
import type { Task, TaskStatusUpdateEvent, TaskArtifactUpdateEvent } from "@a2a-js/sdk";
import type { AgentExecutor, RequestContext, ExecutionEventBus } from "@a2a-js/sdk/server";

// ---------------------------------------------------------------------------
// Canned haiku responses
// ---------------------------------------------------------------------------

const HAIKU_COMPOSE = [
  "Morning dew glistens\nA spider's web catches light\nNature's jewelry",
  "Keyboard clicks at night\nCode compiles without errors\nA developer smiles",
  "Ocean waves retreat\nLeaving shells upon the sand\nGifts from the deep blue",
];

const HAIKU_SEASONAL = [
  "Autumn leaves descend\nDancing slowly to the ground\nEarth's quiet farewell",
  "Cherry blossoms fall\nPink petals on still water\nSpring whispers goodbye",
];

const HAIKU_EXPLAIN = `**Haiku Structure Analysis**

A traditional haiku follows the **5-7-5** syllable pattern:

- **Line 1** (5 syllables): Sets the scene or introduces the subject
- **Line 2** (7 syllables): Develops the image or adds tension
- **Line 3** (5 syllables): Delivers a twist, insight, or resolution

**Key elements:**
- *Kigo* — a seasonal reference word that grounds the poem in nature
- *Kireji* — a cutting word that creates a pause or juxtaposition
- Present tense for immediacy and directness

The beauty of haiku lies in capturing a single vivid moment within just 17 syllables, leaving space for the reader's imagination to fill in the rest.`;

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function isExplainQuery(text: string): boolean {
  return /explain|analyze|analysis|meaning|symbolism|what does|break down/i.test(text);
}

function isSeasonalQuery(text: string): boolean {
  return /season|spring|summer|autumn|fall|winter|cherry|blossom|snow|leaf|leaves/i.test(text);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Haiku Executor — implements AgentExecutor from @a2a-js/sdk
// ---------------------------------------------------------------------------

export class HaikuExecutor implements AgentExecutor {
  public async execute(requestContext: RequestContext, eventBus: ExecutionEventBus): Promise<void> {
    const { taskId, contextId, userMessage, task } = requestContext;

    // Publish initial task if new
    if (!task) {
      const initialTask: Task = {
        kind: "task",
        id: taskId,
        contextId,
        status: { state: "submitted", timestamp: new Date().toISOString() },
        history: [userMessage],
      };
      eventBus.publish(initialTask);
    }

    // Publish working status
    const workingUpdate: TaskStatusUpdateEvent = {
      kind: "status-update",
      taskId,
      contextId,
      status: { state: "working", timestamp: new Date().toISOString() },
      final: false,
    };
    eventBus.publish(workingUpdate);

    // Extract user text and classify intent
    const userText = userMessage.parts
      .map((p) => ("text" in p && p.text ? p.text : ""))
      .filter(Boolean)
      .join(" ");

    let responseText: string;
    if (isExplainQuery(userText)) {
      responseText = HAIKU_EXPLAIN;
    } else if (isSeasonalQuery(userText)) {
      responseText = pickRandom(HAIKU_SEASONAL);
    } else {
      responseText = pickRandom(HAIKU_COMPOSE);
    }

    // Stream the response word-by-word
    const words = responseText.split(" ");
    let accumulated = "";
    for (let i = 0; i < words.length; i++) {
      const chunk = (i === 0 ? "" : " ") + words[i];
      accumulated += chunk;

      const artifact: TaskArtifactUpdateEvent = {
        kind: "artifact-update",
        taskId,
        contextId,
        artifact: {
          artifactId: `${taskId}-response`,
          name: "response",
          parts: [{ kind: "text", text: chunk }],
        },
      };
      eventBus.publish(artifact);

      await sleep(30);
    }

    // Publish completed status
    const completedUpdate: TaskStatusUpdateEvent = {
      kind: "status-update",
      taskId,
      contextId,
      status: {
        state: "completed",
        timestamp: new Date().toISOString(),
        message: {
          kind: "message",
          messageId: uuidv4(),
          role: "agent",
          parts: [{ kind: "text", text: accumulated }],
          contextId,
          taskId,
        },
      },
      final: true,
    };
    eventBus.publish(completedUpdate);
    eventBus.finished();
  }

  public cancelTask = async (): Promise<void> => {};
}
