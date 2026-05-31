import * as vscode from 'vscode'
import { SessionRepository } from './sessionRepository'
import { nanoToMs } from './summarizers/helpers'
import { Span } from './types'


export class SidebarPanel implements vscode.WebviewViewProvider {
  private view?: vscode.WebviewView
  private collectorError: string | null = null

  constructor(
    private repo: SessionRepository,
    private extensionUri: vscode.Uri,
  ) {}

  setRepository(repo: SessionRepository) {
    this.repo = repo
    this.refresh()
  }

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
      } else if (msg.type === 'clearAll') {
        vscode.commands.executeCommand('agentLens.clearSessions')
        this.refresh()
        const { DashboardPanel } = require('./dashboardPanel')
        DashboardPanel.sendClearAll()
      }
    })

    let pendingRefresh: ReturnType<typeof setTimeout> | undefined
    const scheduleRefresh = () => {
      if (pendingRefresh) return
      pendingRefresh = setTimeout(() => { pendingRefresh = undefined; this.refresh() }, 300)
    }
    const updateDisposable = this.repo.onUpdate(scheduleRefresh)
    const interval = setInterval(() => this.refresh(), 5000)
    webviewView.onDidDispose(() => {
      clearInterval(interval)
      if (pendingRefresh) clearTimeout(pendingRefresh)
      updateDisposable.dispose()
      msgDisposable.dispose()
    })
  }

  setAgentFilter(_value: string) { /* no-op: filtering is per-component in the dashboard */ }
  setSessionLimit(_value: number) { /* no-op: session limit is per-component in the dashboard */ }

  private getSessions() {
    return this.repo.listSessions()
  }

  refresh() {
    if (!this.view) {return}
    const all = this.getSessions()
    // Use most recent 25 for sidebar stats
    const recent = all.slice(0, 25)
    const sessionCount = all.length
    const cacheHitPct = recent.length > 0
      ? Math.round(recent.reduce((a, s) => a + s.cacheHitRate, 0) / recent.length * 100) : 0
    const avgTurns = recent.length > 0
      ? Math.round(recent.reduce((a, s) => a + s.totalLlmCalls, 0) / recent.length * 10) / 10 : 0
    const totalErrors = recent.reduce((a, s) => a + s.errors, 0)
    const totalToolCalls = recent.reduce((a, s) => a + s.totalToolCalls, 0)
    const totalInputTokens = recent.reduce((a, s) => a + s.inputTokens, 0)
    const totalOutputTokens = recent.reduce((a, s) => a + s.outputTokens, 0)
    const activity = this.getLastActivity()
    const AGENT_KEY_ORDER = ['copilot', 'claude_code', 'codex']
    const agentSources = [...new Set(all.map(s => s.source).filter(Boolean))]
      .sort((a, b) => {
        const ai = AGENT_KEY_ORDER.indexOf(a), bi = AGENT_KEY_ORDER.indexOf(b)
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
      })
    const latest = all.length > 0 ? all[0] : null  // newest-first
    const latestSession = latest ? {
      model: latest.model || '',
      source: latest.source,
      totalLlmCalls: latest.totalLlmCalls,
      totalToolCalls: latest.totalToolCalls,
      durationMs: latest.durationMs,
      errors: latest.errors,
      cacheHitRate: latest.cacheHitRate,
      userRequest: latest.userRequest || '',
    } : null

    // Burn rate for the most recent active session (< 2 min old)
    const recentCutoff = Date.now() - 2 * 60_000
    const activeSession = all.find(s => Date.parse(s.startTime) > recentCutoff)
    const burnRateResult = activeSession
      ? this.repo.queryBurnRate(activeSession.sessionId)
      : null

    this.view.webview.postMessage({
      type: 'update', sessionCount, agentSources,
      totalInputTokens, totalOutputTokens,
      cacheHitPct, avgTurns, totalErrors, totalToolCalls,
      isActive: activity.isActive, lastActivityMs: activity.lastMs,
      latestSession,
      burnRate: burnRateResult ? {
        tokensPerMinute: Math.round(burnRateResult.burnRate.tokensPerMinute),
        costPerHour: burnRateResult.burnRate.costPerHour,
      } : null,
    })
  }

  private getLastActivity(): { isActive: boolean; lastMs: number } {
    const spans: Span[] = this.repo.store_.getSpans()
    let lastMs = 0
    for (const span of spans) {
      const ms = span.receivedAt ?? nanoToMs(span.endTime)
      if (ms > lastMs) lastMs = ms
    }
    const isActive = lastMs > 0 && (Date.now() - lastMs) < 20_000
    return { isActive, lastMs }
  }


  private getHtml(webview: vscode.Webview) {
    const initActivity = this.getLastActivity()
    const all = this.getSessions()
    const recent = all.slice(0, 25)
    const sessionCount = all.length
    const cacheHitPct = recent.length > 0
      ? Math.round(recent.reduce((a, s) => a + s.cacheHitRate, 0) / recent.length * 100) : 0
    const avgTurns = recent.length > 0
      ? Math.round(recent.reduce((a, s) => a + s.totalLlmCalls, 0) / recent.length * 10) / 10 : 0
    const totalErrors = recent.reduce((a, s) => a + s.errors, 0)
    const totalToolCalls = recent.reduce((a, s) => a + s.totalToolCalls, 0)
    const tokenTotals = {
      input: recent.reduce((a, s) => a + s.inputTokens, 0),
      output: recent.reduce((a, s) => a + s.outputTokens, 0),
    }
    const latestSession = all.length > 0 ? all[0] : null  // newest-first
    function formatCompact(n: number): string {
      return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
    }
    function formatDuration(ms: number): string {
      if (ms < 60_000) return `${Math.round(ms / 1000)}s`
      return `${Math.round(ms / 60_000)}m`
    }

    const sidebarJsUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'sidebar.js'))

    const AGENT_KEY_ORDER = ['copilot', 'claude_code', 'codex']
    const allAgentSources = [...new Set(all.map(s => s.source).filter(Boolean))]
      .sort((a, b) => {
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

      <!-- Agent key -->
      <div id="agentKey" style="margin-bottom:6px"></div>


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
          <h3><span class="has-tip">Sessions<span class="tip">Total prompt-to-response cycles recorded.</span></span></h3>
          <div class="metric" id="sessionCountLabel" style="font-size:18px">${sessionCount}</div>
          <div class="label">Total</div>
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
            userRequest: latestSession.userRequest,
          }) : 'null'}
        };
      </script>
      <script src="${sidebarJsUri}"></script>
    </body>
    </html>`
  }

}
