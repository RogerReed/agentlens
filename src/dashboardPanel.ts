import * as vscode from 'vscode'
import { SidebarPanel } from './sidebarPanel'
import { SessionRepository } from './sessionRepository'

export class DashboardPanel {
  public static currentPanel: DashboardPanel | undefined
  private readonly panel: vscode.WebviewPanel
  private disposables: vscode.Disposable[] = []
  private pendingUpdate: ReturnType<typeof setTimeout> | undefined

  static show(context: vscode.ExtensionContext, repo: SessionRepository, sidebarProvider?: SidebarPanel) {
    if (DashboardPanel.currentPanel) {
      DashboardPanel.currentPanel.panel.reveal()
      DashboardPanel.currentPanel.update()
      return
    }
    const panel = vscode.window.createWebviewPanel(
      'agentLens.fullDashboard',
      'AgentLens Dashboard',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')]
      }
    )
    DashboardPanel.currentPanel = new DashboardPanel(panel, context, repo, sidebarProvider)
  }

  static setRepository(repo: SessionRepository) {
    if (DashboardPanel.currentPanel) {
      DashboardPanel.currentPanel.repo = repo
      DashboardPanel.currentPanel.update()
    }
  }

  static switchToTab(tab: string) {
    DashboardPanel.currentPanel?.panel.webview.postMessage({ type: 'switchTab', tab })
  }

  static sendFilter(agentFilter?: string, sessionLimit?: number) {
    DashboardPanel.currentPanel?.panel.webview.postMessage({ type: 'setFilter', agentFilter, sessionLimit })
  }

  static sendClearAll() {
    DashboardPanel.currentPanel?.panel.webview.postMessage({ type: 'clearAll' })
  }

  static disposePanel() {
    DashboardPanel.currentPanel?.dispose()
  }

  private constructor(
    panel: vscode.WebviewPanel,
    private context: vscode.ExtensionContext,
    private repo: SessionRepository,
    private sidebarProvider?: SidebarPanel
  ) {
    this.panel = panel
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables)
    this.panel.webview.html = this.getHtml()

    this.panel.webview.onDidReceiveMessage(async msg => {
      if (msg.type === 'confirmClear') {
        const answer = await vscode.window.showWarningMessage(
          'Clear all AgentLens session data? This cannot be undone.',
          { modal: true },
          'Clear All'
        )
        if (answer === 'Clear All') {
          vscode.commands.executeCommand('agentLens.clearSessions')
          this.panel.webview.postMessage({ type: 'clearAll' })
          this.update()
        }
      } else if (msg.type === 'clearAll') {
        vscode.commands.executeCommand('agentLens.clearSessions')
        this.update()
      } else if (msg.type === 'loadSessionDetail' && msg.sessionId) {
        const timeline = this.repo.loadSessionTimeline(msg.sessionId as string)
        this.panel.webview.postMessage({ type: 'sessionDetail', sessionId: msg.sessionId, timeline })
      } else if (msg.type === 'loadBlob' && msg.spanId && msg.field) {
        const content = await this.repo.loadBlob(
          msg.spanId as string,
          msg.field as 'response' | 'thinking' | 'tool-input' | 'full-result' | 'edit-old' | 'edit-new',
          msg.editIndex as number | undefined,
        )
        this.panel.webview.postMessage({ type: 'blobContent', spanId: msg.spanId, field: msg.field, content })
      } else if (msg.type === 'askAI' && msg.prompt) {
        const prompt = `The following efficiency issue was detected in my AI coding session. Help me fix it:\n\n${msg.prompt}`
        openAIChat(prompt, msg.agent)
      } else if (msg.type === 'alert' && msg.label) {
        handleAlertNotification(msg as { label: string; detail?: string; severity: string }, context, repo, sidebarProvider)
      } else if (msg.type === 'automation' && msg.prompt) {
        handleAutomation(msg as { label: string; writePromptsFile: boolean; agent: string; sessionTitle: string; prompt: string })
      } else if (msg.type === 'openFile' && msg.filePath) {
        const uri = vscode.Uri.file(msg.filePath)
        vscode.window.showTextDocument(uri, { preview: true }).then(undefined, () => {
          vscode.window.showWarningMessage(`Could not open file: ${msg.filePath}`)
        })
      } else if (msg.type === 'agentFilterChanged' && this.sidebarProvider) {
        this.sidebarProvider.setAgentFilter(msg.value || 'all')
      } else if (msg.type === 'searchSessions' && msg.query) {
        const result = this.repo.searchSessions(msg.query as import('./sessionRepository').SearchQuery)
        this.panel.webview.postMessage({
          type: 'searchResults',
          sessions: result.sessions,
          totalCount: result.totalCount,
          offset: (msg.query as { offset?: number }).offset ?? 0,
          context: (msg as { context?: string }).context ?? 'search',
        })
      } else if (msg.type === 'exportSessionData' || msg.type === 'exportSessionDataRedacted') {
        const redact = msg.type === 'exportSessionDataRedacted'
        void this.exportSessions(redact)
      } else if (msg.type === 'openSidebar') {
        vscode.commands.executeCommand('workbench.view.extension.agent-lens')
      } else if (msg.type === 'closeSidebar') {
        vscode.commands.executeCommand('workbench.action.closeSidebar')
      }
    }, null, this.disposables)

    const pushDisposable = repo.onUpdate(() => this.scheduleUpdate())
    this.disposables.push(pushDisposable)
    const interval = setInterval(() => this.update(), 10000)
    this.disposables.push({ dispose: () => clearInterval(interval) })
  }

  private scheduleUpdate() {
    if (this.pendingUpdate) { return }
    this.pendingUpdate = setTimeout(() => {
      this.pendingUpdate = undefined
      this.update()
    }, 300)
  }

  update() {
    const sessions = this.repo.listSessions()
    const summary = this.repo.store_.getSummary()
    const sessionSummary = sessions.length > 0
      ? { sessions, backgroundSpans: [], efficiency: buildEfficiency(sessions) }
      : null

    // Analytics data: 7-day hourly stats + lifetime totals.
    const since7d = Date.now() - 7 * 86_400_000
    const dailyStats = this.repo.queryHourlyStats({ since: since7d })
    const lifetimeStats = this.repo.queryLifetimeStats()

    // Burn rate for the most recently updated live session (< 2 min old).
    const recentCutoff = Date.now() - 2 * 60_000
    const activeSession = sessions.find(s => Date.parse(s.startTime) > recentCutoff)
    const burnRateResult = activeSession
      ? this.repo.queryBurnRate(activeSession.sessionId)
      : null

    this.panel.webview.postMessage({
      type: 'update',
      summary,
      sessionSummary,
      analyticsData: { dailyStats, lifetimeStats },
      burnRate: burnRateResult
        ? { sessionId: activeSession!.sessionId, ...burnRateResult }
        : null,
    })
  }

  private async exportSessions(redact: boolean): Promise<void> {
    const sessions = this.repo.listSessions()
    if (sessions.length === 0) {
      vscode.window.showInformationMessage('AgentLens: No session data to export')
      return
    }

    const exportable = sessions.map(s => {
      const base = {
        sessionId:        s.sessionId,
        traceId:          s.traceId,
        source:           s.source,
        model:            s.model,
        startTime:        s.startTime,
        durationMs:       s.durationMs,
        turns:            s.totalLlmCalls,
        totalToolCalls:   s.totalToolCalls,
        inputTokens:      s.inputTokens,
        outputTokens:     s.outputTokens,
        cacheReadTokens:  s.cacheReadTokens,
        cacheCreateTokens: s.cacheCreateTokens,
        cacheHitRate:     s.cacheHitRate,
        errors:           s.errors,
        outcome:          s.outcome,
        toolCounts:       s.toolCounts,
        filesRead:        s.filesRead,
        filesChanged:     s.filesChanged,
        loopSignals:      s.loopSignals,
      }
      if (redact) return base
      return { ...base, userRequest: s.userRequest }
    })

    const now = new Date()
    const pad = (n: number) => n.toString().padStart(2, '0')
    const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
    const prefix = redact ? 'export_redacted' : 'export'
    const filename = `${prefix}_sessions_${ts}.json`

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]
    const baseUri = workspaceFolder ? workspaceFolder.uri : this.context.globalStorageUri
    const fileUri = vscode.Uri.joinPath(baseUri, filename)

    await vscode.workspace.fs.writeFile(fileUri, Buffer.from(JSON.stringify(exportable, null, 2)))
    vscode.window.showInformationMessage(`AgentLens: Exported ${sessions.length} sessions to ${filename}`)
    const doc = await vscode.workspace.openTextDocument(fileUri)
    vscode.window.showTextDocument(doc, { preview: false })
  }

  private dispose() {
    DashboardPanel.currentPanel = undefined
    if (this.pendingUpdate) { clearTimeout(this.pendingUpdate); this.pendingUpdate = undefined }
    this.panel.dispose()
    this.disposables.forEach(d => d.dispose())
  }

  private getWebviewUri(filename: string): vscode.Uri {
    return this.panel.webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'media', filename)
    )
  }

  private getHtml(): string {
    const summary = this.repo.store_.getSummary()
    const cssUri = this.getWebviewUri('dashboard.css')
    const jsUri = this.getWebviewUri('dashboard.js')
    const mascotUri = this.getWebviewUri('help-mascot.png')
    const nonce = getNonce()

    const sessions = this.repo.listSessions()
    const sessionSummary = sessions.length > 0
      ? { sessions, backgroundSpans: [], efficiency: buildEfficiency(sessions) }
      : null

    const initialData = `<script nonce="${nonce}">
        window.__INITIAL_TOOL_CALLS__ = ${safeJsonForScript(summary.toolCalls)};
        window.__INITIAL_SESSION_SUMMARY__ = ${safeJsonForScript(sessionSummary)};
        window.__MASCOT_URI__ = ${safeJsonForScript(mascotUri.toString())};
      </script>`

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none'; img-src ${this.panel.webview.cspSource}; style-src ${this.panel.webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' ${this.panel.webview.cspSource};">
  <link rel="stylesheet" href="${cssUri}">
</head>
<body>
  ${initialData}
  <div id="app"></div>
  <script nonce="${nonce}" src="${jsUri}"></script>
</body>
</html>`
  }
}

// ── Efficiency stub ───────────────────────────────────────────────────────────

import type { SessionSummaryCard } from './summarizers/summarizerTypes'

function buildEfficiency(sessions: SessionSummaryCard[]) {
  const totalInput = sessions.reduce((a, s) => a + s.inputTokens, 0)
  const totalOutput = sessions.reduce((a, s) => a + s.outputTokens, 0)
  const totalLlm = sessions.reduce((a, s) => a + s.totalLlmCalls, 0)
  return {
    totalInputTokens: totalInput,
    totalOutputTokens: totalOutput,
    totalLlmCalls: totalLlm,
    avgInputPerCall: totalLlm > 0 ? Math.round(totalInput / totalLlm) : 0,
    avgTtft: 0,
    cacheHitRate: sessions.length > 0
      ? sessions.reduce((a, s) => a + s.cacheHitRate, 0) / sessions.length : 0,
    toolDefWaste: 0,
    sysInstructionWaste: 0,
    topTokenConsumers: [],
  }
}

// ── Alert / automation helpers (unchanged) ────────────────────────────────────

async function handleAlertNotification(
  msg: { label: string; detail?: string; severity: string },
  context: vscode.ExtensionContext,
  repo: SessionRepository,
  sidebarProvider?: SidebarPanel
): Promise<void> {
  const text = `AgentLens Alert: ${msg.label}${msg.detail ? ' — ' + msg.detail : ''}`
  const clipboardPrompt = [
    "An alert was triggered in my AI coding session. Please explain what's happening and how I should respond.",
    '',
    `Alert: ${msg.label}`,
    ...(msg.detail ? [`Detail: ${msg.detail}`] : []),
  ].join('\n')

  let promise: Thenable<string | undefined>
  if (msg.severity === 'error') {
    promise = vscode.window.showErrorMessage(text, 'View Alerts', 'Copy Prompt')
  } else if (msg.severity === 'info') {
    promise = vscode.window.showInformationMessage(text, 'View Alerts', 'Copy Prompt')
  } else {
    promise = vscode.window.showWarningMessage(text, 'View Alerts', 'Copy Prompt')
  }
  promise.then(action => {
    if (action === 'View Alerts') {
      DashboardPanel.show(context, repo, sidebarProvider)
      DashboardPanel.switchToTab('alerts')
    } else if (action === 'Copy Prompt') {
      vscode.env.clipboard.writeText(clipboardPrompt).then(() => {
        vscode.window.showInformationMessage('AgentLens: Alert prompt copied — paste into your AI chat.')
      })
    }
  })
}

async function openAIChat(prompt: string, agent?: string): Promise<void> {
  const commands = await vscode.commands.getCommands(true)
  if (agent === 'copilot') {
    const cmd = ['github.copilot.chat.open', 'workbench.action.chat.open'].find(c => commands.includes(c))
    if (cmd) { vscode.commands.executeCommand(cmd, { query: prompt }); return }
  }
  await vscode.env.clipboard.writeText(prompt)
  const label = agent === 'claude_code' ? 'Claude' : agent === 'codex' ? 'Codex' : 'AI'
  vscode.window.showInformationMessage(`AgentLens: Prompt copied — paste into your ${label} session.`)
}

async function writeAutomationPrompt(agent: string, label: string, fullPrompt: string): Promise<string | undefined> {
  const agentSlug = agent === 'claude_code' ? 'claude' : agent === 'codex' ? 'codex' : 'copilot'
  const agentName = agent === 'claude_code' ? 'Claude' : agent === 'codex' ? 'Codex' : 'Copilot'
  const filename = `agentlens-prompts-${agentSlug}.md`
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0]
  if (!workspaceFolder) {
    vscode.window.showWarningMessage('AgentLens: No workspace folder open — cannot write prompts file.')
    return undefined
  }
  const fileUri = vscode.Uri.joinPath(workspaceFolder.uri, filename)
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19)
  const entry = `## ${timestamp} — ${label}\n\n${fullPrompt}\n\n---\n\n`
  let existing = ''
  try {
    const data = await vscode.workspace.fs.readFile(fileUri)
    existing = Buffer.from(data).toString('utf8')
  } catch { /* file doesn't exist yet */ }
  const content = existing ? existing + entry : `# Automation Prompts — ${agentName}\n\n${entry}`
  await vscode.workspace.fs.writeFile(fileUri, Buffer.from(content, 'utf8'))
  return filename
}

async function handleAutomation(msg: { label: string; writePromptsFile: boolean; agent: string; sessionTitle: string; sessionId?: string; prompt: string }): Promise<void> {
  const agentLabel = msg.agent === 'claude_code' ? 'Claude' : msg.agent === 'copilot' ? 'Copilot' : msg.agent === 'codex' ? 'Codex' : 'AI'
  const sessionLine = msg.sessionId ? `Session ID: ${msg.sessionId}\n` : ''
  const fullPrompt = `[${msg.label}]\n\n${sessionLine}${msg.prompt}`
  if (msg.writePromptsFile) {
    const filename = await writeAutomationPrompt(msg.agent, msg.label, fullPrompt)
    if (filename) {
      vscode.window.showInformationMessage(`AgentLens Automation [${msg.label}]: prompt written to ${filename}`, 'Dismiss')
    }
    return
  }

  const action = await vscode.window.showWarningMessage(
    `AgentLens Automation [${msg.label}]`,
    { modal: false },
    'Copy Prompt',
    'Dismiss',
  )
  if (action === 'Copy Prompt') {
    await vscode.env.clipboard.writeText(fullPrompt)
    vscode.window.showInformationMessage(`AgentLens: Prompt copied — paste into your ${agentLabel} session.`)
  }
}

function getNonce(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let nonce = ''
  for (let i = 0; i < 32; i++) {
    nonce += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return nonce
}

function safeJsonForScript(data: unknown): string {
  return JSON.stringify(data)
    .replace(/<\//g, '<\\/')
    .replace(/<!--/g, '<\\!--')
    .replace(/\$\{/g, '\\${')
}
