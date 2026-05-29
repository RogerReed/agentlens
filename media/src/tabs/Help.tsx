import { esc } from '../utils'

// ── Data ──────────────────────────────────────────────────────────────────────

const VIEWS: [string, string][] = [
  ['Efficiency',      'The default tab. Per-session metrics (turns, cache hit rate, error rate), a heat-scored session breakdown table, and a context growth chart showing input token accumulation across LLM calls within each session.'],
  ['Cost',            'Estimated session cost for Copilot and Codex sessions. Copilot supports three billing models: token-based AI Credits (Jun 2026+), request-based with multipliers (pre-Jun 2026), and annual-plan request-based (post-Jun 2026 for annual plan holders). Codex always uses token-based pricing. Shows a per-session bar chart and a cross-session cost table. Estimates only — not your actual bill.'],
  ['Recommendations', 'Actionable insights for improving prompt efficiency, plus loop and malfunction detection. Two signal categories: efficiency insights (token waste, cache, tool failures) and loop signals (tool deadlock, state spirals, error recurrence, runaway steps, context accumulation).'],
  ['Alerts',          'Configurable alerts with shared context/cache rules plus per-agent thresholds for turns, errors, active session time, and identical tool repeats. The tab badge shows the count of active alerts.'],
  ['Automation',      'Automated prompts triggered when session thresholds are crossed. Configure per-agent automations for Loop Breaker, Turn Limit Wrap-up, and Context Dump. In the VS Code extension, automations show a notification or open the agent chat directly; in standalone mode they write to a file-based relay.'],
  ['Tokens',          'Token consumption aggregated by span name and per session, sorted from highest to lowest.'],
  ['Latency',         'Span durations as a color-coded grid, helping identify which operations are consistently slow.'],
  ['Summaries',       'A human-readable session waterfall with LLM decisions, tool arguments and results, token usage per step, and background overhead breakdown.'],
  ['Traces',          'Raw OTLP spans as horizontal bars on a time axis, preserving the full parent-child nesting hierarchy and exact timing.'],
  ['Files',           'Files created or modified by the agent, organized by session with inline before/after diffs showing exactly what changed.'],
  ['Flow',            'LLM turns and tool calls visualized as a semantic graph — one node per turn, one per unique tool, edges weighted by call frequency. Supports zoom, pan, and playback animation.'],
  ['Agents',          'Side-by-side comparison of Copilot, Claude, and Codex with per-agent token totals, cache rates, time-to-first-token, and top tools, plus a full session history table.'],
  ['Tools',           'Donut chart of tool call distribution broken down by tool name, with call counts and error rates per tool.'],
  ['Errors',          'All spans that completed with an error status. Click any item to expand its full details and attributes.'],
  ['Export',          'Export OTEL spans as JSON files — full or redacted (prompt text, tool inputs, and tool results replaced with [redacted]). Replay either format with pnpm run demo to re-examine a past session without the original agent running.'],
  ['Help',            'This tab — an overview of the plugin, setup, agent OTEL data shapes, view descriptions, a glossary, and documentation for Recommendations and malfunction detection.'],
]

const TERMS: [string, string][] = [
  ['Agent Loop / Malfunction', 'A behavioral pattern in which an AI agent is stuck, oscillating, or spiraling into unproductive work. AgentLens detects five patterns: Tool Call Deadlock, State Corruption Spiral, Hallucination Amplification Loop, Ambiguous Success / Escalating Scope, and Infinite Loop — Context Accumulation.'],
  ['Agent',                  'The AI coding assistant (e.g. GitHub Copilot, Claude Code, Codex) that receives your prompt, reasons about the task, and decides which tools to use. It manages the workflow, breaks down tasks, and may call the underlying LLM multiple times per session to complete a single request. The agent is the orchestrator; the LLM is the engine it drives.'],
  ['Avg Input/Call',         'Average number of input tokens sent to the language model per LLM call. Lower means leaner prompts. Under 10K is lean; 10-30K is normal; 30K+ suggests large instruction files, verbose tool definitions, or accumulated context bloat.'],
  ['Avg Turns/Session',      'Average number of LLM round-trips per session. Lower is more efficient. 1-3 turns is typical for simple tasks; 5+ may indicate the agent is struggling or the prompt needs more specifics.'],
  ['Background Span',        'A span that runs outside the main request/response cycle — e.g., telemetry uploads, extension lifecycle events, or periodic health checks.'],
  ['Cache Create Tokens',    'Tokens written into the prompt cache on the server during this request. These tokens become available for cache hits on subsequent requests.'],
  ['Cache Hit Rate',         'The percentage of input tokens served from a server-side prompt cache instead of being reprocessed. Higher rates reduce latency and cost.'],
  ['Cache Read Tokens',      'Input tokens served from the server-side prompt cache, avoiding reprocessing. Shown in efficiency metrics.'],
  ['Context Bloat',          'An efficiency insight triggered when input tokens grow significantly across turns within a session.'],
  ['Files Changed',          'Unique files that were created or modified by the agent during the current data collection period.'],
  ['Input Tokens',           'The number of tokens sent to the language model in a request, including system instructions, conversation history, tool definitions, and the user prompt.'],
  ['Loop Signal',            'A behavioral signal in the Recommendations tab indicating the agent is stuck, oscillating, or making no forward progress. Shown with a ↺ icon.'],
  ['LLM',                    'Large Language Model. The underlying AI model (e.g. GPT-4o, Claude Sonnet) that generates text, answers questions, or produces code. The agent sends requests to the LLM as needed; the model itself does not manage tools or workflow. It is the engine that generates language and code for the agent to act on.'],
  ['LLM Call',               'A single request-response cycle to the language model. One session typically includes multiple LLM calls as the agent iterates.'],
  ['OTLP',                   'OpenTelemetry Protocol — the standard format used to collect and transmit telemetry from AI agents to this extension. AgentLens accepts trace spans and log-derived events.'],
  ['Outcome',                'How a session concluded: "text" means the agent responded with a text answer; "tool" means the last action was a tool call.'],
  ['Output Tokens',          'The number of tokens generated by the language model in its response, including reasoning, tool call instructions, and final answers.'],
  ['Output Ratio',           'Percentage of total tokens that are output (generated by the model). In cached agentic coding sessions this can be naturally tiny, so AgentLens no longer uses it as a standalone alert.'],
  ['Prompt',                 'The text you type into the AI chat to request work. Each prompt initiates a new session.'],
  ['Request',                'The user-visible message sent to the agent in a single prompt. In OTEL terms, the request anchor differs by agent: Copilot uses invoke_agent, Claude uses claude_code.interaction, and Codex is normalized from prompt log events.'],
  ['Retain Spans',           "A waterfall checkbox option. When checked, spans from previous prompts are kept visible alongside new ones."],
  ['Session',                'A single prompt-to-response cycle. Starts when you send a prompt and ends when the agent delivers its final response. AgentLens normalizes different Copilot, Claude, and Codex OTEL shapes into this shared model.'],
  ['Span',                   'A single timed operation recorded by OpenTelemetry. AgentLens displays true trace spans and normalized log events with a span-like name, duration, and attributes.'],
  ['Span ID',                'A unique identifier for a single span within a trace. Used to establish parent-child relationships between operations.'],
  ['Sparkline',              'A small inline chart shown below summary cards, depicting the trend of a metric over recent time buckets.'],
  ['Tokens',                 'The fundamental unit language models use to process text. Roughly 1 token ≈ 4 characters or ¾ of a word.'],
  ['Tool Call',              'A single invocation of a tool by the agent — e.g., reading a file, running a search, or executing a terminal command.'],
  ['Tool Definition Overhead', 'An efficiency insight triggered when a large fraction of input tokens is consumed by tool definition schemas rather than actual content.'],
  ['Trace',                  'A group of related spans sharing a Trace ID. Copilot and Claude usually map a trace to a session; Codex log events can require AgentLens to group records by conversation, session, thread, or turn attributes.'],
  ['Trace ID',               'A unique identifier linking all spans belonging to the same session/request.'],
  ['Turn',                   'One LLM call within a session. A multi-turn session involves the agent calling the LLM, executing tools, then calling the LLM again.'],
  ['TTFT',                   'Time to First Token — the latency between sending a prompt and receiving the first token of the response.'],
  ['Waterfall',              'A visualization where spans are displayed as horizontal bars on a time axis, with nesting depth shown by indentation.'],
]

function termId(term: string): string {
  return 'gl-' + term.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

const HELP_SECTIONS = {
  overview: {
    href: '#help-overview',
    heading: 'Overview',
  },
  config: {
    href: '#help-config',
    heading: 'Setup',
  },
  otel: {
    href: '#help-otel',
    heading: 'OTEL Data',
  },
  insights: {
    href: '#help-insights',
    heading: 'Insights',
  },
  loops: {
    href: '#help-loops',
    heading: 'Loops',
  },
  views: {
    href: '#help-views',
    heading: 'Views',
  },
  glossary: {
    href: '#help-glossary',
    heading: 'Glossary',
  },
} as const

const TOC_SECTIONS = Object.values(HELP_SECTIONS)

const AGENT_OTEL_SHAPES: Array<{
  agent: string
  format: string
  coverage: string
  gaps: string
}> = [
  {
    agent: 'Copilot',
    format: 'OpenTelemetry <a href="#gl-trace">trace</a> <a href="#gl-span">spans</a> with a clean single-trace hierarchy. Each conversation is one trace; <a href="#gl-llm-call">LLM calls</a> and tool calls are child spans nested under a session root. No extra configuration needed.',
    coverage: 'Prompt text, token counts (<a href="#gl-input-tokens">input</a>, <a href="#gl-output-tokens">output</a>), model name, <a href="#gl-ttft">TTFT</a>, tool names, tool arguments, tool results, and file paths are all present natively without any extra configuration.',
    gaps: '<a href="#gl-cache-read-tokens">Cache</a> token data (read/create) is not part of Copilot\'s telemetry. No additional configuration unlocks further data — what Copilot exposes is already fully available.',
  },
  {
    agent: 'Claude Code',
    format: 'OpenTelemetry trace spans. The session root span closes when the interaction ends, with LLM calls and tool calls as children. Optional supplemental log records are emitted when enhanced telemetry env vars are set.',
    coverage: 'With the recommended configuration (all three OTEL_LOG_* vars set): prompt text, token counts, model, tool names, tool arguments, file paths, and full file diff content are all available.',
    gaps: 'The three OTEL_LOG_* env vars are not enabled by default — without them, tool arguments are absent, prompt text is omitted, and file diff content is unavailable. Cache token data is only present when using a model that supports prompt caching.',
  },
  {
    agent: 'Codex',
    format: 'Primarily flat OTLP log records (structured JSON events sent to /v1/logs), not trace spans. Each session is a stream of log events grouped by conversation and turn identifiers. Adding trace_exporter to ~/.codex/config.toml also emits timing spans to /v1/traces. Both the CLI and the VS Code extension read the same config file.',
    coverage: 'With the recommended configuration (log_user_prompt = true and both exporters set): prompt text, token counts, model name, TTFT, tool names, tool arguments, tool results, and span timing are all present.',
    gaps: 'Trace and Timeline tabs have less span granularity than Copilot or Claude Code since Codex is primarily log-based. Without trace_exporter, span waterfall data is limited.',
  },
]

// ── Reusable styles ───────────────────────────────────────────────────────────

const codeStyle = 'font-size:11px;background:var(--panel-bg);padding:1px 4px;border-radius:3px'
const preStyle = 'background:var(--panel-bg);border:1px solid var(--border);border-radius:5px;padding:10px 14px;font-size:11.5px;line-height:1.6;overflow-x:auto;white-space:pre'
const h4Style = 'font-size:13px;font-weight:600;margin:0 0 6px;color:var(--fg,inherit)'
const mutedP = 'font-size:12px;color:var(--muted);margin:0 0 8px'

// ── Sub-components ────────────────────────────────────────────────────────────

function InsightBlock({ id, title, why, steps, impact }: {
  id: string; title: string; why: string; steps: string; impact: string
}) {
  return (
    <div class="glossary-item" id={id} style="scroll-margin-top:12px;flex-direction:column;gap:0">
      <dt class="glossary-term" style="margin-bottom:6px">{title}</dt>
      <dd class="glossary-def" style="display:block">
        <p style="margin:0 0 8px"><strong style="color:var(--fg)">Why it happens: </strong><span dangerouslySetInnerHTML={{ __html: why }} /></p>
        <p style="margin:0 0 4px"><strong style="color:var(--fg)">How to fix:</strong></p>
        <ol style="margin:0 0 8px;padding-left:20px;font-size:12px;line-height:1.7" dangerouslySetInnerHTML={{ __html: steps }} />
        <p style="margin:0;font-size:11px;color:var(--muted)"><strong style="color:var(--fg);font-size:11px">Expected impact: </strong><span dangerouslySetInnerHTML={{ __html: impact }} /></p>
      </dd>
    </div>
  )
}

function LoopBlock({ id, title, why, example, steps, impact }: {
  id: string; title: string; why: string; example: string; steps: string; impact: string
}) {
  return (
    <div class="glossary-item" id={id} style="scroll-margin-top:12px;flex-direction:column;gap:6px">
      <div style="display:flex;gap:12px;align-items:flex-start">
        <dt class="glossary-term" style="min-width:200px">
          {title}
        </dt>
        <dd class="glossary-def" dangerouslySetInnerHTML={{ __html: why }} />
      </div>
      <div style="padding-left:8px;font-size:11px;color:var(--muted);line-height:1.5"><strong style="color:var(--fg)">Example: </strong><span dangerouslySetInnerHTML={{ __html: example }} /></div>
      <div style="padding-left:8px;font-size:11px;line-height:1.6">
        <p style="margin:0 0 3px"><strong style="color:var(--fg);font-size:11px">How to fix:</strong></p>
        <ol style="margin:0 0 6px;padding-left:18px;font-size:11px;line-height:1.7;color:var(--muted)" dangerouslySetInnerHTML={{ __html: steps }} />
        <p style="margin:0;font-size:10px;color:var(--muted)"><strong style="color:var(--fg);font-size:10px">Expected impact: </strong><span dangerouslySetInnerHTML={{ __html: impact }} /></p>
      </div>
    </div>
  )
}

// ── Section components ────────────────────────────────────────────────────────

function Toc() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: 'html,body{scroll-behavior:smooth}.help-section{scroll-margin-top:44px}.glossary-item[id]{scroll-margin-top:44px}.help-toc a{display:inline-block;padding:3px 11px;border-radius:12px;font-size:11px;font-weight:500;color:var(--muted);text-decoration:none;border:1px solid var(--border);transition:color .1s,background .1s}.help-toc a:hover{color:var(--fg);background:var(--hover);border-color:var(--fg)}' }} />
      <nav class="help-toc" aria-label="Help sections" style="position:sticky;top:0;z-index:20;background:var(--vscode-editorWidget-background,var(--bg));border-bottom:1px solid var(--border);padding:7px 0 8px;margin:0 -16px 20px -12px;padding-left:12px;display:flex;gap:4px;flex-wrap:wrap">
        {TOC_SECTIONS.map(s => <a href={s.href}>{s.heading}</a>)}
      </nav>
    </>
  )
}

function OverviewSection() {
  const mascotSrc = window.__MASCOT_URI__ ?? ''
  return (
    <div class="help-section" id="help-overview">
      {mascotSrc && (
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <img src={esc(mascotSrc)} alt="AgentLens mascot" style={{ maxWidth: '65%', height: 'auto', display: 'block', margin: '0 auto' }} />
          <p style={{ textAlign: 'center', fontStyle: 'italic', color: 'var(--muted)', marginTop: 8, marginBottom: 0 }}>Watching your agents so you don't have to.</p>
        </div>
      )}
      <h3 class="help-heading">{HELP_SECTIONS.overview.heading}</h3>
      <div class="help-overview-body">
        <p><strong>AgentLens</strong> is a local observability dashboard for AI coding <a href="#gl-agent">agents</a> — GitHub Copilot, Claude Code, and Codex. It captures the <a href="#gl-otlp">OpenTelemetry (OTLP)</a> traces each agent emits and surfaces them through an interactive dashboard showing <a href="#gl-tokens">token</a> usage, cost, latency, <a href="#gl-tool-call">tool calls</a>, file changes, <a href="#gl-cache-hit-rate">cache</a> performance, and <a href="#gl-agent-loop-malfunction">loop</a> detection in real time. All data stays on your machine. Available as a VS Code extension or a standalone Docker image.</p>
      </div>
    </div>
  )
}

function ConfigSection() {
  const standalone = window.__STANDALONE__ === true
  const kbdStyle = 'font-size:11px;background:var(--panel-bg);padding:1px 5px;border-radius:3px;border:1px solid var(--border)'
  const pathNote = (mac: string, win: string) => (
    <p style="font-size:11px;color:var(--muted);margin:0 0 6px">
      macOS/Linux: <code style={codeStyle}>{mac}</code> &nbsp;·&nbsp; Windows: <code style={codeStyle}>{win}</code>
    </p>
  )

  // ── "Not seeing any data?" callout ──────────────────────────────────────────
  const callout = standalone ? (
    <div style="margin-bottom:20px;background:var(--hover);border:1px solid var(--border);border-left:3px solid var(--warning,#ffb74d);border-radius:4px;padding:10px 14px">
      <p style="font-size:12px;font-weight:600;margin:0 0 8px;color:var(--foreground)">Not seeing any data?</p>
      <p style="font-size:12px;color:var(--muted);margin:0 0 6px">Run the setup script once to configure agents automatically, then restart each agent.</p>
      <pre style="font-size:11px;background:var(--panel-bg);border:1px solid var(--border);border-radius:3px;padding:6px 10px;margin:0 0 8px;overflow-x:auto;white-space:pre">{`# macOS / Linux — make executable (once), then run:
chmod +x scripts/configure-agents.sh
./scripts/configure-agents.sh             # all agents
./scripts/configure-agents.sh --agent claude
./scripts/configure-agents.sh --agent codex
./scripts/configure-agents.sh --agent copilot

# Windows (PowerShell) — if blocked, allow scripts first (once):
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\\scripts\\configure-agents.ps1
.\\scripts\\configure-agents.ps1 -Agent claude
.\\scripts\\configure-agents.ps1 -Agent codex
.\\scripts\\configure-agents.ps1 -Agent copilot`}</pre>
      <p style="font-size:11px;color:var(--muted);margin:0 0 6px">Config is read at startup — restart each <a href="#gl-agent">agent</a> after running the script:</p>
      <table style="font-size:11px;border-collapse:collapse;width:100%">
        <tbody style="color:var(--muted)">
          <tr style="border-bottom:1px solid var(--border)">
            <td style="padding:4px 12px 4px 0;white-space:nowrap;vertical-align:top;color:var(--foreground)">Claude Code</td>
            <td style="padding:4px 0;vertical-align:top">Exit any running <code style={codeStyle}>claude</code> session and start a new one.</td>
          </tr>
          <tr style="border-bottom:1px solid var(--border)">
            <td style="padding:4px 12px 4px 0;white-space:nowrap;vertical-align:top;color:var(--foreground)">Codex</td>
            <td style="padding:4px 0;vertical-align:top">Exit any running <code style={codeStyle}>codex</code> session and start a new one.</td>
          </tr>
          <tr>
            <td style="padding:4px 12px 4px 0;white-space:nowrap;vertical-align:top;color:var(--foreground)">Copilot CLI</td>
            <td style="padding:4px 0;vertical-align:top">Open a new terminal (or restart your shell) to pick up the env vars, then run <code style={codeStyle}>copilot</code>.</td>
          </tr>
        </tbody>
      </table>
      <p style="font-size:11px;color:var(--muted);margin:8px 0 0">Start a short <a href="#gl-session">session</a> and check whether a session card appears in the sidebar to confirm data is arriving.</p>
    </div>
  ) : (
    <div style="margin-bottom:20px;background:var(--hover);border:1px solid var(--border);border-left:3px solid var(--warning,#ffb74d);border-radius:4px;padding:10px 14px">
      <p style="font-size:12px;font-weight:600;margin:0 0 8px;color:var(--foreground)">Not seeing any data?</p>
      <p style="font-size:12px;color:var(--muted);margin:0 0 8px">AgentLens automatically configures all supported agents on first activation. Just restart each <a href="#gl-agent">agent</a> once — <a href="#gl-session">sessions</a> will start appearing immediately.</p>
      <p style="font-size:11px;color:var(--muted);margin:0 0 6px">Config is read at startup — restart after AgentLens activates:</p>
      <table style="font-size:11px;border-collapse:collapse;width:100%">
        <tbody style="color:var(--muted)">
          <tr style="border-bottom:1px solid var(--border)">
            <td style="padding:4px 12px 4px 0;white-space:nowrap;vertical-align:top;color:var(--foreground)">GitHub Copilot</td>
            <td style="padding:4px 0;vertical-align:top"><kbd style={kbdStyle}>Cmd+Shift+P</kbd> / <kbd style={kbdStyle}>Ctrl+Shift+P</kbd> → <em>Reload Window</em> to restart the VS Code extension host.</td>
          </tr>
          <tr style="border-bottom:1px solid var(--border)">
            <td style="padding:4px 12px 4px 0;white-space:nowrap;vertical-align:top;color:var(--foreground)">Claude Code (CLI)</td>
            <td style="padding:4px 0;vertical-align:top">Exit any running <code style={codeStyle}>claude</code> session and start a new one.</td>
          </tr>
          <tr style="border-bottom:1px solid var(--border)">
            <td style="padding:4px 12px 4px 0;white-space:nowrap;vertical-align:top;color:var(--foreground)">Claude Code (VS Code)</td>
            <td style="padding:4px 0;vertical-align:top">Reload the VS Code window (<em>Reload Window</em> from the Command Palette).</td>
          </tr>
          <tr>
            <td style="padding:4px 12px 4px 0;white-space:nowrap;vertical-align:top;color:var(--foreground)">Codex</td>
            <td style="padding:4px 0;vertical-align:top">Exit any running <code style={codeStyle}>codex</code> session and start a new one, or reload the VS Code window if using the Codex extension.</td>
          </tr>
        </tbody>
      </table>
      <p style="font-size:11px;color:var(--muted);margin:8px 0 0">Open the <em>AgentLens</em> output channel (<em>View → Output → AgentLens</em>) to confirm spans are arriving.</p>
    </div>
  )

  // ── Manual config sections ───────────────────────────────────────────────────
  const portNote = (
    <p style={mutedP}>Manual configuration — replace <code style={codeStyle}>4318</code> with your custom port if you changed <em>agentLens.otlpPort</em>.</p>
  )

  // GitHub Copilot: show VS Code settings in extension mode, CLI env vars in standalone
  const copilotSection = (
    <div style="margin-bottom:20px">
      <h4 style={h4Style}>GitHub Copilot</h4>
      {standalone ? (
        <>
          <p style={mutedP}>Set these environment variables so they are available when you run <code style={codeStyle}>copilot</code>. The configure script updates your shell profile automatically; or set them manually.</p>
          <pre style={preStyle}>{`# macOS / Linux — add to ~/.zshrc or ~/.bashrc, then: source ~/.zshrc
export OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"
export OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT=true

# Windows — run once in PowerShell (persists across sessions):
[System.Environment]::SetEnvironmentVariable("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4318", "User")
[System.Environment]::SetEnvironmentVariable("OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT", "true", "User")`}</pre>
        </>
      ) : (
        <>
          <p style={mutedP}>Add to VS Code <strong>User Settings</strong> (<kbd style={kbdStyle}>Cmd+Shift+P</kbd> / <kbd style={kbdStyle}>Ctrl+Shift+P</kbd> → <em>Preferences: Open User Settings (JSON)</em>):</p>
          <pre style={preStyle}>{`{
  "github.copilot.chat.otel.enabled": true,
  "github.copilot.chat.otel.exporterType": "otlp-http",
  "github.copilot.chat.otel.otlpEndpoint": "http://localhost:4318"
}`}</pre>
        </>
      )}
    </div>
  )

  const claudeSection = (
    <div style="margin-bottom:20px">
      <h4 style={h4Style}>Claude Code</h4>
      <p style={mutedP}>The CLI and VS Code extension both read the same file. Add to the <code style={codeStyle}>"env"</code> block:</p>
      {pathNote('~/.claude/settings.json', '%USERPROFILE%\\.claude\\settings.json')}
      <pre style={preStyle}>{`{
  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "CLAUDE_CODE_ENHANCED_TELEMETRY_BETA": "1",
    "OTEL_TRACES_EXPORTER": "otlp",
    "OTEL_EXPORTER_OTLP_PROTOCOL": "http/json",
    "OTEL_EXPORTER_OTLP_ENDPOINT": "http://localhost:4318",
    "OTEL_LOG_TOOL_DETAILS": "1",
    "OTEL_LOG_TOOL_CONTENT": "1",
    "OTEL_LOG_USER_PROMPTS": "1"
  }
}`}</pre>
      <p style="font-size:11px;color:var(--muted);margin-top:6px;line-height:1.6">
        <strong>CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1</strong> enables span-level tracing — without it <a href="#gl-turn">turns</a> and <a href="#gl-llm-call">LLM calls</a> are indistinguishable and cache token breakdowns are unavailable.{' '}
        The three <strong>OTEL_LOG_*</strong> vars unlock tool details, file diff content (needed for the Files tab), and your typed prompt.
      </p>
    </div>
  )

  const codexSection = (
    <div style="margin-bottom:4px">
      <h4 style={h4Style}>Codex</h4>
      <p style={mutedP}>The CLI and VS Code extension both read the same file. Add an <code style={codeStyle}>[otel]</code> section:</p>
      {pathNote('~/.codex/config.toml', '%USERPROFILE%\\.codex\\config.toml')}
      <pre style={preStyle}>{`[otel]
log_user_prompt = true
exporter = { otlp-http = { endpoint = "http://localhost:4318", protocol = "json" } }
trace_exporter = { otlp-http = { endpoint = "http://localhost:4318", protocol = "json" } }`}</pre>
      <p style="font-size:11px;color:var(--muted);margin-top:6px;line-height:1.6">
        <strong>log_user_prompt=true</strong> includes your typed prompt; without it sessions show <code style={codeStyle}>[session in progress]</code>.{' '}
        <code style={codeStyle}>exporter</code> sends log events; <code style={codeStyle}>trace_exporter</code> sends <a href="#gl-span">trace spans</a>. Both point at the same endpoint.
      </p>
    </div>
  )

  const manualHeading = (
    <h4 style="font-size:13px;font-weight:600;margin:20px 0 6px;padding-bottom:5px;border-bottom:1px solid var(--border);color:var(--fg)">Manual Configuration</h4>
  )

  return (
    <div class="help-section" id="help-config">
      <h3 class="help-heading">{HELP_SECTIONS.config.heading}</h3>
      {callout}
      {manualHeading}
      {portNote}
      {copilotSection}
      {claudeSection}
      {codexSection}
    </div>
  )
}

function AgentOtelSection() {
  return (
    <div class="help-section" id="help-otel">
      <h3 class="help-heading">{HELP_SECTIONS.otel.heading}</h3>
      <div class="help-overview-body">
        <p>AgentLens normalizes three different <a href="#gl-otlp">OTEL</a> shapes into one dashboard model. The shared model is a prompt-to-response <a href="#gl-session">session</a> with <a href="#gl-turn">LLM turns</a>, <a href="#gl-tool-call">tool calls</a>, <a href="#gl-tokens">token</a> usage, timing, errors, and files, but the raw data arrives differently for each agent.</p>
        <div class="glossary">
          {AGENT_OTEL_SHAPES.map(row => (
            <div class="glossary-item" style="flex-direction:column;gap:6px">
              <dt class="glossary-term">{row.agent}</dt>
              <dd class="glossary-def" style="display:block">
                <p style="margin:0 0 6px"><strong style="color:var(--fg)">Format: </strong><span dangerouslySetInnerHTML={{ __html: row.format }} /></p>
                <p style="margin:0 0 6px"><strong style="color:var(--fg)">What's included: </strong><span dangerouslySetInnerHTML={{ __html: row.coverage }} /></p>
                <p style="margin:0"><strong style="color:var(--fg)">Gaps: </strong><span dangerouslySetInnerHTML={{ __html: row.gaps }} /></p>
              </dd>
            </div>
          ))}
        </div>
        <p style="margin-top:14px;font-size:12px;color:var(--muted)">The practical effect: <a href="#gl-trace">Traces</a> and Timeline stay closest to the raw OTEL structure, while Efficiency, Summaries, Recommendations, Alerts, Automation, Agents, and Flow use the normalized session model so the three agents can be compared side by side.</p>
      </div>
    </div>
  )
}

function InsightsSection() {
  return (
    <div class="help-section" id="help-insights">
      <h3 class="help-heading">{HELP_SECTIONS.insights.heading}</h3>
      <div class="help-overview-body">
        <p>The <strong>Recommendations</strong> tab surfaces efficiency insights for <a href="#gl-tokens">token</a> waste, <a href="#gl-cache-hit-rate">cache</a> patterns, tool behavior, and prompt shape. These are the signals meant to help you spend fewer <a href="#gl-turn">turns</a> and fewer tokens on the same work.</p>
        <div class="glossary">
          <InsightBlock id="help-context-bloat" title="Context Bloat"
            why="Every LLM turn receives the full conversation so far. When tool results are large — full file reads, wide search outputs — the context balloons quickly. Instruction files that repeat the same guidance across turns are another common cause."
            steps={`<li>Run <code style="${codeStyle}">wc -c ~/.claude/CLAUDE.md</code> to measure instruction file size. Target under 4 KB.</li><li>Remove verbose examples from instruction files.</li><li>Replace broad <code style="${codeStyle}">read_file</code> calls with line-ranged reads.</li><li>Add to your prompt: "Only include relevant excerpts in your reasoning."</li>`}
            impact="Reducing context size by 30% typically halves cost per session and cuts TTFT by 15–25%."
          />
          <InsightBlock id="help-files-repeated" title="Files Read Multiple Times"
            why="Agents re-read files when processing tasks in chunks, when the file path appears ambiguously in context, or when a previous read was so broad the model lost the relevant section."
            steps={`<li>Explicitly name key files upfront in your prompt.</li><li>Specify which file contains what: <em>"The schema is in db/schema.sql lines 1-40"</em>.</li><li>Ask for a "read plan" before execution.</li><li>If a file is read 4+ times, paste the relevant lines directly into your prompt.</li>`}
            impact="Eliminating repeated reads of a 500-line file saves 2,000–5,000 input tokens per extra read."
          />
          <InsightBlock id="help-high-turns" title="High Turn Count"
            why={`High turn counts happen when the agent discovers information iteratively. The prompt describes the <em>goal</em> but not the <em>location</em>; the task has implicit sub-tasks; or success criteria were not specified.`}
            steps={`<li>Add explicit file paths and line numbers.</li><li>Define explicit stopping conditions.</li><li>Break multi-step tasks into separate prompts.</li><li>Review the Timeline tab: if &gt;50% of turns are reads, add more upfront context.</li>`}
            impact="Going from 12 turns to 5 reduces cost by 40–60% and cuts wall-clock time proportionally."
          />
          <InsightBlock id="help-large-context" title="Large Starting Context"
            why="If your instruction files (CLAUDE.md, .agent.md, copilot-instructions.md) are large, every session starts expensive. Common culprits: long examples, full API docs pasted inline, duplicate instructions."
            steps={`<li>Audit instruction files — look for sections longer than 20 lines.</li><li>Move reference material into separate docs the agent can read on demand.</li><li>Check for duplicate instruction sources across file levels.</li><li>Target a meaningful reduction in combined static instructions — even halving them cuts baseline cost per call.</li>`}
            impact={`Trimming 10,000 tokens from starting context saves those tokens on <em>every</em> LLM call. For a 10-turn session, that is 100,000 tokens recovered.`}
          />
          <InsightBlock id="help-duplicate-searches" title="Duplicate Searches"
            why="Agents repeat searches when results were too broad, when the model forgot a search was already run, or when handling multiple similar operations."
            steps={`<li>Add directory scope: <em>"Search only in src/components/"</em>.</li><li>Provide the file name if you know it.</li><li>Use exact function/class names for symbol searches.</li><li>Add: <em>"Do not repeat a search you have already run."</em></li>`}
            impact="Each eliminated search removes one tool call and ~5KB from context."
          />
          <InsightBlock id="help-tool-failures" title="Tool Failures"
            why="Tool failures come from: (1) guessed file paths that don't exist, (2) unavailable commands, or (3) hallucinated APIs. Each failure adds error text to context."
            steps={`<li>Provide exact file paths in your prompt.</li><li>Tell the agent which package manager and runtime are available.</li><li>Check the Errors tab to see what paths were guessed.</li><li>Verify files exist before prompting.</li>`}
            impact="Each eliminated failure saves one full LLM recovery turn — roughly 30,000 wasted tokens per failure cascade."
          />
          <InsightBlock id="help-large-results" title="Large Tool Results"
            why="When the agent reads entire large files or runs broad searches, results are appended to context in full. A 50KB file adds ~12,500 tokens to every subsequent call."
            steps={`<li>Use line-range reads: <em>"Read src/app.ts lines 1-80"</em>.</li><li>Provide tighter search patterns.</li><li>Pipe command output to head or limit lines.</li><li>Split large reads into separate steps.</li>`}
            impact="Replacing a 300-line read with a 30-line read saves 2,700 tokens per turn."
          />
          <InsightBlock id="help-tool-overhead" title="Tool Definition Overhead"
            why="Every LLM call includes the full JSON schema for every available tool. With 70+ tools, this overhead reaches 8,000–15,000 tokens per call."
            steps={`<li>Create a task-specific <code style="${codeStyle}">.agent.md</code> with only needed tools.</li><li>Disable unused tools for specific task types.</li><li>Check your agent's documentation for tool restriction syntax.</li>`}
            impact="Reducing from 70 to 10 tools saves ~10,000 tokens per LLM call."
          />
          <InsightBlock id="help-cache-rate" title="Low Cache Hit Rate"
            why="Prompt caching stores the stable prefix on the model server. The cache breaks when the prefix changes between calls — timestamps, reordered instructions, or modified instruction files."
            steps={`<li>Keep static content at the <em>top</em> of prompts, identical across calls.</li><li>Avoid timestamps or counters in instruction files.</li><li>Cache rate will be low after editing instruction files until re-cached.</li><li>Ensure system prompt templates are not dynamically generated.</li>`}
            impact={`Going from 0% to 60% cache hit rate reduces effective cost by 80–90%. TTFT also drops significantly.`}
          />
        </div>
      </div>
    </div>
  )
}

function LoopsSection() {
  return (
    <div class="help-section" id="help-loops">
      <h3 class="help-heading">{HELP_SECTIONS.loops.heading}</h3>
      <div class="help-overview-body">
        <p><a href="#gl-loop-signal">Loop signals</a> are behavioral patterns indicating the <a href="#gl-agent">agent</a> is stuck, oscillating, or spiraling into unproductive work. They appear in Recommendations with warning or critical severity.</p>
        <div class="glossary">
          <LoopBlock id="help-tool-deadlock" title="Tool Call Deadlock"            why="The same tool call — identical name and arguments — was executed 5+ times. The agent is not retaining the result, likely lost in a long context."
            example={`The agent ran <code style="font-size:10px;background:var(--panel-bg);padding:1px 3px;border-radius:2px">read_file src/types.ts</code> eight times in one session.`}
            steps={`<li>Add: <em>"After reading a file, do not read it again unless you have modified it."</em></li><li>Scope the task so fewer files are needed.</li><li>Pin non-deterministic commands to fixed output.</li><li>Stop the session and restart with what was already read.</li>`}
            impact="Stopping this pattern prevents runaway token accumulation. 200K tokens looping → 20K tokens with a direct prompt."
          />
          <LoopBlock id="help-state-spiral" title="State Corruption Spiral"            why="A file was edited (A→B) then reverted (B→A). The agent oscillates because two constraints are mutually exclusive."
            example="The agent added a null check (fixing one test), removed it (breaking another), then added it back — cycling."
            steps={`<li>Clarify success criteria with explicit priority ordering.</li><li>Provide the exact final file state if possible.</li><li>Check if tests assert contradictory behavior.</li><li>Use the Files tab to spot A→B→A patterns.</li>`}
            impact="Resolving the conflict takes 2–3 focused turns vs. 20–40 oscillating turns."
          />
          <LoopBlock id="help-hallucination" title="Hallucination Amplification Loop"            why="The same error appeared 3+ times. The agent's fix attempts fail because the root cause is something the model invented — a nonexistent package, wrong function name, or outdated API."
            example={`A <code style="font-size:10px;background:var(--panel-bg);padding:1px 3px;border-radius:2px">ModuleNotFoundError</code> appeared five times as the agent tried different import paths for a package not installed.`}
            steps={`<li>Stop and verify the root cause yourself.</li><li>Tell the agent explicitly what exists.</li><li>Paste actual API responses or function signatures.</li><li>After 2 failures, resolve the underlying issue before re-prompting.</li>`}
            impact="Intervening after 2 recurrences instead of 6 saves ~120,000 tokens in a 30K-token session."
          />
          <LoopBlock id="help-runaway-steps" title="Ambiguous Success / Escalating Scope"            why="The session consumed far more LLM calls than expected. The prompt has no stopping condition, uses open-ended phrasing, or the agent expands scope on its own."
            example={`"Fix the login bug" accumulated 90+ steps — the agent then noticed unrelated issues and updated 3 extra files.`}
            steps={`<li>Add explicit stopping conditions.</li><li>Avoid open-ended phrasing — name specific functions and files.</li><li>Specify scope: <em>"Only change files in src/auth/"</em>.</li><li>Monitor the context growth chart for steep rises.</li>`}
            impact="A 5-step prompt vs. a 90-step session saves 85 tool calls — a 5–20x token reduction."
          />
          <LoopBlock id="help-context-accumulation" title="Infinite Loop — Context Accumulation"            why={`<a href="#gl-input-tokens">Input tokens</a> grew by 30,000+ across 4+ calls while <a href="#gl-output-ratio">output-to-input ratio</a> collapsed by 70%+. The agent is consuming context while producing less output.`}
            example="First call: 8K in → 600 out (7.5%). Last call: 65K in → 80 out (0.12%). Five turns reading the same files without edits."
            steps={`<li>Stop immediately — cost compounds with no progress.</li><li>Start fresh with a focused prompt stating what was already read.</li><li>Include the specific target state, not just the problem.</li><li>Use the Summaries tab to review what was accomplished.</li>`}
            impact="Catching at 4 calls instead of 10 saves ~390,000 input tokens at peak context size."
          />
        </div>

        <p style="margin-top:16px;font-size:12px;color:var(--muted)">Loop signals appear first in the Recommendations list, sorted by severity. Use the <strong>Loops</strong> filter pill to view only malfunction signals. Use <strong>Ignore</strong> to dismiss a signal if it was intentional behavior.</p>
      </div>
    </div>
  )
}

function ViewsSection() {
  return (
    <div class="help-section" id="help-views">
      <h3 class="help-heading">{HELP_SECTIONS.views.heading}</h3>
      <div class="glossary">
        {VIEWS.map(([name, desc]) => (
          <div class="glossary-item">
            <dt class="glossary-term">{name}</dt>
            <dd class="glossary-def">{desc}</dd>
          </div>
        ))}
      </div>
    </div>
  )
}

function GlossarySection() {
  return (
    <div class="help-section" id="help-glossary">
      <h3 class="help-heading">{HELP_SECTIONS.glossary.heading}</h3>
      <div class="glossary">
        {TERMS.map(([term, def]) => (
          <div class="glossary-item" id={termId(term)} style="scroll-margin-top:44px">
            <dt class="glossary-term">{term}</dt>
            <dd class="glossary-def">{def}</dd>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function Help() {
  return (
    <div id="help-content">
      <Toc />
      <OverviewSection />
      <ConfigSection />
      <AgentOtelSection />
      <InsightsSection />
      <LoopsSection />
      <ViewsSection />
      <GlossarySection />
      <p style="font-size:11px;color:var(--muted);margin-top:24px;padding-top:12px;border-top:1px solid var(--border);line-height:1.6">
        <strong>Disclaimer:</strong> AgentLens is an independent open-source project and is not affiliated with, endorsed by, or associated with GitHub, Inc. or Microsoft Corporation (GitHub Copilot); Anthropic, PBC (Claude / Claude Code); or OpenAI, LLC (Codex / Codex CLI). All product names, trademarks, and registered trademarks are the property of their respective owners. AgentLens interacts with these products solely through their publicly documented OpenTelemetry telemetry interfaces.
      </p>
    </div>
  )
}
