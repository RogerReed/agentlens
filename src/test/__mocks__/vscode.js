// Minimal vscode module mock for unit tests running outside VS Code.
// Only stubs the APIs actually used by our source code.

const EventEmitter = require('events')

const workspace = {
  getConfiguration: () => ({
    get: (key, defaultVal) => defaultVal,
    update: () => Promise.resolve(),
  }),
  workspaceFolders: [],
  fs: {
    writeFile: () => Promise.resolve(),
    stat: () => Promise.reject(new Error('file not found')),
  },
}

const window = {
  createOutputChannel: () => ({
    name: 'mock',
    append: () => {},
    appendLine: () => {},
    replace: () => {},
    clear: () => {},
    show: () => {},
    hide: () => {},
    dispose: () => {},
  }),
  showInformationMessage: () => Promise.resolve(),
  showWarningMessage: () => Promise.resolve(),
  showErrorMessage: () => Promise.resolve(),
  showTextDocument: () => Promise.resolve(),
  registerWebviewViewProvider: () => ({ dispose: () => {} }),
}

const commands = {
  registerCommand: () => ({ dispose: () => {} }),
  executeCommand: () => Promise.resolve(),
}

const Uri = {
  joinPath: (base, ...parts) => ({ ...base, path: [base.path, ...parts].join('/') }),
  file: (p) => ({ scheme: 'file', path: p }),
}

const ConfigurationTarget = {
  Global: 1,
  Workspace: 2,
  WorkspaceFolder: 3,
}

module.exports = {
  workspace,
  window,
  commands,
  Uri,
  ConfigurationTarget,
  EventEmitter: EventEmitter,
}
