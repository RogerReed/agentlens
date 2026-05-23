declare const acquireVsCodeApi: () => { postMessage(msg: unknown): void }

interface LatestSession {
  source: string
  model: string
  totalLlmCalls: number
  totalToolCalls: number
  durationMs: number
  errors: number
  cacheHitRate: number
}

interface SidebarInit {
  lastActivityMs: number
  agentSources: string[]
  latestSession: LatestSession | null
}

declare const __SIDEBAR_INIT__: SidebarInit

function formatCompact(n: number): string {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

function formatDuration(ms: number): string {
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`
  return `${Math.round(ms / 60_000)}m`
}

function formatAgo(ms: number): string {
  if (!ms) return 'No activity yet'
  const secs = Math.floor((Date.now() - ms) / 1000)
  if (secs < 60) return `${secs}s ago`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ago`
}

let lastActivityMs = __SIDEBAR_INIT__.lastActivityMs

function updateStatus(isActive: boolean, ms?: number) {
  const dot = document.getElementById('statusDot')
  const text = document.getElementById('statusText')
  const label = document.getElementById('statusLabel')
  if (!dot || !text || !label) return
  if (ms) lastActivityMs = ms
  if (isActive) {
    dot.className = 'status-dot active'
    text.textContent = 'Active'
    text.style.color = 'var(--vscode-foreground)'
    label.textContent = ''
  } else {
    dot.className = 'status-dot idle'
    text.textContent = 'Idle'
    text.style.color = 'var(--vscode-descriptionForeground)'
    label.textContent = lastActivityMs ? formatAgo(lastActivityMs) : 'No activity yet'
  }
}

setInterval(() => {
  const dot = document.getElementById('statusDot')
  if (dot?.classList.contains('idle') && lastActivityMs) {
    const label = document.getElementById('statusLabel')
    if (label) label.textContent = formatAgo(lastActivityMs)
  }
}, 10000)

function getAgentColor(source: string): string {
  if (source === 'claude_code') return '#FFB085'
  if (source === 'codex') return '#F0FF42'
  if (source === 'copilot') return '#00EAFF'
  return '#90a4ae'
}

function getAgentLabel(source: string): string {
  if (source === 'claude_code') return 'Claude'
  if (source === 'codex') return 'Codex'
  return 'Copilot'
}

function refreshAgentKey(sources: string[]) {
  const el = document.getElementById('agentKey')
  if (!el) return
  if (!sources.length) { el.innerHTML = ''; return }
  el.innerHTML = `<div style="display:flex;gap:10px;font-size:10px;color:var(--vscode-descriptionForeground);align-items:center;flex-wrap:wrap">${
    sources.map(src =>
      `<span style="display:flex;align-items:center;gap:4px">` +
      `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${getAgentColor(src)}"></span>` +
      `${getAgentLabel(src)}</span>`
    ).join('')
  }</div>`
}

function renderLatestSession(s: LatestSession | null) {
  const card = document.getElementById('latestSessionCard') as HTMLElement | null
  const body = document.getElementById('latestSessionBody')
  if (!card || !body) return
  if (!s) { card.style.display = 'none'; return }
  card.style.display = ''
  const agentLabel = s.source === 'claude_code' ? 'Claude' : s.source === 'codex' ? 'Codex' : 'Copilot'
  const errHtml = s.errors > 0
    ? `<span style="color:var(--vscode-testing-iconFailed,#f44)">${s.errors} err</span>`
    : ''
  body.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:3px">
      <span style="color:var(--vscode-descriptionForeground)">${agentLabel}</span>
      <span style="color:var(--vscode-descriptionForeground)">${formatDuration(s.durationMs)}</span>
    </div>
    <div style="color:var(--vscode-textLink-foreground);margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.model || '—'}</div>
    <div style="display:flex;gap:12px;font-size:10px;color:var(--vscode-descriptionForeground)">
      <span>${s.totalLlmCalls} turn${s.totalLlmCalls !== 1 ? 's' : ''}</span>
      <span>${s.totalToolCalls} tool${s.totalToolCalls !== 1 ? 's' : ''}</span>
      ${errHtml}
      <span>${Math.round(s.cacheHitRate * 100)}% cache</span>
    </div>`
}

let agentSources = __SIDEBAR_INIT__.agentSources
refreshAgentKey(agentSources)
renderLatestSession(__SIDEBAR_INIT__.latestSession)

const vscode = acquireVsCodeApi()

document.getElementById('sessionLimitSelect')?.addEventListener('change', function (this: HTMLSelectElement) {
  vscode.postMessage({ type: 'setSessionLimit', value: this.value })
})
document.getElementById('agentFilterSelect')?.addEventListener('change', function (this: HTMLSelectElement) {
  vscode.postMessage({ type: 'setAgentFilter', value: this.value })
})
document.getElementById('clearBtn')?.addEventListener('click', () => {
  vscode.postMessage({ type: 'clearAll' })
})
interface UpdateMessage {
  type: 'update'
  sessionCount?: number
  totalOutputTokens?: number
  totalInputTokens?: number
  cacheHitPct?: number
  avgTurns?: number
  totalErrors?: number
  totalToolCalls?: number
  isActive?: boolean
  lastActivityMs?: number
  agentSources?: string[]
  latestSession?: LatestSession | null
}

interface AgentFilterChangedMessage {
  type: 'agentFilterChanged'
  value?: string
}

window.addEventListener('message', (e: MessageEvent<UpdateMessage | AgentFilterChangedMessage>) => {
  const msg = e.data
  if (msg.type === 'update') {
    const countLabel = document.getElementById('sessionCountLabel')
    if (countLabel) countLabel.textContent = String(msg.sessionCount ?? 0)
    const outputEl = document.getElementById('outputTokens')
    const inputEl = document.getElementById('inputTokens')
    const cacheEl = document.getElementById('cacheHitRate')
    const turnsEl = document.getElementById('avgTurns')
    const errorsEl = document.getElementById('totalErrors')
    const toolsEl = document.getElementById('totalToolCalls')
    if (outputEl) outputEl.textContent = formatCompact(msg.totalOutputTokens ?? 0)
    if (inputEl) inputEl.textContent = formatCompact(msg.totalInputTokens ?? 0)
    if (cacheEl) cacheEl.textContent = `${msg.cacheHitPct ?? 0}%`
    if (turnsEl) turnsEl.textContent = String(msg.avgTurns ?? 0)
    if (errorsEl) {
      const n = msg.totalErrors ?? 0
      errorsEl.textContent = String(n)
      errorsEl.style.color = n > 0 ? 'var(--vscode-testing-iconFailed,#f44)' : ''
    }
    if (toolsEl) toolsEl.textContent = String(msg.totalToolCalls ?? 0)
    updateStatus(msg.isActive ?? false, msg.lastActivityMs)
    if (msg.agentSources) {
      agentSources = msg.agentSources
      refreshAgentKey(agentSources)
    }
    if ('latestSession' in msg) {
      renderLatestSession(msg.latestSession ?? null)
    }
  } else if (msg.type === 'agentFilterChanged') {
    const sel = document.getElementById('agentFilterSelect') as HTMLSelectElement | null
    if (sel && msg.value) sel.value = msg.value
  }
})
