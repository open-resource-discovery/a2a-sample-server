import { Router, Request, Response } from "express";
import crypto from "crypto";
import type {
  OauthClient,
  OauthTokenResponse,
  OauthErrorResponse,
  JwtPayload,
  AuthorizationCode,
  DeviceCode,
} from "./types.js";
import { config } from "../config.js";

const router = Router();

// In-memory stores
const registeredClients: Map<string, OauthClient> = new Map();
const authorizationCodes: Map<string, AuthorizationCode> = new Map();
const deviceCodes: Map<string, DeviceCode> = new Map();

// JWT secret for signing tokens (in production, use proper key management)
let jwtSecret: string;

function getJwtSecret(): string {
  if (!jwtSecret) {
    jwtSecret = config.oauthJwtSecret || crypto.randomBytes(32).toString("hex");
  }
  return jwtSecret;
}

// Register default test client on startup
function initializeDefaultClient(): void {
  if (config.oauthClientId && config.oauthClientSecret) {
    registeredClients.set(config.oauthClientId, {
      clientId: config.oauthClientId,
      clientSecret: config.oauthClientSecret,
      name: "Default OAuth Client",
    });
  }
  // Always register a test client for development
  registeredClients.set("test-client", {
    clientId: "test-client",
    clientSecret: "test-secret",
    name: "Test Client",
  });
}

// Simple base64url encoding for JWT
function base64url(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64urlFromBuffer(buf: Buffer): string {
  return buf.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

// Create a signed JWT token
function createJwt(payload: JwtPayload): string {
  const header = { alg: "HS256", typ: "JWT" };
  const headerEncoded = base64url(JSON.stringify(header));
  const payloadEncoded = base64url(JSON.stringify(payload));

  const signature = crypto
    .createHmac("sha256", getJwtSecret())
    .update(`${headerEncoded}.${payloadEncoded}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${headerEncoded}.${payloadEncoded}.${signature}`;
}

// Verify a JWT token
export function verifyJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const [headerEncoded, payloadEncoded, signatureProvided] = parts;

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", getJwtSecret())
      .update(`${headerEncoded}.${payloadEncoded}`)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    if (signatureProvided !== expectedSignature) {
      return null;
    }

    // Decode and parse payload
    const payloadJson = Buffer.from(payloadEncoded, "base64").toString("utf-8");
    const payload: JwtPayload = JSON.parse(payloadJson);

    // Check expiration
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// --- Helpers for new flows ---

function generateCode(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

function generateUserCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const bytes = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code.slice(0, 4) + "-" + code.slice(4);
}

function verifyPkce(codeVerifier: string, codeChallenge: string, method: string): boolean {
  if (method === "S256") {
    const hash = crypto.createHash("sha256").update(codeVerifier).digest();
    const computed = base64urlFromBuffer(hash);
    return computed === codeChallenge;
  }
  // "plain" method
  return codeVerifier === codeChallenge;
}

function issueJwt(clientId: string, scope: string): OauthTokenResponse {
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = config.oauthTokenExpirySeconds || 3600;

  const payload: JwtPayload = {
    iss: config.oauthIssuer || config.serverUrl,
    sub: clientId,
    aud: config.serverUrl,
    exp: now + expiresIn,
    iat: now,
    scope,
    client_id: clientId,
  };

  return {
    access_token: createJwt(payload),
    token_type: "Bearer",
    expires_in: expiresIn,
    scope,
  };
}

// Clean up expired codes every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, code] of authorizationCodes) {
    if (code.expiresAt < now) authorizationCodes.delete(key);
  }
  for (const [key, code] of deviceCodes) {
    if (code.expiresAt < now) deviceCodes.delete(key);
  }
}, 60_000);

// --- Authorization Code + PKCE Flow ---

router.get("/authorize", (req: Request, res: Response) => {
  if (registeredClients.size === 0) {
    initializeDefaultClient();
  }

  const clientId = req.query.client_id as string;
  const redirectUri = req.query.redirect_uri as string;
  const codeChallenge = req.query.code_challenge as string;
  const codeChallengeMethod = (req.query.code_challenge_method as string) || "S256";
  const state = req.query.state as string;
  const scope = (req.query.scope as string) || "a2a:invoke";
  const responseType = req.query.response_type as string;

  if (!clientId || !redirectUri || !responseType) {
    return res.status(400).json({
      error: "invalid_request",
      error_description: "Missing required parameters: client_id, redirect_uri, response_type",
    });
  }

  if (responseType !== "code") {
    return res.status(400).json({
      error: "unsupported_response_type",
      error_description: "Only 'code' response type is supported",
    });
  }

  const client = registeredClients.get(clientId);
  if (!client) {
    return res.status(400).json({
      error: "invalid_client",
      error_description: "Unknown client_id",
    });
  }

  if (!codeChallenge) {
    return res.status(400).json({
      error: "invalid_request",
      error_description: "code_challenge is required (PKCE)",
    });
  }

  const code = generateCode();
  authorizationCodes.set(code, {
    code,
    clientId,
    redirectUri,
    codeChallenge,
    codeChallengeMethod,
    scope,
    expiresAt: Date.now() + 60_000,
  });

  const redirectUrl = new URL(redirectUri);
  redirectUrl.searchParams.set("code", code);
  if (state) {
    redirectUrl.searchParams.set("state", state);
  }

  return res.redirect(302, redirectUrl.toString());
});

// --- Device Code Flow ---

router.post("/device", (req: Request, res: Response) => {
  if (registeredClients.size === 0) {
    initializeDefaultClient();
  }

  const clientId = req.body.client_id as string;
  const scope = (req.body.scope as string) || "a2a:invoke";

  if (!clientId) {
    return res.status(400).json({
      error: "invalid_request",
      error_description: "Missing client_id",
    });
  }

  const client = registeredClients.get(clientId);
  if (!client) {
    return res.status(400).json({
      error: "invalid_client",
      error_description: "Unknown client_id",
    });
  }

  const deviceCode = generateCode();
  const userCode = generateUserCode();

  deviceCodes.set(deviceCode, {
    deviceCode,
    userCode,
    clientId,
    scope,
    expiresAt: Date.now() + 300_000,
    interval: 5,
    approved: false,
  });

  return res.json({
    device_code: deviceCode,
    user_code: userCode,
    verification_uri: `${config.serverUrl}/oauth/device/verify`,
    verification_uri_complete: `${config.serverUrl}/oauth/device/verify?user_code=${userCode}`,
    expires_in: 300,
    interval: 5,
  });
});

// Device verification page (user visits this URL to approve the device)
router.get("/device/verify", (req: Request, res: Response) => {
  const userCode = (req.query.user_code as string) || "";

  res.send(`<!DOCTYPE html>
<html><head><title>Device Authorization</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 480px; margin: 80px auto; text-align: center; }
  .code { font-size: 2rem; font-weight: bold; letter-spacing: 0.3em; margin: 1.5rem 0; font-family: monospace; }
  input { font-size: 1.2rem; padding: 0.5rem; text-align: center; letter-spacing: 0.2em; text-transform: uppercase; width: 12em; }
  button { font-size: 1.1rem; padding: 0.6rem 2rem; margin-top: 1rem; cursor: pointer; background: #0070d2; color: white; border: none; border-radius: 4px; }
  button:hover { background: #005bb5; }
  button:disabled { background: #999; cursor: not-allowed; }
  .status { margin-top: 1rem; font-size: 1.1rem; }
  .success { color: green; }
  .error { color: red; }
</style></head>
<body>
  <h1>Device Authorization</h1>
  <p>Confirm the code shown on your device:</p>
  ${
    userCode
      ? `<div class="code">${userCode}</div>
       <input type="hidden" id="code" value="${userCode}">`
      : `<input type="text" id="code" placeholder="XXXX-XXXX" maxlength="9">`
  }
  <br>
  <button id="btn" onclick="approve()">Approve</button>
  <div id="status" class="status"></div>
  <script>
  async function approve() {
    const code = document.getElementById('code').value.trim();
    if (!code) { show('Please enter a code', 'error'); return; }
    document.getElementById('btn').disabled = true;
    try {
      const res = await fetch('/oauth/device/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'user_code=' + encodeURIComponent(code)
      });
      const data = await res.json();
      if (data.status === 'approved') {
        show('Device approved! You can close this page.', 'success');
      } else {
        show(data.error_description || data.error || 'Unknown error', 'error');
        document.getElementById('btn').disabled = false;
      }
    } catch (e) {
      show('Network error: ' + e.message, 'error');
      document.getElementById('btn').disabled = false;
    }
  }
  function show(msg, cls) { const s = document.getElementById('status'); s.textContent = msg; s.className = 'status ' + cls; }
  </script>
</body></html>`);
});

router.post("/device/approve", (req: Request, res: Response) => {
  const userCode = req.body.user_code as string;

  if (!userCode) {
    return res.status(400).json({
      error: "invalid_request",
      error_description: "Missing user_code",
    });
  }

  for (const [, dc] of deviceCodes) {
    if (dc.userCode === userCode) {
      if (Date.now() > dc.expiresAt) {
        return res.status(400).json({
          error: "expired_token",
          error_description: "Device code has expired",
        });
      }
      dc.approved = true;
      return res.json({ status: "approved" });
    }
  }

  return res.status(400).json({
    error: "invalid_request",
    error_description: "Unknown user_code",
  });
});

// --- Token Endpoint (supports multiple grant types) ---

function handleAuthorizationCodeGrant(req: Request, res: Response): void {
  const code = req.body.code as string;
  const redirectUri = req.body.redirect_uri as string;
  const codeVerifier = req.body.code_verifier as string;
  const clientId = req.body.client_id as string;

  if (!code || !redirectUri || !codeVerifier || !clientId) {
    res.status(400).json({
      error: "invalid_request",
      error_description:
        "Missing required parameters: code, redirect_uri, code_verifier, client_id",
    } satisfies OauthErrorResponse);
    return;
  }

  const authCode = authorizationCodes.get(code);
  if (!authCode) {
    res.status(400).json({
      error: "invalid_grant",
      error_description: "Invalid or expired authorization code",
    } satisfies OauthErrorResponse);
    return;
  }
  authorizationCodes.delete(code);

  if (Date.now() > authCode.expiresAt) {
    res.status(400).json({
      error: "invalid_grant",
      error_description: "Authorization code has expired",
    } satisfies OauthErrorResponse);
    return;
  }

  if (authCode.clientId !== clientId) {
    res.status(400).json({
      error: "invalid_grant",
      error_description: "client_id mismatch",
    } satisfies OauthErrorResponse);
    return;
  }

  if (authCode.redirectUri !== redirectUri) {
    res.status(400).json({
      error: "invalid_grant",
      error_description: "redirect_uri mismatch",
    } satisfies OauthErrorResponse);
    return;
  }

  if (!verifyPkce(codeVerifier, authCode.codeChallenge, authCode.codeChallengeMethod)) {
    res.status(400).json({
      error: "invalid_grant",
      error_description: "PKCE verification failed",
    } satisfies OauthErrorResponse);
    return;
  }

  res.json(issueJwt(clientId, authCode.scope));
}

function handleDeviceCodeGrant(req: Request, res: Response): void {
  const deviceCodeValue = req.body.device_code as string;
  const clientId = req.body.client_id as string;

  if (!deviceCodeValue || !clientId) {
    res.status(400).json({
      error: "invalid_request",
      error_description: "Missing device_code or client_id",
    } satisfies OauthErrorResponse);
    return;
  }

  const dc = deviceCodes.get(deviceCodeValue);
  if (!dc) {
    res.status(400).json({
      error: "invalid_grant",
      error_description: "Unknown device_code",
    } satisfies OauthErrorResponse);
    return;
  }

  if (Date.now() > dc.expiresAt) {
    deviceCodes.delete(deviceCodeValue);
    res.status(400).json({
      error: "expired_token",
      error_description: "Device code has expired",
    } satisfies OauthErrorResponse);
    return;
  }

  if (dc.clientId !== clientId) {
    res.status(400).json({
      error: "invalid_client",
      error_description: "client_id mismatch",
    } satisfies OauthErrorResponse);
    return;
  }

  if (!dc.approved) {
    res.status(400).json({
      error: "authorization_pending",
      error_description: "User has not yet approved the device",
    } satisfies OauthErrorResponse);
    return;
  }

  deviceCodes.delete(deviceCodeValue);
  res.json(issueJwt(clientId, dc.scope));
}

function handleClientCredentialsGrant(
  _req: Request,
  res: Response,
  clientId: string | undefined,
  clientSecret: string | undefined,
  scope: string | undefined,
): void {
  if (!clientId || !clientSecret) {
    res.status(400).json({
      error: "invalid_request",
      error_description: "Missing client_id or client_secret",
    } satisfies OauthErrorResponse);
    return;
  }

  const client = registeredClients.get(clientId);
  if (!client || client.clientSecret !== clientSecret) {
    res.status(401).json({
      error: "invalid_client",
      error_description: "Invalid client credentials",
    } satisfies OauthErrorResponse);
    return;
  }

  res.json(issueJwt(clientId, scope || "a2a:invoke"));
}

router.post("/token", (req: Request, res: Response) => {
  if (registeredClients.size === 0) {
    initializeDefaultClient();
  }

  let grantType: string | undefined;
  let clientId: string | undefined;
  let clientSecret: string | undefined;
  let scope: string | undefined;

  if (req.is("application/x-www-form-urlencoded") || req.is("application/json")) {
    grantType = req.body.grant_type;
    clientId = req.body.client_id;
    clientSecret = req.body.client_secret;
    scope = req.body.scope;
  }

  // Check for Basic auth header (alternative client authentication)
  const authHeader = req.get("Authorization");
  if (authHeader?.startsWith("Basic ")) {
    const credentials = Buffer.from(authHeader.slice(6), "base64").toString("utf-8");
    const [id, secret] = credentials.split(":");
    clientId = clientId || id;
    clientSecret = clientSecret || secret;
  }

  if (grantType === "client_credentials") {
    return handleClientCredentialsGrant(req, res, clientId, clientSecret, scope);
  } else if (grantType === "authorization_code") {
    return handleAuthorizationCodeGrant(req, res);
  } else if (grantType === "urn:ietf:params:oauth:grant-type:device_code") {
    return handleDeviceCodeGrant(req, res);
  } else {
    return res.status(400).json({
      error: "unsupported_grant_type",
      error_description:
        "Supported: client_credentials, authorization_code, urn:ietf:params:oauth:grant-type:device_code",
    } satisfies OauthErrorResponse);
  }
});

// Initialize on module load
initializeDefaultClient();

export const oauthRouter = router;
