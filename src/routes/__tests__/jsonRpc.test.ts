import request from "supertest";
import { createTestApp } from "../../__tests__/helpers/setup.js";
import type { Express } from "express";

let app: Express;

beforeAll(() => {
  app = createTestApp();
});

function validMessage(method = "message/send"): Record<string, unknown> {
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

describe("POST / (root JSON-RPC route)", () => {
  it("should return error -32600 for invalid JSON-RPC request (missing jsonrpc/method)", async () => {
    const res = await request(app)
      .post("/")
      .set("Content-Type", "application/json")
      .send({ id: "1" });

    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe(-32600);
  });

  it("should return error -32601 for unknown method", async () => {
    const res = await request(app)
      .post("/")
      .set("Content-Type", "application/json")
      .send({ jsonrpc: "2.0", id: "1", method: "nonexistent/method" });

    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe(-32601);
  });

  it("should return a task result with kind 'task' for message/send", async () => {
    const res = await request(app)
      .post("/")
      .set("Content-Type", "application/json")
      .send(validMessage("message/send"));

    expect(res.body.result).toBeDefined();
    expect(res.body.result.kind).toBe("task");
  });

  it("should also work with SendMessage method alias", async () => {
    const res = await request(app)
      .post("/")
      .set("Content-Type", "application/json")
      .send(validMessage("SendMessage"));

    expect(res.body.result).toBeDefined();
    expect(res.body.result.kind).toBe("task");
  });

  it("should return a task with id, contextId, and status with state 'completed'", async () => {
    const res = await request(app)
      .post("/")
      .set("Content-Type", "application/json")
      .send(validMessage());

    const task = res.body.result;
    expect(task.id).toBeDefined();
    expect(task.contextId).toBeDefined();
    expect(task.status).toBeDefined();
    expect(task.status.state).toBe("completed");
  });

  it("should return a status message with parts containing at least one text part", async () => {
    const res = await request(app)
      .post("/")
      .set("Content-Type", "application/json")
      .send(validMessage());

    const message = res.body.result.status.message;
    expect(message).toBeDefined();
    expect(Array.isArray(message.parts)).toBe(true);
    expect(message.parts.length).toBeGreaterThanOrEqual(1);

    const textPart = message.parts.find(
      (p: Record<string, unknown>) => p.kind === "text" || p.text !== undefined,
    );
    expect(textPart).toBeDefined();
  });
});
