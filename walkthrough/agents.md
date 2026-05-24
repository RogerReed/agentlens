When AgentLens activated, it automatically wrote the telemetry configuration for each agent it detected:

| Agent | Config location |
| --- | --- |
| **Claude Code** | `~/.claude/settings.json` |
| **GitHub Copilot** | VS Code user settings |
| **Codex CLI** | `~/.codex/config.toml` |

All three are pointed at the local OTLP receiver on `http://localhost:4318` (configurable via `agentLens.otlpPort`).

> **Restart any running agent sessions** to pick up the new config. No external infrastructure is required — AgentLens collects traces entirely on-device.
