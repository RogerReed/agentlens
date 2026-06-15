# Changelog

All notable changes to AgentLens are documented here.

## [0.8.5] — 2026-06-15

### Fixed

- **First session in standalone Traces tab never loads timeline** — The first session in the Traces tab starts expanded by default, but `loadSessionDetail` was only dispatched inside `toggle()`, which fires on user click. The auto-expanded session would show "Loading timeline…" indefinitely until the user manually collapsed and re-expanded it. Fix: add a `useEffect` that fires on mount (and whenever `collapsed` changes) to dispatch the fetch whenever the session is expanded but its timeline has not yet loaded (#161, #162)

---

## [0.8.4] — 2026-06-14

### Fixed

- **Per-turn token costs wrong for cached Claude turns** — `TimelineEntry` had no `cacheReadTokens` / `cacheCreateTokens` fields, so `calcEntryCost` passed zeros for both cache tiers and billed every token at the full input rate. A turn with 100 K total context where 90 K is cached was priced ~5–10× too high, and costs looked uniform across turns because the inflated formula only grew with the slowly-expanding context window. Fix: add the two optional fields throughout the pipeline (summarizer, DB schema + migration, writer, reader, webview types) and update `calcEntryCost` to apply the correct cache-read (10%) and cache-write (125%) rates. The Traces tab StepRow compact display now shows total tokens and cache-read count on two short lines that fit the 90 px column instead of a single overflowing string (#157, #159)
- **Standalone server locks up Safari on load** — `getHtml()` inlined `window.__INITIAL_SPANS__` (the full raw spans array, never consumed by the Preact app — potentially multiple MB) and full per-session timeline arrays inside `__INITIAL_SESSION_SUMMARY__`, all synchronously in `<script>` tags before `dashboard.js` could evaluate. Safari's JavaScriptCore parses large inline scripts on the main thread with no incremental yield, freezing the page immediately after first paint. The raw spans array was also re-sent in every SSE update payload. Fix: remove `__INITIAL_SPANS__` entirely, strip timeline arrays from the inline summary, add `/api/summary` and `/api/timeline/:sessionId` endpoints for lazy loading, wire `loadSessionDetail` in the `acquireVsCodeApi` shim to fetch timelines on demand, and add an SSE `onerror` → 2-second polling fallback so Safari private mode (where ITP blocks `EventSource`) shows live data instead of a frozen page. Diagnostic `console.log` timestamps are now emitted at key load stages to aid future cross-browser diagnosis (#158, #160)

---

## [0.8.3] — 2026-06-14

### Fixed

- **OOM crash during long Claude Code sessions with enhanced telemetry** — `genAiResponseBuffer` in the OTLP collector leaked one large JSON blob per LLM call when the `claude_code.llm_request` span arrived before its matching `gen_ai.choice` log event (the common ordering with `gen_ai_latest_experimental`). `processTraces` deleted buffer entries when it consumed them, but when the span was already in the store by the time the log arrived, `processLogs` injected immediately and never cleaned up its own entry. Over a long session the buffer accumulated the full accumulated conversation context for every turn, growing the heap to the 4 GB V8 limit and crashing VS Code. Fix: check `injectSpanAttribute`'s return value and delete the buffer key immediately on successful injection. A 500-entry LRU-style cap also guards against orphaned entries when a span is dropped by the agent's OTLP exporter (#155, #156)

---

## [0.8.2] — 2026-06-11

### Fixed

- **Windows: Codex and Copilot CLI sessions not discovered** — `codexSessionsDirs()` and `copilotSessionStateDir()` only checked Unix-style home-directory paths. On Windows, Codex likely stores sessions under `%LOCALAPPDATA%\Codex\sessions` or `%APPDATA%\Codex\sessions`, and Copilot CLI under `%APPDATA%\copilot\session-state`. Both are now checked as primary candidates on `win32` before falling back to the `~/.codex` / `~/.copilot` paths, matching the existing pattern used for Claude Code (#153, #154)

---

## [0.8.1] — 2026-06-11

### Fixed

- **Standalone UI hangs empty on startup** — `startLogIngestion()` awaits sql.js before scanning, so the browser frequently connects to the SSE `/events` endpoint during that async gap and receives an empty payload. After the scan completes and `logSessions` is populated, `fileState` is fully current so the 5-second `runLogScan` poll finds no changed files and never pushes an update — the dashboard stays blank indefinitely. Fix: call `pushUpdate()` at the end of `startLogIngestion()` to flush sessions to any already-connected SSE clients (#151, #152)

---

## [0.8.0] — 2026-06-10

### Added

- **OpenCode support** — AgentLens now reads OpenCode's local SQLite database (`~/.local/share/opencode/opencode.db` on Mac/Linux, `%APPDATA%\opencode\opencode.db` on Windows) directly, with no agent configuration required. Sessions, messages, parts (tool calls, file accesses), and token counts are all parsed; the WAL is merged at read time so sessions appear immediately after each run. Subagent sessions (`parent_id` set) are excluded. Falls back to reading `storage/message/*.json` files when the SQLite driver is not available (Docker). Override the default path with `OPENCODE_DATA_DIR` (comma-separated for multiple directories). Windows path (`%APPDATA%\opencode`) is also checked automatically (#147)
- **Import tab** — New **Import** tab in the dashboard accepts an AgentLens JSON export file (drag-drop or file picker), shows a preview with session count by agent source and date range, then imports with live progress updates. Sessions already present in the local database are skipped automatically. Works in both VS Code extension mode and standalone server mode. The standalone server adds a `/api/import` endpoint for the batched POST path (#148)
- **Pricing: claude-fable-5** — Added `claude-fable-5` to both pricing tables at `$10/$50` per MTok input/output with a 1 M token context window (#150)
- **Pricing: big-pickle** — Added `big-pickle` (OpenCode's stealth model, free during limited evaluation) to both pricing tables (#147)

### Fixed

- **Import hang in VS Code** — Importing sessions previously blocked indefinitely because `drain()` returned the shared `drainPromise`, which could be an in-flight log-reader drain waiting on async blob writes. Import now uses a dedicated `importCards()` synchronous transaction path that bypasses the drain pipeline entirely (#148)
- **Import progress stuck at 0 in standalone** — Standalone HTML injects `window.acquireVsCodeApi` as a shim, making `vscode` truthy even in browser mode. The Import tab now checks `window.__STANDALONE__` to route correctly, and sends sessions in 50-session batches so progress updates are visible during large imports (#148)
- **Context window values for 1 M-context models** — `contextWindowTokens` corrected from `200_000` to `1_000_000` for all Opus 4.x, Sonnet 4.x, and Opus fast-mode entries; these models have supported 1 M context since Opus 4.6 (#150)

## [0.7.3] — 2026-06-09

### Fixed

- **sql.js not resolvable in packaged extension** — `require('sql.js')` failed with `Cannot find module` in installed extensions because `sql.js` was marked external in esbuild but `node_modules` is excluded from the `.vsix`. `sql-wasm.js` is now copied to `dist/` at build time and required by path; covers both the primary window (`openDatabase`) and secondary sync windows (`openReadonlySnapshot`) (#141)
- **Friendly EADDRINUSE errors** — MCP (port 4316) and UI (port 3000) servers now print an actionable message and exit cleanly on port conflict instead of crashing with a raw Node stack trace; all three servers (OTLP, MCP, UI) now use the same pattern (#140)

---

## [0.7.2] — 2026-06-08

### Fixed

- `media/help-mascot.png` removed from `.dockerignore`, `.vscodeignore`, and `.npmignore` — it is served by the VS Code webview, standalone server, and Docker image and must be included in all packages; only `media/demo.gif` is README-only

---

## [0.7.1] — 2026-06-08

### Added

- **Ingestion toggles** — new Settings tab with per-source ingestion toggles (Claude Code logs, Copilot logs, OTEL spans); each source can be disabled independently without clearing data

### Fixed

- **Fast mode cost multiplier** — fast mode sessions now apply the 5× cost multiplier from the `usage.speed` field; was previously ignored, causing fast mode sessions to be underpriced (#124)
- **Tiered pricing for claude-sonnet-4** — input tokens above 200 K now apply the correct surcharge tier; the `calcTokenCostUsd` calling convention was also corrected to pre-subtract cache tokens before tier lookup (#130)
- **Copilot OTEL token convention** — GPT-model Copilot sessions use the OpenAI token convention (`input_tokens` = total context including cached); the summarizer no longer double-counts cached tokens when `cacheRead` is non-zero (#133)
- **Unpriced sessions excluded from cost chart** — sessions with unrecognized model IDs (grey `?` markers) are now filtered out of the ESTIMATED COST bar chart; they contributed $0 to all calculations but consumed slots and created visual noise; a footnote reports how many were excluded (#135)
- **"Clear All Data" visually confirms** — post-clear re-ingestion delay increased from 500 ms to 5 s so the cleared state is visible before sessions reload (#136)
- **Dashboard picks up log scan results** — `DashboardPanel.update()` is now called after every `runLogScan` drain; previously the dashboard could lag up to 40 s behind the sidebar after a log scan (#136)

### Chore

- `media/demo.gif` and `media/help-mascot.png` (README-only assets) excluded from `.vscodeignore`, `.dockerignore`, and `.npmignore`
- Updated demo GIF

---

## [0.7.0] — 2026-06-07

### Added

- **Advisor tab** — new tab (merged into the Patterns tab area) with three sub-panels:
  - *Instruction Advisor* — surfaces per-workspace suggestions derived from session patterns: hot file guidance, loop prevention rules, scope discipline, tool discipline, and discovery prompts; each card shows the suggested text and an "Apply to file" button with a file-picker dropdown targeting detected instruction files (CLAUDE.md, .cursorrules, etc.)
  - *Instruction Effectiveness* — tracks the before/after impact of applied suggestions; compares cost-per-session and turns-per-session in a 20-session window before vs. after each applied suggestion; surface area shows `baselineCostAvg`, `postCostAvg`, delta, and a trend indicator; requires at least 5 post-apply sessions to report
  - *Prompt Analyzer* — pre-session cost prediction and context advice (foundation for issue #119)
- **Hot Files — Written mode** — new toggle on the Patterns tab Hot Files panel; switches from "files read most" to "files fully written by the agent"; files where the agent overwrote the entire content are ranked by session count; tip box adapts to Written mode with guidance on what fully-written files indicate
- **Instruction file apply/remove** — suggestions can be applied directly to a target file (appends a marked block `<!-- AgentLens suggestion applied -->`); remove clears the block; both VS Code extension and standalone server support apply/remove; standalone adds `POST /api/instructions/apply` and `DELETE /api/instructions/applied/:id` endpoints
- **Effectiveness persistence** — `instruction_applied` and `instruction_dismissed` SQLite tables store applied suggestion records, baseline snapshots, and dismissed IDs per workspace; `InstructionRepository` and `InstructionEffectiveness` modules implement the full persistence and computation layer
- **Understanding Cost Estimates** — new Help section explaining how costs are derived, why estimates differ from billing, what "accumulated" means for multi-turn cached sessions, and known gaps per agent

### UX

- **$0.00 row suppression** — cost table hides rows with zero estimated cost by default; "Show $0" toggle reveals them; reduces visual noise for agents that produce no billable activity in the window
- **Cost disclaimer link** — `?` link on the "ESTIMATED COST" heading and in the disclaimer bar jumps to the Understanding Cost Estimates Help section
- **Accumulated token display** — tooltip clarifies that token counts for cached sessions represent accumulated totals across the turn chain, not per-turn usage

### Fixed

- **Strict equality** — replaced all `!= null` / `== null` comparisons with `!== null` / `=== null` (eqeqeq lint rule) across App.tsx, sidebarWebview.ts, reader.ts, and sessionRepository.ts
- **Stale instruction files on workspace switch** — switching the workspace filter to "All" now clears the `instructionFiles` signal, preventing stale file options from a previous workspace appearing in the Apply dropdown
- **Standalone remove endpoint** — VS Code extension had `removeInstructionSuggestion` message handling but standalone had no HTTP endpoint; added `DELETE /api/instructions/applied/:id` that scans all session workspaces

---

## [0.6.1] — 2026-06-06

### Added

- **Workspace filter** — new dropdown in the filter bar surfaces the project path for each session and lets you narrow the view to a single workspace; works across Sessions, Analytics, Patterns, and Export tabs
- **Cross-source workspace resolution** — OTEL-traced sessions (Claude Code, Codex) that lack a workspace attribute are matched to a log-ingested session from the same source that started within the same minute; the resolved workspace propagates to the OTEL session for filter purposes
- **Codex workspace from session_meta** — Codex sessions now read `session_meta.cwd` as the workspace path instead of the date-based directory name

### Fixed

- **Workspace in live sessions** — OTEL span attributes (`process.cwd`, `session.workspace`) are now extracted and surfaced in live (in-memory) sessions, not just persisted ones
- **Workspace filter applied to DB results** — `rangedSessions` was not applying the workspace filter to SQLite query results; fixed to filter in the DB layer

---

## [0.6.0] — 2026-06-05

### Added

- **Patterns tab** — new cross-session behavioral analysis tab with two panels:
  - *Efficiency Map* — scatter plot (cost × LLM calls) colored by cache hit rate; click any dot to navigate to that session; top-10 table is sortable by time, cost, turns, or cache hit; each row shows an agent dot and a time hyperlink that jumps to the expanded session in the Sessions tab
  - *Hot Files* — files the agent accessed most often, ranked by session count; shows read and changed counts per file with a "last seen" date; tip box adapts per mode (Read / Changed / Both) explaining what to do about each pattern
- **MCP server** — Streamable HTTP server (port 4316) that gives Claude Code and other agents direct access to session history via five tools: `get_recent_sessions`, `get_workspace_patterns`, `get_session_detail`, `find_relevant_context`, `get_efficiency_report`; toggle in Settings; auto-starts with the extension; standalone server also runs on port 4316
- **Shared filter bar** — time range, agent, source, text search, and From (initiator) filters now appear on Sessions, Analytics, Patterns, and Export tabs; state retained when switching tabs; Reset available everywhere
- **Export respects filters** — export sends the active filtered session IDs to the backend; both VS Code and standalone export only what is visible, not the full database
- **Chart → session navigation** — clicking a bar in Estimated Cost or Token Usage Per Session, or a line in Context Growth, navigates to the Sessions tab and expands that session
- **Loop signals for log sessions** — `detectLoopSignals` now runs on log-reader sessions (was always empty); exact-tool-repeat and runaway-step signals now appear on log-sourced sessions
- **VS Code-family IDE coverage** — Copilot Chat log ingestion now scans Cursor, Windsurf, VSCodium, Trae, and Kiro workspace storage directories in addition to VS Code and VS Code Insiders
- **Improved ingestion logs** — span ingestion now shows agent name instead of a running total; session load shows per-agent breakdown with source directories
- **Context and Context Window** added to the Help glossary with precise definitions

### UX

- **Analytics section headers** — all-caps with letter-spacing; first section spacing tightened to match filter bar
- **Patterns section headers** — all-caps with letter-spacing, matching Analytics style
- **Context Growth chart** — most recent 25 sessions shown (was oldest 25); session count label; ◀▶ step buttons moved next to speed controls; fixed step buttons not highlighting when an external session focus was set
- **Context Growth bug fix** — chart was missing for log-sourced sessions because tool-using turns were classified as `type:'tool'` instead of `'llm'`; now correctly picks up turns with `inputTokens > 0` regardless of type
- **View Automations button** — automation popup now has a View Automations button to the left of Copy Prompt, matching the alert popup pattern
- **Padding and spacing** — added padding above sessions table, patterns content, and export cards
- **Export tab** — removed total session count header; removed "browser download" label

### Fixed

- **Analytics charts filter** — Estimated Cost bar chart, Token Usage Per Session, and Context Growth were not updating when the text filter or From filter changed; fixed to use `filteredSessions` (sorted by time) instead of `rangedSessions`
- **Refresh button stale range** — time range picker's Refresh button now writes the fresh `TimeRange` to the signal before calling `fireSearch`, fixing stale in-memory session boundaries after refresh
- **MCP workspace filter no-op** — `get_recent_sessions` workspace filter had `|| true` making it always pass; removed
- **logReader sparse array crash** — `Math.max(...turnTimestamps)` on a sparse array (turns with missing timestamps) threw `RangeError: Invalid time value`; now filters undefined entries first
- **Cost sort wrong pricing mode** — session sort by cost was pricing session B with session A's mode; fixed to derive mode per session
- **Session detail request on every render** — `vscode.postMessage({ type: 'loadSessionDetail' })` was called in the render body of `SessionDetail`, firing on every re-render; moved into `useEffect`
- **Export standalone fix** — standalone export was a no-op (re-dispatched message to window with no listener); now triggers a real browser download
- **Redacted export** — now replaces file paths with `[redacted]` in addition to prompt text
- **`scheduleWatchScan` debounce** — was leading-edge (only first event in a burst); converted to trailing-edge so scan fires 300ms after the *last* fs.watch event, preventing partial reads during streaming file writes

### Docs

- **Help — Patterns section** — new section in the TOC and content covering the Efficiency Map and Hot Files panels
- **Help — Export section** — corrected description; export now respects active filters
- **Help — Agent Integration** — CLAUDE.md block tightened to 2 lines; note added that brevity avoids context window bloat; standalone MCP URL corrected to port 4316
- **README** — Patterns feature bullet added; Export bullet updated to reflect filter-aware export
- **CLAUDE.md** — tightened to 2-line instruction block

---

## [0.5.0] — 2026-06-03

### UX

- **Navigation overhauled** — tab bar collapsed from six entries to three data views (`Sessions | Analytics | Export`); three icon buttons sit right-aligned in the header
- **Bell icon — active alert status** — badge shows the number of currently triggered alerts; click to open a compact status card listing each alert with severity, name, and detail text; "Configure alerts →" link jumps to the settings panel
- **Gear icon — settings panel** — slide-in panel (440px, scrollable) with collapsible Alerts and Automation sections, both open by default; close with × or Escape
- **Help icon** — replaces the Help tab; active state shows the same blue underline as tab buttons
- **SVG icons throughout** — bell, gear, help, and refresh buttons are all stroke-based SVGs using `currentColor`; same visual weight at any size, work in dark and light themes with no emoji rendering quirks
- **Severity dots in alert card** — alert card rows use small coloured circles instead of emoji for severity indicators
- **Tab bar alignment** — tabs now sit flush to the top of the view in both VS Code and standalone; standalone sidebar gets 8px top padding for breathing room
- **Agent key legend removed** — the `● Copilot ● Claude ● Codex` row at the top of the sidebar was redundant with the per-session agent indicator already shown in each card

### Fixed

- **Copilot Chat log ingestion** — added `_parseCopilotVSCodeFile` (delta-log JSONL) and `_parseCopilotVSCodeJsonFile` (legacy JSON snapshot) for `workspaceStorage/chatSessions`; handles three `completionTokens` formats (direct kind=1, embedded in kind=2 push, pre-June 2026 result.usage); fixes k.length===1 guard to prevent sub-array inflation of `requestPushCount`; two-phase startup loading (fast group batch=10, slow .json group batch=2 with 50ms gap) to keep extension host responsive
- **Copilot CLI session.shutdown** — reads `modelMetrics[model].usage` instead of `currentTokens` for correct token totals
- **Codex prompt extraction** — extracts user prompt from `event_msg payload.type=user_message`; strips IDE context preamble (`## My request for Codex:`) via `_extractCodexUserText`
- **Clear All Data** — `agentLens.clearSessions` command was registered but the button did nothing; now correctly clears pending queue and generation counter, refreshes UI before re-ingestion, and triggers `setImmediate(runLogScan)` in standalone so log sessions repopulate after clear
- **Standalone alert / automation notifications** — match VS Code UX: automation label format `Automation: <label>`, alert notifications use `showActionNotification` with View Alerts secondary action and 30s dismiss; `\n` escaping fixed in template literals to prevent broken inline JS strings

### Docs

- **Help — Settings section** — replaces separate Alerts and Automation sections in the Help TOC; describes the bell icon (badge, status card, Configure link) and gear icon (settings panel, collapsible sections)

### Chore

- **`.map` files gitignored** — `media/dashboard.js.map`, `media/dashboard.css.map`, `media/sidebar.js.map`, and `standalone/cli.js.map` are no longer tracked; all caused unresolvable conflicts on rebase because git cannot merge the base64 mapping blobs
- **Post-rebase/merge hooks** — `.githooks/post-rewrite` and `.githooks/post-merge` run `node esbuild.js` automatically so `cli.js` and other build artifacts stay in sync after any rebase or merge without manual intervention; `core.hooksPath = .githooks` set in project git config
- **`.claude/settings.json` gitignored** — per-developer Claude Code permissions config; was creating constant noise in `git status`

---

## [0.4.1] — 2026-06-03

### Docs

- **Help tab restructured** — dedicated sections for Sessions, Analytics, Alerts, Automation, and Export now mirror the app's tab layout; Insights and Loop Detection moved from standalone top-level sections into the Sessions section where they live in the app; Sessions section now clearly documents the five sub-tabs (Overview, Trace, Flow, Tools, Files) including that Insights lives inside Overview
- **Log file ingestion mentioned in descriptions** — Help Overview paragraph, VS Code extension description, and walkthrough "Agents Are Ready" step now surface log file ingestion as a zero-config data source alongside OTEL traces

---

## [0.4.0] — 2026-06-02

### Added

- **Source filter** — Sessions and Analytics tabs now have an OTEL / Log toggle to show only OpenTelemetry-traced sessions or only log-ingested sessions (or both)
- **Session initiator badges** — each session row shows a `User`, `Agent`, or `API` badge indicating how the session was started; an Initiator filter in the Sessions tab lets you narrow to a specific origin
- **Real-time log updates** — standalone server uses `fs.watch` to detect JSONL file changes and re-reads the full file immediately, so new turns appear without waiting for the 30-second poll

### Fixed

- **Standalone first-load blank page** — log sessions are now loaded synchronously before the first response so the Sessions tab is never empty on first open
- **Standalone cache hit rate and token counts** — corrected calculation from log-ingested sessions; total tokens and cache hit rate now match VS Code sidebar values
- **VS Code notification prefixes** — alert and automation notifications are now prefixed `Alert:` / `Automation:` instead of the longer `AgentLens Alert:` / `AgentLens Automation [label]:`
- **Reset button placement** — Reset sits adjacent to the Source filter in the Sessions and Analytics toolbars, with a slightly larger hit area

### Docs

- Getting Started reordered: Local (npx) install first, VS Code second, Docker third; "standalone" renamed to "local" throughout README and in-app Help

---

## [0.3.0] — 2026-06-02

### Added

- **Local log file ingestion** — AgentLens now reads JSONL session files from disk for all three agents automatically, with no OTLP setup required. Files are scanned at startup (newest-first, in batches of 10 to avoid blocking) and polled every 30 seconds for new or updated files. Sessions from log files carry an OTEL/Log source badge in the Sessions table.
  - Claude Code: `~/.claude/projects/**/*.jsonl` (env override: `CLAUDE_CONFIG_DIR`)
  - Codex: `~/.codex/sessions/**/*.jsonl` (env override: `CODEX_HOME`)
  - Copilot CLI: `~/.copilot/session-state/<uuid>/events.jsonl` (written automatically — no env setup required)
  - Disable via `agentLens.enableLogIngestion: false` in VS Code settings
- **Standalone server — log ingestion + npx** — the standalone server now ingests local log files, auto-opens the browser on start, and is available as `npx agentlens` / `npx agentlens-dashboard` (pass `--no-open` to suppress browser launch)
- **Cost table — M/K token display** — token counts in the Estimated Cost table now display in compact form (e.g. `1.2M` / `345K`) with a toggle to switch between compact and raw numbers; Model column shortened to show only the model name without the provider prefix

### Fixed

- **Analytics chart label overlap** — date and turn labels on all three charts now thin automatically to prevent collision at any zoom level or session count: `HistoryChart` (SVG bar chart, daily mode) uses a pixel-aware stride snapped to human-readable intervals; `CostBarChart` uses a minimum-gap guard on day boundary labels; `ContextGrowthChart` uses pixel-aware x-axis step calculation (minimum 32 px between label centres)
- **Copilot log path** — Copilot sessions now read from `~/.copilot/session-state/` (the path written by Copilot CLI automatically); was incorrectly reading from `~/.copilot/otel/`
- **In-progress vs. missing prompt** — sessions with a prompt that hasn't arrived yet show `…`; sessions that genuinely have no prompt (e.g. log-only Codex sessions) show `—`
- **Copilot prompt extraction** — startup log scan now skips injected XML preamble blocks (`<current_datetime>`, `<system_reminder>`) when extracting the user request from Copilot `transformedContent` events

### Docs

- README and walkthrough updated for log file ingestion; Docker and native run instructions added; OTEL setup prioritised over log files in getting-started guide
- ARCHITECTURE.md updated: new §4 Local Log Ingestion (file paths, incremental scan mechanics, data parity table), §1 system overview showing `LogReader` as a parallel ingestion path, updated `SessionSummaryCard` class diagram (`dataSource`, `conversationId`), and updated file map

---

## [0.2.1] — 2026-06-01

### Added

- **Analytics cost table — CSV download** — `↓ CSV` button above the Estimated Cost table exports `agentlens-cost.csv` with one row per agent per day (raw numeric token counts and 4-decimal cost) plus a grand total row; works in VS Code and standalone browser

### Fixed

- **Automation notifications** — all three notification sites now consistently read `AgentLens Automation [label]`; was showing `AgentLens [label]` (missing "Automation") or `AgentLens Automation: label` (colon instead of brackets)
- **Sidebar burn rate** — retains last known value after a session ends instead of reverting to "Waiting for data…"; resets when a new session starts
- **Standalone sidebar** — removed Open Dashboard button (the dashboard is the main panel in standalone; VS Code sidebar keeps it)
- **Sessions filter bar** — sort pills (Cost/Duration/Tokens) replaced with a Reset button at the right end; clears text filter, agent filter, time range, session limit, and sort back to defaults; only visible when at least one filter is non-default
- **Analytics** — Token Usage Per Session section moved below Context Growth
- Silent catch blocks in standalone server now log via `console.warn` instead of swallowing errors; unhandled promise on `writer.drain()` now has a `.catch()` handler; DB open failure logs the reason

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
