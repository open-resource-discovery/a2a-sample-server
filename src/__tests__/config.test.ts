/**
 * Tests for src/config.ts
 *
 * The config object is evaluated at module load time from process.env,
 * so each test uses jest.resetModules() + dynamic import() to get a
 * fresh evaluation with the desired env vars.
 */

import { jest } from "@jest/globals";

let savedEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  savedEnv = { ...process.env };
  jest.resetModules();
});

afterEach(() => {
  process.env = savedEnv;
});

async function loadConfig(): Promise<(typeof import("../config.js"))["config"]> {
  const mod = await import("../config.js");
  return mod.config;
}

// ---------------------------------------------------------------------------
// port
// ---------------------------------------------------------------------------

describe("config.port", () => {
  it("defaults to 3000 when PORT is not set", async () => {
    delete process.env.PORT;
    const cfg = await loadConfig();
    expect(cfg.port).toBe(3000);
  });

  it("parses PORT from env", async () => {
    process.env.PORT = "8080";
    const cfg = await loadConfig();
    expect(cfg.port).toBe(8080);
  });

  it("parses PORT as base-10 integer", async () => {
    process.env.PORT = "0100"; // would be 64 in octal
    const cfg = await loadConfig();
    expect(cfg.port).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// serverUrl
// ---------------------------------------------------------------------------

describe("config.serverUrl", () => {
  it("defaults to http://localhost:3000 when SERVER_URL is not set", async () => {
    delete process.env.SERVER_URL;
    const cfg = await loadConfig();
    expect(cfg.serverUrl).toBe("http://localhost:3000");
  });

  it("reads SERVER_URL from env", async () => {
    process.env.SERVER_URL = "https://example.com";
    const cfg = await loadConfig();
    expect(cfg.serverUrl).toBe("https://example.com");
  });
});

// ---------------------------------------------------------------------------
// Authentication fields
// ---------------------------------------------------------------------------

describe("config authentication fields", () => {
  it("authApiKey defaults to empty string", async () => {
    delete process.env.AUTH_API_KEY;
    const cfg = await loadConfig();
    expect(cfg.authApiKey).toBe("");
  });

  it("reads AUTH_API_KEY from env", async () => {
    process.env.AUTH_API_KEY = "my-secret-key";
    const cfg = await loadConfig();
    expect(cfg.authApiKey).toBe("my-secret-key");
  });

  it("authBasicUser defaults to empty string", async () => {
    delete process.env.AUTH_BASIC_USER;
    const cfg = await loadConfig();
    expect(cfg.authBasicUser).toBe("");
  });

  it("reads AUTH_BASIC_USER from env", async () => {
    process.env.AUTH_BASIC_USER = "admin";
    const cfg = await loadConfig();
    expect(cfg.authBasicUser).toBe("admin");
  });

  it("authBasicPass defaults to empty string", async () => {
    delete process.env.AUTH_BASIC_PASS;
    const cfg = await loadConfig();
    expect(cfg.authBasicPass).toBe("");
  });

  it("reads AUTH_BASIC_PASS from env", async () => {
    process.env.AUTH_BASIC_PASS = "password123";
    const cfg = await loadConfig();
    expect(cfg.authBasicPass).toBe("password123");
  });
});

// ---------------------------------------------------------------------------
// OAuth fields
// ---------------------------------------------------------------------------

describe("config OAuth fields", () => {
  it("oauthEnabled defaults to false when OAUTH_ENABLED is not set", async () => {
    delete process.env.OAUTH_ENABLED;
    const cfg = await loadConfig();
    expect(cfg.oauthEnabled).toBe(false);
  });

  it("oauthEnabled is true only when OAUTH_ENABLED is exactly 'true'", async () => {
    process.env.OAUTH_ENABLED = "true";
    const cfg = await loadConfig();
    expect(cfg.oauthEnabled).toBe(true);
  });

  it("oauthEnabled is false for other truthy strings", async () => {
    process.env.OAUTH_ENABLED = "1";
    const cfg = await loadConfig();
    expect(cfg.oauthEnabled).toBe(false);
  });

  it("oauthClientId defaults to empty string", async () => {
    delete process.env.OAUTH_CLIENT_ID;
    const cfg = await loadConfig();
    expect(cfg.oauthClientId).toBe("");
  });

  it("reads OAUTH_CLIENT_ID from env", async () => {
    process.env.OAUTH_CLIENT_ID = "client-abc";
    const cfg = await loadConfig();
    expect(cfg.oauthClientId).toBe("client-abc");
  });

  it("oauthClientSecret defaults to empty string", async () => {
    delete process.env.OAUTH_CLIENT_SECRET;
    const cfg = await loadConfig();
    expect(cfg.oauthClientSecret).toBe("");
  });

  it("reads OAUTH_CLIENT_SECRET from env", async () => {
    process.env.OAUTH_CLIENT_SECRET = "secret-xyz";
    const cfg = await loadConfig();
    expect(cfg.oauthClientSecret).toBe("secret-xyz");
  });

  it("oauthIssuer defaults to empty string", async () => {
    delete process.env.OAUTH_ISSUER;
    const cfg = await loadConfig();
    expect(cfg.oauthIssuer).toBe("");
  });

  it("reads OAUTH_ISSUER from env", async () => {
    process.env.OAUTH_ISSUER = "https://issuer.example.com";
    const cfg = await loadConfig();
    expect(cfg.oauthIssuer).toBe("https://issuer.example.com");
  });

  it("oauthJwtSecret defaults to empty string", async () => {
    delete process.env.OAUTH_JWT_SECRET;
    const cfg = await loadConfig();
    expect(cfg.oauthJwtSecret).toBe("");
  });

  it("reads OAUTH_JWT_SECRET from env", async () => {
    process.env.OAUTH_JWT_SECRET = "jwt-secret-value";
    const cfg = await loadConfig();
    expect(cfg.oauthJwtSecret).toBe("jwt-secret-value");
  });

  it("oauthTokenExpirySeconds defaults to 3600", async () => {
    delete process.env.OAUTH_TOKEN_EXPIRY_SECONDS;
    const cfg = await loadConfig();
    expect(cfg.oauthTokenExpirySeconds).toBe(3600);
  });

  it("parses OAUTH_TOKEN_EXPIRY_SECONDS from env", async () => {
    process.env.OAUTH_TOKEN_EXPIRY_SECONDS = "7200";
    const cfg = await loadConfig();
    expect(cfg.oauthTokenExpirySeconds).toBe(7200);
  });
});
