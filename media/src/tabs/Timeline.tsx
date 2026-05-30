// Timeline tab is not currently registered in the UI.
// It previously displayed raw OTLP spans; raw span data is no longer sent to the webview.
export function Timeline() {
  return <div class="empty-state">Timeline view is not available in this version.</div>
}
