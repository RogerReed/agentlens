import * as vscode from 'vscode'
import { OtlpCollector } from './otlpCollector'
import { SessionStore } from './sessionStore'
import { SidebarPanel } from './sidebarPanel'
import { DashboardPanel } from './dashboardPanel'
import { autoConfigureCopilot, autoConfigureClaudeCode, autoConfigureCodex } from './autoConfig'

let collector: OtlpCollector | undefined
let store: SessionStore | undefined
let outputChannel: vscode.OutputChannel | undefined

export async function activate(context: vscode.ExtensionContext) {
  outputChannel = vscode.window.createOutputChannel('AgentLens')
  context.subscriptions.push(outputChannel)
  outputChannel.appendLine('AgentLens activating...')

  try {
    store = new SessionStore(context)
  } catch (err) {
    outputChannel.appendLine(`Failed to initialize session store: ${err}`)
    vscode.window.showErrorMessage('AgentLens: Failed to initialize session store.')
    return
  }

  // Start local OTLP receiver
  const port = vscode.workspace
    .getConfiguration('agentLens')
    .get<number>('otlpPort', 4318)

  collector = new OtlpCollector(port, store, outputChannel)
  let collectorFailed = false
  try {
    await collector.start()
  } catch (err) {
    collectorFailed = true
    outputChannel.appendLine(`Failed to start OTLP collector on port ${port}: ${err}`)
    collector = undefined
  }

  // Auto-configure Copilot, Claude Code, and Codex to send traces to our collector
  const [copilotResult, claudeResult, codexResult] = await Promise.all([
    autoConfigureCopilot(port),
    autoConfigureClaudeCode(port),
    autoConfigureCodex(port),
  ])

  if (copilotResult.error) {
    outputChannel.appendLine(`Auto-configure Copilot failed: ${copilotResult.error}`)
    vscode.window.showWarningMessage(
      `AgentLens: Could not auto-configure Copilot OTel. Manually set github.copilot.chat.otel.enabled=true and otlpEndpoint to http://localhost:${port}`
    )
  }
  if (claudeResult.error) {
    outputChannel.appendLine(`Auto-configure Claude Code failed: ${claudeResult.error}`)
    vscode.window.showWarningMessage(
      `AgentLens: Could not auto-configure Claude Code. Manually add CLAUDE_CODE_ENABLE_TELEMETRY=1 and OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:${port} to ~/.claude/settings.json env block.`
    )
  }
  if (codexResult.error) {
    outputChannel.appendLine(`Auto-configure Codex failed: ${codexResult.error}`)
    vscode.window.showWarningMessage(
      `AgentLens: Could not auto-configure Codex. Manually add [otel] exporter = { otlp-http = { endpoint = "http://localhost:${port}" } } to ~/.codex/config.toml`
    )
  }

  // Register sidebar webview
  const provider = new SidebarPanel(store, context.extensionUri)
  if (collectorFailed) {
    const errMsg = `Port ${port} is already in use. No telemetry will be collected. Change agentLens.otlpPort in settings and reload.`
    provider.setCollectorError(errMsg)
  }
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'agentLens.dashboard',
      provider
    )
  )

  // Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('agentLens.clearSessions', () => {
      store!.clear()
      provider.refresh()
      vscode.window.showInformationMessage('AgentLens: session data cleared')
    })
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('agentLens.openDashboard', () => {
      DashboardPanel.show(context, store!, provider)
    })
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('agentLens.dumpSpanAttrs', () => {
      const spans = store!.getSpans()
      outputChannel!.clear()
      outputChannel!.appendLine('=== AgentLens span attribute dump ===')
      outputChannel!.appendLine(`Total spans: ${spans.length}`)
      outputChannel!.appendLine('')

      // Show all unique span names
      const names = [...new Set(spans.map(s => s.name))].sort()
      outputChannel!.appendLine(`Span names seen: ${names.join(', ')}`)
      outputChannel!.appendLine('')

      function dumpSpan(span: { name: string; attributes?: Array<{ key: string; value: { stringValue?: string; intValue?: number; doubleValue?: number; boolValue?: boolean } }> }) {
        outputChannel!.appendLine(`[${span.name}]`)
        for (const attr of span.attributes ?? []) {
          const val = attr.value?.stringValue ?? attr.value?.intValue ?? attr.value?.doubleValue ?? attr.value?.boolValue
          if (val === undefined || val === null) { continue }
          const strVal = String(val)
          outputChannel!.appendLine(`  ${attr.key} = ${strVal.length > 300 ? strVal.slice(0, 300) + '…' : strVal}`)
        }
        outputChannel!.appendLine('')
      }

      // For Codex: show ONE example of every span type (so we see user_prompt, conversation_starts, sse_event, etc.)
      outputChannel!.appendLine('--- Codex span types (one example each) ---')
      const codexByType = new Map<string, typeof spans[0]>()
      for (const s of spans) {
        if (s.name.startsWith('codex.') && !codexByType.has(s.name)) codexByType.set(s.name, s)
      }
      for (const s of codexByType.values()) dumpSpan(s)

      // For Claude: last few LLM + tool spans
      outputChannel!.appendLine('--- Claude LLM + tool spans (last 5 each) ---')
      const claudeSpans = spans.filter(s =>
        s.name === 'claude_code.llm_request' || s.name === 'claude_code.tool' || s.name === 'claude_code.tool_result'
      ).slice(-5)
      for (const s of claudeSpans) dumpSpan(s)

      outputChannel!.show(true)
      vscode.window.showInformationMessage(`AgentLens: dumped ${codexByType.size} Codex span types + ${claudeSpans.length} Claude spans`)
    })
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('agentLens.exportData', async () => {
      const data = store!.export()
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0]
      const baseUri = workspaceFolder
        ? workspaceFolder.uri
        : context.globalStorageUri
      const filename = `agent-lens-export-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
      const uri = vscode.Uri.joinPath(baseUri, filename)
      await vscode.workspace.fs.writeFile(uri, Buffer.from(JSON.stringify(data, null, 2)))
      const doc = await vscode.workspace.openTextDocument(uri)
      vscode.window.showTextDocument(doc)
      vscode.window.showInformationMessage(`Exported ${data.spans.length} spans to ${filename}`)
    })
  )

  // Status bar item
  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100)
  statusBar.command = 'agentLens.openDashboard'
  statusBar.tooltip = 'Open AgentLens Dashboard'
  context.subscriptions.push(statusBar)

  function updateStatusBar() {
    if (collectorFailed) {
      statusBar.text = '$(warning) AgentLens — port in use'
      statusBar.color = new vscode.ThemeColor('statusBarItem.warningForeground')
      statusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground')
      statusBar.tooltip = `AgentLens collector could not start — port ${port} is in use`
    } else {
      statusBar.text = '$(graph) AgentLens'
      statusBar.color = undefined
      statusBar.backgroundColor = undefined
    }
    statusBar.show()
  }

  updateStatusBar()
  context.subscriptions.push(store.onUpdate(updateStatusBar))

  if (collectorFailed) {
    vscode.window.showErrorMessage(
      `AgentLens: Port ${port} is already in use — no telemetry will be collected.`,
      'Dismiss'
    )
  } else {
    vscode.window.showInformationMessage(`AgentLens active — listening on port ${port}`)
  }
  outputChannel.appendLine(`AgentLens active — OTLP collector listening on port ${port}`)
  outputChannel.show(true)

  // Fire-and-forget: notification must not block plugin registration above
  notifySetupRequired(context, copilotResult.changed, claudeResult.changed, codexResult.changed)
}

async function notifySetupRequired(
  context: vscode.ExtensionContext,
  copilotChanged: boolean,
  claudeChanged: boolean,
  codexChanged: boolean
) {
  if (!copilotChanged && !claudeChanged && !codexChanged) { return }

  const isFirstInstall = !context.globalState.get<string>('agentLens.installedVersion')
  if (isFirstInstall) {
    context.globalState.update('agentLens.installedVersion', context.extension.packageJSON.version)
  }

  const parts: string[] = []
  if (copilotChanged) { parts.push('Reload VS Code to activate Copilot tracing.') }
  const cliAgents = [claudeChanged && 'Claude', codexChanged && 'Codex'].filter(Boolean).join(' and ')
  if (cliAgents) { parts.push(`Restart ${cliAgents} in your terminal to activate CLI tracing.`) }

  const message = `AgentLens: Telemetry configured. ${parts.join(' ')}`
  const actions = copilotChanged ? ['Reload VS Code'] : []

  const action = await vscode.window.showInformationMessage(message, ...actions)
  if (action === 'Reload VS Code') {
    vscode.commands.executeCommand('workbench.action.reloadWindow')
  }
}

export async function deactivate() {
  DashboardPanel.disposePanel()
  if (collector) {
    await collector.stop()
  }
}