import { jest } from "@jest/globals";
import type { Request } from "express";
import type { SecurityScheme } from "../../types/a2a.js";

function createMockRequest(overrides: Partial<Request> = {}): Request {
  return {
    get: jest.fn(),
    query: {},
    cookies: {},
    ...overrides,
  } as unknown as Request;
}

describe("Auth Middleware", () => {
  // We need dynamic imports because the auth module reads config at import time,
  // and config reads process.env at module evaluation time.

  function importAuth(): Promise<typeof import("../auth.js")> {
    return import("../auth.js");
  }

  describe("validateAuth with no security schemes", () => {
    let validateAuth: (typeof import("../auth.js"))["validateAuth"];

    beforeAll(async () => {
      jest.resetModules();
      const authModule = await importAuth();
      validateAuth = authModule.validateAuth;
    });

    it("should return authenticated: true when securitySchemes is undefined", () => {
      const req = createMockRequest();
      const result = validateAuth(req, undefined);
      expect(result).toEqual({ authenticated: true });
    });

    it("should return authenticated: true when securitySchemes is empty object", () => {
      const req = createMockRequest();
      const result = validateAuth(req, {});
      expect(result).toEqual({ authenticated: true });
    });
  });

  describe("API key authentication", () => {
    let validateAuth: (typeof import("../auth.js"))["validateAuth"];

    beforeAll(async () => {
      process.env.AUTH_API_KEY = "test-api-key";
      jest.resetModules();
      const authModule = await importAuth();
      validateAuth = authModule.validateAuth;
    });

    afterAll(() => {
      delete process.env.AUTH_API_KEY;
    });

    const apiKeyScheme: Record<string, SecurityScheme> = {
      apiKey: {
        type: "apiKey",
        name: "X-API-Key",
        in: "header",
      },
    };

    it("should succeed with correct API key in header", () => {
      const req = createMockRequest({
        get: jest.fn((headerName: string) => {
          if (headerName === "X-API-Key") return "test-api-key";
          return undefined;
        }) as unknown as Request["get"],
      });

      const result = validateAuth(req, apiKeyScheme);
      expect(result).toEqual({ authenticated: true });
    });

    it("should fail without API key", () => {
      const req = createMockRequest();

      const result = validateAuth(req, apiKeyScheme);
      expect(result.authenticated).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should fail with wrong API key", () => {
      const req = createMockRequest({
        get: jest.fn((headerName: string) => {
          if (headerName === "X-API-Key") return "wrong-key";
          return undefined;
        }) as unknown as Request["get"],
      });

      const result = validateAuth(req, apiKeyScheme);
      expect(result.authenticated).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("Basic authentication", () => {
    let validateAuth: (typeof import("../auth.js"))["validateAuth"];

    beforeAll(async () => {
      process.env.AUTH_BASIC_USER = "testuser";
      process.env.AUTH_BASIC_PASS = "testpass";
      jest.resetModules();
      const authModule = await importAuth();
      validateAuth = authModule.validateAuth;
    });

    afterAll(() => {
      delete process.env.AUTH_BASIC_USER;
      delete process.env.AUTH_BASIC_PASS;
    });

    const basicScheme: Record<string, SecurityScheme> = {
      basicAuth: {
        type: "http",
        scheme: "basic",
      },
    };

    it("should succeed with valid credentials", () => {
      const encoded = Buffer.from("testuser:testpass").toString("base64");
      const req = createMockRequest({
        get: jest.fn((headerName: string) => {
          if (headerName === "Authorization") return `Basic ${encoded}`;
          return undefined;
        }) as unknown as Request["get"],
      });

      const result = validateAuth(req, basicScheme);
      expect(result).toEqual({ authenticated: true });
    });

    it("should fail without Authorization header", () => {
      const req = createMockRequest();

      const result = validateAuth(req, basicScheme);
      expect(result.authenticated).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should fail with wrong credentials", () => {
      const encoded = Buffer.from("wronguser:wrongpass").toString("base64");
      const req = createMockRequest({
        get: jest.fn((headerName: string) => {
          if (headerName === "Authorization") return `Basic ${encoded}`;
          return undefined;
        }) as unknown as Request["get"],
      });

      const result = validateAuth(req, basicScheme);
      expect(result.authenticated).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("Bearer authentication", () => {
    let validateAuth: (typeof import("../auth.js"))["validateAuth"];

    beforeAll(async () => {
      process.env.AUTH_API_KEY = "my-bearer-token";
      jest.resetModules();
      const authModule = await importAuth();
      validateAuth = authModule.validateAuth;
    });

    afterAll(() => {
      delete process.env.AUTH_API_KEY;
    });

    const bearerScheme: Record<string, SecurityScheme> = {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    };

    it("should succeed with valid bearer token", () => {
      const req = createMockRequest({
        get: jest.fn((headerName: string) => {
          if (headerName === "Authorization") return "Bearer my-bearer-token";
          return undefined;
        }) as unknown as Request["get"],
      });

      const result = validateAuth(req, bearerScheme);
      expect(result).toEqual({ authenticated: true });
    });

    it("should fail without bearer token", () => {
      const req = createMockRequest();

      const result = validateAuth(req, bearerScheme);
      expect(result.authenticated).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("Multiple security schemes (OR logic)", () => {
    let validateAuth: (typeof import("../auth.js"))["validateAuth"];

    beforeAll(async () => {
      process.env.AUTH_API_KEY = "multi-key";
      process.env.AUTH_BASIC_USER = "admin";
      process.env.AUTH_BASIC_PASS = "secret";
      jest.resetModules();
      const authModule = await importAuth();
      validateAuth = authModule.validateAuth;
    });

    afterAll(() => {
      delete process.env.AUTH_API_KEY;
      delete process.env.AUTH_BASIC_USER;
      delete process.env.AUTH_BASIC_PASS;
    });

    const multiSchemes: Record<string, SecurityScheme> = {
      apiKey: {
        type: "apiKey",
        name: "X-API-Key",
        in: "header",
      },
      basicAuth: {
        type: "http",
        scheme: "basic",
      },
    };

    it("should succeed if API key scheme passes", () => {
      const req = createMockRequest({
        get: jest.fn((headerName: string) => {
          if (headerName === "X-API-Key") return "multi-key";
          return undefined;
        }) as unknown as Request["get"],
      });

      const result = validateAuth(req, multiSchemes);
      expect(result).toEqual({ authenticated: true });
    });

    it("should succeed if basic auth scheme passes", () => {
      const encoded = Buffer.from("admin:secret").toString("base64");
      const req = createMockRequest({
        get: jest.fn((headerName: string) => {
          if (headerName === "Authorization") return `Basic ${encoded}`;
          return undefined;
        }) as unknown as Request["get"],
      });

      const result = validateAuth(req, multiSchemes);
      expect(result).toEqual({ authenticated: true });
    });

    it("should fail if no scheme passes", () => {
      const req = createMockRequest();

      const result = validateAuth(req, multiSchemes);
      expect(result.authenticated).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
