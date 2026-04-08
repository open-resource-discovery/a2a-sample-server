# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) rules.

## [unreleased]

### Added

- 12 ready-to-use agents covering different use cases, auth schemes, and protocol versions
- A2A protocol v0.3.0 and v1.0.0 support with automatic version-aware formatting
- JSON-RPC 2.0 transport with SSE streaming support
- Authentication schemes: API Key (header/query), HTTP Basic, HTTP Bearer, OAuth 2.0 (client credentials, authorization code + PKCE, device code)
- Mock LLM provider with deterministic canned responses — no external API keys needed
- Built-in mock OAuth 2.0 server with JWT token issuance
- Agent discovery endpoint (`GET /agents`) and per-agent card endpoint (`GET /agents/:agentId/agent.json`)
- Backward-compatible root endpoints for the Solar agent (`/.well-known/agent.json`, `POST /`)
- CI workflow with linting, unit tests, and build jobs
- Renovate configuration for automated dependency updates
- ESLint and Prettier configuration
- Jest test suite with 247 tests
