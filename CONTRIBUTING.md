# Contributing to AgentLens

Thank you for your interest in contributing.

## Reporting bugs

Open an issue at <https://github.com/rogerreed/agentlens/issues> and use the bug report template. Include:

- The agent you were using (Copilot, Claude Code, Codex)
- Whether you're using the VS Code extension or standalone mode
- The AgentLens version (visible in the sidebar footer)
- Relevant output from the **AgentLens** output channel (*View → Output → AgentLens*)

## Development setup

```bash
git clone https://github.com/rogerreed/agentlens
cd agentlens
pnpm install
```

**Run in VS Code:** Press `F5` to open a VS Code Extension Development Host with AgentLens loaded.

**Run standalone:** `pnpm run standalone` — starts the OTLP collector on port `4318` and the dashboard UI on port `3000`.

**Build:**

```bash
pnpm run check-types   # TypeScript type check
pnpm run lint          # ESLint
pnpm run test:unit     # Unit tests (Mocha)
node esbuild.js        # Bundle — outputs to dist/ and media/
```

## Project structure

| Path | Purpose |
| --- | --- |
| `src/` | VS Code extension host code (Node.js, no DOM) |
| `media/src/` | Dashboard webview (Preact, browser) |
| `standalone/server.ts` | Standalone HTTP server |
| `src/summarizers/` | Per-agent span → session summarizers |
| `src/otlpCollector.ts` | OTLP/HTTP ingestion for the VS Code extension |

## Submitting a pull request

1. Fork the repo and create a feature branch
2. Make your changes and verify `pnpm run check-types && pnpm run lint` pass
3. Open a PR with a clear description of what changed and why

Please keep PRs focused on a single change. Large refactors should be discussed in an issue first.

## Fixture data

If you need to test against real telemetry, use `pnpm run capture` to record a local session. Run `node scripts/redact-spans.js` before committing any fixture files — fixture JSON files are gitignored by default to prevent accidental PII exposure.
