#!/usr/bin/env node
/**
 * AgentLens demo replay script
 *
 * Sends realistic OTLP telemetry to the standalone server so every dashboard
 * tab has interesting data to show — no real AI agent required.
 *
 * Prerequisites:
 *   pnpm run standalone          (starts server on ports 4318 + 3000)
 *
 * Usage:
 *   pnpm run demo
 *   pnpm run demo -- --speed 5
 *   pnpm run demo -- --scenario loop
 *   pnpm run demo -- --scenario all --speed 3 --port 4318
 *
 * Scenarios:
 *   normal      Clean 3-turn refactor — Tokens, Files, Timeline, Efficiency tabs
 *   loop        Same Bash call fails 6× — Loop Breaker automation trigger
 *   compaction  Input tokens grow 4× per turn — Context Compaction trigger
 *   copilot     Copilot invoke_agent session — Agents comparison tab
 *   errors      Mixed errors + recovery — Errors + Recommendations tabs
 *   all         All of the above in sequence (default)
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

// ── Scenario helpers ───────────────────────────────────────────────────────────

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
      attr('user_request',       opts.userRequest),
      attr('outcome',            opts.outcome),
      attr('duration_ms',        end - opts.startMs),
      attr('total_input_tokens', opts.totalInput),
      attr('total_output_tokens', opts.totalOutput),
    ],
  })
}

// ── Scenario 1: Normal efficient refactor ──────────────────────────────────────
// Populates: Tokens, Files, Timeline, Efficiency, Summaries, Traces, Flow

async function scenarioNormal(): Promise<void> {
  log('Scenario 1 — Normal refactor (Claude Code, 3 turns, good cache hit)')
  const tl = new Timeline(360_000)
  const traceId = hex(16)
  const rootId  = hex(8)
  const rootStart = tl.tick(0)

  // Turn 1: read two files, plan the edit
  const llm1 = llmSpan(tl, traceId, rootId, { inputTokens: 7800, outputTokens: 480, cacheCreate: 7800 })
  const llm1Id = (llm1 as any).spanId
  const t1 = toolSpan(tl, traceId, llm1Id, { toolName: 'Read',
    toolInput: { file_path: 'src/auth/auth.ts' }, durationMs: 140 })
  const t2 = toolSpan(tl, traceId, llm1Id, { toolName: 'Read',
    toolInput: { file_path: 'src/auth/middleware.ts' }, durationMs: 110 })
  await post('/v1/traces', tracePayload([llm1, t1, t2]))
  ok('Turn 1: Read auth.ts, middleware.ts')
  await sleep(900)

  // Turn 2: edit + run tests
  const llm2 = llmSpan(tl, traceId, rootId, {
    inputTokens: 11_400, outputTokens: 640, cacheRead: 7800, cacheCreate: 3600, stopReason: 'tool_use',
  })
  const llm2Id = (llm2 as any).spanId
  const t3 = toolSpan(tl, traceId, llm2Id, { toolName: 'Edit',
    toolInput: { file_path: 'src/auth/auth.ts', old_string: 'function login(', new_string: 'async function login(' }, durationMs: 80 })
  const t4 = toolSpan(tl, traceId, llm2Id, { toolName: 'Edit',
    toolInput: { file_path: 'src/auth/middleware.ts', old_string: 'function verify(', new_string: 'async function verify(' }, durationMs: 70 })
  const t5 = toolSpan(tl, traceId, llm2Id, { toolName: 'Bash',
    toolInput: { command: 'npm test -- --testPathPattern=auth' }, durationMs: 2200 })
  await post('/v1/traces', tracePayload([llm2, t3, t4, t5]))
  ok('Turn 2: Edit auth.ts + middleware.ts, tests pass')
  await sleep(1100)

  // Turn 3: confirm + wrap up
  const llm3 = llmSpan(tl, traceId, rootId, {
    inputTokens: 7200, outputTokens: 310, cacheRead: 11_000, cacheCreate: 200, stopReason: 'end_turn', ttft: 190,
  })
  await post('/v1/traces', tracePayload([llm3]))
  ok('Turn 3: done')
  await sleep(400)

  // Root session span (sent last so it closes the session)
  const root = sessionSpan(tl, traceId, rootId, {
    startMs: rootStart,
    userRequest: 'Refactor the auth module to use async/await throughout and add proper error handling',
    outcome: 'success', totalInput: 26_400, totalOutput: 1430,
  })
  await post('/v1/traces', tracePayload([root]))
  ok('Session closed — normal refactor\n')
}

// ── Scenario 2: Stuck loop (triggers Loop Breaker automation) ─────────────────
// Populates: Errors, Alerts, Automation, Recommendations

async function scenarioLoop(): Promise<void> {
  log('Scenario 2 — Stuck loop (same Bash command fails 7×, Loop Breaker triggers)')
  const tl = new Timeline(240_000)
  const traceId = hex(16)
  const rootId  = hex(8)
  const rootStart = tl.tick(0)
  const allSpans: object[] = []

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
      toolName: 'Bash',
      toolInput: { command: 'docker build -t myapp . --no-cache' },
      durationMs: 900 + turn * 120,
      error: true,
    })
    allSpans.push(llm, tool)
    await post('/v1/traces', tracePayload([llm, tool]))
    sim(`Turn ${turn + 1}: Bash "docker build" → error  (${inputGrowth[turn].toLocaleString()} input tokens, same command repeated)`)
    await sleep(500)
  }

  const root = sessionSpan(tl, traceId, rootId, {
    startMs: rootStart,
    userRequest: 'Build and push the Docker container to the registry',
    outcome: 'error', totalInput: 125_400, totalOutput: 1890,
  })
  await post('/v1/traces', tracePayload([root]))
  ok('Session closed — check Errors + Automation tabs for Loop Breaker trigger\n')
}

// ── Scenario 3: Context bloat (triggers Context Compaction automation) ─────────
// Populates: Tokens (growing bars), Efficiency, Automation

async function scenarioCompaction(): Promise<void> {
  log('Scenario 3 — Context bloat (input grows 148k tokens across 10 turns)')
  const tl = new Timeline(180_000)
  const traceId = hex(16)
  const rootId  = hex(8)
  const rootStart = tl.tick(0)

  // Input grows steeply; output shrinks — classic context death spiral
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
      toolName: 'Grep',
      toolInput: { pattern: `TODO.*${turn}`, path: '.' },
      durationMs: 200,
    })
    const batch = turn < 9 ? [llm, tool] : [llm]
    await post('/v1/traces', tracePayload(batch))
    ok(`Turn ${turn + 1}: ${inputProfile[turn].toLocaleString()} input / ${outputProfile[turn]} output tokens`)
    await sleep(350)
  }

  const root = sessionSpan(tl, traceId, rootId, {
    startMs: rootStart,
    userRequest: 'Find and address every TODO comment across the entire codebase',
    outcome: 'success', totalInput: inputProfile.reduce((a, b) => a + b, 0), totalOutput: 2160,
  })
  await post('/v1/traces', tracePayload([root]))
  ok('Session closed — context compaction should have triggered\n')
}

// ── Scenario 4: Copilot session ────────────────────────────────────────────────
// Populates: Agents comparison tab (Claude vs Copilot side-by-side)

async function scenarioCopilot(): Promise<void> {
  log('Scenario 4 — GitHub Copilot session (Agents comparison tab)')
  const tl = new Timeline(120_000)
  const traceId = hex(16)
  const rootId  = hex(8)
  const rootStart = tl.tick(0)

  function copilotAttr(key: string, val: string | number) { return attr(key, val) }

  // Root agent span
  const root = span({
    traceId, spanId: rootId,
    name: 'invoke_agent',
    startMs: rootStart, endMs: rootStart + 95_000,
    attrs: [
      copilotAttr('copilot_chat.user_request', 'Add input validation to the registration form'),
      copilotAttr('gen_ai.request.model', 'gpt-4o'),
      copilotAttr('gen_ai.usage.input_tokens', 14_200),
      copilotAttr('gen_ai.usage.output_tokens', 820),
      copilotAttr('gen_ai.usage.cache_read.input_tokens', 9400),
    ],
  })

  // Two LLM turns
  const chat1Start = tl.tick(600)
  const chat1 = span({
    traceId, spanId: hex(8), parentSpanId: rootId,
    name: 'chat/completions',
    startMs: chat1Start, endMs: tl.tick(1800),
    attrs: [
      copilotAttr('gen_ai.usage.input_tokens', 6800),
      copilotAttr('gen_ai.usage.output_tokens', 440),
      copilotAttr('gen_ai.usage.cache_read.input_tokens', 4200),
      copilotAttr('gen_ai.request.model', 'gpt-4o'),
      copilotAttr('copilot_chat.time_to_first_token', 520),
    ],
  })
  const chatId1 = (chat1 as any).spanId
  const toolEx1 = span({
    traceId, spanId: hex(8), parentSpanId: chatId1,
    name: 'execute_tool/read_file',
    startMs: tl.tick(100), endMs: tl.tick(160),
    attrs: [copilotAttr('tool.name', 'read_file'), copilotAttr('tool.input', JSON.stringify({ path: 'src/components/RegisterForm.tsx' }))],
  })

  const chat2Start = tl.tick(400)
  const chat2 = span({
    traceId, spanId: hex(8), parentSpanId: rootId,
    name: 'chat/completions',
    startMs: chat2Start, endMs: tl.tick(2100),
    attrs: [
      copilotAttr('gen_ai.usage.input_tokens', 7400),
      copilotAttr('gen_ai.usage.output_tokens', 380),
      copilotAttr('gen_ai.usage.cache_read.input_tokens', 5200),
      copilotAttr('gen_ai.request.model', 'gpt-4o'),
      copilotAttr('copilot_chat.time_to_first_token', 490),
    ],
  })
  const chatId2 = (chat2 as any).spanId
  const toolEx2 = span({
    traceId, spanId: hex(8), parentSpanId: chatId2,
    name: 'execute_tool/write_file',
    startMs: tl.tick(100), endMs: tl.tick(90),
    attrs: [copilotAttr('tool.name', 'write_file'), copilotAttr('tool.input', JSON.stringify({ path: 'src/components/RegisterForm.tsx' }))],
  })

  await post('/v1/traces', tracePayload([root, chat1, toolEx1, chat2, toolEx2]))
  ok('Copilot session — gpt-4o, 2 turns, RegisterForm.tsx\n')
}

// ── Scenario 5: Errors + recovery ─────────────────────────────────────────────
// Populates: Errors tab, Recommendations (error cascade), multiple file types

async function scenarioErrors(): Promise<void> {
  log('Scenario 5 — Errors + recovery (TypeScript compile errors, then fix)')
  const tl = new Timeline(60_000)
  const traceId = hex(16)
  const rootId  = hex(8)
  const rootStart = tl.tick(0)

  // Turn 1: write broken file
  const llm1 = llmSpan(tl, traceId, rootId, { inputTokens: 5400, outputTokens: 520, cacheCreate: 5400 })
  const llm1Id = (llm1 as any).spanId
  const t1 = toolSpan(tl, traceId, llm1Id, { toolName: 'Write',
    toolInput: { file_path: 'src/utils/parser.ts', content: '...' }, durationMs: 60 })
  const t2 = toolSpan(tl, traceId, llm1Id, { toolName: 'Bash',
    toolInput: { command: 'npx tsc --noEmit' }, durationMs: 3100, error: true })
  await post('/v1/traces', tracePayload([llm1, t1, t2]))
  sim('Turn 1: wrote parser.ts → tsc --noEmit failed (intentional type error)')
  await sleep(700)

  // Turn 2: attempt fix — different error
  const llm2 = llmSpan(tl, traceId, rootId, { inputTokens: 8800, outputTokens: 390,
    cacheRead: 5400, cacheCreate: 3400, stopReason: 'tool_use' })
  const llm2Id = (llm2 as any).spanId
  const t3 = toolSpan(tl, traceId, llm2Id, { toolName: 'Edit',
    toolInput: { file_path: 'src/utils/parser.ts', old_string: 'any', new_string: 'unknown' }, durationMs: 55 })
  const t4 = toolSpan(tl, traceId, llm2Id, { toolName: 'Bash',
    toolInput: { command: 'npx tsc --noEmit' }, durationMs: 2900, error: true })
  await post('/v1/traces', tracePayload([llm2, t3, t4]))
  sim('Turn 2: partial fix → tsc still failing (second simulated error)')
  await sleep(700)

  // Turn 3: read the error output carefully, fix properly
  const llm3 = llmSpan(tl, traceId, rootId, { inputTokens: 10_200, outputTokens: 480,
    cacheRead: 8800, cacheCreate: 1400, stopReason: 'tool_use' })
  const llm3Id = (llm3 as any).spanId
  const t5 = toolSpan(tl, traceId, llm3Id, { toolName: 'Edit',
    toolInput: { file_path: 'src/utils/parser.ts', old_string: 'function parse(', new_string: 'export function parse(' }, durationMs: 50 })
  const t6 = toolSpan(tl, traceId, llm3Id, { toolName: 'Write',
    toolInput: { file_path: 'src/utils/parser.test.ts', content: '...' }, durationMs: 55 })
  const t7 = toolSpan(tl, traceId, llm3Id, { toolName: 'Bash',
    toolInput: { command: 'npx tsc --noEmit && npm test' }, durationMs: 4200 })
  await post('/v1/traces', tracePayload([llm3, t5, t6, t7]))
  ok('Turn 3: fixed, tests pass')
  await sleep(500)

  const root = sessionSpan(tl, traceId, rootId, {
    startMs: rootStart,
    userRequest: 'Add a type-safe CSV parser utility to src/utils/',
    outcome: 'success', totalInput: 24_400, totalOutput: 1390,
  })
  await post('/v1/traces', tracePayload([root]))
  ok('Session closed — error cascade + recovery\n')
}

// ── Fixture replay ─────────────────────────────────────────────────────────────

interface SpanAttr { key: string; value: { stringValue?: string; intValue?: number; doubleValue?: number; boolValue?: boolean } }
interface CapturedSpan {
  traceId: string; spanId: string; parentSpanId?: string; name: string
  startTime: string; endTime: string
  attributes: SpanAttr[]; status?: { code: number; message?: string }
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

async function replayFixture(name: string): Promise<void> {
  const fp = path.join(__dirname, 'fixtures', name + '.json')
  if (!fs.existsSync(fp)) {
    err(`Fixture not found: ${fp}`)
    err(`Run  pnpm run capture -- <name>  to record a session, or  pnpm run capture:list  to see saved fixtures.`)
    process.exit(1)
  }

  const fixture: Fixture = JSON.parse(fs.readFileSync(fp, 'utf-8'))
  const spans = freshSpans(fixture.spans)
  if (spans.length === 0) { err('Fixture is empty.'); process.exit(1) }

  const agents = fixture.agents?.join(', ') || 'unknown'
  const durSec = fixture.durationMs > 0 ? `${Math.round(fixture.durationMs / 1000)}s` : '?'
  log(`Fixture: \x1b[32m${name}\x1b[0m  (${spans.length} spans, ${durSec}, ${agents})`)
  log(`Captured: ${new Date(fixture.capturedAt).toLocaleString()}\n`)

  // Remap timestamps: shift so the earliest span starts ~90s ago
  const minNano = spans.reduce<bigint>(
    (m, s) => { const t = BigInt(s.startTime); return t < m ? t : m },
    BigInt('9'.repeat(20))
  )
  const targetNano = BigInt(Date.now() - 90_000) * 1_000_000n
  const shift = targetNano - minNano

  const groups = temporalGroups(spans)
  log(`Streaming ${groups.length} temporal groups at ${SPEED}× speed…\n`)

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i]
    const otlpSpans = group.map(s => spanToOtlp(s, shift))
    await post('/v1/traces', { resourceSpans: [{ scopeSpans: [{ spans: otlpSpans }] }] })

    // Show representative span names for this group
    const names = [...new Set(group.map(s => s.name))].slice(0, 3).join(', ')
    ok(`Group ${i + 1}/${groups.length}: ${group.length} span${group.length > 1 ? 's' : ''} (${names}${group.length > 3 ? ', …' : ''})`)

    // Delay proportional to gap between this group and the next (capped at 8s real-time)
    if (i < groups.length - 1) {
      const gapNano = BigInt(groups[i + 1][0].startTime) - BigInt(group[0].startTime)
      const gapMs = Number(gapNano / 1_000_000n)
      const delayMs = Math.min(gapMs / SPEED, 8_000)
      if (delayMs > 100) await sleep(delayMs)
    }
  }
  ok(`Fixture replay complete\n`)
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  log(`Targeting http://127.0.0.1:${PORT}  speed=${SPEED}×  scenario=${SCENARIO}`)

  const alive = await checkServer()
  if (!alive) {
    err(`Cannot reach http://127.0.0.1:${PORT} — start the standalone server first:`)
    err('  pnpm run standalone')
    process.exit(1)
  }
  log('Server reachable. Dashboard: http://localhost:3000\n')

  try {
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

    function run(name: string) { return SCENARIO === 'all' || SCENARIO === name }
    if (run('normal'))      await scenarioNormal()
    if (run('loop'))        await scenarioLoop()
    if (run('compaction'))  await scenarioCompaction()
    if (run('copilot'))     await scenarioCopilot()
    if (run('errors'))      await scenarioErrors()

    log('All done. Open http://localhost:3000 and explore every tab.')
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    err(`${msg}`)
    err('Is the standalone server running?  (pnpm run standalone)')
    process.exit(1)
  }
}

main()
