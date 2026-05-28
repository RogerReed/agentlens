<h1><img src="media/mascot.png" alt="" width="48" align="center" /> AgentLens</h1>

[![CI](https://github.com/RogerReed/agentlens/actions/workflows/ci.yml/badge.svg)](https://github.com/RogerReed/agentlens/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/RogerReed/agentlens)](LICENSE)

![AgentLens demo](media/demo.gif)

**Local** observability that makes AI agent sessions more transparent — see what's happening inside each run. Available as a VS Code extension or standalone Docker image, with no data leaving your machine. AgentLens captures OpenTelemetry traces from your agents and surfaces context growth, tool usage, token consumption, latency, errors, and file changes in real time — then helps you prompt your agents on inefficiencies to improve interactions.

**[Install from VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=agentlens.agentlens-dashboard)**

## Features

- **Telemetry Collection** — Built-in OpenTelemetry receiver captures traces and logs from Copilot, Claude Code, and Codex — no external infrastructure needed
- **Session Dashboard** — See inside every agent run: context growth, tool calls, token usage, latency, errors, and file changes across interactive real-time panels
- **Recommendations & Inefficiency Detection** — Surfaces context bloat, redundant tool calls, cache misses, and five loop/malfunction patterns — with suggested prompts to correct course
- **Cost Estimation** — Estimates session cost for Copilot and Codex sessions. Copilot supports three billing models (token-based AI Credits, request-based, and annual-plan request-based). Codex uses token-based pricing. Shown as a per-session bar chart and cross-session cost table. Claude cost estimation coming soon.
- **Files Changed** — Track which files each session created or modified, with before/after diffs
- **Configurable Alerts** — Threshold-based notifications for turns, errors, active time, and repeat loops — per-agent or shared
- **Multi-session Support** — Compare sessions side-by-side to spot patterns across runs

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
| **Tool Call Deadlock** | Same tool + arguments called 3+ times (critical at 5+) | Agent not retaining tool results |
| **State Corruption Spiral** | A file edited then reverted to a prior state | Agent oscillating between conflicting constraints |
| **Hallucination Amplification Loop** | Same error recurring 3+ times | Fix attempts not resolving the root cause |
| **Ambiguous Success / Escalating Scope** | Too many steps for the task complexity | No clear completion condition |
| **Infinite Loop — Context Accumulation** | Input tokens growing while output ratio collapses 70%+ | Agent stuck, accumulating context without progress |

Each signal includes a specific recommended action and a **Copy for {Agent}** button that copies the recommendation prompt to your clipboard so you can paste it into your AI session. Use the **Ignore** button to dismiss signals that represent intentional behavior.

## Cost Estimation

The **Cost** tab estimates the dollar cost of Copilot and Codex sessions using localized pricing data.

### Copilot

Three billing models are supported via a toggle:

| Mode | Who it applies to |
| ---- | ----------------- |
| **Token-based AI Credits** (default) | All Copilot plans from Jun 1, 2026 — charges per input/output/cache token at per-model rates |
| **Request-based** | All plans before Jun 1, 2026 — multiplier × $0.04 per user-initiated prompt |
| **Annual plan request-based** | Annual-plan holders staying on request billing after Jun 1, 2026 — same formula, significantly higher multipliers |

Included models (GPT-4.1, GPT-5 mini) show $0 under token-based billing, consistent with Copilot's pricing docs.

### Codex

Codex uses token-based pricing only (input, cached input, output). The billing model toggle does not apply to Codex sessions. Rates are sourced from OpenAI's API pricing page and the Codex CLI pricing page.

### General

The tab shows a per-session bar chart (colored by agent) and a cross-session cost table with per-source subtotals and a grand total when both agent types are present.

All figures are estimates — not your actual bill. See [PRICING_SOURCES.md](PRICING_SOURCES.md) for the authoritative source URLs and maintainer notes on keeping rates current.

Known gaps for each agent are listed at the bottom of the Cost tab.

## Getting Started

### VS Code Extension

1. Install the extension from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=agentlens.agentlens-dashboard)
2. Open the **AgentLens** view from the Activity Bar
3. AgentLens automatically configures supported agents on activation — see [Auto-configuration](#auto-configuration)
4. Start an agent session and watch the dashboard populate in real time

### Standalone (Docker)

```bash
# Ephemeral — data cleared on container stop
docker run -p 127.0.0.1:3000:3000 -p 127.0.0.1:4318:4318 agentlens/agentlens

# Persistent — spans survive restarts (macOS/Linux)
docker run -p 127.0.0.1:3000:3000 -p 127.0.0.1:4318:4318 \
  -v ~/.agentlens:/data \
  agentlens/agentlens

# Persistent — spans survive restarts (Windows)
docker run -p 127.0.0.1:3000:3000 -p 127.0.0.1:4318:4318 `
  -v "$env:USERPROFILE\.agentlens:/data" `
  agentlens/agentlens
```

Open <http://localhost:3000> after the container starts. Configure your agents to send telemetry to `http://localhost:4318` — see [Manual Configuration](#manual-configuration) below.

## Configuration

### Manual Configuration

#### Claude Code Configuration

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

#### Copilot Configuration

Add the following to VS Code **User Settings** (`Cmd+Shift+P` / `Ctrl+Shift+P` → *Preferences: Open User Settings (JSON)*). These settings work the same on macOS, Linux, and Windows.

```json
{
  "github.copilot.chat.otel.enabled": true,
  "github.copilot.chat.otel.exporterType": "otlp-http",
  "github.copilot.chat.otel.otlpEndpoint": "http://localhost:4318"
}
```

---

#### Codex Configuration

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

#### VS Code Integrated Terminal

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

#### Quick Verification

- **Claude (macOS/Linux):** `echo $OTEL_EXPORTER_OTLP_ENDPOINT` — should print `http://localhost:4318`
- **Claude (Windows cmd):** `echo %OTEL_EXPORTER_OTLP_ENDPOINT%` · PowerShell: `$env:OTEL_EXPORTER_OTLP_ENDPOINT`
- **Copilot:** confirm `github.copilot.chat.otel.enabled` is `true` in VS Code User Settings
- **Codex (macOS/Linux):** `cat ~/.codex/config.toml` and confirm the `[otel]` section
- **Codex (Windows):** `type %USERPROFILE%\.codex\config.toml`

### Auto-configuration

When the VS Code extension activates, AgentLens automatically writes the required telemetry config for each detected agent — no manual steps needed. After first install, **restart any running agent sessions** to pick up the new config.

| Agent | Config file written |
| --- | --- |
| Claude Code (CLI + VS Code extension) | `~/.claude/settings.json` (macOS/Linux) · `%USERPROFILE%\.claude\settings.json` (Windows) |
| GitHub Copilot (VS Code extension) | VS Code User Settings via VS Code API — same on all platforms |
| OpenAI Codex CLI | `~/.codex/config.toml` (macOS/Linux) · `%USERPROFILE%\.codex\config.toml` (Windows) |

If auto-configuration fails or you need to verify what was written, use the [Manual Configuration](#manual-configuration) instructions above.

## Replaying Exported Spans

The **Export** tab writes span files to your workspace root — `export_*.json` for full data or `export_redacted_*.json` with prompt text, tool inputs, and tool results replaced with `[redacted]`. Replay either to re-examine a past session without the original agent running:

```bash
pnpm run demo -- --file ./export_redacted_claude_main_20260522_152343.json
```

Spans are sent to port `4318` — the VS Code extension or standalone server must be running. Pass `--speed N` to pace the replay proportionally to the original session timing.

## Standalone Mode Options

AgentLens runs as a standalone web server outside VS Code — useful for CI, remote machines, or when you prefer a browser tab.

### Docker

Quick-start commands are in [Getting Started](#standalone-docker). Additional options:

**LAN-accessible** — exposes the dashboard to other devices on your network:

```bash
docker run -p 3000:3000 -p 4318:4318 -v ~/.agentlens:/data agentlens/agentlens
```

**Custom ports** — if `4318` is already in use by the VS Code extension:

```bash
docker run -p 127.0.0.1:3001:3000 -p 127.0.0.1:4319:4318 \
  -v ~/.agentlens:/data \
  agentlens/agentlens
```

Then point your agents at `http://localhost:4319` and open <http://localhost:3001>.

### Node.js (from source)

Requires Node.js 18+ and this repository cloned.

```bash
pnpm install
pnpm run standalone
```

Starts the OTLP receiver on port `4318` and the dashboard at <http://localhost:3000>. The standalone server uses the same port as the VS Code extension — only one can run at a time. To run both simultaneously:

```bash
OTLP_PORT=4319 UI_PORT=3001 pnpm run standalone
```

Spans are saved to `~/.agentlens/spans.json` and reloaded on restart. Set `DATA_DIR` to override the location.

## Automation Prompts File

When an automation threshold is crossed, AgentLens can write the generated prompt to a markdown file. To act on it automatically, configure your agent to watch or include that file as an input — for example, by pointing Claude Code at it via a hook or referencing it in a system prompt. Without that wiring, the file serves as a persistent, reviewable log you can paste from manually. For simpler workflows, leave **Write prompts file** off and use the **Copy Prompt** notification button instead.

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
| `AgentLens: Open Dashboard` | Open the full 16-tab dashboard in an editor panel |
| `AgentLens: Clear Session Data` | Wipe all collected spans from memory |
| `AgentLens: Export OTEL Data` | Write raw OTEL spans to JSON files in your workspace root (also available in the **Export** dashboard tab) |
| `AgentLens: Export OTEL Data (Redacted)` | Same, with prompt text, tool inputs, tool results, and PII replaced with `[redacted]` (also available in the **Export** tab) |

## Extension Settings

This extension contributes the following settings:

- `agentLens.otlpPort`: Local port for the OTLP trace receiver (default: `4318`)

## Agent Telemetry Formats

Each AI coding agent emits a different OTEL shape. AgentLens normalizes all three into a shared session model for the dashboard, while keeping raw telemetry available in the Traces tab.

### Copilot OTEL Format

**Format:** OpenTelemetry trace spans with a clean single-trace hierarchy. Each conversation is one trace; LLM calls and tool calls are child spans nested under a session root. No extra configuration needed.

**What's included:** Prompt text, token counts (input, output, cache read), model name, time-to-first-token, tool names, tool arguments, tool results, and file paths are all present natively without any extra configuration.

**Gaps:** Cache write token counts are not exposed — Copilot manages cache creation server-side and does not include it in telemetry. Cache read tokens (`gen_ai.usage.cache_read.input_tokens`) are available. No additional configuration unlocks further data — what Copilot exposes is already fully available.

---

### Claude Code OTEL Format

**Format:** OpenTelemetry trace spans. The session root span closes when the interaction ends, with LLM calls and tool calls as children. Optional supplemental log records are emitted when enhanced telemetry env vars are set.

**What's included:** With the recommended configuration (all three `OTEL_LOG_*` vars set): prompt text, token counts, model, tool names, tool arguments, file paths, and full file diff content are all available.

**Gaps:** The three `OTEL_LOG_*` env vars are not enabled by default — without them, tool arguments are absent, prompt text is omitted, and file diff content is unavailable. Cache token data is only present when using a model that supports prompt caching.

---

### Codex OTEL Format

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
