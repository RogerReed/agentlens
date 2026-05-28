#!/usr/bin/env bash
# Configure AI agents to send OTLP telemetry to AgentLens.
# GitHub Copilot is configured automatically by the VS Code extension; no script needed.
#
# Usage:
#   ./scripts/configure-agents.sh                      # configure all (Claude + Codex)
#   ./scripts/configure-agents.sh --agent claude       # Claude Code only
#   ./scripts/configure-agents.sh --agent codex        # OpenAI Codex only
#   ./scripts/configure-agents.sh --port 4319          # custom port
#   ./scripts/configure-agents.sh --agent claude --port 4319

set -euo pipefail

PORT=${AGENTLENS_PORT:-4318}
AGENT="all"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --port|-p)    PORT="$2"; shift 2 ;;
    --port=*)     PORT="${1#*=}"; shift ;;
    --agent|-a)   AGENT="$2"; shift 2 ;;
    --agent=*)    AGENT="${1#*=}"; shift ;;
    -h|--help)
      echo "Usage: $0 [--agent claude|codex|all] [--port PORT]"
      exit 0 ;;
    *)
      echo "Unknown argument: $1  (try --help)"
      exit 1 ;;
  esac
done

ENDPOINT="http://localhost:${PORT}"

echo "AgentLens Agent Configuration"
echo "Endpoint: ${ENDPOINT}  |  Agent: ${AGENT}"
echo ""

# ── Claude Code ────────────────────────────────────────────────────────────────

configure_claude() {
  echo "Configuring Claude Code..."

  if ! command -v python3 &>/dev/null; then
    echo "  python3 not found — configure manually (see Help tab in AgentLens)"
    echo "  Add the following env block to ~/.claude/settings.json:"
    cat <<JSON
  {
    "env": {
      "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
      "CLAUDE_CODE_ENHANCED_TELEMETRY_BETA": "1",
      "OTEL_TRACES_EXPORTER": "otlp",
      "OTEL_EXPORTER_OTLP_PROTOCOL": "http/json",
      "OTEL_EXPORTER_OTLP_ENDPOINT": "${ENDPOINT}",
      "OTEL_LOG_TOOL_DETAILS": "1",
      "OTEL_LOG_TOOL_CONTENT": "1",
      "OTEL_LOG_USER_PROMPTS": "1"
    }
  }
JSON
    return
  fi

  python3 - "$ENDPOINT" <<'PYEOF'
import json, os, sys

endpoint = sys.argv[1]
path = os.path.expanduser("~/.claude/settings.json")

settings = {}
if os.path.exists(path):
    raw = open(path).read().strip()
    if raw:
        try:
            settings = json.loads(raw)
        except json.JSONDecodeError as e:
            print(f"  Error: {path} is not valid JSON ({e}) — fix it and re-run")
            sys.exit(1)

env = settings.setdefault("env", {})
env.update({
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "CLAUDE_CODE_ENHANCED_TELEMETRY_BETA": "1",
    "OTEL_TRACES_EXPORTER": "otlp",
    "OTEL_EXPORTER_OTLP_PROTOCOL": "http/json",
    "OTEL_EXPORTER_OTLP_ENDPOINT": endpoint,
    "OTEL_LOG_TOOL_DETAILS": "1",
    "OTEL_LOG_TOOL_CONTENT": "1",
    "OTEL_LOG_USER_PROMPTS": "1",
})

os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
with open(path, "w") as f:
    json.dump(settings, f, indent=2)
    f.write("\n")

print(f"  Updated {path}")
PYEOF

  echo "  Restart: CLI — exit session and reopen | VS Code — Reload Window"
}

# ── OpenAI Codex ───────────────────────────────────────────────────────────────

configure_codex() {
  echo "Configuring OpenAI Codex..."
  local config="$HOME/.codex/config.toml"

  if [ -f "$config" ] && grep -q '^\[otel\]' "$config" 2>/dev/null; then
    echo "  [otel] section already present — no changes made."
    echo "  Verify endpoint in ${config}: endpoint = \"${ENDPOINT}\""
    return
  fi

  mkdir -p "$(dirname "$config")"
  [ -s "$config" ] && printf "\n" >> "$config"

  cat >> "$config" <<TOML
[otel]
log_user_prompt = true
exporter = { otlp-http = { endpoint = "${ENDPOINT}", protocol = "json" } }
trace_exporter = { otlp-http = { endpoint = "${ENDPOINT}", protocol = "json" } }
TOML

  echo "  Updated ${config}"
  echo "  Restart: CLI — exit session and reopen | VS Code — Reload Window"
}

# ── Dispatch ───────────────────────────────────────────────────────────────────

case "$AGENT" in
  claude)
    configure_claude ;;
  codex)
    configure_codex ;;
  all)
    configure_claude
    echo ""
    configure_codex ;;
  copilot)
    echo "GitHub Copilot is configured automatically by the AgentLens VS Code extension."
    echo "No standalone script is needed or possible — Copilot configuration requires the VS Code API." ;;
  *)
    echo "Unknown agent: ${AGENT}. Choose from: claude, codex, all"
    exit 1 ;;
esac

echo ""
echo "Done. Start a short agent session and check the AgentLens dashboard to confirm data is arriving."
