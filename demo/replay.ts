#!/usr/bin/env node
/**
 * AgentLens demo replay script
 *
 * Sends realistic OTLP telemetry to the standalone server so every dashboard
 * tab has interesting data to show — no real AI agent required. Every scenario
 * plays out against a single running example (a pet store app: adoption,
 * inventory, checkout, pet-image uploads) so the demo tells one coherent story
 * across scenarios and agents instead of unrelated snippets each time.
 *
 * Full usage and workflow docs: see DEMO.md.
 *
 * Quick reference:
 *   pnpm run demo
 *   pnpm run demo -- --agents codex
 *   pnpm run demo -- --scenario loop --agents claude,codex
 *   pnpm run demo -- --speed 5
 *   pnpm run demo -- --file /path/to/export_redacted_claude_main_20260522_152343.json
 *
 * Scenarios (each runs once per requested agent, except compaction):
 *   normal      Clean multi-turn task — Tokens, Files, Timeline, Efficiency tabs
 *   loop        Same failing command repeated — Loop Breaker automation trigger
 *   errors      Mixed errors + recovery — Errors + Recommendations tabs
 *   compaction  Input tokens grow 4x per turn (Claude only) — Context Compaction trigger
 *   all         All of the above in sequence (default)
 *   story       10 fixed sessions telling one build-out of the petstore app across
 *               claude/codex/copilot — scaffold, data model, inventory, checkout,
 *               image upload, search+caching, e2e tests, deploy hiccup, validation
 *               fix, TODO sweep. --agents filters which chapters run.
 *
 * Agents (--agents, comma-separated, default all three):
 *   claude codex copilot
 */

import * as http   from 'node:http'
import * as fs     from 'node:fs'
import * as path   from 'node:path'
import * as crypto from 'node:crypto'

// ── CLI ────────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
function flag(name: string, fallback: string): string {
  const i = args.indexOf('--' + name)
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback
}
const SPEED    = parseFloat(flag('speed', '1')) || 1
const PORT     = parseInt(flag('port', '4318')) || 4318
const SCENARIO = flag('scenario', 'all')
const FIXTURE  = flag('fixture', '')
const FILE     = flag('file', '')

type Agent = 'claude' | 'codex' | 'copilot'
const ALL_AGENTS: Agent[] = ['claude', 'codex', 'copilot']
const AGENTS: Agent[] = flag('agents', 'claude,codex,copilot')
  .split(',')
  .map(s => s.trim().toLowerCase())
  .filter((s): s is Agent => (ALL_AGENTS as string[]).includes(s))
if (AGENTS.length === 0) AGENTS.push(...ALL_AGENTS)

// ── Primitive helpers ──────────────────────────────────────────────────────────

function hex(bytes: number): string {
  return Array.from({ length: bytes }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join('')
}

function nano(ms: number): string {
  return String(BigInt(Math.round(ms)) * 1_000_000n)
}

function attr(key: string, value: string | number | boolean): object {
  if (typeof value === 'string')  return { key, value: { stringValue: value } }
  if (typeof value === 'boolean') return { key, value: { boolValue: value } }
  return { key, value: { intValue: value } }
}

// Timeline helper — accumulates simulated wall-clock ms from a base offset
class Timeline {
  private t: number
  constructor(offsetBack = 300_000) { this.t = Date.now() - offsetBack }
  tick(ms: number): number { this.t += ms; return this.t }
  now(): number { return this.t }
}

// ── OTLP builders ──────────────────────────────────────────────────────────────

interface SpanOpts {
  traceId: string
  spanId: string
  parentSpanId?: string
  name: string
  startMs: number
  endMs: number
  attrs?: object[]
  error?: boolean
}

function span(o: SpanOpts): object {
  return {
    traceId: o.traceId,
    spanId: o.spanId,
    parentSpanId: o.parentSpanId,
    name: o.name,
    startTimeUnixNano: nano(o.startMs),
    endTimeUnixNano: nano(o.endMs),
    attributes: o.attrs ?? [],
    status: o.error ? { code: 2, message: 'Error' } : { code: 0 },
  }
}

function tracePayload(spans: object[]): object {
  return { resourceSpans: [{ scopeSpans: [{ spans }] }] }
}


// ── Transport ──────────────────────────────────────────────────────────────────

function post(path: '/v1/traces' | '/v1/logs', body: object): Promise<void> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body)
    const req = http.request(
      {
        hostname: '127.0.0.1', port: PORT, method: 'POST', path,
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
      },
      res => { res.resume(); res.on('end', resolve) }
    )
    req.on('error', reject)
    req.write(data); req.end()
  })
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms / SPEED))
}

// The session list sorts by each session's *start* time, so only the very last
// scenario/chapter call in a run needs to start ~now — everything before it can stay
// backdated so a story or scenario sequence still reads chronologically. Anchoring the
// final call here (never literally 0, so it can't tick forward past real "now") makes
// it reliably sort as the newest session.
const FRESH_OFFSET_MS = 1000

function log(msg: string) { process.stdout.write(`\x1b[36m[demo]\x1b[0m ${msg}\n`) }
function ok(msg: string)  { process.stdout.write(`\x1b[32m  ✓\x1b[0m ${msg}\n`) }
function sim(msg: string) { process.stdout.write(`\x1b[33m  ~\x1b[0m [sim] ${msg}\n`) }
function err(msg: string) { process.stderr.write(`\x1b[31m  ✗\x1b[0m ${msg}\n`) }

async function checkServer(): Promise<boolean> {
  return new Promise(resolve => {
    const req = http.request(
      { hostname: '127.0.0.1', port: PORT, method: 'GET', path: '/', timeout: 2000 },
      () => resolve(true)
    )
    req.on('error', () => resolve(false))
    req.on('timeout', () => { req.destroy(); resolve(false) })
    req.end()
  })
}

// ── Claude Code span builders ───────────────────────────────────────────────────

function llmSpan(tl: Timeline, traceId: string, parentId: string, opts: {
  inputTokens: number
  outputTokens: number
  cacheRead?: number
  cacheCreate?: number
  model?: string
  stopReason?: string
  ttft?: number
  thinkMs?: number
  genMs?: number
}): object {
  const start = tl.tick(opts.thinkMs ?? 400)
  const end   = tl.tick(opts.genMs ?? 900)
  return span({
    traceId, spanId: hex(8), parentSpanId: parentId,
    name: 'claude_code.llm_request',
    startMs: start, endMs: end,
    attrs: [
      attr('input_tokens',        opts.inputTokens),
      attr('output_tokens',       opts.outputTokens),
      attr('cache_read_tokens',   opts.cacheRead   ?? 0),
      attr('cache_creation_tokens', opts.cacheCreate ?? opts.inputTokens),
      attr('gen_ai.request.model', opts.model ?? 'claude-sonnet-4-6'),
      attr('stop_reason',         opts.stopReason ?? 'tool_use'),
      attr('ttft_ms',             opts.ttft ?? 280),
    ],
  })
}

function toolSpan(tl: Timeline, traceId: string, parentId: string, opts: {
  toolName: string
  toolInput: object
  durationMs?: number
  error?: boolean
}): object {
  const dur = opts.durationMs ?? 300
  const start = tl.tick(100)
  const end   = tl.tick(dur)
  return span({
    traceId, spanId: hex(8), parentSpanId: parentId,
    name: 'claude_code.tool',
    startMs: start, endMs: end,
    error: opts.error,
    attrs: [
      attr('tool_name',  opts.toolName),
      attr('tool_input', JSON.stringify(opts.toolInput)),
      attr('duration_ms', dur),
    ],
  })
}

function sessionSpan(tl: Timeline, traceId: string, spanId: string, opts: {
  startMs: number
  userRequest: string
  outcome: 'success' | 'error' | 'unknown'
  totalInput: number
  totalOutput: number
}): object {
  const end = tl.tick(200)
  return span({
    traceId, spanId,
    name: 'claude_code.interaction',
    startMs: opts.startMs, endMs: end,
    attrs: [
      attr('user_prompt',        opts.userRequest),
      attr('outcome',            opts.outcome),
      attr('duration_ms',        end - opts.startMs),
      attr('total_input_tokens', opts.totalInput),
      attr('total_output_tokens', opts.totalOutput),
    ],
  })
}

// ── Codex span builders ─────────────────────────────────────────────────────────
// Mirrors demo/generate-fixtures.js's codexDisposeAudit() shape exactly — that
// fixture is validated against src/summarizers/codex.ts via demo/validate-fixtures.js,
// so this reuses a known-correct span pattern rather than a new one.

interface CodexCtx {
  traceId: string
  promptId: string
  baseAttrs: object[]
}

function codexSession(traceId: string): CodexCtx {
  return {
    traceId,
    promptId: hex(8),
    baseAttrs: [
      attr('conversation.id', traceId),
      attr('codex.conversation.id', traceId),
      attr('codex.session.id', traceId),
    ],
  }
}

function codexPromptSpan(tl: Timeline, ctx: CodexCtx, opts: { prompt: string }): object {
  const start = tl.tick(0)
  return span({
    traceId: ctx.traceId, spanId: ctx.promptId,
    name: 'codex.user_prompt',
    startMs: start, endMs: start + 1,
    attrs: [
      ...ctx.baseAttrs,
      attr('event.name', 'codex.user_prompt'),
      attr('prompt', opts.prompt),
      attr('prompt_length', opts.prompt.length),
    ],
  })
}

// One tool-call turn: TTFT + tool_decision (carries token usage) + tool_result + the
// underlying exec span. Matches Codex's real event-based shape — token usage rides on
// the *decision* span, not a separate "llm call" span the way Claude/Copilot model it.
function codexToolTurn(tl: Timeline, ctx: CodexCtx, opts: {
  toolName: string
  args: object
  output: string
  inputTokens: number
  outputTokens: number
  cachedTokens?: number
  model?: string
  ttftMs?: number
  toolDurationMs?: number
  success?: boolean
}): object[] {
  const callId = 'call_' + hex(6)
  const ttftStart = tl.tick(400)
  const ttft = span({
    traceId: ctx.traceId, spanId: hex(8), parentSpanId: ctx.promptId,
    name: 'codex.turn_ttft',
    startMs: ttftStart, endMs: ttftStart + 1,
    attrs: [...ctx.baseAttrs, attr('event.name', 'codex.turn_ttft'), attr('duration_ms', opts.ttftMs ?? 600)],
  })
  const decisionStart = tl.tick(200)
  const decision = span({
    traceId: ctx.traceId, spanId: hex(8), parentSpanId: ctx.promptId,
    name: 'codex.tool_decision',
    startMs: decisionStart, endMs: decisionStart + 80,
    attrs: [
      ...ctx.baseAttrs,
      attr('event.name', 'codex.tool_decision'),
      attr('tool_name', opts.toolName),
      attr('call_id', callId),
      attr('input_token_count', opts.inputTokens),
      attr('output_token_count', opts.outputTokens),
      attr('cached_token_count', opts.cachedTokens ?? 0),
      attr('model', opts.model ?? 'gpt-5.6-sol'),
    ],
  })
  const toolDur = opts.toolDurationMs ?? 300
  const resultStart = tl.tick(100)
  const result = span({
    traceId: ctx.traceId, spanId: hex(8), parentSpanId: ctx.promptId,
    name: 'codex.tool_result',
    startMs: resultStart, endMs: resultStart + toolDur,
    error: opts.success === false,
    attrs: [
      ...ctx.baseAttrs,
      attr('event.name', 'codex.tool_result'),
      attr('tool_name', opts.toolName),
      attr('call_id', callId),
      attr('arguments', JSON.stringify(opts.args)),
      attr('output', opts.output),
      attr('duration_ms', toolDur),
      attr('success', opts.success ?? true),
    ],
  })
  // Deliberately no separate raw exec span (e.g. a standalone 'exec_command' span) alongside
  // codex.tool_result — empirically, the real summarizer counts both independently when both
  // are present with the same call_id (no dedup between them), double-counting every tool call.
  // codex.tool_result alone already carries everything the Files/Tools/Timeline tabs need.
  return [ttft, decision, result]
}

// ── Copilot span builders ───────────────────────────────────────────────────────

function copilotAgentSpan(tl: Timeline, traceId: string, rootId: string, opts: {
  userRequest: string
  model?: string
  inputTokens: number
  outputTokens: number
  cacheRead?: number
  durationMs: number
}): { root: object; rootStart: number } {
  const rootStart = tl.tick(0)
  const root = span({
    traceId, spanId: rootId,
    name: 'invoke_agent',
    startMs: rootStart, endMs: rootStart + opts.durationMs,
    attrs: [
      attr('copilot_chat.user_request', opts.userRequest),
      attr('gen_ai.request.model', opts.model ?? 'gpt-4o'),
      attr('gen_ai.usage.input_tokens', opts.inputTokens),
      attr('gen_ai.usage.output_tokens', opts.outputTokens),
      attr('gen_ai.usage.cache_read.input_tokens', opts.cacheRead ?? 0),
    ],
  })
  return { root, rootStart }
}

function copilotChatSpan(tl: Timeline, traceId: string, parentId: string, opts: {
  inputTokens: number
  outputTokens: number
  cacheRead?: number
  model?: string
  ttft?: number
  durationMs?: number
}): object {
  const start = tl.tick(400)
  const end = tl.tick(opts.durationMs ?? 1800)
  return span({
    traceId, spanId: hex(8), parentSpanId: parentId,
    name: 'chat/completions',
    startMs: start, endMs: end,
    attrs: [
      attr('gen_ai.usage.input_tokens', opts.inputTokens),
      attr('gen_ai.usage.output_tokens', opts.outputTokens),
      attr('gen_ai.usage.cache_read.input_tokens', opts.cacheRead ?? 0),
      attr('gen_ai.request.model', opts.model ?? 'gpt-4o'),
      attr('copilot_chat.time_to_first_token', opts.ttft ?? 500),
    ],
  })
}

function copilotToolSpan(tl: Timeline, traceId: string, parentId: string, opts: {
  toolName: string
  toolInput: object
  durationMs?: number
  error?: boolean
}): object {
  const start = tl.tick(100)
  const end = tl.tick(opts.durationMs ?? 90)
  return span({
    traceId, spanId: hex(8), parentSpanId: parentId,
    name: `execute_tool/${opts.toolName}`,
    startMs: start, endMs: end,
    error: opts.error,
    attrs: [attr('tool.name', opts.toolName), attr('tool.input', JSON.stringify(opts.toolInput))],
  })
}

// ── Scenario 1: Normal task — multi-pet checkout discount ──────────────────────
// Populates: Tokens, Files, Timeline, Efficiency, Summaries, Traces, Flow

async function scenarioNormal(agent: Agent, startOffsetMs?: number): Promise<void> {
  const userRequest = 'Add multi-pet discount pricing to the checkout flow'

  if (agent === 'claude') {
    log('Scenario 1 [claude] — Normal task (3 turns, good cache hit)')
    const tl = new Timeline(startOffsetMs ?? 360_000)
    const traceId = hex(16)
    const rootId  = hex(8)
    const rootStart = tl.tick(0)

    const llm1 = llmSpan(tl, traceId, rootId, { inputTokens: 7800, outputTokens: 480, cacheCreate: 7800 })
    const llm1Id = (llm1 as any).spanId
    const t1 = toolSpan(tl, traceId, llm1Id, { toolName: 'Read',
      toolInput: { file_path: 'src/store/checkout/cart.ts' }, durationMs: 140 })
    const t2 = toolSpan(tl, traceId, llm1Id, { toolName: 'Read',
      toolInput: { file_path: 'src/store/pricing/discounts.ts' }, durationMs: 110 })
    await post('/v1/traces', tracePayload([llm1, t1, t2]))
    ok('Turn 1: Read cart.ts, discounts.ts')
    await sleep(900)

    const llm2 = llmSpan(tl, traceId, rootId, {
      inputTokens: 11_400, outputTokens: 640, cacheRead: 7800, cacheCreate: 3600, stopReason: 'tool_use',
    })
    const llm2Id = (llm2 as any).spanId
    const t3 = toolSpan(tl, traceId, llm2Id, { toolName: 'Edit',
      toolInput: { file_path: 'src/store/pricing/discounts.ts', old_string: 'function calcDiscount(', new_string: 'export function calcMultiPetDiscount(' }, durationMs: 80 })
    const t4 = toolSpan(tl, traceId, llm2Id, { toolName: 'Edit',
      toolInput: { file_path: 'src/store/checkout/cart.ts', old_string: 'const total = subtotal', new_string: 'const total = applyDiscount(subtotal, pets.length)' }, durationMs: 70 })
    const t5 = toolSpan(tl, traceId, llm2Id, { toolName: 'Bash',
      toolInput: { command: 'npm test -- --testPathPattern=checkout' }, durationMs: 2200 })
    await post('/v1/traces', tracePayload([llm2, t3, t4, t5]))
    ok('Turn 2: Edit discounts.ts + cart.ts, tests pass')
    await sleep(1100)

    const llm3 = llmSpan(tl, traceId, rootId, {
      inputTokens: 7200, outputTokens: 310, cacheRead: 11_000, cacheCreate: 200, stopReason: 'end_turn', ttft: 190,
    })
    await post('/v1/traces', tracePayload([llm3]))
    ok('Turn 3: done')
    await sleep(400)

    const root = sessionSpan(tl, traceId, rootId, {
      startMs: rootStart, userRequest, outcome: 'success', totalInput: 26_400, totalOutput: 1430,
    })
    await post('/v1/traces', tracePayload([root]))
    ok('Session closed — normal task (claude)\n')
    return
  }

  if (agent === 'codex') {
    log('Scenario 1 [codex] — Normal task (3 tool turns)')
    const tl = new Timeline(startOffsetMs ?? 340_000)
    const traceId = hex(16)
    const ctx = codexSession(traceId)

    const prompt = codexPromptSpan(tl, ctx, { prompt: userRequest })
    await post('/v1/traces', tracePayload([prompt]))
    await sleep(400)

    const turn1 = codexToolTurn(tl, ctx, {
      toolName: 'exec_command',
      args: { cmd: 'cat src/store/checkout/cart.ts src/store/pricing/discounts.ts' },
      output: 'const total = subtotal - tax\nfunction calcDiscount(pct) { ... }',
      inputTokens: 9200, outputTokens: 260, cachedTokens: 0, model: 'gpt-5.6-sol', toolDurationMs: 180,
    })
    await post('/v1/traces', tracePayload(turn1))
    ok('Turn 1: read cart.ts, discounts.ts')
    await sleep(700)

    const turn2 = codexToolTurn(tl, ctx, {
      toolName: 'apply_patch',
      args: { path: 'src/store/pricing/discounts.ts', diff: '+export function calcMultiPetDiscount(pets) { ... }' },
      output: 'Applied patch to src/store/pricing/discounts.ts',
      inputTokens: 14_600, outputTokens: 510, cachedTokens: 9200, model: 'gpt-5.6-sol', toolDurationMs: 220,
    })
    await post('/v1/traces', tracePayload(turn2))
    ok('Turn 2: patch discounts.ts')
    await sleep(700)

    const turn3 = codexToolTurn(tl, ctx, {
      toolName: 'exec_command',
      args: { cmd: 'npm test -- --testPathPattern=checkout' },
      output: 'PASS  src/store/checkout/cart.test.ts\n5 passed, 5 total',
      inputTokens: 6100, outputTokens: 180, cachedTokens: 14_600, model: 'gpt-5.6-sol', toolDurationMs: 2100,
    })
    await post('/v1/traces', tracePayload(turn3))
    ok('Turn 3: run checkout tests — pass')
    await sleep(500)

    // No separate wrap-up response turn: when a codex.sse_event with real tokens is present
    // anywhere in a session, the real summarizer treats it as an authoritative rollup and
    // suppresses every tool_decision span's token counts to avoid double-counting (see
    // isDuplicateCodexTokenRecord / hasCodexCompletionEvents in src/summarizers/codex.ts).
    // A real Codex session mostly ends right on the last tool result anyway.
    ok('Session closed — normal task (codex)\n')
    return
  }

  // copilot
  log('Scenario 1 [copilot] — Normal task (2 turns)')
  const tl = new Timeline(startOffsetMs ?? 120_000)
  const traceId = hex(16)
  const rootId  = hex(8)

  const { root } = copilotAgentSpan(tl, traceId, rootId, {
    userRequest, model: 'gpt-4o', inputTokens: 14_200, outputTokens: 820, cacheRead: 9400, durationMs: 95_000,
  })
  const chat1 = copilotChatSpan(tl, traceId, rootId, { inputTokens: 6800, outputTokens: 440, cacheRead: 4200, model: 'gpt-4o', ttft: 520 })
  const chatId1 = (chat1 as any).spanId
  const toolEx1 = copilotToolSpan(tl, traceId, chatId1, { toolName: 'read_file', toolInput: { path: 'src/store/checkout/cart.ts' }, durationMs: 60 })

  const chat2 = copilotChatSpan(tl, traceId, rootId, { inputTokens: 7400, outputTokens: 380, cacheRead: 5200, model: 'gpt-4o', ttft: 490 })
  const chatId2 = (chat2 as any).spanId
  const toolEx2 = copilotToolSpan(tl, traceId, chatId2, { toolName: 'write_file', toolInput: { path: 'src/store/checkout/cart.ts' } })

  await post('/v1/traces', tracePayload([root, chat1, toolEx1, chat2, toolEx2]))
  ok('Session closed — normal task (copilot)\n')
}

// ── Scenario 2: Stuck loop — repeated failing command ───────────────────────────
// Populates: Errors, Alerts, Automation, Recommendations

async function scenarioLoop(agent: Agent, startOffsetMs?: number): Promise<void> {
  const userRequest = 'Build and push the petstore-api Docker image to the registry'
  const command = 'docker build -t petstore-api . --no-cache'

  if (agent === 'claude') {
    log('Scenario 2 [claude] — Stuck loop (same Bash call fails 7x, Loop Breaker triggers)')
    const tl = new Timeline(startOffsetMs ?? 240_000)
    const traceId = hex(16)
    const rootId  = hex(8)
    const rootStart = tl.tick(0)
    const inputGrowth = [5800, 9200, 13_000, 17_200, 21_800, 26_600, 31_800]

    for (let turn = 0; turn < 7; turn++) {
      const llm = llmSpan(tl, traceId, rootId, {
        inputTokens:  inputGrowth[turn],
        outputTokens: 290 - turn * 10,
        cacheRead:    turn > 0 ? inputGrowth[turn - 1] : 0,
        cacheCreate:  turn === 0 ? inputGrowth[0] : inputGrowth[turn] - inputGrowth[turn - 1],
        stopReason: 'tool_use',
        ttft: 260 + turn * 25,
      })
      const llmId = (llm as any).spanId
      const tool = toolSpan(tl, traceId, llmId, {
        toolName: 'Bash', toolInput: { command }, durationMs: 900 + turn * 120, error: true,
      })
      await post('/v1/traces', tracePayload([llm, tool]))
      sim(`Turn ${turn + 1}: Bash "docker build" → error  (${inputGrowth[turn].toLocaleString()} input tokens, same command repeated)`)
      await sleep(500)
    }

    const root = sessionSpan(tl, traceId, rootId, {
      startMs: rootStart, userRequest, outcome: 'error', totalInput: 125_400, totalOutput: 1890,
    })
    await post('/v1/traces', tracePayload([root]))
    ok('Session closed — check Errors + Automation tabs for Loop Breaker trigger (claude)\n')
    return
  }

  if (agent === 'codex') {
    log('Scenario 2 [codex] — Stuck loop (same exec_command fails 7x)')
    const tl = new Timeline(startOffsetMs ?? 220_000)
    const traceId = hex(16)
    const ctx = codexSession(traceId)

    const prompt = codexPromptSpan(tl, ctx, { prompt: userRequest })
    await post('/v1/traces', tracePayload([prompt]))
    await sleep(400)

    const inputGrowth = [6200, 9800, 13_600, 17_900, 22_400, 27_100, 32_200]
    for (let turn = 0; turn < 7; turn++) {
      const turnSpans = codexToolTurn(tl, ctx, {
        toolName: 'exec_command',
        args: { cmd: command },
        output: 'ERROR: failed to solve: process "/bin/sh -c npm ci" did not complete successfully: exit code 1',
        inputTokens: inputGrowth[turn], outputTokens: 240 - turn * 10,
        cachedTokens: turn > 0 ? inputGrowth[turn - 1] : 0,
        model: 'gpt-5.6-sol', toolDurationMs: 900 + turn * 120, success: false,
      })
      await post('/v1/traces', tracePayload(turnSpans))
      sim(`Turn ${turn + 1}: exec_command "docker build" → error  (${inputGrowth[turn].toLocaleString()} input tokens, same command repeated)`)
      await sleep(500)
    }
    ok('Session closed — check Errors + Automation tabs for Loop Breaker trigger (codex)\n')
    return
  }

  // copilot
  log('Scenario 2 [copilot] — Stuck loop (same tool call fails 6x)')
  const tl = new Timeline(startOffsetMs ?? 200_000)
  const traceId = hex(16)
  const rootId  = hex(8)

  const { root } = copilotAgentSpan(tl, traceId, rootId, {
    userRequest, model: 'gpt-4o', inputTokens: 0, outputTokens: 0, durationMs: 90_000,
  })
  const spansToSend: object[] = [root]
  const inputGrowth = [5400, 8600, 12_200, 16_000, 20_200, 24_800]
  for (let turn = 0; turn < 6; turn++) {
    const chat = copilotChatSpan(tl, traceId, rootId, {
      inputTokens: inputGrowth[turn], outputTokens: 220 - turn * 10,
      cacheRead: turn > 0 ? inputGrowth[turn - 1] : 0, model: 'gpt-4o', ttft: 480 + turn * 20,
    })
    const chatId = (chat as any).spanId
    const toolEx = copilotToolSpan(tl, traceId, chatId, {
      toolName: 'run_in_terminal', toolInput: { command }, durationMs: 900 + turn * 100, error: true,
    })
    spansToSend.push(chat, toolEx)
    sim(`Turn ${turn + 1}: run_in_terminal "docker build" → error  (${inputGrowth[turn].toLocaleString()} input tokens, same command repeated)`)
  }
  await post('/v1/traces', tracePayload(spansToSend))
  await sleep(500)
  ok('Session closed — check Errors + Automation tabs for Loop Breaker trigger (copilot)\n')
}

// ── Scenario 3: Context bloat (Claude only) ─────────────────────────────────────
// Populates: Tokens (growing bars), Efficiency, Automation

async function scenarioCompaction(startOffsetMs?: number): Promise<void> {
  log('Scenario 3 [claude] — Context bloat (input grows 148k tokens across 10 turns)')
  const tl = new Timeline(startOffsetMs ?? 180_000)
  const traceId = hex(16)
  const rootId  = hex(8)
  const rootStart = tl.tick(0)

  const inputProfile  = [4_200, 11_800, 22_600, 36_400, 54_000, 72_800, 91_200, 110_000, 128_600, 148_400]
  const outputProfile = [380,   340,    300,    270,    240,    200,    160,    120,     90,      60   ]

  for (let turn = 0; turn < 10; turn++) {
    const llm = llmSpan(tl, traceId, rootId, {
      inputTokens:  inputProfile[turn],
      outputTokens: outputProfile[turn],
      cacheRead:    turn > 0 ? inputProfile[turn - 1] : 0,
      cacheCreate:  turn === 0 ? inputProfile[0] : inputProfile[turn] - inputProfile[turn - 1],
      model: 'claude-opus-4-7',
      stopReason: turn < 9 ? 'tool_use' : 'end_turn',
      ttft: 380 + turn * 90,
    })
    const llmId = (llm as any).spanId
    const tool = toolSpan(tl, traceId, llmId, {
      toolName: 'Grep', toolInput: { pattern: `TODO.*${turn}`, path: 'src/store/pets/' }, durationMs: 200,
    })
    const batch = turn < 9 ? [llm, tool] : [llm]
    await post('/v1/traces', tracePayload(batch))
    ok(`Turn ${turn + 1}: ${inputProfile[turn].toLocaleString()} input / ${outputProfile[turn]} output tokens`)
    await sleep(350)
  }

  const root = sessionSpan(tl, traceId, rootId, {
    startMs: rootStart,
    userRequest: 'Find and address every TODO comment in the pet inventory service',
    outcome: 'success', totalInput: inputProfile.reduce((a, b) => a + b, 0), totalOutput: 2160,
  })
  await post('/v1/traces', tracePayload([root]))
  ok('Session closed — context compaction should have triggered\n')
}

// ── Scenario 4: Errors + recovery ────────────────────────────────────────────────
// Populates: Errors tab, Recommendations (error cascade), multiple file types

async function scenarioErrors(agent: Agent, startOffsetMs?: number): Promise<void> {
  const userRequest = 'Add a type-safe pet breed validator utility'

  if (agent === 'claude') {
    log('Scenario 4 [claude] — Errors + recovery (TypeScript compile errors, then fix)')
    const tl = new Timeline(startOffsetMs ?? 60_000)
    const traceId = hex(16)
    const rootId  = hex(8)
    const rootStart = tl.tick(0)

    const llm1 = llmSpan(tl, traceId, rootId, { inputTokens: 5400, outputTokens: 520, cacheCreate: 5400 })
    const llm1Id = (llm1 as any).spanId
    const t1 = toolSpan(tl, traceId, llm1Id, { toolName: 'Write',
      toolInput: { file_path: 'src/utils/breedValidator.ts', content: '...' }, durationMs: 60 })
    const t2 = toolSpan(tl, traceId, llm1Id, { toolName: 'Bash',
      toolInput: { command: 'npx tsc --noEmit' }, durationMs: 3100, error: true })
    await post('/v1/traces', tracePayload([llm1, t1, t2]))
    sim('Turn 1: wrote breedValidator.ts → tsc --noEmit failed (intentional type error)')
    await sleep(700)

    const llm2 = llmSpan(tl, traceId, rootId, { inputTokens: 8800, outputTokens: 390,
      cacheRead: 5400, cacheCreate: 3400, stopReason: 'tool_use' })
    const llm2Id = (llm2 as any).spanId
    const t3 = toolSpan(tl, traceId, llm2Id, { toolName: 'Edit',
      toolInput: { file_path: 'src/utils/breedValidator.ts', old_string: 'any', new_string: 'unknown' }, durationMs: 55 })
    const t4 = toolSpan(tl, traceId, llm2Id, { toolName: 'Bash',
      toolInput: { command: 'npx tsc --noEmit' }, durationMs: 2900, error: true })
    await post('/v1/traces', tracePayload([llm2, t3, t4]))
    sim('Turn 2: partial fix → tsc still failing (second simulated error)')
    await sleep(700)

    const llm3 = llmSpan(tl, traceId, rootId, { inputTokens: 10_200, outputTokens: 480,
      cacheRead: 8800, cacheCreate: 1400, stopReason: 'tool_use' })
    const llm3Id = (llm3 as any).spanId
    const t5 = toolSpan(tl, traceId, llm3Id, { toolName: 'Edit',
      toolInput: { file_path: 'src/utils/breedValidator.ts', old_string: 'function isValidBreed(', new_string: 'export function isValidBreed(' }, durationMs: 50 })
    const t6 = toolSpan(tl, traceId, llm3Id, { toolName: 'Write',
      toolInput: { file_path: 'src/utils/breedValidator.test.ts', content: '...' }, durationMs: 55 })
    const t7 = toolSpan(tl, traceId, llm3Id, { toolName: 'Bash',
      toolInput: { command: 'npx tsc --noEmit && npm test' }, durationMs: 4200 })
    await post('/v1/traces', tracePayload([llm3, t5, t6, t7]))
    ok('Turn 3: fixed, tests pass')
    await sleep(500)

    const root = sessionSpan(tl, traceId, rootId, {
      startMs: rootStart, userRequest, outcome: 'success', totalInput: 24_400, totalOutput: 1390,
    })
    await post('/v1/traces', tracePayload([root]))
    ok('Session closed — error cascade + recovery (claude)\n')
    return
  }

  if (agent === 'codex') {
    log('Scenario 4 [codex] — Errors + recovery (tsc fails, then fixed)')
    const tl = new Timeline(startOffsetMs ?? 58_000)
    const traceId = hex(16)
    const ctx = codexSession(traceId)

    const prompt = codexPromptSpan(tl, ctx, { prompt: userRequest })
    await post('/v1/traces', tracePayload([prompt]))
    await sleep(400)

    const turn1 = codexToolTurn(tl, ctx, {
      toolName: 'apply_patch',
      args: { path: 'src/utils/breedValidator.ts', diff: '+export function isValidBreed(input: any) { ... }' },
      output: 'Applied patch to src/utils/breedValidator.ts',
      inputTokens: 5600, outputTokens: 480, model: 'gpt-5.6-sol', toolDurationMs: 200,
    })
    await post('/v1/traces', tracePayload(turn1))
    await sleep(600)

    const turn2 = codexToolTurn(tl, ctx, {
      toolName: 'exec_command',
      args: { cmd: 'npx tsc --noEmit' },
      output: "src/utils/breedValidator.ts:1:38 - error TS7006: Parameter 'input' implicitly has an 'any' type.",
      inputTokens: 6200, outputTokens: 210, cachedTokens: 5600, model: 'gpt-5.6-sol', toolDurationMs: 2800, success: false,
    })
    await post('/v1/traces', tracePayload(turn2))
    sim('Turn 2: tsc --noEmit failed (intentional type error)')
    await sleep(600)

    const turn3 = codexToolTurn(tl, ctx, {
      toolName: 'apply_patch',
      args: { path: 'src/utils/breedValidator.ts', diff: '-function isValidBreed(input: any)\n+export function isValidBreed(input: unknown)' },
      output: 'Applied patch to src/utils/breedValidator.ts',
      inputTokens: 8100, outputTokens: 360, cachedTokens: 6200, model: 'gpt-5.6-sol', toolDurationMs: 190,
    })
    await post('/v1/traces', tracePayload(turn3))
    await sleep(600)

    const turn4 = codexToolTurn(tl, ctx, {
      toolName: 'exec_command',
      args: { cmd: 'npx tsc --noEmit && npm test -- breedValidator' },
      output: 'PASS  src/utils/breedValidator.test.ts\n4 passed, 4 total',
      inputTokens: 4400, outputTokens: 150, cachedTokens: 8100, model: 'gpt-5.6-sol', toolDurationMs: 4100,
    })
    await post('/v1/traces', tracePayload(turn4))
    ok('Turn 4: fixed, tests pass')
    await sleep(500)

    ok('Session closed — error cascade + recovery (codex)\n')
    return
  }

  // copilot
  log('Scenario 4 [copilot] — Errors + recovery')
  const tl = new Timeline(startOffsetMs ?? 56_000)
  const traceId = hex(16)
  const rootId  = hex(8)

  const { root } = copilotAgentSpan(tl, traceId, rootId, {
    userRequest, model: 'gpt-4o', inputTokens: 0, outputTokens: 0, durationMs: 50_000,
  })

  const chat1 = copilotChatSpan(tl, traceId, rootId, { inputTokens: 5200, outputTokens: 460, model: 'gpt-4o' })
  const chatId1 = (chat1 as any).spanId
  const toolEx1 = copilotToolSpan(tl, traceId, chatId1, {
    toolName: 'write_file', toolInput: { path: 'src/components/AdoptionForm.tsx' }, durationMs: 70,
  })
  const toolEx1b = copilotToolSpan(tl, traceId, chatId1, {
    toolName: 'get_errors', toolInput: { path: 'src/components/AdoptionForm.tsx' }, durationMs: 900, error: true,
  })

  const chat2 = copilotChatSpan(tl, traceId, rootId, { inputTokens: 6800, outputTokens: 340, cacheRead: 5200, model: 'gpt-4o' })
  const chatId2 = (chat2 as any).spanId
  const toolEx2 = copilotToolSpan(tl, traceId, chatId2, {
    toolName: 'write_file', toolInput: { path: 'src/components/AdoptionForm.tsx' }, durationMs: 65,
  })
  const toolEx2b = copilotToolSpan(tl, traceId, chatId2, {
    toolName: 'get_errors', toolInput: { path: 'src/components/AdoptionForm.tsx' }, durationMs: 700,
  })

  await post('/v1/traces', tracePayload([root, chat1, toolEx1, toolEx1b, chat2, toolEx2, toolEx2b]))
  ok('Session closed — error cascade + recovery (copilot)\n')
}

// ── Story mode: 10-session petstore build-out ───────────────────────────────────
// A fixed narrative arc (not the --agents × --scenario matrix above) — each chapter
// is a distinct task against a distinct set of files, so Files/Tokens/Timeline read
// as one real app taking shape instead of the same cart.ts/discounts.ts repeating.
// Four chapters reuse the scenarios above (checkout, deploy loop, validation errors,
// TODO sweep) since they already fit the story; six are new.

async function storyScaffold(offsetMs: number): Promise<void> {
  const userRequest = 'Scaffold a new pnpm workspace for the PetHaven petstore app'
  log('Story 1 [claude] — Scaffold the project')
  const tl = new Timeline(offsetMs)
  const traceId = hex(16)
  const rootId  = hex(8)
  const rootStart = tl.tick(0)

  const llm1 = llmSpan(tl, traceId, rootId, { inputTokens: 3200, outputTokens: 560, cacheCreate: 3200 })
  const llm1Id = (llm1 as any).spanId
  const t1 = toolSpan(tl, traceId, llm1Id, { toolName: 'Write', toolInput: { file_path: 'package.json' }, durationMs: 50 })
  const t2 = toolSpan(tl, traceId, llm1Id, { toolName: 'Write', toolInput: { file_path: 'tsconfig.json' }, durationMs: 45 })
  const t3 = toolSpan(tl, traceId, llm1Id, { toolName: 'Write', toolInput: { file_path: 'README.md' }, durationMs: 40 })
  await post('/v1/traces', tracePayload([llm1, t1, t2, t3]))
  ok('Turn 1: package.json, tsconfig.json, README.md')
  await sleep(700)

  const llm2 = llmSpan(tl, traceId, rootId, { inputTokens: 4600, outputTokens: 210, cacheRead: 3200, cacheCreate: 900, stopReason: 'tool_use' })
  const llm2Id = (llm2 as any).spanId
  const t4 = toolSpan(tl, traceId, llm2Id, { toolName: 'Bash', toolInput: { command: 'pnpm install' }, durationMs: 3200 })
  await post('/v1/traces', tracePayload([llm2, t4]))
  ok('Turn 2: pnpm install')
  await sleep(600)

  const llm3 = llmSpan(tl, traceId, rootId, { inputTokens: 2100, outputTokens: 140, cacheRead: 4600, cacheCreate: 100, stopReason: 'end_turn' })
  await post('/v1/traces', tracePayload([llm3]))
  await sleep(300)

  const root = sessionSpan(tl, traceId, rootId, { startMs: rootStart, userRequest, outcome: 'success', totalInput: 9900, totalOutput: 910 })
  await post('/v1/traces', tracePayload([root]))
  ok('Session closed — project scaffolded\n')
}

async function storyDataModel(offsetMs: number): Promise<void> {
  const userRequest = 'Define the Pet data model and build the adoption listing API'
  log('Story 2 [codex] — Pet data model + adoption API')
  const tl = new Timeline(offsetMs)
  const traceId = hex(16)
  const ctx = codexSession(traceId)

  const prompt = codexPromptSpan(tl, ctx, { prompt: userRequest })
  await post('/v1/traces', tracePayload([prompt]))
  await sleep(400)

  const turn1 = codexToolTurn(tl, ctx, {
    toolName: 'apply_patch',
    args: { path: 'src/models/pet.ts', diff: '+export interface Pet { id: string; name: string; species: string; breed: string; ageMonths: number }' },
    output: 'Applied patch to src/models/pet.ts',
    inputTokens: 5200, outputTokens: 340, model: 'gpt-5.6-sol', toolDurationMs: 160,
  })
  await post('/v1/traces', tracePayload(turn1))
  ok('Turn 1: define Pet model')
  await sleep(600)

  const turn2 = codexToolTurn(tl, ctx, {
    toolName: 'apply_patch',
    args: { path: 'src/api/adoption.ts', diff: '+export async function listAdoptablePets(filters: PetFilters) { ... }' },
    output: 'Applied patch to src/api/adoption.ts',
    inputTokens: 8100, outputTokens: 420, cachedTokens: 5200, model: 'gpt-5.6-sol', toolDurationMs: 190,
  })
  await post('/v1/traces', tracePayload(turn2))
  ok('Turn 2: build adoption listing API')
  await sleep(600)

  const turn3 = codexToolTurn(tl, ctx, {
    toolName: 'exec_command',
    args: { cmd: 'npm test -- adoption' },
    output: 'PASS  src/api/adoption.test.ts\n6 passed, 6 total',
    inputTokens: 3600, outputTokens: 120, cachedTokens: 8100, model: 'gpt-5.6-sol', toolDurationMs: 1800,
  })
  await post('/v1/traces', tracePayload(turn3))
  ok('Turn 3: adoption API tests pass')
  await sleep(500)

  ok('Session closed — data model + adoption API\n')
}

async function storyInventory(offsetMs: number): Promise<void> {
  const userRequest = 'Build an inventory service that tracks pet food and supply stock levels'
  log('Story 3 [claude] — Inventory service')
  const tl = new Timeline(offsetMs)
  const traceId = hex(16)
  const rootId  = hex(8)
  const rootStart = tl.tick(0)

  const llm1 = llmSpan(tl, traceId, rootId, { inputTokens: 6400, outputTokens: 520, cacheCreate: 6400 })
  const llm1Id = (llm1 as any).spanId
  const t1 = toolSpan(tl, traceId, llm1Id, { toolName: 'Write', toolInput: { file_path: 'src/store/inventory/stock.ts' }, durationMs: 60 })
  await post('/v1/traces', tracePayload([llm1, t1]))
  ok('Turn 1: stock.ts')
  await sleep(700)

  const llm2 = llmSpan(tl, traceId, rootId, { inputTokens: 9200, outputTokens: 480, cacheRead: 6400, cacheCreate: 2400, stopReason: 'tool_use' })
  const llm2Id = (llm2 as any).spanId
  const t2 = toolSpan(tl, traceId, llm2Id, { toolName: 'Write', toolInput: { file_path: 'src/store/inventory/reorder.ts' }, durationMs: 55 })
  const t3 = toolSpan(tl, traceId, llm2Id, { toolName: 'Edit',
    toolInput: { file_path: 'src/store/inventory/stock.ts', old_string: 'export class Stock', new_string: 'export class Stock implements Reorderable' }, durationMs: 50 })
  await post('/v1/traces', tracePayload([llm2, t2, t3]))
  ok('Turn 2: reorder.ts + wire into Stock')
  await sleep(700)

  // Edit-revert cycle (intentional, demonstrates the loop detector's edit_revert_cycle
  // signal): backs the interface out, then re-applies it verbatim two turns later —
  // an exact old/new reversal on the same file.
  const llm2b = llmSpan(tl, traceId, rootId, { inputTokens: 9600, outputTokens: 180, cacheRead: 9200, cacheCreate: 400, stopReason: 'tool_use', ttft: 310 })
  const llm2bId = (llm2b as any).spanId
  const t3b = toolSpan(tl, traceId, llm2bId, { toolName: 'Edit',
    toolInput: { file_path: 'src/store/inventory/stock.ts', old_string: 'export class Stock implements Reorderable', new_string: 'export class Stock' }, durationMs: 45 })
  await post('/v1/traces', tracePayload([llm2b, t3b]))
  sim('Turn 2b: second-guessed the interface, reverted stock.ts')
  await sleep(600)

  const llm2c = llmSpan(tl, traceId, rootId, { inputTokens: 9900, outputTokens: 210, cacheRead: 9600, cacheCreate: 300, stopReason: 'tool_use', ttft: 300 })
  const llm2cId = (llm2c as any).spanId
  const t3c = toolSpan(tl, traceId, llm2cId, { toolName: 'Edit',
    toolInput: { file_path: 'src/store/inventory/stock.ts', old_string: 'export class Stock', new_string: 'export class Stock implements Reorderable' }, durationMs: 45 })
  await post('/v1/traces', tracePayload([llm2c, t3c]))
  ok('Turn 2c: re-applied the interface after all')
  await sleep(600)

  const llm3 = llmSpan(tl, traceId, rootId, { inputTokens: 7800, outputTokens: 260, cacheRead: 9900, cacheCreate: 300, stopReason: 'tool_use' })
  const llm3Id = (llm3 as any).spanId
  const t4 = toolSpan(tl, traceId, llm3Id, { toolName: 'Bash', toolInput: { command: 'npm test -- inventory' }, durationMs: 1900 })
  await post('/v1/traces', tracePayload([llm3, t4]))
  ok('Turn 3: inventory tests pass')
  await sleep(500)

  const root = sessionSpan(tl, traceId, rootId, { startMs: rootStart, userRequest, outcome: 'success', totalInput: 36_500, totalOutput: 1650 })
  await post('/v1/traces', tracePayload([root]))
  ok('Session closed — inventory service\n')
}

async function storyImageUpload(offsetMs: number): Promise<void> {
  const userRequest = 'Add a pet photo upload pipeline with image resizing'
  log('Story 5 [copilot] — Pet image upload pipeline')
  const tl = new Timeline(offsetMs)
  const traceId = hex(16)
  const rootId  = hex(8)

  const { root } = copilotAgentSpan(tl, traceId, rootId, {
    userRequest, model: 'gpt-4o', inputTokens: 9800, outputTokens: 560, cacheRead: 3200, durationMs: 80_000,
  })
  const chat1 = copilotChatSpan(tl, traceId, rootId, { inputTokens: 5200, outputTokens: 320, model: 'gpt-4o', ttft: 480 })
  const chatId1 = (chat1 as any).spanId
  const toolEx1 = copilotToolSpan(tl, traceId, chatId1, { toolName: 'write_file', toolInput: { path: 'src/api/upload.ts' }, durationMs: 65 })

  const chat2 = copilotChatSpan(tl, traceId, rootId, { inputTokens: 4600, outputTokens: 240, cacheRead: 3200, model: 'gpt-4o', ttft: 460 })
  const chatId2 = (chat2 as any).spanId
  const toolEx2 = copilotToolSpan(tl, traceId, chatId2, { toolName: 'write_file', toolInput: { path: 'src/utils/imageResize.ts' }, durationMs: 60 })
  const toolEx3 = copilotToolSpan(tl, traceId, chatId2, { toolName: 'run_in_terminal', toolInput: { command: 'npm test -- upload' }, durationMs: 1400 })

  await post('/v1/traces', tracePayload([root, chat1, toolEx1, chat2, toolEx2, toolEx3]))
  ok('Session closed — image upload pipeline (copilot)\n')
}

// Deliberately phrased as a trivial one-line ask (matches loopDetector's SIMPLE_KEYWORDS
// via "add import", threshold 15 steps) but ships 11 turns — demonstrates the
// runaway_steps signal ("Ambiguous Success / Escalating Scope") via realistic scope
// creep: the import didn't exist because the whole cache layer didn't exist yet.
async function storySearchCache(offsetMs: number): Promise<void> {
  const userRequest = 'Add import for the Redis cache client in search.ts'
  log('Story 6 [codex] — "just add an import" spirals into full search + caching')
  const tl = new Timeline(offsetMs)
  const traceId = hex(16)
  const ctx = codexSession(traceId)

  const prompt = codexPromptSpan(tl, ctx, { prompt: userRequest })
  await post('/v1/traces', tracePayload([prompt]))
  await sleep(300)

  const turns: Array<Parameters<typeof codexToolTurn>[2]> = [
    { toolName: 'exec_command', args: { cmd: 'cat src/api/search.ts' },
      output: 'cat: src/api/search.ts: No such file or directory',
      inputTokens: 2600, outputTokens: 90, model: 'gpt-5.6-sol', toolDurationMs: 90, success: false },
    { toolName: 'apply_patch', args: { path: 'src/api/search.ts', diff: '+export async function searchPets(query: string) { ... }' },
      output: 'Applied patch to src/api/search.ts',
      inputTokens: 4200, outputTokens: 260, cachedTokens: 2600, model: 'gpt-5.6-sol', toolDurationMs: 170 },
    { toolName: 'exec_command', args: { cmd: 'npm test -- search' },
      output: "Cannot find module 'src/cache/redis'",
      inputTokens: 4600, outputTokens: 110, cachedTokens: 4200, model: 'gpt-5.6-sol', toolDurationMs: 900, success: false },
    { toolName: 'apply_patch', args: { path: 'src/cache/redis.ts', diff: '+export const petSearchCache = createCache({ ttlSeconds: 60 })' },
      output: 'Applied patch to src/cache/redis.ts',
      inputTokens: 5800, outputTokens: 320, cachedTokens: 4600, model: 'gpt-5.6-sol', toolDurationMs: 180 },
    { toolName: 'apply_patch', args: { path: 'src/api/search.ts', diff: "+import { petSearchCache } from '../cache/redis'" },
      output: 'Applied patch to src/api/search.ts',
      inputTokens: 6300, outputTokens: 180, cachedTokens: 5800, model: 'gpt-5.6-sol', toolDurationMs: 150 },
    { toolName: 'exec_command', args: { cmd: 'npm test -- search' },
      output: 'ReferenceError: REDIS_URL is not defined',
      inputTokens: 6700, outputTokens: 130, cachedTokens: 6300, model: 'gpt-5.6-sol', toolDurationMs: 900, success: false },
    { toolName: 'apply_patch', args: { path: 'src/config.ts', diff: '+export const redisUrl = process.env.REDIS_URL ?? \'redis://localhost:6379\'' },
      output: 'Applied patch to src/config.ts',
      inputTokens: 5900, outputTokens: 240, cachedTokens: 6700, model: 'gpt-5.6-sol', toolDurationMs: 140 },
    { toolName: 'exec_command', args: { cmd: 'npm test -- search' },
      output: 'FAIL  src/api/search.test.ts\nsearchPets() returned 0 results — index not built',
      inputTokens: 7400, outputTokens: 150, cachedTokens: 5900, model: 'gpt-5.6-sol', toolDurationMs: 1100, success: false },
    { toolName: 'apply_patch', args: { path: 'src/api/search.ts', diff: '+await buildSearchIndex(pets)' },
      output: 'Applied patch to src/api/search.ts',
      inputTokens: 8100, outputTokens: 290, cachedTokens: 7400, model: 'gpt-5.6-sol', toolDurationMs: 160 },
    { toolName: 'exec_command', args: { cmd: 'npm test -- search' },
      output: 'PASS  src/api/search.test.ts\n8 passed, 8 total',
      inputTokens: 4800, outputTokens: 150, cachedTokens: 8100, model: 'gpt-5.6-sol', toolDurationMs: 2000 },
    { toolName: 'exec_command', args: { cmd: 'npm test' },
      output: 'PASS  47 passed, 47 total',
      inputTokens: 5200, outputTokens: 110, cachedTokens: 4800, model: 'gpt-5.6-sol', toolDurationMs: 4200 },
  ]

  for (let i = 0; i < turns.length; i++) {
    const spans = codexToolTurn(tl, ctx, turns[i])
    await post('/v1/traces', tracePayload(spans))
    const t = turns[i]
    const label = `Turn ${i + 1}: ${t.toolName === 'exec_command' ? (t.args as { cmd: string }).cmd : (t.args as { path: string }).path}`
    if (t.success === false) sim(label + ' → error'); else ok(label)
    await sleep(350)
  }

  ok(`Session closed — "add import" turned into a whole cache layer (${turns.length} steps for what looked simple)\n`)
}

async function storyE2ETests(offsetMs: number): Promise<void> {
  const userRequest = 'Write end-to-end tests covering adoption and checkout flows'
  log('Story 7 [copilot] — End-to-end tests')
  const tl = new Timeline(offsetMs)
  const traceId = hex(16)
  const rootId  = hex(8)

  const { root } = copilotAgentSpan(tl, traceId, rootId, {
    userRequest, model: 'gpt-4o', inputTokens: 8600, outputTokens: 640, cacheRead: 2200, durationMs: 70_000,
  })
  const chat1 = copilotChatSpan(tl, traceId, rootId, { inputTokens: 4400, outputTokens: 360, model: 'gpt-4o', ttft: 500 })
  const chatId1 = (chat1 as any).spanId
  const toolEx1 = copilotToolSpan(tl, traceId, chatId1, { toolName: 'write_file', toolInput: { path: 'tests/adoption.e2e.spec.ts' }, durationMs: 70 })

  const chat2 = copilotChatSpan(tl, traceId, rootId, { inputTokens: 4200, outputTokens: 280, cacheRead: 2200, model: 'gpt-4o', ttft: 470 })
  const chatId2 = (chat2 as any).spanId
  const toolEx2 = copilotToolSpan(tl, traceId, chatId2, { toolName: 'write_file', toolInput: { path: 'tests/checkout.e2e.spec.ts' }, durationMs: 65 })
  const toolEx3 = copilotToolSpan(tl, traceId, chatId2, { toolName: 'run_in_terminal', toolInput: { command: 'npx playwright test' }, durationMs: 4200 })

  await post('/v1/traces', tracePayload([root, chat1, toolEx1, chat2, toolEx2, toolEx3]))
  ok('Session closed — e2e tests (copilot)\n')
}

// Narrative order: scaffold → data model → inventory → checkout (reused) → image
// upload → search/caching → e2e tests → deploy hiccup (reused) → validation fix
// (reused) → TODO sweep (reused). Offsets step down so, absent filtering, the whole
// arc reads oldest-to-newest; the actual last chapter to run always gets
// FRESH_OFFSET_MS (see main()) regardless of which chapters --agents keeps.
const STORY_CHAPTERS: { agent: Agent; defaultOffsetMs: number; run: (offsetMs: number) => Promise<void> }[] = [
  { agent: 'claude',  defaultOffsetMs: 900_000, run: storyScaffold },
  { agent: 'codex',   defaultOffsetMs: 800_000, run: storyDataModel },
  { agent: 'claude',  defaultOffsetMs: 700_000, run: storyInventory },
  { agent: 'claude',  defaultOffsetMs: 600_000, run: (o) => scenarioNormal('claude', o) },
  { agent: 'copilot', defaultOffsetMs: 500_000, run: storyImageUpload },
  { agent: 'codex',   defaultOffsetMs: 400_000, run: storySearchCache },
  { agent: 'copilot', defaultOffsetMs: 300_000, run: storyE2ETests },
  { agent: 'codex',   defaultOffsetMs: 220_000, run: (o) => scenarioLoop('codex', o) },
  { agent: 'claude',  defaultOffsetMs: 90_000,  run: (o) => scenarioErrors('claude', o) },
  { agent: 'claude',  defaultOffsetMs: 30_000,  run: (o) => scenarioCompaction(o) },
]

async function runStory(agentFilter?: Agent[]): Promise<void> {
  const chapters = agentFilter ? STORY_CHAPTERS.filter(c => agentFilter.includes(c.agent)) : STORY_CHAPTERS
  const list = chapters.length > 0 ? chapters : STORY_CHAPTERS
  log(`Story mode — building out the PetHaven petstore app (${list.length} session${list.length !== 1 ? 's' : ''})\n`)
  for (let i = 0; i < list.length; i++) {
    const offset = i === list.length - 1 ? FRESH_OFFSET_MS : list[i].defaultOffsetMs
    await list[i].run(offset)
  }
}

// ── Fixture replay ─────────────────────────────────────────────────────────────

interface SpanAttr { key: string; value: { stringValue?: string; intValue?: number; doubleValue?: number; boolValue?: boolean } }
interface CapturedSpan {
  traceId: string; spanId: string; parentSpanId?: string; name: string
  startTime: string; endTime: string
  attributes: SpanAttr[]; status?: { code: number; message?: string }
}

// Shape of a session summary from an export file (full or redacted)
interface ExportSession {
  sessionId: string; traceId?: string; source?: string; model?: string
  startTime: string; durationMs?: number
  turns?: number; totalToolCalls?: number
  inputTokens?: number; outputTokens?: number
  cacheReadTokens?: number; cacheCreateTokens?: number
  userRequest?: string; toolCounts?: Record<string, number>
}

function iattr(key: string, v: number): SpanAttr { return { key, value: { intValue: Math.round(v) } } }
function sattr(key: string, v: string): SpanAttr { return { key, value: { stringValue: v } } }

// Convert an export-format session summary into synthetic CapturedSpans the
// collector can parse. Tokens and tool calls are distributed evenly across turns.
function exportSessionToSpans(sess: ExportSession): CapturedSpan[] {
  const startMs  = new Date(sess.startTime).getTime()
  const durMs    = sess.durationMs ?? 5_000
  const endMs    = startMs + durMs
  const turns    = Math.max(sess.turns ?? 1, 1)
  const traceId  = sess.traceId || hex(16)
  const rootId   = hex(8)
  const source   = sess.source ?? 'claude_code'

  const rootName = source === 'claude_code' ? 'claude_code.interaction'
    : source === 'codex' ? 'codex.session' : 'invoke_agent'
  const llmName  = source === 'claude_code' ? 'claude_code.llm_request'
    : source === 'codex' ? 'codex.turn' : 'invoke_agent'

  const spans: CapturedSpan[] = []

  // Root span
  spans.push({
    traceId, spanId: rootId, name: rootName,
    startTime: nano(startMs), endTime: nano(endMs),
    attributes: [
      sattr('user_prompt', sess.userRequest ?? ''),
      sattr('gen_ai.system', source),
    ],
  })

  // LLM call spans — distribute tokens evenly
  const turnDurMs = Math.floor(durMs / turns)
  const inPerTurn  = Math.floor((sess.inputTokens  ?? 0) / turns)
  const outPerTurn = Math.floor((sess.outputTokens ?? 0) / turns)
  const crPerTurn  = Math.floor((sess.cacheReadTokens   ?? 0) / turns)
  const ccPerTurn  = Math.floor((sess.cacheCreateTokens ?? 0) / turns)

  for (let i = 0; i < turns; i++) {
    const tStart = startMs + i * turnDurMs
    spans.push({
      traceId, spanId: hex(8), parentSpanId: rootId, name: llmName,
      startTime: nano(tStart), endTime: nano(tStart + turnDurMs),
      attributes: [
        sattr('gen_ai.request.model', sess.model ?? ''),
        iattr('gen_ai.usage.input_tokens',               inPerTurn),
        iattr('gen_ai.usage.output_tokens',              outPerTurn),
        iattr('gen_ai.usage.cache_read.input_tokens',    crPerTurn),
        iattr('gen_ai.usage.cache_creation.input_tokens', ccPerTurn),
      ],
    })
  }

  // Tool call spans — distribute evenly across duration
  const toolEntries = Object.entries(sess.toolCounts ?? {})
  const totalTools  = sess.totalToolCalls ?? toolEntries.reduce((s, [, n]) => s + n, 0)
  const toolDurMs   = totalTools > 0 ? Math.floor(durMs / totalTools) : durMs
  let toolOffset = 0
  for (const [toolName, count] of toolEntries) {
    for (let j = 0; j < count; j++) {
      const tStart = startMs + toolOffset * toolDurMs
      spans.push({
        traceId, spanId: hex(8), parentSpanId: rootId,
        name: source === 'claude_code' ? 'claude_code.tool' : toolName,
        startTime: nano(tStart), endTime: nano(tStart + toolDurMs),
        attributes: [sattr('tool.name', toolName)],
      })
      toolOffset++
    }
  }

  return spans
}
interface Fixture {
  name: string; capturedAt: string; durationMs: number; spanCount: number
  agents: string[]; spans: CapturedSpan[]
}

// Attribute keys whose values identify a Codex session or turn
const SESSION_STR_KEYS = ['conversation.id', 'codex.session.id', 'codex.conversation.id', 'codex.session_id',
                          'turn.id', 'turn_id', 'codex.turn.id']
const SESSION_INT_KEYS = ['thread.id', 'thread_id']

// Remap all trace/span IDs and Codex session/turn attribute values so each
// replay produces a distinct session instead of merging with a previous run.
function freshSpans(spans: CapturedSpan[]): CapturedSpan[] {
  const traceMap     = new Map<string, string>()
  const spanMap      = new Map<string, string>()
  const sessStrMap   = new Map<string, string>()  // string session/turn UUIDs
  const sessIntMap   = new Map<number, number>()  // integer thread IDs

  for (const s of spans) {
    if (!traceMap.has(s.traceId)) traceMap.set(s.traceId, hex(16))
    if (!spanMap.has(s.spanId))   spanMap.set(s.spanId,   hex(8))
    for (const a of s.attributes ?? []) {
      const sv = a.value?.stringValue
      if (sv && SESSION_STR_KEYS.includes(a.key) && !sessStrMap.has(sv))
        sessStrMap.set(sv, crypto.randomUUID())
      const iv = a.value?.intValue
      if (iv != null && SESSION_INT_KEYS.includes(a.key) && !sessIntMap.has(Number(iv)))
        sessIntMap.set(Number(iv), Math.floor(Math.random() * 0x7fffffff))
    }
  }

  return spans.map(s => ({
    ...s,
    traceId:      traceMap.get(s.traceId)!,
    spanId:       spanMap.get(s.spanId)!,
    parentSpanId: s.parentSpanId ? (spanMap.get(s.parentSpanId) ?? s.parentSpanId) : s.parentSpanId,
    attributes: (s.attributes ?? []).map(a => {
      const sv = a.value?.stringValue
      if (sv && sessStrMap.has(sv)) return { ...a, value: { stringValue: sessStrMap.get(sv) } }
      const iv = a.value?.intValue
      if (iv != null && SESSION_INT_KEYS.includes(a.key) && sessIntMap.has(Number(iv)))
        return { ...a, value: { intValue: sessIntMap.get(Number(iv)) } }
      return a
    }),
  }))
}

function spanToOtlp(s: CapturedSpan, shift: bigint): object {
  return {
    traceId:            s.traceId,
    spanId:             s.spanId,
    parentSpanId:       s.parentSpanId,
    name:               s.name,
    startTimeUnixNano:  String(BigInt(s.startTime) + shift),
    endTimeUnixNano:    String(BigInt(s.endTime)   + shift),
    attributes:         s.attributes,
    status:             s.status,
  }
}

// Group spans into temporal buckets so we can stream with realistic pacing.
// Spans whose start times fall within `windowNs` of the current bucket edge
// are batched together and posted as one OTLP payload.
function temporalGroups(spans: CapturedSpan[], windowNs = 1_000_000_000n): CapturedSpan[][] {
  const sorted = [...spans].sort((a, b) =>
    BigInt(a.startTime) < BigInt(b.startTime) ? -1 : BigInt(a.startTime) > BigInt(b.startTime) ? 1 : 0
  )
  const groups: CapturedSpan[][] = []
  let bucket: CapturedSpan[] = []
  let bucketStart = BigInt(sorted[0]?.startTime ?? 0)

  for (const s of sorted) {
    const t = BigInt(s.startTime)
    if (t - bucketStart <= windowNs) {
      bucket.push(s)
    } else {
      groups.push(bucket)
      bucket = [s]
      bucketStart = t
    }
  }
  if (bucket.length > 0) groups.push(bucket)
  return groups
}

async function replayFile(fp: string, label: string, instant: boolean): Promise<void> {
  if (!fs.existsSync(fp)) {
    err(`File not found: ${fp}`)
    process.exit(1)
  }

  const raw = JSON.parse(fs.readFileSync(fp, 'utf-8'))

  // Support three formats:
  //   export format   — array of session summaries from the Export tab (has sessionId + ISO startTime)
  //   capture format  — array of raw CapturedSpan objects (nanosecond startTime strings)
  //   fixture format  — { spans: CapturedSpan[] } object with metadata
  let rawSpans: CapturedSpan[]
  if (Array.isArray(raw)) {
    const first = raw[0] as Record<string, unknown>
    const isExport = first && typeof first.sessionId === 'string' &&
      typeof first.startTime === 'string' && first.startTime.includes('T')
    if (isExport) {
      const sessions = raw as ExportSession[]
      rawSpans = sessions.flatMap(exportSessionToSpans)
      log(`File: \x1b[32m${label}\x1b[0m  (${sessions.length} sessions → ${rawSpans.length} synthetic spans)`)
    } else {
      rawSpans = raw as CapturedSpan[]
      log(`File: \x1b[32m${label}\x1b[0m  (${rawSpans.length} spans — capture format)`)
    }
  } else {
    const fixture = raw as Fixture
    rawSpans = fixture.spans
    const agents = fixture.agents?.join(', ') || 'unknown'
    const durSec = fixture.durationMs > 0 ? `${Math.round(fixture.durationMs / 1000)}s` : '?'
    log(`Fixture: \x1b[32m${label}\x1b[0m  (${rawSpans.length} spans, ${durSec}, ${agents})`)
    if (fixture.capturedAt) log(`Captured: ${new Date(fixture.capturedAt).toLocaleString()}`)
  }
  log('')

  const spans = freshSpans(rawSpans)
  if (spans.length === 0) { err('File contains no spans.'); process.exit(1) }

  // Remap timestamps: shift so the earliest span starts ~90s ago
  const minNano = spans.reduce<bigint>(
    (m, s) => { const t = BigInt(s.startTime); return t < m ? t : m },
    BigInt('9'.repeat(20))
  )
  const targetNano = BigInt(Date.now() - 90_000) * 1_000_000n
  const shift = targetNano - minNano

  if (instant) {
    // Send all spans in one shot — no pacing needed for historical files
    const otlpSpans = spans.map(s => spanToOtlp(s, shift))
    await post('/v1/traces', { resourceSpans: [{ scopeSpans: [{ spans: otlpSpans }] }] })
    ok(`Sent ${spans.length} span${spans.length !== 1 ? 's' : ''}`)
  } else {
    const groups = temporalGroups(spans)
    log(`Streaming ${groups.length} temporal groups at ${SPEED}× speed…\n`)

    for (let i = 0; i < groups.length; i++) {
      const group = groups[i]
      const otlpSpans = group.map(s => spanToOtlp(s, shift))
      await post('/v1/traces', { resourceSpans: [{ scopeSpans: [{ spans: otlpSpans }] }] })

      const names = [...new Set(group.map(s => s.name))].slice(0, 3).join(', ')
      ok(`Group ${i + 1}/${groups.length}: ${group.length} span${group.length > 1 ? 's' : ''} (${names}${group.length > 3 ? ', …' : ''})`)

      if (i < groups.length - 1) {
        const gapNano = BigInt(groups[i + 1][0].startTime) - BigInt(group[0].startTime)
        const gapMs = Number(gapNano / 1_000_000n)
        const delayMs = Math.min(gapMs / SPEED, 8_000)
        if (delayMs > 100) await sleep(delayMs)
      }
    }
  }
  ok(`Replay complete\n`)
}

async function replayFixture(name: string): Promise<void> {
  const fp = path.join(__dirname, 'fixtures', name + '.json')
  if (!fs.existsSync(fp)) {
    err(`Fixture not found: ${fp}`)
    err(`Run  pnpm run capture -- <name>  to record a session, or  pnpm run capture:list  to see saved fixtures.`)
    process.exit(1)
  }
  await replayFile(fp, name, false)
}

// ── CLI flags ──────────────────────────────────────────────────────────────────

const hasSpeed = args.includes('--speed')

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  const modeLabel = FILE ? `file=${FILE}` : `scenario=${SCENARIO} agents=${AGENTS.join(',')}`
  log(`Targeting http://127.0.0.1:${PORT}  ${modeLabel}`)

  const alive = await checkServer()
  if (!alive) {
    err(`Cannot reach http://127.0.0.1:${PORT} — start an AgentLens collector first:`)
    err('  VS Code extension: open any workspace with AgentLens installed')
    err('  Standalone server: pnpm run local')
    process.exit(1)
  }
  log('Collector reachable.\n')

  try {
    if (FILE) {
      const fp = path.resolve(FILE)
      // Export files are historical — send instantly unless the user asked for pacing with --speed
      await replayFile(fp, path.basename(fp), !hasSpeed)
      log('Done. Open the AgentLens sidebar or dashboard to see the replayed session.')
      return
    }
    if (FIXTURE === 'agent-matrix') {
      const matrix = ['claude-helloworld-real', 'codex-helloworld-real', 'copilot-helloworld-real']
      for (const name of matrix) await replayFixture(name)
      log('Done. Open http://localhost:3000 to see your real session data.')
      return
    }
    if (FIXTURE) {
      await replayFixture(FIXTURE)
      log('Done. Open http://localhost:3000 to see your real session data.')
      return
    }

    log('  \x1b[33m~\x1b[0m = simulated error span (intentional, not a real failure)\n')

    if (SCENARIO === 'story') {
      const hasAgentsFlag = args.includes('--agents')
      await runStory(hasAgentsFlag ? AGENTS : undefined)
      log('Story complete. Open http://localhost:3000 and explore every tab.')
      return
    }

    function run(name: string) { return SCENARIO === 'all' || SCENARIO === name }

    type PlannedCall = { type: 'normal' | 'loop' | 'compaction' | 'errors'; agent?: Agent }
    const planned: PlannedCall[] = []
    if (run('normal')) for (const a of AGENTS) planned.push({ type: 'normal', agent: a })
    if (run('loop')) for (const a of AGENTS) planned.push({ type: 'loop', agent: a })
    if (run('compaction') && AGENTS.includes('claude')) planned.push({ type: 'compaction' })
    if (run('errors')) for (const a of AGENTS) planned.push({ type: 'errors', agent: a })

    for (let i = 0; i < planned.length; i++) {
      const call = planned[i]
      const offset = i === planned.length - 1 ? FRESH_OFFSET_MS : undefined
      if (call.type === 'normal')     await scenarioNormal(call.agent!, offset)
      if (call.type === 'loop')       await scenarioLoop(call.agent!, offset)
      if (call.type === 'compaction') await scenarioCompaction(offset)
      if (call.type === 'errors')     await scenarioErrors(call.agent!, offset)
    }

    log('All done. Open http://localhost:3000 and explore every tab.')
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    err(`${msg}`)
    err('Is the standalone server running?  (pnpm run local)')
    process.exit(1)
  }
}

main()
