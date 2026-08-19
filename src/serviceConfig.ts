/**
 * Pure logic for running the standalone server as an OS-native background service
 * (macOS launchd / Linux systemd --user / Windows Scheduled Task). Kept dependency-free
 * (no fs/child_process side effects beyond the two explicit read/write functions) so the
 * service-definition generators are unit-testable without shelling out to a real OS service
 * manager — see .staged-issues/01-background-service-mode.md for the full design.
 */

import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

export interface ServiceConfig {
  uiPort: number
  otlpPort: number
  mcpPort: number
  bindHost: string
  dataDir: string
}

// `baseHome` defaults to the real home directory in production; tests pass a temp directory
// so these never touch the developer's actual ~/.agentlens.

export function defaultDataDir(baseHome: string = os.homedir()): string {
  return path.join(baseHome, '.agentlens')
}

export function defaultServiceConfig(baseHome?: string): ServiceConfig {
  return {
    uiPort: 3000,
    otlpPort: 4318,
    mcpPort: 4316,
    bindHost: '127.0.0.1',
    dataDir: defaultDataDir(baseHome),
  }
}

/** The service config file always lives under the default data dir, even if its own
 *  `dataDir` field points somewhere else — this avoids a chicken-and-egg problem where
 *  finding the config requires already knowing the (possibly-customized) data directory. */
export function serviceConfigPath(baseHome?: string): string {
  return path.join(defaultDataDir(baseHome), 'config.json')
}

export function readServiceConfig(baseHome?: string): ServiceConfig {
  const defaults = defaultServiceConfig(baseHome)
  try {
    const raw = fs.readFileSync(serviceConfigPath(baseHome), 'utf-8')
    const parsed = JSON.parse(raw) as Partial<ServiceConfig>
    return { ...defaults, ...parsed }
  } catch {
    return defaults
  }
}

export function writeServiceConfig(config: ServiceConfig, baseHome?: string): void {
  const configPath = serviceConfigPath(baseHome)
  fs.mkdirSync(path.dirname(configPath), { recursive: true })
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8')
}

export function serviceLogPath(config: ServiceConfig): string {
  return path.join(config.dataDir, 'logs', 'service.log')
}

// ── CLI flag parsing ─────────────────────────────────────────────────────────

const FLAG_TO_KEY: Record<string, keyof ServiceConfig> = {
  '--ui-port':   'uiPort',
  '--otlp-port': 'otlpPort',
  '--mcp-port':  'mcpPort',
  '--bind-host': 'bindHost',
  '--data-dir':  'dataDir',
}

/** Parses `--ui-port 3000 --data-dir /custom/path` style flags on top of the defaults. */
export function parseServiceInstallFlags(args: string[]): ServiceConfig {
  const config = defaultServiceConfig()
  for (let i = 0; i < args.length; i++) {
    const key = FLAG_TO_KEY[args[i]]
    if (!key) { continue }
    const value = args[i + 1]
    if (value === undefined) { continue }
    i++
    if (key === 'bindHost' || key === 'dataDir') {
      config[key] = value
    } else {
      const n = parseInt(value, 10)
      if (!Number.isNaN(n)) { config[key] = n }
    }
  }
  return config
}

// ── npx-vs-global-install detection ──────────────────────────────────────────

/** True when the current process was launched via `npx`/`bunx` rather than a real
 *  global install — npx runs from an ephemeral cache with no stable path a service
 *  definition can point at, so `service install` needs to bootstrap a global install
 *  first (see runServiceCli in standalone/service/index.ts). */
export function isRunningFromNpx(userAgent: string | undefined, scriptPath: string): boolean {
  if (userAgent && /\bnpx\//.test(userAgent)) { return true }
  return /[\\/]_npx[\\/]/.test(scriptPath) || /[\\/]\.npm[\\/]_npx[\\/]/.test(scriptPath)
}

// ── Service-definition generators (pure string builders) ────────────────────

export interface ServiceProgram {
  nodePath: string
  cliPath: string
  config: ServiceConfig
}

const LAUNCHD_LABEL = 'com.agentlens.server'

export function launchdLabel(): string {
  return LAUNCHD_LABEL
}

export function generateLaunchdPlist({ nodePath, cliPath, config }: ServiceProgram): string {
  const logPath = serviceLogPath(config)
  const envEntry = (key: string, value: string) => `    <key>${key}</key>\n    <string>${value}</string>`
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${LAUNCHD_LABEL}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${nodePath}</string>
    <string>${cliPath}</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>EnvironmentVariables</key>
  <dict>
${envEntry('UI_PORT', String(config.uiPort))}
${envEntry('OTLP_PORT', String(config.otlpPort))}
${envEntry('MCP_PORT', String(config.mcpPort))}
${envEntry('BIND_HOST', config.bindHost)}
${envEntry('DATA_DIR', config.dataDir)}
  </dict>
  <key>StandardOutPath</key>
  <string>${logPath}</string>
  <key>StandardErrorPath</key>
  <string>${logPath}</string>
</dict>
</plist>
`
}

export const SYSTEMD_UNIT_NAME = 'agentlens.service'

export function generateSystemdUnit({ nodePath, cliPath, config }: ServiceProgram): string {
  const logPath = serviceLogPath(config)
  return `[Unit]
Description=AgentLens background service
After=network.target

[Service]
Type=simple
ExecStart=${nodePath} ${cliPath}
Restart=on-failure
Environment=UI_PORT=${config.uiPort}
Environment=OTLP_PORT=${config.otlpPort}
Environment=MCP_PORT=${config.mcpPort}
Environment=BIND_HOST=${config.bindHost}
Environment=DATA_DIR=${config.dataDir}
StandardOutput=append:${logPath}
StandardError=append:${logPath}

[Install]
WantedBy=default.target
`
}

export const WINDOWS_TASK_NAME = 'AgentLens'

/** Windows Scheduled Tasks have no simple way to set per-task environment variables,
 *  so the task points at this wrapper .cmd instead of node.exe directly — it sets the
 *  env vars for the child process only (never touches the user's persistent environment
 *  the way `setx` would) and appends output to the same log file macOS/Linux use. */
export function generateWindowsWrapperScript({ nodePath, cliPath, config }: ServiceProgram): string {
  const logPath = serviceLogPath(config)
  return `@echo off
set "UI_PORT=${config.uiPort}"
set "OTLP_PORT=${config.otlpPort}"
set "MCP_PORT=${config.mcpPort}"
set "BIND_HOST=${config.bindHost}"
set "DATA_DIR=${config.dataDir}"
"${nodePath}" "${cliPath}" >> "${logPath}" 2>&1
`
}
