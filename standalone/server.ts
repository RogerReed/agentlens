/**
 * AgentLens standalone server — runs the dashboard outside VS Code.
 *
 * Two HTTP servers:
 *   OTLP_PORT (default 4318) — receives OTLP traces/logs from agents
 *   UI_PORT   (default 3000) — serves the dashboard and SSE update stream
 */

import * as http from 'http'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { summarizeSpans } from '../src/spanSummarizer'
import { autoConfigureClaudeCode, autoConfigureCodex, autoConfigureCopilotStandalone } from '../src/autoConfigNode'
import { classifyOtlpPayload } from '../src/otlpParser'
import type { Span } from '../src/types'

const OTLP_PORT  = parseInt(process.env.OTLP_PORT  ?? '4318')
const UI_PORT    = parseInt(process.env.UI_PORT    ?? '3000')
const BIND_HOST  = process.env.BIND_HOST ?? '127.0.0.1'

const mediaDir  = path.join(__dirname, '..', 'media')
const DATA_DIR  = process.env.DATA_DIR ?? path.join(os.homedir(), '.agentlens')
const DATA_FILE = path.join(DATA_DIR, 'spans.json')

// ── Span store with file persistence ─────────────────────────────────────────

let spans: Span[] = []
let sseClients: http.ServerResponse[] = []

// Load persisted spans on startup
try {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8')
    spans = JSON.parse(raw) as Span[]
    console.log(`[AgentLens] Loaded ${spans.length} spans from ${DATA_FILE}`)
  }
} catch (e) {
  console.warn('[AgentLens] Could not load persisted data:', e)
}

// Debounced save — writes at most once per second under continuous ingestion
let saveTimer: ReturnType<typeof setTimeout> | null = null
function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    try { fs.writeFileSync(DATA_FILE, JSON.stringify(spans)) } catch (e) {
      console.warn('[AgentLens] Could not save data:', e)
    }
  }, 1000)
}

function addSpan(span: Span) {
  if (span.receivedAt === undefined) span.receivedAt = Date.now()
  spans.push(span)
}

// ── OTLP parsing ──────────────────────────────────────────────────────────────

type RawAttr = { key: string; value: Record<string, unknown> }

function toAttrs(raw: unknown): RawAttr[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((a): a is RawAttr => {
    const o = a as Record<string, unknown>
    return typeof o.key === 'string' && typeof o.value === 'object' && o.value !== null
  })
}

function attrStr(attrs: RawAttr[], ...keys: string[]): string {
  for (const key of keys) {
    const a = attrs.find(x => x.key === key)
    if (!a) continue
    const v = a.value
    const s = v.stringValue ?? v.intValue ?? v.doubleValue
    if (s != null) return String(s)
  }
  return ''
}

function isCodexWebsocketSpanName(name: string): boolean {
  const lower = name.toLowerCase()
  return lower.startsWith('codex.') && lower.includes('websocket')
}

function isCodexWebsocketTraceSpan(name: string, attrs: RawAttr[]): boolean {
  const lower = name.toLowerCase()
  if (!lower.includes('websocket')) return false
  const eventName = attrStr(attrs, 'event.name', 'event_name', 'name', 'event').toLowerCase()
  const hasCodexAttr = Boolean(attrStr(attrs, 'codex.session.id', 'codex.conversation.id', 'codex.turn.id'))
  return lower.startsWith('codex.') || eventName.startsWith('codex.') || hasCodexAttr
}

function attrsFromBodyKv(body: unknown): RawAttr[] {
  if (typeof body !== 'object' || body === null) return []
  const obj = body as Record<string, unknown>
  const kv = obj.kvlistValue as Record<string, unknown> | undefined
  const values = kv?.values
  if (!Array.isArray(values)) return []
  const attrs: RawAttr[] = []
  for (const value of values) {
    const entry = value as Record<string, unknown>
    const key = typeof entry.key === 'string' ? entry.key : ''
    const attrValue = entry.value as Record<string, unknown> | undefined
    if (!key || typeof attrValue !== 'object' || attrValue === null) continue
    attrs.push({ key, value: attrValue })
  }
  return attrs
}

function mergeAttrs(...lists: RawAttr[][]): RawAttr[] {
  const out: RawAttr[] = []
  const seen = new Set<string>()
  for (const list of lists) {
    for (const attr of list) {
      if (seen.has(attr.key)) continue
      seen.add(attr.key)
      out.push(attr)
    }
  }
  return out
}

function processTraces(payload: unknown, collectorPath = '/v1/traces'): number {
  const p = payload as { resourceSpans?: Array<{ scopeSpans?: Array<{ spans?: unknown[] }> }> }
  const rawSpans = p?.resourceSpans?.flatMap(rs =>
    rs.scopeSpans?.flatMap(ss => ss.spans ?? []) ?? []
  ) ?? []
  let n = 0
  for (const raw of rawSpans) {
    const s = raw as Record<string, unknown>
    if (typeof s.traceId !== 'string' || typeof s.spanId !== 'string' || typeof s.name !== 'string') continue
    let attrs = toAttrs(s.attributes)
    if (isCodexWebsocketTraceSpan(s.name, attrs)) continue
    attrs = [...attrs, { key: '_agentlens.collector_path', value: { stringValue: collectorPath } }]
    addSpan({
      traceId: s.traceId,
      spanId: s.spanId,
      parentSpanId: (s.parentSpanId as string) || undefined,
      name: s.name,
      startTime: s.startTimeUnixNano as string,
      endTime: s.endTimeUnixNano as string,
      attributes: attrs,
      status: s.status as { code: number; message?: string } | undefined,
    })
    n++
  }
  return n
}

function processLogs(payload: unknown, collectorPath = '/v1/logs'): number {
  type SL = { logRecords?: unknown[] }
  type RL = { scopeLogs?: SL[]; resource?: { attributes?: unknown } }
  const p = payload as { resourceLogs?: RL[] }
  const fallback = `codex-${Date.now()}`
  let n = 0
  for (const rl of p?.resourceLogs ?? []) {
    const resourceAttrs = toAttrs(rl.resource?.attributes)
    for (const sl of rl.scopeLogs ?? []) {
      const scopeAttrs = toAttrs((sl as { scope?: { attributes?: unknown } }).scope?.attributes)
      for (const rec of sl.logRecords ?? []) {
        const r = rec as Record<string, unknown>
        const attrs = mergeAttrs(toAttrs(r.attributes), attrsFromBodyKv(r.body), scopeAttrs, resourceAttrs)
        const name = attrStr(attrs, 'event.name', 'event_name', 'name', 'event')
        const logToolName = attrStr(attrs, 'tool.name')
        const isCodexEvent = name.startsWith('codex.')
        const isClaudeToolResult = name === 'tool_result' && logToolName !== ''
        if (!isCodexEvent && !isClaudeToolResult) continue
        if (isCodexEvent && isCodexWebsocketSpanName(name)) continue
        let traceId: string
        let spanName: string
        if (isClaudeToolResult) {
          traceId = (typeof r.traceId === 'string' && r.traceId)
            ? r.traceId
            : attrStr(attrs, 'session.id', 'session_id') || fallback
          spanName = 'claude_code.tool_result'
        } else {
          traceId = (typeof r.traceId === 'string' && r.traceId)
            ? r.traceId
            : attrStr(attrs, 'conversation.id', 'conversation_id', 'session.id', 'session_id') || fallback
          spanName = name
        }
        const spanId = (typeof r.spanId === 'string' && r.spanId)
          ? r.spanId
          : attrStr(attrs, 'span_id', 'spanId') || `cl-${Math.random().toString(36).slice(2, 10)}`
        let startTime = String(r.timeUnixNano ?? r.observedTimeUnixNano ?? '0')
        let endTime = startTime
        if (startTime === '0') {
          const timestamp = attrStr(attrs, 'event.timestamp')
          const ms = timestamp ? new Date(timestamp).getTime() : 0
          if (ms > 0) {
            const endNs = String(BigInt(ms) * BigInt(1_000_000))
            const durMs = parseInt(attrStr(attrs, 'duration_ms') || '0') || 0
            endTime = endNs
            startTime = durMs > 0
              ? String(BigInt(endNs) - BigInt(durMs) * BigInt(1_000_000))
              : endNs
          }
        }
        addSpan({ traceId, spanId, name: spanName, startTime, endTime, attributes: [...attrs, { key: '_agentlens.collector_path', value: { stringValue: collectorPath } }], status: undefined })
        n++
      }
    }
  }
  return n
}

// ── SSE push ──────────────────────────────────────────────────────────────────

function safeJson(data: unknown): string {
  return JSON.stringify(data)
    .replace(/<\//g, '<\\/')
    .replace(/<!--/g, '<\\!--')
    .replace(/\$\{/g, '\\${')
}

function computeSidebarData(summary: ReturnType<typeof summarizeSpans>, allSpans: Span[]) {
  const sessions = summary.sessions
  const sessionTraceIds = new Set(sessions.map(s => s.traceId).filter(Boolean))

  // Count in-progress Claude sessions: traces with llm_request/tool spans but no root session span
  const inProgressMap: Record<string, Span[]> = {}
  for (const span of allSpans) {
    if (!span.traceId || sessionTraceIds.has(span.traceId)) continue
    if (span.name !== 'claude_code.llm_request' && span.name !== 'claude_code.tool') continue
    if (!inProgressMap[span.traceId]) inProgressMap[span.traceId] = []
    inProgressMap[span.traceId].push(span)
  }
  const inProgressTraceIds = Object.keys(inProgressMap)
  let inProgressTurns = 0, inProgressInput = 0, inProgressOutput = 0
  const inProgressTokens: { session: number; tokens: number; inputTokens: number[]; outputTokens: number[] }[] = []
  for (const traceId of inProgressTraceIds) {
    const traceSpans = inProgressMap[traceId]
    const inputArr: number[] = [], outputArr: number[] = []
    for (const span of traceSpans) {
      if (span.name !== 'claude_code.llm_request') continue
      inProgressTurns++
      const getInt = (key: string) => {
        const a = (span.attributes ?? []).find((x: { key: string }) => x.key === key)
        return parseInt(String((a?.value as Record<string, unknown>)?.intValue ?? (a?.value as Record<string, unknown>)?.stringValue ?? 0)) || 0
      }
      const inp = getInt('input_tokens') + getInt('cache_read_tokens') + getInt('cache_creation_tokens')
      const out = getInt('output_tokens')
      inProgressInput += inp; inProgressOutput += out
      if (inp > 0 || out > 0) { inputArr.push(inp); outputArr.push(out) }
    }
    const n = sessions.length + inProgressTokens.length + 1
    inProgressTokens.push({ session: n, tokens: inProgressInput + inProgressOutput, inputTokens: inputArr, outputTokens: outputArr })
  }

  const filesSet = new Set<string>()
  let errorCount = 0
  for (const sess of sessions) {
    for (const f of sess.filesChanged) filesSet.add(f)
    errorCount += sess.errors
  }
  const sessionTokens = sessions.map((sess, i) => {
    const inputArr: number[] = [], outputArr: number[] = []
    for (const e of sess.timeline ?? []) {
      if (e.type === 'llm' && ((e.inputTokens ?? 0) > 0 || (e.outputTokens ?? 0) > 0)) {
        inputArr.push(e.inputTokens ?? 0); outputArr.push(e.outputTokens ?? 0)
      }
    }
    if (inputArr.length === 0 && (sess.inputTokens > 0 || sess.outputTokens > 0)) {
      inputArr.push(sess.inputTokens); outputArr.push(sess.outputTokens)
    }
    return { session: i + 1, tokens: sess.inputTokens + sess.outputTokens, inputTokens: inputArr, outputTokens: outputArr, source: sess.source }
  })
  const cacheHitPct = sessions.length > 0
    ? Math.round(sessions.reduce((a, s) => a + s.cacheHitRate, 0) / sessions.length * 100) : 0
  const avgTurns = sessions.length > 0
    ? Math.round(sessions.reduce((a, s) => a + s.totalLlmCalls, 0) / sessions.length * 10) / 10 : 0

  const AGENT_KEY_ORDER = ['copilot', 'claude_code', 'codex']
  const agentSources = [...new Set(sessions.map(s => s.source).filter(Boolean))].sort((a, b) => {
    const ai = AGENT_KEY_ORDER.indexOf(a), bi = AGENT_KEY_ORDER.indexOf(b)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })

  const totalToolCalls = sessions.reduce((s, sess) => s + sess.totalToolCalls, 0)
  const latest = sessions.length > 0 ? sessions[sessions.length - 1] : null
  const latestSession = latest ? {
    source: latest.source,
    model: latest.model || '',
    totalLlmCalls: latest.totalLlmCalls,
    totalToolCalls: latest.totalToolCalls,
    durationMs: latest.durationMs,
    errors: latest.errors,
    cacheHitRate: latest.cacheHitRate,
  } : null

  return {
    sessionCount: sessions.length + inProgressTraceIds.length,
    turnCount: sessions.reduce((s, sess) => s + sess.totalLlmCalls, 0) + inProgressTurns,
    totalInputTokens: sessions.reduce((s, sess) => s + sess.inputTokens, 0) + inProgressInput,
    totalOutputTokens: sessions.reduce((s, sess) => s + sess.outputTokens, 0) + inProgressOutput,
    filesChangedCount: filesSet.size,
    errors: errorCount,
    totalToolCalls,
    cacheHitPct,
    avgTurns,
    agentSources,
    latestSession,
  }
}

function computeAnalyticsData(sessions: ReturnType<typeof summarizeSpans>['sessions']) {
  const dayMap: Record<string, { totalTokens: number; outputTokens: number; cacheReadTokens: number; cacheCreateTokens: number; costUsd: number; sessionCount: number }> = {}
  for (const sess of sessions) {
    if (!sess.startTime) continue
    const d = new Date(sess.startTime)
    if (isNaN(d.getTime())) continue
    const day = d.toISOString().slice(0, 10)
    if (!dayMap[day]) dayMap[day] = { totalTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheCreateTokens: 0, costUsd: 0, sessionCount: 0 }
    const r = dayMap[day]
    r.totalTokens += sess.inputTokens
    r.outputTokens += sess.outputTokens
    r.cacheReadTokens += sess.cacheReadTokens
    r.cacheCreateTokens += sess.cacheCreateTokens
    r.sessionCount++
  }
  const dailyStats = Object.entries(dayMap).map(([day, r]) => ({ day, ...r })).sort((a, b) => a.day.localeCompare(b.day))
  const totalTokens = sessions.reduce((s, sess) => s + sess.inputTokens + sess.outputTokens, 0)
  const times = sessions.map(s => s.startTime ? new Date(s.startTime).getTime() : 0).filter(t => t > 0)
  const lifetimeStats = {
    totalSessions: sessions.length,
    totalTokens,
    totalCostUsd: 0,
    oldestSessionMs: times.length > 0 ? Math.min(...times) : 0,
    newestSessionMs: times.length > 0 ? Math.max(...times) : 0,
  }
  return { dailyStats, lifetimeStats }
}

function buildUpdatePayload(): string {
  let sessionSummary: ReturnType<typeof summarizeSpans> | null = null
  try { sessionSummary = summarizeSpans(spans) } catch { /* ignore */ }
  const sidebar = sessionSummary ? computeSidebarData(sessionSummary, spans) : null
  const analyticsData = sessionSummary ? computeAnalyticsData(sessionSummary.sessions) : null
  return JSON.stringify({ type: 'update', spans, summary: { toolCalls: {} }, sessionSummary, sidebar, analyticsData })
}

function pushUpdate() {
  const data = buildUpdatePayload()
  sseClients = sseClients.filter(client => {
    try { client.write(`data: ${data}\n\n`); return true } catch { return false }
  })
}

// ── Dashboard HTML ────────────────────────────────────────────────────────────

function getHtml(): string {
  let sessionSummary: ReturnType<typeof summarizeSpans> | null = null
  try { sessionSummary = summarizeSpans(spans) } catch { /* ignore */ }
  const sidebar = sessionSummary ? computeSidebarData(sessionSummary, spans) : {
    sessionCount: 0, turnCount: 0, totalInputTokens: 0, totalOutputTokens: 0,
    filesChangedCount: 0, errors: 0, totalToolCalls: 0, cacheHitPct: 0, avgTurns: 0,
    agentSources: [], latestSession: null,
  }
  const analyticsData = sessionSummary ? computeAnalyticsData(sessionSummary.sessions) : null
  const sessionSummaryJson = safeJson(sessionSummary)
  const sidebarJson = safeJson(sidebar)

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>AgentLens</title>
  <link rel="icon" href="/mascot.png" type="image/png">
  <link rel="stylesheet" href="/dashboard.css">
  <style>
    /* ── VS Code theme variable shim ─────────────────────────────────────── */
    :root {
      --vscode-editor-background:       #1e1e1e;
      --vscode-foreground:              #cccccc;
      --vscode-panel-border:            #3e3e42;
      --vscode-textLink-foreground:     #4fc3f7;
      --vscode-descriptionForeground:   #9d9d9d;
      --vscode-list-hoverBackground:    #2a2d2e;
      --vscode-editorWidget-background: #252526;
      --vscode-testing-iconFailed:      #f44747;
      --vscode-testing-iconPassed:      #4ec994;
      --vscode-font-family:             -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      --vscode-dropdown-background:     #3c3c3c;
      --vscode-dropdown-border:         #616161;
      --vscode-dropdown-foreground:     #f0f0f0;
      --vscode-button-background:       #0e639c;
      --vscode-button-foreground:       #ffffff;
      --vscode-button-hoverBackground:  #1177bb;
    }

    /* ── Standalone layout ───────────────────────────────────────────────── */
    html, body { height: 100%; overflow: hidden; margin: 0; padding: 0; }
    body { padding: 0; }
    #sa-wrap { display: flex; height: 100vh; width: 100vw; overflow: hidden; }

    /* ── Sidebar panel ───────────────────────────────────────────────────── */
    #sa-sidebar {
      width: 260px;
      min-width: 260px;
      background: var(--vscode-editorWidget-background);
      border-right: 1px solid var(--vscode-panel-border);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      overflow: hidden;
      transition: width 0.15s ease, min-width 0.15s ease;
    }
    #sa-sidebar.sa-collapsed { width: 0; min-width: 0; }

    /* Sidebar content */
    .sa-body { flex: 1; overflow-y: auto; padding: 8px; font-family: var(--vscode-font-family); color: var(--vscode-foreground); }
    .sb-card { background: var(--vscode-editor-background); border: 1px solid var(--vscode-panel-border); border-radius: 4px; padding: 8px 10px; margin-bottom: 6px; position: relative; }
    .sb-metric { font-size: 24px; font-weight: bold; color: var(--vscode-textLink-foreground); }
    .sb-label { font-size: 11px; color: var(--vscode-descriptionForeground); margin-top: 2px; }
    .sb-h3 { margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; color: var(--vscode-descriptionForeground); cursor: default; }
    .sb-has-tip { position: static; border-bottom: 1px dotted var(--vscode-descriptionForeground); display: inline-block; margin-bottom: 6px; cursor: help; }
    .sb-has-tip .sb-tip { display: none; position: fixed; left: 0; right: 0; z-index: 10; background: var(--vscode-editorWidget-background); color: var(--vscode-foreground); border: 1px solid var(--vscode-panel-border); border-radius: 4px; padding: 6px 8px; font-size: 12px; font-weight: normal; text-transform: none; line-height: 1.4; white-space: normal; pointer-events: none; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
    .sb-has-tip:hover .sb-tip { display: block; }
    .sb-stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 6px; }
    .sb-stat-grid .sb-card { margin-bottom: 0; }
    .sb-tokens-card { display: flex; gap: 0; align-items: flex-start; }
    .sb-tokens-divider { width: 1px; background: var(--vscode-panel-border); align-self: stretch; margin: 2px 12px; flex-shrink: 0; }
    .sb-tokens-half { flex: 1; min-width: 0; }
    .sb-tokens-half .sb-metric { font-size: 18px; }
    @keyframes agentPulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(1.4); } }
    #sa-toast { position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#333; color:#fff; padding:8px 16px; border-radius:4px; font-size:12px; z-index:9999; opacity:0; transition:opacity 0.2s; pointer-events:none; white-space:nowrap; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
    #sa-toast.visible { opacity:1; }
    .sb-status-dot { display:inline-block; width:8px; height:8px; border-radius:50%; flex-shrink:0; }
    .sb-status-dot.active { background:#56D364; animation:agentPulse 1.5s ease-in-out infinite; }
    .sb-status-dot.idle { background:var(--vscode-descriptionForeground); opacity:0.5; }
    .sb-filter-label { font-size:10px; color:var(--vscode-descriptionForeground); margin-bottom:2px; }
    .sb-select { width:100%;padding:3px 6px;font-size:11px;background:var(--vscode-dropdown-background);color:var(--vscode-dropdown-foreground);border:1px solid var(--vscode-dropdown-border);border-radius:3px;cursor:pointer; }
    .sb-clear-btn { display:block;width:100%;padding:4px 8px;font-size:11px;cursor:pointer;border:1px solid var(--vscode-testing-iconFailed,#f44);border-radius:3px;background:transparent;color:var(--vscode-testing-iconFailed,#f44);margin-top:8px; }
    .sb-clear-btn:hover { background:rgba(255,68,68,0.08); }

    /* ── Main panel ──────────────────────────────────────────────────────── */
    #sa-main { flex: 1; overflow-y: auto; min-width: 0; padding: 16px 18px; }
    #app { min-height: 100%; }
  </style>
</head>
<body>
  <script>
    window.__INITIAL_SPANS__ = ${safeJson(spans)};
    window.__INITIAL_TOOL_CALLS__ = {};
    window.__INITIAL_SESSION_SUMMARY__ = ${sessionSummaryJson};
    window.__MASCOT_URI__ = '/help-mascot.png';
    window.__STANDALONE__ = true;

    // ── Client-side search support ────────────────────────────────────────────
    var __latestSessions__ = (window.__INITIAL_SESSION_SUMMARY__ && window.__INITIAL_SESSION_SUMMARY__.sessions) || [];
    window.addEventListener('message', function(e) {
      if (e.data && e.data.type === 'update' && e.data.sessionSummary && e.data.sessionSummary.sessions) {
        __latestSessions__ = e.data.sessionSummary.sessions;
      }
    });

    var _toastTimer;
    function showToast(msg) {
      var el = document.getElementById('sa-toast');
      if (!el) { el = document.createElement('div'); el.id = 'sa-toast'; document.body.appendChild(el); }
      el.textContent = msg;
      el.classList.add('visible');
      clearTimeout(_toastTimer);
      _toastTimer = setTimeout(function() { el.classList.remove('visible'); }, 3000);
    }

    function getNotifContainer() {
      var el = document.getElementById('sa-notif-container');
      if (!el) {
        el = document.createElement('div');
        el.id = 'sa-notif-container';
        el.style.cssText = 'position:fixed;bottom:20px;right:16px;z-index:9998;display:flex;flex-direction:column;gap:8px;max-width:320px;';
        document.body.appendChild(el);
      }
      return el;
    }

    function showActionNotification(label, prompt, color, preview, copyLabel) {
      color = color || '#f6a623';
      var container = getNotifContainer();
      var notif = document.createElement('div');
      notif.style.cssText = 'background:#252526;border:1px solid #3e3e42;border-left:3px solid ' + color + ';border-radius:4px;padding:10px 12px;font-size:12px;color:#ccc;box-shadow:0 2px 8px rgba(0,0,0,0.4);';

      var header = document.createElement('div');
      header.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px;';

      var labelEl = document.createElement('span');
      labelEl.style.cssText = 'font-weight:600;color:' + color + ';line-height:1.3;';
      labelEl.textContent = 'AgentLens: ' + label;

      var closeBtn = document.createElement('button');
      closeBtn.textContent = '×';
      closeBtn.style.cssText = 'background:none;border:none;color:#888;cursor:pointer;font-size:16px;padding:0;line-height:1;flex-shrink:0;';
      closeBtn.onclick = function() { notif.remove(); };

      header.appendChild(labelEl);
      header.appendChild(closeBtn);
      notif.appendChild(header);

      if (preview) {
        var previewEl = document.createElement('div');
        previewEl.style.cssText = 'font-size:11px;color:#999;margin-bottom:8px;line-height:1.4;max-height:56px;overflow:hidden;';
        previewEl.textContent = preview;
        notif.appendChild(previewEl);
      }

      var copyBtn = document.createElement('button');
      copyBtn.textContent = copyLabel || 'Copy Prompt';
      copyBtn.style.cssText = 'background:none;border:1px solid ' + color + ';border-radius:3px;color:' + color + ';cursor:pointer;font-size:11px;padding:4px 10px;';
      copyBtn.onclick = function() {
        navigator.clipboard.writeText(prompt).then(function() {
          copyBtn.textContent = 'Copied!';
          copyBtn.style.borderColor = '#56D364';
          copyBtn.style.color = '#56D364';
          setTimeout(function() { notif.remove(); }, 1500);
        }).catch(function() {
          showToast('Could not copy — check browser clipboard permissions');
        });
      };

      notif.appendChild(copyBtn);
      container.appendChild(notif);
      setTimeout(function() { notif.remove(); }, 30000);
    }

    window.acquireVsCodeApi = function() {
      return {
        getState: function() { return null; },
        setState: function() {},
        postMessage: function(msg) {
          if (msg.type === 'clearAll') {
            fetch('/api/clear', { method: 'POST' });
          } else if (msg.type === 'automation' && msg.prompt) {
            // Strip the session header block and preview the action body
            var autoBody = msg.prompt;
            var sepIdx = msg.prompt.indexOf('\\n--- ');
            if (sepIdx !== -1) {
              var bodyStart = msg.prompt.indexOf('\\n\\n', sepIdx);
              if (bodyStart !== -1) autoBody = msg.prompt.slice(bodyStart).trim();
            }
            var autoPreview = autoBody.length > 160 ? autoBody.slice(0, 160) + '…' : autoBody;
            if (msg.writePromptsFile) {
              fetch('/api/write-prompts-file', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agent: msg.agent, label: msg.label, prompt: msg.prompt })
              }).then(function() {
                var slug = msg.agent === 'claude_code' ? 'claude' : msg.agent === 'codex' ? 'codex' : 'copilot';
                showToast('Prompt written to agentlens-prompts-' + slug + '.md');
              }).catch(function() {
                showActionNotification(msg.label || 'Automation', msg.prompt, '#f6a623', autoPreview);
              });
            } else {
              showActionNotification(msg.label || 'Automation', msg.prompt, '#f6a623', autoPreview);
            }
          } else if (msg.type === 'askAI' && msg.prompt) {
            navigator.clipboard.writeText(msg.prompt).then(function() {
              showToast('Prompt copied to clipboard');
            }).catch(function() {
              showToast('Could not copy — check browser clipboard permissions');
            });
          } else if (msg.type === 'exportSessionData' || msg.type === 'exportSessionDataRedacted') {
            window.dispatchEvent(new MessageEvent('message', { data: { type: msg.type } }));
          } else if (msg.type === 'openSidebar' || msg.type === 'closeSidebar') {
            window.dispatchEvent(new CustomEvent('agentlens:sidebar', { detail: { open: msg.type === 'openSidebar' } }));
          } else if (msg.type === 'searchSessions' && msg.query) {
            var q = msg.query;
            var filtered = __latestSessions__.filter(function(s) {
              if (q.text) {
                var t = q.text.toLowerCase();
                if (!(s.userRequest || '').toLowerCase().includes(t) && !(s.model || '').toLowerCase().includes(t)) return false;
              }
              if (q.source && s.source !== q.source) return false;
              if (q.since) { var ms = s.startTime ? new Date(s.startTime).getTime() : 0; if (ms < q.since) return false; }
              if (q.until) { var ms2 = s.startTime ? new Date(s.startTime).getTime() : 0; if (ms2 > q.until) return false; }
              return true;
            });
            var dir = q.orderDir === 'ASC' ? 1 : -1;
            filtered.sort(function(a, b) {
              if (q.orderBy === 'start_time') return dir * (new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
              if (q.orderBy === 'total_tokens') return dir * ((a.inputTokens + a.outputTokens) - (b.inputTokens + b.outputTokens));
              if (q.orderBy === 'duration_ms') return dir * (a.durationMs - b.durationMs);
              if (q.orderBy === 'errors') return dir * (a.errors - b.errors);
              if (q.orderBy === 'cost_usd') return 0;
              return 0;
            });
            var offset = q.offset || 0; var limit = q.limit || 50;
            var page = filtered.slice(offset, offset + limit);
            setTimeout(function() {
              window.dispatchEvent(new MessageEvent('message', {
                data: { type: 'searchResults', sessions: page, totalCount: filtered.length, offset: offset, context: msg.context || 'search' }
              }));
            }, 0);
          } else if (msg.type === 'alert' && msg.label) {
            var color = msg.severity === 'error' ? '#f44747' : msg.severity === 'info' ? '#4fc3f7' : '#f6a623';
            var container = getNotifContainer();
            var notif = document.createElement('div');
            notif.style.cssText = 'background:#252526;border:1px solid #3e3e42;border-left:3px solid ' + color + ';border-radius:4px;padding:10px 12px;font-size:12px;color:#ccc;box-shadow:0 2px 8px rgba(0,0,0,0.4);';
            var header = document.createElement('div');
            header.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-start;gap:8px;';
            var labelEl = document.createElement('div');
            labelEl.style.cssText = 'flex:1;';
            labelEl.innerHTML = '<span style="font-weight:600;color:' + color + '">AgentLens: ' + msg.label + '</span>' +
              (msg.detail ? '<div style="margin-top:4px;color:#999;font-size:11px">' + msg.detail + '</div>' : '');
            var closeBtn = document.createElement('button');
            closeBtn.textContent = '×';
            closeBtn.style.cssText = 'background:none;border:none;color:#888;cursor:pointer;font-size:16px;padding:0;line-height:1;flex-shrink:0;';
            closeBtn.onclick = function() { notif.remove(); };
            header.appendChild(labelEl);
            header.appendChild(closeBtn);
            notif.appendChild(header);
            container.appendChild(notif);
            setTimeout(function() { notif.remove(); }, 20000);
          }
        }
      };
    };
    // SSE → dispatch as window message (picked up by Preact app AND sidebar handler below)
    var _es = new EventSource('/events');
    _es.onmessage = function(e) {
      window.dispatchEvent(new MessageEvent('message', { data: JSON.parse(e.data) }));
    };
  </script>

  <div id="sa-wrap">
    <!-- ── Sidebar ────────────────────────────────────────────────────────── -->
    <div id="sa-sidebar" style="display:flex;flex-direction:column;height:100%">
      <div class="sa-body" style="flex:1 1 auto;overflow-y:auto">
        <!-- Agent key -->
        <div id="sa-agent-key" style="margin-bottom:6px"></div>
        <!-- Status + Sessions -->
        <div class="sb-stat-grid">
          <div class="sb-card" style="margin-bottom:0">
            <div class="sb-h3"><span class="sb-has-tip">Status<span class="sb-tip">Active when a span was received in the last 20 seconds.</span></span></div>
            <div style="display:flex;align-items:center;gap:5px;margin:2px 0">
              <span class="sb-status-dot idle" id="sb-status-dot"></span>
              <span class="sb-metric" style="font-size:12px;color:var(--vscode-descriptionForeground)" id="sb-status-text">Idle</span>
            </div>
            <div class="sb-label" id="sb-status-label">No activity yet</div>
          </div>
          <div class="sb-card" style="margin-bottom:0">
            <div class="sb-h3"><span class="sb-has-tip">Sessions<span class="sb-tip">Prompt-to-response cycles in the selected window.</span></span></div>
            <div class="sb-metric" id="sb-sessions" style="font-size:18px">${sidebar.sessionCount}</div>
          </div>
        </div>
        <!-- Tokens -->
        <div class="sb-card sb-tokens-card" style="margin-bottom:6px">
          <div class="sb-tokens-half">
            <div class="sb-h3"><span class="sb-has-tip">Input<span class="sb-tip">Tokens sent to the model — context, history, tools, and the user prompt.</span></span></div>
            <div class="sb-metric" id="sb-input" style="font-size:15px">0</div>
            <div class="sb-label">Total</div>
          </div>
          <div class="sb-tokens-divider"></div>
          <div class="sb-tokens-half">
            <div class="sb-h3"><span class="sb-has-tip">Output<span class="sb-tip">Tokens generated by the model across all sessions.</span></span></div>
            <div class="sb-metric" id="sb-output" style="font-size:15px">0</div>
            <div class="sb-label">Total</div>
          </div>
        </div>
        <!-- Cache / Turns / Errors / Tools -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">
          <div class="sb-card" style="margin-bottom:0">
            <div class="sb-h3"><span class="sb-has-tip">Cache Hit<span class="sb-tip">Average % of input tokens served from cache. Higher is cheaper and faster.</span></span></div>
            <div class="sb-metric" id="sb-cache" style="font-size:18px">${sidebar.cacheHitPct}%</div>
            <div class="sb-label">Avg</div>
          </div>
          <div class="sb-card" style="margin-bottom:0">
            <div class="sb-h3"><span class="sb-has-tip">Turns<span class="sb-tip">Average LLM calls per session. Fewer turns = more efficient.</span></span></div>
            <div class="sb-metric" id="sb-turns" style="font-size:18px">${sidebar.avgTurns}</div>
            <div class="sb-label">Avg</div>
          </div>
          <div class="sb-card" style="margin-bottom:0">
            <div class="sb-h3"><span class="sb-has-tip">Errors<span class="sb-tip">Total spans that completed with an error status across the selected sessions.</span></span></div>
            <div class="sb-metric" id="sb-errors" style="font-size:18px;${sidebar.errors > 0 ? 'color:var(--vscode-testing-iconFailed,#f44)' : ''}">${sidebar.errors}</div>
            <div class="sb-label">Total</div>
          </div>
          <div class="sb-card" style="margin-bottom:0">
            <div class="sb-h3"><span class="sb-has-tip">Tool Calls<span class="sb-tip">Total tool invocations across the selected sessions.</span></span></div>
            <div class="sb-metric" id="sb-tools" style="font-size:18px">${sidebar.totalToolCalls}</div>
            <div class="sb-label">Total</div>
          </div>
        </div>
        <!-- Latest session -->
        <div class="sb-card" id="sb-latest-card" style="${sidebar.latestSession ? '' : 'display:none'}">
          <div class="sb-h3">Latest Session</div>
          <div id="sb-latest-body" style="font-size:11px;color:var(--vscode-foreground);margin-top:4px"></div>
        </div>
        <!-- Actions -->
        <button class="sb-clear-btn" id="sb-clear-btn">Clear All Data</button>
      </div>
    </div>

    <!-- ── Main dashboard ─────────────────────────────────────────────────── -->
    <div id="sa-main">
      <div id="app"></div>
    </div>
  </div>

  <script>
    window.onerror = function(msg, src, line, col, err) {
      var app = document.getElementById('app');
      if (app) {
        app.style.cssText = 'padding:20px;color:red;font-family:monospace;white-space:pre-wrap';
        app.textContent = 'JS ERROR: ' + msg + ' | At: ' + src + ':' + line + ':' + col + ' | ' + (err ? err.stack : '');
      }
    };
  </script>


  <script src="/dashboard.js"></script>

  <script>
  (function() {
    function fmt(n) {
      return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n || 0);
    }
    function fmtDur(ms) {
      if (!ms) return '0s';
      if (ms < 60000) return Math.round(ms / 1000) + 's';
      return Math.round(ms / 60000) + 'm';
    }
    function formatAgo(ms) {
      if (!ms) return 'No activity yet';
      var secs = Math.floor((Date.now() - ms) / 1000);
      if (secs < 60) return secs + 's ago';
      var mins = Math.floor(secs / 60);
      if (mins < 60) return mins + 'm ago';
      return Math.floor(mins / 60) + 'h ago';
    }

    // ── Sidebar collapse (driven by dashboard tab-bar toggle) ─────────────
    var sidebarEl = document.getElementById('sa-sidebar');
    window.addEventListener('agentlens:sidebar', function(e) {
      sidebarEl.classList.toggle('sa-collapsed', !e.detail.open);
    });

    // ── Clear button ──────────────────────────────────────────────────────
    document.getElementById('sb-clear-btn').addEventListener('click', function() {
      if (!confirm('Clear all AgentLens session data (all time)? This cannot be undone.')) return;
      fetch('/api/clear', { method: 'POST' });
      window.dispatchEvent(new MessageEvent('message', { data: { type: 'clearAll' } }));
    });

    // ── Agent key ─────────────────────────────────────────────────────────
    function getAgentColor(source) {
      if (source === 'claude_code') return '#FFB085';
      if (source === 'codex') return '#F0FF42';
      if (source === 'copilot') return '#00EAFF';
      return '#90a4ae';
    }
    function getAgentLabel(source) {
      if (source === 'claude_code') return 'Claude';
      if (source === 'codex') return 'Codex';
      return 'Copilot';
    }
    function refreshAgentKey(sources) {
      var el = document.getElementById('sa-agent-key');
      if (!el) return;
      if (!sources || !sources.length) { el.innerHTML = ''; return; }
      var html = '<div style="display:flex;gap:10px;font-size:10px;color:var(--vscode-descriptionForeground);align-items:center;flex-wrap:wrap;padding:4px 0">';
      sources.forEach(function(src) {
        html += '<span style="display:flex;align-items:center;gap:4px">';
        html += '<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:' + getAgentColor(src) + '"></span>';
        html += getAgentLabel(src) + '</span>';
      });
      html += '</div>';
      el.innerHTML = html;
    }

    // ── Latest session card ───────────────────────────────────────────────
    function renderLatestSession(s) {
      var card = document.getElementById('sb-latest-card');
      var body = document.getElementById('sb-latest-body');
      if (!card || !body) return;
      if (!s) { card.style.display = 'none'; return; }
      card.style.display = '';
      var agentLabel = s.source === 'claude_code' ? 'Claude' : s.source === 'codex' ? 'Codex' : 'Copilot';
      var errHtml = s.errors > 0 ? '<span style="color:var(--vscode-testing-iconFailed,#f44)">' + s.errors + ' err</span>' : '';
      body.innerHTML =
        '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:3px">' +
          '<span style="color:var(--vscode-descriptionForeground)">' + agentLabel + '</span>' +
          '<span style="color:var(--vscode-descriptionForeground)">' + fmtDur(s.durationMs) + '</span>' +
        '</div>' +
        '<div style="color:var(--vscode-textLink-foreground);margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + (s.model || '—') + '</div>' +
        '<div style="display:flex;gap:12px;font-size:10px;color:var(--vscode-descriptionForeground)">' +
          '<span>' + s.totalLlmCalls + ' turn' + (s.totalLlmCalls !== 1 ? 's' : '') + '</span>' +
          '<span>' + s.totalToolCalls + ' tool' + (s.totalToolCalls !== 1 ? 's' : '') + '</span>' +
          errHtml +
          '<span>' + Math.round(s.cacheHitRate * 100) + '% cache</span>' +
        '</div>';
    }

    // ── Live updates from SSE ─────────────────────────────────────────────
    var lastActivityMs = 0;
    var initSb = ${sidebarJson};
    var agentSources = initSb.agentSources || [];
    refreshAgentKey(agentSources);
    renderLatestSession(initSb.latestSession || null);

    function updateStatus(isActive, ms) {
      var dot = document.getElementById('sb-status-dot');
      var text = document.getElementById('sb-status-text');
      var label = document.getElementById('sb-status-label');
      if (!dot || !text || !label) return;
      if (ms) lastActivityMs = ms;
      if (isActive) {
        dot.className = 'sb-status-dot active';
        text.textContent = 'Active';
        text.style.color = 'var(--vscode-foreground)';
        label.textContent = '';
      } else {
        dot.className = 'sb-status-dot idle';
        text.textContent = 'Idle';
        text.style.color = 'var(--vscode-descriptionForeground)';
        label.textContent = lastActivityMs ? formatAgo(lastActivityMs) : 'No activity yet';
      }
    }
    setInterval(function() {
      var dot = document.getElementById('sb-status-dot');
      if (dot && dot.classList.contains('idle') && lastActivityMs) {
        var label = document.getElementById('sb-status-label');
        if (label) label.textContent = formatAgo(lastActivityMs);
      }
    }, 10000);

    window.addEventListener('message', function(e) {
      var msg = e.data;
      if (msg.type !== 'update' || !msg.sidebar) return;
      var sb = msg.sidebar;
      document.getElementById('sb-sessions').textContent = sb.sessionCount || 0;
      document.getElementById('sb-turns').textContent    = sb.avgTurns || 0;
      document.getElementById('sb-output').textContent   = fmt(sb.totalOutputTokens);
      document.getElementById('sb-input').textContent    = fmt(sb.totalInputTokens);
      document.getElementById('sb-cache').textContent    = (sb.cacheHitPct || 0) + '%';
      var errEl = document.getElementById('sb-errors');
      if (errEl) { errEl.textContent = sb.errors || 0; errEl.style.color = sb.errors > 0 ? 'var(--vscode-testing-iconFailed,#f44)' : ''; }
      var toolsEl = document.getElementById('sb-tools');
      if (toolsEl) toolsEl.textContent = sb.totalToolCalls || 0;
      renderLatestSession(sb.latestSession || null);
      updateStatus(true, Date.now());
      clearTimeout(window._idleTimer);
      window._idleTimer = setTimeout(function() { updateStatus(false, lastActivityMs); }, 20000);
      if (msg.sessionSummary && msg.sessionSummary.sessions) {
        var AGENT_KEY_ORDER = ['copilot', 'claude_code', 'codex'];
        agentSources = [...new Set(msg.sessionSummary.sessions.map(function(s) { return s.source; }).filter(Boolean))].sort(function(a, b) {
          var ai = AGENT_KEY_ORDER.indexOf(a), bi = AGENT_KEY_ORDER.indexOf(b);
          return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
        });
        refreshAgentKey(agentSources);
      }
    });

    document.getElementById('sb-output').textContent = fmt(initSb.totalOutputTokens);
    document.getElementById('sb-input').textContent  = fmt(initSb.totalInputTokens);
    if (initSb.sessionCount > 0) updateStatus(false, Date.now() - 30000);
  })();
  </script>
</body>
</html>`
}

// ── Static file serving ───────────────────────────────────────────────────────

const MIME: Record<string, string> = {
  '.css': 'text/css',
  '.js':  'application/javascript',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
}

// ── UI server ─────────────────────────────────────────────────────────────────

const uiServer = http.createServer((req, res) => {
  const url = (req.url ?? '/').split('?')[0]
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (url === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    })
    res.write(':\n\n') // initial ping
    res.write(`data: ${buildUpdatePayload()}\n\n`)
    sseClients.push(res)
    req.on('close', () => { sseClients = sseClients.filter(c => c !== res) })
    return
  }

  if (req.method === 'POST' && url === '/api/clear') {
    spans = []
    try { fs.writeFileSync(DATA_FILE, '[]') } catch { /* ignore */ }
    pushUpdate()
    res.writeHead(200); res.end()
    return
  }

  if (req.method === 'POST' && url === '/api/write-prompts-file') {
    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => chunks.push(c))
    req.on('end', () => {
      try {
        const { agent, label, prompt } = JSON.parse(Buffer.concat(chunks).toString('utf-8')) as { agent: string; label: string; prompt: string }
        const agentSlug = agent === 'claude_code' ? 'claude' : agent === 'codex' ? 'codex' : 'copilot'
        const agentName = agent === 'claude_code' ? 'Claude' : agent === 'codex' ? 'Codex' : 'Copilot'
        const filename = `agentlens-prompts-${agentSlug}.md`
        const filePath = path.join(process.cwd(), filename)
        const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19)
        const entry = `## ${timestamp} — ${label}\n\n${prompt}\n\n---\n\n`
        let existing = ''
        try { existing = fs.readFileSync(filePath, 'utf-8') } catch { /* new file */ }
        const content = existing ? existing + entry : `# AgentLens Prompts — ${agentName}\n\n${entry}`
        fs.writeFileSync(filePath, content, 'utf-8')
        console.log(`[AgentLens] Prompt written to ${filePath}`)
      } catch (e) {
        console.warn('[AgentLens] write-prompts-file error:', e)
      }
      res.writeHead(200); res.end()
    })
    return
  }

  if (url === '/' || url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(getHtml())
    return
  }

  const filePath = path.join(mediaDir, url)
  const ext = path.extname(filePath)
  const mime = MIME[ext]
  if (mime && fs.existsSync(filePath) && filePath.startsWith(mediaDir)) {
    res.writeHead(200, { 'Content-Type': mime })
    fs.createReadStream(filePath).pipe(res)
    return
  }

  res.writeHead(404); res.end('Not found')
})

// ── OTLP server ───────────────────────────────────────────────────────────────

const otlpServer = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/agentlens/standalone') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ agentlens: true, kind: 'standalone' }))
    return
  }
  if (req.method !== 'POST') { res.writeHead(200); res.end(); return }
  const chunks: Buffer[] = []
  req.on('data', (c: Buffer) => chunks.push(c))
  req.on('end', () => {
    try {
      const payload = JSON.parse(Buffer.concat(chunks).toString('utf-8'))
      const kind = classifyOtlpPayload(payload)
      if (req.url === '/v1/traces' || kind === 'traces') {
        const n = processTraces(payload, req.url ?? '/v1/traces')
        if (n > 0) console.log(`[OTLP] ${n} span${n !== 1 ? 's' : ''} ingested (${spans.length} total)`)
      } else if (req.url === '/v1/logs' || kind === 'logs') {
        const n = processLogs(payload, req.url ?? '/v1/logs')
        if (n > 0) console.log(`[OTLP] ${n} log event${n !== 1 ? 's' : ''} ingested`)
      } else if (kind === 'metrics' || req.url === '/v1/metrics') {
        // Metrics are accepted so OTLP exporters do not retry, but AgentLens does not display them.
      } else {
        console.warn(`[OTLP] ignored POST ${req.url ?? '/'}: unrecognized OTLP JSON payload`)
      }
      pushUpdate()
      scheduleSave()
    } catch (e) {
      console.error('[OTLP] Parse error:', e)
    }
    res.writeHead(200); res.end()
  })
})

// ── Start ─────────────────────────────────────────────────────────────────────

otlpServer.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[AgentLens] Port ${OTLP_PORT} already in use — is the VS Code extension running? Stop it or set OTLP_PORT=<other> to use a different port.`)
    process.exit(1)
  }
  console.error('[AgentLens] OTLP server error:', err)
})

// Auto-configure Claude Code, Codex, and Copilot to point at this collector
Promise.all([
  autoConfigureClaudeCode(OTLP_PORT),
  autoConfigureCodex(OTLP_PORT),
  autoConfigureCopilotStandalone(OTLP_PORT),
]).then(([claudeResult, codexResult, copilotResults]) => {
  if (claudeResult.error) {
    console.warn(`[AgentLens] Could not auto-configure Claude Code: ${claudeResult.error}`)
  } else if (claudeResult.changed) {
    console.log(`[AgentLens] Claude Code configured — restart Claude Code in your terminal to activate tracing`)
  }
  if (codexResult.error) {
    console.warn(`[AgentLens] Could not auto-configure Codex: ${codexResult.error}`)
  } else if (codexResult.changed) {
    console.log(`[AgentLens] Codex configured — restart Codex in your terminal to activate tracing`)
  }
  const copilotChanged = copilotResults.filter(r => r.changed)
  const copilotErrors  = copilotResults.filter(r => r.error)
  if (copilotChanged.length > 0) {
    console.log(`[AgentLens] Copilot configured — reload VS Code window to activate tracing (Ctrl+Shift+P → "Reload Window")`)
  }
  for (const r of copilotErrors) {
    console.warn(`[AgentLens] Could not auto-configure Copilot: ${r.error}`)
  }
}).catch(e => console.warn('[AgentLens] Auto-configure error:', e))

otlpServer.listen(OTLP_PORT, BIND_HOST, () => {
  console.log(`[AgentLens] OTLP receiver → http://${BIND_HOST}:${OTLP_PORT}`)
})

uiServer.listen(UI_PORT, BIND_HOST, () => {
  console.log(`[AgentLens] Dashboard      → http://${BIND_HOST}:${UI_PORT}`)
  console.log(`\nOpen http://localhost:${UI_PORT} in your browser\n`)
})

// ── Graceful shutdown — flush data before exit ────────────────────────────────

function shutdown() {
  if (saveTimer) clearTimeout(saveTimer)
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(spans))
    console.log(`\n[AgentLens] Saved ${spans.length} spans to ${DATA_FILE}`)
  } catch { /* ignore */ }
  process.exit(0)
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
