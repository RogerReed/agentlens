/** Same convention as the Dockerfile's HEALTHCHECK (`wget -qO- http://localhost:3000/`) —
 *  any response at all from the UI port means the server is up. Used for `agentlens service
 *  status` across all three platforms instead of parsing launchctl/systemctl/schtasks output,
 *  which is more meaningful ("is AgentLens actually reachable") and avoids three different
 *  fragile text-parsing paths. */
export async function probeServiceHealth(uiPort: number, bindHost: string): Promise<boolean> {
  const host = bindHost === '0.0.0.0' ? '127.0.0.1' : bindHost
  try {
    const res = await fetch(`http://${host}:${uiPort}/`, { signal: AbortSignal.timeout(2000) })
    return res.ok
  } catch {
    return false
  }
}
