Past sessions are already loaded from local log files. For live data, start a new agent session:

**Claude Code** — open a terminal and run:

```bash
claude
```

**GitHub Copilot** — ask a question in the Copilot Chat panel.

**Codex CLI** — open a terminal and run:

```bash
codex
```

The sidebar updates as sessions complete. Each session is one prompt-to-response cycle: a user prompt plus every LLM call and tool invocation the agent made.

## Understanding the badges

Every session row shows a source badge:

- **OTEL** — full telemetry data: timing, TTFT, loop detection, file diffs
- **Log** — local log file data: token counts, tool calls, prompts (where available); no timing

If OTEL data arrives for a session already shown as **Log**, the badge upgrades automatically and the richer data replaces it.
