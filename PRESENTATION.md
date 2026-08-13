# AgentLens

### Local observability for AI coding agents

Internal eng talk — why I built it, what it does, how to use it, what you actually get out of it.

---

## The problem

- We all use Copilot / Claude Code / Codex daily — but once a session starts, it's a black box
- No visibility into: what it's actually costing, whether the agent is stuck in a loop, whether its changes even survived
- Cost accumulates silently across a team — nobody notices until the bill shows up
- "Did that 45-minute session produce anything, or did I revert it an hour later and forget?"

---

## Why I built it

- Wanted answers to those questions **without sending any data anywhere** — everything local
- Started narrow: *why did my Claude Code session just burn 200K tokens re-reading the same file?*
- Grew into a full dashboard once the same blind spots kept showing up — cost, loops, whether output actually sticks

---

## What it is

- A local dashboard for Copilot, Claude Code, Codex, and OpenCode sessions — VS Code extension, `npx`, or Docker
- Two data sources, one unified view:
  - **OpenTelemetry** — real-time traces, span timing, time-to-first-token
  - **Local log files** — zero-config fallback, backfills history automatically, no setup required
- Everything lands in a local SQLite database. Nothing leaves the machine.

---

## Core capabilities

- **Sessions** — full waterfall trace, turn-to-tool flow graph, tool distribution, file diffs, all per session
- **Analytics** — cost, tokens, cache hit rate, per-agent comparison over time
- **Advisor** — mines patterns across sessions into concrete CLAUDE.md / AGENTS.md suggestions
- **Alerts & Automation** — threshold-based notifications, plus auto-generated correction prompts
- **Export / Import** — JSON, CSV, Markdown; an MCP server so agents can query their *own* session history

---

## The feature I actually use most: loop detection

- Five named failure patterns, detected automatically per session:
  - Tool Call Deadlock, State Corruption Spiral, Hallucination Amplification, Escalating Scope, Context Accumulation
- Each one ships a ready-to-paste correction prompt — one click to copy, paste into the agent
- This is the "catch it in minute 3, not minute 30" feature

---

## Did the work actually survive?

- **Git outcome correlation** — diffs each file a session changed against git history: committed, reverted, or still sitting uncommitted
- **One-shot / retry rate** — what fraction of edited files were right on the first pass vs. needed retries
- Neither question is "was the session efficient" — both ask "did anything come of it"

---

## How to actually use it

```bash
npx agentlens-dashboard       # zero install, opens on localhost:3000
```

- Or install the [VS Code extension](https://marketplace.visualstudio.com/items?itemName=agentlens.agentlens-dashboard) — auto-configures OTEL for Copilot, Claude Code, and Codex on first activation
- Or Docker, for CI or a shared machine
- The log-file fallback means history shows up even before anything is configured

---

## What you realistically get out of it

- **Cost you can actually see** — per session, per day, per model, with alerting before it surprises anyone
- **Faster recovery from stuck agents** — minutes lost instead of a wasted session
- **Better instruction files** — Advisor points at *which* file the agent keeps rediscovering, not just "add more context"
- **A record of what actually happened** — useful for retros, onboarding, or just trusting the tool more

---

## Try it

- `npx agentlens-dashboard` — 30 seconds, no config
- [github.com/RogerReed/agentlens](https://github.com/RogerReed/agentlens)
- Everything in this talk is real, current behavior — happy to demo live
