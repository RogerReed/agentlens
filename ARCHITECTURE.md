# AgentLens Architecture

AgentLens is a VSCode extension that receives OpenTelemetry (OTLP) telemetry from AI coding agents (GitHub Copilot, Claude Code, Codex), summarizes it into per-session cards, and visualises it in a sidebar and a full dashboard.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Extension Activation](#2-extension-activation)
3. [Data Ingestion Pipeline](#3-data-ingestion-pipeline)
4. [OTLP Collector](#4-otlp-collector)
5. [Session Summarizer](#5-session-summarizer)
6. [Per-Agent Summarizers](#6-per-agent-summarizers)
7. [Session Data Model](#7-session-data-model)
8. [Frontend Architecture](#8-frontend-architecture)
9. [Cost Calculation](#9-cost-calculation)
10. [Auto-Configuration](#10-auto-configuration)
11. [Build Pipeline](#11-build-pipeline)

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
        STO[SessionStore<br/>in-memory + globalState]
        SUM[SpanSummarizer]
        SID[SidebarPanel<br/>webview]
        DASH[DashboardPanel<br/>webview]
    end

    subgraph Dashboard UI
        STATE[Preact Signals<br/>state.ts]
        TABS[16 Tab Components<br/>Cost · Traces · Flow · Summaries…]
    end

    CP -- "POST /v1/traces" --> COL
    CC -- "POST /v1/traces<br/>POST /v1/logs" --> COL
    CX -- "POST /v1/logs" --> COL

    COL -- addSpan --> STO
    STO -- onUpdate --> SID
    STO -- onUpdate --> DASH

    SID -- postMessage --> SID_WV[Sidebar Webview]
    DASH -- summarizeSpans --> SUM
    SUM --> DASH
    DASH -- "window.__INITIAL_*<br/>postMessage update" --> STATE
    STATE --> TABS
```

---

## 2. Extension Activation

The extension activates in a fixed sequence. Each step is a prerequisite for the next.

```mermaid
sequenceDiagram
    participant VS as VSCode
    participant EXT as extension.ts
    participant STO as SessionStore
    participant COL as OtlpCollector
    participant CFG as autoConfig
    participant SID as SidebarPanel
    participant DASH as DashboardPanel

    VS->>EXT: activate(context)
    EXT->>EXT: createOutputChannel('AgentLens')
    EXT->>STO: new SessionStore(context)<br/>loads globalState spans
    EXT->>COL: new OtlpCollector(port, store)
    EXT->>COL: collector.start()
    alt Port free
        COL-->>EXT: listening on :4318
    else EADDRINUSE
        COL-->>EXT: error — detect owner<br/>(plugin/standalone/foreign)
        EXT->>STO: poll globalState every 2s (fallback)
    end
    par Auto-configure agents
        EXT->>CFG: autoConfigureCopilot(port)
        EXT->>CFG: autoConfigureClaudeCode(port)
        EXT->>CFG: autoConfigureCodex(port)
    end
    EXT->>SID: registerWebviewViewProvider('agentLens.dashboard')
    EXT->>VS: registerCommand('agentLens.openDashboard')<br/>registerCommand('agentLens.clearSessions')<br/>registerCommand('agentLens.exportData')<br/>registerCommand('agentLens.dumpSpanAttrs')
    EXT->>VS: createStatusBarItem → 'agentLens.openDashboard'
    VS->>SID: resolveWebviewView() [when sidebar opened]
    SID->>DASH: executeCommand('agentLens.openDashboard')
    DASH->>STO: onUpdate(debounce 300ms + 10s heartbeat)
    SID->>STO: onUpdate(debounce 300ms + 5s heartbeat)
```

---

## 3. Data Ingestion Pipeline

Spans travel from agent process → HTTP → collector → store → summarizer → UI.

```mermaid
flowchart TD
    A[Agent emits OTLP payload\nHTTP POST /v1/traces or /v1/logs] --> B{Route}

    B -- /v1/traces --> T[processTraces\nExtract resourceSpans → spans]
    B -- /v1/logs  --> L[processLogs\nExtract logRecords → spans]
    B -- /v1/metrics --> M[processMetrics\ncount only]

    T --> NS{Is Codex?}
    NS -- yes --> CS[Synthesise session ID\nMap OTEL trace → codex:conversation:turn\nSet parentSpanId to root]
    NS -- no  --> DS[Direct span\npreserve traceId + parentSpanId]

    L --> LS[Codex log reconstruction\nPrompt events → session boundary\nSynthesise traceId from conversation+turn]

    CS --> ADD[store.addSpan]
    DS --> ADD
    LS --> ADD

    ADD --> UPD[updateSummary\nIncrement heuristic counters]
    ADD --> PER[Persist to\ncontext.globalState]
    ADD --> CB[Fire onUpdate callbacks]

    CB --> SID_CB[SidebarPanel\n300ms debounce + 5s heartbeat]
    CB --> DSH_CB[DashboardPanel\n300ms debounce + 10s heartbeat]

    SID_CB --> SID_R[sidebar.refresh\nCompute metrics → postMessage]
    DSH_CB --> DSH_U[dashboard.update\nsummarizeSpans → postMessage]
```

---

## 4. OTLP Collector

The collector is a minimal HTTP/1.1 server (Node `http` module) that handles three routes and maintains stateful session reconstruction for Codex.

```mermaid
graph LR
    subgraph HTTP Routes
        R1["GET /agentlens/plugin\n→ {agentlens:true, kind:'plugin'}"]
        R2["POST /v1/traces\nmax body: 50 MB"]
        R3["POST /v1/logs\nmax body: 50 MB"]
        R4["POST /v1/metrics"]
    end

    subgraph Codex Session State
        S1[codexFallbackTraceId\nresets after 30s inactivity]
        S2[codexSessionByOtelTraceId\nOTEL trace → session ID]
        S3[codexCurrentSessionByConversation\nconversation ID → active session]
        S4[codexSessionRootByTrace\ntrace ID → root span]
    end

    subgraph Span Output
        SP[Span\ntraceId · spanId · parentSpanId\nname · startTime · endTime\nattributes · status]
    end

    R2 --> PT[parseTraces\nresourceSpans→spans]
    R3 --> PL[parseLogs\nlogRecords→spans]

    PT -- Codex spans\nthread.id / turn.id attrs --> S1
    PT -- Codex spans --> S2
    PT -- Codex spans --> S3
    PL -- codex.user_prompt\nprompt boundary --> S3
    PL -- non-prompt events --> S4

    PT --> SP
    PL --> SP
    R4 --> |counts only| SP
```

**Key non-obvious behaviour:** Codex session IDs (`codex:{conversationId}:{turnId}`) are assigned on arrival. If spans arrive out of order or are retried, the session mapping is immutable once set.

---

## 5. Session Summarizer

`summarizeSpans()` is called on every dashboard update. It groups raw spans into agent-session cards and computes cross-session efficiency metrics.

```mermaid
flowchart TD
    IN[spans: Span\[\]] --> GRP[Group spans by traceId\nBuild parentSpanId → children map]

    GRP --> CP_FIND[Find invoke_agent spans\nCopilot roots]
    GRP --> CC_FIND[Find claude_code.interaction spans\nClaude roots]
    GRP --> CX_FIND[Group by codex session ID\nCodex roots]

    CP_FIND --> CP_SYN{Missing parents?}
    CP_SYN -- yes --> CP_SYNTH[Synthesise invoke_agent root\nfor orphan chat/execute_tool spans]
    CP_SYN -- no --> CP_B
    CP_SYNTH --> CP_B[buildCopilotSessions]

    CC_FIND --> CC_SYN{Missing interaction?}
    CC_SYN -- yes --> CC_SYNTH[Synthesise claude_code.interaction\nfor orphan llm_request/tool spans]
    CC_SYN -- no --> CC_B
    CC_SYNTH --> CC_B[buildClaudeSessions]

    CX_FIND --> CX_B[buildCodexSessions]

    CP_B --> SESSIONS[SessionSummaryCard\[\]]
    CC_B --> SESSIONS
    CX_B --> SESSIONS

    SESSIONS --> LOOP[detectLoopSignals\nper session]
    SESSIONS --> BG[Background spans\norphans not in any session]
    SESSIONS --> EFF[EfficiencyReport\ntoken totals · TTFT · cache hit rate\ntool def waste · top consumers]

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
        CP_ROOT[invoke_agent span\nroot of session]
        CP_LLM[chat gpt-4.1 span\ntype: llm\ntokens · model · TTFT\noutput messages JSON]
        CP_TOOL[execute_tool span\ntype: tool\ngen_ai.tool.name\ngen_ai.tool.call.arguments\ngen_ai.tool.call.result]
        CP_ROOT --> CP_LLM
        CP_ROOT --> CP_TOOL
    end

    subgraph Claude — buildClaudeSessions
        CC_ROOT[claude_code.interaction\nroot — may be synthetic]
        CC_LLM[claude_code.llm_request\ntype: llm\ninput/output/cache tokens\nttft_ms · stop_reason\ngen_ai.output.messages → edit details]
        CC_TOOL[claude_code.tool\ntype: tool\ntool_name · file_path\nfull_command / tool_input]
        CC_BLK[claude_code.tool.blocked_on_user\nchild of tool\ndecision · source]
        CC_ROOT --> CC_LLM
        CC_ROOT --> CC_TOOL
        CC_TOOL --> CC_BLK
    end

    subgraph Codex — buildCodexSessions
        CX_PROMPT[codex.user_prompt\nsession boundary]
        CX_LLM[codex.sse_event / codex.completion\ntype: llm\ntoken counts]
        CX_TTFT[codex.turn_ttft\nttft → next LLM entry]
        CX_TOOL[exec_command / apply_patch\ntype: tool\nresolved from codex.tool_decision]
        CX_PROMPT --> CX_LLM
        CX_LLM --- CX_TTFT
        CX_PROMPT --> CX_TOOL
    end

    CP_ROOT & CC_ROOT & CX_PROMPT --> CARD[SessionSummaryCard\nsource · model · turns\ntokens · cacheHitRate\ntimeline: TimelineEntry\[\]\nfilesRead/Changed/Searched\ntoolCounts · errors · outcome]
```

---

## 7. Session Data Model

```mermaid
classDiagram
    class Span {
        +traceId: string
        +spanId: string
        +parentSpanId?: string
        +name: string
        +startTime: string
        +endTime: string
        +attributes: SpanAttribute[]
        +status?: SpanStatus
        +receivedAt?: number
    }

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
        +editDetails?: EditDetail[]
    }

    class EditDetail {
        +filePath: string
        +oldString?: string
        +newString?: string
        +content?: string
        +toolName?: string
    }

    class FullSummary {
        +sessions: SessionSummaryCard[]
        +backgroundSpans: BackgroundSpanSummary[]
        +efficiency: EfficiencyReport
    }

    class EfficiencyReport {
        +totalInputTokens: number
        +totalOutputTokens: number
        +totalLlmCalls: number
        +avgInputPerCall: number
        +avgTtft: number
        +cacheHitRate: number
        +toolDefWaste: number
        +sysInstructionWaste: number
        +topTokenConsumers: object[]
    }

    Span "many" --> "1" SessionSummaryCard : summarised into
    SessionSummaryCard "1" *-- "many" TimelineEntry
    TimelineEntry "1" *-- "many" EditDetail
    FullSummary "1" *-- "many" SessionSummaryCard
    FullSummary "1" *-- "1" EfficiencyReport
```

---

## 8. Frontend Architecture

The dashboard is a Preact application bundled into `media/dashboard.js`. It uses `@preact/signals` for reactive state — no Redux, no Context, no prop drilling.

### Signal graph

```mermaid
graph TD
    subgraph Core data — set by DashboardPanel
        SIG_SPANS[spans\nSignal&lt;Span[]&gt;]
        SIG_SUM[sessionSummary\nSignal&lt;FullSummary | null&gt;]
        SIG_TOOLS[toolCalls\nSignal&lt;Record&gt;]
    end

    subgraph UI controls
        SIG_LIM[sessionLimit\nSignal&lt;number&gt; = 10]
        SIG_AGT[selectedAgentFilter\nSignal&lt;AgentFilter&gt; = all]
        SIG_TAB[activeTab\nSignal&lt;string&gt; = efficiency]
    end

    subgraph Computed — auto-update when inputs change
        COMP_FILT[agentFilteredSessions\ncomputed — filter by source]
        COMP_DISP[displaySessions\ncomputed — last N sessions]
        COMP_SPANS[displaySpans\ncomputed — spans for displayed sessions]
        COMP_PRES[agentPresence\ncomputed — which agents are active]
    end

    SIG_SUM --> COMP_FILT
    SIG_AGT --> COMP_FILT
    COMP_FILT --> COMP_DISP
    SIG_LIM --> COMP_DISP
    COMP_DISP --> COMP_SPANS
    SIG_SPANS --> COMP_SPANS
    COMP_DISP --> COMP_PRES

    COMP_DISP --> TAB_COMPS[Tab components\nCost · Tokens · Efficiency\nSummaries · Flow · Traces\nErrors · Alerts · …]
    COMP_SPANS --> TAB_COMPS
    SIG_TAB --> TAB_COMPS
```

### Tab component overview

```mermaid
graph LR
    APP[App.tsx] --> NAV[Navigation bar\nactiveTab signal]
    NAV --> T1[Efficiency]
    NAV --> T2[Summaries\nwaterfall timeline]
    NAV --> T3[Cost\nbar chart · USD/Credits]
    NAV --> T4[Tokens\nstacked bar per session]
    NAV --> T5[Traces\nwaterfall + span tree]
    NAV --> T6[Flow\nLLM turn graph · canvas]
    NAV --> T7[Agents · Tools · Files]
    NAV --> T8[Latency · Errors · Alerts]
    NAV --> T9[Recommendations\nAI chat integration]
    NAV --> T10[Automation · Export · Help]
```

### DashboardPanel ↔ Webview message protocol

```mermaid
sequenceDiagram
    participant EXT as DashboardPanel (Node)
    participant WV  as Webview (Preact)

    Note over EXT,WV: Initial load
    EXT->>WV: HTML with window.__INITIAL_SPANS__<br/>window.__INITIAL_SESSION_SUMMARY__<br/>window.__INITIAL_TOOL_CALLS__

    Note over EXT,WV: Live updates (onUpdate callback)
    EXT->>WV: postMessage {type:'update', spans, summary, sessionSummary}
    WV->>EXT: postMessage {type:'clearAll'}
    WV->>EXT: postMessage {type:'askAI', prompt}
    WV->>EXT: postMessage {type:'openFile', path}
    WV->>EXT: postMessage {type:'agentFilterChanged', value}
    WV->>EXT: postMessage {type:'exportSessionData'}
    WV->>EXT: postMessage {type:'openSidebar' | 'closeSidebar'}
    WV->>EXT: postMessage {type:'automation', content}
```

---

## 9. Cost Calculation

Cost is calculated entirely in the browser using a local pricing table. No network calls are made for pricing.

```mermaid
flowchart TD
    ENTRY[TimelineEntry\nmodel · inputTokens · outputTokens] --> LR[lookupRates model\nNormalise model ID\nstrip date suffix · prefix match]

    LR --> RATES{Rates found?}
    RATES -- no  --> ZERO[cost = 0\nmodelUnknown = true]
    RATES -- yes --> MODE{PricingMode}

    MODE -- token\nClaude/Codex always\nCopilot from Jun 2026 --> TC[calcTokenCost\ninput × inputPerMTok\ncacheRead × cacheReadPerMTok\ncacheWrite × cacheWritePerMTok\noutput × outputPerMTok\n÷ 1,000,000]

    MODE -- request\npre-Jun 2026 Copilot --> RC[calcRequestCost\nturns × multiplier × $0.04]

    MODE -- request-annual\nannual plan post-Jun 2026 --> RA[calcRequestCost\nturns × multiplierAnnualPostJun1 × $0.04]

    TC --> ENTRY_COST[calcEntryCost\ncost per TimelineEntry]
    TC --> SESS_COST[calcSessionCost\ncumulative byTurn array\ntotalUsd · aiCredits]
    RC --> SESS_COST
    RA --> SESS_COST

    ENTRY_COST --> SUMM_UI[Summaries tab\n~$X.XX in row + expanded detail]
    ENTRY_COST --> FLOW_UI[Flow tab\ntooltip Cost line]
    SESS_COST --> COST_UI[Cost tab\nbar chart · session total]
```

Pricing data (`media/src/pricing.ts`) covers: OpenAI (GPT-4.1 through GPT-5.5), Anthropic (Claude Haiku/Sonnet/Opus 4.x), Google (Gemini), Codex, and fine-tuned models. Last updated 2026-05-28.

---

## 10. Auto-Configuration

When the extension activates it attempts to configure each agent automatically. The methods differ because each agent reads its config differently.

```mermaid
flowchart TD
    ACT[Extension activate] --> PAR[Run in parallel]

    PAR --> CP_CFG[autoConfigureCopilot\nVSCode global settings API]
    PAR --> CC_CFG[autoConfigureClaudeCode\n~/.claude/settings.json]
    PAR --> CX_CFG[autoConfigureCodex\n~/.codex/config.toml]

    CP_CFG --> CP_KEYS["github.copilot.chat.otel.enabled = true\nexporterType = 'otlp-http'\notlpEndpoint = http://localhost:{port}"]
    CP_KEYS --> CP_OUT{Changed?}
    CP_OUT -- yes --> RELOAD[Show 'Reload VSCode' prompt]

    CC_CFG --> CC_KEYS["env block:\nCLAUDE_CODE_ENABLE_TELEMETRY=1\nCLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1\nOTEL_TRACES_EXPORTER=otlp\nOTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:{port}\nOTEL_LOG_TOOL_DETAILS=1\nOTEL_LOG_TOOL_CONTENT=1\nOTEL_LOG_USER_PROMPTS=1\n\nStop hook → pending-prompt.txt"]

    CX_CFG --> CX_KEYS["[otel]\nlog_user_prompt = true\nexporter = {otlp-http = {endpoint=...}}\ntrace_exporter = {otlp-http = {endpoint=...}}"]

    CC_KEYS --> RESTART[Requires Claude Code restart]
    CX_KEYS --> RESTART
```

---

## 11. Build Pipeline

Four independent esbuild targets produce four output bundles.

```mermaid
graph LR
    subgraph Source
        SRC_EXT[src/extension.ts\n+ src/*.ts]
        SRC_DASH[media/src/dashboard.tsx\n+ media/src/**]
        SRC_SB[media/src/sidebarWebview.ts]
        SRC_SA[standalone/server.ts]
    end

    subgraph esbuild targets
        B1[Extension bundle\nformat: cjs\nplatform: node\nexternal: vscode]
        B2[Dashboard bundle\nformat: iife\nplatform: browser\njsx: preact/jsx-runtime]
        B3[Sidebar bundle\nformat: iife\nplatform: browser\nno JSX]
        B4[Standalone bundle\nformat: cjs\nplatform: node]
    end

    subgraph Outputs
        O1[dist/extension.js]
        O2[media/dashboard.js\nmedia/dashboard.css]
        O3[media/sidebar.js]
        O4[standalone/server.js]
    end

    SRC_EXT --> B1 --> O1
    SRC_DASH --> B2 --> O2
    SRC_SB --> B3 --> O3
    SRC_SA --> B4 --> O4

    subgraph Scripts
        S1["npm run compile\ntsc --noEmit\neslint\nesbuild"]
        S2["npm run watch\n4 esbuild contexts\nincremental + sourcemaps"]
        S3["npm run package\nminified production build"]
    end
```

### Type-check vs bundle

```mermaid
graph LR
    TSC1["tsc --noEmit\ntsconfig.json\nChecks src/"] --> TC_ONLY[Type errors only\nNo output]
    TSC2["tsc --noEmit -p media/tsconfig.json\nChecks media/src/"] --> TC_ONLY
    ESB[esbuild.js] --> BUNDLES[Bundles output\nNo type checking]
    TC_ONLY & BUNDLES --> CI["npm run compile\npasses only when both succeed"]
```

---

## File Map

```
agentlens/
├── src/
│   ├── extension.ts          # Activation, commands, panels, status bar
│   ├── otlpCollector.ts      # HTTP server, Codex session synthesis
│   ├── otlpParser.ts         # Pure parsing (tests/standalone)
│   ├── sessionStore.ts       # Span storage, persistence, callbacks
│   ├── spanSummarizer.ts     # Orchestrates per-agent builders
│   ├── sidebarPanel.ts       # Sidebar webview
│   ├── dashboardPanel.ts     # Full dashboard webview
│   ├── autoConfig.ts         # Copilot VSCode settings
│   ├── autoConfigNode.ts     # Claude/Codex file-based config
│   ├── exportData.ts         # JSON export helpers
│   └── summarizers/
│       ├── claude.ts         # Claude Code session builder
│       ├── copilot.ts        # Copilot session builder
│       ├── codex.ts          # Codex session builder
│       ├── helpers.ts        # Shared attribute/token extraction
│       └── summarizerTypes.ts# Shared TypeScript interfaces
├── media/
│   ├── src/
│   │   ├── App.tsx           # Preact root
│   │   ├── dashboard.tsx     # Tab container + routing
│   │   ├── state.ts          # All signals + computed values
│   │   ├── types.ts          # Frontend type definitions
│   │   ├── pricing.ts        # Model rate table
│   │   ├── sessionMetrics.ts # Cost + efficiency calculations
│   │   ├── utils.ts          # Formatting, span helpers
│   │   ├── agentProfiles.ts  # Per-agent thresholds
│   │   ├── sidebarWebview.ts # Sidebar JS (no JSX)
│   │   └── tabs/
│   │       ├── Cost.tsx      Tokens.tsx  Efficiency.tsx
│   │       ├── Summaries.tsx Traces.tsx  Flow.tsx
│   │       ├── Agents.tsx    Tools.tsx   Files.tsx
│   │       ├── Latency.tsx   Errors.tsx  Alerts.tsx
│   │       ├── Recommendations.tsx       Timeline.tsx
│   │       └── Automation.tsx Export.tsx Help.tsx
│   ├── dashboard.js          # Compiled Preact bundle
│   ├── dashboard.css         # Compiled styles
│   └── sidebar.js            # Compiled sidebar script
├── standalone/
│   └── server.ts             # Standalone HTTP server (no VSCode)
├── esbuild.js                # Build configuration
├── package.json              # VSCode manifest + scripts
└── ARCHITECTURE.md           # This file
```
