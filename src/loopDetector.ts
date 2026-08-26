/**
 * Loop and malfunction detector for agent sessions.
 *
 * Detects 8 signal types that indicate an agent is stuck, spiraling, or working unreliably:
 *
 *   1. exact_tool_repeat     — identical tool call (by label) executed 3+ times
 *   2. edit_revert_cycle     — a file was edited then reverted to a prior state
 *   3. error_recurrence      — the same error message appearing 3+ times
 *   4. runaway_steps         — too many steps relative to inferred task complexity
 *   5. token_runaway         — context growing rapidly while output stays flat/declines
 *   6. chronic_tool_failures — an unusually high share of tool calls in the session failed
 *   7. context_flooding_risk — a tool call returned a result too large for the model to use well
 *   8. malformed_tool_call   — the agent's own harness rejected a call before it even executed
 *
 * The last 3 started as ad-hoc frontend-only checks (media/src/tabs/Insights.tsx) and a new
 * pattern found during a later failure-mode review, promoted here so MCP tools and the
 * Instruction Advisor's cross-session aggregation — everything that reads session.loopSignals —
 * can see them too, not just the Insights tab.
 *
 * Each detector is exported individually so tests can exercise them in isolation.
 */

import { LoopSignal, LoopSignalType } from './types'
import { SessionSummaryCard } from './spanSummarizer'

// ── Pattern taxonomy names ───────────────────────────────────────────────────

export const PATTERN_NAMES: Record<LoopSignalType, string> = {
  exact_tool_repeat: 'Tool Call Deadlock',
  edit_revert_cycle: 'State Corruption Spiral',
  error_recurrence:  'Hallucination Amplification Loop',
  runaway_steps:     'Ambiguous Success / Escalating Scope',
  token_runaway:     'Infinite Loop — Context Accumulation',
  chronic_tool_failures: 'Chronic Tool Unreliability',
  context_flooding_risk: 'Context Flooding Risk',
  malformed_tool_call:   'Malformed Tool Call',
}

// ── Actionable recommendations per signal type ──────────────────────────────

export const LOOP_SIGNAL_ACTIONS: Record<LoopSignalType, string> = {
  exact_tool_repeat:
    'The agent is calling the same tool with identical arguments repeatedly, usually because it isn\'t using or retaining the result. '
    + 'Add explicit context-retention instructions: "After reading a file, do not re-read it unless you have made changes." '
    + 'Or scope the task more narrowly so the agent can complete it without re-querying the same resource.',

  edit_revert_cycle:
    'The agent is oscillating between two file states — a sign it is trying to reconcile conflicting constraints. '
    + 'Clarify success criteria upfront: provide the exact final state you want, not iterative instructions. '
    + 'If you are using "make it pass the tests", ensure the tests are deterministic and not themselves the source of the conflict.',

  error_recurrence:
    'The same error is repeating, which means the agent\'s fix attempts are not resolving the root cause. '
    + 'This often happens with missing packages, wrong file paths, or hallucinated API names. '
    + 'Verify the package/function exists before asking the agent to use it. '
    + 'If the error persists after 2 attempts, intervene manually rather than asking the agent to retry.',

  runaway_steps:
    'The session used far more steps than expected for this type of task — a sign of unclear success criteria, escalating scope, or a loop. '
    + 'Break the task into smaller, explicitly scoped subtasks with clear completion conditions. '
    + 'Avoid open-ended instructions like "fix all the bugs" or "clean up the code" with no stopping condition.',

  token_runaway:
    'Input context is growing rapidly while useful output is declining — the agent is accumulating context without making forward progress. '
    + 'This pattern often accompanies tool-call loops or repeated failed fixes. '
    + 'Start a fresh session with a focused prompt, or explicitly tell the agent what it has already tried and what to do differently.',

  chronic_tool_failures:
    'A high share of this session\'s tool calls failed — well above the ordinary rate of an occasional wrong path corrected along the way. '
    + 'Be explicit in your prompt about file locations, available commands, and the runtime/package manager in use. '
    + 'Verify paths and commands exist before asking the agent to use them.',

  context_flooding_risk:
    'One or more tool calls returned a very large result, which gets appended to context in full and crowds out everything else for the rest of the session. '
    + 'Use narrower reads — specify line ranges instead of whole files, tighten search patterns, or pipe command output through something that limits it.',

  malformed_tool_call:
    'The agent\'s own harness rejected a tool call before it ran — a wrong argument name, an unknown tool, or malformed arguments. '
    + 'This is different from a normal runtime failure: it means the agent\'s call didn\'t match what the tool expected, not that the codebase has a problem. '
    + 'If this recurs, the agent may be working from an outdated or incorrect idea of what tools are available.',
}

// ── Public API ───────────────────────────────────────────────────────────────

export function detectLoopSignals(session: SessionSummaryCard): LoopSignal[] {
  const signals: LoopSignal[] = []
  detectExactToolRepeat(session, signals)
  detectEditRevertCycle(session, signals)
  detectErrorRecurrence(session, signals)
  detectRunawaySteps(session, signals)
  detectTokenRunaway(session, signals)
  detectChronicToolFailures(session, signals)
  detectContextFloodingRisk(session, signals)
  detectMalformedToolCall(session, signals)
  return signals
}

// ── Detector 1: Exact tool repeat ────────────────────────────────────────────

/**
 * Counts tool call labels verbatim. The label already encodes tool name + key
 * arguments (e.g. "read_file types.ts L1-50"), so an identical label means
 * the agent is making the exact same call again.
 *
 * Thresholds: 3+ occurrences → warning, 5+ → critical.
 */
export function detectExactToolRepeat(session: SessionSummaryCard, signals: LoopSignal[]): void {
  const counts: Record<string, number> = {}
  for (const entry of session.timeline) {
    if (entry.type !== 'tool') { continue }
    const key = (entry.label || '').trim()
    if (!key) { continue }
    counts[key] = (counts[key] || 0) + 1
  }

  const repeated = Object.entries(counts)
    .filter(([, n]) => n >= 3)
    .sort((a, b) => b[1] - a[1])

  if (repeated.length === 0) { return }

  const topCount = repeated[0][1]
  signals.push({
    type: 'exact_tool_repeat',
    severity: topCount >= 5 ? 'critical' : 'warning',
    evidence: `${repeated.length} tool call(s) executed identically 3+ times`,
    count: topCount,
    examples: repeated.slice(0, 3).map(([label, n]) => `"${label.slice(0, 60)}" ×${n}`),
    patternName: PATTERN_NAMES.exact_tool_repeat,
    action: LOOP_SIGNAL_ACTIONS.exact_tool_repeat,
  })
}

// ── Shared: per-file edit extraction ─────────────────────────────────────────

function collectEditDetails(session: SessionSummaryCard, type: 'llm' | 'tool'): Record<string, Array<{ old: string; new: string }>> {
  const fileEdits: Record<string, Array<{ old: string; new: string }>> = {}

  for (const entry of session.timeline) {
    if (entry.type !== type || !entry.editDetails) { continue }
    for (const detail of entry.editDetails) {
      if (!detail.filePath || !detail.oldString || !detail.newString) { continue }
      if (!fileEdits[detail.filePath]) { fileEdits[detail.filePath] = [] }
      fileEdits[detail.filePath].push({ old: detail.oldString, new: detail.newString })
    }
  }

  return fileEdits
}

/**
 * Walks a session's timeline and groups every (oldString, newString) edit pair by the file it
 * touched. Shared by detectEditRevertCycle below and by oneShotRate.ts's retry-rate metric — both
 * need the same "how many times, and how, was each file edited" data, just aggregated differently.
 *
 * For Claude Code, src/summarizers/claude.ts populates edit details in two places for the *same*
 * underlying tool call: on the 'llm' entry from the assistant's gen_ai.output.messages tool_use
 * blocks (primary source, only needs CLAUDE_CODE_ENHANCED_TELEMETRY_BETA), and separately on the
 * 'tool' entry from claude_code.tool span attributes (secondary source, needs
 * OTEL_LOG_TOOL_DETAILS). Reading both unconditionally would double-count every edit when both
 * telemetry flags are set. Instead: prefer 'llm' entries whenever any exist in the session, and
 * only fall back to 'tool' entries when the session has none — restricting to 'tool' only (the
 * original behavior here) silently dropped the primary source, reading zero edits for any session
 * that only had the former.
 */
export function getFileEditCounts(session: SessionSummaryCard): Record<string, Array<{ old: string; new: string }>> {
  const fromLlm = collectEditDetails(session, 'llm')
  if (Object.keys(fromLlm).length > 0) { return fromLlm }
  return collectEditDetails(session, 'tool')
}

// ── Detector 2: Edit-revert cycle ────────────────────────────────────────────

/**
 * Detects when a file is edited (A→B) and later reverted to its prior state
 * (B→A). Checks every pair of edits on the same file for exact string reversal.
 *
 * Always critical when detected — there is no legitimate reason for an agent to
 * undo its own edit unless it is oscillating.
 */
export function detectEditRevertCycle(session: SessionSummaryCard, signals: LoopSignal[]): void {
  const fileEdits = getFileEditCounts(session)

  const revertedFiles: string[] = []

  for (const [file, edits] of Object.entries(fileEdits)) {
    if (edits.length < 2) { continue }
    let reverted = false
    outer:
    for (let j = 1; j < edits.length; j++) {
      for (let i = 0; i < j; i++) {
        if (edits[j].old === edits[i].new && edits[j].new === edits[i].old) {
          reverted = true
          break outer
        }
      }
    }
    if (reverted) { revertedFiles.push(file) }
  }

  if (revertedFiles.length === 0) { return }

  signals.push({
    type: 'edit_revert_cycle',
    severity: 'critical',
    evidence: `${revertedFiles.length} file(s) were edited then reverted to a prior state`,
    count: revertedFiles.length,
    examples: revertedFiles.slice(0, 3).map(f => f.split('/').pop() || f),
    patternName: PATTERN_NAMES.edit_revert_cycle,
    action: LOOP_SIGNAL_ACTIONS.edit_revert_cycle,
  })
}

// ── Detector 3: Error recurrence ─────────────────────────────────────────────

/**
 * Groups error timeline entries by errorMessage content. Falls back to tool
 * label when errorMessage is absent.
 *
 * Thresholds: 3+ occurrences → warning, 5+ → critical.
 */
export function detectErrorRecurrence(session: SessionSummaryCard, signals: LoopSignal[]): void {
  const counts: Record<string, number> = {}
  for (const entry of session.timeline) {
    if (!entry.isError) { continue }
    const key = ((entry.errorMessage || entry.label || 'unknown error').trim()).slice(0, 200)
    counts[key] = (counts[key] || 0) + 1
  }

  const recurring = Object.entries(counts)
    .filter(([, n]) => n >= 3)
    .sort((a, b) => b[1] - a[1])

  if (recurring.length === 0) { return }

  const topCount = recurring[0][1]
  signals.push({
    type: 'error_recurrence',
    severity: topCount >= 5 ? 'critical' : 'warning',
    evidence: `${recurring.length} error(s) recurring 3+ times`,
    count: recurring.reduce((s, [, n]) => s + n, 0),
    examples: recurring.slice(0, 3).map(([msg, n]) => `"${msg.slice(0, 60)}" ×${n}`),
    patternName: PATTERN_NAMES.error_recurrence,
    action: LOOP_SIGNAL_ACTIONS.error_recurrence,
  })
}

// ── Detector 4: Runaway steps ─────────────────────────────────────────────────

const COMPLEX_KEYWORDS = [
  'implement', 'refactor', 'build', 'design', 'migrate', 'convert',
  'rewrite', 'integrate', 'architect', 'scaffold', 'rework',
]
const SIMPLE_KEYWORDS = [
  'fix typo', 'rename', 'delete', 'move file', 'add comment',
  'add line', 'update string', 'change message', 'add import',
]

const STEP_THRESHOLDS = { simple: 15, medium: 35, complex: 80 } as const
type Complexity = keyof typeof STEP_THRESHOLDS

/**
 * Infers task complexity from the user request text and, when available,
 * behavioral signals (number of distinct files the agent touched).
 *
 * The optional session parameter enables behavioral calibration — sessions that
 * touched many files are upgraded to at least medium regardless of prompt text.
 */
export function inferTaskComplexity(
  request: string,
  session?: Pick<SessionSummaryCard, 'filesRead' | 'filesChanged' | 'filesSearched'>,
): Complexity {
  const lower = request.toLowerCase()

  // Behavioral signals override keyword matching when session data is available
  const filesAffected = session
    ? new Set([...session.filesRead, ...session.filesChanged, ...session.filesSearched]).size
    : 0

  if (filesAffected >= 8) { return 'complex' }
  if (filesAffected >= 4) { return 'medium' }

  // Keyword matching
  if (SIMPLE_KEYWORDS.some(k => lower.includes(k))) { return 'simple' }
  const complexMatches = COMPLEX_KEYWORDS.filter(k => lower.includes(k)).length
  if (request.length > 150 || complexMatches >= 2) { return 'complex' }
  if (complexMatches >= 1 || request.length > 80) { return 'medium' }

  // Very short requests with no domain keywords are simple
  if (request.length <= 20) { return 'simple' }
  return 'medium'
}

/**
 * Compares total steps (LLM calls + tool calls) against a complexity-aware
 * threshold. Complexity is inferred from both prompt text and session behavior.
 *
 * Thresholds: >threshold → warning, >2× threshold → critical.
 */
export function detectRunawaySteps(session: SessionSummaryCard, signals: LoopSignal[]): void {
  const totalSteps = session.totalLlmCalls + session.totalToolCalls
  const complexity = inferTaskComplexity(session.userRequest || '', session)
  const threshold = STEP_THRESHOLDS[complexity]

  if (totalSteps <= threshold) { return }

  signals.push({
    type: 'runaway_steps',
    severity: totalSteps >= threshold * 2 ? 'critical' : 'warning',
    evidence: `${totalSteps} steps for a ${complexity} task (threshold: ${threshold})`,
    count: totalSteps,
    examples: [
      `${session.totalLlmCalls} LLM calls`,
      `${session.totalToolCalls} tool calls`,
      `"${(session.userRequest || '').slice(0, 60)}"`,
    ],
    patternName: PATTERN_NAMES.runaway_steps,
    action: LOOP_SIGNAL_ACTIONS.runaway_steps,
  })
}

// ── Detector 5: Token runaway ─────────────────────────────────────────────────

/**
 * Detects context accumulation without forward progress: input tokens growing
 * rapidly across turns while output tokens remain flat or decline.
 *
 * Requires at least 4 LLM calls to establish a trend.
 *
 * Triggers when input grew >15k tokens AND output ratio collapsed to <30% of
 * its starting value (a 70% drop is a strong signal of a stuck agent).
 */
export function detectTokenRunaway(session: SessionSummaryCard, signals: LoopSignal[]): void {
  const llmCalls = session.timeline.filter(
    e => e.type === 'llm' && (e.inputTokens ?? 0) > 0,
  )
  if (llmCalls.length < 4) { return }

  const inputs  = llmCalls.map(e => e.inputTokens  ?? 0)
  const outputs = llmCalls.map(e => e.outputTokens ?? 0)

  const inputGrowth = inputs[inputs.length - 1] - inputs[0]
  if (inputGrowth < 15000) { return }

  const earlyRatio = outputs[0] / Math.max(inputs[0], 1)
  const lateRatio  = outputs[outputs.length - 1] / Math.max(inputs[inputs.length - 1], 1)

  const ratioDrop = earlyRatio > 0.01 && lateRatio < earlyRatio * 0.3

  if (!ratioDrop) { return }

  signals.push({
    type: 'token_runaway',
    severity: inputGrowth > 50000 ? 'critical' : 'warning',
    evidence:
      `Input grew ${inputGrowth.toLocaleString()} tokens across ${llmCalls.length} LLM calls`
      + ` while output ratio collapsed (${(earlyRatio * 100).toFixed(1)}% → ${(lateRatio * 100).toFixed(1)}%)`,
    count: llmCalls.length,
    examples: [
      `First call: ${inputs[0].toLocaleString()} in → ${outputs[0].toLocaleString()} out`,
      `Last call:  ${inputs[inputs.length - 1].toLocaleString()} in → ${outputs[outputs.length - 1].toLocaleString()} out`,
    ],
    patternName: PATTERN_NAMES.token_runaway,
    action: LOOP_SIGNAL_ACTIONS.token_runaway,
  })
}

// ── Detector 6: Chronic tool failures ────────────────────────────────────────

// Below this, an occasional wrong path corrected along the way is normal exploratory behavior,
// not a reliability problem — the threshold needs to sit clearly above that ambient baseline.
// Guessed at 20%/40% pending real calibration against labeled sessions (see
// .staged-issues/tool-reliability-signals.md's open questions) — not measured.
const CHRONIC_FAILURE_WARNING_RATE = 0.2
const CHRONIC_FAILURE_CRITICAL_RATE = 0.4
const CHRONIC_FAILURE_MIN_SAMPLE = 5

/**
 * Promoted from an ad-hoc frontend-only check in Insights.tsx. Unlike error_recurrence (which
 * only fires when the *same* error recurs 3+ times), this catches a session with many different
 * one-off tool failures — a real gap the recurrence-based detector can't see, since nothing here
 * has to repeat.
 *
 * Requires at least 5 tool calls before evaluating, so a 2-of-3 session doesn't read the same as
 * a 20-of-50 one.
 */
export function detectChronicToolFailures(session: SessionSummaryCard, signals: LoopSignal[]): void {
  const toolEntries = session.timeline.filter(e => e.type === 'tool')
  if (toolEntries.length < CHRONIC_FAILURE_MIN_SAMPLE) { return }

  const failedByLabel: Record<string, number> = {}
  let failedCount = 0
  for (const entry of toolEntries) {
    if (!entry.isError) { continue }
    failedCount++
    const key = (entry.label || '').split(' ')[0] || 'unknown'
    failedByLabel[key] = (failedByLabel[key] || 0) + 1
  }
  if (failedCount === 0) { return }

  const rate = failedCount / toolEntries.length
  if (rate < CHRONIC_FAILURE_WARNING_RATE) { return }

  const topFailing = Object.entries(failedByLabel).sort((a, b) => b[1] - a[1])

  signals.push({
    type: 'chronic_tool_failures',
    severity: rate >= CHRONIC_FAILURE_CRITICAL_RATE ? 'critical' : 'warning',
    evidence: `${failedCount} of ${toolEntries.length} tool calls failed (${(rate * 100).toFixed(0)}%)`,
    count: failedCount,
    examples: topFailing.slice(0, 3).map(([tool, n]) => `${tool} ×${n}`),
    patternName: PATTERN_NAMES.chronic_tool_failures,
    action: LOOP_SIGNAL_ACTIONS.chronic_tool_failures,
  })
}

// ── Detector 7: Context flooding risk ────────────────────────────────────────

const LARGE_RESULT_CHARS = 10_000
const LARGE_RESULT_CRITICAL_KB = 300

/**
 * Promoted from an ad-hoc frontend-only check in Insights.tsx — same underlying threshold
 * (10,000 characters per result). Worth confirming during rollout whether fullResult is already
 * truncated somewhere upstream in the capture pipeline before this check runs on it; if so this
 * threshold needs to be checked against whatever that cap actually is.
 */
export function detectContextFloodingRisk(session: SessionSummaryCard, signals: LoopSignal[]): void {
  const largeResults: Array<{ tool: string; size: number }> = []
  for (const entry of session.timeline) {
    if (entry.type !== 'tool' || !entry.fullResult) { continue }
    if (entry.fullResult.length <= LARGE_RESULT_CHARS) { continue }
    largeResults.push({ tool: (entry.label || '').split(' ')[0] || 'unknown', size: entry.fullResult.length })
  }
  if (largeResults.length === 0) { return }

  largeResults.sort((a, b) => b.size - a.size)
  const totalKb = largeResults.reduce((s, r) => s + r.size, 0) / 1024

  signals.push({
    type: 'context_flooding_risk',
    severity: totalKb >= LARGE_RESULT_CRITICAL_KB ? 'critical' : 'warning',
    evidence: `${largeResults.length} tool call(s) returned large results (${totalKb.toFixed(0)}KB total)`,
    count: largeResults.length,
    examples: largeResults.slice(0, 3).map(r => `${r.tool} (${(r.size / 1024).toFixed(1)}KB)`),
    patternName: PATTERN_NAMES.context_flooding_risk,
    action: LOOP_SIGNAL_ACTIONS.context_flooding_risk,
  })
}

// ── Detector 8: Malformed tool call ──────────────────────────────────────────

// Matches an agent harness rejecting a call before execution, not a normal runtime failure.
// Best-guess wording, not verified against real session text from each agent (Claude Code, Codex,
// and Copilot each have their own harness and error format) — see this signal's open question in
// .staged-issues/tool-reliability-signals.md before trusting this in production.
const MALFORMED_CALL_PATTERN =
  /\b(invalid tool call|unknown tool|unrecognized tool|missing required (parameter|argument|field)|failed to parse (arguments|input)|invalid (arguments|argument|parameters)|unrecognized (field|argument|parameter)|tool .* not found|no such tool)\b/i

/**
 * Unlike error_recurrence, this doesn't need 3+ occurrences to fire — a single rejected call
 * already means the agent's call didn't match what the tool expected, which is categorically more
 * certain than an arbitrary runtime error (a failing grep or a broken build is often legitimate
 * signal about the codebase, not the agent).
 */
export function detectMalformedToolCall(session: SessionSummaryCard, signals: LoopSignal[]): void {
  const matches: string[] = []
  for (const entry of session.timeline) {
    if (entry.type !== 'tool' || !entry.isError) { continue }
    const text = entry.errorMessage || entry.label || ''
    if (MALFORMED_CALL_PATTERN.test(text)) { matches.push(text.slice(0, 100)) }
  }
  if (matches.length === 0) { return }

  signals.push({
    type: 'malformed_tool_call',
    severity: matches.length >= 3 ? 'critical' : 'warning',
    evidence: `${matches.length} tool call(s) rejected by the agent's own harness before executing`,
    count: matches.length,
    examples: matches.slice(0, 3),
    patternName: PATTERN_NAMES.malformed_tool_call,
    action: LOOP_SIGNAL_ACTIONS.malformed_tool_call,
  })
}
