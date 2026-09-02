import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { execFileSync, spawn } from 'child_process'
import {
  parseServiceInstallFlags, isRunningFromNpx, writeServiceConfig, readServiceConfig,
  shouldBlockRepeatedBootstrap, childEnvForReexec, serviceConfigPath,
  describeNpmFailure, couldNotDownloadMessage,
  type ServiceConfig, type ServiceProgram,
} from '../../src/serviceConfig'
import * as macos from './macos'
import * as linux from './linux'
import * as windows from './windows'

interface PlatformService {
  install(program: ServiceProgram): void
  uninstall(): void
  start(): void
  stop(): void
  restart(): void
  status(uiPort: number, bindHost: string): Promise<boolean>
  logsPath(program: ServiceProgram): string
}

function getPlatformService(): PlatformService {
  switch (os.platform()) {
    case 'darwin': return macos
    case 'linux':  return linux
    case 'win32':  return windows
    default:
      throw new Error(
        `Background service mode isn't supported on ${os.platform()}. ` +
        `Run the server directly instead: agentlens`
      )
  }
}

function buildProgram(config: ServiceConfig): ServiceProgram {
  return { nodePath: process.execPath, cliPath: process.argv[1], config }
}

/** True when the running cli.js lives inside the global npm package dir — i.e. this *is* the
 *  installed copy, so `service install` can safely refresh it to the latest published version.
 *  A dev checkout or any other location is left exactly as-is. */
function isRunningFromGlobalInstall(): boolean {
  const dir = globalPackageDir()
  if (!dir) { return false }
  const running = process.argv[1] ?? ''
  return running === dir || running.startsWith(dir + path.sep)
}

/** Builds the ServiceProgram for `service install`. When run from the global install, first brings
 *  it up to the latest published version (see ensureLatestGlobalInstall) and points the service at
 *  that copy — so a stale global install is upgraded on re-install rather than pinned. A dev
 *  checkout or other non-standard location is pointed at exactly the running copy, untouched. */
function resolveInstallProgram(config: ServiceConfig): ServiceProgram {
  // Freshly re-invoked by bootstrapGlobalInstall after an npx run — it already installed @latest
  // and is pointing us at that copy via argv[1]; don't run a second npm install.
  if (shouldBlockRepeatedBootstrap(process.env)) {
    return buildProgram(config)
  }
  if (!isRunningFromGlobalInstall()) {
    return buildProgram(config)
  }
  const outcome = ensureLatestGlobalInstall()
  const globalCliPath = outcome ? resolveGlobalCliPath() : undefined
  if (globalCliPath && fs.existsSync(globalCliPath)) {
    return { nodePath: process.execPath, cliPath: globalCliPath, config }
  }
  return buildProgram(config)
}

function printUsage(): void {
  console.log(`Usage: agentlens service <command>

Commands:
  install [--ui-port N] [--otlp-port N] [--mcp-port N] [--bind-host H] [--data-dir DIR]
                    Install and start the background service (macOS: launchd,
                    Linux: systemd --user, Windows: Scheduled Task at logon).
                    Fetches the latest agentlens-dashboard from npm first, so a
                    re-install also upgrades; if that download fails it says so
                    and installs on the version already present.
  uninstall         Stop and remove the background service.
  start             Start the installed service.
  stop              Stop the installed service.
  restart           Restart the installed service.
  update            Install the latest agentlens-dashboard from npm and restart
                    the service on it. Installing a background service does NOT
                    otherwise auto-update; it keeps running whatever version was
                    installed until you run this (or re-run 'install').
  status            Check whether the service is running and reachable.
  logs [--follow]   Print (or tail) the service's log file.

If AgentLens isn't running, incoming OTEL data has nowhere to go and is lost —
agents don't queue or retry failed exports. Running as a background service
avoids gaps in your session history from forgetting to start it, closing the
terminal, or a reboot.`)
}

/** The globally-installed package directory (`<npm root -g>/agentlens-dashboard`), or undefined
 *  if `npm root -g` can't be run at all (npm missing / not on PATH). */
function globalPackageDir(): string | undefined {
  try {
    const globalRoot = execFileSync('npm', ['root', '-g'], { encoding: 'utf-8' }).trim()
    return path.join(globalRoot, 'agentlens-dashboard')
  } catch {
    return undefined
  }
}

/** Resolves the global package's cli.js directly via `npm root -g`, rather than looking up
 *  `agentlens` by name on PATH — npx prepends its own cache's bin directory to PATH for its
 *  entire process tree (including children spawned from inside the npx-run script), so a
 *  bare-name lookup right after `npm install -g` still resolves back to the stale npx-cached
 *  copy instead of the new global one. Undefined if npm can't be run. */
function resolveGlobalCliPath(): string | undefined {
  const dir = globalPackageDir()
  return dir ? path.join(dir, 'standalone', 'cli.js') : undefined
}

/** Reads the version of the globally-installed package straight off disk — used to report what
 *  `service update` actually changed, since `npm install -g` prints its own noisy log rather than
 *  a clean before/after, and to name the fallback version when a download fails. */
function readGlobalVersion(): string | undefined {
  const dir = globalPackageDir()
  if (!dir) return undefined
  try {
    const pkgPath = path.join(dir, 'package.json')
    if (!fs.existsSync(pkgPath)) return undefined
    return JSON.parse(fs.readFileSync(pkgPath, 'utf-8')).version
  } catch {
    return undefined
  }
}

interface GlobalInstallOutcome {
  /** Version on disk after the attempt (undefined only if nothing is installed and none could be). */
  version: string | undefined
  /** Version on disk before the attempt, for a before/after report. */
  previousVersion: string | undefined
  /** True if `npm install -g …@latest` actually succeeded; false if it failed and `version`
   *  is a pre-existing fallback the caller can still use. */
  downloaded: boolean
}

/** Runs `npm install -g agentlens-dashboard@latest` so the background service lands on the newest
 *  published version rather than pinning whatever copy launched it. If the download fails (offline,
 *  registry unreachable, npm missing, permissions) it prints a clear warning and reports the
 *  version already on disk so the caller can carry on with it — returns null only when the
 *  download failed *and* there is nothing installed to fall back on. */
function ensureLatestGlobalInstall(): GlobalInstallOutcome | null {
  const previousVersion = readGlobalVersion()
  console.log('[AgentLens] Fetching the latest agentlens-dashboard from npm:')
  console.log('  npm install -g agentlens-dashboard@latest')
  try {
    execFileSync('npm', ['install', '-g', 'agentlens-dashboard@latest'], { stdio: 'inherit' })
  } catch (e) {
    const fallback = readGlobalVersion()
    console.error(couldNotDownloadMessage(describeNpmFailure(e), fallback))
    return fallback ? { version: fallback, previousVersion, downloaded: false } : null
  }
  const version = readGlobalVersion()
  if (previousVersion && version && previousVersion !== version) {
    console.log(`[AgentLens] Updated v${previousVersion} → v${version}.`)
  } else if (version) {
    console.log(`[AgentLens] Up to date (v${version}).`)
  }
  return { version, previousVersion, downloaded: true }
}

/** npx runs from an ephemeral cache with no stable path a service definition can point
 *  at, so a first-time `npx agentlens-dashboard@latest service install` bootstraps a real global
 *  install for the user (visibly, not silently — this touches global npm state) and then
 *  re-invokes the newly-installed copy directly to continue. ensureLatestGlobalInstall() below
 *  always installs `@latest`, so this is safe even when the npx cache itself is stale. */
function bootstrapGlobalInstall(remainingArgs: string[]): number {
  if (shouldBlockRepeatedBootstrap(process.env)) {
    console.error(
      '[AgentLens] Still detected as running via npx after installing globally and re-invoking ' +
      '`agentlens` — that shouldn\'t happen and looks like a bug rather than a real npx run. ' +
      'Try running `npm install -g agentlens-dashboard@latest` yourself, then `agentlens service install` directly.'
    )
    return 1
  }
  console.log('[AgentLens] Running via npx — installing agentlens-dashboard globally first, ' +
    'so the background service has a stable command to launch on every start.')
  const outcome = ensureLatestGlobalInstall()
  if (!outcome) {
    console.error(
      '[AgentLens] Can\'t install the background service without a global copy to point at, and ' +
      'nothing is installed yet. Reconnect to npm and re-run `npx agentlens-dashboard@latest service install`.'
    )
    return 1
  }

  const globalCliPath = resolveGlobalCliPath()
  if (!globalCliPath || !fs.existsSync(globalCliPath)) {
    console.error(
      `[AgentLens] Global install present, but couldn't find its cli.js at the expected path ` +
      `(${globalCliPath ?? '<npm root -g unavailable>'}). ` +
      'Run `agentlens service install` yourself to continue — the global install should now be on your PATH.'
    )
    return 1
  }
  console.log('[AgentLens] Continuing with service install...')
  try {
    execFileSync(process.execPath, [globalCliPath, 'service', 'install', ...remainingArgs], {
      stdio: 'inherit', env: childEnvForReexec(process.env),
    })
  } catch (e) {
    const status = (e as { status?: number }).status
    return typeof status === 'number' ? status : 1
  }
  return 0
}

function printLogs(program: ServiceProgram, platformService: PlatformService, follow: boolean): void {
  const logPath = platformService.logsPath(program)
  if (!fs.existsSync(logPath)) {
    console.log(`[AgentLens] No log file yet at ${logPath} — the service may not have started.`)
    return
  }
  if (!follow) {
    process.stdout.write(fs.readFileSync(logPath, 'utf-8'))
    return
  }
  const tailArgs = process.platform === 'win32'
    ? ['-Command', `Get-Content -Path "${logPath}" -Wait -Tail 20`]
    : ['-f', logPath]
  const tailCmd = process.platform === 'win32' ? 'powershell' : 'tail'
  spawn(tailCmd, tailArgs, { stdio: 'inherit' })
}

export async function runServiceCli(args: string[]): Promise<number> {
  const [subcommand, ...rest] = args

  if (!subcommand || subcommand === '--help' || subcommand === '-h') {
    printUsage()
    return subcommand ? 0 : 1
  }

  if (subcommand === 'install' && isRunningFromNpx(process.env.npm_config_user_agent, process.argv[1] ?? '')) {
    return bootstrapGlobalInstall(rest)
  }

  let platformService: PlatformService
  try {
    platformService = getPlatformService()
  } catch (e) {
    console.error(`[AgentLens] ${(e as Error).message}`)
    return 1
  }

  switch (subcommand) {
    case 'install': {
      const config = parseServiceInstallFlags(rest)
      writeServiceConfig(config)
      platformService.install(resolveInstallProgram(config))
      console.log(`[AgentLens] Background service installed and started. The dashboard now requires an access token — run \`agentlens service status\` once it's up for the URL to open (its first startup generates and persists the token to ${serviceConfigPath()}).`)
      return 0
    }
    case 'uninstall':
      platformService.uninstall()
      console.log('[AgentLens] Background service stopped and removed. Your data in ~/.agentlens is untouched.')
      return 0
    case 'start':
      platformService.start()
      return 0
    case 'stop':
      platformService.stop()
      return 0
    case 'restart':
      platformService.restart()
      return 0
    case 'update': {
      const outcome = ensureLatestGlobalInstall()
      if (!outcome || !outcome.downloaded) {
        // ensureLatestGlobalInstall already printed why; the service keeps running its current
        // version, so this is a failed update rather than a broken service.
        return 1
      }
      const { version, previousVersion } = outcome
      if (previousVersion && version && previousVersion === version) {
        console.log('[AgentLens] No restart needed.')
        return 0
      }
      console.log('[AgentLens] Restarting the background service on the new version...')
      platformService.restart()
      console.log('[AgentLens] Background service restarted.')
      return 0
    }
    case 'status': {
      const config = readServiceConfig()
      const running = await platformService.status(config.uiPort, config.bindHost)
      const dashboardUrl = `http://${config.bindHost}:${config.uiPort}` + (config.authToken ? `/?token=${config.authToken}` : '')
      console.log(running
        ? `[AgentLens] Running — dashboard reachable at ${dashboardUrl}`
        : '[AgentLens] Not reachable. Run `agentlens service logs` to check for errors, or `agentlens service start`.')
      return running ? 0 : 1
    }
    case 'logs': {
      const config = readServiceConfig()
      printLogs(buildProgram(config), platformService, rest.includes('--follow'))
      return 0
    }
    default:
      printUsage()
      return 1
  }
}
