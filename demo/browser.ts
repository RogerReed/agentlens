#!/usr/bin/env node
/**
 * AgentLens browser demo — opens a headed Chromium window and runs the replay
 * script in parallel so the dashboard populates live in front of you.
 *
 * Prerequisites:
 *   pnpm run standalone                   (OTLP + UI servers)
 *   npx playwright install chromium       (one-time, installs browser)
 *
 * Usage:
 *   pnpm run demo:show                    # open browser + replay all scenarios
 *   pnpm run demo:tour                    # also navigate between tabs automatically
 *   pnpm run demo:show -- --speed 4       # pass speed flag through to replay
 *   pnpm run demo:show -- --scenario loop --tour
 *
 * The browser window stays open after replay finishes — close it manually
 * or press Ctrl+C in the terminal.
 */

import { spawn } from 'node:child_process'
import * as path from 'node:path'
import * as http from 'node:http'

// ── CLI ────────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
function flag(name: string, fallback: string): string {
  const i = args.indexOf('--' + name)
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback
}
const TOUR     = args.includes('--tour')
const UI_PORT  = parseInt(flag('ui-port', '3000')) || 3000
const OTLP_PORT = parseInt(flag('port', '4318')) || 4318
const SPEED    = flag('speed', '1')
const SCENARIO = flag('scenario', 'all')

function log(msg: string) { process.stdout.write(`\x1b[35m[browser]\x1b[0m ${msg}\n`) }
function err(msg: string) { process.stderr.write(`\x1b[31m[browser]\x1b[0m ${msg}\n`) }

// ── Server health check ────────────────────────────────────────────────────────

function checkServer(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const req = http.request(
      { hostname: '127.0.0.1', port, method: 'GET', path: '/', timeout: 2000 },
      () => resolve(true)
    )
    req.on('error', () => resolve(false))
    req.on('timeout', () => { req.destroy(); resolve(false) })
    req.end()
  })
}

// ── Replay child process ───────────────────────────────────────────────────────

function startReplay(): Promise<void> {
  return new Promise((resolve, reject) => {
    const replayArgs = [
      path.join(__dirname, 'replay.ts'),
      '--speed', SPEED,
      '--port', String(OTLP_PORT),
      '--scenario', SCENARIO,
    ]
    log(`Starting replay: node demo/run-ts.js demo/replay.ts --speed ${SPEED} --scenario ${SCENARIO}`)
    const child = spawn(process.execPath, [path.join(__dirname, 'run-ts.js'), ...replayArgs], {
      stdio: ['ignore', 'inherit', 'inherit'],
      shell: false,
    })
    child.on('error', reject)
    child.on('exit', code => {
      if (code === 0 || code === null) resolve()
      else reject(new Error(`replay exited with code ${code}`))
    })
  })
}

// ── Guided tab tour ────────────────────────────────────────────────────────────

// Ordered for a logical demo flow: overview → data → diagnostics → automation
const TOUR_TABS = [
  { id: 'efficiency',      label: 'Efficiency',      pauseMs: 5000 },
  { id: 'tokens',          label: 'Tokens',          pauseMs: 4000 },
  { id: 'files',           label: 'Files',           pauseMs: 3500 },
  { id: 'summaries',       label: 'Summaries',       pauseMs: 5000 },
  { id: 'recommendations', label: 'Recommendations', pauseMs: 5000 },
  { id: 'errors',          label: 'Errors',          pauseMs: 4000 },
  { id: 'agents',          label: 'Agents',          pauseMs: 4000 },
  { id: 'timeline',        label: 'Timeline',        pauseMs: 3500 },
  { id: 'traces',          label: 'Traces',          pauseMs: 3500 },
  { id: 'latency',         label: 'Latency',         pauseMs: 3000 },
  { id: 'tools',           label: 'Tools',           pauseMs: 3000 },
  { id: 'automation',      label: 'Automation',      pauseMs: 5000 },
]

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  // Preflight
  const uiAlive = await checkServer(UI_PORT)
  if (!uiAlive) {
    err(`Cannot reach dashboard at http://127.0.0.1:${UI_PORT}`)
    err('Start the standalone server first:  pnpm run standalone')
    process.exit(1)
  }

  // Dynamic import so a missing playwright gives a clear message
  let chromium: import('playwright').BrowserType
  try {
    const pw = await import('playwright')
    chromium = pw.chromium
  } catch {
    err('playwright is not installed. Run:')
    err('  pnpm add -D playwright')
    err('  npx playwright install chromium')
    process.exit(1)
  }

  log(`Opening dashboard at http://localhost:${UI_PORT}`)
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized'],
  })
  const ctx = await browser.newContext({
    viewport: null,   // use maximized window size
  })
  const page = await ctx.newPage()

  await page.goto(`http://localhost:${UI_PORT}`)
  await page.waitForLoadState('domcontentloaded')
  log('Browser open. Starting replay in parallel…')

  // Kick off replay (don't await yet — let it run alongside the tour)
  const replayDone = startReplay().catch(e => {
    err(`Replay error: ${e.message}`)
  })

  if (TOUR) {
    log('Tour mode: navigating tabs as data arrives…')

    // Give the first batch of spans a moment to land before switching tabs
    await page.waitForTimeout(3000)

    for (const { id, label, pauseMs } of TOUR_TABS) {
      const btn = page.locator(`button[data-tab="${id}"]`)
      const visible = await btn.isVisible().catch(() => false)
      if (!visible) continue

      await btn.click()
      log(`  → ${label} tab (${pauseMs / 1000}s)`)
      await page.waitForTimeout(pauseMs / parseFloat(SPEED))
    }

    // Return to Efficiency after tour
    await page.locator('button[data-tab="efficiency"]').click().catch(() => {})
    log('Tour complete — leaving browser open for exploration')
  } else {
    log('No --tour flag. Dashboard is live — explore tabs manually.')
    log('Press Ctrl+C to close the browser and exit.')
  }

  await replayDone
  log('Replay finished. Browser stays open until you close it or press Ctrl+C.')

  // Keep the process alive so the browser stays open
  await new Promise<void>(resolve => {
    process.on('SIGINT', () => {
      browser.close().finally(resolve)
    })
  })
}

main().catch(e => {
  err(String(e))
  process.exit(1)
})
