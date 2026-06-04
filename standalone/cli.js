#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// standalone/server.ts
var http = __toESM(require("http"));
var fs3 = __toESM(require("fs"));
var path3 = __toESM(require("path"));
var os3 = __toESM(require("os"));
var import_child_process = require("child_process");

// src/loopDetector.ts
var PATTERN_NAMES = {
  exact_tool_repeat: "Tool Call Deadlock",
  edit_revert_cycle: "State Corruption Spiral",
  error_recurrence: "Hallucination Amplification Loop",
  runaway_steps: "Ambiguous Success / Escalating Scope",
  token_runaway: "Infinite Loop \u2014 Context Accumulation"
};
var LOOP_SIGNAL_ACTIONS = {
  exact_tool_repeat: `The agent is calling the same tool with identical arguments repeatedly, usually because it isn't using or retaining the result. Add explicit context-retention instructions: "After reading a file, do not re-read it unless you have made changes." Or scope the task more narrowly so the agent can complete it without re-querying the same resource.`,
  edit_revert_cycle: 'The agent is oscillating between two file states \u2014 a sign it is trying to reconcile conflicting constraints. Clarify success criteria upfront: provide the exact final state you want, not iterative instructions. If you are using "make it pass the tests", ensure the tests are deterministic and not themselves the source of the conflict.',
  error_recurrence: "The same error is repeating, which means the agent's fix attempts are not resolving the root cause. This often happens with missing packages, wrong file paths, or hallucinated API names. Verify the package/function exists before asking the agent to use it. If the error persists after 2 attempts, intervene manually rather than asking the agent to retry.",
  runaway_steps: 'The session used far more steps than expected for this type of task \u2014 a sign of unclear success criteria, escalating scope, or a loop. Break the task into smaller, explicitly scoped subtasks with clear completion conditions. Avoid open-ended instructions like "fix all the bugs" or "clean up the code" with no stopping condition.',
  token_runaway: "Input context is growing rapidly while useful output is declining \u2014 the agent is accumulating context without making forward progress. This pattern often accompanies tool-call loops or repeated failed fixes. Start a fresh session with a focused prompt, or explicitly tell the agent what it has already tried and what to do differently."
};
function detectLoopSignals(session) {
  const signals = [];
  detectExactToolRepeat(session, signals);
  detectEditRevertCycle(session, signals);
  detectErrorRecurrence(session, signals);
  detectRunawaySteps(session, signals);
  detectTokenRunaway(session, signals);
  return signals;
}
function detectExactToolRepeat(session, signals) {
  const counts = {};
  for (const entry of session.timeline) {
    if (entry.type !== "tool") {
      continue;
    }
    const key = (entry.label || "").trim();
    if (!key) {
      continue;
    }
    counts[key] = (counts[key] || 0) + 1;
  }
  const repeated = Object.entries(counts).filter(([, n]) => n >= 3).sort((a, b) => b[1] - a[1]);
  if (repeated.length === 0) {
    return;
  }
  const topCount = repeated[0][1];
  signals.push({
    type: "exact_tool_repeat",
    severity: topCount >= 5 ? "critical" : "warning",
    evidence: `${repeated.length} tool call(s) executed identically 3+ times`,
    count: topCount,
    examples: repeated.slice(0, 3).map(([label, n]) => `"${label.slice(0, 60)}" \xD7${n}`),
    patternName: PATTERN_NAMES.exact_tool_repeat,
    action: LOOP_SIGNAL_ACTIONS.exact_tool_repeat
  });
}
function detectEditRevertCycle(session, signals) {
  const fileEdits = {};
  for (const entry of session.timeline) {
    if (entry.type !== "tool" || !entry.editDetails) {
      continue;
    }
    for (const detail of entry.editDetails) {
      if (!detail.filePath || !detail.oldString || !detail.newString) {
        continue;
      }
      if (!fileEdits[detail.filePath]) {
        fileEdits[detail.filePath] = [];
      }
      fileEdits[detail.filePath].push({ old: detail.oldString, new: detail.newString });
    }
  }
  const revertedFiles = [];
  for (const [file, edits] of Object.entries(fileEdits)) {
    if (edits.length < 2) {
      continue;
    }
    let reverted = false;
    outer:
      for (let j = 1; j < edits.length; j++) {
        for (let i = 0; i < j; i++) {
          if (edits[j].old === edits[i].new && edits[j].new === edits[i].old) {
            reverted = true;
            break outer;
          }
        }
      }
    if (reverted) {
      revertedFiles.push(file);
    }
  }
  if (revertedFiles.length === 0) {
    return;
  }
  signals.push({
    type: "edit_revert_cycle",
    severity: "critical",
    evidence: `${revertedFiles.length} file(s) were edited then reverted to a prior state`,
    count: revertedFiles.length,
    examples: revertedFiles.slice(0, 3).map((f) => f.split("/").pop() || f),
    patternName: PATTERN_NAMES.edit_revert_cycle,
    action: LOOP_SIGNAL_ACTIONS.edit_revert_cycle
  });
}
function detectErrorRecurrence(session, signals) {
  const counts = {};
  for (const entry of session.timeline) {
    if (!entry.isError) {
      continue;
    }
    const key = (entry.errorMessage || entry.label || "unknown error").trim().slice(0, 200);
    counts[key] = (counts[key] || 0) + 1;
  }
  const recurring = Object.entries(counts).filter(([, n]) => n >= 3).sort((a, b) => b[1] - a[1]);
  if (recurring.length === 0) {
    return;
  }
  const topCount = recurring[0][1];
  signals.push({
    type: "error_recurrence",
    severity: topCount >= 5 ? "critical" : "warning",
    evidence: `${recurring.length} error(s) recurring 3+ times`,
    count: recurring.reduce((s, [, n]) => s + n, 0),
    examples: recurring.slice(0, 3).map(([msg, n]) => `"${msg.slice(0, 60)}" \xD7${n}`),
    patternName: PATTERN_NAMES.error_recurrence,
    action: LOOP_SIGNAL_ACTIONS.error_recurrence
  });
}
var COMPLEX_KEYWORDS = [
  "implement",
  "refactor",
  "build",
  "design",
  "migrate",
  "convert",
  "rewrite",
  "integrate",
  "architect",
  "scaffold",
  "rework"
];
var SIMPLE_KEYWORDS = [
  "fix typo",
  "rename",
  "delete",
  "move file",
  "add comment",
  "add line",
  "update string",
  "change message",
  "add import"
];
var STEP_THRESHOLDS = { simple: 15, medium: 35, complex: 80 };
function inferTaskComplexity(request, session) {
  const lower = request.toLowerCase();
  const filesAffected = session ? (/* @__PURE__ */ new Set([...session.filesRead, ...session.filesChanged, ...session.filesSearched])).size : 0;
  if (filesAffected >= 8) {
    return "complex";
  }
  if (filesAffected >= 4) {
    return "medium";
  }
  if (SIMPLE_KEYWORDS.some((k) => lower.includes(k))) {
    return "simple";
  }
  const complexMatches = COMPLEX_KEYWORDS.filter((k) => lower.includes(k)).length;
  if (request.length > 150 || complexMatches >= 2) {
    return "complex";
  }
  if (complexMatches >= 1 || request.length > 80) {
    return "medium";
  }
  if (request.length <= 20) {
    return "simple";
  }
  return "medium";
}
function detectRunawaySteps(session, signals) {
  const totalSteps = session.totalLlmCalls + session.totalToolCalls;
  const complexity = inferTaskComplexity(session.userRequest || "", session);
  const threshold = STEP_THRESHOLDS[complexity];
  if (totalSteps <= threshold) {
    return;
  }
  signals.push({
    type: "runaway_steps",
    severity: totalSteps >= threshold * 2 ? "critical" : "warning",
    evidence: `${totalSteps} steps for a ${complexity} task (threshold: ${threshold})`,
    count: totalSteps,
    examples: [
      `${session.totalLlmCalls} LLM calls`,
      `${session.totalToolCalls} tool calls`,
      `"${(session.userRequest || "").slice(0, 60)}"`
    ],
    patternName: PATTERN_NAMES.runaway_steps,
    action: LOOP_SIGNAL_ACTIONS.runaway_steps
  });
}
function detectTokenRunaway(session, signals) {
  const llmCalls = session.timeline.filter(
    (e) => e.type === "llm" && (e.inputTokens ?? 0) > 0
  );
  if (llmCalls.length < 4) {
    return;
  }
  const inputs = llmCalls.map((e) => e.inputTokens ?? 0);
  const outputs = llmCalls.map((e) => e.outputTokens ?? 0);
  const inputGrowth = inputs[inputs.length - 1] - inputs[0];
  if (inputGrowth < 15e3) {
    return;
  }
  const earlyRatio = outputs[0] / Math.max(inputs[0], 1);
  const lateRatio = outputs[outputs.length - 1] / Math.max(inputs[inputs.length - 1], 1);
  const ratioDrop = earlyRatio > 0.01 && lateRatio < earlyRatio * 0.3;
  if (!ratioDrop) {
    return;
  }
  signals.push({
    type: "token_runaway",
    severity: inputGrowth > 5e4 ? "critical" : "warning",
    evidence: `Input grew ${inputGrowth.toLocaleString()} tokens across ${llmCalls.length} LLM calls while output ratio collapsed (${(earlyRatio * 100).toFixed(1)}% \u2192 ${(lateRatio * 100).toFixed(1)}%)`,
    count: llmCalls.length,
    examples: [
      `First call: ${inputs[0].toLocaleString()} in \u2192 ${outputs[0].toLocaleString()} out`,
      `Last call:  ${inputs[inputs.length - 1].toLocaleString()} in \u2192 ${outputs[outputs.length - 1].toLocaleString()} out`
    ],
    patternName: PATTERN_NAMES.token_runaway,
    action: LOOP_SIGNAL_ACTIONS.token_runaway
  });
}

// src/summarizers/helpers.ts
var CLAUDE_WRITE_TOOLS = /* @__PURE__ */ new Set(["Edit", "Write", "MultiEdit", "NotebookEdit"]);
function getAttrStr(span, key) {
  const attr = span.attributes?.find((a) => a.key === key);
  if (!attr) {
    return "";
  }
  return String(attr.value?.stringValue ?? attr.value?.intValue ?? attr.value?.doubleValue ?? "");
}
function getGenAiModel(span) {
  return getFirstAttr(span, ["gen_ai.request.model", "gen_ai.response.model", "model"]);
}
function getAttrInt(span, key) {
  const attr = span.attributes?.find((a) => a.key === key);
  if (!attr) {
    return 0;
  }
  return Number(attr.value?.intValue ?? attr.value?.doubleValue ?? attr.value?.stringValue ?? 0) || 0;
}
function nanoToMs(nanoStr) {
  try {
    return Number(BigInt(nanoStr || "0") / BigInt(1e6));
  } catch {
    return parseInt(nanoStr, 10) / 1e6 || 0;
  }
}
function timestampToMs(value) {
  if (value === void 0 || value === null || value === "") {
    return 0;
  }
  if (typeof value === "number") {
    return value;
  }
  const raw = String(value);
  if (/^\d+$/.test(raw)) {
    return nanoToMs(raw);
  }
  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}
function extractUserRequest(raw) {
  const trimmed = raw.trim();
  if (trimmed.includes("<userRequest>")) {
    const match = trimmed.match(/<userRequest>\s*([\s\S]*?)\s*<\/userRequest>/);
    return match?.[1]?.trim() || trimmed.slice(0, 5e3);
  }
  const codexIdeRequest = trimmed.match(/(?:^|\n)##\s+My request(?:\s+for\s+[^\n:]+)?:\s*\n([\s\S]*)$/i);
  const request = codexIdeRequest?.[1]?.trim();
  if (request) {
    return request.slice(0, 5e3);
  }
  const stripped = trimmed.replace(/<ide_[^>]*>[\s\S]*?<\/ide_[^>]*>/gi, "").trim();
  if (stripped) {
    return stripped.slice(0, 5e3);
  }
  return trimmed.slice(0, 5e3);
}
function getFirstAttr(span, keys) {
  for (const key of keys) {
    const val = getAttrStr(span, key);
    if (val) {
      return val;
    }
  }
  return "";
}
function isCodexPromptSpanName(name) {
  return name === "codex.user_prompt" || name === "codex.prompt" || name === "codex.user_message" || name === "codex.session_start";
}
function isCodexToolDecisionSpan(name) {
  return name === "codex.tool_decision";
}
function isCodexToolCallSpan(name) {
  return name === "codex.tool.call";
}
function isCodexToolResultSpan(name) {
  return name === "codex.tool_result";
}
function isCodexToolSpanName(name) {
  return name === "codex.tool_result" || name === "codex.tool" || name === "codex.tool_decision" || name === "codex.tool.call" || name === "exec_command" || name === "apply_patch" || name.includes(".tool");
}
function isCodexToolExecSpan(span) {
  if (isCodexToolSpanName(span.name)) return true;
  return Boolean(getAttrStr(span, "call_id") && getAttrStr(span, "tool_name"));
}
function isCodexLlmSpanName(name) {
  return name === "codex.stream_event" || name === "codex.completion" || name === "codex.response" || name === "codex.sse_event" || name.includes("stream") || name.includes("completion") || name.includes("response");
}
function summarizeToolArgs(toolName, argsJson) {
  try {
    const args = JSON.parse(argsJson);
    switch (toolName) {
      case "read_file": {
        const file = (args.filePath || "").split("/").pop() || args.filePath;
        return `${file} L${args.startLine}-${args.endLine}`;
      }
      case "file_search":
        return args.query || argsJson.slice(0, 80);
      case "grep_search": {
        const q = args.query || "?";
        const inc = args.includePattern || "*";
        return `"${q}" in ${inc}`;
      }
      case "list_dir": {
        const p = args.path || "";
        const parts = p.split("/").filter(Boolean);
        return parts[parts.length - 1] || p;
      }
      case "manage_todo_list": {
        const items = args.todoList || [];
        const statuses = items.reduce((acc, i) => {
          acc[i.status] = (acc[i.status] || 0) + 1;
          return acc;
        }, {});
        const parts = Object.entries(statuses).map(([s, n]) => `${n} ${s}`);
        return `${items.length} items (${parts.join(", ")})`;
      }
      case "semantic_search":
        return `"${(args.query || "").slice(0, 60)}"`;
      case "replace_string_in_file":
      case "multi_replace_string_in_file": {
        const file = (args.filePath || "").split("/").pop();
        return file || "edit";
      }
      case "create_file": {
        const file = (args.filePath || "").split("/").pop();
        return file || "new file";
      }
      case "apply_patch": {
        const patchContent = args.command || args.patch || args.input || "";
        const files = [];
        for (const line of patchContent.split("\n")) {
          const m = line.match(/^\*\*\*\s+(?:Update File:|Add File:|Delete File:)?\s*(.+)/);
          if (m) {
            const fp = m[1].trim();
            if (fp.includes("/")) {
              files.push(fp.split("/").pop() || "");
            }
          }
        }
        return files.length > 0 ? files.filter(Boolean).join(", ") : "patch";
      }
      case "run_in_terminal":
        return (args.command || "").slice(0, 80);
      case "vscode_askQuestions": {
        const qs = args.questions || [];
        return `${qs.length} question(s)`;
      }
      case "explore_subagent":
      case "runSubagent":
        return (args.description || args.query || "").slice(0, 60);
      default:
        return argsJson.slice(0, 80);
    }
  } catch {
    return argsJson.slice(0, 80);
  }
}
function summarizeToolResult(toolName, result) {
  if (!result) {
    return "empty";
  }
  if (result === "No todo list found.") {
    return "no list";
  }
  const len = result.length;
  if (len < 50) {
    return result;
  }
  if (toolName === "grep_search") {
    const match = result.match(/(\d+)\s+match/);
    if (match) {
      return `${match[1]} matches`;
    }
  }
  if (toolName === "file_search") {
    const match = result.match(/(\d+)\s+total result/);
    if (match) {
      return `${match[1]} result(s)`;
    }
  }
  if (len > 1e3) {
    return `${(len / 1024).toFixed(1)}KB`;
  }
  return `${len} chars`;
}
function extractTokenCounts(span) {
  const input = getAttrInt(span, "gen_ai.usage.input_tokens") || getAttrInt(span, "input_tokens") || getAttrInt(span, "prompt_tokens") || getAttrInt(span, "input_token_count") || getAttrInt(span, "codex.turn.token_usage.input_tokens");
  const cacheRead = getAttrInt(span, "gen_ai.usage.cache_read.input_tokens") || getAttrInt(span, "cache_read_tokens") || getAttrInt(span, "cached_token_count") || getAttrInt(span, "codex.turn.token_usage.cached_input_tokens");
  const cacheCreate = getAttrInt(span, "gen_ai.usage.cache_creation.input_tokens") || getAttrInt(span, "cache_creation_tokens");
  const outputStd = getAttrInt(span, "gen_ai.usage.output_tokens") || getAttrInt(span, "output_tokens") || getAttrInt(span, "completion_tokens") || getAttrInt(span, "codex.turn.token_usage.output_tokens");
  const output = outputStd || getAttrInt(span, "output_token_count") + getAttrInt(span, "reasoning_token_count");
  return { input, output, cacheRead, cacheCreate };
}
function normalizeUserRequest(raw, length, fallback, redactionNote) {
  const isRedacted = !raw || raw === "<REDACTED>" || raw === "[REDACTED]";
  if (!isRedacted) {
    return extractUserRequest(raw);
  }
  if (length > 0) {
    return redactionNote ? `[${length} chars \u2014 ${redactionNote}]` : `[~${length} chars]`;
  }
  return fallback;
}
function extractResponseText(outputMessages) {
  if (!outputMessages) {
    return void 0;
  }
  try {
    const msgs = JSON.parse(outputMessages);
    if (!Array.isArray(msgs)) {
      return void 0;
    }
    for (const msg of msgs) {
      if (msg.role === "assistant") {
        if (typeof msg.content === "string" && msg.content.trim()) {
          return msg.content;
        }
        if (Array.isArray(msg.content)) {
          const textParts = msg.content.filter((p) => p.type === "text" && p.text).map((p) => p.text);
          if (textParts.length > 0) {
            return textParts.join("\n");
          }
        }
      }
    }
  } catch {
  }
  return void 0;
}
function detectOutputAction(outputMessages) {
  if (!outputMessages) {
    return "unknown";
  }
  if (outputMessages.includes('"tool_call"')) {
    const toolNames = [];
    const re = /"name"\s*:\s*"([^"]+)"/g;
    let m;
    while ((m = re.exec(outputMessages)) !== null) {
      toolNames.push(m[1]);
    }
    if (toolNames.length > 0) {
      return `called ${toolNames.join(", ")}`;
    }
    return "tool_calls";
  }
  return "text response";
}

// src/summarizers/copilot.ts
function buildCopilotSessions(invokeAgentSpans, childrenOf) {
  return invokeAgentSpans.map((agent) => {
    const children = collectDescendants(agent.spanId, childrenOf).slice().sort((a, b) => nanoToMs(a.startTime) - nanoToMs(b.startTime));
    const userReq = extractUserRequest(getAttrStr(agent, "copilot_chat.user_request")) || "[Copilot session]";
    const model = getGenAiModel(agent);
    const chatSpan = children.find((s) => s.name.startsWith("chat"));
    const conversationId = chatSpan ? getAttrStr(chatSpan, "gen_ai.conversation.id") : void 0;
    const turns = getAttrInt(agent, "copilot_chat.turn_count");
    const { input: inputTokens, output: outputTokens, cacheRead, cacheCreate } = extractTokenCounts(agent);
    const totalInput = inputTokens + cacheRead + cacheCreate;
    const cacheHitRate = totalInput > 0 ? cacheRead / totalInput : 0;
    const startMs = nanoToMs(agent.startTime);
    const endMs = nanoToMs(agent.endTime);
    const durationMs = endMs - startMs;
    const filesRead = /* @__PURE__ */ new Set();
    const filesSearched = /* @__PURE__ */ new Set();
    const filesChanged = /* @__PURE__ */ new Set();
    const toolCounts = {};
    let totalToolCalls = 0;
    let totalLlmCalls = 0;
    let errors = 0;
    let lastOutcome = "unknown";
    const timeline = children.map((child) => {
      const childStart = nanoToMs(child.startTime);
      const childEnd = nanoToMs(child.endTime);
      const childDur = childEnd - childStart;
      const isError = child.status?.code === 2;
      if (isError) {
        errors++;
      }
      const ts = childStart > 0 ? new Date(childStart).toISOString() : "";
      if (child.name.startsWith("execute_tool")) {
        const toolName = getAttrStr(child, "gen_ai.tool.name");
        const argsStr = getAttrStr(child, "gen_ai.tool.call.arguments");
        const resultStr = getAttrStr(child, "gen_ai.tool.call.result");
        toolCounts[toolName] = (toolCounts[toolName] || 0) + 1;
        totalToolCalls++;
        if (toolName === "read_file") {
          try {
            const args = JSON.parse(argsStr);
            const file = (args.filePath || "").split("/").pop();
            if (file) {
              filesRead.add(file);
            }
          } catch {
          }
        }
        if (toolName === "file_search" || toolName === "grep_search") {
          try {
            const args = JSON.parse(argsStr);
            filesSearched.add(args.query || args.includePattern || "");
          } catch {
          }
        }
        if (toolName === "replace_string_in_file" || toolName === "create_file" || toolName === "edit_notebook_file") {
          try {
            const args = JSON.parse(argsStr);
            if (args.filePath) {
              filesChanged.add(String(args.filePath));
            }
          } catch {
          }
        }
        if (toolName === "multi_replace_string_in_file") {
          try {
            const args = JSON.parse(argsStr);
            if (args.replacements && Array.isArray(args.replacements)) {
              for (const r of args.replacements) {
                if (r.filePath) {
                  filesChanged.add(String(r.filePath));
                }
              }
            }
          } catch {
          }
        }
        if (toolName === "apply_patch") {
          try {
            const args = JSON.parse(argsStr);
            const patchContent = args.command || args.patch || args.input || "";
            for (const line of patchContent.split("\n")) {
              const m = line.match(/^\*\*\*\s+(?:Update File:|Add File:|Delete File:)?\s*(.+)/);
              if (m) {
                const fp = m[1].trim();
                if (fp && fp.includes("/")) {
                  filesChanged.add(fp);
                }
              }
            }
          } catch {
          }
        }
        const label = `${toolName} ${summarizeToolArgs(toolName, argsStr)}`;
        const resultSummary = summarizeToolResult(toolName, resultStr);
        const editDetails = extractCopilotEditDetails(toolName, argsStr);
        return {
          type: "tool",
          spanId: child.spanId,
          label,
          durationMs: childDur,
          resultSummary,
          fullResult: resultStr || void 0,
          toolInput: argsStr || void 0,
          isError,
          errorMessage: isError ? child.status?.message || void 0 : void 0,
          timestamp: ts,
          editDetails
        };
      } else if (child.name.startsWith("chat")) {
        totalLlmCalls++;
        const childModel = getGenAiModel(child);
        const { input: inTok, output: outTok } = extractTokenCounts(child);
        const ttft = getAttrInt(child, "copilot_chat.time_to_first_token");
        const thinking = getAttrStr(child, "copilot_chat.reasoning_content");
        const outputMsgs = getAttrStr(child, "gen_ai.output.messages");
        const action = detectOutputAction(outputMsgs);
        const responseText = extractResponseText(outputMsgs);
        if (action === "text response") {
          lastOutcome = "text_response";
        } else if (action.startsWith("called")) {
          lastOutcome = "tool_calls";
        }
        return {
          type: "llm",
          spanId: child.spanId,
          label: childModel,
          model: childModel,
          thinking: thinking ? thinking.slice(0, 200) : void 0,
          inputTokens: inTok,
          outputTokens: outTok,
          ttft,
          durationMs: childDur,
          action,
          responseText: responseText || void 0,
          isError,
          errorMessage: isError ? child.status?.message || void 0 : void 0,
          timestamp: ts
        };
      } else {
        return {
          type: "background",
          spanId: child.spanId,
          label: child.name,
          durationMs: childDur,
          isError,
          timestamp: ts
        };
      }
    });
    return {
      sessionId: agent.spanId,
      traceId: agent.traceId || "",
      source: "copilot",
      dataSource: "otel",
      initiator: "agent",
      conversationId: conversationId || void 0,
      userRequest: userReq,
      model,
      turns,
      inputTokens: totalInput,
      outputTokens,
      cacheReadTokens: cacheRead,
      cacheCreateTokens: cacheCreate,
      cacheHitRate,
      durationMs,
      startTime: startMs > 0 ? new Date(startMs).toISOString() : "",
      filesRead: Array.from(filesRead),
      filesSearched: Array.from(filesSearched),
      filesChanged: Array.from(filesChanged),
      toolCounts,
      totalToolCalls,
      totalLlmCalls,
      errors,
      outcome: lastOutcome,
      timeline,
      backgroundSpans: [],
      loopSignals: []
    };
  });
}
function collectDescendants(rootSpanId, childrenOf) {
  const result = [];
  const seen = /* @__PURE__ */ new Set();
  const stack = [...childrenOf[rootSpanId] || []];
  while (stack.length > 0) {
    const span = stack.shift();
    if (!span || seen.has(span.spanId)) {
      continue;
    }
    seen.add(span.spanId);
    result.push(span);
    stack.push(...childrenOf[span.spanId] || []);
  }
  return result;
}
function extractCopilotEditDetails(toolName, argsStr) {
  try {
    if (toolName === "replace_string_in_file") {
      const args = JSON.parse(argsStr);
      if (args.filePath) {
        return [{ filePath: args.filePath, oldString: args.oldString, newString: args.newString }];
      }
    } else if (toolName === "multi_replace_string_in_file") {
      const args = JSON.parse(argsStr);
      if (args.replacements && Array.isArray(args.replacements)) {
        return args.replacements.filter((r) => r.filePath).map((r) => ({
          filePath: r.filePath,
          oldString: r.oldString,
          newString: r.newString
        }));
      }
    } else if (toolName === "create_file") {
      const args = JSON.parse(argsStr);
      if (args.filePath) {
        return [{ filePath: args.filePath, content: args.content }];
      }
    } else if (toolName === "apply_patch") {
      const args = JSON.parse(argsStr);
      const patchContent = args.command || args.patch || args.input || "";
      const details = [];
      let currentFile = "";
      let oldLines = [];
      let newLines = [];
      for (const line of patchContent.split("\n")) {
        const fileMatch = line.match(/^\*\*\*\s+(?:Update File:|Add File:|Delete File:)?\s*(.+)/);
        if (fileMatch) {
          const candidate = fileMatch[1].trim();
          if (!candidate.includes("/")) continue;
          if (currentFile) {
            details.push({
              filePath: currentFile,
              oldString: oldLines.length > 0 ? oldLines.join("\n") : void 0,
              newString: newLines.length > 0 ? newLines.join("\n") : void 0
            });
          }
          currentFile = candidate;
          oldLines = [];
          newLines = [];
          continue;
        }
        if (line.startsWith("@@")) continue;
        if (line.startsWith("-")) {
          oldLines.push(line.slice(1));
        } else if (line.startsWith("+")) {
          newLines.push(line.slice(1));
        }
      }
      if (currentFile) {
        details.push({
          filePath: currentFile,
          oldString: oldLines.length > 0 ? oldLines.join("\n") : void 0,
          newString: newLines.length > 0 ? newLines.join("\n") : void 0
        });
      }
      if (details.length > 0) {
        return details;
      }
    }
  } catch {
  }
  return void 0;
}

// src/summarizers/claude.ts
function strOrUndef(v) {
  if (v === null || v === void 0 || v === "") {
    return void 0;
  }
  return String(v);
}
function buildClaudeSessions(claudeInteractionSpans, spansByTraceId) {
  return claudeInteractionSpans.map((interaction) => {
    const traceSpans = (spansByTraceId[interaction.traceId] || []).filter((s) => s.spanId !== interaction.spanId).sort((a, b) => nanoToMs(a.startTime) - nanoToMs(b.startTime));
    const topSpans = traceSpans.filter(
      (s) => s.name === "claude_code.llm_request" || s.name === "claude_code.tool"
    );
    const childrenBySpanId = {};
    for (const s of traceSpans) {
      if (s.parentSpanId) {
        if (!childrenBySpanId[s.parentSpanId]) {
          childrenBySpanId[s.parentSpanId] = [];
        }
        childrenBySpanId[s.parentSpanId].push(s);
      }
    }
    let inputTokens = 0, outputTokens = 0, cacheReadTokens = 0, cacheCreateTokens = 0;
    let totalLlmCalls = 0, totalToolCalls = 0, errors = 0;
    let model = "";
    const toolCounts = {};
    const filesRead = /* @__PURE__ */ new Set();
    const filesSearched = /* @__PURE__ */ new Set();
    const filesChanged = /* @__PURE__ */ new Set();
    let missingChangedFilePathCalls = 0;
    const timeline = topSpans.flatMap((child) => {
      const childStart = nanoToMs(child.startTime);
      const childEnd = nanoToMs(child.endTime);
      const childDur = childEnd - childStart || getAttrInt(child, "duration_ms");
      const isError = child.status?.code === 2;
      if (isError) {
        errors++;
      }
      const ts = childStart > 0 ? new Date(childStart).toISOString() : "";
      if (child.name === "claude_code.llm_request") {
        totalLlmCalls++;
        const { input: inTok, output: outTok, cacheRead, cacheCreate } = extractTokenCounts(child);
        const ttft = getAttrInt(child, "ttft_ms");
        const childModel = getGenAiModel(child);
        if (childModel) {
          model = childModel;
        }
        inputTokens += inTok;
        outputTokens += outTok;
        cacheReadTokens += cacheRead;
        cacheCreateTokens += cacheCreate;
        const stopReason = getAttrStr(child, "stop_reason");
        const action = stopReason === "tool_use" ? "called tools" : stopReason === "end_turn" ? "text response" : stopReason || "unknown";
        const claudeOutputMsgs = getAttrStr(child, "gen_ai.output.messages");
        const responseText = extractResponseText(claudeOutputMsgs);
        const llmEditDetails = [];
        if (claudeOutputMsgs) {
          try {
            const msgs = JSON.parse(claudeOutputMsgs);
            if (Array.isArray(msgs)) {
              for (const msg of msgs) {
                const m = msg;
                if (m.role !== "assistant") {
                  continue;
                }
                const content = Array.isArray(m.content) ? m.content : [];
                for (const block of content) {
                  const b = block;
                  if (b.type !== "tool_use" || !b.input) {
                    continue;
                  }
                  const toolN = b.name || "";
                  let foundChangedPath = false;
                  const fp = String(b.input.file_path || b.input.filePath || "");
                  if (fp) {
                    if (CLAUDE_WRITE_TOOLS.has(toolN)) {
                      filesChanged.add(fp);
                      foundChangedPath = true;
                      llmEditDetails.push({
                        filePath: fp,
                        toolName: toolN,
                        oldString: strOrUndef(b.input.old_string || b.input.oldString),
                        newString: strOrUndef(b.input.new_string || b.input.newString),
                        content: strOrUndef(b.input.content)
                      });
                    } else if (toolN === "Read") {
                      filesRead.add(fp.split("/").pop() || fp);
                    } else if (toolN === "Glob" || toolN === "Grep") {
                      filesSearched.add(String(b.input.pattern || b.input.query || fp));
                    }
                  }
                  if (toolN === "MultiEdit" && Array.isArray(b.input.edits)) {
                    for (const e of b.input.edits) {
                      const efp = e.file_path || e.filePath;
                      if (efp) {
                        filesChanged.add(String(efp));
                        foundChangedPath = true;
                        llmEditDetails.push({
                          filePath: String(efp),
                          toolName: "Edit",
                          oldString: strOrUndef(e.old_string || e.oldString),
                          newString: strOrUndef(e.new_string || e.newString)
                        });
                      }
                    }
                  }
                  if (CLAUDE_WRITE_TOOLS.has(toolN) && !foundChangedPath) {
                    missingChangedFilePathCalls++;
                  }
                }
              }
            }
          } catch {
          }
        }
        return [{
          type: "llm",
          spanId: child.spanId,
          label: childModel || "LLM",
          model: childModel,
          inputTokens: inTok + cacheRead + cacheCreate,
          outputTokens: outTok,
          ttft,
          durationMs: childDur,
          action,
          responseText: responseText || void 0,
          isError,
          errorMessage: isError ? child.status?.message || void 0 : void 0,
          timestamp: ts,
          editDetails: llmEditDetails.length > 0 ? llmEditDetails : void 0
        }];
      } else {
        totalToolCalls++;
        const toolName = getAttrStr(child, "tool_name") || child.name;
        toolCounts[toolName] = (toolCounts[toolName] || 0) + 1;
        const isWriteTool = CLAUDE_WRITE_TOOLS.has(toolName);
        const argsStr = getAttrStr(child, "tool_input") || getAttrStr(child, "input") || getAttrStr(child, "gen_ai.tool.call.arguments") || getAttrStr(child, "full_command") || getAttrStr(child, "file_path");
        let foundChangedPath = false;
        const toolEditDetails = [];
        if (argsStr) {
          try {
            const args = JSON.parse(argsStr);
            const fp = args.file_path || args.filePath;
            if (fp) {
              const fpStr = String(fp);
              if (CLAUDE_WRITE_TOOLS.has(toolName)) {
                filesChanged.add(fpStr);
                foundChangedPath = true;
                toolEditDetails.push({
                  filePath: fpStr,
                  oldString: strOrUndef(args.old_string || args.oldString),
                  newString: strOrUndef(args.new_string || args.newString),
                  content: strOrUndef(args.content)
                });
              } else if (toolName === "Read") {
                filesRead.add(fpStr.split("/").pop() || fpStr);
              } else if (toolName === "Glob" || toolName === "Grep") {
                filesSearched.add(args.pattern || args.query || fpStr);
              }
            }
            if (toolName === "MultiEdit" && Array.isArray(args.edits)) {
              for (const e of args.edits) {
                const efp = e.file_path || e.filePath;
                if (efp) {
                  filesChanged.add(String(efp));
                  foundChangedPath = true;
                  toolEditDetails.push({
                    filePath: String(efp),
                    oldString: strOrUndef(e.old_string || e.oldString),
                    newString: strOrUndef(e.new_string || e.newString)
                  });
                }
              }
            }
          } catch {
          }
        }
        if (!foundChangedPath) {
          const directFp = getAttrStr(child, "file_path");
          if (directFp) {
            if (CLAUDE_WRITE_TOOLS.has(toolName)) {
              filesChanged.add(directFp);
              foundChangedPath = true;
            } else if (toolName === "Read") {
              filesRead.add(directFp.split("/").pop() || directFp);
            } else if (toolName === "Glob" || toolName === "Grep") {
              filesSearched.add(directFp);
            }
          }
        }
        if (isWriteTool && !foundChangedPath) {
          missingChangedFilePathCalls++;
        }
        const toolEntry = {
          type: "tool",
          spanId: child.spanId,
          label: toolName,
          durationMs: childDur || getAttrInt(child, "duration_ms"),
          toolInput: argsStr || void 0,
          isError,
          errorMessage: isError ? child.status?.message || void 0 : void 0,
          timestamp: ts,
          editDetails: toolEditDetails.length > 0 ? toolEditDetails : void 0
        };
        const blockedSpan = (childrenBySpanId[child.spanId] || []).find((c) => c.name === "claude_code.tool.blocked_on_user");
        if (!blockedSpan) {
          return [toolEntry];
        }
        const blockedStart = nanoToMs(blockedSpan.startTime);
        const userInputEntry = {
          type: "user_input",
          spanId: blockedSpan.spanId,
          label: "Permission prompt",
          durationMs: getAttrInt(blockedSpan, "duration_ms") || nanoToMs(blockedSpan.endTime) - blockedStart || 0,
          decision: getAttrStr(blockedSpan, "decision") || void 0,
          isError: false,
          timestamp: blockedStart > 0 ? new Date(blockedStart).toISOString() : ts
        };
        return [toolEntry, userInputEntry];
      }
    });
    const toolResultSpans = traceSpans.filter((s) => s.name === "claude_code.tool_result");
    for (const trs of toolResultSpans) {
      const trToolName = getAttrStr(trs, "tool.name") || getAttrStr(trs, "tool_name");
      const trArgsStr = getAttrStr(trs, "tool_input") || getAttrStr(trs, "input");
      if (!trToolName || !trArgsStr) {
        continue;
      }
      let fp = "";
      let multiEdits = [];
      try {
        const args = JSON.parse(trArgsStr);
        fp = String(args.file_path || args.filePath || "");
        if (trToolName === "MultiEdit" && Array.isArray(args.edits)) {
          multiEdits = args.edits;
        }
        if (!fp && trToolName !== "MultiEdit") {
        }
      } catch {
        fp = trArgsStr.trim();
      }
      if (fp) {
        if (CLAUDE_WRITE_TOOLS.has(trToolName)) {
          filesChanged.add(fp);
        } else if (trToolName === "Read") {
          filesRead.add(fp.split("/").pop() || fp);
        } else if (trToolName === "Glob" || trToolName === "Grep") {
          filesSearched.add(fp);
        }
      }
      for (const e of multiEdits) {
        const efp = e.file_path || e.filePath;
        if (efp) {
          filesChanged.add(String(efp));
        }
      }
    }
    const startMs = nanoToMs(interaction.startTime);
    const totalInput = inputTokens + cacheReadTokens + cacheCreateTokens;
    const cacheHitRate = totalInput > 0 ? cacheReadTokens / totalInput : 0;
    const durationMs = getAttrInt(interaction, "interaction.duration_ms") || nanoToMs(interaction.endTime) - startMs;
    const rawPrompt = getAttrStr(interaction, "user_prompt");
    const promptLength = getAttrInt(interaction, "user_prompt_length");
    const hasData = totalLlmCalls > 0 || inputTokens > 0 || timeline.length > 0;
    const userRequest = normalizeUserRequest(
      rawPrompt,
      promptLength,
      hasData ? "[prompt redacted]" : "[session in progress]",
      hasData ? "prompt redacted" : "session in progress"
    );
    const filesChangedNote = filesChanged.size === 0 && missingChangedFilePathCalls > 0 ? `Changed-file paths are unavailable for ${missingChangedFilePathCalls} write operation${missingChangedFilePathCalls !== 1 ? "s" : ""}. Claude Code redacts tool arguments by default. Add OTEL_LOG_TOOL_DETAILS=1 to your Claude environment variables (alongside CLAUDE_CODE_ENABLE_TELEMETRY=1) and restart to enable path tracking.` : void 0;
    return {
      sessionId: interaction.spanId,
      traceId: interaction.traceId || "",
      source: "claude_code",
      dataSource: "otel",
      initiator: interaction.parentSpanId || getAttrStr(interaction, "is_sidechain") === "true" ? "agent" : "user",
      userRequest,
      model,
      turns: totalLlmCalls,
      inputTokens: totalInput,
      outputTokens,
      cacheReadTokens,
      cacheCreateTokens,
      cacheHitRate,
      durationMs,
      startTime: startMs > 0 ? new Date(startMs).toISOString() : "",
      filesRead: Array.from(filesRead),
      filesSearched: Array.from(filesSearched),
      filesChanged: Array.from(filesChanged),
      filesChangedNote,
      toolCounts,
      totalToolCalls,
      totalLlmCalls,
      errors,
      outcome: "unknown",
      timeline,
      backgroundSpans: [],
      loopSignals: []
    };
  });
}

// src/summarizers/codex.ts
function buildCodexSessions(spans2) {
  const toMs = (s) => nanoToMs(s.startTime) || s.receivedAt || 0;
  const codexBySession = groupCodexSpansBySession(spans2);
  return Object.entries(codexBySession).map(([traceId, traceGroup]) => {
    const traceSpans = traceGroup.slice().sort((a, b) => toMs(a) - toMs(b));
    const promptSpan = traceSpans.find((s) => isCodexPromptSpanName(s.name));
    const rootSpan = promptSpan || traceSpans[0];
    let inputTokens = 0, outputTokens = 0, cacheReadTokens = 0, cacheCreateTokens = 0;
    let totalLlmCalls = 0, totalToolCalls = 0, errors = 0;
    let model = "";
    const toolCounts = {};
    const filesRead = /* @__PURE__ */ new Set();
    const filesSearched = /* @__PURE__ */ new Set();
    const filesChanged = /* @__PURE__ */ new Set();
    const toolNameByCallId = /* @__PURE__ */ new Map();
    const toolArgsByCallId = /* @__PURE__ */ new Map();
    const hasCodexCompletionEvents = traceSpans.some((s) => {
      if (s.name !== "codex.sse_event") {
        return false;
      }
      const { input, output } = extractCodexTokenCounts(s);
      return input > 0 || output > 0;
    });
    for (const s of traceSpans) {
      const callId = getFirstAttr(s, ["call_id"]);
      if (!callId) {
        continue;
      }
      if (isCodexToolDecisionSpan(s.name)) {
        const n = getFirstAttr(s, ["tool_name"]);
        if (n) {
          toolNameByCallId.set(callId, n);
        }
      } else if (isCodexToolCallSpan(s.name)) {
        const a = getFirstAttr(s, ["arguments"]);
        if (a) {
          toolArgsByCallId.set(callId, a);
        }
      }
    }
    let lastTtftMs = 0;
    const timeline = [];
    const backgroundSpans = [];
    for (const child of traceSpans) {
      if (promptSpan && child.spanId === promptSpan.spanId) {
        continue;
      }
      if (child.name === "codex.websocket_event") {
        continue;
      }
      const childStart = nanoToMs(child.startTime);
      const childEnd = nanoToMs(child.endTime);
      const childDur = childEnd - childStart || getAttrInt(child, "codex.api.duration_ms") || getAttrInt(child, "codex.duration_ms") || getAttrInt(child, "duration_ms");
      const isError = child.status?.code === 2 || getFirstAttr(child, ["codex.api.success"]) === "false" || getFirstAttr(child, ["codex.tool.success"]) === "false" || getFirstAttr(child, ["success"]) === "false";
      if (isError) {
        errors++;
      }
      const ts = childStart > 0 ? new Date(childStart).toISOString() : "";
      const childModel = getFirstAttr(child, ["gen_ai.request.model", "gen_ai.response.model", "model"]);
      if (childModel) {
        model = childModel;
      }
      const { input: inTok, output: outTok, cacheRead, cacheCreate } = extractCodexTokenCounts(child);
      if (hasCodexCompletionEvents && isDuplicateCodexTokenRecord(child)) {
        continue;
      }
      if (isCodexToolExecSpan(child)) {
        const callId = getFirstAttr(child, ["call_id"]);
        if (isCodexToolDecisionSpan(child.name)) {
          if (inTok > 0 || outTok > 0) {
            totalLlmCalls++;
            inputTokens += inTok;
            outputTokens += outTok;
            cacheReadTokens += cacheRead;
            cacheCreateTokens += cacheCreate;
          }
          continue;
        }
        if (isCodexToolCallSpan(child.name) && callId && toolNameByCallId.has(callId)) {
          continue;
        }
        totalToolCalls++;
        const toolName = callId && toolNameByCallId.get(callId) || getFirstAttr(child, ["tool_name", "codex.tool.name", "gen_ai.tool.name"]) || "tool";
        toolCounts[toolName] = (toolCounts[toolName] || 0) + 1;
        const argsStr = callId && toolArgsByCallId.get(callId) || getFirstAttr(child, ["gen_ai.tool.call.arguments", "tool_input", "input", "arguments"]);
        const dur = (isCodexToolResultSpan(child.name) ? getAttrInt(child, "duration_ms") : 0) || getAttrInt(child, "codex.tool.duration_ms") || childDur;
        const resultText = isCodexToolResultSpan(child.name) ? getFirstAttr(child, ["output", "result", "tool_result", "content", "stdout", "stderr"]) : "";
        let foundFilePath = false;
        let cmdFromArgs;
        if (argsStr) {
          try {
            const args = JSON.parse(argsStr);
            const fp = args.filePath || args.file_path || args.path;
            if (fp) {
              foundFilePath = true;
              if (toolName === "read_file" || toolName === "Read") {
                filesRead.add(String(fp).split("/").pop() || String(fp));
              } else if (toolName === "grep_search" || toolName === "file_search" || toolName === "Glob" || toolName === "Grep") {
                filesSearched.add(String(args.query || args.pattern || fp));
              } else {
                filesChanged.add(String(fp));
              }
            }
            if (!foundFilePath && (args.command || args.cmd)) {
              cmdFromArgs = String(args.command || args.cmd);
            }
          } catch {
          }
        }
        if (!foundFilePath) {
          const cmd = cmdFromArgs || getFirstAttr(child, ["cmd", "command", "codex.tool.cmd", "codex.tool.command", "shell_command"]);
          if (cmd) {
            const fileRe = /(?:^|[\s'"<>`|])([./~]?(?:[\w.-]+\/)+[\w.-]+\.(?:ts|tsx|js|jsx|mjs|cjs|py|go|rs|rb|java|kt|swift|cpp|c|h|cs|php|html|css|scss|json|yaml|yml|toml|md|txt|sh|env))\b/g;
            let m;
            while ((m = fileRe.exec(cmd)) !== null) {
              const p = m[1].replace(/['"]/g, "");
              if (p.length > 2 && !p.includes("*")) {
                filesChanged.add(p);
              }
            }
          }
        }
        timeline.push({
          type: "tool",
          spanId: child.spanId,
          label: toolName,
          durationMs: dur,
          toolInput: argsStr || void 0,
          isError,
          errorMessage: isError ? child.status?.message || getFirstAttr(child, ["error.message"]) || void 0 : void 0,
          resultSummary: resultText ? summarizeToolResult(toolName, resultText) : void 0,
          fullResult: resultText || void 0,
          timestamp: ts
        });
      } else if (isCodexTimelineLlmSpan(child, inTok, outTok)) {
        totalLlmCalls++;
        inputTokens += inTok;
        outputTokens += outTok;
        cacheReadTokens += cacheRead;
        cacheCreateTokens += cacheCreate;
        const ttftMs = getAttrInt(child, "ttft_ms") || getAttrInt(child, "codex.ttft_ms") || lastTtftMs || 0;
        lastTtftMs = 0;
        timeline.push({
          type: "llm",
          spanId: child.spanId,
          label: childModel || model || "Codex",
          model: childModel || model,
          inputTokens: inTok,
          outputTokens: outTok,
          ttft: ttftMs || void 0,
          action: getFirstAttr(child, ["codex.event.type", "event.kind", "stop_reason"]) || void 0,
          responseText: getFirstAttr(child, ["output_text", "assistant_response"]) || void 0,
          durationMs: childDur,
          isError,
          errorMessage: isError ? child.status?.message || void 0 : void 0,
          timestamp: ts
        });
      } else {
        if (child.name === "codex.turn_ttft") {
          const ttft = getAttrInt(child, "duration_ms") || childDur;
          if (ttft > 0) {
            lastTtftMs = ttft;
          }
        }
        backgroundSpans.push({
          name: child.name,
          model: childModel || model,
          purpose: child.name,
          inputTokens: inTok,
          outputTokens: outTok
        });
      }
    }
    const conversationId = traceSpans.map((s) => getFirstAttr(s, ["conversation.id", "conversation_id", "codex.conversation.id"])).find((v) => v && v.length > 10);
    const startMs = rootSpan ? nanoToMs(rootSpan.startTime) || rootSpan.receivedAt || 0 : traceSpans[0]?.receivedAt ?? 0;
    const userPromptText = promptSpan ? getFirstAttr(promptSpan, [
      "user_prompt",
      "prompt",
      "codex.user_prompt",
      "codex.prompt",
      "message",
      "content",
      "text",
      "user_message",
      "input",
      "codex.user_message",
      "codex.input"
    ]) : "";
    const promptLength = promptSpan ? getAttrInt(promptSpan, "user_prompt.length") || getAttrInt(promptSpan, "user_prompt_length") || getAttrInt(promptSpan, "prompt_length") : 0;
    const userRequest = normalizeUserRequest(
      userPromptText,
      promptLength,
      promptSpan ? "[prompt unavailable]" : "[session in progress]"
    );
    const lastLlmEntry = [...timeline].reverse().find((e) => e.type === "llm");
    const outcome = lastLlmEntry?.action?.includes("fail") || lastLlmEntry?.action?.includes("cancel") ? "unknown" : lastLlmEntry ? "text_response" : "unknown";
    const totalInput = inputTokens;
    const cacheHitRate = totalInput > 0 ? cacheReadTokens / totalInput : 0;
    const allEndTimes = traceSpans.map((s) => nanoToMs(s.endTime) || s.receivedAt || 0).filter((t) => t > 0);
    const endMs = allEndTimes.length > 0 ? Math.max(...allEndTimes) : startMs;
    const durationMs = endMs - startMs;
    return {
      sessionId: promptSpan?.spanId || `codex-${traceId}`,
      traceId,
      source: "codex",
      dataSource: "otel",
      conversationId: conversationId || void 0,
      userRequest,
      model,
      turns: totalLlmCalls,
      inputTokens: totalInput,
      outputTokens,
      cacheReadTokens,
      cacheCreateTokens,
      cacheHitRate,
      durationMs,
      startTime: startMs > 0 ? new Date(startMs).toISOString() : "",
      filesRead: Array.from(filesRead),
      filesSearched: Array.from(filesSearched),
      filesChanged: Array.from(filesChanged),
      toolCounts,
      totalToolCalls,
      totalLlmCalls,
      errors,
      outcome,
      timeline,
      backgroundSpans,
      loopSignals: []
    };
  });
}
function extractCodexTokenCounts(span) {
  const input = getAttrInt(span, "gen_ai.usage.input_tokens") || getAttrInt(span, "input_token_count") || getAttrInt(span, "input_tokens") || getAttrInt(span, "prompt_tokens") || getAttrInt(span, "codex.turn.token_usage.input_tokens");
  const cacheRead = getAttrInt(span, "gen_ai.usage.cache_read.input_tokens") || getAttrInt(span, "cached_token_count") || getAttrInt(span, "cache_read_tokens") || getAttrInt(span, "codex.turn.token_usage.cached_input_tokens");
  const cacheCreate = getAttrInt(span, "gen_ai.usage.cache_creation.input_tokens") || getAttrInt(span, "cache_creation_tokens");
  const reasoning = getAttrInt(span, "reasoning_token_count") || getAttrInt(span, "codex.usage.reasoning_output_tokens") || getAttrInt(span, "codex.turn.token_usage.reasoning_output_tokens");
  const outputBase = getAttrInt(span, "gen_ai.usage.output_tokens") || getAttrInt(span, "output_token_count") || getAttrInt(span, "output_tokens") || getAttrInt(span, "completion_tokens") || getAttrInt(span, "codex.turn.token_usage.output_tokens");
  return { input, output: outputBase + reasoning, cacheRead, cacheCreate };
}
function isDuplicateCodexTokenRecord(span) {
  return span.name === "handle_responses" || span.name === "session_task.turn" || getFirstAttr(span, ["otel.name"]) === "session_task.turn";
}
function isCodexTimelineLlmSpan(span, inputTokens, outputTokens) {
  if (inputTokens > 0 || outputTokens > 0) {
    return true;
  }
  if (!isCodexLlmSpanName(span.name)) {
    return false;
  }
  if (span.name === "codex.sse_event") {
    const kind = getFirstAttr(span, ["event.kind", "codex.event.kind", "codex.event.type"]).toLowerCase();
    if (!kind) {
      return true;
    }
    return kind === "response.completed" || kind === "response.failed" || kind === "response.cancelled" || kind === "response.incomplete";
  }
  return span.name === "codex.completion" || span.name === "codex.response" || span.name === "codex.stream_event";
}
function groupCodexSpansBySession(spans2) {
  const groups = /* @__PURE__ */ new Map();
  const currentByConversation = /* @__PURE__ */ new Map();
  const ordinalByConversation = /* @__PURE__ */ new Map();
  const turnSessionByRawTraceId = /* @__PURE__ */ new Map();
  let activePromptGroup;
  const toMs = (s) => nanoToMs(s.startTime) || s.receivedAt || 0;
  for (const span of spans2) {
    if (!span.traceId) {
      continue;
    }
    const explicitSessionId = getFirstAttr(span, ["codex.session.id"]);
    const rawOtelTraceId = getFirstAttr(span, ["otel.trace_id"]);
    if (explicitSessionId && rawOtelTraceId) {
      turnSessionByRawTraceId.set(rawOtelTraceId, explicitSessionId);
    }
    const conversationId = getFirstAttr(span, [
      "conversation.id",
      "conversation_id",
      "codex.conversation.id",
      "thread.id",
      "thread_id",
      "session.id",
      "session_id"
    ]);
    const turnId = getFirstAttr(span, ["turn.id", "turn_id", "codex.turn.id"]);
    if (conversationId && turnId) {
      turnSessionByRawTraceId.set(span.traceId, getFirstAttr(span, ["codex.session.id"]) || `codex:${conversationId}:${turnId}`);
    }
  }
  function createGroup(key) {
    const group = { key, spans: [], hasPrompt: false };
    groups.set(key, group);
    return group;
  }
  function getGroup(key) {
    return groups.get(key) ?? createGroup(key);
  }
  function nextPromptKey(conversationId) {
    const next = (ordinalByConversation.get(conversationId) ?? 0) + 1;
    ordinalByConversation.set(conversationId, next);
    return `codex:${conversationId}:prompt-${next}`;
  }
  const codexSpans = spans2.filter((span) => isCodexSpan(span) || span.traceId && turnSessionByRawTraceId.has(span.traceId)).sort((a, b) => toMs(a) - toMs(b));
  for (const span of codexSpans) {
    const conversationId = getFirstAttr(span, [
      "conversation.id",
      "conversation_id",
      "codex.conversation.id",
      "thread.id",
      "thread_id",
      "session.id",
      "session_id"
    ]);
    const explicitSessionId = getFirstAttr(span, ["codex.session.id"]);
    const turnId = getFirstAttr(span, ["turn.id", "turn_id", "codex.turn.id"]);
    const isPrompt = isCodexPromptSpanName(span.name);
    const turnSessionId = (span.traceId ? turnSessionByRawTraceId.get(span.traceId) : void 0) || (conversationId && turnId ? explicitSessionId || `codex:${conversationId}:${turnId}` : void 0);
    let group;
    if (isPrompt) {
      const current = conversationId ? currentByConversation.get(conversationId) : void 0;
      if (turnSessionId && groups.has(turnSessionId)) {
        group = getGroup(turnSessionId);
      } else if (current && !current.hasPrompt) {
        group = current;
      }
      if (!group) {
        const fallbackConversation = conversationId || span.traceId || "unknown";
        const baseKey = explicitSessionId || turnSessionId || nextPromptKey(fallbackConversation);
        group = getGroup(baseKey);
        if (group.hasPrompt) {
          group = createGroup(nextPromptKey(fallbackConversation));
        }
      }
      group.hasPrompt = true;
      if (conversationId) {
        currentByConversation.set(conversationId, group);
      }
    } else if (activePromptGroup) {
      group = activePromptGroup;
      if (conversationId) {
        currentByConversation.set(conversationId, group);
      }
    } else if (turnSessionId) {
      group = getGroup(turnSessionId);
      if (conversationId) {
        currentByConversation.set(conversationId, group);
      }
    } else if (conversationId) {
      group = currentByConversation.get(conversationId);
    }
    if (!group) {
      continue;
    }
    group.spans.push(span);
    if (isPrompt) {
      activePromptGroup = group;
    }
  }
  const result = {};
  for (const group of groups.values()) {
    result[group.key] = group.spans;
  }
  return result;
}
function isCodexSpan(span) {
  if (span.name.startsWith("codex.")) {
    return true;
  }
  if (getFirstAttr(span, ["codex.session.id"])) {
    return true;
  }
  return Boolean(getFirstAttr(span, ["thread.id", "thread_id"]) && getFirstAttr(span, ["turn.id", "turn_id", "codex.turn.id"]));
}

// src/spanSummarizer.ts
function summarizeSpans(spans2) {
  if (!Array.isArray(spans2) || spans2.length === 0) {
    return {
      sessions: [],
      backgroundSpans: [],
      efficiency: {
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalLlmCalls: 0,
        avgInputPerCall: 0,
        avgTtft: 0,
        cacheHitRate: 0,
        toolDefWaste: 0,
        sysInstructionWaste: 0,
        topTokenConsumers: []
      }
    };
  }
  const childrenOf = {};
  const invokeAgentSpans = [];
  const claudeInteractionSpans = [];
  const orphanSpans = [];
  const spansByTraceId = {};
  for (const s of spans2) {
    if (s.name.startsWith("invoke_agent")) {
      invokeAgentSpans.push(s);
    } else if (s.name === "claude_code.interaction") {
      claudeInteractionSpans.push(s);
    }
    if (s.parentSpanId) {
      if (!childrenOf[s.parentSpanId]) {
        childrenOf[s.parentSpanId] = [];
      }
      childrenOf[s.parentSpanId].push(s);
    } else if (!s.name.startsWith("invoke_agent") && s.name !== "claude_code.interaction") {
      orphanSpans.push(s);
    }
    if (s.traceId) {
      if (!spansByTraceId[s.traceId]) {
        spansByTraceId[s.traceId] = [];
      }
      spansByTraceId[s.traceId].push(s);
    }
  }
  const existingInteractionTraceIds = new Set(claudeInteractionSpans.map((s) => s.traceId).filter(Boolean));
  for (const [traceId, traceSpans] of Object.entries(spansByTraceId)) {
    if (existingInteractionTraceIds.has(traceId)) {
      continue;
    }
    const hasClaudeSpans = traceSpans.some((s) => s.name === "claude_code.llm_request" || s.name === "claude_code.tool");
    if (!hasClaudeSpans) {
      continue;
    }
    const sorted = traceSpans.slice().sort((a, b) => (a.startTime ?? "0") < (b.startTime ?? "0") ? -1 : 1);
    claudeInteractionSpans.push({
      traceId,
      spanId: `synth-${traceId.slice(0, 12)}`,
      name: "claude_code.interaction",
      startTime: sorted[0].startTime,
      endTime: sorted[sorted.length - 1].endTime,
      attributes: []
    });
  }
  const allSpanIds = new Set(spans2.map((s) => s.spanId).filter(Boolean));
  const existingInvokeTraceIds = new Set(invokeAgentSpans.map((s) => s.traceId).filter(Boolean));
  const existingInvokeSpanIds = new Set(invokeAgentSpans.map((s) => s.spanId).filter(Boolean));
  const orphanParentChildren = {};
  for (const s of spans2) {
    if (!s.parentSpanId || allSpanIds.has(s.parentSpanId)) {
      continue;
    }
    if (!s.name.startsWith("chat") && !s.name.startsWith("execute_tool")) {
      continue;
    }
    if (s.traceId && existingInvokeTraceIds.has(s.traceId)) {
      continue;
    }
    if (!orphanParentChildren[s.parentSpanId]) {
      orphanParentChildren[s.parentSpanId] = [];
    }
    orphanParentChildren[s.parentSpanId].push(s);
  }
  for (const [parentId, children] of Object.entries(orphanParentChildren)) {
    if (existingInvokeSpanIds.has(parentId)) {
      continue;
    }
    const sorted = children.slice().sort((a, b) => (a.startTime ?? "0") < (b.startTime ?? "0") ? -1 : 1);
    const traceId = sorted[0].traceId || "";
    let totalInput = 0, totalOutput = 0, totalCacheRead2 = 0, totalCacheCreate = 0, model = "";
    for (const c of children) {
      if (!c.name.startsWith("chat")) {
        continue;
      }
      totalInput += getAttrInt(c, "gen_ai.usage.input_tokens");
      totalOutput += getAttrInt(c, "gen_ai.usage.output_tokens");
      totalCacheRead2 += getAttrInt(c, "gen_ai.usage.cache_read.input_tokens");
      totalCacheCreate += getAttrInt(c, "gen_ai.usage.cache_creation.input_tokens");
      const m = getAttrStr(c, "gen_ai.request.model");
      if (m) {
        model = m;
      }
    }
    invokeAgentSpans.push({
      traceId,
      spanId: parentId,
      name: "invoke_agent",
      startTime: sorted[0].startTime,
      endTime: sorted[sorted.length - 1].endTime,
      attributes: [
        { key: "copilot_chat.user_request", value: { stringValue: "[session in progress]" } },
        { key: "gen_ai.usage.input_tokens", value: { intValue: totalInput } },
        { key: "gen_ai.usage.output_tokens", value: { intValue: totalOutput } },
        { key: "gen_ai.usage.cache_read.input_tokens", value: { intValue: totalCacheRead2 } },
        { key: "gen_ai.usage.cache_creation.input_tokens", value: { intValue: totalCacheCreate } },
        { key: "gen_ai.request.model", value: { stringValue: model } }
      ]
    });
  }
  const allSorted = [
    ...buildCopilotSessions(invokeAgentSpans, childrenOf),
    ...buildClaudeSessions(claudeInteractionSpans, spansByTraceId),
    ...buildCodexSessions(spans2)
  ].sort((a, b) => timestampToMs(a.startTime) - timestampToMs(b.startTime));
  const sessions = allSorted;
  sessions.forEach((s) => {
    s.loopSignals = detectLoopSignals(s);
  });
  const bgByTraceId = {};
  const backgroundSpans = orphanSpans.filter((s) => !s.name.startsWith("codex.")).map((s) => {
    const agentName = getAttrStr(s, "gen_ai.agent.name");
    const model = getAttrStr(s, "gen_ai.request.model");
    const inTok = getAttrInt(s, "gen_ai.usage.input_tokens");
    const outTok = getAttrInt(s, "gen_ai.usage.output_tokens");
    let purpose = agentName || s.name;
    if (agentName === "title") {
      purpose = "Generate chat title";
    }
    if (agentName === "progressMessages") {
      purpose = "Generate progress messages";
    }
    if (purpose === "copilotLanguageModelWrapper" || s.name === "copilotLanguageModelWrapper") {
      purpose = "Extension language model call";
    }
    const bg = { name: s.name, model, purpose, inputTokens: inTok, outputTokens: outTok };
    const tid = s.traceId || "";
    if (tid) {
      if (!bgByTraceId[tid]) {
        bgByTraceId[tid] = [];
      }
      bgByTraceId[tid].push(bg);
    }
    return bg;
  });
  const sessionOwnedBackgroundSpans = sessions.flatMap((s) => s.backgroundSpans ?? []);
  for (const sess of sessions) {
    if (sess.traceId && bgByTraceId[sess.traceId]) {
      sess.backgroundSpans = [...sess.backgroundSpans ?? [], ...bgByTraceId[sess.traceId]];
    }
  }
  let ttftSum = 0, ttftCount = 0;
  let toolDefSize = 0, sysInstructionSize = 0;
  for (const s of spans2) {
    const isCopilotLlm = s.name.startsWith("chat");
    const isClaudeLlm = s.name === "claude_code.llm_request";
    const codexInput = getAttrInt(s, "gen_ai.usage.input_tokens") + getAttrInt(s, "gen_ai.usage.cache_read.input_tokens") + getAttrInt(s, "gen_ai.usage.cache_creation.input_tokens") + getAttrInt(s, "input_tokens") + getAttrInt(s, "prompt_tokens") + getAttrInt(s, "cache_read_tokens") + getAttrInt(s, "cache_creation_tokens");
    const codexOutput = getAttrInt(s, "gen_ai.usage.output_tokens") + getAttrInt(s, "output_tokens") + getAttrInt(s, "completion_tokens");
    const isCodexLlm = s.name.startsWith("codex.") && (isCodexLlmSpanName(s.name) || codexInput > 0 || codexOutput > 0);
    if (isCopilotLlm || isClaudeLlm || isCodexLlm || s.name.startsWith("invoke_agent")) {
      if (isCodexLlm) {
      } else if (isCopilotLlm) {
        const inTok = getAttrInt(s, "gen_ai.usage.input_tokens");
        const outTok = getAttrInt(s, "gen_ai.usage.output_tokens");
        if (inTok > 0 || outTok > 0) {
          const ttft = getAttrInt(s, "copilot_chat.time_to_first_token");
          if (ttft > 0) {
            ttftSum += ttft;
            ttftCount++;
          }
        }
      } else if (isClaudeLlm) {
        const inTok = getAttrInt(s, "input_tokens") + getAttrInt(s, "cache_read_tokens") + getAttrInt(s, "cache_creation_tokens");
        const outTok = getAttrInt(s, "output_tokens");
        if (inTok > 0 || outTok > 0) {
          const ttft = getAttrInt(s, "ttft_ms");
          if (ttft > 0) {
            ttftSum += ttft;
            ttftCount++;
          }
        }
      }
      const toolDefs = getAttrStr(s, "gen_ai.tool.definitions");
      if (toolDefs.length > 0) {
        toolDefSize += toolDefs.length;
      }
      const sysInstr = getAttrStr(s, "gen_ai.system_instructions");
      if (sysInstr.length > 0) {
        sysInstructionSize += sysInstr.length;
      }
    }
  }
  const totalChars = spans2.reduce((sum, s) => sum + s.attributes.reduce((a, attr) => a + (attr.value?.stringValue?.length || 0), 0), 0);
  const totalCacheRead = sessions.reduce((s, sess) => s + sess.cacheReadTokens, 0);
  const sessionTotalInput = sessions.reduce((s, sess) => s + sess.inputTokens, 0);
  const sessionTotalOutput = sessions.reduce((s, sess) => s + sess.outputTokens, 0);
  const sessionTotalLlm = sessions.reduce((s, sess) => s + sess.totalLlmCalls, 0);
  return {
    sessions,
    backgroundSpans: [...backgroundSpans, ...sessionOwnedBackgroundSpans],
    efficiency: {
      totalInputTokens: sessionTotalInput,
      totalOutputTokens: sessionTotalOutput,
      totalLlmCalls: sessionTotalLlm,
      avgInputPerCall: sessionTotalLlm > 0 ? Math.round(sessionTotalInput / sessionTotalLlm) : 0,
      avgTtft: ttftCount > 0 ? Math.round(ttftSum / ttftCount) : 0,
      cacheHitRate: sessionTotalInput > 0 ? totalCacheRead / sessionTotalInput : 0,
      toolDefWaste: totalChars > 0 ? toolDefSize / totalChars : 0,
      sysInstructionWaste: totalChars > 0 ? sysInstructionSize / totalChars : 0,
      topTokenConsumers: sessions.map((s) => ({ label: s.userRequest.slice(0, 50), tokens: s.inputTokens + s.outputTokens })).sort((a, b) => b.tokens - a.tokens).slice(0, 5)
    }
  };
}

// src/pricing.ts
var RATES = {
  // ── OpenAI ─────────────────────────────────────────────────────────────────
  "gpt-4.1": { inputPerMTok: 0, cacheReadPerMTok: 0, cacheWritePerMTok: 0, outputPerMTok: 0, contextWindowTokens: 1e6 },
  "gpt-5-mini": { inputPerMTok: 0, cacheReadPerMTok: 0, cacheWritePerMTok: 0, outputPerMTok: 0, contextWindowTokens: 2e5 },
  "gpt-5 mini": { inputPerMTok: 0, cacheReadPerMTok: 0, cacheWritePerMTok: 0, outputPerMTok: 0, contextWindowTokens: 2e5 },
  "gpt-4o": { inputPerMTok: 2.5, cacheReadPerMTok: 1.25, cacheWritePerMTok: 0, outputPerMTok: 10, contextWindowTokens: 128e3 },
  "gpt-4o-mini": { inputPerMTok: 0.15, cacheReadPerMTok: 0.075, cacheWritePerMTok: 0, outputPerMTok: 0.6, contextWindowTokens: 128e3 },
  "gpt-5.1": { inputPerMTok: 1.75, cacheReadPerMTok: 0.175, cacheWritePerMTok: 0, outputPerMTok: 14, contextWindowTokens: 256e3 },
  "gpt-5.1-codex": { inputPerMTok: 1.75, cacheReadPerMTok: 0.175, cacheWritePerMTok: 0, outputPerMTok: 14, contextWindowTokens: 256e3 },
  "gpt-5.1-codex-mini": { inputPerMTok: 0.75, cacheReadPerMTok: 0.075, cacheWritePerMTok: 0, outputPerMTok: 4.5, contextWindowTokens: 256e3 },
  "gpt-5.1-codex-max": { inputPerMTok: 1.75, cacheReadPerMTok: 0.175, cacheWritePerMTok: 0, outputPerMTok: 14, contextWindowTokens: 256e3 },
  "gpt-5.2": { inputPerMTok: 1.75, cacheReadPerMTok: 0.175, cacheWritePerMTok: 0, outputPerMTok: 14, contextWindowTokens: 256e3 },
  "gpt-5.2-codex": { inputPerMTok: 1.75, cacheReadPerMTok: 0.175, cacheWritePerMTok: 0, outputPerMTok: 14, contextWindowTokens: 256e3 },
  "gpt-5.3-codex": { inputPerMTok: 1.75, cacheReadPerMTok: 0.175, cacheWritePerMTok: 0, outputPerMTok: 14, contextWindowTokens: 256e3 },
  "gpt-5.4": { inputPerMTok: 2.5, cacheReadPerMTok: 0.25, cacheWritePerMTok: 0, outputPerMTok: 15, contextWindowTokens: 272e3 },
  "gpt-5.4-mini": { inputPerMTok: 0.75, cacheReadPerMTok: 0.075, cacheWritePerMTok: 0, outputPerMTok: 4.5, contextWindowTokens: 2e5 },
  "gpt-5.4-nano": { inputPerMTok: 0.2, cacheReadPerMTok: 0.02, cacheWritePerMTok: 0, outputPerMTok: 1.25, contextWindowTokens: 128e3 },
  "gpt-5.5": { inputPerMTok: 5, cacheReadPerMTok: 0.5, cacheWritePerMTok: 0, outputPerMTok: 30, contextWindowTokens: 256e3 },
  // ── Codex-only ─────────────────────────────────────────────────────────────
  "codex-mini-latest": { inputPerMTok: 1.5, cacheReadPerMTok: 0.375, cacheWritePerMTok: 0, outputPerMTok: 6, contextWindowTokens: 2e5 },
  // ── Anthropic ──────────────────────────────────────────────────────────────
  "claude-opus-4": { inputPerMTok: 15, cacheReadPerMTok: 1.5, cacheWritePerMTok: 18.75, outputPerMTok: 75, contextWindowTokens: 2e5 },
  "claude-opus-4-1": { inputPerMTok: 15, cacheReadPerMTok: 1.5, cacheWritePerMTok: 18.75, outputPerMTok: 75, contextWindowTokens: 2e5 },
  "claude-haiku-3-5": { inputPerMTok: 0.8, cacheReadPerMTok: 0.08, cacheWritePerMTok: 1, outputPerMTok: 4, contextWindowTokens: 2e5 },
  "claude-haiku-4-5": { inputPerMTok: 1, cacheReadPerMTok: 0.1, cacheWritePerMTok: 1.25, outputPerMTok: 5, contextWindowTokens: 2e5 },
  "claude-sonnet-4": { inputPerMTok: 3, cacheReadPerMTok: 0.3, cacheWritePerMTok: 3.75, outputPerMTok: 15, contextWindowTokens: 2e5 },
  "claude-sonnet-4-5": { inputPerMTok: 3, cacheReadPerMTok: 0.3, cacheWritePerMTok: 3.75, outputPerMTok: 15, contextWindowTokens: 2e5 },
  "claude-sonnet-4-6": { inputPerMTok: 3, cacheReadPerMTok: 0.3, cacheWritePerMTok: 3.75, outputPerMTok: 15, contextWindowTokens: 2e5 },
  "claude-opus-4-5": { inputPerMTok: 5, cacheReadPerMTok: 0.5, cacheWritePerMTok: 6.25, outputPerMTok: 25, contextWindowTokens: 2e5 },
  "claude-opus-4-6": { inputPerMTok: 5, cacheReadPerMTok: 0.5, cacheWritePerMTok: 6.25, outputPerMTok: 25, contextWindowTokens: 2e5 },
  "claude-opus-4-7": { inputPerMTok: 5, cacheReadPerMTok: 0.5, cacheWritePerMTok: 6.25, outputPerMTok: 25, contextWindowTokens: 2e5 },
  "claude-opus-4-6-fast": { inputPerMTok: 30, cacheReadPerMTok: 3, cacheWritePerMTok: 37.5, outputPerMTok: 150, contextWindowTokens: 2e5 },
  "claude-opus-4-7-fast": { inputPerMTok: 30, cacheReadPerMTok: 3, cacheWritePerMTok: 37.5, outputPerMTok: 150, contextWindowTokens: 2e5 },
  // ── Google ─────────────────────────────────────────────────────────────────
  "gemini-2.5-pro": { inputPerMTok: 1.25, cacheReadPerMTok: 0.125, cacheWritePerMTok: 0, outputPerMTok: 10, contextWindowTokens: 1e6 },
  "gemini-3-flash": { inputPerMTok: 0.5, cacheReadPerMTok: 0.05, cacheWritePerMTok: 0, outputPerMTok: 3, contextWindowTokens: 1e6 },
  "gemini-3-pro": { inputPerMTok: 2, cacheReadPerMTok: 0.2, cacheWritePerMTok: 0, outputPerMTok: 12, contextWindowTokens: 1e6 },
  "gemini-3.1-pro": { inputPerMTok: 2, cacheReadPerMTok: 0.2, cacheWritePerMTok: 0, outputPerMTok: 12, contextWindowTokens: 1e6 },
  "gemini-3.5-flash": { inputPerMTok: 1.5, cacheReadPerMTok: 0.15, cacheWritePerMTok: 0, outputPerMTok: 9, contextWindowTokens: 1e6 },
  // ── Fine-tuned ─────────────────────────────────────────────────────────────
  "raptor-mini": { inputPerMTok: 0, cacheReadPerMTok: 0, cacheWritePerMTok: 0, outputPerMTok: 0, contextWindowTokens: 0 },
  "goldeneye": { inputPerMTok: 1.25, cacheReadPerMTok: 0.125, cacheWritePerMTok: 0, outputPerMTok: 10, contextWindowTokens: 0 }
};
function normalizeModelId(modelId) {
  return modelId.toLowerCase().replace(/-\d{4}-\d{2}-\d{2}$/, "").replace(/-\d{8}$/, "").trim();
}
function lookupRates(modelId) {
  if (!modelId) return null;
  const normalized = normalizeModelId(modelId);
  if (RATES[normalized]) return RATES[normalized];
  for (const key of Object.keys(RATES)) {
    if (normalized.startsWith(key) || key.startsWith(normalized)) return RATES[key];
  }
  return null;
}
function calcTokenCostUsd(inputTokens, cacheReadTokens, cacheWriteTokens, outputTokens, modelId) {
  const rates = lookupRates(modelId);
  if (!rates) return 0;
  return inputTokens / 1e6 * rates.inputPerMTok + cacheReadTokens / 1e6 * rates.cacheReadPerMTok + cacheWriteTokens / 1e6 * rates.cacheWritePerMTok + outputTokens / 1e6 * rates.outputPerMTok;
}

// src/autoConfigNode.ts
var path = __toESM(require("path"));
var os = __toESM(require("os"));
var fs = __toESM(require("fs/promises"));
async function autoConfigureCodex(port) {
  const codexHome = process.env.CODEX_HOME || path.join(os.homedir(), ".codex");
  const configPath = path.join(codexHome, "config.toml");
  const endpoint = `http://localhost:${port}`;
  const requiredOtelKeys = [
    { prefix: "log_user_prompt", line: "log_user_prompt = true" },
    { prefix: "exporter", line: `exporter = { otlp-http = { endpoint = "${endpoint}", protocol = "json" } }` },
    { prefix: "trace_exporter", line: `trace_exporter = { otlp-http = { endpoint = "${endpoint}", protocol = "json" } }` }
  ];
  try {
    let content = "";
    try {
      content = await fs.readFile(configPath, "utf-8");
    } catch {
      await fs.mkdir(codexHome, { recursive: true });
      const block = requiredOtelKeys.map((k) => k.line).join("\n");
      await fs.writeFile(configPath, `[otel]
${block}
`, "utf-8");
      return { changed: true };
    }
    if (requiredOtelKeys.every((k) => content.includes(k.line))) {
      return { changed: false };
    }
    const lines = content.split("\n");
    const otelIdx = lines.findIndex((l) => l.trim() === "[otel]");
    if (otelIdx === -1) {
      const block = requiredOtelKeys.map((k) => k.line).join("\n");
      const newContent = content.trimEnd() + `

[otel]
${block}
`;
      await fs.writeFile(configPath, newContent, "utf-8");
      return { changed: true };
    }
    let sectionEnd = lines.length;
    for (let i = otelIdx + 1; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (trimmed.startsWith("[") && !trimmed.startsWith("#")) {
        sectionEnd = i;
        break;
      }
    }
    for (const { prefix, line } of [...requiredOtelKeys].reverse()) {
      const existing = lines.findIndex(
        (l, i) => i > otelIdx && i < sectionEnd && l.trim().startsWith(prefix)
      );
      if (existing !== -1) {
        if (lines[existing] !== line) {
          lines[existing] = line;
        }
      } else {
        lines.splice(otelIdx + 1, 0, line);
        sectionEnd++;
      }
    }
    await fs.writeFile(configPath, lines.join("\n"), "utf-8");
    return { changed: true };
  } catch (e) {
    return { changed: false, error: String(e) };
  }
}
var AGENTLENS_HOOK_MARKER = ".agentlens/pending-prompt.txt";
var AGENTLENS_HOOK_COMMAND = 'f=$HOME/.agentlens/pending-prompt.txt; [ -f "$f" ] && cat "$f" && rm "$f"';
async function autoConfigureClaudeCode(port) {
  const settingsPath = path.join(os.homedir(), ".claude", "settings.json");
  const requiredEnv = {
    CLAUDE_CODE_ENABLE_TELEMETRY: "1",
    CLAUDE_CODE_ENHANCED_TELEMETRY_BETA: "1",
    OTEL_TRACES_EXPORTER: "otlp",
    OTEL_EXPORTER_OTLP_PROTOCOL: "http/json",
    OTEL_EXPORTER_OTLP_ENDPOINT: `http://localhost:${port}`,
    OTEL_LOG_TOOL_DETAILS: "1",
    OTEL_LOG_TOOL_CONTENT: "1",
    OTEL_LOG_USER_PROMPTS: "1"
  };
  const staleKeys = [
    "OTEL_EXPORTER_OTLP_TRACES_PROTOCOL",
    "OTEL_EXPORTER_OTLP_TRACES_ENDPOINT",
    "OTEL_SEMCONV_STABILITY_OPT_IN",
    "OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT"
  ];
  try {
    let settings = {};
    try {
      const raw = await fs.readFile(settingsPath, "utf-8");
      settings = JSON.parse(raw);
    } catch {
    }
    const existingEnv = settings.env ?? {};
    let changed = false;
    for (const [key, value] of Object.entries(requiredEnv)) {
      if (existingEnv[key] !== value) {
        existingEnv[key] = value;
        changed = true;
      }
    }
    for (const key of staleKeys) {
      if (key in existingEnv) {
        delete existingEnv[key];
        changed = true;
      }
    }
    const hooks = settings.hooks ?? {};
    const stopHooks = hooks["Stop"] ?? [];
    const hookAlreadyPresent = stopHooks.some(
      (entry) => entry.hooks?.some((h) => h.command?.includes(AGENTLENS_HOOK_MARKER))
    );
    if (!hookAlreadyPresent) {
      stopHooks.push({ matcher: "", hooks: [{ type: "command", command: AGENTLENS_HOOK_COMMAND }] });
      hooks["Stop"] = stopHooks;
      settings.hooks = hooks;
      changed = true;
    }
    if (!changed) {
      return { changed: false };
    }
    settings.env = existingEnv;
    await fs.mkdir(path.dirname(settingsPath), { recursive: true });
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2) + "\n", "utf-8");
    return { changed: true };
  } catch (e) {
    return { changed: false, error: String(e) };
  }
}
var VS_CODE_VARIANTS = ["Code", "Code - Insiders", "Cursor", "Windsurf"];
function vscodeUserSettingsPaths() {
  const home = os.homedir();
  let base;
  if (process.platform === "darwin") {
    base = path.join(home, "Library", "Application Support");
  } else if (process.platform === "linux") {
    base = path.join(home, ".config");
  } else {
    base = process.env.APPDATA ?? path.join(home, "AppData", "Roaming");
  }
  return VS_CODE_VARIANTS.map((v) => path.join(base, v, "User", "settings.json"));
}
async function autoConfigureCopilotStandalone(port) {
  const required = {
    "github.copilot.chat.otel.enabled": true,
    "github.copilot.chat.otel.exporterType": "otlp-http",
    "github.copilot.chat.otel.otlpEndpoint": `http://localhost:${port}`
  };
  const results = [];
  for (const settingsPath of vscodeUserSettingsPaths()) {
    try {
      await fs.access(path.dirname(settingsPath));
    } catch {
      continue;
    }
    try {
      let settings = {};
      try {
        const raw = await fs.readFile(settingsPath, "utf-8");
        settings = JSON.parse(raw);
      } catch {
      }
      let changed = false;
      for (const [key, value] of Object.entries(required)) {
        if (settings[key] !== value) {
          settings[key] = value;
          changed = true;
        }
      }
      if (!changed) {
        results.push({ changed: false });
        continue;
      }
      await fs.mkdir(path.dirname(settingsPath), { recursive: true });
      await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2) + "\n", "utf-8");
      results.push({ changed: true });
    } catch (e) {
      results.push({ changed: false, error: String(e) });
    }
  }
  return results;
}

// src/otlpParser.ts
function classifyOtlpPayload(payload) {
  if (typeof payload !== "object" || payload === null) {
    return "unknown";
  }
  const obj = payload;
  if (Array.isArray(obj.resourceSpans)) {
    return "traces";
  }
  if (Array.isArray(obj.resourceLogs)) {
    return "logs";
  }
  if (Array.isArray(obj.resourceMetrics)) {
    return "metrics";
  }
  return "unknown";
}

// src/logReader.ts
var fs2 = __toESM(require("fs"));
var path2 = __toESM(require("path"));
var os2 = __toESM(require("os"));
function homeDir() {
  return os2.homedir();
}
function claudeProjectsDirs() {
  const envVal = process.env["CLAUDE_CONFIG_DIR"];
  if (envVal) {
    return envVal.split(",").map((p) => p.trim()).filter(Boolean).map((p) => p.endsWith("projects") ? p : path2.join(p, "projects"));
  }
  const home = homeDir();
  const candidates = [path2.join(home, ".claude", "projects")];
  if (process.platform === "win32") {
    const appData = process.env["APPDATA"];
    if (appData) candidates.unshift(path2.join(appData, "Claude", "projects"));
  } else {
    const xdg = process.env["XDG_CONFIG_HOME"];
    if (xdg) candidates.push(path2.join(xdg, "claude", "projects"));
  }
  return candidates.filter((d) => {
    try {
      return fs2.statSync(d).isDirectory();
    } catch {
      return false;
    }
  });
}
function codexSessionsDirs() {
  const envVal = process.env["CODEX_HOME"];
  if (envVal) {
    return envVal.split(",").map((p) => p.trim()).filter(Boolean).map((p) => path2.join(p, "sessions"));
  }
  const base = path2.join(homeDir(), ".codex", "sessions");
  return fs2.existsSync(base) ? [base] : [];
}
function copilotSessionStateDir() {
  const dir = path2.join(homeDir(), ".copilot", "session-state");
  return fs2.existsSync(dir) ? dir : null;
}
function copilotVSCodeChatRoots() {
  const home = homeDir();
  const candidates = [];
  switch (process.platform) {
    case "win32": {
      const appData = process.env["APPDATA"];
      if (appData) {
        candidates.push(path2.join(appData, "Code", "User", "workspaceStorage"));
        candidates.push(path2.join(appData, "Code - Insiders", "User", "workspaceStorage"));
      }
      break;
    }
    case "darwin":
      candidates.push(path2.join(home, "Library", "Application Support", "Code", "User", "workspaceStorage"));
      candidates.push(path2.join(home, "Library", "Application Support", "Code - Insiders", "User", "workspaceStorage"));
      break;
    default: {
      const xdg = process.env["XDG_CONFIG_HOME"] ?? path2.join(home, ".config");
      candidates.push(path2.join(xdg, "Code", "User", "workspaceStorage"));
      candidates.push(path2.join(xdg, "Code - Insiders", "User", "workspaceStorage"));
      break;
    }
  }
  return candidates.filter((d) => {
    try {
      return fs2.statSync(d).isDirectory();
    } catch {
      return false;
    }
  });
}
var LogReader = class {
  log;
  fileState = /* @__PURE__ */ new Map();
  constructor(options = {}) {
    this.log = options.log ?? (() => {
    });
  }
  /** Clears cached file state so the next scan re-reads all files from scratch. */
  clearFileState() {
    this.fileState.clear();
  }
  /**
   * Collects all session files across all agents, sorted newest-first by mtime.
   * Does NOT read file contents. Used by the startup batch-loader to process
   * files in priority order without one big synchronous block.
   */
  collectFileMeta() {
    const entries = [];
    for (const projectsDir of claudeProjectsDirs()) {
      for (const filePath of this._collectJsonlFiles(projectsDir)) {
        try {
          entries.push({ filePath, mtimeMs: fs2.statSync(filePath).mtimeMs, agentKey: "claude" });
        } catch {
        }
      }
    }
    for (const sessionsDir of codexSessionsDirs()) {
      for (const filePath of this._collectJsonlFiles(sessionsDir)) {
        try {
          entries.push({ filePath, mtimeMs: fs2.statSync(filePath).mtimeMs, agentKey: "codex" });
        } catch {
        }
      }
    }
    const stateDir = copilotSessionStateDir();
    if (stateDir) {
      try {
        for (const d of fs2.readdirSync(stateDir)) {
          const f = path2.join(stateDir, d, "events.jsonl");
          try {
            entries.push({ filePath: f, mtimeMs: fs2.statSync(f).mtimeMs, agentKey: "copilot" });
          } catch {
          }
        }
      } catch {
      }
    }
    for (const root of copilotVSCodeChatRoots()) {
      try {
        for (const hashDir of fs2.readdirSync(root)) {
          const chatDir = path2.join(root, hashDir, "chatSessions");
          let names;
          try {
            names = fs2.readdirSync(chatDir);
          } catch {
            continue;
          }
          const jsonlIds = new Set(names.filter((n) => n.endsWith(".jsonl")).map((n) => n.slice(0, -6)));
          for (const name of names) {
            if (name.endsWith(".jsonl")) {
              const f = path2.join(chatDir, name);
              try {
                entries.push({ filePath: f, mtimeMs: fs2.statSync(f).mtimeMs, agentKey: "copilot_vscode" });
              } catch {
              }
            } else if (name.endsWith(".json") && !jsonlIds.has(name.slice(0, -5))) {
              const f = path2.join(chatDir, name);
              try {
                entries.push({ filePath: f, mtimeMs: fs2.statSync(f).mtimeMs, agentKey: "copilot_vscode_json" });
              } catch {
              }
            }
          }
        }
      } catch {
      }
    }
    entries.sort((a, b) => b.mtimeMs - a.mtimeMs);
    return entries;
  }
  /**
   * Parses a single file identified by collectFileMeta() and returns a result if
   * the file is new or has grown since the last scan. Returns null if unchanged.
   */
  parseFile(filePath, agentKey) {
    const sessionId = agentKey === "copilot" ? path2.basename(path2.dirname(filePath)) : agentKey === "copilot_vscode_json" ? path2.basename(filePath, ".json") : path2.basename(filePath, ".jsonl");
    switch (agentKey) {
      case "claude":
        return this._processFile(filePath, () => this._parseClaudeFile(filePath));
      case "codex":
        return this._processFile(filePath, () => this._parseCodexFile(filePath, ""));
      case "copilot":
        return this._processFile(filePath, () => this._parseCopilotFile(filePath, sessionId));
      case "copilot_vscode":
        return this._processFile(filePath, () => this._parseCopilotVSCodeFile(filePath, sessionId));
      case "copilot_vscode_json":
        return this._processFile(filePath, () => this._parseCopilotVSCodeJsonFile(filePath, sessionId));
      default:
        return null;
    }
  }
  /** Returns all directories that should be watched for file changes. */
  getWatchDirs() {
    return [
      ...claudeProjectsDirs(),
      ...codexSessionsDirs(),
      ...(() => {
        const d = copilotSessionStateDir();
        return d ? [d] : [];
      })(),
      ...copilotVSCodeChatRoots()
    ];
  }
  /**
   * Scans all log directories and returns new/updated session results.
   * Files that are new or have changed since the last scan are re-parsed.
   */
  scan() {
    return [
      ...this._scanClaude(),
      ...this._scanCodex(),
      ...this._scanCopilot(),
      ...this._scanCopilotVSCode()
    ];
  }
  // ── Claude Code ─────────────────────────────────────────────────────────────
  _scanClaude() {
    const results = [];
    for (const projectsDir of claudeProjectsDirs()) {
      this._collectJsonlFiles(projectsDir).forEach((filePath) => {
        const result = this._processFile(filePath, () => this._parseClaudeFile(filePath));
        if (result) results.push(result);
      });
    }
    return results;
  }
  _parseClaudeFile(filePath) {
    const lines = this._readNewLines(filePath);
    if (!lines) return null;
    const sessionId = path2.basename(filePath, ".jsonl");
    let workspace = "";
    let model = "";
    let firstTimestamp = "";
    let lastTimestamp = "";
    let userRequest = "";
    let totalInput = 0, totalOutput = 0, totalCacheRead = 0, totalCacheCreate = 0;
    let turns = 0, totalToolCalls = 0;
    const filesChanged = /* @__PURE__ */ new Set();
    const filesRead = /* @__PURE__ */ new Set();
    const toolCounts = {};
    const timeline = [];
    let idx = 0;
    let initiator = "user";
    for (const line of lines) {
      let entry;
      try {
        entry = JSON.parse(line);
      } catch {
        continue;
      }
      const ts = entry["timestamp"];
      if (ts) {
        if (!firstTimestamp) firstTimestamp = ts;
        lastTimestamp = ts;
      }
      if (entry["cwd"] && !workspace) workspace = entry["cwd"];
      if (entry["type"] === "user") {
        if (!userRequest) {
          if (entry["isSidechain"] === true) initiator = "agent";
        }
        const content = entry["message"]?.["content"];
        const text = _extractTextContent(content);
        if (!userRequest && text) {
          userRequest = text;
          if (initiator === "user" && text.startsWith("<local-command-caveat>")) initiator = "api";
        }
        timeline.push({ type: "user_input", spanId: `log-u-${idx}`, label: "User", durationMs: 0, isError: false, timestamp: ts ?? "", responseText: text });
        idx++;
      }
      if (entry["type"] === "assistant") {
        const msg = entry["message"];
        if (msg?.["model"]) model = msg["model"];
        const usage = msg?.["usage"];
        if (usage) {
          totalInput += usage["input_tokens"] ?? 0;
          totalOutput += usage["output_tokens"] ?? 0;
          totalCacheRead += usage["cache_read_input_tokens"] ?? 0;
          totalCacheCreate += usage["cache_creation_input_tokens"] ?? 0;
          turns++;
        }
        const content = msg?.["content"] ?? [];
        let hasToolCall = false;
        for (const block of content) {
          if (block["type"] === "tool_use" && block["name"]) {
            hasToolCall = true;
            totalToolCalls++;
            const name = block["name"];
            toolCounts[name] = (toolCounts[name] ?? 0) + 1;
            const inp = block["input"] ?? {};
            const fp = String(inp["file_path"] ?? inp["filePath"] ?? inp["path"] ?? "");
            if (fp) {
              if (name === "Read" || name === "read_file") filesRead.add(fp);
              else if (["Edit", "Write", "MultiEdit", "replace_string_in_file", "create_file"].includes(name)) filesChanged.add(fp);
            }
          }
        }
        const responseText = content.find((b) => b["type"] === "text")?.["text"];
        timeline.push({ type: hasToolCall ? "tool" : "llm", spanId: `log-a-${idx}`, label: hasToolCall ? "Tool calls" : "Response", model: model || void 0, inputTokens: usage?.["input_tokens"], outputTokens: usage?.["output_tokens"], durationMs: 0, isError: false, timestamp: ts ?? "", responseText });
        idx++;
      }
    }
    if (!firstTimestamp) return null;
    return { workspace, card: _buildCard(sessionId, "claude_code", model || "claude", firstTimestamp, lastTimestamp, { totalInput, totalOutput, totalCacheRead, totalCacheCreate, turns, totalToolCalls, toolCounts, filesRead, filesChanged, filesSearched: /* @__PURE__ */ new Set(), userRequest, timeline, initiator }) };
  }
  // ── Codex ───────────────────────────────────────────────────────────────────
  _scanCodex() {
    const results = [];
    for (const sessionsDir of codexSessionsDirs()) {
      this._collectJsonlFiles(sessionsDir).forEach((filePath) => {
        const result = this._processFile(filePath, () => this._parseCodexFile(filePath, sessionsDir));
        if (result) results.push(result);
      });
    }
    return results;
  }
  _parseCodexFile(filePath, _sessionsDir) {
    const lines = this._readNewLines(filePath);
    if (!lines) return null;
    const sessionId = path2.basename(filePath, ".jsonl");
    const workspace = path2.dirname(filePath);
    let model = "";
    let firstTimestamp = "";
    let lastTimestamp = "";
    let userRequest = "";
    let totalInput = 0, totalOutput = 0, totalCacheRead = 0;
    let turns = 0;
    for (const line of lines) {
      let entry;
      try {
        entry = JSON.parse(line);
      } catch {
        continue;
      }
      const ts = entry["timestamp"];
      if (ts) {
        if (!firstTimestamp) firstTimestamp = ts;
        lastTimestamp = ts;
      }
      if (entry["type"] === "turn_context") {
        const payload = entry["payload"];
        if (payload?.["model"]) model = String(payload["model"]);
      }
      if (entry["type"] === "event_msg") {
        const payload = entry["payload"];
        if (payload?.["type"] === "user_message" && !userRequest) {
          const msg = String(payload["message"] ?? "").trim();
          if (msg) userRequest = _extractCodexUserText(msg);
        }
        if (payload?.["type"] === "token_count") {
          const info = payload["info"];
          if (info?.["model"]) model = String(info["model"]);
          const lastUsage = info?.["last_token_usage"];
          if (lastUsage) {
            totalInput += lastUsage["input_tokens"] ?? 0;
            totalOutput += lastUsage["output_tokens"] ?? 0;
            totalCacheRead += lastUsage["cached_input_tokens"] ?? 0;
            turns++;
          }
        }
      }
    }
    if (!firstTimestamp) return null;
    return {
      workspace,
      card: _buildCard(sessionId, "codex", model || "codex", firstTimestamp, lastTimestamp, { totalInput, totalOutput, totalCacheRead, totalCacheCreate: 0, turns, totalToolCalls: 0, toolCounts: {}, filesRead: /* @__PURE__ */ new Set(), filesChanged: /* @__PURE__ */ new Set(), filesSearched: /* @__PURE__ */ new Set(), userRequest: userRequest.slice(0, 500), timeline: [], initiator: "user" })
    };
  }
  // ── Copilot CLI ──────────────────────────────────────────────────────────────
  // Reads ~/.copilot/session-state/<uuid>/events.jsonl — written automatically,
  // no env setup required. Each directory is one session (dirname = session ID).
  //
  // Key event types:
  //   session.start        → data.sessionId, data.selectedModel, data.startTime, data.context.cwd
  //   user.message         → data.transformedContent (user request text)
  //   assistant.message    → data.outputTokens, data.toolRequests
  //   session.shutdown     → data.modelMetrics[model].usage.{inputTokens,cacheReadTokens,cacheWriteTokens}
  _scanCopilot() {
    const results = [];
    const stateDir = copilotSessionStateDir();
    if (!stateDir) return results;
    let sessionDirs;
    try {
      sessionDirs = fs2.readdirSync(stateDir);
    } catch {
      return results;
    }
    for (const sessionDirName of sessionDirs) {
      const eventsFile = path2.join(stateDir, sessionDirName, "events.jsonl");
      const result = this._processFile(eventsFile, () => this._parseCopilotFile(eventsFile, sessionDirName));
      if (result) results.push(result);
    }
    return results;
  }
  _parseCopilotFile(filePath, sessionId) {
    const lines = this._readNewLines(filePath);
    if (!lines) return null;
    let workspace = "";
    let model = "";
    let firstTimestamp = "";
    let lastTimestamp = "";
    let userRequest = "";
    let totalOutput = 0;
    let totalInputFromShutdown = 0;
    let totalCacheRead = 0;
    let totalCacheCreate = 0;
    let turns = 0, totalToolCalls = 0;
    const toolCounts = {};
    const filesChanged = /* @__PURE__ */ new Set();
    for (const line of lines) {
      let event;
      try {
        event = JSON.parse(line);
      } catch {
        continue;
      }
      const ts = event["timestamp"];
      if (ts) {
        if (!firstTimestamp) firstTimestamp = ts;
        lastTimestamp = ts;
      }
      const type = event["type"];
      const data = event["data"];
      if (!type || !data) continue;
      if (type === "session.start") {
        if (data["selectedModel"]) model = String(data["selectedModel"]);
        const ctx = data["context"];
        if (ctx?.["cwd"]) workspace = String(ctx["cwd"]);
        if (data["startTime"] && !firstTimestamp) firstTimestamp = String(data["startTime"]);
      }
      if (type === "user.message" && !userRequest) {
        userRequest = _extractCopilotUserText(String(data["transformedContent"] ?? ""));
      }
      if (type === "assistant.message") {
        const outTok = data["outputTokens"];
        if (outTok) {
          totalOutput += outTok;
          turns++;
        }
        const toolReqs = data["toolRequests"];
        if (toolReqs) {
          for (const req of toolReqs) {
            const name = String(req["name"] ?? "");
            if (!name) continue;
            totalToolCalls++;
            toolCounts[name] = (toolCounts[name] ?? 0) + 1;
            const args = req["arguments"];
            const fp = String(args?.["path"] ?? args?.["file_path"] ?? "");
            if (fp && (name === "edit" || name === "write" || name === "create")) {
              filesChanged.add(fp);
            }
          }
        }
        if (data["model"]) model = String(data["model"]);
      }
      if (type === "session.shutdown") {
        const metrics = data["modelMetrics"];
        if (metrics) {
          for (const entry of Object.values(metrics)) {
            const usage = entry?.["usage"];
            if (!usage) continue;
            totalInputFromShutdown += usage["inputTokens"] ?? 0;
            totalCacheRead += usage["cacheReadTokens"] ?? 0;
            totalCacheCreate += usage["cacheWriteTokens"] ?? 0;
          }
        }
      }
    }
    if (!firstTimestamp) return null;
    return {
      workspace,
      card: _buildCard(sessionId, "copilot", model || "copilot", firstTimestamp, lastTimestamp, {
        totalInput: totalInputFromShutdown,
        totalOutput,
        totalCacheRead,
        totalCacheCreate,
        turns,
        totalToolCalls,
        toolCounts,
        filesRead: /* @__PURE__ */ new Set(),
        filesChanged,
        filesSearched: /* @__PURE__ */ new Set(),
        userRequest: userRequest.slice(0, 500),
        timeline: [],
        initiator: "user"
      })
    };
  }
  // ── Copilot Chat (VS Code sidebar) ───────────────────────────────────────────
  // Reads workspaceStorage/<hash>/chatSessions/<uuid>.jsonl — written automatically
  // by VS Code for every Copilot Chat panel session, no env setup required.
  //
  // The JSONL is a delta log; each line is an operation on a shared session object:
  //   kind=0  initial session snapshot (creationDate, sessionId, selectedModel)
  //   kind=1  set  — k is key path, v is new value
  //   kind=2  push — k is key path, v is array of items to append
  //
  // Data available: sessionId, creationDate, workspace (via workspace.json),
  //   initial model, completionTokens per turn, turn timestamps, turn duration.
  // NOT available: input tokens, cache tokens, model per turn.
  _scanCopilotVSCode() {
    const results = [];
    for (const root of copilotVSCodeChatRoots()) {
      try {
        for (const hashDir of fs2.readdirSync(root)) {
          const chatDir = path2.join(root, hashDir, "chatSessions");
          let names;
          try {
            names = fs2.readdirSync(chatDir);
          } catch {
            continue;
          }
          const jsonlIds = new Set(names.filter((n) => n.endsWith(".jsonl")).map((n) => n.slice(0, -6)));
          for (const name of names) {
            if (name.endsWith(".jsonl")) {
              const filePath = path2.join(chatDir, name);
              const sessionId = path2.basename(filePath, ".jsonl");
              const result = this._processFile(filePath, () => this._parseCopilotVSCodeFile(filePath, sessionId));
              if (result) results.push(result);
            } else if (name.endsWith(".json") && !jsonlIds.has(name.slice(0, -5))) {
              const filePath = path2.join(chatDir, name);
              const sessionId = path2.basename(filePath, ".json");
              const result = this._processFile(filePath, () => this._parseCopilotVSCodeJsonFile(filePath, sessionId));
              if (result) results.push(result);
            }
          }
        }
      } catch {
      }
    }
    return results;
  }
  _parseCopilotVSCodeFile(filePath, sessionId) {
    const lines = this._readNewLines(filePath);
    if (!lines) return null;
    const workspaceJsonPath = path2.join(path2.dirname(filePath), "..", "workspace.json");
    let workspace = "";
    try {
      const wj = JSON.parse(fs2.readFileSync(workspaceJsonPath, "utf-8"));
      const folderUri = String(wj["folder"] ?? "");
      if (folderUri.startsWith("file:///")) {
        let p = decodeURIComponent(folderUri.slice(7));
        if (process.platform === "win32" && /^\/[A-Za-z]:/.test(p)) p = p.slice(1);
        workspace = p;
      }
    } catch {
    }
    let sessionCreatedMs = 0;
    let model = "";
    let userRequest = "";
    let totalOutput = 0;
    const turnCompletionTokens = /* @__PURE__ */ new Map();
    const turnPromptTokens = /* @__PURE__ */ new Map();
    const turnTimestamps = [];
    let requestPushCount = 0;
    for (const line of lines) {
      let entry;
      try {
        entry = JSON.parse(line);
      } catch {
        continue;
      }
      const kind = entry["kind"];
      const k = entry["k"];
      const v = entry["v"];
      if (kind === 0 && v && typeof v === "object") {
        const sv = v;
        if (typeof sv["creationDate"] === "number") sessionCreatedMs = sv["creationDate"];
        const inputState = sv["inputState"];
        const selModel = inputState?.["selectedModel"];
        const meta = selModel?.["metadata"];
        if (typeof meta?.["family"] === "string") model = meta["family"];
        else if (typeof selModel?.["id"] === "string") model = selModel["id"];
      }
      if (kind === 2 && Array.isArray(k) && k.length === 1 && k[0] === "requests" && Array.isArray(v)) {
        for (let j = 0; j < v.length; j++) {
          const req = v[j];
          const turnIdx = requestPushCount + j;
          if (typeof req["timestamp"] === "number") turnTimestamps[turnIdx] = req["timestamp"];
          if (typeof req["completionTokens"] === "number" && !turnCompletionTokens.has(turnIdx)) {
            turnCompletionTokens.set(turnIdx, req["completionTokens"]);
          }
          if (turnIdx === 0 && !userRequest) {
            const msg = req["message"];
            if (typeof msg?.["text"] === "string" && msg["text"].trim()) {
              userRequest = msg["text"].trim();
            }
          }
          if (!model && typeof req["modelId"] === "string") {
            model = req["modelId"].replace(/^copilot\//, "");
          }
        }
        requestPushCount += v.length;
      }
      if (kind === 1 && Array.isArray(k) && k[0] === "requests" && typeof k[1] === "number") {
        const idx = k[1];
        if (k[2] === "completionTokens" && typeof v === "number") {
          turnCompletionTokens.set(idx, v);
        }
        if (k[2] === "result" && v && typeof v === "object") {
          const result = v;
          const usage = result["usage"];
          if (usage) {
            if (typeof usage["completionTokens"] === "number") {
              turnCompletionTokens.set(idx, usage["completionTokens"]);
            }
            if (typeof usage["promptTokens"] === "number") {
              turnPromptTokens.set(idx, usage["promptTokens"]);
            }
          }
          if (!userRequest) {
            const meta = result["metadata"];
            const rendered = meta?.["renderedUserMessage"];
            if (rendered) {
              for (const chunk of rendered) {
                if (chunk["type"] === 1 && typeof chunk["text"] === "string") {
                  userRequest = _extractVSCodeCopilotUserText(chunk["text"]);
                  if (userRequest) break;
                }
              }
            }
          }
        }
      }
    }
    for (const tokens of turnCompletionTokens.values()) totalOutput += tokens;
    let totalInput = 0;
    for (const tokens of turnPromptTokens.values()) totalInput += tokens;
    const turns = turnCompletionTokens.size;
    if (turns === 0 || sessionCreatedMs === 0) return null;
    const startTs = new Date(sessionCreatedMs).toISOString();
    const lastTurnMs = turnTimestamps.length > 0 ? Math.max(...turnTimestamps) : sessionCreatedMs;
    const endTs = new Date(lastTurnMs).toISOString();
    return {
      workspace,
      card: _buildCard(sessionId, "copilot", model || "copilot", startTs, endTs, {
        totalInput,
        totalOutput,
        totalCacheRead: 0,
        totalCacheCreate: 0,
        turns,
        totalToolCalls: 0,
        toolCounts: {},
        filesRead: /* @__PURE__ */ new Set(),
        filesChanged: /* @__PURE__ */ new Set(),
        filesSearched: /* @__PURE__ */ new Set(),
        userRequest: userRequest.slice(0, 500),
        timeline: [],
        initiator: "user"
      })
    };
  }
  // ── Copilot Chat (VS Code sidebar) — legacy JSON snapshot format ─────────────
  // Older Copilot Chat versions (before the delta-log JSONL format) wrote each
  // session as a single <uuid>.json file containing the full session state object.
  // These files are only collected when no .jsonl sibling exists for the same UUID.
  //
  // Data available: sessionId, creationDate, lastMessageDate, model (from per-turn
  //   modelId or inputState.selectedModel), user prompt (message.text), turn count,
  //   tool call presence.
  // Not available: output/input/cache tokens (not stored in older format).
  _parseCopilotVSCodeJsonFile(filePath, sessionId) {
    const data = this._readJsonFile(filePath);
    if (!data) return null;
    const creationMs = typeof data["creationDate"] === "number" ? data["creationDate"] : 0;
    const lastMs = typeof data["lastMessageDate"] === "number" ? data["lastMessageDate"] : 0;
    if (!creationMs) return null;
    const requests = data["requests"];
    if (!Array.isArray(requests) || requests.length === 0) return null;
    const workspaceJsonPath = path2.join(path2.dirname(filePath), "..", "workspace.json");
    let workspace = "";
    try {
      const wj = JSON.parse(fs2.readFileSync(workspaceJsonPath, "utf-8"));
      const folderUri = String(wj["folder"] ?? "");
      if (folderUri.startsWith("file:///")) {
        let p = decodeURIComponent(folderUri.slice(7));
        if (process.platform === "win32" && /^\/[A-Za-z]:/.test(p)) p = p.slice(1);
        workspace = p;
      }
    } catch {
    }
    let model = "";
    const inputState = data["inputState"];
    if (inputState) {
      const selModel = inputState["selectedModel"];
      const meta = selModel?.["metadata"];
      if (typeof meta?.["family"] === "string") model = meta["family"];
      else if (typeof selModel?.["id"] === "string") model = selModel["id"];
    }
    let userRequest = "";
    let totalToolCalls = 0;
    const toolCounts = {};
    for (const req of requests) {
      if (!model && typeof req["modelId"] === "string") {
        model = req["modelId"].replace(/^copilot\//, "");
      }
      if (!userRequest) {
        const msg = req["message"];
        if (typeof msg?.["text"] === "string" && msg["text"].trim()) {
          userRequest = msg["text"].trim();
        } else if (Array.isArray(msg?.["parts"])) {
          for (const part of msg["parts"]) {
            if (typeof part["text"] === "string" && part["text"].trim() && !part["text"].trim().startsWith("<")) {
              userRequest = part["text"].trim();
              break;
            }
          }
        }
      }
      const response = req["response"];
      if (Array.isArray(response)) {
        for (const entry of response) {
          if (entry["kind"] === "toolInvocationSerialized") {
            totalToolCalls++;
            const toolId = String(entry["toolId"] ?? "unknown");
            toolCounts[toolId] = (toolCounts[toolId] ?? 0) + 1;
          }
        }
      }
    }
    const sid = String(data["sessionId"] ?? sessionId);
    const startTs = new Date(creationMs).toISOString();
    const endTs = new Date(lastMs || creationMs).toISOString();
    return {
      workspace,
      card: _buildCard(sid, "copilot", model || "copilot", startTs, endTs, {
        totalInput: 0,
        totalOutput: 0,
        totalCacheRead: 0,
        totalCacheCreate: 0,
        turns: requests.length,
        totalToolCalls,
        toolCounts,
        filesRead: /* @__PURE__ */ new Set(),
        filesChanged: /* @__PURE__ */ new Set(),
        filesSearched: /* @__PURE__ */ new Set(),
        userRequest: userRequest.slice(0, 500),
        timeline: [],
        initiator: "user"
      })
    };
  }
  // ── Shared helpers ────────────────────────────────────────────────────────────
  _collectJsonlFiles(dir) {
    const results = [];
    try {
      const entries = fs2.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path2.join(dir, entry.name);
        if (entry.isDirectory()) results.push(...this._collectJsonlFiles(full));
        else if (entry.isFile() && entry.name.endsWith(".jsonl")) results.push(full);
      }
    } catch {
    }
    return results;
  }
  /** Reads and parses a JSON file, updating file state. Returns null if unchanged or on error. */
  _readJsonFile(filePath) {
    try {
      const stat = fs2.statSync(filePath);
      const prev = this.fileState.get(filePath);
      if (prev && stat.mtimeMs === prev.mtimeMs && stat.size === prev.bytesRead) return null;
      const content = fs2.readFileSync(filePath, "utf-8");
      this.fileState.set(filePath, { bytesRead: stat.size, mtimeMs: stat.mtimeMs });
      return JSON.parse(content);
    } catch (err) {
      this.log(`[LogReader] read error ${filePath}: ${err}`);
      return null;
    }
  }
  /** Returns only the new bytes since last read, split into lines. Returns null if unchanged. */
  _readNewLines(filePath) {
    try {
      const stat = fs2.statSync(filePath);
      const prev = this.fileState.get(filePath);
      if (prev && stat.mtimeMs === prev.mtimeMs && stat.size === prev.bytesRead) return null;
      const content = fs2.readFileSync(filePath, "utf-8");
      this.fileState.set(filePath, { bytesRead: stat.size, mtimeMs: stat.mtimeMs });
      return content.split("\n").filter((l) => l.trim());
    } catch (err) {
      this.log(`[LogReader] read error ${filePath}: ${err}`);
      return null;
    }
  }
  /** Checks if a file has changed since last scan; if so, delegates to parseFn. */
  _processFile(filePath, parseFn) {
    try {
      const stat = fs2.statSync(filePath);
      const prev = this.fileState.get(filePath);
      if (prev && stat.mtimeMs === prev.mtimeMs && stat.size === prev.bytesRead) return null;
      return parseFn();
    } catch {
      return null;
    }
  }
};
function _buildCard(sessionId, source, model, firstTimestamp, lastTimestamp, acc) {
  const startMs = _parseTs(firstTimestamp);
  const endMs = _parseTs(lastTimestamp);
  const durationMs = endMs > 0 && startMs > 0 ? Math.max(0, endMs - startMs) : 0;
  const totalContext = acc.totalInput + acc.totalCacheRead + acc.totalCacheCreate;
  const cacheHitRate = totalContext > 0 ? acc.totalCacheRead / totalContext : 0;
  return {
    sessionId,
    traceId: sessionId,
    source,
    dataSource: "log",
    initiator: acc.initiator,
    userRequest: acc.userRequest.slice(0, 500),
    model,
    turns: acc.turns,
    inputTokens: totalContext,
    outputTokens: acc.totalOutput,
    cacheReadTokens: acc.totalCacheRead,
    cacheCreateTokens: acc.totalCacheCreate,
    cacheHitRate,
    durationMs,
    startTime: startMs > 0 ? new Date(startMs).toISOString() : "",
    filesRead: Array.from(acc.filesRead),
    filesSearched: Array.from(acc.filesSearched),
    filesChanged: Array.from(acc.filesChanged),
    toolCounts: acc.toolCounts,
    totalToolCalls: acc.totalToolCalls,
    totalLlmCalls: acc.turns,
    errors: 0,
    outcome: acc.totalToolCalls > 0 ? "tool_calls" : "text_response",
    timeline: acc.timeline,
    backgroundSpans: [],
    loopSignals: []
  };
}
function _extractCopilotUserText(raw) {
  const lines = raw.split("\n");
  let inTag = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^<[a-z_]+[^>]*>/.test(trimmed) && !trimmed.startsWith("</")) {
      if (/<\/[a-z_]+>$/.test(trimmed)) continue;
      inTag = true;
      continue;
    }
    if (/^<\/[a-z_]+>/.test(trimmed)) {
      inTag = false;
      continue;
    }
    if (inTag) continue;
    return trimmed;
  }
  return "";
}
function _extractCodexUserText(raw) {
  const marker = "## My request for Codex:\n";
  const idx = raw.indexOf(marker);
  if (idx !== -1) return raw.slice(idx + marker.length).trim();
  return raw;
}
function _extractVSCodeCopilotUserText(raw) {
  const stripped = raw.replace(/^[\s\S]*<\/[^>]+>\s*/, "").trim();
  if (stripped && stripped !== raw.trim()) return stripped.split("\n")[0]?.trim() ?? "";
  if (!stripped) return "";
  return raw.trim().split("\n")[0]?.trim() ?? "";
}
function _extractTextContent(content) {
  if (!content) return "";
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    for (const block of content) {
      if (block["type"] === "text" && typeof block["text"] === "string" && block["text"].trim()) {
        return block["text"].trim();
      }
    }
  }
  return "";
}
function _parseTs(ts) {
  if (!ts) return 0;
  const ms = Date.parse(ts);
  if (!isNaN(ms)) return ms;
  const n = parseInt(ts);
  if (!isNaN(n) && n > 1e15) return Math.floor(n / 1e6);
  return 0;
}

// standalone/server.ts
var OTLP_PORT = parseInt(process.env.OTLP_PORT ?? "4318");
var UI_PORT = parseInt(process.env.UI_PORT ?? "3000");
var BIND_HOST = process.env.BIND_HOST ?? "127.0.0.1";
var mediaDir = path3.join(__dirname, "..", "media");
var DATA_DIR = process.env.DATA_DIR ?? path3.join(os3.homedir(), ".agentlens");
var DATA_FILE = path3.join(DATA_DIR, "spans.json");
var spans = [];
var sseClients = [];
try {
  if (!fs3.existsSync(DATA_DIR)) fs3.mkdirSync(DATA_DIR, { recursive: true });
  if (fs3.existsSync(DATA_FILE)) {
    const raw = fs3.readFileSync(DATA_FILE, "utf-8");
    spans = JSON.parse(raw);
    console.log(`[AgentLens] Loaded ${spans.length} spans from ${DATA_FILE}`);
  }
} catch (e) {
  console.warn("[AgentLens] Could not load persisted data:", e);
}
var saveTimer = null;
function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      fs3.writeFileSync(DATA_FILE, JSON.stringify(spans));
    } catch (e) {
      console.warn("[AgentLens] Could not save data:", e);
    }
  }, 1e3);
}
function addSpan(span) {
  if (span.receivedAt === void 0) span.receivedAt = Date.now();
  spans.push(span);
}
var logSessions = /* @__PURE__ */ new Map();
var logReader = new LogReader();
function runLogScan() {
  const results = logReader.scan();
  let changed = false;
  for (const { card } of results) {
    logSessions.set(card.sessionId, card);
    changed = true;
  }
  if (changed) pushUpdate();
}
var watchScanTimer = null;
function scheduleWatchScan() {
  if (watchScanTimer) return;
  watchScanTimer = setTimeout(() => {
    watchScanTimer = null;
    runLogScan();
  }, 300);
}
function setupLogWatcher() {
  for (const dir of logReader.getWatchDirs()) {
    try {
      fs3.watch(dir, { recursive: true, persistent: false }, scheduleWatchScan);
    } catch {
    }
  }
}
function startLogIngestion() {
  setInterval(runLogScan, 5e3);
  setupLogWatcher();
  console.log("[AgentLens] Log ingestion enabled \u2014 scanning local session files");
  let files;
  try {
    files = logReader.collectFileMeta();
  } catch {
    return;
  }
  if (files.length === 0) return;
  for (const file of files) {
    try {
      const result = logReader.parseFile(file.filePath, file.agentKey);
      if (result) logSessions.set(result.card.sessionId, result.card);
    } catch {
    }
  }
  console.log(`[AgentLens] Loaded ${logSessions.size} sessions from local logs`);
}
function toAttrs(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.filter((a) => {
    const o = a;
    return typeof o.key === "string" && typeof o.value === "object" && o.value !== null;
  });
}
function attrStr(attrs, ...keys) {
  for (const key of keys) {
    const a = attrs.find((x) => x.key === key);
    if (!a) continue;
    const v = a.value;
    const s = v.stringValue ?? v.intValue ?? v.doubleValue;
    if (s != null) return String(s);
  }
  return "";
}
function isCodexWebsocketSpanName(name) {
  const lower = name.toLowerCase();
  return lower.startsWith("codex.") && lower.includes("websocket");
}
function isCodexWebsocketTraceSpan(name, attrs) {
  const lower = name.toLowerCase();
  if (!lower.includes("websocket")) return false;
  const eventName = attrStr(attrs, "event.name", "event_name", "name", "event").toLowerCase();
  const hasCodexAttr = Boolean(attrStr(attrs, "codex.session.id", "codex.conversation.id", "codex.turn.id"));
  return lower.startsWith("codex.") || eventName.startsWith("codex.") || hasCodexAttr;
}
function attrsFromBodyKv(body) {
  if (typeof body !== "object" || body === null) return [];
  const obj = body;
  const kv = obj.kvlistValue;
  const values = kv?.values;
  if (!Array.isArray(values)) return [];
  const attrs = [];
  for (const value of values) {
    const entry = value;
    const key = typeof entry.key === "string" ? entry.key : "";
    const attrValue = entry.value;
    if (!key || typeof attrValue !== "object" || attrValue === null) continue;
    attrs.push({ key, value: attrValue });
  }
  return attrs;
}
function mergeAttrs(...lists) {
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  for (const list of lists) {
    for (const attr of list) {
      if (seen.has(attr.key)) continue;
      seen.add(attr.key);
      out.push(attr);
    }
  }
  return out;
}
function processTraces(payload, collectorPath = "/v1/traces") {
  const p = payload;
  const rawSpans = p?.resourceSpans?.flatMap(
    (rs) => rs.scopeSpans?.flatMap((ss) => ss.spans ?? []) ?? []
  ) ?? [];
  let n = 0;
  for (const raw of rawSpans) {
    const s = raw;
    if (typeof s.traceId !== "string" || typeof s.spanId !== "string" || typeof s.name !== "string") continue;
    let attrs = toAttrs(s.attributes);
    if (isCodexWebsocketTraceSpan(s.name, attrs)) continue;
    attrs = [...attrs, { key: "_agentlens.collector_path", value: { stringValue: collectorPath } }];
    addSpan({
      traceId: s.traceId,
      spanId: s.spanId,
      parentSpanId: s.parentSpanId || void 0,
      name: s.name,
      startTime: s.startTimeUnixNano,
      endTime: s.endTimeUnixNano,
      attributes: attrs,
      status: s.status
    });
    n++;
  }
  return n;
}
function processLogs(payload, collectorPath = "/v1/logs") {
  const p = payload;
  const fallback = `codex-${Date.now()}`;
  let n = 0;
  for (const rl of p?.resourceLogs ?? []) {
    const resourceAttrs = toAttrs(rl.resource?.attributes);
    for (const sl of rl.scopeLogs ?? []) {
      const scopeAttrs = toAttrs(sl.scope?.attributes);
      for (const rec of sl.logRecords ?? []) {
        const r = rec;
        const attrs = mergeAttrs(toAttrs(r.attributes), attrsFromBodyKv(r.body), scopeAttrs, resourceAttrs);
        const name = attrStr(attrs, "event.name", "event_name", "name", "event");
        const logToolName = attrStr(attrs, "tool.name");
        const isCodexEvent = name.startsWith("codex.");
        const isClaudeToolResult = name === "tool_result" && logToolName !== "";
        if (!isCodexEvent && !isClaudeToolResult) continue;
        if (isCodexEvent && isCodexWebsocketSpanName(name)) continue;
        let traceId;
        let spanName;
        if (isClaudeToolResult) {
          traceId = typeof r.traceId === "string" && r.traceId ? r.traceId : attrStr(attrs, "session.id", "session_id") || fallback;
          spanName = "claude_code.tool_result";
        } else {
          traceId = typeof r.traceId === "string" && r.traceId ? r.traceId : attrStr(attrs, "conversation.id", "conversation_id", "session.id", "session_id") || fallback;
          spanName = name;
        }
        const spanId = typeof r.spanId === "string" && r.spanId ? r.spanId : attrStr(attrs, "span_id", "spanId") || `cl-${Math.random().toString(36).slice(2, 10)}`;
        let startTime = String(r.timeUnixNano ?? r.observedTimeUnixNano ?? "0");
        let endTime = startTime;
        if (startTime === "0") {
          const timestamp = attrStr(attrs, "event.timestamp");
          const ms = timestamp ? new Date(timestamp).getTime() : 0;
          if (ms > 0) {
            const endNs = String(BigInt(ms) * BigInt(1e6));
            const durMs = parseInt(attrStr(attrs, "duration_ms") || "0") || 0;
            endTime = endNs;
            startTime = durMs > 0 ? String(BigInt(endNs) - BigInt(durMs) * BigInt(1e6)) : endNs;
          }
        }
        addSpan({ traceId, spanId, name: spanName, startTime, endTime, attributes: [...attrs, { key: "_agentlens.collector_path", value: { stringValue: collectorPath } }], status: void 0 });
        n++;
      }
    }
  }
  return n;
}
function safeJson(data) {
  return JSON.stringify(data).replace(/<\//g, "<\\/").replace(/<!--/g, "<\\!--").replace(/\$\{/g, "\\${");
}
function computeSidebarPayload(summary, allSpans) {
  const sessions = summary.sessions;
  const sorted = [...sessions].sort(
    (a, b) => Date.parse(b.startTime || "0") - Date.parse(a.startTime || "0")
  );
  const latest = sorted[0] ?? null;
  const AGENT_ORDER = ["copilot", "claude_code", "codex"];
  const agentSources = [...new Set(sorted.map((s) => s.source).filter(Boolean))].sort((a, b) => {
    const ai = AGENT_ORDER.indexOf(a), bi = AGENT_ORDER.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
  let lastMs = 0;
  for (const span of allSpans) {
    const ms = span.receivedAt ?? 0;
    if (ms > lastMs) lastMs = ms;
  }
  const isActive = lastMs > 0 && Date.now() - lastMs < 2e4;
  const turnInputTokens = latest ? (latest.timeline ?? []).filter((e) => e.type === "llm" && (e.inputTokens ?? 0) > 0).map((e) => e.inputTokens ?? 0) : [];
  let burnRate = null;
  if (latest && isActive && latest.durationMs > 1e4) {
    const totalTokens = latest.inputTokens + latest.outputTokens;
    const tpm = totalTokens / latest.durationMs * 6e4;
    burnRate = { tokensPerMinute: Math.round(tpm), costPerHour: 0 };
  }
  const avgInputTokens = sorted.length > 0 ? sorted.reduce((s, x) => s + x.inputTokens, 0) / sorted.length : 1;
  const avgOutputTokens = sorted.length > 0 ? sorted.reduce((s, x) => s + x.outputTokens, 0) / sorted.length : 1;
  const currentSession = latest ? {
    source: latest.source,
    model: latest.model || "",
    userRequest: latest.userRequest || "",
    totalLlmCalls: latest.totalLlmCalls,
    totalToolCalls: latest.totalToolCalls,
    errors: latest.errors,
    cacheHitRate: latest.cacheHitRate,
    durationMs: latest.durationMs,
    startTime: latest.startTime,
    turnInputTokens,
    inputTokens: latest.inputTokens,
    outputTokens: latest.outputTokens,
    cacheReadTokens: latest.cacheReadTokens,
    cacheCreateTokens: latest.cacheCreateTokens,
    costUsd: calcTokenCostUsd(
      Math.max(0, latest.inputTokens - latest.cacheReadTokens - latest.cacheCreateTokens),
      latest.cacheReadTokens,
      latest.cacheCreateTokens,
      latest.outputTokens,
      latest.model
    )
  } : null;
  return { isActive, lastActivityMs: lastMs, sessionCount: sessions.length, agentSources, currentSession, burnRate, avgInputTokens, avgOutputTokens };
}
function computeSidebarData(summary, _allSpans) {
  const sessions = summary.sessions;
  const filesSet = /* @__PURE__ */ new Set();
  let errorCount = 0;
  for (const sess of sessions) {
    for (const f of sess.filesChanged) filesSet.add(f);
    errorCount += sess.errors;
  }
  const cacheHitPct = sessions.length > 0 ? Math.round(sessions.reduce((a, s) => a + s.cacheHitRate, 0) / sessions.length * 100) : 0;
  const avgTurns = sessions.length > 0 ? Math.round(sessions.reduce((a, s) => a + s.totalLlmCalls, 0) / sessions.length * 10) / 10 : 0;
  const AGENT_KEY_ORDER = ["copilot", "claude_code", "codex"];
  const agentSources = [...new Set(sessions.map((s) => s.source).filter(Boolean))].sort((a, b) => {
    const ai = AGENT_KEY_ORDER.indexOf(a), bi = AGENT_KEY_ORDER.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
  const totalToolCalls = sessions.reduce((s, sess) => s + sess.totalToolCalls, 0);
  const latest = sessions.length > 0 ? sessions[sessions.length - 1] : null;
  const latestSession = latest ? {
    source: latest.source,
    model: latest.model || "",
    totalLlmCalls: latest.totalLlmCalls,
    totalToolCalls: latest.totalToolCalls,
    durationMs: latest.durationMs,
    errors: latest.errors,
    cacheHitRate: latest.cacheHitRate
  } : null;
  return {
    sessionCount: sessions.length,
    turnCount: sessions.reduce((s, sess) => s + sess.totalLlmCalls, 0),
    totalInputTokens: sessions.reduce((s, sess) => s + sess.inputTokens, 0),
    totalOutputTokens: sessions.reduce((s, sess) => s + sess.outputTokens, 0),
    filesChangedCount: filesSet.size,
    errors: errorCount,
    totalToolCalls,
    cacheHitPct,
    avgTurns,
    agentSources,
    latestSession
  };
}
function computeAnalyticsData(sessions) {
  const dayMap = {};
  for (const sess of sessions) {
    if (!sess.startTime) continue;
    const d = new Date(sess.startTime);
    if (isNaN(d.getTime())) continue;
    const day = d.toISOString().slice(0, 10);
    if (!dayMap[day]) dayMap[day] = { totalTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheCreateTokens: 0, costUsd: 0, sessionCount: 0 };
    const r = dayMap[day];
    r.totalTokens += sess.inputTokens;
    r.outputTokens += sess.outputTokens;
    r.cacheReadTokens += sess.cacheReadTokens;
    r.cacheCreateTokens += sess.cacheCreateTokens;
    r.sessionCount++;
  }
  const dailyStats = Object.entries(dayMap).map(([day, r]) => ({ day, ...r })).sort((a, b) => a.day.localeCompare(b.day));
  const totalTokens = sessions.reduce((s, sess) => s + sess.inputTokens + sess.outputTokens, 0);
  const times = sessions.map((s) => s.startTime ? new Date(s.startTime).getTime() : 0).filter((t) => t > 0);
  const lifetimeStats = {
    totalSessions: sessions.length,
    totalTokens,
    totalCostUsd: 0,
    oldestSessionMs: times.length > 0 ? Math.min(...times) : 0,
    newestSessionMs: times.length > 0 ? Math.max(...times) : 0
  };
  return { dailyStats, lifetimeStats };
}
function buildSessionSummary() {
  let summary = null;
  try {
    summary = summarizeSpans(spans);
  } catch (e) {
    console.warn("[AgentLens] summarizeSpans error:", e);
  }
  if (logSessions.size > 0) {
    const otelIds = new Set((summary?.sessions ?? []).map((s) => s.sessionId));
    const logOnly = [...logSessions.values()].filter((s) => !otelIds.has(s.sessionId));
    if (logOnly.length > 0) {
      const merged = [...logOnly, ...summary?.sessions ?? []].sort((a, b) => Date.parse(b.startTime || "0") - Date.parse(a.startTime || "0"));
      summary = { ...summary ?? { backgroundSpans: [], efficiency: { totalInputTokens: 0, totalOutputTokens: 0, totalLlmCalls: 0, avgInputPerCall: 0, avgTtft: 0, cacheHitRate: 0, toolDefWaste: 0, sysInstructionWaste: 0, topTokenConsumers: [] } }, sessions: merged };
    }
  }
  return summary;
}
function buildUpdatePayload() {
  const sessionSummary = buildSessionSummary();
  const sidebar = sessionSummary ? computeSidebarData(sessionSummary, spans) : null;
  const sidebarLive = sessionSummary ? computeSidebarPayload(sessionSummary, spans) : null;
  const analyticsData = sessionSummary ? computeAnalyticsData(sessionSummary.sessions) : null;
  return JSON.stringify({
    type: "update",
    spans,
    summary: { toolCalls: {} },
    sessionSummary,
    sidebar,
    analyticsData,
    ...sidebarLive ?? {}
  });
}
function pushUpdate() {
  const data = buildUpdatePayload();
  sseClients = sseClients.filter((client) => {
    try {
      client.write(`data: ${data}

`);
      return true;
    } catch {
      return false;
    }
  });
}
function getHtml() {
  const sessionSummary = buildSessionSummary();
  const sessionSummaryJson = safeJson(sessionSummary);
  const sidebarLive = sessionSummary ? computeSidebarPayload(sessionSummary, spans) : {
    isActive: false,
    lastActivityMs: 0,
    sessionCount: 0,
    agentSources: [],
    currentSession: null,
    burnRate: null
  };
  const sidebarInitJson = safeJson(sidebarLive);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>AgentLens</title>
  <link rel="icon" href="/mascot.png" type="image/png">
  <link rel="stylesheet" href="/dashboard.css">
  <style>
    /* \u2500\u2500 VS Code theme variable shim \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    :root {
      --vscode-editor-background:       #1e1e1e;
      --vscode-foreground:              #cccccc;
      --vscode-panel-border:            #3e3e42;
      --vscode-textLink-foreground:     #4fc3f7;
      --vscode-descriptionForeground:   #9d9d9d;
      --vscode-list-hoverBackground:    #2a2d2e;
      --vscode-editorWidget-background: #252526;
      --vscode-testing-iconFailed:      #f44747;
      --vscode-testing-iconPassed:      #4ec994;
      --vscode-font-family:             -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      --vscode-dropdown-background:     #3c3c3c;
      --vscode-dropdown-border:         #616161;
      --vscode-dropdown-foreground:     #f0f0f0;
      --vscode-button-background:       #0e639c;
      --vscode-button-foreground:       #ffffff;
      --vscode-button-hoverBackground:  #1177bb;
    }

    /* \u2500\u2500 Standalone layout \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    html, body { height: 100%; overflow: hidden; margin: 0; padding: 0; }
    body { padding: 0; }
    #sa-wrap { display: flex; height: 100vh; width: 100vw; overflow: hidden; }

    /* \u2500\u2500 Sidebar panel \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    #sa-sidebar {
      width: 260px;
      min-width: 260px;
      background: var(--vscode-editorWidget-background);
      border-right: 1px solid var(--vscode-panel-border);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      overflow: hidden;
      transition: width 0.15s ease, min-width 0.15s ease;
    }
    #sa-sidebar.sa-collapsed { width: 0; min-width: 0; }

    /* Sidebar content \u2014 shared CSS classes with sidebarWebview.ts */
    .sb-card { background: var(--vscode-editor-background); border: 1px solid var(--vscode-panel-border); border-radius: 4px; padding: 8px 10px; margin-bottom: 6px; }
    .sb-section-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.4px; color: var(--vscode-descriptionForeground); margin-bottom: 4px; }
    .sb-row { display: flex; align-items: center; gap: 6px; }
    .sb-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .sb-dot.active { background: #56D364; animation: sbPulse 1.5s ease-in-out infinite; }
    .sb-dot.idle { background: var(--vscode-descriptionForeground); opacity: 0.5; }
    @keyframes sbPulse { 0%,100% { opacity:1;transform:scale(1); } 50% { opacity:0.5;transform:scale(1.4); } }
    .sb-status { font-size: 12px; font-weight: 600; }
    .sb-muted { color: var(--vscode-descriptionForeground); font-size: 11px; }
    .sb-prompt { font-size: 10px; color: var(--vscode-foreground); opacity: 0.8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 3px 0 2px; font-style: italic; }
    .sb-model { font-size: 10px; color: var(--vscode-textLink-foreground); margin-bottom: 4px; }
    #sa-sidebar canvas { display: block; width: 100%; height: 80px; }
    .sb-turn-label { font-size: 10px; color: var(--vscode-descriptionForeground); margin-top: 3px; }
    .sb-burn { font-size: 12px; font-weight: 600; color: var(--vscode-charts-green, #81c784); }
    .sb-counters { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; text-align: center; }
    .sb-counter-val { font-size: 16px; font-weight: 700; color: var(--vscode-textLink-foreground); }
    .sb-counter-key { font-size: 9px; color: var(--vscode-descriptionForeground); text-transform: uppercase; letter-spacing: 0.3px; }
.sb-footer { display: flex; align-items: center; justify-content: space-between; padding: 6px 8px 8px; font-size: 11px; color: var(--vscode-descriptionForeground); border-top: 1px solid var(--vscode-panel-border); }
    .sb-clear-btn { padding: 2px 8px; font-size: 10px; cursor: pointer; border: 1px solid var(--vscode-testing-iconFailed, #f44); border-radius: 3px; background: transparent; color: var(--vscode-testing-iconFailed, #f44); }
    .sb-clear-btn:hover { background: rgba(255,68,68,0.08); }
    #sa-toast { position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#333; color:#fff; padding:8px 16px; border-radius:4px; font-size:12px; z-index:9999; opacity:0; transition:opacity 0.2s; pointer-events:none; white-space:nowrap; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
    #sa-toast.visible { opacity:1; }

    /* \u2500\u2500 Main panel \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    #sa-main { flex: 1; overflow-y: auto; min-width: 0; padding: 0 18px 16px; }
    #app { min-height: 100%; }
  </style>
</head>
<body>
  <script>
    window.__INITIAL_SPANS__ = ${safeJson(spans)};
    window.__INITIAL_TOOL_CALLS__ = {};
    window.__INITIAL_SESSION_SUMMARY__ = ${sessionSummaryJson};
    window.__MASCOT_URI__ = '/help-mascot.png';
    window.__STANDALONE__ = true;

    // \u2500\u2500 Client-side search support \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    var __latestSessions__ = (window.__INITIAL_SESSION_SUMMARY__ && window.__INITIAL_SESSION_SUMMARY__.sessions) || [];
    window.addEventListener('message', function(e) {
      if (e.data && e.data.type === 'update' && e.data.sessionSummary && e.data.sessionSummary.sessions) {
        __latestSessions__ = e.data.sessionSummary.sessions;
      }
    });

    var _toastTimer;
    function showToast(msg) {
      var el = document.getElementById('sa-toast');
      if (!el) { el = document.createElement('div'); el.id = 'sa-toast'; document.body.appendChild(el); }
      el.textContent = msg;
      el.classList.add('visible');
      clearTimeout(_toastTimer);
      _toastTimer = setTimeout(function() { el.classList.remove('visible'); }, 3000);
    }

    function getNotifContainer() {
      var el = document.getElementById('sa-notif-container');
      if (!el) {
        el = document.createElement('div');
        el.id = 'sa-notif-container';
        el.style.cssText = 'position:fixed;bottom:20px;right:16px;z-index:9998;display:flex;flex-direction:column;gap:8px;max-width:320px;';
        document.body.appendChild(el);
      }
      return el;
    }

    // showActionNotification(label, prompt, color, preview, secondaryAction, dismissMs)
    // secondaryAction: { label: string, onClick: function } | null \u2014 rendered before Copy Prompt
    function showActionNotification(label, prompt, color, preview, secondaryAction, dismissMs) {
      color = color || '#f6a623';
      var container = getNotifContainer();
      var notif = document.createElement('div');
      notif.style.cssText = 'background:#252526;border:1px solid #3e3e42;border-left:3px solid ' + color + ';border-radius:4px;padding:10px 12px;font-size:12px;color:#ccc;box-shadow:0 2px 8px rgba(0,0,0,0.4);';

      var header = document.createElement('div');
      header.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px;';

      var labelEl = document.createElement('span');
      labelEl.style.cssText = 'font-weight:600;color:' + color + ';line-height:1.3;';
      labelEl.textContent = label;

      var closeBtn = document.createElement('button');
      closeBtn.textContent = '\xD7';
      closeBtn.style.cssText = 'background:none;border:none;color:#888;cursor:pointer;font-size:16px;padding:0;line-height:1;flex-shrink:0;';
      closeBtn.onclick = function() { notif.remove(); };

      header.appendChild(labelEl);
      header.appendChild(closeBtn);
      notif.appendChild(header);

      if (preview) {
        var previewEl = document.createElement('div');
        previewEl.style.cssText = 'font-size:11px;color:#999;margin-bottom:8px;line-height:1.4;max-height:56px;overflow:hidden;';
        previewEl.textContent = preview;
        notif.appendChild(previewEl);
      }

      var actions = document.createElement('div');
      actions.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;';

      if (secondaryAction) {
        var secBtn = document.createElement('button');
        secBtn.textContent = secondaryAction.label;
        secBtn.style.cssText = 'background:none;border:1px solid #555;border-radius:3px;color:#ccc;cursor:pointer;font-size:11px;padding:4px 10px;';
        secBtn.onclick = function() { secondaryAction.onClick(); notif.remove(); };
        actions.appendChild(secBtn);
      }

      var copyBtn = document.createElement('button');
      copyBtn.textContent = 'Copy Prompt';
      copyBtn.style.cssText = 'background:none;border:1px solid ' + color + ';border-radius:3px;color:' + color + ';cursor:pointer;font-size:11px;padding:4px 10px;';
      copyBtn.onclick = function() {
        navigator.clipboard.writeText(prompt).then(function() {
          copyBtn.textContent = 'Copied!';
          copyBtn.style.borderColor = '#56D364';
          copyBtn.style.color = '#56D364';
          setTimeout(function() { notif.remove(); }, 1500);
        }).catch(function() {
          showToast('Could not copy \u2014 check browser clipboard permissions');
        });
      };
      actions.appendChild(copyBtn);

      notif.appendChild(actions);
      container.appendChild(notif);
      setTimeout(function() { notif.remove(); }, dismissMs || 30000);
    }

    window.acquireVsCodeApi = function() {
      return {
        getState: function() { return null; },
        setState: function() {},
        postMessage: function(msg) {
          if (msg.type === 'confirmClear') {
            if (confirm('Clear all AgentLens data? OTEL session data is deleted permanently. AgentLens log cache is cleared and will be rebuilt from your local agent log files (the log files themselves are not deleted).')) {
              fetch('/api/clear', { method: 'POST' });
              window.dispatchEvent(new MessageEvent('message', { data: { type: 'clearAll' } }));
            }
          } else if (msg.type === 'clearAll') {
            fetch('/api/clear', { method: 'POST' });
          } else if (msg.type === 'automation' && msg.prompt) {
            // Build full prompt matching VS Code format: [label] + session ID + body
            var sessionLine = msg.sessionId ? 'Session ID: ' + msg.sessionId + '\\n' : '';
            var autoFull = '[' + (msg.label || 'Automation') + ']\\n\\n' + sessionLine + msg.prompt;
            var autoPreview = msg.prompt.length > 160 ? msg.prompt.slice(0, 160) + '\u2026' : msg.prompt;
            var autoLabel = 'Automation: ' + (msg.label || 'Automation');
            if (msg.writePromptsFile) {
              fetch('/api/write-prompts-file', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agent: msg.agent, label: msg.label, prompt: autoFull })
              }).then(function() {
                var slug = msg.agent === 'claude_code' ? 'claude' : msg.agent === 'codex' ? 'codex' : 'copilot';
                showToast('Prompt written to agentlens-prompts-' + slug + '.md');
              }).catch(function() {
                showActionNotification(autoLabel, autoFull, '#f6a623', autoPreview);
              });
            } else {
              showActionNotification(autoLabel, autoFull, '#f6a623', autoPreview);
            }
          } else if (msg.type === 'askAI' && msg.prompt) {
            navigator.clipboard.writeText(msg.prompt).then(function() {
              showToast('Prompt copied to clipboard');
            }).catch(function() {
              showToast('Could not copy \u2014 check browser clipboard permissions');
            });
          } else if (msg.type === 'exportSessionData' || msg.type === 'exportSessionDataRedacted') {
            window.dispatchEvent(new MessageEvent('message', { data: { type: msg.type } }));
          } else if (msg.type === 'openSidebar' || msg.type === 'closeSidebar') {
            window.dispatchEvent(new CustomEvent('agentlens:sidebar', { detail: { open: msg.type === 'openSidebar' } }));
          } else if (msg.type === 'searchSessions' && msg.query) {
            var q = msg.query;
            var filtered = __latestSessions__.filter(function(s) {
              if (q.text) {
                var t = q.text.toLowerCase();
                if (!(s.userRequest || '').toLowerCase().includes(t) && !(s.model || '').toLowerCase().includes(t)) return false;
              }
              if (q.source && s.source !== q.source) return false;
              if (q.since) { var ms = s.startTime ? new Date(s.startTime).getTime() : 0; if (ms < q.since) return false; }
              if (q.until) { var ms2 = s.startTime ? new Date(s.startTime).getTime() : 0; if (ms2 > q.until) return false; }
              return true;
            });
            var dir = q.orderDir === 'ASC' ? 1 : -1;
            filtered.sort(function(a, b) {
              if (q.orderBy === 'start_time') return dir * (new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
              if (q.orderBy === 'total_tokens') return dir * ((a.inputTokens + a.outputTokens) - (b.inputTokens + b.outputTokens));
              if (q.orderBy === 'duration_ms') return dir * (a.durationMs - b.durationMs);
              if (q.orderBy === 'errors') return dir * (a.errors - b.errors);
              if (q.orderBy === 'cost_usd') return 0;
              return 0;
            });
            var offset = q.offset || 0; var limit = q.limit || 50;
            var page = filtered.slice(offset, offset + limit);
            setTimeout(function() {
              window.dispatchEvent(new MessageEvent('message', {
                data: { type: 'searchResults', sessions: page, totalCount: filtered.length, offset: offset, context: msg.context || 'search' }
              }));
            }, 0);
          } else if (msg.type === 'alert' && msg.label) {
            var alertColor = msg.severity === 'error' ? '#f44747' : msg.severity === 'info' ? '#4fc3f7' : '#f6a623';
            var alertPrompt = [
              "An alert was triggered in my AI coding session. Please explain what's happening and how I should respond.",
              '',
              'Alert: ' + msg.label,
            ].concat(msg.detail ? ['Detail: ' + msg.detail] : []).join('\\n');
            showActionNotification(
              'Alert: ' + msg.label,
              alertPrompt,
              alertColor,
              msg.detail || null,
              {
                label: 'View Alerts',
                onClick: function() {
                  window.dispatchEvent(new MessageEvent('message', { data: { type: 'switchTab', tab: 'alerts' } }));
                }
              },
              30000
            );
          }
        }
      };
    };
    // SSE \u2192 dispatch as window message (picked up by Preact app AND sidebar handler below)
    var _es = new EventSource('/events');
    _es.onmessage = function(e) {
      window.dispatchEvent(new MessageEvent('message', { data: JSON.parse(e.data) }));
    };
  </script>

  <div id="sa-wrap">
    <!-- \u2500\u2500 Sidebar (live session monitor) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->
    <div id="sa-sidebar">
      <div style="flex:1;overflow-y:auto;padding:8px 8px 8px;font-family:var(--vscode-font-family);color:var(--vscode-foreground)">
        <!-- Status row -->
        <div class="sb-card" style="margin-bottom:6px">
          <div class="sb-row" style="margin-bottom:2px">
            <span class="sb-dot idle" id="sb-dot"></span>
            <span class="sb-status" id="sb-status-text">Idle</span>
            <span style="flex:1"></span>
            <span id="sb-agent" class="sb-muted" style="display:flex;align-items:center"></span>
            <span id="sb-dur" class="sb-muted"></span>
          </div>
          <div id="sb-prompt" class="sb-prompt"></div>
          <div id="sb-model" class="sb-model"></div>
          <span id="sb-ago" class="sb-muted" style="font-size:10px"></span>
        </div>

        <!-- Session block (hidden when no sessions) -->
        <div id="sb-session-block" style="display:none">

          <!-- Key counters (shown first) -->
          <div class="sb-card">
            <div class="sb-counters">
              <div>
                <div class="sb-counter-val" id="sb-turns">\u2014</div>
                <div class="sb-counter-key">Turns</div>
              </div>
              <div>
                <div class="sb-counter-val" id="sb-tools">\u2014</div>
                <div class="sb-counter-key">Tools</div>
              </div>
              <div>
                <div class="sb-counter-val" id="sb-errors">\u2014</div>
                <div class="sb-counter-key">Errors</div>
              </div>
              <div>
                <div class="sb-counter-val" id="sb-cache">\u2014</div>
                <div class="sb-counter-key">Cache</div>
              </div>
            </div>
          </div>

          <!-- Context growth sparkline -->
          <div class="sb-card">
            <div class="sb-section-label">Context Growth</div>
            <canvas id="sb-sparkline"></canvas>
            <div id="sb-turn-label" class="sb-turn-label"></div>
            <div id="sb-sparkline-waiting" class="sb-muted" style="display:none;font-size:10px;font-style:italic;padding:2px 0">Waiting for data\u2026</div>
          </div>

          <!-- Token breakdown (input / output) -->
          <div class="sb-card" id="sb-tokens-card">
            <div class="sb-section-label">Tokens</div>
            <div id="sb-token-bars" style="margin-top:4px"></div>
            <div id="sb-token-waiting" class="sb-muted" style="display:none;font-size:10px;font-style:italic;padding:2px 0">Waiting for data\u2026</div>
          </div>

          <!-- Estimated cost -->
          <div class="sb-card" id="sb-cost-card">
            <div class="sb-section-label">Estimated Cost</div>
            <div id="sb-cost-val" style="font-size:16px;font-weight:700;color:var(--vscode-charts-green,#81c784)">\u2014</div>
          </div>

          <!-- Burn rate -->
          <div class="sb-card" id="sb-burn-row">
            <div class="sb-section-label">Burn Rate</div>
            <div id="sb-burn" class="sb-burn"></div>
            <div id="sb-burn-waiting" class="sb-muted" style="display:none;font-size:10px;font-style:italic">Waiting for data\u2026</div>
          </div>

        </div>

        <!-- Empty state (shown by render() when currentSession is null) -->
        <div id="sb-empty" class="sb-muted" style="text-align:center;padding:24px 0;font-size:11px;display:none">
          No sessions recorded yet
        </div>


      </div>

      <!-- Footer -->
      <div class="sb-footer">
        <span><span id="sb-session-count">0</span> sessions stored</span>
        <button class="sb-clear-btn" id="sb-clear-btn">Clear All Data</button>
      </div>
    </div>

    <!-- \u2500\u2500 Main dashboard \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->
    <div id="sa-main">
      <div id="app"></div>
    </div>
  </div>

  <script>
    window.onerror = function(msg, src, line, col, err) {
      var app = document.getElementById('app');
      if (app) {
        app.style.cssText = 'padding:20px;color:red;font-family:monospace;white-space:pre-wrap';
        app.textContent = 'JS ERROR: ' + msg + ' | At: ' + src + ':' + line + ':' + col + ' | ' + (err ? err.stack : '');
      }
    };
  </script>


  <script src="/dashboard.js"></script>

  <script>
    // Sidebar collapse driven by dashboard toggle
    var _sidebarEl = document.getElementById('sa-sidebar');
    window.addEventListener('agentlens:sidebar', function(e) {
      _sidebarEl.classList.toggle('sa-collapsed', !e.detail.open);
    });
</script>
  <script>var __SIDEBAR_INIT__ = ${sidebarInitJson};</script>
  <script src="/sidebar.js"></script>
</body>
</html>`;
}
var MIME = {
  ".css": "text/css",
  ".js": "application/javascript",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};
var uiServer = http.createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (url === "/events") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    });
    res.write(":\n\n");
    res.write(`data: ${buildUpdatePayload()}

`);
    sseClients.push(res);
    req.on("close", () => {
      sseClients = sseClients.filter((c) => c !== res);
    });
    return;
  }
  if (req.method === "POST" && url === "/api/clear") {
    spans = [];
    logSessions.clear();
    logReader.clearFileState();
    try {
      fs3.writeFileSync(DATA_FILE, "[]");
    } catch (e) {
      console.warn("[AgentLens] Could not clear data file:", e);
    }
    pushUpdate();
    res.writeHead(200);
    res.end();
    setImmediate(() => runLogScan());
    return;
  }
  if (req.method === "POST" && url === "/api/write-prompts-file") {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        const { agent, label, prompt } = JSON.parse(Buffer.concat(chunks).toString("utf-8"));
        const agentSlug = agent === "claude_code" ? "claude" : agent === "codex" ? "codex" : "copilot";
        const agentName = agent === "claude_code" ? "Claude" : agent === "codex" ? "Codex" : "Copilot";
        const filename = `agentlens-prompts-${agentSlug}.md`;
        const filePath2 = path3.join(process.cwd(), filename);
        const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19);
        const entry = `## ${timestamp} \u2014 ${label}

${prompt}

---

`;
        let existing = "";
        try {
          existing = fs3.readFileSync(filePath2, "utf-8");
        } catch {
        }
        const content = existing ? existing + entry : `# AgentLens Prompts \u2014 ${agentName}

${entry}`;
        fs3.writeFileSync(filePath2, content, "utf-8");
        console.log(`[AgentLens] Prompt written to ${filePath2}`);
      } catch (e) {
        console.warn("[AgentLens] write-prompts-file error:", e);
      }
      res.writeHead(200);
      res.end();
    });
    return;
  }
  if (req.method === "POST" && url === "/action") {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        const body = JSON.parse(Buffer.concat(chunks).toString("utf-8"));
        if (body.type === "clearAll") {
          spans = [];
          try {
            fs3.writeFileSync(DATA_FILE, "[]");
          } catch (e) {
            console.warn("[AgentLens] Could not clear data file:", e);
          }
          pushUpdate();
        }
      } catch (e) {
        console.warn("[AgentLens] Malformed /action body:", e);
      }
      res.writeHead(200);
      res.end();
    });
    return;
  }
  if (url === "/" || url === "/index.html") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(getHtml());
    return;
  }
  const filePath = path3.join(mediaDir, url);
  const ext = path3.extname(filePath);
  const mime = MIME[ext];
  if (mime && fs3.existsSync(filePath) && filePath.startsWith(mediaDir)) {
    res.writeHead(200, { "Content-Type": mime });
    fs3.createReadStream(filePath).pipe(res);
    return;
  }
  res.writeHead(404);
  res.end("Not found");
});
var otlpServer = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/agentlens/standalone") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ agentlens: true, kind: "standalone" }));
    return;
  }
  if (req.method !== "POST") {
    res.writeHead(200);
    res.end();
    return;
  }
  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", () => {
    try {
      const payload = JSON.parse(Buffer.concat(chunks).toString("utf-8"));
      const kind = classifyOtlpPayload(payload);
      if (req.url === "/v1/traces" || kind === "traces") {
        const n = processTraces(payload, req.url ?? "/v1/traces");
        if (n > 0) console.log(`[AgentLens] ${n} span${n !== 1 ? "s" : ""} ingested (${spans.length} total)`);
      } else if (req.url === "/v1/logs" || kind === "logs") {
        const n = processLogs(payload, req.url ?? "/v1/logs");
        if (n > 0) console.log(`[AgentLens] ${n} log event${n !== 1 ? "s" : ""} ingested`);
      } else if (kind === "metrics" || req.url === "/v1/metrics") {
      } else {
        console.warn(`[AgentLens] ignored POST ${req.url ?? "/"}: unrecognized OTLP JSON payload`);
      }
      pushUpdate();
      scheduleSave();
    } catch (e) {
      console.error("[AgentLens] Parse error:", e);
    }
    res.writeHead(200);
    res.end();
  });
});
otlpServer.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`[AgentLens] Port ${OTLP_PORT} already in use \u2014 is the VS Code extension running? Stop it or set OTLP_PORT=<other> to use a different port.`);
    process.exit(1);
  }
  console.error("[AgentLens] OTLP server error:", err);
});
Promise.all([
  autoConfigureClaudeCode(OTLP_PORT),
  autoConfigureCodex(OTLP_PORT),
  autoConfigureCopilotStandalone(OTLP_PORT)
]).then(([claudeResult, codexResult, copilotResults]) => {
  if (claudeResult.error) {
    console.warn(`[AgentLens] Could not auto-configure Claude Code: ${claudeResult.error}`);
  } else if (claudeResult.changed) {
    console.log(`[AgentLens] Claude Code configured \u2014 restart Claude Code in your terminal to activate tracing`);
  }
  if (codexResult.error) {
    console.warn(`[AgentLens] Could not auto-configure Codex: ${codexResult.error}`);
  } else if (codexResult.changed) {
    console.log(`[AgentLens] Codex configured \u2014 restart Codex in your terminal to activate tracing`);
  }
  const copilotChanged = copilotResults.filter((r) => r.changed);
  const copilotErrors = copilotResults.filter((r) => r.error);
  if (copilotChanged.length > 0) {
    console.log(`[AgentLens] Copilot configured \u2014 reload VS Code window to activate tracing (Ctrl+Shift+P \u2192 "Reload Window")`);
  }
  for (const r of copilotErrors) {
    console.warn(`[AgentLens] Could not auto-configure Copilot: ${r.error}`);
  }
}).catch((e) => console.warn("[AgentLens] Auto-configure error:", e));
otlpServer.listen(OTLP_PORT, BIND_HOST, () => {
  console.log(`[AgentLens] OTLP receiver \u2192 http://${BIND_HOST}:${OTLP_PORT}`);
});
uiServer.listen(UI_PORT, BIND_HOST, () => {
  const url = `http://localhost:${UI_PORT}`;
  console.log(`[AgentLens] Dashboard      \u2192 ${url}`);
  const cmd = process.platform === "darwin" ? `open "${url}"` : process.platform === "win32" ? `start "" "${url}"` : `xdg-open "${url}"`;
  (0, import_child_process.exec)(cmd, (err) => {
    if (err) console.log(`
Open ${url} in your browser
`);
  });
  startLogIngestion();
});
function shutdown() {
  if (saveTimer) clearTimeout(saveTimer);
  try {
    fs3.writeFileSync(DATA_FILE, JSON.stringify(spans));
    console.log(`
[AgentLens] Saved ${spans.length} spans to ${DATA_FILE}`);
  } catch {
  }
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
//# sourceMappingURL=cli.js.map
