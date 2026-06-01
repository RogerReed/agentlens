The sidebar gives you a compact live view. For the full experience, open the **editor panel dashboard** — a 6-tab interface that fits on a wide monitor alongside your code.

## Dashboard tabs

| Tab | What it shows |
| --- | --- |
| **Sessions** | Session list as a sortable table — timestamp, prompt, model, tokens, duration, and estimated cost per row. Sort by Cost, Duration, or Tokens using the pills in the filter bar. Click any row to expand in-place and drill into five sub-tabs: Overview (stat tiles, burn rate, and Insights), Trace (LLM and tool call waterfall), Flow (turn-to-tool graph), Tools (donut chart), and Files (modified files with inline diffs) |
| **Analytics** | Aggregate charts across all sessions: per-agent breakdown (token totals, cache rates, top tools), Estimated Cost (bar chart + daily total line, day-grouped cost table, model breakdown), Token Usage Per Session, and Context Growth |
| **Alerts** | Configurable threshold notifications per agent — turns, errors, active session time, and identical tool repeats |
| **Automation** | Automated prompts triggered when session thresholds are crossed — Loop Breaker, Turn Limit Wrap-up, and Context Dump |
| **Export** | Export all recorded sessions as JSON — full (includes prompt text) or redacted — from the full SQLite session history |
| **Help** | Overview, setup instructions, agent OTEL data shapes, Insights reference, loop signal documentation, and glossary |

Use the **agent filter** and **session limit** controls at the top to focus on what matters.
