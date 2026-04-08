import type { A2aProtocolVersion } from "../agents/types.js";
import type {
  TaskState,
  MessageRole,
  Part,
  Message,
  Task,
  AgentCard,
  TaskStatusUpdateEvent,
  TaskArtifactUpdateEvent,
} from "../types/a2a.js";

const TERMINAL_STATES: TaskState[] = [
  "TASK_STATE_COMPLETED",
  "TASK_STATE_FAILED",
  "TASK_STATE_CANCELED",
  "TASK_STATE_REJECTED",
];

const TASK_STATE_MAP: Record<TaskState, string> = {
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

const ROLE_MAP: Record<MessageRole, string> = {
  ROLE_USER: "user",
  ROLE_AGENT: "agent",
};

export function formatTaskState(state: TaskState, version: A2aProtocolVersion): string {
  if (version === "1.0.0") return state;
  return TASK_STATE_MAP[state] ?? state;
}

export function formatRole(role: MessageRole, version: A2aProtocolVersion): string {
  if (version === "1.0.0") return role;
  return ROLE_MAP[role] ?? role;
}

export function formatPart(part: Part, version: A2aProtocolVersion): Record<string, unknown> {
  if (version === "1.0.0") return { ...part };

  // v0.3.0: add kind discriminator
  if (part.text !== undefined) {
    return {
      kind: "text",
      text: part.text,
      ...(part.metadata && { metadata: part.metadata }),
    };
  }
  if (part.data !== undefined) {
    return {
      kind: "data",
      data: part.data,
      ...(part.metadata && { metadata: part.metadata }),
    };
  }
  if (part.url !== undefined) {
    return {
      kind: "file",
      file: {
        uri: part.url,
        ...(part.mediaType && { mimeType: part.mediaType }),
        ...(part.filename && { name: part.filename }),
      },
      ...(part.metadata && { metadata: part.metadata }),
    };
  }
  return { ...part };
}

export function formatMessage(
  message: Pick<Message, "role" | "parts" | "messageId" | "contextId" | "taskId">,
  version: A2aProtocolVersion,
): Record<string, unknown> {
  const formatted: Record<string, unknown> = {
    role: formatRole(message.role, version),
    parts: message.parts.map((p) => formatPart(p, version)),
    messageId: message.messageId,
  };

  if (version === "0.3.0") {
    formatted.kind = "message";
  }

  if (message.contextId) formatted.contextId = message.contextId;
  if (message.taskId) formatted.taskId = message.taskId;

  return formatted;
}

export function formatTask(task: Task, version: A2aProtocolVersion): Record<string, unknown> {
  const formatted: Record<string, unknown> = {
    id: task.id,
    contextId: task.contextId,
    status: {
      state: formatTaskState(task.status.state, version),
      ...(task.status.message && {
        message: formatMessage(task.status.message, version),
      }),
      timestamp: task.status.timestamp,
    },
  };

  if (version === "0.3.0") {
    formatted.kind = "task";
  }

  if (task.artifacts) formatted.artifacts = task.artifacts;
  if (task.history) {
    formatted.history = task.history.map((m) => formatMessage(m, version));
  }
  if (task.metadata) formatted.metadata = task.metadata;

  return formatted;
}

/**
 * Maps internal SecurityScheme type to v1.0 discriminator key.
 */
const SECURITY_SCHEME_KEY_MAP: Record<string, string> = {
  apiKey: "apiKeySecurityScheme",
  http: "httpAuthSecurityScheme",
  oauth2: "oauth2SecurityScheme",
  openIdConnect: "openIdConnectSecurityScheme",
  mutualTLS: "mtlsSecurityScheme",
};

/**
 * Convert a flat SecurityScheme (with `type` field) to v1.0 nested discriminator format.
 * e.g. { type: "http", scheme: "basic" } → { httpAuthSecurityScheme: { scheme: "basic" } }
 */
function formatSecuritySchemeV1(scheme: Record<string, unknown>): Record<string, unknown> {
  const { type, ...rest } = scheme;
  const key = SECURITY_SCHEME_KEY_MAP[type as string];
  if (!key) return scheme;
  // v1.0 APIKeySecurityScheme uses "location" instead of "in"
  if (key === "apiKeySecurityScheme" && "in" in rest) {
    const { in: location, ...apiKeyRest } = rest;
    return { [key]: { location, ...apiKeyRest } };
  }
  return { [key]: rest };
}

export function formatAgentCard(
  card: AgentCard,
  version: A2aProtocolVersion,
): Record<string, unknown> {
  if (version === "1.0.0") {
    const { security, securitySchemes, ...rest } = card as AgentCard & { security?: unknown };
    const result: Record<string, unknown> = { ...rest };

    if (securitySchemes) {
      result.securitySchemes = Object.fromEntries(
        Object.entries(securitySchemes).map(([name, scheme]) => [
          name,
          formatSecuritySchemeV1(scheme as unknown as Record<string, unknown>),
        ]),
      );
    }
    if (security) {
      result.securityRequirements = security.map((req) => ({
        schemes: Object.fromEntries(
          Object.entries(req).map(([name, scopes]) => [
            name,
            scopes.length > 0 ? { list: scopes } : {},
          ]),
        ),
      }));
    }

    return result;
  }

  // v0.3.0: convert supportedInterfaces back to legacy top-level fields
  const { supportedInterfaces, ...rest } = card;
  const primary = supportedInterfaces[0];
  return {
    ...rest,
    url: primary?.url,
    protocolVersion: primary?.protocolVersion ?? "0.3.0",
  };
}

export function formatTaskStatusUpdateEvent(
  event: TaskStatusUpdateEvent,
  version: A2aProtocolVersion,
): Record<string, unknown> {
  const inner: Record<string, unknown> = {
    taskId: event.taskId,
    contextId: event.contextId,
    status: {
      state: formatTaskState(event.status.state, version),
      ...(event.status.message && {
        message: formatMessage(event.status.message, version),
      }),
      timestamp: event.status.timestamp,
    },
  };

  if (version === "1.0.0") {
    return { statusUpdate: inner };
  }

  // v0.3.0: flat format with kind discriminator and computed final
  const isFinal = TERMINAL_STATES.includes(event.status.state);
  return { ...inner, kind: "status-update", final: isFinal };
}

export function formatTaskArtifactUpdateEvent(
  event: TaskArtifactUpdateEvent,
  version: A2aProtocolVersion,
): Record<string, unknown> {
  const formattedArtifact: Record<string, unknown> = {
    ...event.artifact,
    parts: event.artifact.parts.map((p) => formatPart(p, version)),
  };

  if (version === "1.0.0") {
    const inner: Record<string, unknown> = {
      taskId: event.taskId,
      contextId: event.contextId,
      artifact: formattedArtifact,
    };
    if (event.append !== undefined) inner.append = event.append;
    if (event.lastChunk !== undefined) inner.lastChunk = event.lastChunk;
    if (event.metadata) inner.metadata = event.metadata;
    return { artifactUpdate: inner };
  }

  // v0.3.0: flat format with kind discriminator, no append/lastChunk
  return {
    kind: "artifact-update",
    taskId: event.taskId,
    contextId: event.contextId,
    artifact: formattedArtifact,
  };
}

export function formatStreamTask(task: Task, version: A2aProtocolVersion): Record<string, unknown> {
  const formatted = formatTask(task, version);
  if (version === "1.0.0") {
    return { task: formatted };
  }
  return formatted;
}
