"use strict";
(() => {
  // media/src/sidebarWebview.ts
  function formatCompact(n) {
    return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
  }
  function formatAgo(ms) {
    if (!ms) return "No activity yet";
    const secs = Math.floor((Date.now() - ms) / 1e3);
    if (secs < 60) return `${secs}s ago`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  }
  var lastActivityMs = __SIDEBAR_INIT__.lastActivityMs;
  function updateStatus(isActive, ms) {
    const dot = document.getElementById("statusDot");
    const text = document.getElementById("statusText");
    const label = document.getElementById("statusLabel");
    if (!dot || !text || !label) return;
    if (ms) lastActivityMs = ms;
    if (isActive) {
      dot.className = "status-dot active";
      text.textContent = "Active";
      text.style.color = "var(--vscode-foreground)";
      label.textContent = "";
    } else {
      dot.className = "status-dot idle";
      text.textContent = "Idle";
      text.style.color = "var(--vscode-descriptionForeground)";
      label.textContent = lastActivityMs ? formatAgo(lastActivityMs) : "No activity yet";
    }
  }
  setInterval(() => {
    const dot = document.getElementById("statusDot");
    if (dot?.classList.contains("idle") && lastActivityMs) {
      const label = document.getElementById("statusLabel");
      if (label) label.textContent = formatAgo(lastActivityMs);
    }
  }, 1e4);
  function getAgentColor(source) {
    if (source === "claude_code") return "#FFB085";
    if (source === "codex") return "#F0FF42";
    if (source === "copilot") return "#00EAFF";
    return "#90a4ae";
  }
  function getAgentLabel(source) {
    if (source === "claude_code") return "Claude";
    if (source === "codex") return "Codex";
    return "Copilot";
  }
  function refreshAgentKey(sources) {
    const el = document.getElementById("agentKey");
    if (!el) return;
    if (!sources.length) {
      el.innerHTML = "";
      return;
    }
    el.innerHTML = `<div style="display:flex;gap:10px;font-size:10px;color:var(--vscode-descriptionForeground);align-items:center;flex-wrap:wrap">${sources.map(
      (src) => `<span style="display:flex;align-items:center;gap:4px"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${getAgentColor(src)}"></span>${getAgentLabel(src)}</span>`
    ).join("")}</div>`;
  }
  var agentSources = __SIDEBAR_INIT__.agentSources;
  refreshAgentKey(agentSources);
  var vscode = acquireVsCodeApi();
  document.getElementById("openDashboard")?.addEventListener("click", () => {
    vscode.postMessage({ type: "openDashboard" });
  });
  document.getElementById("sessionLimitSelect")?.addEventListener("change", function() {
    vscode.postMessage({ type: "setSessionLimit", value: this.value });
  });
  document.getElementById("agentFilterSelect")?.addEventListener("change", function() {
    vscode.postMessage({ type: "setAgentFilter", value: this.value });
  });
  document.getElementById("clearBtn")?.addEventListener("click", () => {
    vscode.postMessage({ type: "clearAll" });
  });
  document.getElementById("exportSessionBtn")?.addEventListener("click", () => {
    vscode.postMessage({ type: "exportSessionData" });
  });
  window.addEventListener("message", (e) => {
    const msg = e.data;
    if (msg.type === "update") {
      const countLabel = document.getElementById("sessionCountLabel");
      if (countLabel) countLabel.textContent = String(msg.sessionCount ?? 0);
      const outputEl = document.getElementById("outputTokens");
      const inputEl = document.getElementById("inputTokens");
      const cacheEl = document.getElementById("cacheHitRate");
      const turnsEl = document.getElementById("avgTurns");
      if (outputEl) outputEl.textContent = formatCompact(msg.totalOutputTokens ?? 0);
      if (inputEl) inputEl.textContent = formatCompact(msg.totalInputTokens ?? 0);
      if (cacheEl) cacheEl.textContent = `${msg.cacheHitPct ?? 0}%`;
      if (turnsEl) turnsEl.textContent = String(msg.avgTurns ?? 0);
      updateStatus(msg.isActive ?? false, msg.lastActivityMs);
      if (msg.agentSources) {
        agentSources = msg.agentSources;
        refreshAgentKey(agentSources);
      }
    } else if (msg.type === "agentFilterChanged") {
      const sel = document.getElementById("agentFilterSelect");
      if (sel && msg.value) sel.value = msg.value;
    }
  });
})();
//# sourceMappingURL=sidebar.js.map
