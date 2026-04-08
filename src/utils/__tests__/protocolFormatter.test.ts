import {
  formatTaskState,
  formatRole,
  formatPart,
  formatMessage,
  formatTask,
  formatAgentCard,
  formatTaskStatusUpdateEvent,
  formatTaskArtifactUpdateEvent,
  formatStreamTask,
} from "../protocolFormatter.js";

import type { A2aProtocolVersion } from "../../agents/types.js";
import type {
  TaskState,
  MessageRole,
  Part,
  Message,
  Task,
  AgentCard,
  TaskStatusUpdateEvent,
  TaskArtifactUpdateEvent,
} from "../../types/a2a.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VERSIONS: A2aProtocolVersion[] = ["1.0.0", "0.3.0"];

function makeMessage(overrides?: Partial<Message>): Message {
  return {
    role: "ROLE_AGENT",
    parts: [{ text: "hello" }],
    messageId: "msg-1",
    ...overrides,
  };
}

function makeTask(overrides?: Partial<Task>): Task {
  return {
    id: "task-1",
    contextId: "ctx-1",
    status: {
      state: "TASK_STATE_COMPLETED",
      timestamp: "2025-01-01T00:00:00Z",
    },
    ...overrides,
  };
}

function makeAgentCard(overrides?: Partial<AgentCard>): AgentCard {
  return {
    name: "TestAgent",
    description: "A test agent",
    version: "1.0.0",
    supportedInterfaces: [
      {
        url: "http://localhost:3000",
        protocolBinding: "JSONRPC",
        protocolVersion: "1.0.0",
      },
    ],
    capabilities: { streaming: false, pushNotifications: false },
    skills: [
      {
        id: "skill-1",
        name: "Test Skill",
        description: "A test skill",
        tags: ["test"],
      },
    ],
    defaultInputModes: ["text/plain"],
    defaultOutputModes: ["text/plain"],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// formatTaskState
// ---------------------------------------------------------------------------

describe("formatTaskState", () => {
  const ALL_STATES: TaskState[] = [
    "TASK_STATE_UNSPECIFIED",
    "TASK_STATE_SUBMITTED",
    "TASK_STATE_WORKING",
    "TASK_STATE_INPUT_REQUIRED",
    "TASK_STATE_COMPLETED",
    "TASK_STATE_CANCELED",
    "TASK_STATE_FAILED",
    "TASK_STATE_REJECTED",
    "TASK_STATE_AUTH_REQUIRED",
  ];

  const EXPECTED_V030: Record<TaskState, string> = {
    TASK_STATE_UNSPECIFIED: "unspecified",
    TASK_STATE_SUBMITTED: "submitted",
    TASK_STATE_WORKING: "working",
    TASK_STATE_INPUT_REQUIRED: "input-required",
    TASK_STATE_COMPLETED: "completed",
    TASK_STATE_CANCELED: "canceled",
    TASK_STATE_FAILED: "failed",
    TASK_STATE_REJECTED: "rejected",
    TASK_STATE_AUTH_REQUIRED: "auth-required",
  };

  it("v1.0.0: returns state as-is for every TaskState value", () => {
    for (const state of ALL_STATES) {
      expect(formatTaskState(state, "1.0.0")).toBe(state);
    }
  });

  it("v0.3.0: maps every TaskState to its lowercase equivalent", () => {
    for (const state of ALL_STATES) {
      expect(formatTaskState(state, "0.3.0")).toBe(EXPECTED_V030[state]);
    }
  });
});

// ---------------------------------------------------------------------------
// formatRole
// ---------------------------------------------------------------------------

describe("formatRole", () => {
  const ALL_ROLES: MessageRole[] = ["ROLE_USER", "ROLE_AGENT"];

  it("v1.0.0: returns role as-is", () => {
    for (const role of ALL_ROLES) {
      expect(formatRole(role, "1.0.0")).toBe(role);
    }
  });

  it("v0.3.0: maps ROLE_USER to 'user' and ROLE_AGENT to 'agent'", () => {
    expect(formatRole("ROLE_USER", "0.3.0")).toBe("user");
    expect(formatRole("ROLE_AGENT", "0.3.0")).toBe("agent");
  });
});

// ---------------------------------------------------------------------------
// formatPart
// ---------------------------------------------------------------------------

describe("formatPart", () => {
  describe("v1.0.0", () => {
    it("returns a spread copy of the part", () => {
      const part: Part = { text: "hello", metadata: { key: "val" } };
      const result = formatPart(part, "1.0.0");
      expect(result).toEqual({ text: "hello", metadata: { key: "val" } });
      // Verify it is a new object, not the same reference
      expect(result).not.toBe(part);
    });

    it("includes all fields in the spread", () => {
      const part: Part = {
        url: "http://example.com/file.png",
        mediaType: "image/png",
        filename: "file.png",
        metadata: { a: 1 },
      };
      const result = formatPart(part, "1.0.0");
      expect(result).toEqual(part);
    });
  });

  describe("v0.3.0", () => {
    it("text part: returns {kind: 'text', text} without metadata when absent", () => {
      const part: Part = { text: "hello" };
      expect(formatPart(part, "0.3.0")).toEqual({ kind: "text", text: "hello" });
    });

    it("text part: includes metadata when present", () => {
      const part: Part = { text: "hello", metadata: { key: "val" } };
      expect(formatPart(part, "0.3.0")).toEqual({
        kind: "text",
        text: "hello",
        metadata: { key: "val" },
      });
    });

    it("data part: returns {kind: 'data', data}", () => {
      const part: Part = { data: { foo: "bar" } };
      expect(formatPart(part, "0.3.0")).toEqual({
        kind: "data",
        data: { foo: "bar" },
      });
    });

    it("data part: includes metadata when present", () => {
      const part: Part = { data: { foo: "bar" }, metadata: { m: true } };
      expect(formatPart(part, "0.3.0")).toEqual({
        kind: "data",
        data: { foo: "bar" },
        metadata: { m: true },
      });
    });

    it("url part: returns {kind: 'file', file: {uri}} with optional fields", () => {
      const part: Part = {
        url: "http://example.com/photo.jpg",
        mediaType: "image/jpeg",
        filename: "photo.jpg",
      };
      expect(formatPart(part, "0.3.0")).toEqual({
        kind: "file",
        file: {
          uri: "http://example.com/photo.jpg",
          mimeType: "image/jpeg",
          name: "photo.jpg",
        },
      });
    });

    it("url part: omits mimeType and name when mediaType/filename are missing", () => {
      const part: Part = { url: "http://example.com/file.bin" };
      expect(formatPart(part, "0.3.0")).toEqual({
        kind: "file",
        file: { uri: "http://example.com/file.bin" },
      });
    });

    it("url part: includes metadata when present", () => {
      const part: Part = { url: "http://example.com/f", metadata: { x: 1 } };
      expect(formatPart(part, "0.3.0")).toEqual({
        kind: "file",
        file: { uri: "http://example.com/f" },
        metadata: { x: 1 },
      });
    });

    it("unknown part type: returns a spread copy (fallback)", () => {
      const part: Part = { raw: "binary-data" };
      expect(formatPart(part, "0.3.0")).toEqual({ raw: "binary-data" });
    });
  });
});

// ---------------------------------------------------------------------------
// formatMessage
// ---------------------------------------------------------------------------

describe("formatMessage", () => {
  it("v1.0.0: returns role, parts, messageId without kind", () => {
    const msg = makeMessage();
    const result = formatMessage(msg, "1.0.0");
    expect(result.role).toBe("ROLE_AGENT");
    expect(result.parts).toEqual([{ text: "hello" }]);
    expect(result.messageId).toBe("msg-1");
    expect(result).not.toHaveProperty("kind");
  });

  it("v1.0.0: includes contextId and taskId when present", () => {
    const msg = makeMessage({ contextId: "ctx-1", taskId: "task-1" });
    const result = formatMessage(msg, "1.0.0");
    expect(result.contextId).toBe("ctx-1");
    expect(result.taskId).toBe("task-1");
  });

  it("v1.0.0: omits contextId and taskId when absent", () => {
    const msg = makeMessage();
    const result = formatMessage(msg, "1.0.0");
    expect(result).not.toHaveProperty("contextId");
    expect(result).not.toHaveProperty("taskId");
  });

  it("v0.3.0: adds kind 'message' and maps role", () => {
    const msg = makeMessage({ role: "ROLE_USER" });
    const result = formatMessage(msg, "0.3.0");
    expect(result.kind).toBe("message");
    expect(result.role).toBe("user");
  });

  it("v0.3.0: formats parts using v0.3.0 rules", () => {
    const msg = makeMessage({
      parts: [{ text: "hi" }, { data: { x: 1 } }],
    });
    const result = formatMessage(msg, "0.3.0");
    expect(result.parts).toEqual([
      { kind: "text", text: "hi" },
      { kind: "data", data: { x: 1 } },
    ]);
  });
});

// ---------------------------------------------------------------------------
// formatTask
// ---------------------------------------------------------------------------

describe("formatTask", () => {
  it("v1.0.0: returns id, contextId, status without kind", () => {
    const task = makeTask();
    const result = formatTask(task, "1.0.0");
    expect(result.id).toBe("task-1");
    expect(result.contextId).toBe("ctx-1");
    expect(result).not.toHaveProperty("kind");
    const status = result.status as Record<string, unknown>;
    expect(status.state).toBe("TASK_STATE_COMPLETED");
    expect(status.timestamp).toBe("2025-01-01T00:00:00Z");
  });

  it("v0.3.0: adds kind 'task' and maps state", () => {
    const task = makeTask();
    const result = formatTask(task, "0.3.0");
    expect(result.kind).toBe("task");
    const status = result.status as Record<string, unknown>;
    expect(status.state).toBe("completed");
  });

  it("includes artifacts when present", () => {
    for (const ver of VERSIONS) {
      const artifacts = [
        {
          name: "art-1",
          parts: [{ text: "content" }],
          artifactId: "a1",
        },
      ];
      const task = makeTask({ artifacts });
      const result = formatTask(task, ver);
      expect(result.artifacts).toEqual(artifacts);
    }
  });

  it("includes history with formatted messages", () => {
    const history: Message[] = [
      makeMessage({ role: "ROLE_USER", parts: [{ text: "hi" }], messageId: "m1" }),
    ];
    const task = makeTask({ history });

    const resultV1 = formatTask(task, "1.0.0");
    const histV1 = resultV1.history as Record<string, unknown>[];
    expect(histV1[0].role).toBe("ROLE_USER");
    expect(histV1[0]).not.toHaveProperty("kind");

    const resultV03 = formatTask(task, "0.3.0");
    const histV03 = resultV03.history as Record<string, unknown>[];
    expect(histV03[0].role).toBe("user");
    expect(histV03[0].kind).toBe("message");
  });

  it("includes metadata when present", () => {
    const task = makeTask({ metadata: { foo: "bar" } });
    const result = formatTask(task, "1.0.0");
    expect(result.metadata).toEqual({ foo: "bar" });
  });

  it("omits artifacts, history, metadata when absent", () => {
    const task = makeTask();
    const result = formatTask(task, "1.0.0");
    expect(result).not.toHaveProperty("artifacts");
    expect(result).not.toHaveProperty("history");
    expect(result).not.toHaveProperty("metadata");
  });

  it("includes status.message when present and formats it", () => {
    const statusMessage = makeMessage({ role: "ROLE_AGENT", messageId: "sm-1" });
    const task = makeTask({
      status: {
        state: "TASK_STATE_WORKING",
        message: statusMessage,
        timestamp: "2025-01-01T00:00:00Z",
      },
    });

    const resultV1 = formatTask(task, "1.0.0");
    const statusV1 = resultV1.status as Record<string, unknown>;
    const msgV1 = statusV1.message as Record<string, unknown>;
    expect(msgV1.role).toBe("ROLE_AGENT");

    const resultV03 = formatTask(task, "0.3.0");
    const statusV03 = resultV03.status as Record<string, unknown>;
    const msgV03 = statusV03.message as Record<string, unknown>;
    expect(msgV03.role).toBe("agent");
    expect(msgV03.kind).toBe("message");
  });
});

// ---------------------------------------------------------------------------
// formatAgentCard
// ---------------------------------------------------------------------------

describe("formatAgentCard", () => {
  it("v1.0.0: returns a copy of the card without security schemes unchanged", () => {
    const card = makeAgentCard();
    const result = formatAgentCard(card, "1.0.0");
    expect(result).toEqual(card);
    expect(result).not.toBe(card); // new object
  });

  it("v1.0.0: preserves all fields including supportedInterfaces", () => {
    const card = makeAgentCard();
    const result = formatAgentCard(card, "1.0.0");
    expect(result.supportedInterfaces).toBeDefined();
  });

  it("v1.0.0: converts oauth2 security scheme to nested discriminator format", () => {
    const card = makeAgentCard({
      securitySchemes: {
        oauth2: {
          type: "oauth2",
          flows: {
            clientCredentials: {
              tokenUrl: "http://localhost:3000/oauth/token",
              scopes: { "a2a:invoke": "Invoke A2A agent methods" },
            },
          },
        },
      },
      security: [{ oauth2: ["a2a:invoke"] }],
    });
    const result = formatAgentCard(card, "1.0.0");
    const schemes = result.securitySchemes as Record<string, Record<string, unknown>>;
    expect(schemes.oauth2.oauth2SecurityScheme).toEqual({
      flows: {
        clientCredentials: {
          tokenUrl: "http://localhost:3000/oauth/token",
          scopes: { "a2a:invoke": "Invoke A2A agent methods" },
        },
      },
    });
    expect(schemes.oauth2).not.toHaveProperty("type");
  });

  it("v1.0.0: converts http security scheme to nested discriminator format", () => {
    const card = makeAgentCard({
      securitySchemes: {
        basicAuth: { type: "http", scheme: "basic" },
      },
      security: [{ basicAuth: [] }],
    });
    const result = formatAgentCard(card, "1.0.0");
    const schemes = result.securitySchemes as Record<string, Record<string, unknown>>;
    expect(schemes.basicAuth.httpAuthSecurityScheme).toEqual({ scheme: "basic" });
    expect(schemes.basicAuth).not.toHaveProperty("type");
  });

  it("v1.0.0: converts apiKey security scheme to nested discriminator format", () => {
    const card = makeAgentCard({
      securitySchemes: {
        apiKey: { type: "apiKey", name: "X-API-Key", in: "header" },
      },
      security: [{ apiKey: [] }],
    });
    const result = formatAgentCard(card, "1.0.0");
    const schemes = result.securitySchemes as Record<string, Record<string, unknown>>;
    expect(schemes.apiKey.apiKeySecurityScheme).toEqual({ name: "X-API-Key", location: "header" });
    expect(schemes.apiKey).not.toHaveProperty("type");
  });

  it("v1.0.0: renames security to securityRequirements", () => {
    const card = makeAgentCard({
      securitySchemes: {
        basicAuth: { type: "http", scheme: "basic" },
      },
      security: [{ basicAuth: [] }],
    });
    const result = formatAgentCard(card, "1.0.0");
    expect(result.securityRequirements).toEqual([{ schemes: { basicAuth: {} } }]);
    expect(result).not.toHaveProperty("security");
  });

  it("v1.0.0: securityRequirements wraps scopes in StringList format", () => {
    const card = makeAgentCard({
      securitySchemes: {
        oauth2: {
          type: "oauth2",
          flows: {
            clientCredentials: {
              tokenUrl: "http://localhost:3000/oauth/token",
              scopes: { "a2a:invoke": "Invoke" },
            },
          },
        },
        basicAuth: { type: "http", scheme: "basic" },
      },
      security: [{ oauth2: ["a2a:invoke"] }, { basicAuth: [] }],
    });
    const result = formatAgentCard(card, "1.0.0");
    expect(result.securityRequirements).toEqual([
      { schemes: { oauth2: { list: ["a2a:invoke"] } } },
      { schemes: { basicAuth: {} } },
    ]);
  });

  it("v0.3.0: removes supportedInterfaces and adds url/protocolVersion from first interface", () => {
    const card = makeAgentCard({
      supportedInterfaces: [
        {
          url: "http://localhost:3000",
          protocolBinding: "JSONRPC",
          protocolVersion: "0.3.0",
        },
      ],
    });
    const result = formatAgentCard(card, "0.3.0");
    expect(result).not.toHaveProperty("supportedInterfaces");
    expect(result.url).toBe("http://localhost:3000");
    expect(result.protocolVersion).toBe("0.3.0");
  });

  it("v0.3.0: preserves other card fields", () => {
    const card = makeAgentCard();
    const result = formatAgentCard(card, "0.3.0");
    expect(result.name).toBe("TestAgent");
    expect(result.description).toBe("A test agent");
    expect(result.skills).toEqual(card.skills);
    expect(result.capabilities).toEqual(card.capabilities);
  });

  it("v0.3.0: defaults protocolVersion to '0.3.0' when no interfaces exist", () => {
    const card = makeAgentCard({ supportedInterfaces: [] });
    const result = formatAgentCard(card, "0.3.0");
    expect(result.protocolVersion).toBe("0.3.0");
    expect(result.url).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// formatTaskStatusUpdateEvent
// ---------------------------------------------------------------------------

describe("formatTaskStatusUpdateEvent", () => {
  function makeStatusEvent(overrides?: Partial<TaskStatusUpdateEvent>): TaskStatusUpdateEvent {
    return {
      taskId: "task-1",
      contextId: "ctx-1",
      status: {
        state: "TASK_STATE_WORKING",
        timestamp: "2025-01-01T00:00:00Z",
      },
      ...overrides,
    };
  }

  it("v1.0.0: wraps in {statusUpdate: {...}}", () => {
    const event = makeStatusEvent();
    const result = formatTaskStatusUpdateEvent(event, "1.0.0");
    expect(result).toHaveProperty("statusUpdate");
    const inner = result.statusUpdate as Record<string, unknown>;
    expect(inner.taskId).toBe("task-1");
    expect(inner.contextId).toBe("ctx-1");
    const status = inner.status as Record<string, unknown>;
    expect(status.state).toBe("TASK_STATE_WORKING");
  });

  it("v1.0.0: does not include kind or final", () => {
    const result = formatTaskStatusUpdateEvent(makeStatusEvent(), "1.0.0");
    const inner = result.statusUpdate as Record<string, unknown>;
    expect(inner).not.toHaveProperty("kind");
    expect(inner).not.toHaveProperty("final");
  });

  it("v0.3.0: returns flat format with kind 'status-update'", () => {
    const event = makeStatusEvent();
    const result = formatTaskStatusUpdateEvent(event, "0.3.0");
    expect(result.kind).toBe("status-update");
    expect(result.taskId).toBe("task-1");
    expect(result.contextId).toBe("ctx-1");
    expect(result).not.toHaveProperty("statusUpdate");
  });

  it("v0.3.0: maps state to lowercase", () => {
    const event = makeStatusEvent();
    const result = formatTaskStatusUpdateEvent(event, "0.3.0");
    const status = result.status as Record<string, unknown>;
    expect(status.state).toBe("working");
  });

  it("v0.3.0: final is true for terminal states", () => {
    const terminalStates: TaskState[] = [
      "TASK_STATE_COMPLETED",
      "TASK_STATE_FAILED",
      "TASK_STATE_CANCELED",
      "TASK_STATE_REJECTED",
    ];
    for (const state of terminalStates) {
      const event = makeStatusEvent({
        status: { state, timestamp: "2025-01-01T00:00:00Z" },
      });
      const result = formatTaskStatusUpdateEvent(event, "0.3.0");
      expect(result.final).toBe(true);
    }
  });

  it("v0.3.0: final is false for non-terminal states", () => {
    const nonTerminal: TaskState[] = [
      "TASK_STATE_SUBMITTED",
      "TASK_STATE_WORKING",
      "TASK_STATE_INPUT_REQUIRED",
      "TASK_STATE_UNSPECIFIED",
      "TASK_STATE_AUTH_REQUIRED",
    ];
    for (const state of nonTerminal) {
      const event = makeStatusEvent({
        status: { state, timestamp: "2025-01-01T00:00:00Z" },
      });
      const result = formatTaskStatusUpdateEvent(event, "0.3.0");
      expect(result.final).toBe(false);
    }
  });

  it("includes status.message when present", () => {
    const msg = makeMessage();
    const event = makeStatusEvent({
      status: { state: "TASK_STATE_WORKING", message: msg, timestamp: "2025-01-01T00:00:00Z" },
    });

    const v1Result = formatTaskStatusUpdateEvent(event, "1.0.0");
    const v1Status = (v1Result.statusUpdate as Record<string, unknown>).status as Record<
      string,
      unknown
    >;
    expect(v1Status.message).toBeDefined();

    const v03Result = formatTaskStatusUpdateEvent(event, "0.3.0");
    const v03Status = v03Result.status as Record<string, unknown>;
    expect(v03Status.message).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// formatTaskArtifactUpdateEvent
// ---------------------------------------------------------------------------

describe("formatTaskArtifactUpdateEvent", () => {
  function makeArtifactEvent(
    overrides?: Partial<TaskArtifactUpdateEvent>,
  ): TaskArtifactUpdateEvent {
    return {
      taskId: "task-1",
      contextId: "ctx-1",
      artifact: {
        name: "result",
        parts: [{ text: "artifact content" }],
        artifactId: "art-1",
      },
      ...overrides,
    };
  }

  it("v1.0.0: wraps in {artifactUpdate: {...}}", () => {
    const event = makeArtifactEvent();
    const result = formatTaskArtifactUpdateEvent(event, "1.0.0");
    expect(result).toHaveProperty("artifactUpdate");
    const inner = result.artifactUpdate as Record<string, unknown>;
    expect(inner.taskId).toBe("task-1");
    expect(inner.contextId).toBe("ctx-1");
    expect(inner.artifact).toBeDefined();
  });

  it("v1.0.0: includes append and lastChunk when present", () => {
    const event = makeArtifactEvent({ append: true, lastChunk: false });
    const result = formatTaskArtifactUpdateEvent(event, "1.0.0");
    const inner = result.artifactUpdate as Record<string, unknown>;
    expect(inner.append).toBe(true);
    expect(inner.lastChunk).toBe(false);
  });

  it("v1.0.0: includes metadata when present", () => {
    const event = makeArtifactEvent({ metadata: { key: "val" } });
    const result = formatTaskArtifactUpdateEvent(event, "1.0.0");
    const inner = result.artifactUpdate as Record<string, unknown>;
    expect(inner.metadata).toEqual({ key: "val" });
  });

  it("v1.0.0: omits append, lastChunk, metadata when absent", () => {
    const event = makeArtifactEvent();
    const result = formatTaskArtifactUpdateEvent(event, "1.0.0");
    const inner = result.artifactUpdate as Record<string, unknown>;
    expect(inner).not.toHaveProperty("append");
    expect(inner).not.toHaveProperty("lastChunk");
    expect(inner).not.toHaveProperty("metadata");
  });

  it("v1.0.0: formats artifact parts using v1.0.0 rules", () => {
    const event = makeArtifactEvent({
      artifact: {
        name: "r",
        parts: [{ text: "hi" }],
        artifactId: "a1",
      },
    });
    const result = formatTaskArtifactUpdateEvent(event, "1.0.0");
    const inner = result.artifactUpdate as Record<string, unknown>;
    const artifact = inner.artifact as Record<string, unknown>;
    const parts = artifact.parts as Record<string, unknown>[];
    expect(parts[0]).toEqual({ text: "hi" });
    expect(parts[0]).not.toHaveProperty("kind");
  });

  it("v0.3.0: returns flat format with kind 'artifact-update'", () => {
    const event = makeArtifactEvent();
    const result = formatTaskArtifactUpdateEvent(event, "0.3.0");
    expect(result.kind).toBe("artifact-update");
    expect(result.taskId).toBe("task-1");
    expect(result.contextId).toBe("ctx-1");
    expect(result.artifact).toBeDefined();
    expect(result).not.toHaveProperty("artifactUpdate");
  });

  it("v0.3.0: does not include append, lastChunk, or metadata", () => {
    const event = makeArtifactEvent({
      append: true,
      lastChunk: true,
      metadata: { m: 1 },
    });
    const result = formatTaskArtifactUpdateEvent(event, "0.3.0");
    expect(result).not.toHaveProperty("append");
    expect(result).not.toHaveProperty("lastChunk");
    expect(result).not.toHaveProperty("metadata");
  });

  it("v0.3.0: formats artifact parts using v0.3.0 rules", () => {
    const event = makeArtifactEvent({
      artifact: {
        name: "r",
        parts: [{ text: "hi" }, { url: "http://example.com/f" }],
        artifactId: "a1",
      },
    });
    const result = formatTaskArtifactUpdateEvent(event, "0.3.0");
    const artifact = result.artifact as Record<string, unknown>;
    const parts = artifact.parts as Record<string, unknown>[];
    expect(parts[0]).toEqual({ kind: "text", text: "hi" });
    expect(parts[1]).toEqual({
      kind: "file",
      file: { uri: "http://example.com/f" },
    });
  });
});

// ---------------------------------------------------------------------------
// formatStreamTask
// ---------------------------------------------------------------------------

describe("formatStreamTask", () => {
  it("v1.0.0: wraps formatted task in {task: ...}", () => {
    const task = makeTask();
    const result = formatStreamTask(task, "1.0.0");
    expect(result).toHaveProperty("task");
    const inner = result.task as Record<string, unknown>;
    expect(inner.id).toBe("task-1");
    expect(inner).not.toHaveProperty("kind");
  });

  it("v0.3.0: returns formatted task directly (no wrapper)", () => {
    const task = makeTask();
    const result = formatStreamTask(task, "0.3.0");
    expect(result).not.toHaveProperty("task");
    expect(result.id).toBe("task-1");
    expect(result.kind).toBe("task");
  });

  it("v0.3.0: state is mapped in the returned task", () => {
    const task = makeTask({
      status: {
        state: "TASK_STATE_WORKING",
        timestamp: "2025-01-01T00:00:00Z",
      },
    });
    const result = formatStreamTask(task, "0.3.0");
    const status = result.status as Record<string, unknown>;
    expect(status.state).toBe("working");
  });

  it("v1.0.0: inner task does not have kind", () => {
    const task = makeTask();
    const result = formatStreamTask(task, "1.0.0");
    const inner = result.task as Record<string, unknown>;
    expect(inner).not.toHaveProperty("kind");
  });
});
