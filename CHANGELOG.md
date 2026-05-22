# Changelog

All notable changes to AgentLens are documented here.

## [0.1.1] — 2026-05-22

### Fixed

- Port conflict detection now distinguishes between another AgentLens VS Code window (silent fallback with cross-window sync), the AgentLens standalone server (error with specific message), and an unrelated process (error with instruction to change `agentLens.otlpPort`)
- Plugin and standalone servers now expose fingerprint endpoints (`/agentlens/plugin` and `/agentlens/standalone`) so each can identify the other

## [0.1.0] — 2026-05-21

### Added

- Built-in OTLP/HTTP collector on `127.0.0.1:4318` — JSON-over-HTTP only (protobuf not required)
- Auto-configuration for GitHub Copilot, Claude Code, and Codex on activation
- 15-tab dashboard: Efficiency, Recommendations, Alerts, Automation, Summaries, Traces, Files, Agents, Tokens, Latency, Flow, Tools, Timeline, Errors, Help
- Loop and malfunction detection — Tool Call Deadlock, State Corruption Spiral, Hallucination Amplification Loop, Escalating Scope, Context Accumulation
- Conversation grouping — Copilot and Codex sessions linked by their conversation thread ID
- Per-session Conversation column in Efficiency tab
- Standalone web server mode (`pnpm run standalone`) and Docker image (`agentlens/agentlens`)
- Write Prompts File automation — writes triggered prompts to `agentlens-prompts-{agent}.md` in workspace or server directory
- Automation recency guard — only sessions active within the last 2 minutes trigger automations
- Per-agent threshold profiles for Alerts and Automation tabs
- Export OTEL Data — exports raw span data as JSON (single-agent) or ZIP (multi-agent)
- Collector error banner in sidebar when OTLP port is already in use
