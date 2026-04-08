# A2A Sample Server

A sample multi-agent server implementing the [Agent2Agent](https://a2a-protocol.org) (A2A) protocol, built as the companion backend for the [A2A Editor](https://github.com/open-resource-discovery/a2a-editor) playground. Ships with 12 ready-to-use agents, a mock LLM backend, and a built-in OAuth 2.0 server — no external dependencies or API keys needed.

> **Try it live:** Point the [A2A Editor Playground](https://open-resource-discovery.github.io/a2a-editor/playground) at a running instance of this server to interactively discover, inspect, and test agents.

## Features

- **12 agents** covering different use cases, auth schemes, and protocol versions
- **A2A protocol v0.3.0 and v1.0.0** — automatic version-aware formatting
- **JSON-RPC 2.0** transport with SSE streaming support
- **Authentication schemes**: API Key (header/query), HTTP Basic, HTTP Bearer, OAuth 2.0 (client credentials, authorization code + PKCE, device code)
- **Mock LLM provider** — deterministic canned responses, no real LLM calls
- **Built-in mock OAuth 2.0 server** with JWT token issuance

## Agents

| Agent                 | ID               | Auth                        | Streaming | Protocol |
| --------------------- | ---------------- | --------------------------- | --------- | -------- |
| Solar System Explorer | `solar`          | None                        | No        | 0.3.0    |
| Code Review Assistant | `code-reviewer`  | API Key                     | No        | 0.3.0    |
| Recipe Chef           | `chef`           | HTTP Basic                  | No        | 0.3.0    |
| Dad Jokes Generator   | `dad-jokes`      | OAuth2 (client_credentials) | No        | 1.0.0    |
| Language Tutor        | `language-tutor` | HTTP Basic                  | Yes       | 1.0.0    |
| Fitness Coach         | `fitness`        | HTTP Bearer                 | No        | 0.3.0    |
| Trivia Master         | `trivia`         | API Key (query)             | No        | 0.3.0    |
| Story Narrator        | `storyteller`    | API Key                     | Yes       | 0.3.0    |
| Tech News             | `tech-news`      | OAuth2 (auth code + PKCE)   | No        | 0.3.0    |
| Haiku Poet            | `haiku`          | OAuth2 (device code)        | Yes       | 0.3.0    |
| Unit Converter        | `converter`      | None                        | No        | 0.3.0    |
| Media Showcase        | `media`          | None                        | No        | 1.0.0    |

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start development server
npm run dev
```

The server starts on `http://localhost:3000`.

## API Endpoints

### Agent Discovery

```
GET /agents                          # List all agents
GET /agents/:agentId/agent.json      # Agent card (A2A discovery)
```

### JSON-RPC (per agent)

```
POST /agents/:agentId/               # Send message or stream
```

**Send a message:**

```json
{
  "jsonrpc": "2.0",
  "id": "1",
  "method": "message/send",
  "params": {
    "message": {
      "role": "ROLE_USER",
      "parts": [{ "text": "Hello" }],
      "messageId": "msg-1"
    }
  }
}
```

**Stream a message** (returns SSE):

```json
{
  "jsonrpc": "2.0",
  "id": "1",
  "method": "message/stream",
  "params": {
    "message": {
      "role": "ROLE_USER",
      "parts": [{ "text": "Tell me a story" }],
      "messageId": "msg-1"
    }
  }
}
```

### Backward-Compatible (Solar Agent)

```
GET  /.well-known/agent.json         # Solar agent card
POST /                                # Solar agent JSON-RPC
```

### OAuth 2.0

```
POST /oauth/token                     # Token endpoint
GET  /oauth/authorize                 # Authorization code flow
POST /oauth/device                    # Device code flow
GET  /oauth/device/verify             # Device verification page
```

## Authentication Examples

**No auth** (solar, converter, media):

```bash
curl -X POST http://localhost:3000/agents/solar/ \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":"1","method":"message/send","params":{"message":{"role":"ROLE_USER","parts":[{"text":"Hello"}],"messageId":"m1"}}}'
```

**API Key**:

```bash
curl -X POST http://localhost:3000/agents/code-reviewer/ \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secret-api-key" \
  -d '{"jsonrpc":"2.0","id":"1","method":"message/send","params":{"message":{"role":"ROLE_USER","parts":[{"text":"Review this code"}],"messageId":"m1"}}}'
```

**HTTP Basic**:

```bash
curl -X POST http://localhost:3000/agents/chef/ \
  -H "Content-Type: application/json" \
  -u admin:secret \
  -d '{"jsonrpc":"2.0","id":"1","method":"message/send","params":{"message":{"role":"ROLE_USER","parts":[{"text":"Give me a recipe"}],"messageId":"m1"}}}'
```

**OAuth2 (client credentials)**:

```bash
# Get token
TOKEN=$(curl -s -X POST http://localhost:3000/oauth/token \
  -d "grant_type=client_credentials&client_id=a2a-client&client_secret=a2a-secret&scope=a2a:invoke" \
  | jq -r '.access_token')

# Use token
curl -X POST http://localhost:3000/agents/dad-jokes/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"jsonrpc":"2.0","id":"1","method":"message/send","params":{"message":{"role":"ROLE_USER","parts":[{"text":"Tell me a joke"}],"messageId":"m1"}}}'
```

## Scripts

| Script                  | Description                                 |
| ----------------------- | ------------------------------------------- |
| `npm run dev`           | Start dev server with hot reload            |
| `npm start`             | Start production server                     |
| `npm run build`         | Compile TypeScript                          |
| `npm run check`         | Run all checks (types, lint, format, tests) |
| `npm run test:ci`       | Run tests                                   |
| `npm run test:watch`    | Run tests in watch mode                     |
| `npm run test:coverage` | Run tests with coverage                     |
| `npm run eslint`        | Lint source code                            |
| `npm run prettier`      | Format source code                          |

## Configuration

See [`.env.example`](.env.example) for all available environment variables.

Key settings:

- `PORT` — Server port (default: `3000`)
- `AUTH_API_KEY` — Shared API key for protected agents
- `AUTH_BASIC_USER` / `AUTH_BASIC_PASS` — Basic auth credentials
- `OAUTH_ENABLED` — Enable the mock OAuth server
- `OAUTH_CLIENT_ID` / `OAUTH_CLIENT_SECRET` — OAuth client credentials

## Adding a New Agent

1. Create a new file in `src/agents/implementations/`:

```typescript
import { BaseAgent } from "../baseAgent.js";
import type { AgentDefinition } from "../types.js";
import type { LlmClient } from "../../llm-client/client.js";

export class MyAgent extends BaseAgent {
  public constructor(llmClient: LlmClient) {
    super(llmClient);
  }

  public getDefinition(): AgentDefinition {
    return {
      id: "my-agent",
      name: "My Agent",
      description: "What this agent does.",
      version: "1.0.0",
      skills: [
        {
          id: "my-skill",
          name: "My Skill",
          description: "Skill description.",
          tags: ["example"],
        },
      ],
      systemPrompt: "You are a helpful assistant.",
    };
  }
}
```

2. Register it in `src/agents/index.ts`:

```typescript
import { MyAgent } from "./implementations/myAgent.js";

// Inside registerAllAgents():
agentRegistry.register(new MyAgent(llmClient));
```

3. The agent is automatically available at `/agents/my-agent/`.
