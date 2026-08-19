import * as fs from 'fs'
import * as os from 'os'
import { execFileSync, spawn } from 'child_process'
import {
  parseServiceInstallFlags, isRunningFromNpx, writeServiceConfig, readServiceConfig,
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

function printUsage(): void {
  console.log(`Usage: agentlens service <command>

Commands:
  install [--ui-port N] [--otlp-port N] [--mcp-port N] [--bind-host H] [--data-dir DIR]
                    Install and start the background service (macOS: launchd,
                    Linux: systemd --user, Windows: Scheduled Task at logon).
  uninstall         Stop and remove the background service.
  start             Start the installed service.
  stop              Stop the installed service.
  restart           Restart the installed service.
  status            Check whether the service is running and reachable.
  logs [--follow]   Print (or tail) the service's log file.

If AgentLens isn't running, incoming OTEL data has nowhere to go and is lost —
agents don't queue or retry failed exports. Running as a background service
avoids gaps in your session history from forgetting to start it, closing the
terminal, or a reboot.`)
}

/** npx runs from an ephemeral cache with no stable path a service definition can point
 *  at, so a first-time `npx agentlens-dashboard service install` bootstraps a real global
 *  install for the user (visibly, not silently — this touches global npm state) and then
 *  re-invokes itself as the now-globally-linked `agentlens` command. */
function bootstrapGlobalInstall(remainingArgs: string[]): number {
  console.log('[AgentLens] Running via npx — installing agentlens-dashboard globally first, ' +
    'so the background service has a stable command to launch on every start:')
  console.log('  npm install -g agentlens-dashboard')
  execFileSync('npm', ['install', '-g', 'agentlens-dashboard'], { stdio: 'inherit' })
  console.log('[AgentLens] Global install complete. Continuing with service install...')
  execFileSync('agentlens', ['service', 'install', ...remainingArgs], { stdio: 'inherit' })
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
      platformService.install(buildProgram(config))
      console.log(`[AgentLens] Background service installed and started — dashboard at http://${config.bindHost}:${config.uiPort}`)
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
    case 'status': {
      const config = readServiceConfig()
      const running = await platformService.status(config.uiPort, config.bindHost)
      console.log(running
        ? `[AgentLens] Running — dashboard reachable at http://${config.bindHost}:${config.uiPort}`
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
