export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  serverUrl: process.env.SERVER_URL || "http://localhost:3000",
  // Authentication
  authApiKey: process.env.AUTH_API_KEY || "",
  authBasicUser: process.env.AUTH_BASIC_USER || "",
  authBasicPass: process.env.AUTH_BASIC_PASS || "",
  // OAuth Configuration
  oauthEnabled: process.env.OAUTH_ENABLED === "true",
  oauthClientId: process.env.OAUTH_CLIENT_ID || "",
  oauthClientSecret: process.env.OAUTH_CLIENT_SECRET || "",
  oauthIssuer: process.env.OAUTH_ISSUER || "",
  oauthJwtSecret: process.env.OAUTH_JWT_SECRET || "",
  oauthTokenExpirySeconds: parseInt(process.env.OAUTH_TOKEN_EXPIRY_SECONDS || "3600", 10),
};
