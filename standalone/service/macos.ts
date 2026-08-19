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

export function install(program: ServiceProgram): void {
  fs.mkdirSync(path.dirname(plistPath()), { recursive: true })
  fs.mkdirSync(path.dirname(serviceLogPath(program.config)), { recursive: true })
  fs.writeFileSync(plistPath(), generateLaunchdPlist(program), 'utf-8')
  // Unload first in case a stale copy is already loaded (e.g. re-running install to change ports).
  try { execFileSync('launchctl', ['bootout', serviceTarget()], { stdio: 'ignore' }) } catch { /* not loaded — fine */ }
  execFileSync('launchctl', ['bootstrap', guiTarget(), plistPath()], { stdio: 'inherit' })
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
