import { useState } from 'preact/hooks'
import { displaySessions } from '../state'
import { getAgentDotHtml, formatSessionTime } from '../utils'
import type { SessionSummaryCard } from '../types'
import { vscode as vsApi } from '../state'

interface FileEdit {
  tool: string
  oldString?: string
  newString?: string
  content?: string
  editKey: string
}

function countLines(s: string | undefined): number {
  return s ? s.split('\n').length : 0
}

function editLineCounts(edits: FileEdit[]): { added: number; removed: number } {
  let added = 0, removed = 0
  for (const e of edits) {
    if (e.content) { added += countLines(e.content) }
    else { added += countLines(e.newString); removed += countLines(e.oldString) }
  }
  return { added, removed }
}

function DiffLines({ lines, type }: { lines: string[]; type: 'added' | 'removed' }) {
  const bg = type === 'added' ? 'rgba(76,175,80,0.12)' : 'rgba(244,67,54,0.12)'
  const border = type === 'added' ? 'rgba(76,175,80,0.3)' : 'rgba(244,67,54,0.3)'
  const prefix = type === 'added' ? '+ ' : '- '
  return (
    <div style="font-family:var(--vscode-editor-font-family,monospace);font-size:11px;line-height:1.5;overflow-x:auto;white-space:pre">
      {lines.map((line, i) => (
        <div key={i} style={`padding:0 10px;background:${bg};border-left:3px solid ${border}`}>{prefix}{line}</div>
      ))}
    </div>
  )
}

function EditBlock({ edit, ei }: { edit: FileEdit; ei: number }) {
  return (
    <div>
      <div style={'padding:4px 10px;font-size:10px;color:var(--muted);background:var(--vscode-editorWidget-background,var(--bg));border-top:' + (ei > 0 ? '1px solid var(--border)' : 'none') + ';font-weight:600;display:flex;align-items:center;gap:8px'}>
        <span>Change {ei + 1}</span>
        <span style="text-transform:uppercase;opacity:0.7">{edit.tool}</span>
      </div>
      {edit.content && <DiffLines lines={edit.content.split('\n')} type="added" />}
      {!edit.content && (
        <>
          {edit.oldString && (
            <>
              <div style="padding:4px 10px;font-size:10px;color:var(--muted);text-transform:uppercase;font-weight:600;border-bottom:1px solid var(--border)">Removed</div>
              <DiffLines lines={edit.oldString.split('\n')} type="removed" />
            </>
          )}
          {edit.oldString && edit.newString && (
            <div style="padding:2px 10px;color:var(--muted);font-size:10px;background:var(--border);text-align:center;user-select:none">→</div>
          )}
          {edit.newString && (
            <>
              <div style="padding:4px 10px;font-size:10px;color:var(--muted);text-transform:uppercase;font-weight:600;border-bottom:1px solid var(--border)">Added</div>
              <DiffLines lines={edit.newString.split('\n')} type="added" />
            </>
          )}
        </>
      )}
    </div>
  )
}

function FileItem({ fp, edits, ridx: _ridx }: { fp: string; edits: FileEdit[]; ridx: number }) {
  const [editsOpen, setEditsOpen] = useState(false)
  const parts = fp.split('/')
  const fileName = parts.pop() ?? fp
  const dirPath = parts.join('/')
  const isCreated = edits.some(e => e.tool === 'create_file')
  const editCount = edits.length
  const hasDiffs = edits.some(e => e.oldString || e.newString || e.content)
  const { added, removed } = hasDiffs ? editLineCounts(edits) : { added: 0, removed: 0 }

  function handleClick() {
    vsApi?.postMessage({ type: 'openFile', filePath: fp })
  }

  return (
    <>
      <div
        class="files-file-item"
        onClick={handleClick}
        style="display:flex;align-items:center;gap:10px;padding:8px 16px 8px 42px;border-bottom:1px solid var(--border);font-size:12px;cursor:pointer"
      >
        {!(window as unknown as { __STANDALONE__?: boolean }).__STANDALONE__ && (
          <span style={'font-size:14px;width:18px;text-align:center;color:' + (isCreated ? 'var(--vscode-testing-iconPassed,#4c4)' : 'var(--accent)')}>
            {isCreated ? '＋' : '✎'}
          </span>
        )}
        <span style="flex:1;min-width:0;font-family:var(--vscode-editor-font-family,monospace);font-size:12px">
          <span style="color:var(--fg);font-weight:500">{fileName}</span>
          {dirPath && <span class="muted"> {dirPath}</span>}
        </span>
        <span style={'font-size:9px;padding:1px 6px;border-radius:3px;font-weight:600;text-transform:uppercase;' + (isCreated ? 'background:rgba(76,175,80,0.15);color:var(--vscode-testing-iconPassed,#4c4)' : 'background:rgba(79,195,247,0.15);color:var(--accent)')}>
          {isCreated ? 'Created' : 'Edited'}
        </span>
        {editCount > 1 && <span style="font-size:9px;padding:1px 6px;border-radius:3px;font-weight:600;background:rgba(79,195,247,0.15);color:var(--accent)">{editCount} edits</span>}
        {added > 0 && <span style="font-size:10px;font-weight:600;color:#4caf50">+{added}</span>}
        {removed > 0 && <span style="font-size:10px;font-weight:600;color:#f44336">-{removed}</span>}
      </div>

      {hasDiffs && (
        <div style="border:1px solid var(--border);border-radius:4px;margin:0 16px 12px 42px;background:var(--bg);overflow:hidden">
          <div
            class="files-edit-header"
            onClick={e => { e.stopPropagation(); setEditsOpen(o => !o) }}
            style="display:flex;align-items:center;gap:8px;padding:6px 10px;cursor:pointer;user-select:none;font-size:11px"
          >
            <span class="files-edit-chevron" style="font-size:9px;color:var(--muted);width:12px">{editsOpen ? '▼' : '▶'}</span>
            <span style="color:var(--muted);font-size:11px">
              {editCount} change{editCount !== 1 ? 's' : ''} — click to {editsOpen ? 'collapse' : 'expand'}
            </span>
          </div>
          {editsOpen && (
            <div style="border-top:1px solid var(--border)">
              {edits.map((edit, ei) => <EditBlock key={edit.editKey} edit={edit} ei={ei} />)}
            </div>
          )}
        </div>
      )}
    </>
  )
}

function SessionBlock({ sess, ridx, allCount, isOpen: defaultOpen }: {
  sess: SessionSummaryCard; ridx: number; allCount: number; isOpen: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [promptExpanded, setPromptExpanded] = useState(false)
  const sessionTime = formatSessionTime(sess)
  const isLongPrompt = (sess.userRequest?.length ?? 0) > 100
  const changedFiles = sess.filesChanged ?? []
  const filesChangedNote = sess.filesChangedNote ?? ''

  // Build fileEdits map from timeline
  const fileEdits: Record<string, FileEdit[]> = {}
  let editIdx = 0
  ;(sess.timeline ?? []).forEach(e => {
    if (!e.editDetails?.length) return
    const entryLabel = (e.label ?? '').split(' ')[0]
    e.editDetails.forEach(ed => {
      const fp = ed.filePath
      if (!fp) return
      if (!fileEdits[fp]) fileEdits[fp] = []
      fileEdits[fp].push({ tool: ed.toolName || entryLabel, oldString: ed.oldString, newString: ed.newString, content: ed.content, editKey: ridx + '-' + editIdx })
      editIdx++
    })
  })

  const fileCountSess = changedFiles.length
  const fileCountLabel = fileCountSess === 0 && filesChangedNote ? 'paths unavailable' : fileCountSess + ' file' + (fileCountSess !== 1 ? 's' : '')

  return (
    <div style="background:var(--vscode-editorWidget-background,var(--bg));border:1px solid var(--border);border-radius:8px;margin-bottom:12px;overflow:hidden">
      <div
        class="files-session-header"
        onClick={() => setOpen(o => !o)}
        style="display:flex;align-items:center;gap:8px;padding:12px 16px;cursor:pointer;user-select:none;flex-wrap:wrap"
      >
        <span style="font-size:10px;color:var(--muted);width:14px;text-align:center;flex-shrink:0">{open ? '▼' : '▶'}</span>
        <span dangerouslySetInnerHTML={{ __html: getAgentDotHtml(sess.source) }} />
        <span style="font-size:10px;color:var(--muted);white-space:nowrap;flex-shrink:0">{sessionTime}</span>
        <span style="font-size:12px;min-width:0">
          "{(sess.userRequest ?? '').slice(0, 100)}{isLongPrompt ? '…' : ''}"
          {isLongPrompt && (
            <button class="sw-show-full-btn" style="margin-left:8px" onClick={e => { e.stopPropagation(); setPromptExpanded(v => !v) }}>
              {promptExpanded ? 'Collapse' : 'Show full prompt'}
            </button>
          )}
        </span>
        <span style="margin-left:auto;font-size:11px;color:var(--muted);background:var(--bg);padding:2px 8px;border-radius:4px;flex-shrink:0">{fileCountLabel}</span>
      </div>
      {promptExpanded && (
        <div style="padding:8px 44px;font-size:11px;color:var(--fg);border-bottom:1px solid var(--border);background:var(--hover);white-space:pre-wrap;word-break:break-word">
          {sess.userRequest}
        </div>
      )}
      {open && (
        <div style="border-top:1px solid var(--border)">
          {changedFiles.length === 0 ? (
            <div style="padding:16px 42px;color:var(--muted);font-style:italic;font-size:12px">
              {filesChangedNote ? 'Changed files could not be recovered for this session' : 'No files were modified in this session'}
              {filesChangedNote && (
                <div style="margin-top:8px;padding:10px 12px;border-radius:6px;border:1px solid rgba(217,119,87,0.35);background:rgba(217,119,87,0.08);color:var(--fg);font-style:normal;line-height:1.45">{filesChangedNote}</div>
              )}
            </div>
          ) : (
            changedFiles.map(fp => (
              <FileItem key={fp} fp={fp} edits={fileEdits[fp] ?? []} ridx={ridx} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

export function Files() {
  const sessions = displaySessions.value

  if (!sessions.length) {
    return <div id="files-content"><div class="empty-state">No agent sessions recorded — start a Copilot, Claude, or Codex session</div></div>
  }

  const reversed = sessions.slice().reverse()

  const totalFilesSet = new Set<string>()
  let totalEdits = 0, totalAdded = 0, totalRemoved = 0
  reversed.forEach(sess => {
    ;(sess.filesChanged ?? []).forEach(f => totalFilesSet.add(f))
    ;(sess.timeline ?? []).forEach(e => {
      totalEdits += (e.editDetails?.length ?? 0)
      for (const ed of e.editDetails ?? []) {
        if (ed.content) { totalAdded += countLines(ed.content) }
        else { totalAdded += countLines(ed.newString); totalRemoved += countLines(ed.oldString) }
      }
    })
  })

  return (
    <div id="files-content">
      <div class="tab-stats">
        <div><strong class="tab-stat-val">{totalFilesSet.size}</strong> files changed</div>
        <div><strong class="tab-stat-val">{totalEdits}</strong> edit operations</div>
        {totalAdded > 0 && <div><strong class="tab-stat-val" style="color:#4caf50">+{totalAdded}</strong> lines added</div>}
        {totalRemoved > 0 && <div><strong class="tab-stat-val" style="color:#f44336">-{totalRemoved}</strong> lines removed</div>}
        <div><strong class="tab-stat-val">{reversed.length}</strong> sessions</div>
      </div>
      {reversed.map((sess, ridx) => (
        <SessionBlock
          key={sess.traceId + ridx}
          sess={sess}
          ridx={ridx}
          allCount={sessions.length}
          isOpen={ridx === 0}
        />
      ))}
    </div>
  )
}
