<h1><img src="media/mascot.png" alt="" width="48" align="center" /> AgentLens</h1>

[![CI](https://github.com/RogerReed/agentlens/actions/workflows/ci.yml/badge.svg)](https://github.com/RogerReed/agentlens/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/RogerReed/agentlens)](LICENSE)

![AgentLens demo](media/demo.gif)

Observability for AI agent sessions in VS Code. AgentLens collects OpenTelemetry (OTEL) traces and logs from AI coding agents via the OTLP (OpenTelemetry Protocol) HTTP endpoint, normalizes them into prompt-to-response sessions, and presents real-time dashboards covering token usage, latency, errors, file changes, and more.

**[Install from VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=agentlens.agentlens-dashboard)**

## Features

- **OTLP Collection** — Built-in HTTP collector receives traces, logs, and metrics-compatible payloads on `127.0.0.1:4318`
- **Session Dashboard** — Interactive panels for tokens, latency, efficiency, errors, flow, and timeline
- **Recommendations & Malfunction Detection** — Surfaces efficiency issues and detects five agent failure patterns (see below)
- **Files Changed** — Track which files each agent session modified
- **Configurable Alerts** — Threshold-based notifications with shared context/cache rules and per-agent thresholds for turns, errors, active time, and repeat loops
- **Multi-session Support** — Compare sessions side-by-side

## Session Model

AgentLens treats a session as one prompt-to-response cycle. A single user prompt may contain multiple LLM calls, tool calls, trace spans, and log-derived events, but those steps stay grouped under one session until the agent delivers its final response. For Codex, startup and background telemetry is reported as background overhead instead of separate prompt sessions.

## Recommendations & Malfunction Detection

The **Recommendations** tab analyzes session data and surfaces two categories of signal:

**Efficiency insights** — problems you can fix by adjusting your prompts:

- Context bloat (input tokens growing rapidly across turns)
- Files read multiple times, duplicate searches, large tool results
- Tool failures, high turn count, oversized starting context
- Low cache hit rate, tool definition overhead

**Loop & malfunction signals** — patterns indicating the agent is stuck or spiraling. These appear first in the list with a ↺ icon:

| Signal | Description | Trigger |
| ------ | ----------- | ------- |
| **Tool Call Deadlock** | Same tool + arguments called 5+ times | Agent not retaining tool results |
| **State Corruption Spiral** | A file edited then reverted to a prior state | Agent oscillating between conflicting constraints |
| **Hallucination Amplification Loop** | Same error recurring 3+ times | Fix attempts not resolving the root cause |
| **Ambiguous Success / Escalating Scope** | Too many steps for the task complexity | No clear completion condition |
| **Infinite Loop — Context Accumulation** | Input tokens growing while output ratio collapses 70%+ | Agent stuck, accumulating context without progress |

Each signal includes a specific recommended action and a **Copy for {Agent}** button that copies the recommendation prompt to your clipboard so you can paste it into your AI session. Use the **Ignore** button to dismiss signals that represent intentional behavior.

## Getting Started

1. Install the extension from the VS Code Marketplace
2. Open the **AgentLens** view from the Activity Bar
3. AgentLens automatically configures **GitHub Copilot**, **Claude Code**, and **Codex** to send OTLP telemetry to the built-in collector
4. Start an agent session and watch the dashboard populate in real-time

## Setup

AgentLens auto-configures all supported agents on activation. If auto-config fails, or you need to verify or configure manually, use the instructions below.

### Auto-configuration

On activation, AgentLens automatically writes the required telemetry config for each detected agent. This runs both when the VS Code extension activates and when the standalone server starts.

| Agent | Config file written |
| --- | --- |
| Claude Code (CLI + VS Code extension) | `~/.claude/settings.json` (macOS/Linux) · `%USERPROFILE%\.claude\settings.json` (Windows) |
| GitHub Copilot (VS Code extension) | VS Code User Settings via VS Code API — same on all platforms |
| OpenAI Codex CLI | `~/.codex/config.toml` (macOS/Linux) · `%USERPROFILE%\.codex\config.toml` (Windows) |

After first install, **restart any running agent sessions** to pick up the new config.

---

### Claude Code — CLI and VS Code Extension

The `claude` CLI and the Claude Code VS Code extension both read from the same settings file. Add the following to the `"env"` block:

- **macOS/Linux:** `~/.claude/settings.json`
- **Windows:** `%USERPROFILE%\.claude\settings.json`

```json
{
  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "CLAUDE_CODE_ENHANCED_TELEMETRY_BETA": "1",
    "OTEL_TRACES_EXPORTER": "otlp",
    "OTEL_EXPORTER_OTLP_PROTOCOL": "http/json",
    "OTEL_EXPORTER_OTLP_ENDPOINT": "http://localhost:4318",
    "OTEL_LOG_TOOL_DETAILS": "1",
    "OTEL_LOG_TOOL_CONTENT": "1",
    "OTEL_LOG_USER_PROMPTS": "1"
  }
}
```

| Key | Purpose |
| --- | ------- |
| `CLAUDE_CODE_ENABLE_TELEMETRY` | Turns on OTLP export |
| `CLAUDE_CODE_ENHANCED_TELEMETRY_BETA` | Adds token counts, model name, and tool inputs to LLM spans |
| `OTEL_TRACES_EXPORTER` | Selects the OTLP exporter |
| `OTEL_EXPORTER_OTLP_PROTOCOL` | Uses JSON-over-HTTP (required — protobuf is not supported) |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Points at the AgentLens collector (base URL, no `/v1/traces` suffix) |
| `OTEL_LOG_TOOL_DETAILS` | Logs tool call events (tool name, file path) |
| `OTEL_LOG_TOOL_CONTENT` | Includes full file contents and terminal output in tool result logs — needed for the **Summaries** tab to show tool outputs and for **Files** tab diff content |
| `OTEL_LOG_USER_PROMPTS` | Includes the actual prompt text in session records — without this, sessions show `[N chars — prompt redacted]` |

If `settings.json` already exists, merge the `env` block — do not replace the whole file. After saving, **restart Claude Code** for the env vars to take effect.

---

### GitHub Copilot — VS Code Extension

Add the following to VS Code **User Settings** (`Cmd+Shift+P` / `Ctrl+Shift+P` → *Preferences: Open User Settings (JSON)*). These settings work the same on macOS, Linux, and Windows.

```json
{
  "github.copilot.chat.otel.enabled": true,
  "github.copilot.chat.otel.exporterType": "otlp-http",
  "github.copilot.chat.otel.otlpEndpoint": "http://localhost:4318"
}
```

---

### OpenAI Codex CLI

Add an `[otel]` section to the Codex config file. Restart any running Codex sessions after saving.

- **macOS/Linux:** `~/.codex/config.toml`
- **Windows:** `%USERPROFILE%\.codex\config.toml`

```toml
[otel]
log_user_prompt = true
exporter = { otlp-http = { endpoint = "http://localhost:4318", protocol = "json" } }
trace_exporter = { otlp-http = { endpoint = "http://localhost:4318", protocol = "json" } }
```

| Key | Purpose |
| --- | ------- |
| `log_user_prompt` | Includes the actual prompt text — without this, sessions show `[session in progress]` |
| `exporter` | Sends log events (tool calls, token usage, SSE events) to `/v1/logs` |
| `trace_exporter` | Sends trace spans (timing, parent-child hierarchy) to `/v1/traces` |

If `config.toml` already has an `[otel]` section, add only the missing keys. After saving, **restart Codex**.

---

### VS Code Integrated Terminal

If the Claude Code CLI runs inside VS Code's integrated terminal and traces are not appearing, add the env vars directly to VS Code's terminal environment. Use the key matching your OS in VS Code User Settings:

```jsonc
// macOS:
"terminal.integrated.env.osx": {
  "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
  "CLAUDE_CODE_ENHANCED_TELEMETRY_BETA": "1",
  "OTEL_TRACES_EXPORTER": "otlp",
  "OTEL_EXPORTER_OTLP_PROTOCOL": "http/json",
  "OTEL_EXPORTER_OTLP_ENDPOINT": "http://localhost:4318",
  "OTEL_LOG_TOOL_DETAILS": "1",
  "OTEL_LOG_TOOL_CONTENT": "1",
  "OTEL_LOG_USER_PROMPTS": "1"
}
// Linux: use "terminal.integrated.env.linux": { ... }
// Windows: use "terminal.integrated.env.windows": { ... }
```

Troubleshooting: open the **AgentLens** output channel (*View → Output → AgentLens*) to confirm spans are arriving. Check that your shell profile does not override `OTEL_EXPORTER_OTLP_ENDPOINT`.

### Quick Verification

- **Claude (macOS/Linux):** `echo $OTEL_EXPORTER_OTLP_ENDPOINT` — should print `http://localhost:4318`
- **Claude (Windows cmd):** `echo %OTEL_EXPORTER_OTLP_ENDPOINT%` · PowerShell: `$env:OTEL_EXPORTER_OTLP_ENDPOINT`
- **Copilot:** confirm `github.copilot.chat.otel.enabled` is `true` in VS Code User Settings
- **Codex (macOS/Linux):** `cat ~/.codex/config.toml` and confirm the `[otel]` section
- **Codex (Windows):** `type %USERPROFILE%\.codex\config.toml`

## Standalone Mode (no VS Code required)

AgentLens can run as a standalone web server outside of VS Code — useful for CI, remote machines, or when you prefer a browser tab over the editor panel.

### Option 1 — Docker (recommended)

No Node.js or clone required. The image exposes port `4318` for OTLP traces and port `3000` for the dashboard UI.

> **Network exposure:** `-p 3000:3000` binds to all host interfaces by default, making both ports reachable from your local network. Use `127.0.0.1:3000:3000` to restrict to localhost only (recommended for personal use).

#### macOS / Linux

```bash
# Ephemeral — data is lost when the container stops (localhost only)
docker run -p 127.0.0.1:3000:3000 -p 127.0.0.1:4318:4318 agentlens/agentlens

# Persistent — spans survive restarts (localhost only)
docker run -p 127.0.0.1:3000:3000 -p 127.0.0.1:4318:4318 \
  -v ~/.agentlens:/data \
  agentlens/agentlens

# LAN-accessible — exposes to other devices on your network
docker run -p 3000:3000 -p 4318:4318 \
  -v ~/.agentlens:/data \
  agentlens/agentlens
```

#### Windows (PowerShell)

```powershell
# Ephemeral (localhost only)
docker run -p 127.0.0.1:3000:3000 -p 127.0.0.1:4318:4318 agentlens/agentlens

# Persistent (localhost only)
docker run -p 127.0.0.1:3000:3000 -p 127.0.0.1:4318:4318 `
  -v "$env:USERPROFILE\.agentlens:/data" `
  agentlens/agentlens
```

#### Windows (Command Prompt)

```cmd
rem Ephemeral (localhost only)
docker run -p 127.0.0.1:3000:3000 -p 127.0.0.1:4318:4318 agentlens/agentlens

rem Persistent (localhost only)
docker run -p 127.0.0.1:3000:3000 -p 127.0.0.1:4318:4318 ^
  -v "%USERPROFILE%\.agentlens:/data" ^
  agentlens/agentlens
```

Open **<http://localhost:3000>** after the container starts. Span data is stored in `~/.agentlens` on the host when using the persistent mount.

To use a different port pair (e.g. if `4318` is already in use by the VS Code extension):

```bash
docker run -p 127.0.0.1:3001:3000 -p 127.0.0.1:4319:4318 \
  -v ~/.agentlens:/data \
  agentlens/agentlens
```

Then point your agents at `http://localhost:4319` and open **<http://localhost:3001>**.

---

### Option 2 — Node.js (from source)

### Prerequisites

- Node.js 18+
- Clone or download this repository

### Quick start

```bash
# 1. Install dependencies
pnpm install   # or: npm install

# 2. Build and start the standalone server
pnpm run standalone
```

This builds all assets and starts two servers:

| Server | Default port | Purpose |
| ------ | ------------ | ------- |
| OTLP receiver | `4318` | Accepts traces/logs from Copilot, Claude Code, Codex |
| Dashboard UI | `3000` | Serves the dashboard at `http://localhost:3000` |

Open **<http://localhost:3000>** in your browser. The dashboard updates live as agent sessions send data.

### Agent configuration

The standalone server uses the same OTLP port (`4318`) as the VS Code extension. Your agents do not need reconfiguration if you've already set them up — just make sure the VS Code extension is not running at the same time (both cannot bind port `4318` simultaneously).

If you need both running simultaneously, use a different port for the standalone server:

```bash
OTLP_PORT=4319 UI_PORT=3001 pnpm run standalone
```

Then point your agents at `http://localhost:4319` instead.

### Stopping

Press `Ctrl+C` in the terminal where the server is running.

### Data persistence

Spans are saved to `~/.agentlens/spans.json` (configurable via `DATA_DIR` env var) and reloaded automatically on the next start. The "Clear All Data" button in the dashboard also clears this file. The VS Code extension persists spans separately via its own storage.

### Capturing demo fixtures

The standalone server can record real Claude Code and Codex sessions as replayable fixtures:

```bash
pnpm run standalone
pnpm run capture -- my-session --duration 180 --clear
```

Start capture before sending the agent prompt. The capture script ignores spans that already existed when it connected, so a file is only written when new spans arrive after the `Recording started` message. Press `s` in the **capture** terminal to save and exit early. Saved fixtures appear under `demo/fixtures/<name>.json`.

Use `pnpm run capture:list` to see saved fixtures, and check the standalone terminal for `[OTLP] ... ingested` lines if no file is written.

### Replaying exported span files

The **Export** dashboard tab (and the corresponding Command Palette commands) write `export_*.json` files to your workspace root. You can replay these files to re-examine a past session in the dashboard without the original agent running.

Replay sends OTLP spans to port `4318` — the same port used by both the VS Code extension and the standalone server. You only need one running.

**Replay into the VS Code extension** (no extra server needed — the extension is already listening on port 4318):

```bash
pnpm run demo -- --file ./export_redacted_claude_main_20260522_152343.json
```

The spans are sent instantly in one batch. Open (or re-open) the AgentLens dashboard to see the session appear.

**Replay into the standalone server**:

```bash
# Terminal 1
pnpm run standalone

# Terminal 2
pnpm run demo -- --file ./export_redacted_claude_main_20260522_152343.json
```

Open **<http://localhost:3000>** to see the replayed session.

**Options**:

```bash
# Simulate real-time pacing (e.g. to watch spans arrive live)
pnpm run demo -- --file ./export_redacted_claude_main_20260522_152343.json --speed 4

# Use a raw (non-redacted) export
pnpm run demo -- --file ./export_claude_main_20260522_152343.json
```

By default `--file` sends all spans in one shot (no delay). Pass `--speed N` to pace the replay proportionally to the original session timing. Each replay assigns fresh trace and span IDs so the session appears as a new entry rather than merging with any previous run.

## Automation — Write Prompts File

When an automation threshold is crossed, AgentLens can write the generated prompt to a markdown file so you have a persistent, reviewable record of every suggestion. This works identically in both the VS Code extension and standalone mode.

### How it works

When **Write prompts file** is enabled for an automation rule, each trigger appends a timestamped entry to an agent-specific file:

| Agent | File written |
| --- | --- |
| Claude Code | `agentlens-prompts-claude.md` |
| GitHub Copilot | `agentlens-prompts-copilot.md` |
| Codex | `agentlens-prompts-codex.md` |

In the VS Code extension, files are written to the workspace root. In standalone mode, files are written to the directory where the server is running.

Each entry uses this format:

```markdown
## 2026-05-21 14:30:22 — Loop Breaker

[AgentLens Automation: Loop Breaker]

...generated prompt...

---
```

When **Write prompts file** is off (default), triggering an automation shows a notification with a **Copy Prompt** button instead — click it to copy the prompt to your clipboard, then paste into your agent.

### Enabling Write prompts file

1. Open the **Automation** tab in the dashboard
2. Enable any automation rule (e.g. Loop Breaker, Turn Limit Wrap-up)
3. Toggle **Write prompts file** on
4. When the threshold is crossed during a live session, the prompt is written automatically and a notification confirms the filename

### Automations only fire on real-time sessions

Automations evaluate only sessions with activity in the last 2 minutes. Historical sessions visible in the dashboard do not trigger automations even if they meet a threshold — changing the session filter will not cause old sessions to fire.

## Commands

Open the VS Code Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) and search for **AgentLens**:

| Command | Description |
| ------- | ----------- |
| `AgentLens: Open Dashboard` | Open the full 15-tab dashboard in an editor panel |
| `AgentLens: Clear Session Data` | Wipe all collected spans from memory |
| `AgentLens: Export OTEL Data` | Write raw OTEL spans to JSON files in your workspace root (also available in the **Export** dashboard tab) |
| `AgentLens: Export OTEL Data (Redacted)` | Same, with prompt text, tool inputs, tool results, and PII replaced with `[redacted]` (also available in the **Export** tab) |

## Extension Settings

This extension contributes the following settings:

- `agentLens.otlpPort`: Port for the OTLP HTTP collector (default: `4318`)
- `agentLens.syncToCloud`: Reserved for the AgentLens cloud dashboard (default: `false`)

## Requirements

- VS Code 1.118.0 or later
- At least one supported agent: GitHub Copilot in VS Code, Claude Code, or OpenAI Codex CLI

## Agent Telemetry Formats

Each AI coding agent emits a different OTEL shape. AgentLens normalizes all three into a shared session model for the dashboard, while keeping raw telemetry available in the Traces tab.

### Copilot

**Format:** OpenTelemetry trace spans with a clean single-trace hierarchy. Each conversation is one trace; LLM calls and tool calls are child spans nested under a session root. No extra configuration needed.

**What's included:** Prompt text, token counts (input, output), model name, time-to-first-token, tool names, tool arguments, tool results, and file paths are all present natively without any extra configuration.

**Gaps:** Cache token data (read/create) is not part of Copilot's telemetry. No additional configuration unlocks further data — what Copilot exposes is already fully available.

---

### Claude Code

**Format:** OpenTelemetry trace spans. The session root span closes when the interaction ends, with LLM calls and tool calls as children. Optional supplemental log records are emitted when enhanced telemetry env vars are set.

**What's included:** With the recommended configuration (all three `OTEL_LOG_*` vars set): prompt text, token counts, model, tool names, tool arguments, file paths, and full file diff content are all available.

**Gaps:** The three `OTEL_LOG_*` env vars are not enabled by default — without them, tool arguments are absent, prompt text is omitted, and file diff content is unavailable. Cache token data is only present when using a model that supports prompt caching.

---

### Codex CLI

**Format:** Primarily flat OTLP log records (structured JSON events sent to `/v1/logs`), not trace spans. Each session is a stream of log events grouped by conversation and turn identifiers. Adding `trace_exporter` to config also emits timing spans to `/v1/traces`.

**What's included:** With the recommended configuration (`log_user_prompt = true` and both exporters set): prompt text, token counts, model name, time-to-first-token, tool names, tool arguments, tool results, and span timing are all present.

**Gaps:** The Traces tab has less span granularity than Copilot or Claude Code since Codex is primarily log-based. Without `trace_exporter`, span waterfall data is limited.

---

> **Note:** Agent observability is evolving rapidly. All three platforms are actively expanding what they expose via OpenTelemetry, and the GenAI semantic conventions are still being standardized. AgentLens will be updated as richer telemetry becomes available.

## AI Usage Disclosure

AgentLens was built primarily with [Claude Opus](https://www.anthropic.com/claude). Thank you to Anthropic for building tools that make projects like this possible.

## License

MIT

## Disclaimer

AgentLens is an independent open-source project and is not affiliated with, endorsed by, or associated with GitHub, Inc. or Microsoft Corporation (GitHub Copilot); Anthropic, PBC (Claude / Claude Code); or OpenAI, LLC (Codex / OpenAI Codex CLI). All product names, trademarks, and registered trademarks are the property of their respective owners. AgentLens interacts with these products solely through their publicly documented OpenTelemetry telemetry interfaces.
