process.env.AUTH_API_KEY = "test-api-key";
process.env.AUTH_BASIC_USER = "admin";
process.env.AUTH_BASIC_PASS = "password";

import request from "supertest";
import { createTestApp } from "../../__tests__/helpers/setup.js";
import { config } from "../../config.js";
import type { Express } from "express";

let app: Express;

beforeAll(() => {
  // ESM hoists imports above process.env assignments, so the config module
  // may have already been evaluated with empty env vars. Patch it directly.
  config.authApiKey = "test-api-key";
  config.authBasicUser = "admin";
  config.authBasicPass = "password";

  app = createTestApp();
});

function validJsonRpcMessage(method = "message/send"): Record<string, unknown> {
  return {
    jsonrpc: "2.0",
    id: "1",
    method,
    params: {
      message: {
        role: "ROLE_USER",
        parts: [{ text: "Hello" }],
        messageId: "msg-1",
      },
    },
  };
}

describe("GET /agents", () => {
  it("should return 200 with JSON containing an agents array", async () => {
    const res = await request(app).get("/agents");

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(Array.isArray(res.body.agents)).toBe(true);
  });

  it("should list at least 12 agents", async () => {
    const res = await request(app).get("/agents");

    expect(res.body.agents.length).toBeGreaterThanOrEqual(12);
  });

  it("each agent should have id, name, description, url, and agentCardUrl", async () => {
    const res = await request(app).get("/agents");

    for (const agent of res.body.agents) {
      expect(agent.id).toBeDefined();
      expect(typeof agent.id).toBe("string");
      expect(agent.name).toBeDefined();
      expect(typeof agent.name).toBe("string");
      expect(agent.description).toBeDefined();
      expect(typeof agent.description).toBe("string");
      expect(agent.url).toBeDefined();
      expect(typeof agent.url).toBe("string");
      expect(agent.agentCardUrl).toBeDefined();
      expect(typeof agent.agentCardUrl).toBe("string");
    }
  });
});

describe("GET /agents/solar/agent.json", () => {
  it("should return 200 with agent card", async () => {
    const res = await request(app).get("/agents/solar/agent.json");

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
  });

  it("card should have name 'Solar System Explorer'", async () => {
    const res = await request(app).get("/agents/solar/agent.json");

    expect(res.body.name).toBe("Solar System Explorer");
  });
});

describe("GET /agents/nonexistent/agent.json", () => {
  it("should return 404", async () => {
    const res = await request(app).get("/agents/nonexistent/agent.json");

    expect(res.status).toBe(404);
  });
});

describe("POST /agents/solar/", () => {
  it("should return task result for valid JSON-RPC message/send", async () => {
    const res = await request(app)
      .post("/agents/solar/")
      .set("Content-Type", "application/json")
      .send(validJsonRpcMessage());

    expect(res.body.result).toBeDefined();
    expect(res.body.result.kind).toBe("task");
    expect(res.body.result.status.state).toBe("completed");
  });

  it("should return error for invalid JSON-RPC request", async () => {
    const res = await request(app)
      .post("/agents/solar/")
      .set("Content-Type", "application/json")
      .send({ id: "1" });

    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe(-32600);
  });
});

describe("POST /agents/code-reviewer/ (requires API key auth)", () => {
  it("should return 401 or auth error without API key", async () => {
    const res = await request(app)
      .post("/agents/code-reviewer/")
      .set("Content-Type", "application/json")
      .send(validJsonRpcMessage());

    expect(res.status).toBe(401);
  });

  it("should return task result with correct X-API-Key header", async () => {
    const res = await request(app)
      .post("/agents/code-reviewer/")
      .set("Content-Type", "application/json")
      .set("X-API-Key", "test-api-key")
      .send(validJsonRpcMessage());

    expect(res.body.result).toBeDefined();
    expect(res.body.result.kind).toBe("task");
    expect(res.body.result.status.state).toBe("completed");
  });
});
