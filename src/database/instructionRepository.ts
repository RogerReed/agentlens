/**
 * Persistence for instruction advisor: applied suggestions and dismissals.
 * Uses the existing sql.js database instance.
 */

interface ReadableDb {
  exec(sql: string): Array<{ columns: string[]; values: unknown[][] }>
}

interface WriteableDb extends ReadableDb {
  run(sql: string, params?: unknown[]): void
}

export interface AppliedSuggestion {
  id: string
  workspace: string
  category: string
  title: string
  suggestedText: string
  appliedTo: string
  appliedText: string
  appliedAt: string         // ISO datetime
  appliedAtMs: number
  baselineCostAvg: number
  baselineTurnsAvg: number
  baselineErrorRate: number
  baselineLoopRate: number
  baselineInsufficient: boolean
}

export class InstructionRepository {
  constructor(private readonly db: WriteableDb) {}

  // ── Applied suggestions ───────────────────────────────────────────────────

  recordApplied(params: {
    id: string
    workspace: string
    category: string
    title: string
    suggestedText: string
    appliedTo: string
    appliedText: string
    baselineCostAvg: number
    baselineTurnsAvg: number
    baselineErrorRate: number
    baselineLoopRate: number
    baselineInsufficient: boolean
  }): void {
    const now = new Date().toISOString()
    this.db.run(
      `INSERT OR REPLACE INTO instruction_applied
         (id, workspace, category, title, suggested_text, applied_to, applied_text, applied_at,
          baseline_cost_avg, baseline_turns_avg, baseline_error_rate, baseline_loop_rate, baseline_insufficient)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        params.id, params.workspace, params.category, params.title,
        params.suggestedText, params.appliedTo, params.appliedText, now,
        params.baselineCostAvg, params.baselineTurnsAvg,
        params.baselineErrorRate, params.baselineLoopRate,
        params.baselineInsufficient ? 1 : 0,
      ],
    )
  }

  removeApplied(id: string): void {
    this.db.run('DELETE FROM instruction_applied WHERE id = ?', [id])
  }

  getApplied(workspace: string): AppliedSuggestion[] {
    // sql.js exec() does not support parameterized queries — escape manually
    const escaped = workspace.replace(/'/g, "''")
    const rows = this.db.exec(
      `SELECT id, workspace, category, title, suggested_text, applied_to, applied_text, applied_at,
              baseline_cost_avg, baseline_turns_avg, baseline_error_rate, baseline_loop_rate, baseline_insufficient
         FROM instruction_applied WHERE workspace = '${escaped}' ORDER BY applied_at DESC`,
    )
    if (!rows[0]) return []
    const { columns, values } = rows[0]
    return values.map(row => {
      const get = (col: string): unknown => row[columns.indexOf(col)]
      const appliedAt = String(get('applied_at') ?? '')
      const appliedAtMs = appliedAt ? Date.parse(appliedAt) : 0
      return {
        id:                    String(get('id') ?? ''),
        workspace:             String(get('workspace') ?? ''),
        category:              String(get('category') ?? ''),
        title:                 String(get('title') ?? ''),
        suggestedText:         String(get('suggested_text') ?? ''),
        appliedTo:             String(get('applied_to') ?? ''),
        appliedText:           String(get('applied_text') ?? ''),
        appliedAt,
        appliedAtMs,
        baselineCostAvg:       Number(get('baseline_cost_avg') ?? 0),
        baselineTurnsAvg:      Number(get('baseline_turns_avg') ?? 0),
        baselineErrorRate:     Number(get('baseline_error_rate') ?? 0),
        baselineLoopRate:      Number(get('baseline_loop_rate') ?? 0),
        baselineInsufficient:  Boolean(get('baseline_insufficient')),
      }
    })
  }

  // ── Dismissed suggestions ─────────────────────────────────────────────────

  recordDismissed(id: string, workspace: string): void {
    this.db.run(
      `INSERT OR IGNORE INTO instruction_dismissed (id, workspace, dismissed_at) VALUES (?, ?, ?)`,
      [id, workspace, new Date().toISOString()],
    )
  }

  undismiss(id: string, workspace: string): void {
    this.db.run(
      `DELETE FROM instruction_dismissed WHERE id = ? AND workspace = ?`,
      [id, workspace],
    )
  }

  getDismissedIds(workspace: string): string[] {
    const escaped = workspace.replace(/'/g, "''")
    const rows = this.db.exec(
      `SELECT id FROM instruction_dismissed WHERE workspace = '${escaped}'`,
    )
    if (!rows[0]) return []
    return rows[0].values.map(r => String(r[0]))
  }
}
