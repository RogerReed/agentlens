import * as vscode from 'vscode'
import { SessionStore } from './sessionStore'
import { summarizeSpans } from './spanSummarizer'
import { nanoToMs } from './summarizers/helpers'
import { Span } from './types'

function isSessionSpan(name: string): boolean {
  return name.includes('invoke_agent')
    || name === 'claude_code.interaction'
    || name === 'codex.user_prompt'
    || name === 'codex.prompt'
    || name === 'codex.user_message'
    || name === 'codex.session_start'
}

function getSessionSource(name: string): 'copilot' | 'claude_code' | 'codex' | null {
  if (name.includes('invoke_agent')) {return 'copilot'}
  if (name === 'claude_code.interaction') {return 'claude_code'}
  if (name.startsWith('codex.')) {return 'codex'}
  return null
}

export class SidebarPanel implements vscode.WebviewViewProvider {
  private view?: vscode.WebviewView
  private agentFilter: string = 'all'
  private sessionLimit: number = 10
  private collectorError: string | null = null

  constructor(
    private store: SessionStore,
    private extensionUri: vscode.Uri,
  ) {}

  setCollectorError(msg: string | null) {
    this.collectorError = msg
    if (this.view) this.view.webview.html = this.getHtml(this.view.webview)
  }

  resolveWebviewView(webviewView: vscode.WebviewView) {
    this.view = webviewView
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'media')],
    }
    webviewView.webview.html = this.getHtml(webviewView.webview)

    vscode.commands.executeCommand('agentLens.openDashboard')

    const msgDisposable = webviewView.webview.onDidReceiveMessage(async msg => {
      if (msg.type === 'openDashboardTab') {
        vscode.commands.executeCommand('agentLens.openDashboard')
        setTimeout(() => {
          const { DashboardPanel } = require('./dashboardPanel')
          DashboardPanel.switchToTab(msg.tab)
        }, 300)
      } else if (msg.type === 'setAgentFilter') {
        this.setAgentFilter(msg.value)
      } else if (msg.type === 'setSessionLimit') {
        this.setSessionLimit(Number(msg.value) || 25)
      } else if (msg.type === 'clearAll') {
        vscode.commands.executeCommand('agentLens.clearSessions')
        this.refresh()
        const { DashboardPanel } = require('./dashboardPanel')
        DashboardPanel.sendClearAll()
      }
    })

    // Push updates within 300ms of new spans arriving; 5s heartbeat as fallback
    let pendingRefresh: ReturnType<typeof setTimeout> | undefined
    const scheduleRefresh = () => {
      if (pendingRefresh) return
      pendingRefresh = setTimeout(() => { pendingRefresh = undefined; this.refresh() }, 300)
    }
    const updateDisposable = this.store.onUpdate(scheduleRefresh)
    const interval = setInterval(() => this.refresh(), 5000)
    webviewView.onDidDispose(() => {
      clearInterval(interval)
      if (pendingRefresh) clearTimeout(pendingRefresh)
      updateDisposable.dispose()
      msgDisposable.dispose()
    })
  }

  setAgentFilter(value: string) {
    this.agentFilter = value
    if (!this.view) {return}
    const label = value === 'all' ? 'All' :
      value === 'copilot' ? 'Copilot' :
      value === 'claude_code' ? 'Claude' :
      value === 'codex' ? 'Codex' : value
    this.view.webview.postMessage({ type: 'agentFilterChanged', label, value })
    const { DashboardPanel } = require('./dashboardPanel')
    DashboardPanel.sendFilter(value, undefined)
    this.refresh()
  }

  setSessionLimit(value: number) {
    this.sessionLimit = value
    const { DashboardPanel } = require('./dashboardPanel')
    DashboardPanel.sendFilter(undefined, value)
    this.refresh()
  }

  /** Return spans filtered to the current agent selection. */
  private getFilteredSpans(): Span[] {
    const allSpans = this.store.getSpans()
    if (this.agentFilter === 'all') {return allSpans}
    const matchingTraceIds = new Set<string>()
    for (const s of allSpans) {
      const source = getSessionSource(s.name)
      if (source !== this.agentFilter) {continue}
      // For Copilot/Claude, only session-root spans anchor a trace to an agent.
      // For Codex, all codex.* log records come from the same source, so any span works.
      if (isSessionSpan(s.name) || source === 'codex') {
        matchingTraceIds.add(s.traceId)
      }
    }
    return allSpans.filter(s => matchingTraceIds.has(s.traceId))
  }

  refresh() {
    if (!this.view) {return}
    const spans = this.getFilteredSpans()
    const summary = summarizeSpans(spans)
    const limited = this.limitSessions(summary.sessions)
    const sessionCount = limited.length
    const tokenTotals = this.getTotalInputOutputTokens(spans)
    const cacheHitPct = limited.length > 0
      ? Math.round(limited.reduce((a, s) => a + s.cacheHitRate, 0) / limited.length * 100) : 0
    const avgTurns = limited.length > 0
      ? Math.round(limited.reduce((a, s) => a + s.totalLlmCalls, 0) / limited.length * 10) / 10 : 0
    const totalErrors = limited.reduce((a, s) => a + s.errors, 0)
    const totalToolCalls = limited.reduce((a, s) => a + s.totalToolCalls, 0)
    const activity = this.getLastActivity(spans)
    const AGENT_KEY_ORDER = ['copilot', 'claude_code', 'codex']
    const agentSources = [...new Set(
      summarizeSpans(this.store.getSpans()).sessions.map(s => s.source).filter(Boolean)
    )].sort((a, b) => {
      const ai = AGENT_KEY_ORDER.indexOf(a), bi = AGENT_KEY_ORDER.indexOf(b)
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    })
    const latest = limited.length > 0 ? limited[limited.length - 1] : null
    const latestSession = latest ? {
      model: latest.model || '',
      source: latest.source,
      totalLlmCalls: latest.totalLlmCalls,
      totalToolCalls: latest.totalToolCalls,
      durationMs: latest.durationMs,
      errors: latest.errors,
      cacheHitRate: latest.cacheHitRate,
    } : null
    this.view.webview.postMessage({
      type: 'update', sessionCount, agentSources,
      totalInputTokens: tokenTotals.input, totalOutputTokens: tokenTotals.output,
      cacheHitPct, avgTurns, totalErrors, totalToolCalls,
      isActive: activity.isActive, lastActivityMs: activity.lastMs,
      latestSession,
    })
  }

  private limitSessions<T extends { inputTokens: number }>(sessions: T[]): T[] {
    if (this.sessionLimit >= sessions.length) return sessions
    return sessions.slice(sessions.length - this.sessionLimit)
  }

  private getTotalInputOutputTokens(spans: Span[]): { input: number; output: number } {
    const sessions = this.limitSessions(summarizeSpans(spans).sessions)
    return {
      input: sessions.reduce((a, s) => a + s.inputTokens, 0),
      output: sessions.reduce((a, s) => a + s.outputTokens, 0),
    }
  }

  private getLastActivity(spans: Span[]): { isActive: boolean; lastMs: number } {
    let lastMs = 0
    for (const span of spans) {
      // Prefer the wall-clock receive time; fall back to the OTLP timestamp.
      // Codex log records often have timeUnixNano=0, so receivedAt is essential.
      const ms = span.receivedAt ?? nanoToMs(span.endTime)
      if (ms > lastMs) lastMs = ms
    }
    const isActive = lastMs > 0 && (Date.now() - lastMs) < 20_000
    return { isActive, lastMs }
  }


  private getHtml(webview: vscode.Webview) {
    const allSpans = this.getFilteredSpans()
    const initActivity = this.getLastActivity(allSpans)
    const tokenTotals = this.getTotalInputOutputTokens(allSpans)
    const limited = this.limitSessions(summarizeSpans(allSpans).sessions)
    const sessionCount = limited.length
    const cacheHitPct = limited.length > 0
      ? Math.round(limited.reduce((a, s) => a + s.cacheHitRate, 0) / limited.length * 100) : 0
    const avgTurns = limited.length > 0
      ? Math.round(limited.reduce((a, s) => a + s.totalLlmCalls, 0) / limited.length * 10) / 10 : 0
    const totalErrors = limited.reduce((a, s) => a + s.errors, 0)
    const totalToolCalls = limited.reduce((a, s) => a + s.totalToolCalls, 0)
    const latestSession = limited.length > 0 ? limited[limited.length - 1] : null
    function formatCompact(n: number): string {
      return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
    }
    function formatDuration(ms: number): string {
      if (ms < 60_000) return `${Math.round(ms / 1000)}s`
      return `${Math.round(ms / 60_000)}m`
    }

    const sidebarJsUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'sidebar.js'))

    const selectStyle = 'width:100%;padding:3px 6px;font-size:11px;background:var(--vscode-dropdown-background,var(--vscode-editor-background));color:var(--vscode-dropdown-foreground,var(--vscode-foreground));border:1px solid var(--vscode-dropdown-border,var(--vscode-panel-border));border-radius:3px;cursor:pointer'

    const sessionLimitStr = String(this.sessionLimit)
    const sessionOptions = [
      { value: '1', label: 'Last 1' },
      { value: '5', label: 'Last 5' },
      { value: '10', label: 'Last 10' },
      { value: '25', label: 'Last 25' },
    ].map(o => `<option value="${o.value}"${o.value === sessionLimitStr ? ' selected' : ''}>${o.label}</option>`).join('')

    const agentOptions = [
      { value: 'all', label: 'All' },
      { value: 'copilot', label: 'Copilot' },
      { value: 'claude_code', label: 'Claude' },
      { value: 'codex', label: 'Codex' },
    ].map(o => `<option value="${o.value}"${o.value === this.agentFilter ? ' selected' : ''}>${o.label}</option>`).join('')

    // Agent key is always based on ALL data, not the current agent filter
    const AGENT_KEY_ORDER = ['copilot', 'claude_code', 'codex']
    const allAgentSources = [...new Set(
      summarizeSpans(this.store.getSpans()).sessions.map(s => s.source).filter(Boolean)
    )].sort((a, b) => {
      const ai = AGENT_KEY_ORDER.indexOf(a), bi = AGENT_KEY_ORDER.indexOf(b)
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    })
    const agentSourcesJson = JSON.stringify(allAgentSources)

    return `<!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: var(--vscode-font-family); padding: 0 8px 8px; color: var(--vscode-foreground); }
        .open-btn {
          display: block; width: 100%; padding: 6px 10px; margin-bottom: 8px;
          font-size: 12px; font-weight: 600; text-align: center; cursor: pointer;
          color: var(--vscode-button-foreground); background: var(--vscode-button-background);
          border: none; border-radius: 4px;
        }
        .open-btn:hover { background: var(--vscode-button-hoverBackground); }
        .card { background: var(--vscode-editor-background); border: 1px solid var(--vscode-panel-border); border-radius: 4px; padding: 8px 10px; margin-bottom: 6px; position: relative; }
        .metric { font-size: 24px; font-weight: bold; color: var(--vscode-textLink-foreground); }
        .label { font-size: 11px; color: var(--vscode-descriptionForeground); margin-top: 2px; }
        h3 { margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; color: var(--vscode-descriptionForeground); cursor: default; }
        .has-tip { position: static; border-bottom: 1px dotted var(--vscode-descriptionForeground); display: inline-block; margin-bottom: 6px; cursor: help; }
        .has-tip .tip { display: none; position: fixed; left: 0; right: 0; z-index: 10; background: var(--vscode-editorHoverWidget-background, #252526); color: var(--vscode-editorHoverWidget-foreground, #ccc); border: 1px solid var(--vscode-editorHoverWidget-border, #454545); border-radius: 4px; padding: 6px 8px; font-size: 12px; font-weight: normal; text-transform: none; line-height: 1.4; white-space: normal; pointer-events: none; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
        .has-tip:hover .tip { display: block; }
        .status-error { color: var(--vscode-testing-iconFailed); }
        .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 6px; }
        .stat-grid .card { margin-bottom: 0; }
        .tokens-card { display: flex; gap: 0; align-items: flex-start; }
        .tokens-divider { width: 1px; background: var(--vscode-panel-border); align-self: stretch; margin: 2px 12px; flex-shrink: 0; }
        .tokens-half { flex: 1; min-width: 0; }
        .tokens-half .metric { font-size: 18px; }
        @keyframes agentPulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(1.4); } }
        .status-dot { display:inline-block; width:8px; height:8px; border-radius:50%; flex-shrink:0; }
        .status-dot.active { background:#56D364; animation:agentPulse 1.5s ease-in-out infinite; }
        .status-dot.idle { background:var(--vscode-descriptionForeground); opacity:0.5; }
        .filter-label { font-size:10px; color:var(--vscode-descriptionForeground); margin-bottom:2px; }
        .clear-btn { display:block; width:100%; padding:4px 8px; font-size:11px; cursor:pointer; border:1px solid var(--vscode-testing-iconFailed,#f44); border-radius:3px; background:transparent; color:var(--vscode-testing-iconFailed,#f44); margin-top:8px; }
        .clear-btn:hover { background:rgba(255,68,68,0.08); }
        .export-btn { display:block; width:100%; padding:6px 10px; font-size:12px; font-weight:600; text-align:center; cursor:pointer; border:1px solid var(--vscode-button-background,#007acc); border-radius:4px; background:transparent; color:var(--vscode-button-background,#007acc); margin-top:16px; position:fixed; left:8px; right:8px; bottom:8px; z-index:10; }
        .export-btn:hover { background:var(--vscode-button-hoverBackground, #e5f3ff); }
      </style>
    </head>
    <body>
      ${this.collectorError ? `
      <div id="collector-error-banner" style="background:var(--vscode-inputValidation-errorBackground,#5a1d1d);border:1px solid var(--vscode-inputValidation-errorBorder,#be1100);color:var(--vscode-inputValidation-errorForeground,#f48771);padding:8px 10px;margin-bottom:8px;border-radius:4px;font-size:11px;line-height:1.4">
        <div style="font-weight:600;margin-bottom:3px">&#9888; Collector not running</div>
        <div>${this.collectorError}</div>
        <button onclick="document.getElementById('collector-error-banner').remove()" style="margin-top:6px;font-size:10px;padding:2px 8px;cursor:pointer;background:transparent;border:1px solid currentColor;border-radius:3px;color:inherit">Dismiss</button>
      </div>` : ''}

      <!-- Filters -->
      <div class="card" style="margin-bottom:6px;padding:7px 10px">
        <div style="display:flex;gap:5px;align-items:flex-end">
          <div style="flex:1;min-width:0">
            <div class="filter-label">Sessions</div>
            <select id="sessionLimitSelect" style="${selectStyle}">${sessionOptions}</select>
          </div>
          <div style="flex:1;min-width:0">
            <div class="filter-label">Agent</div>
            <select id="agentFilterSelect" style="${selectStyle}">${agentOptions}</select>
          </div>
        </div>
        <div id="agentKey" style="margin-top:6px"></div>
      </div>

      <!-- Status + Sessions -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">
        <div class="card" style="margin-bottom:0">
          <h3><span class="has-tip">Status<span class="tip">Active when a span was received in the last 20 seconds.</span></span></h3>
          <div style="display:flex;align-items:center;gap:5px;margin:2px 0">
            <span class="status-dot ${initActivity.isActive ? 'active' : 'idle'}" id="statusDot"></span>
            <span class="metric" style="font-size:12px;color:${initActivity.isActive ? 'var(--vscode-foreground)' : 'var(--vscode-descriptionForeground)'}" id="statusText">${initActivity.isActive ? 'Active' : 'Idle'}</span>
          </div>
          <div class="label" id="statusLabel">${initActivity.lastMs === 0 ? 'No activity yet' : ''}</div>
        </div>
        <div class="card" style="margin-bottom:0">
          <h3><span class="has-tip">Sessions<span class="tip">Prompt-to-response cycles in the selected window.</span></span></h3>
          <div class="metric" id="sessionCountLabel" style="font-size:18px">${sessionCount}</div>
        </div>
      </div>

      <!-- Tokens -->
      <div class="card tokens-card" style="margin-bottom:6px">
        <div class="tokens-half">
          <h3><span class="has-tip">Input<span class="tip">Tokens sent to the model — context, history, tools, and the user prompt.</span></span></h3>
          <div class="metric" id="inputTokens" style="font-size:15px">${formatCompact(tokenTotals.input)}</div>
          <div class="label">Total</div>
        </div>
        <div class="tokens-divider"></div>
        <div class="tokens-half">
          <h3><span class="has-tip">Output<span class="tip">Tokens generated by the model across all sessions.</span></span></h3>
          <div class="metric" id="outputTokens" style="font-size:15px">${formatCompact(tokenTotals.output)}</div>
          <div class="label">Total</div>
        </div>
      </div>

      <!-- Cache / Turns / Errors / Tools grid -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">
        <div class="card" style="margin-bottom:0">
          <h3><span class="has-tip">Cache Hit<span class="tip">Average % of input tokens served from cache. Higher is cheaper and faster.</span></span></h3>
          <div class="metric" id="cacheHitRate" style="font-size:18px">${cacheHitPct}%</div>
          <div class="label">Avg</div>
        </div>
        <div class="card" style="margin-bottom:0">
          <h3><span class="has-tip">Turns<span class="tip">Average LLM calls per session. Fewer turns = more efficient.</span></span></h3>
          <div class="metric" id="avgTurns" style="font-size:18px">${avgTurns}</div>
          <div class="label">Avg</div>
        </div>
        <div class="card" style="margin-bottom:0">
          <h3><span class="has-tip">Errors<span class="tip">Total spans that completed with an error status across the selected sessions.</span></span></h3>
          <div class="metric" id="totalErrors" style="font-size:18px;color:${totalErrors > 0 ? 'var(--vscode-testing-iconFailed,#f44)' : 'inherit'}">${totalErrors}</div>
          <div class="label">Total</div>
        </div>
        <div class="card" style="margin-bottom:0">
          <h3><span class="has-tip">Tool Calls<span class="tip">Total tool invocations across the selected sessions.</span></span></h3>
          <div class="metric" id="totalToolCalls" style="font-size:18px">${totalToolCalls}</div>
          <div class="label">Total</div>
        </div>
      </div>

      <!-- Latest session -->
      <div class="card" id="latestSessionCard" style="margin-bottom:6px;${latestSession ? '' : 'display:none'}">
        <h3>Latest Session</h3>
        <div id="latestSessionBody" style="font-size:11px;color:var(--vscode-foreground);margin-top:4px">${latestSession ? `
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:3px">
            <span style="color:var(--vscode-descriptionForeground)">${latestSession.source === 'claude_code' ? 'Claude' : latestSession.source === 'codex' ? 'Codex' : 'Copilot'}</span>
            <span style="color:var(--vscode-descriptionForeground)">${formatDuration(latestSession.durationMs)}</span>
          </div>
          <div style="color:var(--vscode-textLink-foreground);margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${latestSession.model || '—'}</div>
          <div style="display:flex;gap:12px;font-size:10px;color:var(--vscode-descriptionForeground)">
            <span>${latestSession.totalLlmCalls} turn${latestSession.totalLlmCalls !== 1 ? 's' : ''}</span>
            <span>${latestSession.totalToolCalls} tool${latestSession.totalToolCalls !== 1 ? 's' : ''}</span>
            ${latestSession.errors > 0 ? `<span style="color:var(--vscode-testing-iconFailed,#f44)">${latestSession.errors} err</span>` : ''}
            <span>${Math.round(latestSession.cacheHitRate * 100)}% cache</span>
          </div>` : ''}</div>
      </div>

      <!-- Actions -->
      <button class="clear-btn" id="clearBtn">Clear All Data</button>
      <script>
        var __SIDEBAR_INIT__ = {
          lastActivityMs: ${initActivity.lastMs},
          agentSources: ${agentSourcesJson},
          latestSession: ${latestSession ? JSON.stringify({
            source: latestSession.source,
            model: latestSession.model,
            totalLlmCalls: latestSession.totalLlmCalls,
            totalToolCalls: latestSession.totalToolCalls,
            durationMs: latestSession.durationMs,
            errors: latestSession.errors,
            cacheHitRate: latestSession.cacheHitRate,
          }) : 'null'}
        };
      </script>
      <script src="${sidebarJsUri}"></script>
    </body>
    </html>`
  }

}
