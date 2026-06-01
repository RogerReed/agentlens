AgentLens already has your session history. Local log files written by each agent were loaded automatically on activation — no configuration needed.

## Log file sources (always on)

| Agent | What was loaded |
| --- | --- |
| **Claude Code** | `~/.claude/projects/` — full conversation history, token counts, tool calls |
| **Copilot CLI** | `~/.copilot/session-state/` — sessions, token counts, prompts |
| **Codex CLI** | `~/.codex/sessions/` — sessions and token counts |

Sessions from log files show a **Log** badge in the Sessions tab.

## OpenTelemetry (richer real-time data)

AgentLens also runs a built-in OTEL receiver and wrote telemetry config for each agent it detected:

| Agent | Config written |
| --- | --- |
| **Claude Code** | `~/.claude/settings.json` |
| **GitHub Copilot** | VS Code user settings |
| **Codex CLI** | `~/.codex/config.toml` |

OTEL adds timing, loop detection, file diffs, and streaming speed on top of what log files provide. Sessions from OTEL show an **OTEL** badge and automatically replace any Log-sourced entry for the same session.

> **Restart any running agent sessions** to pick up the OTEL config. No external infrastructure is required — everything stays on-device.
