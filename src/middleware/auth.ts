import type { Request } from "express";
import type { SecurityScheme } from "../types/a2a.js";
import { config } from "../config.js";
import { verifyJwt } from "../oauth/mockOAuthServer.js";

export interface AuthResult {
  authenticated: boolean;
  error?: string;
}

export function validateAuth(
  req: Request,
  securitySchemes: Record<string, SecurityScheme> | undefined,
): AuthResult {
  // No security schemes = no auth required
  if (!securitySchemes || Object.keys(securitySchemes).length === 0) {
    return { authenticated: true };
  }

  // Check each security scheme - if ANY passes, auth succeeds (OR logic)
  for (const [, scheme] of Object.entries(securitySchemes)) {
    const result = validateScheme(req, scheme);
    if (result.authenticated) {
      return result;
    }
  }

  return { authenticated: false, error: "Authentication required" };
}

function validateScheme(req: Request, scheme: SecurityScheme): AuthResult {
  if (scheme.type === "apiKey") {
    return validateApiKey(req, scheme.name, scheme.in);
  }

  if (scheme.type === "http") {
    if (scheme.scheme === "basic") {
      return validateBasicAuth(req);
    }
    if (scheme.scheme === "bearer") {
      return validateBearerAuth(req);
    }
  }

  if (scheme.type === "oauth2") {
    return validateOauth2Token(req);
  }

  return { authenticated: false, error: "Unsupported security scheme" };
}

function validateApiKey(
  req: Request,
  keyName: string,
  location: "query" | "header" | "cookie",
): AuthResult {
  let providedKey: string | undefined;

  if (location === "header") {
    providedKey = req.get(keyName);
  } else if (location === "query") {
    // Check query parameter first, then fall back to header
    // (browsers sending POST requests find headers more natural than query params)
    providedKey = (req.query[keyName] as string | undefined) || req.get(keyName);
  } else if (location === "cookie") {
    providedKey = req.cookies?.[keyName];
  }

  if (!providedKey) {
    return { authenticated: false, error: `Missing API key in ${location}: ${keyName}` };
  }

  if (providedKey !== config.authApiKey) {
    return { authenticated: false, error: "Invalid API key" };
  }

  return { authenticated: true };
}

function validateBasicAuth(req: Request): AuthResult {
  const authHeader = req.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return { authenticated: false, error: "Missing Basic authentication" };
  }

  const base64Credentials = authHeader.slice(6);
  const credentials = Buffer.from(base64Credentials, "base64").toString("utf-8");
  const [username, password] = credentials.split(":");

  if (username !== config.authBasicUser || password !== config.authBasicPass) {
    return { authenticated: false, error: "Invalid credentials" };
  }

  return { authenticated: true };
}

function validateBearerAuth(req: Request): AuthResult {
  const authHeader = req.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { authenticated: false, error: "Missing Bearer token" };
  }

  const token = authHeader.slice(7);

  // For simplicity, use the same API key for bearer tokens
  if (token !== config.authApiKey) {
    return { authenticated: false, error: "Invalid bearer token" };
  }

  return { authenticated: true };
}

function validateOauth2Token(req: Request): AuthResult {
  const authHeader = req.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { authenticated: false, error: "Missing OAuth2 bearer token" };
  }

  const token = authHeader.slice(7);
  const payload = verifyJwt(token);

  if (!payload) {
    return { authenticated: false, error: "Invalid or expired OAuth2 token" };
  }

  return { authenticated: true };
}
