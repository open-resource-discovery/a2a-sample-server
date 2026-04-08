// A2A Protocol Types (v1.0.0)

// --- Parts (unified, no discriminator) ---

export interface Part {
  text?: string;
  url?: string;
  raw?: string;
  data?: Record<string, unknown>;
  mediaType?: string;
  filename?: string;
  metadata?: Record<string, unknown>;
}

// Legacy aliases for backward-compatible code that references TextPart
export type TextPart = Part;

// --- Messages ---

export type MessageRole = "ROLE_USER" | "ROLE_AGENT";

export interface Extension {
  uri: string;
  version?: string;
  required?: boolean;
  params?: Record<string, unknown>;
}

export interface Message {
  role: MessageRole;
  parts: Part[];
  messageId: string;
  contextId?: string;
  taskId?: string;
  referenceTaskIds?: string[];
  extensions?: Extension[];
  metadata?: Record<string, unknown>;
}

// --- Tasks ---

export type TaskState =
  | "TASK_STATE_UNSPECIFIED"
  | "TASK_STATE_SUBMITTED"
  | "TASK_STATE_WORKING"
  | "TASK_STATE_INPUT_REQUIRED"
  | "TASK_STATE_COMPLETED"
  | "TASK_STATE_CANCELED"
  | "TASK_STATE_FAILED"
  | "TASK_STATE_REJECTED"
  | "TASK_STATE_AUTH_REQUIRED";

export interface TaskStatus {
  state: TaskState;
  message?: Message;
  timestamp: string;
}

export interface Artifact {
  name: string;
  description?: string;
  parts: Part[];
  artifactId: string;
  extensions?: Extension[];
  metadata?: Record<string, unknown>;
}

export interface Task {
  id: string;
  contextId: string;
  status: TaskStatus;
  artifacts?: Artifact[];
  history?: Message[];
  metadata?: Record<string, unknown>;
  createdAt?: string;
  lastModified?: string;
}

// --- Streaming Events ---

export interface TaskStatusUpdateEvent {
  taskId: string;
  contextId: string;
  status: TaskStatus;
}

export interface TaskArtifactUpdateEvent {
  taskId: string;
  contextId: string;
  artifact: Artifact;
  append?: boolean;
  lastChunk?: boolean;
  metadata?: Record<string, unknown>;
}

// --- Skills ---

export interface Skill {
  id: string;
  name: string;
  description: string;
  tags: string[];
  inputModes?: string[];
  outputModes?: string[];
  examples?: string[];
  security?: Record<string, string[]>[];
}

// --- Capabilities ---

export interface AgentExtension {
  uri: string;
  description?: string;
  required?: boolean;
  params?: Record<string, unknown>;
}

export interface AgentCapabilities {
  streaming?: boolean;
  pushNotifications?: boolean;
  extendedAgentCard?: boolean;
  extensions?: AgentExtension[];
}

// --- Security Scheme Types (per A2A protocol v1.0.0) ---

export interface ApiKeySecurityScheme {
  type: "apiKey";
  name: string;
  in: "query" | "header" | "cookie";
  description?: string;
}

export interface HttpAuthSecurityScheme {
  type: "http";
  scheme: "basic" | "bearer";
  bearerFormat?: string;
  description?: string;
}

export interface AuthorizationCodeOauthFlow {
  authorizationUrl: string;
  tokenUrl: string;
  refreshUrl?: string;
  scopes: Record<string, string>;
  pkceRequired?: boolean;
}

export interface ClientCredentialsOauthFlow {
  tokenUrl: string;
  refreshUrl?: string;
  scopes: Record<string, string>;
}

export interface DeviceCodeOauthFlow {
  deviceAuthorizationUrl: string;
  tokenUrl: string;
  refreshUrl?: string;
  scopes: Record<string, string>;
}

export interface OauthFlows {
  authorizationCode?: AuthorizationCodeOauthFlow;
  clientCredentials?: ClientCredentialsOauthFlow;
  deviceCode?: DeviceCodeOauthFlow;
}

export interface Oauth2SecurityScheme {
  type: "oauth2";
  flows: OauthFlows;
  oauth2MetadataUrl?: string;
  description?: string;
}

export interface OpenIdConnectSecurityScheme {
  type: "openIdConnect";
  openIdConnectUrl: string;
  description?: string;
}

export interface MutualTlsSecurityScheme {
  type: "mutualTLS";
  description?: string;
}

export type SecurityScheme =
  | ApiKeySecurityScheme
  | HttpAuthSecurityScheme
  | Oauth2SecurityScheme
  | OpenIdConnectSecurityScheme
  | MutualTlsSecurityScheme;

// --- Agent Card (v1.0.0) ---

export interface AgentInterface {
  url: string;
  protocolBinding: "JSONRPC" | "GRPC" | "HTTP+JSON";
  protocolVersion: string;
  tenant?: string;
}

export interface AgentCardSignature {
  protected: string;
  signature: string;
  header?: Record<string, unknown>;
}

export interface AgentCard {
  name: string;
  description: string;
  version: string;
  supportedInterfaces: AgentInterface[];
  capabilities: AgentCapabilities;
  skills: Skill[];
  defaultInputModes: string[];
  defaultOutputModes: string[];
  provider?: {
    organization: string;
    url: string;
  };
  securitySchemes?: Record<string, SecurityScheme>;
  security?: Record<string, string[]>[];
  signatures?: AgentCardSignature[];
  documentationUrl?: string;
  iconUrl?: string;
}
