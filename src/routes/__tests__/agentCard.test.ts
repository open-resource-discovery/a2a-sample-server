import request from "supertest";
import { createTestApp } from "../../__tests__/helpers/setup.js";
import type { Express } from "express";

let app: Express;

beforeAll(() => {
  app = createTestApp();
});

describe("GET /.well-known/agent.json", () => {
  it("should return 200 with JSON", async () => {
    const res = await request(app).get("/.well-known/agent.json");

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
  });

  it("should have a name field with the solar agent name", async () => {
    const res = await request(app).get("/.well-known/agent.json");

    expect(res.body.name).toBe("Solar System Explorer");
  });

  it("should have a skills array", async () => {
    const res = await request(app).get("/.well-known/agent.json");

    expect(Array.isArray(res.body.skills)).toBe(true);
    expect(res.body.skills.length).toBeGreaterThan(0);
  });

  it("should have a url field (v0.3.0 format)", async () => {
    const res = await request(app).get("/.well-known/agent.json");

    expect(res.body.url).toBeDefined();
    expect(typeof res.body.url).toBe("string");
  });

  it("should NOT have supportedInterfaces (v0.3.0 format)", async () => {
    const res = await request(app).get("/.well-known/agent.json");

    expect(res.body.supportedInterfaces).toBeUndefined();
  });
});

describe("GET /.well-known/agent-card.json", () => {
  it("should also return 200 with the same agent card", async () => {
    const res = await request(app).get("/.well-known/agent-card.json");

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.body.name).toBe("Solar System Explorer");
  });
});
