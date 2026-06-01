# Changelog

All notable changes to AgentLens are documented here.

## [0.2.0] — 2026-06-01

### Added

- **SQLite persistence** — four-phase database layer: schema (phase 1), write path persisting sessions after summarization (phase 2), read path replacing in-memory summarization with DB queries (phase 3), and analytics layer with historical queries, session search, time-range filtering, and storage management (phase 4)
- **Sidebar reworked as real-time live session monitor** — replaces the previous static summary with a live-updating panel: status card (Active/Idle, agent, model, prompt), counters (Turns / Tools / Errors / Cache hit rate), context growth sparkline with play/pause controls, token bars scaling independently against historical average with avg values inline, estimated cost card, and burn rate card; "X sessions stored" footer; Clear All Data fully resets all top-card fields
- **Sessions tab overhaul** — sortable by Cost, Duration, or Tokens via pills in the filter bar; filtered session count shown; Tools and Flow sub-tab labels show counts; expand-in-place row with five sub-tabs: Overview (stat tiles, burn rate, Insights), Trace (LLM and tool call waterfall), Flow (turn-to-tool graph), Tools (donut chart), Files (modified files with diffs)
- **Analytics tab overhaul** — per-agent breakdown cards, Estimated Cost chart with daily total green overlay line and date labels drawn inline at day boundaries, Token Usage Per Session, Context Growth chart with session-cycling animation
- **Standalone server sidebar parity** — token bars, estimated cost, burn rate, counters, sparkline, and all CSS classes now match the VS Code sidebar exactly; fixed crash from undefined `inProgressTraceIds` variables
- **Demo replay: export-format support** — `pnpm run demo -- --file ./export_sessions_<timestamp>.json` now works; converts session summaries into synthetic OTEL spans (root + LLM call + tool call spans per session) with correct attribute keys for the summarizer
- **Estimated cost per LLM span** — shown in Traces and Flow tabs alongside each LLM call
- **Tool call detail in Traces tab** — arguments and results visible in expanded span rows
- **Session ID in clipboard prompts** — Insights copy button includes `Session ID:` so AI can identify the session
- **user_input timeline entry type** — Claude Code permission prompt interactions captured in the session timeline
- **"X sessions stored" footer** — unfiltered session count shown in sidebar footer and Sessions tab footer
- **Date labels inside Estimated Cost chart** — day boundary labels rendered inline matching Token Usage Per Session style

### Fixed

- Standalone sidebar tokens and estimated cost not rendering — `computeSidebarPayload` was missing `inputTokens`, `outputTokens`, `cacheReadTokens`, `cacheCreateTokens`, `costUsd`, `avgInputTokens`, `avgOutputTokens`
- Context Growth animation frozen in play mode — `focusedSessionId` was overriding `activeIdx` unconditionally; animation index was resetting to 0 on every SSE update due to new array reference on each render
- Sidebar Clear All Data not resetting top card — agent name, duration, prompt, and model now clear when `currentSession` is null
- Sidebar active indicator firing on background Copilot calls — whitelisted to real agent span names only (`claude_code.*`, `invoke_agent*`, `codex.turn/session`); 45-second window
- Burn rate tied to `isActive` instead of 2-minute `startTime` cutoff
- Sidebar estimated cost: cache tokens subtracted from `inputTokens` before rate calculation (matches Sessions table)
- Help pill nav clipping on wrap — `flex-wrap:nowrap` + horizontal scroll
- Demo replay crash on export files — `BigInt()` cannot parse ISO timestamp strings
- Status bar item now opens both sidebar and dashboard on click

### Changed

- Daily total line on Estimated Cost chart changed from purple to green, matching cost value color used throughout the UI
- Summaries tab renamed to Traces; old waterfall Traces tab removed
- Tab structure simplified to 6 primary tabs: Sessions, Analytics, Alerts, Automation, Export, Help
- Automation popups labelled "AgentLens Automation: \<label\>"; alert popups labelled "AgentLens Alert"
- "Current session" label removed from sidebar status card
- Insight card text size reduced to 11px to match rest of UI
- Product name removed from all clipboard prompts
- Sessions sort moved into filter bar; Errors sort removed

### Docs

- README: updated tagline, corrected Claude Code config (removed stale `OTEL_SEMCONV_STABILITY_OPT_IN` and `OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT` env vars now cleaned up by auto-configure), dashboard tab names corrected, Copilot billing table updated
- Walkthrough files: dashboard tab table rewritten for current 6-tab structure; loops walkthrough updated to reflect Insights location and clipboard copy button
- Help tab Setup section: stale env vars removed; Copilot OTEL coverage corrected (cache read tokens are available; only cache write is absent)
- ARCHITECTURE.md: fully rewritten covering the 4-phase SQLite persistence architecture with Mermaid diagrams

## [0.1.5] — 2026-05-28

### Added

- **Claude Code cost estimates** — the Cost tab now includes `claude_code` sessions alongside Copilot and Codex; uses Anthropic API token-based pricing (input, cache write, cache read, output) with per-model rates for all current Opus, Sonnet, and Haiku variants; no billing mode toggle needed (Claude has always been token-based)
- **Codex cost estimates** — Cost tab extended to include Codex CLI sessions using OpenAI token-based pricing (input, cached input, output) with rates for all current and deprecated Codex models
- **Primary tab bar + More ▾ overflow dropdown** — replaces the flat wrapping tab row with a fixed-height single row; six primary tabs always visible (Efficiency, Cost, Summaries, Recommendations, Export, Help); ten secondary tabs (Agents, Alerts, Automation, Errors, Files, Flow, Latency, Tokens, Tools, Traces) in an alphabetically-sorted dropdown; active secondary tab name shown in the button label
- **Help tab — mode-aware Setup section** — configuration steps adapt to VS Code extension vs. standalone server context; Copilot CLI configuration added; Manual Configuration section with per-agent headings
- **Help tab — glossary hyperlinks** — first-mention of each glossary term in body text links to its definition; VS Code webview link styling fixed
- `pricing.ts` — Codex model rate table (all current and deprecated models including `codex-mini-latest`); Claude fast-mode rates corrected (`claude-opus-4-6-fast`, `claude-opus-4-7-fast` at $30/$150 per MTok); deprecated Claude models added for historical sessions
- `PRICING_SOURCES.md` — Claude section fully populated: source URL, OTEL fields, formula, rate table with fast-mode and deprecated entries, known gaps (cache TTL ambiguity, fast-mode underestimation, Opus 4.7 tokenizer change)

### Fixed

- Help tab VIEWS array: replaced stale `Timeline` entry (orphaned component, not a real tab) with `Export`; order corrected to match the actual tab bar sequence

### Changed

- Cost tab: Claude and Codex subtotal rows added to the session table footer; grand total row now appears when sessions from any two agent types are present; Known Gaps section restructured per-agent with a new Claude block
- Cost tab empty state updated to mention Copilot, Claude, and Codex
- Renamed "OpenAI Codex" → "Codex" throughout dashboard UI, Help tab, README, and configuration scripts
- README restructured: Getting Started moved before Features; Standalone Docker split into Running and Configuring subheaders; Cost Estimation section expanded to cover all three agents; Manual Configuration section expanded to mirror Help tab content; `chmod +x` and PowerShell execution policy instructions added for configuration scripts; Additional Features section added at the bottom

## [0.1.4] — 2026-05-27

### Added

- **Cost tab** — estimates Copilot session cost with three billing model toggles: token-based AI Credits (Jun 2026+, default), request-based with multipliers (pre-Jun 2026), and annual-plan request-based (post-Jun 2026 for annual plan holders)
- Per-session cost bar chart; zero-cost sessions shown as a colored tick on the x-axis
- Cross-session cost table with token breakdown, cost, and AI Credits columns; respects active session filter
- Estimates-only disclaimer with last-updated date and anchor-linked Known Gaps section
- `media/src/pricing.ts` — rate table for all Copilot models verified against GitHub pricing docs, including footnotes for included models (GPT-4.1, GPT-5 mini → $0 in token mode) and long-context surcharge notes
- `PRICING_SOURCES.md` — authoritative source URLs and maintainer notes for all three Copilot billing models

### Fixed

- README "Agent Telemetry Formats — Copilot" section incorrectly stated cache token data is unavailable; corrected to note cache read tokens are present via `gen_ai.usage.cache_read.input_tokens` and only cache write is absent

### Changed

- README: added Cost Estimation section, updated feature list, corrected dashboard tab count to 16

## [0.1.3] — 2026-05-24

### Changed

- README overhauled — restructured around a local/transparency theme; Getting Started split into VS Code Extension and Standalone (Docker) subsections with ephemeral and persistent Docker commands; Configuration reorganized with Manual Configuration first followed by Auto-configuration; Replaying Exported Spans promoted to its own top-level section; section headers simplified throughout
- Removed unused setting from VS Code extension settings contributions

## [0.1.2] — 2026-05-22

### Added

- **Export tab** — new dashboard tab (between Errors and Help) with Export Raw and Export Redacted buttons, 3-second confirmation state, and inline replay instructions
- **Export Redacted** — `AgentLens: Export OTEL Data (Redacted)` command; prompt text, tool inputs/results, and PII fields (`user.*`, `enduser.*`, `organization.*`) replaced with `[redacted]`; files named `export_redacted_*`
- **Replay from exported file** — `pnpm run demo -- --file <path>` replays any exported JSON (raw or redacted) directly into the dashboard; instant send by default, `--speed N` for paced replay; works with both plugin and standalone on port 4318
- **Sidebar latest session card** — model, source, turns, tool calls, errors, and cache hit rate for the most recent session
- **Sidebar expand/collapse** — ◄/► toggle to show or hide the AgentLens sidebar panel; dashboard opens automatically on first activation

### Changed

- Recommendations action buttons unified to "Copy for {Agent}" / "Copy to Clipboard" (removed "Ask Claude / Ask Copilot / Ask Codex" labels)
- Standalone export now downloads a ZIP archive; plugin export writes JSON files to workspace root

### Fixed

- Export `message` event listener was registered inside the tooltip `useEffect` without cleanup — moved to its own `useEffect` with proper removal on unmount

## [0.1.1] — 2026-05-22

### Fixed

- Port conflict detection now distinguishes between another AgentLens VS Code window (silent fallback with cross-window sync), the AgentLens standalone server (error with specific message), and an unrelated process (error with instruction to change `agentLens.otlpPort`)
- Plugin and standalone servers now expose fingerprint endpoints (`/agentlens/plugin` and `/agentlens/standalone`) so each can identify the other

## [0.1.0] — 2026-05-21

### Added

- Built-in OTLP/HTTP collector on `127.0.0.1:4318` — JSON-over-HTTP only (protobuf not required)
- Auto-configuration for GitHub Copilot, Claude Code, and Codex on activation
- 15-tab dashboard: Efficiency, Recommendations, Alerts, Automation, Summaries, Traces, Files, Agents, Tokens, Latency, Flow, Tools, Errors, Export, Help
- Loop and malfunction detection — Tool Call Deadlock, State Corruption Spiral, Hallucination Amplification Loop, Escalating Scope, Context Accumulation
- Conversation grouping — Copilot and Codex sessions linked by their conversation thread ID
- Per-session Conversation column in Efficiency tab
- Standalone web server mode (`pnpm run standalone`) and Docker image (`agentlens/agentlens`)
- Write Prompts File automation — writes triggered prompts to `agentlens-prompts-{agent}.md` in workspace or server directory
- Automation recency guard — only sessions active within the last 2 minutes trigger automations
- Per-agent threshold profiles for Alerts and Automation tabs
- Export tab — export raw or redacted span data as JSON directly from the dashboard; includes replay instructions
- Export OTEL Data command — writes raw span data as JSON files (Command Palette: `AgentLens: Export OTEL Data`)
- Export OTEL Data (Redacted) command — same export with prompt text, tool inputs/results, and PII fields replaced with `[redacted]` (Command Palette: `AgentLens: Export OTEL Data (Redacted)`)
- Collector error banner in sidebar when OTLP port is already in use
