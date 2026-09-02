import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { execFileSync } from 'child_process'
import {
  generateLaunchdPlist, launchdLabel, serviceLogPath, type ServiceProgram,
} from '../../src/serviceConfig'
import { probeServiceHealth } from './health'

function plistPath(): string {
  return path.join(os.homedir(), 'Library', 'LaunchAgents', `${launchdLabel()}.plist`)
}

function guiTarget(): string {
  return `gui/${process.getuid?.() ?? 0}`
}

function serviceTarget(): string {
  return `${guiTarget()}/${launchdLabel()}`
}

/** launchd domains have no synchronous "is it gone yet" — `launchctl print <target>` exits 0
 *  while the service is still registered and non-zero once it's fully unloaded. */
function serviceLoaded(): boolean {
  try {
    execFileSync('launchctl', ['print', serviceTarget()], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function sleepSync(ms: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
}

/** `launchctl bootout` returns before the domain finishes tearing the service down, so a
 *  `bootstrap` fired immediately after races the teardown and fails with
 *  `Bootstrap failed: 5: Input/output error`. Boot it out, then wait until `launchctl print`
 *  confirms it's actually gone (bounded ~5s) before the caller re-bootstraps. */
function bootOutAndWait(): void {
  if (!serviceLoaded()) { return }
  try { execFileSync('launchctl', ['bootout', serviceTarget()], { stdio: 'ignore' }) } catch { /* already going */ }
  for (let i = 0; i < 50 && serviceLoaded(); i++) { sleepSync(100) }
}

/** Bootstraps the plist, tolerating the two transient failures a reinstall can still hit even
 *  after `bootOutAndWait`: a lingering `Input/output error` (retry after a short pause) and
 *  `service already loaded` (something re-registered it in the gap — `kickstart -k` to make sure
 *  it's running the plist we just wrote). Any other failure is thrown for index.ts to format. */
function bootstrapWithRetry(): void {
  for (let attempt = 1; ; attempt++) {
    try {
      execFileSync('launchctl', ['bootstrap', guiTarget(), plistPath()], { stdio: ['ignore', 'ignore', 'pipe'] })
      return
    } catch (e) {
      const stderr = String((e as { stderr?: unknown }).stderr ?? '')
      if (/already (loaded|bootstrapped)/i.test(stderr)) {
        try { execFileSync('launchctl', ['kickstart', '-k', serviceTarget()], { stdio: 'ignore' }) } catch { /* best effort */ }
        return
      }
      if (attempt < 3 && /input\/output error|operation now in progress|deadline/i.test(stderr)) {
        sleepSync(600)
        continue
      }
      const wrapped = new Error(stderr.trim() || (e as Error).message)
      ;(wrapped as { code?: string; status?: number }).code = (e as { code?: string }).code
      ;(wrapped as { code?: string; status?: number }).status = (e as { status?: number }).status
      ;(wrapped as { stderr?: string }).stderr = stderr
      throw wrapped
    }
  }
}

export function isInstalled(): boolean {
  return fs.existsSync(plistPath())
}

export function install(program: ServiceProgram): void {
  fs.mkdirSync(path.dirname(plistPath()), { recursive: true })
  fs.mkdirSync(path.dirname(serviceLogPath(program.config)), { recursive: true })
  fs.writeFileSync(plistPath(), generateLaunchdPlist(program), 'utf-8')
  bootOutAndWait()   // handles the "re-running install" case without racing the teardown
  bootstrapWithRetry()
}

export function uninstall(): void {
  try { execFileSync('launchctl', ['bootout', serviceTarget()], { stdio: 'ignore' }) } catch { /* already stopped */ }
  try { fs.rmSync(plistPath()) } catch { /* already removed */ }
}

export function start(): void {
  execFileSync('launchctl', ['bootstrap', guiTarget(), plistPath()], { stdio: 'inherit' })
}

export function stop(): void {
  execFileSync('launchctl', ['bootout', serviceTarget()], { stdio: 'inherit' })
}

export function restart(): void {
  try { stop() } catch { /* wasn't running */ }
  start()
}

export async function status(uiPort: number, bindHost: string): Promise<boolean> {
  return probeServiceHealth(uiPort, bindHost)
}

export function logsPath(program: ServiceProgram): string {
  return serviceLogPath(program.config)
}
