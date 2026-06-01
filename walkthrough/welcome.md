AgentLens gives you local observability into your AI agent sessions — see what GitHub Copilot, Claude Code, and Codex are doing, how efficiently, and when they get stuck. No data leaves your machine.

## Two data sources, one dashboard

AgentLens collects data two ways:

**Local log files (on by default)** — reads the session files that each agent writes automatically to your home directory. Session history appears immediately after installing, with no setup required. Each session row shows a **Log** badge.

**OpenTelemetry traces (auto-configured)** — the extension also runs a built-in OTEL receiver and configures each agent to stream live telemetry to it. OTEL data is richer: it includes real-time timing, loop detection, and file diffs. Sessions from OTEL show an **OTEL** badge and replace Log-sourced sessions for the same session ID.

## What you can see

- **Token usage** per session, turn, and tool call
- **Latency breakdown** across LLM calls, tool executions, and I/O (OTEL only)
- **Files changed** with before/after diffs (OTEL only)
- **Loop and malfunction detection** — tool deadlocks, error spirals, context accumulation (OTEL only)
- **Efficiency recommendations** with one-click actions
- **Cost estimates** per session and per day

Click **AgentLens** in the Activity Bar (the icon on the left) to open the sidebar panel.
