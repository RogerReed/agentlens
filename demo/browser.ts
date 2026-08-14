#!/usr/bin/env node
/**
 * AgentLens browser demo — opens a headed Chromium window and runs the replay
 * script in parallel so the dashboard populates live in front of you.
 *
 * Prerequisites:
 *   pnpm run local                   (OTLP + UI servers)
 *   npx playwright install chromium       (one-time, installs browser)
 *
 * Usage:
 *   pnpm run demo:show -- --scenario story          # 10-session petstore build-out
 *   pnpm run demo:show -- --scenario story --agents codex  # ...just its 3 Codex chapters
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
const AGENTS   = flag('agents', '')

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
      ...(AGENTS ? ['--agents', AGENTS] : []),
    ]
    log(`Starting replay: node demo/run-ts.js demo/replay.ts --speed ${SPEED} --scenario ${SCENARIO}${AGENTS ? ` --agents ${AGENTS}` : ''}`)
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

// The real top-level tab bar (media/src/App.tsx TABS) — sessions/analytics/patterns/
// export/import, selected via `button[data-tab="${id}"]`. The previous list here
// (efficiency/tokens/files/summaries/recommendations/errors/agents/timeline/traces/
// latency/tools/automation) didn't match any current `data-tab` value, so every
// step's isVisible() check silently failed and the tour clicked nothing at all —
// none of those are top-level tabs; most are sections *inside* Sessions' expand-in-
// place detail view or Analytics' scrolling page, and Automation/Alerts live in the
// Settings (gear) panel. See tourSessionDetail() and tourSettingsPanel() below for
// those.
const TOUR_TABS = [
  { id: 'sessions',  label: 'Sessions',  pauseMs: 3000 },
  { id: 'analytics', label: 'Analytics', pauseMs: 5000 },
  { id: 'patterns',  label: 'Advisor',   pauseMs: 5000 },
  { id: 'export',    label: 'Export',    pauseMs: 3000 },
  { id: 'import',    label: 'Import',    pauseMs: 3000 },
]

// Expands the most recent session (Sessions tab's expand-in-place row) and walks its
// internal Overview/Trace/Flow/Tools/Files nav — these are plain buttons with no
// data-tab attribute, so matched by accessible name instead. Counts like "Trace (12)"
// are appended dynamically, hence the regex match rather than exact text.
async function tourSessionDetail(page: import('playwright').Page, speed: number): Promise<void> {
  const rows = page.locator('#sessions-content table tbody tr')
  try {
    await rows.first().waitFor({ state: 'visible', timeout: 15000 })
  } catch {
    log('  (no sessions rendered yet — skipping session detail walkthrough)')
    return
  }

  log('  → expanding most recent session')
  await rows.first().click()
  await page.waitForTimeout(600 / speed)

  const sections: Array<{ name: RegExp; label: string }> = [
    { name: /^Overview$/, label: 'Overview' },
    { name: /^Trace/,     label: 'Trace' },
    { name: /^Flow/,      label: 'Flow' },
    { name: /^Tools/,     label: 'Tools' },
    { name: /^Files/,     label: 'Files' },
  ]
  const detail = page.locator('#sessions-content')
  for (const { name, label } of sections) {
    const btn = detail.getByRole('button', { name })
    const visible = await btn.first().isVisible().catch(() => false)
    if (!visible) continue
    await btn.first().click()
    log(`  → session detail: ${label} (2.5s)`)
    await page.waitForTimeout(2500 / speed)
  }

  // Collapse — click the same row again
  await rows.first().click()
  await page.waitForTimeout(300 / speed)
}

// Automation and Alerts aren't top-level tabs — they live in the Settings panel
// behind the gear icon (App.tsx GearButton, title is the stable selector since the
// button has no other data-* attribute).
async function tourSettingsPanel(page: import('playwright').Page, speed: number): Promise<void> {
  const gear = page.getByTitle('Settings — Alerts & Automation')
  const visible = await gear.isVisible().catch(() => false)
  if (!visible) return

  log('  → Settings panel (Alerts & Automation, 5s)')
  await gear.click()
  await page.waitForTimeout(5000 / speed)
  await gear.click() // close
  await page.waitForTimeout(300 / speed)
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  // Preflight
  const uiAlive = await checkServer(UI_PORT)
  if (!uiAlive) {
    err(`Cannot reach dashboard at http://127.0.0.1:${UI_PORT}`)
    err('Start the standalone server first:  pnpm run local')
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
    const speed = parseFloat(SPEED) || 1

    // Give the first batch of spans a moment to land before switching tabs
    await page.waitForTimeout(3000)

    for (const { id, label, pauseMs } of TOUR_TABS) {
      const btn = page.locator(`button[data-tab="${id}"]`)
      const visible = await btn.isVisible().catch(() => false)
      if (!visible) continue

      await btn.click()
      log(`  → ${label} tab (${pauseMs / 1000}s)`)
      await page.waitForTimeout(pauseMs / speed)

      // Sessions: also expand a card and walk its Overview/Trace/Flow/Tools/Files
      // detail nav — those live inside the row, not the top-level tab bar.
      if (id === 'sessions') await tourSessionDetail(page, speed)

      // Analytics is the natural point to also surface Automation/Alerts, which
      // live in the Settings (gear) panel rather than a tab of their own.
      if (id === 'analytics') await tourSettingsPanel(page, speed)
    }

    // Return to Sessions after the tour — the most useful default landing tab
    await page.locator('button[data-tab="sessions"]').click().catch(() => {})
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
