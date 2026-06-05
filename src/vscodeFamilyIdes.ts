/**
 * App-directory names for all known VS Code-family IDEs.
 *
 * The directory name is the same segment used in:
 *   macOS:   ~/Library/Application Support/<name>/User/
 *   Windows: %APPDATA%\<name>\User\
 *   Linux:   $XDG_CONFIG_HOME/<name>/User/  (falls back to ~/.config/<name>/User/)
 *
 * Both log ingestion (workspaceStorage scanning) and standalone auto-config
 * import this list. Add new IDEs here and both features pick them up automatically.
 */
export const VSCODE_FAMILY_IDE_NAMES: readonly string[] = [
  'Code',
  'Code - Insiders',
  'Cursor',
  'Windsurf',
  'VSCodium',
  'Trae',
  'Kiro',
]
