# AgentLens Architecture

AgentLens is a VS Code extension that receives OpenTelemetry (OTLP) telemetry from AI coding agents (GitHub Copilot, Claude Code, Codex), persists it to a local SQLite database, summarises it into per-session cards, and visualises it in a sidebar and a full dashboard.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Extension Activation](#2-extension-activation)
3. [Data Ingestion Pipeline](#3-data-ingestion-pipeline)
4. [OTLP Collector](#4-otlp-collector)
5. [Session Summarizer](#5-session-summarizer)
6. [Per-Agent Summarizers](#6-per-agent-summarizers)
7. [SQLite Storage Layer](#7-sqlite-storage-layer)
8. [Session Data Model](#8-session-data-model)
9. [Frontend Architecture](#9-frontend-architecture)
10. [Cost Calculation](#10-cost-calculation)
11. [Auto-Configuration](#11-auto-configuration)
12. [Build Pipeline](#12-build-pipeline)

---

## 1. System Overview

```mermaid
graph TB
    subgraph Agents
        CP[GitHub Copilot<br/>OTLP HTTP spans]
        CC[Claude Code<br/>OTLP HTTP spans + logs]
        CX[Codex<br/>OTLP HTTP logs]
    end

    subgraph VSCode Extension
        COL[OtlpCollector<br/>HTTP :4318]
        STO[SessionStore<br/>5-min rolling span window]
        SUM[SpanSummarizer]
        DB[(SQLite<br/>agentlens.db)]
        REPO[SessionRepository<br/>DB + live window]
        SID[SidebarPanel<br/>webview]
        DASH[DashboardPanel<br/>webview]
    end

    subgraph Dashboard UI
        STATE[Preact Signals<br/>state.ts]
        TABS[Tab Components<br/>Efficiency · Cost · Search · Traces · Flow…]
    end

    CP -- "POST /v1/traces" --> COL
    CC -- "POST /v1/traces<br/>POST /v1/logs" --> COL
    CX -- "POST /v1/logs" --> COL

    COL -- addSpan --> STO
    STO -- onUpdate → summarize → enqueue --> DB
    DB -- listSessions / queryDailyStats --> REPO
    STO -- live spans --> REPO
    REPO --> SID
    REPO --> DASH

    DASH -- "postMessage update<br/>+ analyticsData + burnRate" --> STATE
    STATE --> TABS
```

---

## 2. Extension Activation

The extension activates in a fixed sequence.

```mermaid
sequenceDiagram
    participant VS as VSCode
    participant EXT as extension.ts
    participant DB as SQLite (db.ts)
    participant STO as SessionStore
    participant REPO as SessionRepository
    participant COL as OtlpCollector
    participant CFG as autoConfig

    VS->>EXT: activate(context)
    EXT->>EXT: createOutputChannel('AgentLens')
    EXT->>DB: openDatabase(globalStorageUri, extensionUri)
    Note over DB: Loads/creates agentlens.db<br/>Applies schema + migrations<br/>(cost_usd column guard)
    EXT->>STO: new SessionStore(context)
    EXT->>REPO: new SessionRepository(reader, writer, store)
    EXT->>REPO: migrateGlobalStateToSqlite()
    Note over REPO: One-time: globalState spans → SQLite
    EXT->>REPO: runRetention(retentionDays, blobsDir)
    Note over REPO: Delete sessions older than N days<br/>Evict orphaned blob files
    EXT->>STO: onUpdate → summarize → writer.enqueue<br/>→ drain → db.save + write last-write.json
    EXT->>COL: new OtlpCollector(port, store) + start()
    alt Port free
        COL-->>EXT: listening on :4318
    else EADDRINUSE
        COL-->>EXT: error — detect owner (plugin/standalone/foreign)
        EXT->>EXT: poll last-write.json every 2s<br/>reload DB snapshot on change
    end
    par Auto-configure agents
        EXT->>CFG: autoConfigureCopilot(port)
        EXT->>CFG: autoConfigureClaudeCode(port)
        EXT->>CFG: autoConfigureCodex(port)
    end
    EXT->>VS: registerWebviewViewProvider('agentLens.dashboard')
    EXT->>VS: registerCommand('agentLens.openDashboard')<br/>registerCommand('agentLens.clearSessions')<br/>registerCommand('agentLens.showStorageStats')<br/>registerCommand('agentLens.exportData')<br/>registerCommand('agentLens.dumpSpanAttrs')
    EXT->>VS: createStatusBarItem → 'agentLens.openDashboard'
```

---

## 3. Data Ingestion Pipeline

Spans travel from agent process → HTTP → collector → store → summarizer → SQLite → UI.

```mermaid
flowchart TD
    A[Agent emits OTLP payload<br/>HTTP POST /v1/traces or /v1/logs] --> B{Route}

    B -- /v1/traces --> T[processTraces<br/>Extract resourceSpans → spans]
    B -- /v1/logs  --> L[processLogs<br/>Extract logRecords → spans]
    B -- /v1/metrics --> M[processMetrics<br/>count only]

    T --> NS{Is Codex?}
    NS -- yes --> CS[Synthesise session ID<br/>Map OTEL trace → codex:conversation:turn]
    NS -- no  --> DS[Direct span<br/>preserve traceId + parentSpanId]

    L --> LS[Codex log reconstruction<br/>Prompt events → session boundary]

    CS --> ADD[store.addSpan]
    DS --> ADD
    LS --> ADD

    ADD --> UPD[updateSummary<br/>Increment heuristic counters]
    ADD --> TRIM[trimSpans<br/>Drop spans older than 5 min]
    ADD --> CB[Fire onUpdate callbacks]

    CB --> WRITE[Summarize → enqueue to DatabaseWriter<br/>Drain → save DB + write last-write.json]
    CB --> SID_CB[SidebarPanel<br/>300ms debounce + 5s heartbeat]
    CB --> DSH_CB[DashboardPanel<br/>300ms debounce + 10s heartbeat]

    WRITE --> SQLITE[(SQLite<br/>sessions + timeline_entries<br/>+ edit_details + blobs/)]

    DSH_CB --> DSH_U[dashboard.update<br/>repo.listSessions + queryDailyStats<br/>+ queryBurnRate → postMessage]
```

---

## 4. OTLP Collector

A minimal HTTP/1.1 server (Node `http` module) that handles three routes and maintains stateful session reconstruction for Codex.

```mermaid
graph LR
    subgraph HTTP Routes
        R1["GET /agentlens/plugin<br/>→ {agentlens:true, kind:'plugin'}"]
        R2["POST /v1/traces<br/>max body: 50 MB"]
        R3["POST /v1/logs<br/>max body: 50 MB"]
        R4["POST /v1/metrics"]
    end

    subgraph Codex Session State
        S1[codexFallbackTraceId<br/>resets after 30s inactivity]
        S2[codexSessionByOtelTraceId<br/>OTEL trace → session ID]
        S3[codexCurrentSessionByConversation<br/>conversation ID → active session]
        S4[codexSessionRootByTrace<br/>trace ID → root span]
    end

    subgraph Span Output
        SP[Span<br/>traceId · spanId · parentSpanId<br/>name · startTime · endTime<br/>attributes · status]
    end

    R2 --> PT[parseTraces<br/>resourceSpans→spans]
    R3 --> PL[parseLogs<br/>logRecords→spans]

    PT -- Codex spans --> S1
    PT -- Codex spans --> S2
    PT -- Codex spans --> S3
    PL -- codex.user_prompt --> S3
    PL -- non-prompt events --> S4

    PT --> SP
    PL --> SP
```

**Key non-obvious behaviour:** Codex session IDs (`codex:{conversationId}:{turnId}`) are assigned on arrival. Once set, the mapping is immutable even if spans arrive out of order or are retried.

---

## 5. Session Summarizer

`summarizeSpans()` is called on the live rolling span window (last 5 minutes). It groups raw spans into agent-session cards and computes cross-session efficiency metrics. Historical sessions are read directly from SQLite; the two sources are merged by `SessionRepository`.

```mermaid
flowchart TD
    IN[spans: Span\[\]] --> GRP[Group spans by traceId<br/>Build parentSpanId → children map]

    GRP --> CP_FIND[Find invoke_agent spans<br/>Copilot roots]
    GRP --> CC_FIND[Find claude_code.interaction spans<br/>Claude roots]
    GRP --> CX_FIND[Group by codex session ID<br/>Codex roots]

    CP_FIND --> CP_SYN{Missing parents?}
    CP_SYN -- yes --> CP_SYNTH[Synthesise invoke_agent root<br/>for orphan spans]
    CP_SYN -- no --> CP_B
    CP_SYNTH --> CP_B[buildCopilotSessions]

    CC_FIND --> CC_SYN{Missing interaction?}
    CC_SYN -- yes --> CC_SYNTH[Synthesise claude_code.interaction]
    CC_SYN -- no --> CC_B
    CC_SYNTH --> CC_B[buildClaudeSessions]

    CX_FIND --> CX_B[buildCodexSessions]

    CP_B --> SESSIONS[SessionSummaryCard\[\]]
    CC_B --> SESSIONS
    CX_B --> SESSIONS

    SESSIONS --> LOOP[detectLoopSignals<br/>per session]
    SESSIONS --> BG[Background spans<br/>orphans not in any session]
    SESSIONS --> EFF[EfficiencyReport<br/>token totals · TTFT · cache hit rate]

    LOOP --> OUT[FullSummary]
    BG --> OUT
    EFF --> OUT
```

---

## 6. Per-Agent Summarizers

Each agent uses a different span structure. The summarizers normalise these into a common `SessionSummaryCard`.

```mermaid
graph TB
    subgraph Copilot — buildCopilotSessions
        CP_ROOT[invoke_agent span<br/>root of session]
        CP_LLM[chat gpt-4.1 span<br/>type: llm<br/>tokens · model · TTFT<br/>output messages JSON]
        CP_TOOL[execute_tool span<br/>type: tool<br/>gen_ai.tool.name<br/>gen_ai.tool.call.arguments]
        CP_ROOT --> CP_LLM
        CP_ROOT --> CP_TOOL
    end

    subgraph Claude — buildClaudeSessions
        CC_ROOT[claude_code.interaction<br/>root — may be synthetic]
        CC_LLM[claude_code.llm_request<br/>type: llm<br/>input/output/cache tokens<br/>ttft_ms · stop_reason]
        CC_TOOL[claude_code.tool<br/>type: tool<br/>tool_name · file_path]
        CC_ROOT --> CC_LLM
        CC_ROOT --> CC_TOOL
    end

    subgraph Codex — buildCodexSessions
        CX_PROMPT[codex.user_prompt<br/>session boundary]
        CX_LLM[codex.sse_event / codex.completion<br/>type: llm · token counts]
        CX_TOOL[exec_command / apply_patch<br/>type: tool]
        CX_PROMPT --> CX_LLM
        CX_PROMPT --> CX_TOOL
    end

    CP_ROOT & CC_ROOT & CX_PROMPT --> CARD[SessionSummaryCard<br/>source · model · turns<br/>tokens · cacheHitRate<br/>timeline: TimelineEntry\[\]<br/>filesRead/Changed/Searched<br/>toolCounts · errors · outcome]
```

---

## 7. SQLite Storage Layer

Introduced in phases 1–4. The database is the authoritative source for all historical session data. The live 5-minute span window supplements it for in-progress sessions.

### Schema

```mermaid
erDiagram
    sessions {
        TEXT session_id PK
        TEXT trace_id
        TEXT source
        TEXT workspace
        TEXT model
        INTEGER start_time
        INTEGER duration_ms
        INTEGER turns
        INTEGER input_tokens
        INTEGER output_tokens
        INTEGER cache_read_tokens
        INTEGER cache_create_tokens
        REAL cache_hit_rate
        INTEGER total_tool_calls
        INTEGER total_llm_calls
        INTEGER errors
        TEXT outcome
        INTEGER is_sidechain
        TEXT user_request
        TEXT tool_counts
        TEXT loop_signals
        TEXT files_read
        TEXT files_changed
        TEXT files_searched
        REAL cost_usd
    }
    timeline_entries {
        INTEGER id PK
        TEXT session_id FK
        TEXT span_id
        INTEGER position
        TEXT type
        TEXT label
        TEXT model
        INTEGER input_tokens
        INTEGER output_tokens
        INTEGER ttft
        INTEGER duration_ms
        TEXT action
        TEXT decision
        INTEGER is_error
        TEXT error_message
        TEXT timestamp
        INTEGER has_blob
    }
    edit_details {
        INTEGER id PK
        INTEGER timeline_entry_id FK
        TEXT file_path
        TEXT tool_name
        INTEGER has_blob
    }
    sessions ||--o{ timeline_entries : "has"
    timeline_entries ||--o{ edit_details : "has"
```

Large string fields (`responseText`, `thinking`, `toolInput`, `fullResult`, `oldString`, `newString`) above 512 bytes are stored as files at `globalStorageUri/blobs/<spanId>-<field>.txt` rather than inline in the DB. The `has_blob` flag indicates when to read from disk instead.

### Component responsibilities

```mermaid
graph TD
    subgraph src/database/
        SCH[schema.ts<br/>SCHEMA_SQL — CREATE TABLE statements]
        DBT[db.ts<br/>AgentLensDb — opens DB, applies<br/>schema + migrations, save/dispose]
        WRI[writer.ts<br/>DatabaseWriter — enqueue/drain/clearAll<br/>Computes cost_usd at write time]
        REA[reader.ts<br/>DatabaseReader — listSessions<br/>queryDailyStats · queryLifetimeStats<br/>searchSessions · queryBurnRate<br/>loadSessionTimeline · loadBlob]
        MIG[migration.ts<br/>migrateGlobalStateToSqlite<br/>One-time globalState → SQLite]
        RET[retention.ts<br/>runRetention — DELETE old sessions<br/>Evict orphaned blob files]
    end

    subgraph src/
        PRI[pricing.ts<br/>lookupRates · calcTokenCostUsd<br/>contextWindowTokens per model]
        REPO[sessionRepository.ts<br/>SessionRepository<br/>Merges DB + live window<br/>Single access point for session data]
    end

    DBT -- raw SqlDatabase --> WRI
    DBT -- raw SqlDatabase --> REA
    PRI --> WRI
    PRI --> REA
    WRI --> REPO
    REA --> REPO
    SCH --> DBT
    MIG --> REPO
    RET --> REPO
```

### Data flow: write path

```mermaid
sequenceDiagram
    participant STO as SessionStore
    participant SUM as summarizeSpans
    participant WRI as DatabaseWriter
    participant DB as SQLite
    participant BLB as blobs/ dir
    participant SIG as last-write.json

    STO->>SUM: getSpans() on each onUpdate
    SUM->>WRI: enqueue(SessionSummaryCard, workspace)
    WRI->>DB: BEGIN transaction
    WRI->>DB: INSERT OR REPLACE INTO sessions (incl. cost_usd)
    WRI->>DB: DELETE old timeline_entries for session
    WRI->>DB: INSERT timeline_entries + edit_details
    WRI->>DB: COMMIT
    WRI->>BLB: write blob files async (if content ≥ 512 bytes)
    WRI->>SIG: db.save() + write lastWriteMs
```

### Data flow: read path

```mermaid
sequenceDiagram
    participant DASH as DashboardPanel
    participant REPO as SessionRepository
    participant REA as DatabaseReader
    participant DB as SQLite
    participant STO as SessionStore
    participant WV as Webview

    DASH->>REPO: listSessions()
    REPO->>REA: listSessions() — historical from DB
    REPO->>STO: getSpans() → summarizeSpans() — live window
    REPO-->>DASH: merged + sorted SessionSummaryCard[]

    DASH->>REPO: queryDailyStats({ since: 30d })
    DASH->>REPO: queryLifetimeStats()
    DASH->>REPO: queryBurnRate(activeSessionId)
    REA->>DB: SELECT with aggregates / JOIN
    REA-->>DASH: DailyStatRow[] / LifetimeStats / BurnRate + Projection

    DASH->>WV: postMessage { type:'update', sessionSummary,<br/>analyticsData, burnRate }

    WV->>DASH: postMessage { type:'loadSessionDetail', sessionId }
    DASH->>REPO: loadSessionTimeline(sessionId)
    REA->>DB: SELECT timeline_entries + edit_details
    DASH->>WV: postMessage { type:'sessionDetail', timeline }

    WV->>DASH: postMessage { type:'loadBlob', spanId, field }
    DASH->>REPO: loadBlob(spanId, field)
    REA->>BLB: readFile
    DASH->>WV: postMessage { type:'blobContent', content }

    WV->>DASH: postMessage { type:'searchSessions', query }
    DASH->>REPO: searchSessions(query)
    REA->>DB: SELECT + COUNT with WHERE/ORDER/LIMIT
    DASH->>WV: postMessage { type:'searchResults', sessions, totalCount }
```

### Cross-window sync

When two VS Code windows are open and one holds the OTLP collector (port 4318), the other cannot collect spans. The non-collector window polls `last-write.json` every 2 seconds and reloads a fresh DB snapshot via `openReadonlySnapshot()` when the timestamp advances.

### Storage management

`agentLens.sessionRetentionDays` (default 90) controls how long sessions are kept. `runRetention` is called at activation and every 24 hours. After deleting old rows it scans `blobs/` and removes any file whose span ID is no longer in `timeline_entries`.

`agentLens.showStorageStats` reports DB file size, blob directory size, session count, and date range to the Output channel.

---

## 8. Session Data Model

```mermaid
classDiagram
    class SessionSummaryCard {
        +sessionId: string
        +traceId: string
        +source: copilot | claude_code | codex
        +userRequest: string
        +model: string
        +turns: number
        +inputTokens: number
        +outputTokens: number
        +cacheReadTokens: number
        +cacheCreateTokens: number
        +cacheHitRate: number
        +durationMs: number
        +startTime: string
        +filesRead: string[]
        +filesChanged: string[]
        +filesSearched: string[]
        +toolCounts: Record~string,number~
        +totalToolCalls: number
        +totalLlmCalls: number
        +errors: number
        +outcome: string
        +timeline: TimelineEntry[]
        +backgroundSpans: BackgroundSpanSummary[]
        +loopSignals: LoopSignal[]
    }

    class TimelineEntry {
        +type: llm | tool | background
        +spanId: string
        +label: string
        +model?: string
        +inputTokens?: number
        +outputTokens?: number
        +ttft?: number
        +durationMs: number
        +action?: string
        +responseText?: string
        +toolInput?: string
        +decision?: string
        +isError: boolean
        +timestamp: string
        +editDetails?: EditDetail[]
    }

    class EditDetail {
        +filePath: string
        +oldString?: string
        +newString?: string
        +content?: string
        +toolName?: string
    }

    class DailyStatRow {
        +day: string
        +totalTokens: number
        +cacheReadTokens: number
        +cacheCreateTokens: number
        +outputTokens: number
        +costUsd: number
        +sessionCount: number
    }

    class BurnRate {
        +tokensPerMinute: number
        +costPerHour: number
    }

    class Projection {
        +totalTokens: number
        +totalCostUsd: number
        +remainingMinutes: number
        +contextFillPct: number
    }

    SessionSummaryCard "1" *-- "many" TimelineEntry
    TimelineEntry "1" *-- "many" EditDetail
    BurnRate "1" -- "0..1" Projection : paired with
```

**Lazy timeline loading:** `SessionSummaryCard.timeline` is always `[]` when read from SQLite. The webview requests individual timelines on demand via `loadSessionDetail`. Blob fields (`responseText`, `thinking`, etc.) are further deferred until the user expands an entry (`loadBlob`).

---

## 9. Frontend Architecture

The dashboard is a Preact application bundled into `media/dashboard.js`. It uses `@preact/signals` for reactive state — no Redux, no Context, no prop drilling.

### Signal graph

```mermaid
graph TD
    subgraph Core data — set by DashboardPanel messages
        SIG_SUM[sessionSummary<br/>Signal&lt;FullSummary | null&gt;]
        SIG_TOOLS[toolCalls<br/>Signal&lt;Record&gt;]
        SIG_TL[sessionTimelines<br/>Signal&lt;Record&lt;sessionId, TimelineEntry[]&gt;&gt;]
        SIG_BLOB[blobCache<br/>Signal&lt;Record&lt;spanId:field, string&gt;&gt;]
        SIG_DS[dailyStats<br/>Signal&lt;DailyStatRow[]&gt;]
        SIG_LS[lifetimeStats<br/>Signal&lt;LifetimeStats | null&gt;]
        SIG_BR[burnRateData<br/>Signal&lt;BurnRateData | null&gt;]
        SIG_SR[searchResults<br/>Signal&lt;SearchResultData | null&gt;]
    end

    subgraph UI controls
        SIG_LIM[sessionLimit<br/>Signal&lt;number&gt; = 10]
        SIG_AGT[selectedAgentFilter<br/>Signal&lt;AgentFilter&gt; = all]
        SIG_TAB[activeTab<br/>Signal&lt;string&gt; = efficiency]
    end

    subgraph Computed
        COMP_FILT[agentFilteredSessions<br/>computed — filter by source]
        COMP_DISP[displaySessions<br/>computed — last N sessions]
        COMP_PRES[agentPresence<br/>computed — which agents active]
    end

    SIG_SUM --> COMP_FILT
    SIG_AGT --> COMP_FILT
    COMP_FILT --> COMP_DISP
    SIG_LIM --> COMP_DISP
    COMP_DISP --> COMP_PRES

    COMP_DISP --> TAB_COMPS[Tab components]
    SIG_TL --> TAB_COMPS
    SIG_BLOB --> TAB_COMPS
    SIG_DS --> TAB_COMPS
    SIG_LS --> TAB_COMPS
    SIG_BR --> TAB_COMPS
    SIG_SR --> TAB_COMPS
    SIG_TAB --> TAB_COMPS
```

### Tab component overview

```mermaid
graph LR
    APP[App.tsx] --> NAV[Navigation bar<br/>primary + More dropdown]

    NAV --> T1[Efficiency<br/>heat table · context growth<br/>token usage per session]
    NAV --> T2[Cost<br/>30-day history chart<br/>per-session cost table]
    NAV --> T3[Traces<br/>lazy timeline · blob expand]
    NAV --> T4[Search<br/>text · date · sort filters<br/>paginated DB results]
    NAV --> T5[Recommendations<br/>loop signals · efficiency insights]
    NAV --> T6[Agents · Tools · Files<br/>More dropdown]
    NAV --> T7[Flow<br/>LLM turn graph · lazy timelines]
    NAV --> T8[Alerts · Automation<br/>More dropdown]
    NAV --> T9[Export · Help<br/>More dropdown]
```

### DashboardPanel ↔ Webview message protocol

```mermaid
sequenceDiagram
    participant EXT as DashboardPanel (Node)
    participant WV  as Webview (Preact)

    Note over EXT,WV: Initial load
    EXT->>WV: HTML with window.__INITIAL_SESSION_SUMMARY__<br/>window.__INITIAL_TOOL_CALLS__

    Note over EXT,WV: Live updates (onUpdate + 10s heartbeat)
    EXT->>WV: {type:'update', summary, sessionSummary,<br/>analyticsData:{dailyStats,lifetimeStats},<br/>burnRate:{sessionId,burnRate,projection}}

    Note over EXT,WV: Lazy timeline loading
    WV->>EXT: {type:'loadSessionDetail', sessionId}
    EXT->>WV: {type:'sessionDetail', sessionId, timeline}

    Note over EXT,WV: Lazy blob loading
    WV->>EXT: {type:'loadBlob', spanId, field, editIndex?}
    EXT->>WV: {type:'blobContent', spanId, field, content}

    Note over EXT,WV: Session search
    WV->>EXT: {type:'searchSessions', query:SearchQuery}
    EXT->>WV: {type:'searchResults', sessions, totalCount, offset}

    Note over EXT,WV: UI actions
    WV->>EXT: {type:'clearAll'}
    WV->>EXT: {type:'askAI', prompt, agent}
    WV->>EXT: {type:'openFile', filePath}
    WV->>EXT: {type:'agentFilterChanged', value}
    WV->>EXT: {type:'exportSessionData'}
    WV->>EXT: {type:'openSidebar' | 'closeSidebar'}
    WV->>EXT: {type:'automation', ...}
    WV->>EXT: {type:'alert', label, detail, severity}
```

---

## 10. Cost Calculation

Cost is computed in two places:

1. **Extension host** (`src/pricing.ts`) — at write time; `cost_usd` is stored in the `sessions` row and used for all aggregate queries (`SUM(cost_usd)`, `queryDailyStats`, `queryBurnRate`).
2. **Browser** (`media/src/pricing.ts`) — at display time; per-turn cost shown in the Cost tab and Flow tooltip. The two rate tables are kept in sync manually.

```mermaid
flowchart TD
    subgraph Extension host — write time
        CARD[SessionSummaryCard] --> PRI_EXT[src/pricing.ts<br/>calcTokenCostUsd]
        PRI_EXT --> DB_COST[sessions.cost_usd<br/>stored in SQLite]
    end

    subgraph Browser — display time
        ENTRY[TimelineEntry<br/>model · tokens] --> LR[lookupRates<br/>normalise + prefix match]
        LR --> RATES{Rates found?}
        RATES -- no  --> ZERO[cost=0, modelUnknown=true]
        RATES -- yes --> MODE{PricingMode}
        MODE -- token --> TC[calcTokenCost<br/>input/cacheRead/cacheWrite/output<br/>× per-MTok rate ÷ 1,000,000]
        MODE -- request --> RC[calcRequestCost<br/>turns × multiplier × $0.04]
        MODE -- request-annual --> RA[calcRequestCost<br/>turns × multiplierAnnualPostJun1 × $0.04]
        TC --> ENTRY_COST[calcEntryCost → Flow tooltip]
        TC --> SESS_COST[calcSessionCost → Cost tab table]
        RC --> SESS_COST
        RA --> SESS_COST
    end

    subgraph Analytics — query time
        DB_COST --> AGG[queryDailyStats<br/>SUM cost_usd GROUP BY day]
        DB_COST --> LIFE[queryLifetimeStats<br/>SUM cost_usd]
        DB_COST --> BURN[queryBurnRate<br/>tokensPerMinute × costPerToken × 60]
    end
```

`contextWindowTokens` (stored in `src/pricing.ts`) enables the `Projection` calculation: given current session token usage and burn rate, estimate time to context exhaustion and final cost.

Pricing data covers: OpenAI (GPT-4.1 through GPT-5.5), Anthropic (Claude Haiku/Sonnet/Opus 4.x), Google (Gemini 2.5–3.5), Codex, and fine-tuned models. Last updated: 2026-05-28.

---

## 11. Auto-Configuration

When the extension activates it attempts to configure each agent automatically.

```mermaid
flowchart TD
    ACT[Extension activate] --> PAR[Run in parallel]

    PAR --> CP_CFG[autoConfigureCopilot<br/>VSCode global settings API]
    PAR --> CC_CFG[autoConfigureClaudeCode<br/>~/.claude/settings.json]
    PAR --> CX_CFG[autoConfigureCodex<br/>~/.codex/config.toml]

    CP_CFG --> CP_KEYS["github.copilot.chat.otel.enabled = true<br/>exporterType = 'otlp-http'<br/>otlpEndpoint = http://localhost:{port}"]
    CP_KEYS --> CP_OUT{Changed?}
    CP_OUT -- yes --> RELOAD[Show 'Reload VSCode' prompt]

    CC_CFG --> CC_KEYS["env block:<br/>CLAUDE_CODE_ENABLE_TELEMETRY=1<br/>OTEL_TRACES_EXPORTER=otlp<br/>OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:{port}<br/>OTELlog flags for tool details + user prompts<br/><br/>Stop hook → pending-prompt.txt"]

    CX_CFG --> CX_KEYS["[otel]<br/>log_user_prompt = true<br/>exporter = {otlp-http = {endpoint=...}}<br/>trace_exporter = {otlp-http = {endpoint=...}}"]

    CC_KEYS --> RESTART[Requires Claude Code restart]
    CX_KEYS --> RESTART
```

---

## 12. Build Pipeline

Four independent esbuild targets produce four output bundles.

```mermaid
graph LR
    subgraph Source
        SRC_EXT[src/extension.ts<br/>+ src/**/*.ts]
        SRC_DASH[media/src/dashboard.tsx<br/>+ media/src/**]
        SRC_SB[media/src/sidebarWebview.ts]
        SRC_SA[standalone/server.ts]
    end

    subgraph esbuild targets
        B1[Extension bundle<br/>format: cjs · platform: node<br/>external: vscode, sql.js]
        B2[Dashboard bundle<br/>format: iife · platform: browser<br/>jsx: preact/jsx-runtime]
        B3[Sidebar bundle<br/>format: iife · platform: browser]
        B4[Standalone bundle<br/>format: cjs · platform: node]
    end

    subgraph Outputs
        O1[dist/extension.js<br/>dist/sql-wasm.wasm]
        O2[media/dashboard.js]
        O3[media/sidebar.js]
        O4[standalone/server.js]
    end

    SRC_EXT --> B1 --> O1
    SRC_DASH --> B2 --> O2
    SRC_SB --> B3 --> O3
    SRC_SA --> B4 --> O4
```

`sql.js` is loaded dynamically at runtime (not bundled) to keep the extension bundle small. The WASM binary is copied to `dist/sql-wasm.wasm` during the build and located via `extensionUri` at activation.

### Type-check vs bundle

```mermaid
graph LR
    TSC1["tsc --noEmit<br/>tsconfig.json — checks src/"] --> TC_ONLY[Type errors only<br/>No output]
    TSC2["tsc --noEmit -p media/tsconfig.json<br/>checks media/src/"] --> TC_ONLY
    ESB[esbuild.js] --> BUNDLES[Bundles output<br/>No type checking]
    TC_ONLY & BUNDLES --> CI["pnpm run compile<br/>passes only when both succeed"]
```

---

## File Map

```text
agentlens/
├── src/
│   ├── extension.ts              # Activation, commands, panels, status bar, retention
│   ├── otlpCollector.ts          # HTTP server, Codex session synthesis
│   ├── otlpParser.ts             # Pure parsing (tests/standalone)
│   ├── sessionStore.ts           # 5-min rolling span window, onUpdate callbacks
│   ├── sessionRepository.ts      # Merges DB + live window; single session data access point
│   ├── spanSummarizer.ts         # Orchestrates per-agent builders
│   ├── pricing.ts                # Extension-host pricing: lookupRates, calcTokenCostUsd
│   ├── sidebarPanel.ts           # Sidebar webview
│   ├── dashboardPanel.ts         # Full dashboard webview, message protocol
│   ├── autoConfig.ts             # Copilot VS Code settings
│   ├── autoConfigNode.ts         # Claude/Codex file-based config
│   ├── exportData.ts             # JSON export helpers
│   ├── loopDetector.ts           # Loop signal detection
│   ├── types.ts                  # Shared extension-host types
│   ├── database/
│   │   ├── schema.ts             # SCHEMA_SQL — CREATE TABLE statements + indexes
│   │   ├── db.ts                 # AgentLensDb — open, migrate, save, dispose
│   │   ├── writer.ts             # DatabaseWriter — enqueue/drain, blob writes, cost_usd
│   │   ├── reader.ts             # DatabaseReader — list, search, analytics, burn rate, blobs
│   │   ├── migration.ts          # migrateGlobalStateToSqlite (one-time)
│   │   ├── retention.ts          # runRetention — DELETE old sessions + blob eviction
│   │   └── types.ts              # Shared DB types
│   ├── summarizers/
│   │   ├── claude.ts             # Claude Code session builder
│   │   ├── copilot.ts            # Copilot session builder
│   │   ├── codex.ts              # Codex session builder
│   │   ├── helpers.ts            # Shared attribute/token extraction
│   │   └── summarizerTypes.ts    # SessionSummaryCard, TimelineEntry, etc.
│   └── test/
│       ├── sessionStore.test.ts
│       ├── database/
│       │   ├── writer.test.ts
│       │   ├── reader.test.ts
│       │   ├── reader.analytics.test.ts
│       │   ├── migration.test.ts
│       │   ├── retention.test.ts
│       │   └── sessionRepository.test.ts
│       └── pricing.test.ts
├── media/
│   ├── src/
│   │   ├── App.tsx               # Preact root, message handler, tab router
│   │   ├── state.ts              # All signals: sessions, timelines, blobs, analytics, search
│   │   ├── types.ts              # Frontend types mirroring backend + analytics types
│   │   ├── pricing.ts            # Browser pricing: rate table, lookupRates, calcTokenCost
│   │   ├── sessionMetrics.ts     # calcSessionCost, calcEntryCost, fmtUsd
│   │   ├── utils.ts              # Formatting, span helpers, agent colors
│   │   ├── agentProfiles.ts      # Per-agent alert thresholds
│   │   ├── sidebarWebview.ts     # Sidebar JS (no JSX)
│   │   └── tabs/
│   │       ├── Efficiency.tsx    # Heat table, context growth chart, token usage chart
│   │       ├── Cost.tsx          # 30-day history chart, per-session cost table
│   │       ├── Traces.tsx        # Lazy timeline, blob expand
│   │       ├── SessionSearch.tsx # Text/date/sort search, paginated DB results
│   │       ├── Flow.tsx          # LLM turn graph (canvas), lazy timeline loading
│   │       ├── Recommendations.tsx
│   │       ├── Agents.tsx
│   │       ├── Tools.tsx
│   │       ├── Files.tsx
│   │       ├── Alerts.tsx
│   │       ├── Automation.tsx
│   │       ├── Export.tsx
│   │       ├── Help.tsx
│   │       └── Timeline.tsx      # Shared timeline rendering component
│   ├── dashboard.js              # Compiled Preact bundle
│   ├── dashboard.css             # Compiled styles
│   └── sidebar.js                # Compiled sidebar script
├── standalone/
│   └── server.ts                 # Standalone HTTP server (no VS Code)
├── esbuild.js                    # Build configuration (4 targets)
├── package.json                  # VS Code manifest + scripts
└── ARCHITECTURE.md               # This file
```
