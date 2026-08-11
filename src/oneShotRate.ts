/**
 * One-shot / retry-rate metric — did each file the agent touched get it right on the first edit?
 *
 * File-edit-count based, not semantic: this counts edit passes per file, not whether the resulting
 * code actually worked. A one-character retry counts the same as a full rewrite. Reasonable proxy,
 * not a correctness signal — don't oversell it as one.
 */

import type { SessionSummaryCard } from './summarizers/summarizerTypes'
import { getFileEditCounts } from './loopDetector'

export interface OneShotStats {
  filesConsidered: number // files edited at least once
  oneShotFiles: number    // of those, edited exactly once
  retriedFiles: number    // of those, edited 2+ times
  totalEdits: number      // sum of edit passes across all considered files
}

const EMPTY_STATS: OneShotStats = { filesConsidered: 0, oneShotFiles: 0, retriedFiles: 0, totalEdits: 0 }

export function computeOneShotStats(session: SessionSummaryCard): OneShotStats {
  const fileEdits = getFileEditCounts(session)
  const files = Object.values(fileEdits)
  if (files.length === 0) return EMPTY_STATS

  const oneShotFiles = files.filter(edits => edits.length === 1).length
  const totalEdits = files.reduce((sum, edits) => sum + edits.length, 0)

  return {
    filesConsidered: files.length,
    oneShotFiles,
    retriedFiles: files.length - oneShotFiles,
    totalEdits,
  }
}

// Minimum edited-file sample size before a rate is meaningful rather than a coin flip dressed up
// as a percentage. Below this, callers should show "insufficient data" instead of a rate.
export const MIN_FILES_FOR_RATE = 2

/** Null when there's not enough data to be meaningful — never a misleadingly perfect 0% or 100%. */
export function oneShotRate(stats: Pick<OneShotStats, 'filesConsidered' | 'oneShotFiles'>): number | null {
  return stats.filesConsidered >= MIN_FILES_FOR_RATE ? stats.oneShotFiles / stats.filesConsidered : null
}

export function avgEditsPerFile(stats: Pick<OneShotStats, 'filesConsidered' | 'totalEdits'>): number | null {
  return stats.filesConsidered > 0 ? stats.totalEdits / stats.filesConsidered : null
}
