import { useState, useEffect, useRef } from 'preact/hooks'
import { signal } from '@preact/signals'
import {
  workspaceFilter, filteredSessions, activeTab, sessionTextFilter, vscode,
} from '../state'
import { calcSessionCost } from '../sessionMetrics'
import type { SessionSummaryCard } from '../types'

// ── Frontend re-implementation of core analysis (mirrors src/ logic) ──────────

type SuggestionCategory = 'context' | 'behavior' | 'prompting'
type TargetAgent = 'claude_code' | 'copilot' | 'codex'

interface SuggestionCard {
  id: string
  category: SuggestionCategory
  title: string
  evidence: string
  suggestedText: string
  targetAgents: TargetAgent[]
  priority: 'high' | 'medium' | 'low'
  evidenceSessions: string[]
}

interface InstructionFile {
  agent: string
  label: string
  relativePath: string
  exists: boolean
  content: string
}

interface AppliedRecord {
  id: string
  workspace: string
  category: string
  title: string
  suggestedText: string
  appliedTo: string
  appliedText: string
  appliedAt: string
  appliedAtMs: number
  baselineCostAvg: number
  baselineTurnsAvg: number
  baselineInsufficient: boolean
}

// ── Signals for instruction state ─────────────────────────────────────────────

export const instructionFiles = signal<InstructionFile[]>([])
export const appliedSuggestions = signal<AppliedRecord[]>([])
export const dismissedIds = signal<Set<string>>(new Set())

// ── Helpers ───────────────────────────────────────────────────────────────────

const CAT_COLOR: Record<SuggestionCategory, string> = {
  context:   '#4fc3f7',
  behavior:  '#ffb74d',
  prompting: '#ba68c8',
}

const AGENT_LABEL: Record<string, string> = {
  claude_code: 'Claude',
  copilot:     'Copilot',
  codex:       'Codex',
}

function sessionCostUsd(s: SessionSummaryCard): number {
  return calcSessionCost(s, 'token').totalUsd
}

function makeId(prefix: string, key: string): string {
  return `${prefix}:${key.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`
}

function pct(n: number, total: number): number { return Math.round((n / total) * 100) }

// ── Suggestion generation (pure frontend) ────────────────────────────────────

function getHotFileSuggestions(sessions: SessionSummaryCard[], existingText: string): SuggestionCard[] {
  if (sessions.length < 5) return []
  const fileFreq = new Map<string, string[]>()
  for (const s of sessions) {
    const seen = new Set<string>()
    for (const f of [...(s.filesRead ?? []), ...(s.filesChanged ?? [])]) {
      if (!seen.has(f)) {
        seen.add(f)
        if (!fileFreq.has(f)) fileFreq.set(f, [])
        fileFreq.get(f)!.push(s.sessionId)
      }
    }
  }
  const results: SuggestionCard[] = []
  for (const [file, ids] of fileFreq) {
    if (ids.length / sessions.length < 0.4) continue
    const basename = file.replace(/\\/g, '/').split('/').pop() ?? file
    if (existingText.toLowerCase().includes(basename.toLowerCase())) continue
    if (basename.length < 4) continue
    const parts = file.replace(/\\/g, '/').split('/')
    const subsystem = parts.length >= 2 ? parts[parts.length - 2] : 'this area'
    results.push({
      id: makeId('hot_file', file),
      category: 'context',
      title: `Add ${basename} to instruction file`,
      evidence: `Read in ${ids.length} of ${sessions.length} sessions (${pct(ids.length, sessions.length)}%). Each agent discovery adds ~2–3 turns.`,
      suggestedText: `Always read \`${file}\` before editing ${subsystem} — it is frequently needed context.`,
      targetAgents: ['claude_code', 'codex'],
      priority: ids.length / sessions.length >= 0.6 ? 'high' : 'medium',
      evidenceSessions: ids,
    })
  }
  return results.sort((a, b) => b.evidenceSessions.length - a.evidenceSessions.length).slice(0, 6)
}

const LOOP_TEXT: Record<string, string> = {
  exact_tool_repeat:
    'After reading a file, do not re-read it unless you have modified it. If a tool call produces no new information, stop and ask the user rather than retrying.',
  edit_revert_cycle:
    'Before editing any file, state the exact final state you intend to produce. Do not oscillate between two states — if a second edit would revert a prior one, stop and ask for clarification.',
  error_recurrence:
    'If the same error appears twice, do not attempt a third fix without pausing to verify that the package, function, or file path actually exists.',
  runaway_steps:
    'Each task must have an explicit stopping condition. If a task has no clear end state, ask before starting. Break multi-step work into one task at a time.',
  token_runaway:
    'If input context exceeds 80K tokens without producing a final result, stop and summarize what you have tried so the user can redirect you.',
}

function getLoopSuggestions(sessions: SessionSummaryCard[]): SuggestionCard[] {
  if (sessions.length < 5) return []
  const signalMap = new Map<string, string[]>()
  for (const s of sessions) {
    for (const sig of s.loopSignals ?? []) {
      if (!signalMap.has(sig.type)) signalMap.set(sig.type, [])
      signalMap.get(sig.type)!.push(s.sessionId)
    }
  }
  const results: SuggestionCard[] = []
  for (const [type, ids] of signalMap) {
    if (ids.length / sessions.length < 0.2) continue
    const text = LOOP_TEXT[type]
    if (!text) continue
    results.push({
      id: makeId('loop', type),
      category: 'behavior',
      title: `Prevent ${type.replace(/_/g, ' ')} loops`,
      evidence: `Signal "${type}" detected in ${ids.length} of ${sessions.length} sessions (${pct(ids.length, sessions.length)}%).`,
      suggestedText: text,
      targetAgents: ['claude_code', 'codex'],
      priority: ids.length / sessions.length >= 0.4 ? 'high' : 'medium',
      evidenceSessions: ids,
    })
  }
  return results
}

const SCOPE_PATTERNS = [
  /\brefactor\b|\bclean[- ]up\b|\bimprove\b|\boptimize\b/i,
  /\bfix the bug\b|\bmake it work\b|\bit'?s broken\b/i,
  /\bfind all\b|\blook through\b|\bcheck everywhere\b/i,
  /;\s*also\b|\band then\b|\bfinally\b/i,
]

function getScopeSuggestions(sessions: SessionSummaryCard[]): SuggestionCard[] {
  if (sessions.length < 8) return []
  const avgCost = sessions.reduce((s, sess) => s + sessionCostUsd(sess), 0) / sessions.length
  if (avgCost === 0) return []
  const matching = sessions.filter(s => SCOPE_PATTERNS.some(re => re.test(s.userRequest ?? '')))
  if (matching.length < 3) return []
  const matchAvg = matching.reduce((s, sess) => s + sessionCostUsd(sess), 0) / matching.length
  if (matchAvg < avgCost * 1.8) return []
  return [{
    id: 'prompting:scope',
    category: 'prompting',
    title: 'Add scope prompting guidance',
    evidence: `Sessions with open-ended language cost ${(matchAvg / avgCost).toFixed(1)}× average (${matching.length} of ${sessions.length} sessions).`,
    suggestedText: [
      'Prompting guidance:',
      '- Always name the specific file and function. Don\'t say "refactor" — say "refactor [function] in [file]".',
      '- State the exact error message when reporting a bug, not just that something is broken.',
      '- One task at a time. Multi-part prompts ("fix X, then also do Y") should be split into separate sessions.',
    ].join('\n'),
    targetAgents: ['claude_code', 'copilot', 'codex'],
    priority: 'medium',
    evidenceSessions: matching.map(s => s.sessionId),
  }]
}

function getToolDisciplineSuggestions(sessions: SessionSummaryCard[]): SuggestionCard[] {
  if (sessions.length < 8) return []
  const heavy = sessions.filter(s => {
    const bash = s.toolCounts?.['Bash'] ?? 0
    const read = s.toolCounts?.['Read'] ?? 0
    return bash > 0 && read > 0 && bash > read * 3
  })
  if (heavy.length < 8) return []
  return [{
    id: 'behavior:tool_discipline',
    category: 'behavior',
    title: 'Prefer Read tool over Bash for file inspection',
    evidence: `Bash calls exceed Read 3× in ${heavy.length} of ${sessions.length} sessions (${pct(heavy.length, sessions.length)}%).`,
    suggestedText: 'Prefer the Read tool over Bash for file inspection. Use Bash only for shell operations that cannot be done with a dedicated tool. Do not use cat, head, or tail to read file contents.',
    targetAgents: ['claude_code', 'codex'],
    priority: 'low',
    evidenceSessions: heavy.map(s => s.sessionId),
  }]
}

function generateSuggestions(sessions: SessionSummaryCard[], existingText: string): SuggestionCard[] {
  if (sessions.length < 5) return []
  return [
    ...getHotFileSuggestions(sessions, existingText),
    ...getLoopSuggestions(sessions),
    ...getScopeSuggestions(sessions),
    ...getToolDisciplineSuggestions(sessions),
  ]
}

// ── Prompt Analyzer logic ─────────────────────────────────────────────────────

const STOPWORDS = new Set(['the','and','for','are','but','not','you','all','any','can','had','her',
  'was','one','our','out','day','get','has','him','his','how','its','may','new','now','old','see',
  'two','who','did','let','put','say','she','too','use','with','this','that','from','have','been',
  'will','your','they','what','when','make','like','into','time','then','than','some','just','also',
  'need','want','add','file','code','work','would','could','should','there'])

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^\w\s/.]/g, ' ').split(/\s+/)
    .filter(t => t.length >= 3 && !STOPWORDS.has(t))
}

function jaccard(a: string[], b: string[]): number {
  const setA = new Set(a); const setB = new Set(b)
  if (setA.size === 0 && setB.size === 0) return 0
  let i = 0; for (const t of setA) { if (setB.has(t)) i++ }
  const union = setA.size + setB.size - i
  return union === 0 ? 0 : i / union
}

const PA_RISK_PATTERNS = [
  { re: /\brefactor\b|\bclean[- ]up\b|\bimprove\b|\boptimize\b/i, label: 'Open-ended refactor', suggestion: 'Name the specific function and file instead of saying "refactor the code".' },
  { re: /;\s*also\b|\band then\b|\bfinally\b/i, label: 'Multi-part task', suggestion: 'Split this into separate sessions — multi-part prompts have higher cost variance.' },
  { re: /\bfix the bug\b|\bmake it work\b|\bit'?s broken\b/i, label: 'Fix without specifics', suggestion: 'Include the exact error message and the file where it occurs.' },
  { re: /\bfind all\b|\blook through\b|\bcheck everywhere\b/i, label: 'Discovery task', suggestion: 'Specify what you\'re looking for and where — broad discovery tasks cost 3× average.' },
]

interface AnalysisResult {
  costLow: number; costHigh: number; turnsLow: number; turnsHigh: number
  highVariance: boolean
  predictedFiles: Array<{file: string; count: number; pct: number}>
  risks: Array<{label: string; suggestion: string}>
  similarCount: number
}

function analyzePrompt(prompt: string, sessions: SessionSummaryCard[]): AnalysisResult {
  const tokens = tokenize(prompt)
  const now = Date.now()
  const scored = sessions.map(s => {
    const sim = tokens.length > 0 ? jaccard(tokens, tokenize(s.userRequest ?? '')) : 0
    const ageSec = Math.max(1, (now - Date.parse(s.startTime || '0')) / 1000)
    return { s, score: sim * (1 + (1 / Math.log10(ageSec + 10)) * 0.2) }
  }).filter(x => x.score >= 0.1).sort((a, b) => b.score - a.score).slice(0, 10)

  const similar = scored.map(x => x.s)
  const costs = similar.map(s => sessionCostUsd(s)).filter(c => c > 0)
  const turns = similar.map(s => s.totalLlmCalls).filter(t => t > 0)

  const fileCount = new Map<string, number>()
  for (const s of similar) {
    const seen = new Set<string>()
    for (const f of [...(s.filesChanged ?? []), ...(s.filesRead ?? [])]) {
      if (!seen.has(f)) { seen.add(f); fileCount.set(f, (fileCount.get(f) ?? 0) + 1) }
    }
  }

  const avgCost = sessions.length > 0
    ? sessions.reduce((s, sess) => s + sessionCostUsd(sess), 0) / sessions.length : 0

  const risks = PA_RISK_PATTERNS
    .filter(p => p.re.test(prompt))
    .map(p => ({ label: p.label, suggestion: p.suggestion }))

  const costLow = costs.length ? Math.min(...costs) : 0
  const costHigh = costs.length ? Math.max(...costs) : 0

  return {
    costLow, costHigh,
    turnsLow: turns.length ? Math.min(...turns) : 0,
    turnsHigh: turns.length ? Math.max(...turns) : 0,
    highVariance: costHigh > 0 && costHigh > costLow * 2,
    predictedFiles: [...fileCount.entries()]
      .sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([f, n]) => ({ file: f, count: n, pct: Math.round((n / Math.max(similar.length, 1)) * 100) })),
    risks,
    similarCount: similar.length,
  }
}

// ── Formatting helpers ────────────────────────────────────────────────────────

function fmtUsdRange(low: number, high: number): string {
  const fmt = (v: number) => v < 0.001 ? '<$0.001' : v < 1 ? '$' + v.toFixed(3) : '$' + v.toFixed(2)
  if (low === high) return fmt(low)
  return `${fmt(low)}–${fmt(high)}`
}

function changePctLabel(pct: number | null): string | null {
  if (pct === null) return null
  const sign = pct < 0 ? '↓' : pct > 0 ? '↑' : '→'
  return `${sign} ${Math.abs(Math.round(pct))}%`
}

function changePctColor(pct: number | null): string {
  if (pct === null) return 'var(--muted)'
  if (pct < -10) return '#81c784'
  if (pct >  10) return '#e57373'
  return 'var(--muted)'
}

// ── Components ────────────────────────────────────────────────────────────────

function WorkspaceGate() {
  return (
    <div style="padding:40px 24px;max-width:480px;margin:0 auto;text-align:center">
      <div style="font-size:32px;margin-bottom:12px;opacity:0.4">⚙</div>
      <div style="font-size:14px;font-weight:600;margin-bottom:8px;color:var(--fg)">Select a workspace</div>
      <div style="font-size:12px;color:var(--muted);line-height:1.5">
        Use the project filter above to select a workspace. Instruction suggestions and prompt predictions
        are project-specific — cross-workspace patterns aren't meaningful.
      </div>
    </div>
  )
}

function InsufficientDataState({ workspace, count }: { workspace: string; count: number }) {
  return (
    <div style="padding:32px 24px;max-width:480px;margin:0 auto;text-align:center">
      <div style="font-size:12px;color:var(--muted);line-height:1.5">
        Not enough history yet — AgentLens needs at least 5 sessions in
        <strong style="color:var(--fg);margin:0 4px">{workspace}</strong>
        to detect patterns.<br />
        Current: {count} session{count !== 1 ? 's' : ''}.
      </div>
    </div>
  )
}

function FileStatusBar({ files }: { files: InstructionFile[] }) {
  if (files.length === 0) return null
  return (
    <div style="display:flex;gap:8px;flex-wrap:wrap;padding:10px 16px;border-bottom:1px solid var(--border)">
      {files.map(f => (
        <span
          key={f.agent}
          style={`font-size:10px;padding:3px 8px;border-radius:10px;border:1px solid ${f.exists ? '#81c784' : 'var(--border)'};color:${f.exists ? '#81c784' : 'var(--muted)'}`}
          title={f.exists ? f.relativePath : `Not found: ${f.relativePath}`}
        >
          {f.exists ? '✓' : '✗'} {f.label}
        </span>
      ))}
    </div>
  )
}

function SuggestionCardView({
  card, dismissed, applied, files, onApply, onDismiss,
}: {
  card: SuggestionCard
  dismissed: boolean
  applied: boolean
  files: InstructionFile[]
  onApply: (id: string, targetFile: string, text: string) => void
  onDismiss: (id: string) => void
}) {
  const [editedText, setEditedText] = useState(card.suggestedText)
  const [targetFile, setTargetFile] = useState(files[0]?.relativePath ?? '')
  const [expanded, setExpanded] = useState(false)

  if (dismissed || applied) return null

  const catColor = CAT_COLOR[card.category]
  const availableFiles = files.filter(f => f.exists || true)  // show all for create affordance

  return (
    <div style="border:1px solid var(--border);border-radius:6px;margin-bottom:10px;overflow:hidden">
      <div style="padding:10px 12px;display:flex;align-items:flex-start;gap:8px;cursor:pointer" onClick={() => setExpanded(e => !e)}>
        <span style={`font-size:9px;padding:2px 6px;border-radius:8px;background:${catColor}22;color:${catColor};text-transform:uppercase;letter-spacing:.3px;flex-shrink:0;margin-top:1px`}>
          {card.category}
        </span>
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;font-weight:600;color:var(--fg)">{card.title}</div>
          <div style="font-size:11px;color:var(--muted);margin-top:2px;line-height:1.4">{card.evidence}</div>
          <div style="display:flex;gap:4px;margin-top:4px">
            {card.targetAgents.map(a => (
              <span key={a} style="font-size:9px;padding:1px 5px;border-radius:4px;background:var(--card-bg);color:var(--muted);border:1px solid var(--border)">
                {AGENT_LABEL[a] ?? a}
              </span>
            ))}
          </div>
        </div>
        <div style="display:flex;gap:4px;align-items:center;flex-shrink:0">
          <button
            onClick={e => { e.stopPropagation(); onDismiss(card.id) }}
            style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:14px;padding:0 2px;line-height:1"
            title="Dismiss"
          >×</button>
          <span style={`font-size:10px;color:var(--muted);transition:transform 0.15s;display:inline-block;transform:rotate(${expanded ? 180 : 0}deg)`}>▾</span>
        </div>
      </div>

      {expanded && (
        <div style="padding:10px 12px;border-top:1px solid var(--border);background:var(--card-bg)">
          <div style="font-size:11px;color:var(--muted);margin-bottom:4px">Suggested text (edit before applying):</div>
          <textarea
            value={editedText}
            onInput={e => setEditedText((e.target as HTMLTextAreaElement).value)}
            style="width:100%;box-sizing:border-box;min-height:80px;padding:6px 8px;font-size:11px;font-family:monospace;background:var(--vscode-input-background,#3c3c3c);color:var(--vscode-input-foreground,#ccc);border:1px solid var(--vscode-input-border,#555);border-radius:3px;resize:vertical;outline:none"
          />
          <div style="display:flex;align-items:center;gap:8px;margin-top:8px">
            <span style="font-size:11px;color:var(--muted);white-space:nowrap">Add to:</span>
            {availableFiles.length > 0 ? (
              <select
                value={targetFile}
                onChange={e => setTargetFile((e.target as HTMLSelectElement).value)}
                style="flex:1;padding:3px 6px;font-size:11px;background:var(--vscode-input-background,#3c3c3c);color:var(--vscode-input-foreground,#ccc);border:1px solid var(--vscode-input-border,#555);border-radius:3px;outline:none"
              >
                {availableFiles.map(f => (
                  <option key={f.relativePath} value={f.relativePath}>
                    {f.relativePath}{f.exists ? '' : ' (create)'}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="e.g. CLAUDE.md"
                value={targetFile}
                onInput={e => setTargetFile((e.target as HTMLInputElement).value)}
                style="flex:1;padding:3px 6px;font-size:11px;background:var(--vscode-input-background,#3c3c3c);color:var(--vscode-input-foreground,#ccc);border:1px solid var(--vscode-input-border,#555);border-radius:3px;outline:none"
              />
            )}
            <button
              onClick={() => { if (targetFile && editedText) onApply(card.id, targetFile, editedText) }}
              disabled={!targetFile || !editedText}
              style="padding:3px 12px;font-size:11px;border-radius:4px;cursor:pointer;border:none;background:var(--accent,#4fc3f7);color:#000;font-weight:600;white-space:nowrap"
            >
              Apply
            </button>
            <button
              onClick={() => {
                activeTab.value = 'sessions'
                sessionTextFilter.value = card.evidenceSessions[0] ?? ''
              }}
              style="padding:3px 8px;font-size:11px;border-radius:4px;cursor:pointer;border:1px solid var(--border);background:transparent;color:var(--muted);white-space:nowrap"
              title="View the sessions that triggered this suggestion"
            >
              View sessions ↗
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function AppliedCard({
  record,
  sessions,
  onRemove,
}: {
  record: AppliedRecord
  sessions: SessionSummaryCard[]
  onRemove: (id: string) => void
}) {
  const catColor = CAT_COLOR[(record.category as SuggestionCategory)] ?? '#888'
  const appliedAtMs = record.appliedAtMs

  // Compute post metrics from sessions after appliedAt
  const after = sessions.filter(s => s.startTime && Date.parse(s.startTime) >= appliedAtMs)
  const before = sessions.filter(s => s.startTime && Date.parse(s.startTime) < appliedAtMs).slice(0, 20)

  const avgCost = (arr: SessionSummaryCard[]) =>
    arr.length === 0 ? null : arr.reduce((s, sess) => s + sessionCostUsd(sess), 0) / arr.length
  const avgTurns = (arr: SessionSummaryCard[]) =>
    arr.length === 0 ? null : arr.reduce((s, sess) => s + sess.totalLlmCalls, 0) / arr.length

  const beforeCost  = record.baselineInsufficient ? null : avgCost(before)
  const afterCost   = after.length >= 3 ? avgCost(after) : null
  const beforeTurns = record.baselineInsufficient ? null : avgTurns(before)
  const afterTurns  = after.length >= 3 ? avgTurns(after) : null

  const costPct  = beforeCost && afterCost  ? ((afterCost  - beforeCost)  / beforeCost)  * 100 : null
  const turnsPct = beforeTurns && afterTurns ? ((afterTurns - beforeTurns) / beforeTurns) * 100 : null

  const confidence = after.length < 3 ? 'Collecting data…'
    : after.length < 8  ? 'Low confidence'
    : after.length < 15 ? 'Medium confidence'
    : 'High confidence'

  return (
    <div style="border:1px solid var(--border);border-radius:6px;margin-bottom:8px;overflow:hidden">
      <div style="padding:10px 12px;display:flex;align-items:flex-start;gap:8px">
        <span style={`font-size:9px;padding:2px 6px;border-radius:8px;background:${catColor}22;color:${catColor};text-transform:uppercase;letter-spacing:.3px;flex-shrink:0;margin-top:1px`}>
          {record.category}
        </span>
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;font-weight:600;color:var(--fg)">{record.title}</div>
          <div style="font-size:11px;color:var(--muted)">Applied to {record.appliedTo} — {record.appliedAt.slice(0, 10)}</div>
          <div style="font-size:10px;font-family:monospace;color:var(--muted);margin-top:4px;white-space:pre-wrap;line-height:1.4;max-height:48px;overflow:hidden">
            {record.appliedText}
          </div>

          {(beforeCost !== null || afterCost !== null) && (
            <div style="margin-top:8px;display:flex;gap:16px;flex-wrap:wrap">
              {beforeCost !== null && afterCost !== null && (
                <>
                  <div style="font-size:11px">
                    <span style="color:var(--muted)">Cost: </span>
                    <span>${beforeCost.toFixed(3)}</span>
                    <span style="color:var(--muted)"> → </span>
                    <span>${afterCost.toFixed(3)}</span>
                    {costPct !== null && <span style={`margin-left:4px;color:${changePctColor(costPct)};font-weight:600`}>{changePctLabel(costPct)}</span>}
                  </div>
                  {beforeTurns !== null && afterTurns !== null && (
                    <div style="font-size:11px">
                      <span style="color:var(--muted)">Turns: </span>
                      <span>{beforeTurns.toFixed(1)}</span>
                      <span style="color:var(--muted)"> → </span>
                      <span>{afterTurns.toFixed(1)}</span>
                      {turnsPct !== null && <span style={`margin-left:4px;color:${changePctColor(turnsPct)};font-weight:600`}>{changePctLabel(turnsPct)}</span>}
                    </div>
                  )}
                </>
              )}
              <div style="font-size:10px;color:var(--muted)">{confidence} ({after.length} post sessions)</div>
            </div>
          )}
          {beforeCost === null && (
            <div style="font-size:11px;color:var(--muted);margin-top:6px">Collecting data… (need 3 post-application sessions)</div>
          )}
        </div>
        <button
          onClick={() => onRemove(record.id)}
          style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:11px;padding:0;white-space:nowrap"
          title="Remove from instruction file and move back to pending"
        >Remove</button>
      </div>
    </div>
  )
}

// ── Prompt Analyzer panel ─────────────────────────────────────────────────────

function PromptAnalyzerPanel({ sessions }: { sessions: SessionSummaryCard[] }) {
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)

  function handleAnalyze() {
    if (!prompt.trim()) return
    setResult(analyzePrompt(prompt.trim(), sessions))
    // Also send to extension / MCP if in VS Code
    if (vscode) {
      vscode.postMessage({ type: 'analyzePrompt', prompt: prompt.trim() })
    }
  }

  return (
    <div style="padding:16px">
      <div style="font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.3px;margin-bottom:8px">
        Prompt Analyzer
      </div>
      <div style="font-size:11px;color:var(--muted);margin-bottom:10px;line-height:1.4">
        Paste a prompt you're about to send to get a cost prediction and scope check based on your past sessions in this project.
      </div>
      <textarea
        value={prompt}
        onInput={e => setPrompt((e.target as HTMLTextAreaElement).value)}
        placeholder="Paste your prompt here…"
        style="width:100%;box-sizing:border-box;min-height:72px;padding:8px;font-size:11px;background:var(--vscode-input-background,#3c3c3c);color:var(--vscode-input-foreground,#ccc);border:1px solid var(--vscode-input-border,#555);border-radius:3px;resize:vertical;outline:none"
      />
      <button
        onClick={handleAnalyze}
        disabled={!prompt.trim()}
        style="margin-top:6px;padding:4px 14px;font-size:11px;border-radius:4px;cursor:pointer;border:none;background:var(--accent,#4fc3f7);color:#000;font-weight:600"
      >
        Analyze
      </button>

      {result && (
        <div style="margin-top:14px">
          {result.similarCount === 0 ? (
            <div style="font-size:11px;color:var(--muted)">No similar past sessions found — prediction unavailable.</div>
          ) : (
            <>
              <div style="margin-bottom:10px;padding:8px 10px;background:var(--card-bg);border-radius:4px;border:1px solid var(--border)">
                <div style="font-size:11px;font-weight:600;margin-bottom:4px">Cost & turns prediction</div>
                <div style="font-size:11px;color:var(--muted)">
                  Based on {result.similarCount} similar session{result.similarCount !== 1 ? 's' : ''} in this workspace:
                  <span style="color:var(--fg);margin:0 4px">{fmtUsdRange(result.costLow, result.costHigh)}</span>
                  and
                  <span style="color:var(--fg);margin:0 4px">{result.turnsLow}–{result.turnsHigh} turns</span>
                  {result.highVariance && (
                    <span style="color:#ffb74d;margin-left:4px">⚠ High variance — consider narrowing scope.</span>
                  )}
                </div>
              </div>

              {result.risks.length > 0 && (
                <div style="margin-bottom:10px;padding:8px 10px;background:#ffb74d11;border:1px solid #ffb74d44;border-radius:4px">
                  <div style="font-size:11px;font-weight:600;margin-bottom:6px;color:#ffb74d">Scope risk signals</div>
                  {result.risks.map((r, i) => (
                    <div key={i} style="margin-bottom:6px">
                      <div style="font-size:11px;font-weight:600">{r.label}</div>
                      <div style="font-size:11px;color:var(--muted)">{r.suggestion}</div>
                    </div>
                  ))}
                </div>
              )}

              {result.predictedFiles.length > 0 && (
                <div style="padding:8px 10px;background:var(--card-bg);border-radius:4px;border:1px solid var(--border)">
                  <div style="font-size:11px;font-weight:600;margin-bottom:4px">Likely files to touch</div>
                  {result.predictedFiles.map(f => (
                    <div key={f.file} style="display:flex;justify-content:space-between;font-size:11px;margin-top:3px">
                      <span style="color:var(--muted);font-family:monospace">{f.file.replace(/\\/g, '/').split('/').pop()}</span>
                      <span style="color:var(--muted)">{f.pct}% of similar sessions</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main tab component ────────────────────────────────────────────────────────

export function Instructions() {
  const workspace = workspaceFilter.value
  const sessions = filteredSessions.value

  // Workspace-scoped sessions (already filtered by agentFilteredSessions when ws is set)
  const wsSessions = workspace === 'all'
    ? []
    : sessions.filter(s => (s.workspace ?? '') === workspace || workspace === 'all')

  // Instruction files come from extension via message
  const files = instructionFiles.value
  const applied = appliedSuggestions.value.filter(a => a.workspace === workspace)
  const dismissed = dismissedIds.value

  // Generate suggestions from session data + existing instruction file content
  const existingText = files.map(f => f.content).join('\n')
  const appliedIds = new Set(applied.map(a => a.id))
  const suggestions = workspace === 'all' ? [] : generateSuggestions(wsSessions, existingText)
    .filter(s => !appliedIds.has(s.id))

  // Request instruction files from extension when workspace changes
  useEffect(() => {
    if (workspace !== 'all' && vscode) {
      vscode.postMessage({ type: 'getInstructionFiles', workspace })
      vscode.postMessage({ type: 'getAppliedSuggestions', workspace })
      vscode.postMessage({ type: 'getDismissedSuggestions', workspace })
    }
  }, [workspace])

  function handleApply(id: string, targetFile: string, text: string) {
    const card = suggestions.find(s => s.id === id)
    if (!card) return
    if (vscode) {
      vscode.postMessage({
        type: 'applyInstructionSuggestion',
        id, workspace, targetFile, appliedText: text,
        category: card.category, title: card.title, suggestedText: card.suggestedText,
      })
    } else {
      // Standalone: optimistically add to applied list
      const nowMs = Date.now()
      appliedSuggestions.value = [
        ...appliedSuggestions.value,
        {
          id, workspace, category: card.category, title: card.title,
          suggestedText: card.suggestedText, appliedTo: targetFile,
          appliedText: text, appliedAt: new Date().toISOString(), appliedAtMs: nowMs,
          baselineCostAvg: 0, baselineTurnsAvg: 0, baselineInsufficient: true,
        },
      ]
    }
  }

  function handleDismiss(id: string) {
    dismissedIds.value = new Set([...dismissedIds.value, id])
    if (vscode) vscode.postMessage({ type: 'dismissInstructionSuggestion', id, workspace })
  }

  function handleRemove(id: string) {
    appliedSuggestions.value = appliedSuggestions.value.filter(a => a.id !== id)
    if (vscode) vscode.postMessage({ type: 'removeInstructionSuggestion', id, workspace })
  }

  if (workspace === 'all') {
    return <WorkspaceGate />
  }

  if (wsSessions.length < 5) {
    return <InsufficientDataState workspace={workspace} count={wsSessions.length} />
  }

  const pendingSuggestions = suggestions.filter(s => !dismissed.has(s.id))

  return (
    <div style="display:flex;flex-direction:column;height:100%;overflow-y:auto">
      <FileStatusBar files={files} />

      <div style="flex:1;overflow-y:auto;padding:12px 16px">
        {/* Pending suggestions */}
        {pendingSuggestions.length > 0 && (
          <>
            <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.3px;margin-bottom:8px;display:flex;align-items:center;gap:6px">
              Pending
              <span style="font-size:10px;background:var(--card-bg);border-radius:8px;padding:1px 6px;border:1px solid var(--border)">{pendingSuggestions.length}</span>
            </div>
            {pendingSuggestions.map(card => (
              <SuggestionCardView
                key={card.id}
                card={card}
                dismissed={dismissed.has(card.id)}
                applied={appliedIds.has(card.id)}
                files={files}
                onApply={handleApply}
                onDismiss={handleDismiss}
              />
            ))}
          </>
        )}

        {pendingSuggestions.length === 0 && applied.length === 0 && (
          <div style="padding:20px 0;font-size:12px;color:var(--muted);text-align:center">
            No suggestions detected for this workspace yet.<br />
            <span style="font-size:11px">Suggestions appear when patterns emerge across 5+ sessions.</span>
          </div>
        )}

        {/* Applied suggestions */}
        {applied.length > 0 && (
          <div style="margin-top:16px">
            <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.3px;margin-bottom:8px;display:flex;align-items:center;gap:6px">
              Applied
              <span style="font-size:10px;background:var(--card-bg);border-radius:8px;padding:1px 6px;border:1px solid var(--border)">{applied.length}</span>
            </div>
            {applied.map(rec => (
              <AppliedCard
                key={rec.id}
                record={rec}
                sessions={wsSessions}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}

        {/* Prompt Analyzer */}
        <div style="margin-top:16px;border:1px solid var(--border);border-radius:6px;overflow:hidden">
          <PromptAnalyzerPanel sessions={wsSessions} />
        </div>
      </div>
    </div>
  )
}
