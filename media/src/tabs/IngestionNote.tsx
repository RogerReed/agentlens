import { goToHelp } from '../state'

// Shown alongside an empty-state when a log-ingested session is missing data
// that OTEL ingestion would have captured (e.g. Trace/Flow/Tools/Files).
export function LogIngestionNote({ feature }: { feature: string }) {
  return (
    <div style="margin-top:8px;font-size:11px;color:var(--muted);line-height:1.5">
      No {feature} data from local logs for this session.{' '}
      <a onClick={() => goToHelp('help-config')} style="color:var(--vscode-textLink-foreground,#4fc3f7);cursor:pointer;text-decoration:underline">
        Configuring OTEL ingestion
      </a>{' '}would capture this.
    </div>
  )
}
