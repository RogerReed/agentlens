import * as fs from 'fs'
import * as path from 'path'
import { execFileSync } from 'child_process'
import {
  generateWindowsWrapperScript, WINDOWS_TASK_NAME, serviceLogPath, type ServiceProgram,
} from '../../src/serviceConfig'
import { probeServiceHealth } from './health'

function wrapperScriptPath(program: ServiceProgram): string {
  return path.join(program.config.dataDir, 'service', 'run.cmd')
}

export function install(program: ServiceProgram): void {
  const scriptPath = wrapperScriptPath(program)
  fs.mkdirSync(path.dirname(scriptPath), { recursive: true })
  fs.mkdirSync(path.dirname(serviceLogPath(program.config)), { recursive: true })
  fs.writeFileSync(scriptPath, generateWindowsWrapperScript(program), 'utf-8')
  // /f overwrites a pre-existing task of the same name (re-running install to change ports).
  execFileSync('schtasks', [
    '/create', '/tn', WINDOWS_TASK_NAME, '/tr', `"${scriptPath}"`,
    '/sc', 'onlogon', '/rl', 'limited', '/f',
  ], { stdio: 'inherit' })
  // The logon trigger won't fire until next login — start it now too, for immediate feedback.
  try { execFileSync('schtasks', ['/run', '/tn', WINDOWS_TASK_NAME], { stdio: 'inherit' }) } catch { /* best effort */ }
}

export function uninstall(): void {
  try { execFileSync('schtasks', ['/end', '/tn', WINDOWS_TASK_NAME], { stdio: 'ignore' }) } catch { /* not running */ }
  execFileSync('schtasks', ['/delete', '/tn', WINDOWS_TASK_NAME, '/f'], { stdio: 'inherit' })
}

export function start(): void {
  execFileSync('schtasks', ['/run', '/tn', WINDOWS_TASK_NAME], { stdio: 'inherit' })
}

export function stop(): void {
  execFileSync('schtasks', ['/end', '/tn', WINDOWS_TASK_NAME], { stdio: 'inherit' })
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
