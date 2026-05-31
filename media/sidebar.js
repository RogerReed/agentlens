"use strict";
(() => {
  // media/src/sidebarWebview.ts
  function fmt(n) {
    return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
  }
  function fmtDur(ms) {
    if (ms < 6e4) return `${Math.round(ms / 1e3)}s`;
    const m = Math.floor(ms / 6e4);
    const s = Math.round(ms % 6e4 / 1e3);
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  }
  function fmtAgo(ms) {
    if (!ms) return "No activity yet";
    const secs = Math.floor((Date.now() - ms) / 1e3);
    if (secs < 60) return `${secs}s ago`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  }
  function agentColor(source) {
    if (source === "claude_code") return "#FFB085";
    if (source === "codex") return "#F0FF42";
    if (source === "copilot") return "#00EAFF";
    return "#90a4ae";
  }
  function agentLabel(source) {
    if (source === "claude_code") return "Claude";
    if (source === "codex") return "Codex";
    return "Copilot";
  }
  function drawSparkline(canvas, tokens, color, isActive) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    const w = rect.width, h = rect.height;
    ctx.clearRect(0, 0, w, h);
    const cs = getComputedStyle(document.body);
    const mutedColor = cs.getPropertyValue("--vscode-descriptionForeground").trim() || "#888";
    const fontStr = "9px " + (cs.getPropertyValue("--vscode-font-family").trim() || "sans-serif");
    if (tokens.length < 2) {
      if (tokens.length === 1) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }
    const pad = { top: 10, right: 6, bottom: 14, left: 34 };
    const cw = w - pad.left - pad.right;
    const ch = h - pad.top - pad.bottom;
    const maxVal = Math.max(...tokens) || 1;
    const xPos = (i) => pad.left + i / (tokens.length - 1) * cw;
    const yPos = (v) => pad.top + ch - v / maxVal * ch;
    ctx.fillStyle = mutedColor;
    ctx.font = fontStr;
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText(fmt(maxVal), pad.left - 3, pad.top);
    ctx.textBaseline = "bottom";
    ctx.fillText("0", pad.left - 3, pad.top + ch);
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("T1", pad.left, pad.top + ch + 3);
    ctx.textAlign = "right";
    ctx.fillText("T" + tokens.length, pad.left + cw, pad.top + ch + 3);
    ctx.beginPath();
    ctx.moveTo(xPos(0), pad.top + ch);
    tokens.forEach((v, i) => ctx.lineTo(xPos(i), yPos(v)));
    ctx.lineTo(xPos(tokens.length - 1), pad.top + ch);
    ctx.closePath();
    const hex = color.startsWith("#") ? color : "#90a4ae";
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    ctx.fillStyle = `rgba(${r},${g},${b},0.15)`;
    ctx.fill();
    ctx.beginPath();
    tokens.forEach((v, i) => {
      i === 0 ? ctx.moveTo(xPos(i), yPos(v)) : ctx.lineTo(xPos(i), yPos(v));
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    const lx = xPos(tokens.length - 1), ly = yPos(tokens[tokens.length - 1]);
    ctx.beginPath();
    ctx.arc(lx, ly, isActive ? 4 : 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
  var state = {
    isActive: __SIDEBAR_INIT__.isActive,
    lastActivityMs: __SIDEBAR_INIT__.lastActivityMs,
    sessionCount: __SIDEBAR_INIT__.sessionCount,
    agentSources: __SIDEBAR_INIT__.agentSources,
    currentSession: __SIDEBAR_INIT__.currentSession,
    burnRate: __SIDEBAR_INIT__.burnRate
  };
  function render() {
    const { isActive, lastActivityMs, sessionCount, currentSession, burnRate } = state;
    const dot = document.getElementById("sb-dot");
    const statusText = document.getElementById("sb-status-text");
    const agoEl = document.getElementById("sb-ago");
    if (dot) dot.className = "sb-dot " + (isActive ? "active" : "idle");
    if (statusText) {
      statusText.textContent = isActive ? "Active" : "Idle";
      statusText.style.color = isActive ? "var(--vscode-foreground)" : "var(--vscode-descriptionForeground)";
    }
    if (agoEl) agoEl.textContent = isActive ? "" : lastActivityMs ? fmtAgo(lastActivityMs) : "No activity yet";
    const block = document.getElementById("sb-session-block");
    const empty = document.getElementById("sb-empty");
    if (!currentSession) {
      if (block) block.style.display = "none";
      if (empty) empty.style.display = "block";
      renderFooter();
      return;
    }
    if (block) block.style.display = "block";
    if (empty) empty.style.display = "none";
    const color = agentColor(currentSession.source);
    const agentEl = document.getElementById("sb-agent");
    if (agentEl) {
      agentEl.innerHTML = `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${color};flex-shrink:0;margin-right:4px"></span><span>${agentLabel(currentSession.source)}</span>`;
    }
    const durEl = document.getElementById("sb-dur");
    if (durEl) durEl.textContent = fmtDur(currentSession.durationMs);
    const promptEl = document.getElementById("sb-prompt");
    if (promptEl) {
      const req = currentSession.userRequest;
      promptEl.textContent = req ? req.length > 60 ? '"' + req.slice(0, 60) + '\u2026"' : '"' + req + '"' : "";
      promptEl.style.display = req ? "" : "none";
    }
    const modelEl = document.getElementById("sb-model");
    if (modelEl) modelEl.textContent = currentSession.model || "\u2014";
    const canvas = document.getElementById("sb-sparkline");
    if (canvas && currentSession.turnInputTokens.length > 0) {
      canvas.style.display = "block";
      drawSparkline(canvas, currentSession.turnInputTokens, color, isActive);
    } else if (canvas) {
      canvas.style.display = "none";
    }
    const turnLabel = document.getElementById("sb-turn-label");
    if (turnLabel) {
      const n = currentSession.turnInputTokens.length;
      const last = currentSession.turnInputTokens[n - 1] ?? 0;
      turnLabel.textContent = n > 0 ? `Turn ${n} \xB7 ${fmt(last)} tokens` : "";
    }
    const burnRow = document.getElementById("sb-burn-row");
    if (burnRow) {
      if (burnRate && isActive) {
        burnRow.style.display = "";
        const burnEl = document.getElementById("sb-burn");
        if (burnEl) {
          const tpm = fmt(Math.round(burnRate.tokensPerMinute));
          const cph = burnRate.costPerHour > 1e-3 ? ` \xB7 $${burnRate.costPerHour.toFixed(2)}/hr` : "";
          burnEl.textContent = `${tpm} tok/min${cph}`;
        }
      } else {
        burnRow.style.display = "none";
      }
    }
    const turnsEl = document.getElementById("sb-turns");
    const toolsEl = document.getElementById("sb-tools");
    const errEl = document.getElementById("sb-errors");
    const cacheEl = document.getElementById("sb-cache");
    if (turnsEl) turnsEl.textContent = String(currentSession.totalLlmCalls);
    if (toolsEl) toolsEl.textContent = String(currentSession.totalToolCalls);
    if (errEl) {
      errEl.textContent = String(currentSession.errors);
      errEl.style.color = currentSession.errors > 0 ? "var(--vscode-testing-iconFailed,#f44)" : "";
    }
    if (cacheEl) cacheEl.textContent = `${Math.round(currentSession.cacheHitRate * 100)}%`;
    renderFooter();
  }
  function renderFooter() {
    const countEl = document.getElementById("sb-session-count");
    if (countEl) countEl.textContent = String(state.sessionCount);
  }
  function renderAgentKey() {
    const el = document.getElementById("sb-agent-key");
    if (!el) return;
    el.innerHTML = state.agentSources.length ? state.agentSources.map(
      (src) => `<span style="display:flex;align-items:center;gap:4px"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${agentColor(src)}"></span>${agentLabel(src)}</span>`
    ).join("") : "";
  }
  renderAgentKey();
  render();
  setInterval(() => {
    if (!state.isActive && state.lastActivityMs) {
      const agoEl = document.getElementById("sb-ago");
      if (agoEl) agoEl.textContent = fmtAgo(state.lastActivityMs);
    }
  }, 1e4);
  window.addEventListener("message", (e) => {
    const msg = e.data;
    if (msg.type !== "update") return;
    if (msg.isActive !== void 0) state.isActive = msg.isActive;
    if (msg.lastActivityMs !== void 0) state.lastActivityMs = msg.lastActivityMs;
    if (msg.sessionCount !== void 0) state.sessionCount = msg.sessionCount;
    if (msg.agentSources) {
      state.agentSources = msg.agentSources;
      renderAgentKey();
    }
    if ("currentSession" in msg) state.currentSession = msg.currentSession ?? null;
    if ("burnRate" in msg) state.burnRate = msg.burnRate ?? null;
    render();
  });
  var vscode = typeof acquireVsCodeApi !== "undefined" ? acquireVsCodeApi() : null;
  document.getElementById("sb-open-btn")?.addEventListener("click", () => {
    if (vscode) vscode.postMessage({ type: "openDashboardTab", tab: "sessions" });
  });
  document.getElementById("sb-clear-btn")?.addEventListener("click", () => {
    if (!confirm("Clear all AgentLens session data? This cannot be undone.")) return;
    if (vscode) {
      vscode.postMessage({ type: "clearAll" });
    } else {
      fetch("/action", {
        method: "POST",
        body: JSON.stringify({ type: "clearAll" }),
        headers: { "Content-Type": "application/json" }
      });
    }
  });
})();
//# sourceMappingURL=sidebar.js.map
