// OAuth Types

export interface OauthClient {
  clientId: string;
  clientSecret: string;
  name?: string;
}

export interface OauthTokenRequest {
  grant_type: string;
  client_id?: string;
  client_secret?: string;
  scope?: string;
}

export interface OauthTokenResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  scope?: string;
}

export interface OauthErrorResponse {
  error: string;
  error_description?: string;
}

export interface JwtPayload {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  scope?: string;
  client_id: string;
}

export interface AuthorizationCode {
  code: string;
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  scope: string;
  expiresAt: number;
}

export interface DeviceCode {
  deviceCode: string;
  userCode: string;
  clientId: string;
  scope: string;
  expiresAt: number;
  interval: number;
  approved: boolean;
}
