# Pricing Sources

This file records exactly where each agent's billing data is retrieved from.
Update `media/src/pricing.ts` whenever rates change and bump `PRICING_LAST_UPDATED`.

---

## Copilot

Copilot has three billing models depending on plan type and date.

### Model 1 — Token-based AI Credits (from Jun 1, 2026)

**Who it applies to:** All Copilot plans on the new billing model, default from June 1, 2026.

**Source:** <https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing>

**What this page provides:**

- Per-model token rates: `inputPerMTok`, `cacheReadPerMTok`, `cacheWritePerMTok`, `outputPerMTok` (USD per 1M tokens)
- List of included models (effectively $0 — look for models with no token rate listed)

**Formula:**

```text
cost = (inputTokens / 1_000_000 × inputRate)
     + (cacheReadTokens / 1_000_000 × cacheReadRate)
     + (cacheWriteTokens / 1_000_000 × cacheWriteRate)
     + (outputTokens / 1_000_000 × outputRate)
aiCredits = cost / 0.01
```

### Model 2 — Annual-plan request-based (from Jun 1, 2026)

**Who it applies to:** Copilot annual-plan holders who opt to stay on request-based billing
after June 1, 2026. These users face significantly higher multipliers than the pre-June rates.

**Source:** <https://docs.github.com/en/copilot/reference/copilot-billing/model-multipliers-for-annual-plans>

**What this page provides:**

- Post-June multipliers for annual plan holders (`multiplierAnnualPostJun1` field in `ModelRates`)
- Formula is the same as Model 3 — only the multiplier values differ

**Formula:**

```text
cost = userPromptCount × multiplierAnnualPostJun1 × $0.04
```

### Model 3 — Request-based with multipliers *(deprecated — pre-Jun 1, 2026)*

**Who it applies to:** All Copilot plans before June 1, 2026. No longer active for new sessions.

**Source:** <https://docs.github.com/en/copilot/concepts/billing/copilot-requests>

**What this page provides:**

- Per-model request multipliers (`multiplier` field in `ModelRates`)
- Clarification that only **user-initiated prompts** count as premium requests in agentic sessions —
  autonomous tool calls and internal LLM calls within a session do NOT count
- Models with a 0× multiplier are included and cost nothing under this model

**Formula:**

```text
cost = userPromptCount × multiplier × $0.04
```

---

## Claude

Claude Code CLI uses Anthropic API token-based pricing only — no request-multiplier system.

### Billing model — Token-based (input / cache write / cache read / output)

**Who it applies to:** All Claude Code CLI users billed through the Anthropic API.

**Source:** <https://www.anthropic.com/pricing> (verified 2026-05-28)

**Formula:**

```text
cost = (input_tokens / 1_000_000 × inputRate)
     + (cache_creation_tokens / 1_000_000 × cacheWriteRate)
     + (cache_read_tokens / 1_000_000 × cacheReadRate)
     + (output_tokens / 1_000_000 × outputRate)
```

Where `input_tokens` is the raw (non-cached) input count. The session-level `inputTokens` field on `SessionSummaryCard` is the full total (input + cacheRead + cacheCreate), so decompose as:

```text
rawInput = inputTokens - cacheReadTokens - cacheCreateTokens
```

**OTEL fields (from Claude Code CLI telemetry):**

On `claude_code.llm_request` spans (per-API-call):

- `model` / `gen_ai.request.model` — model ID, e.g. `claude-sonnet-4-6`
- `input_tokens` — raw (non-cached) input tokens
- `output_tokens` — output tokens
- `cache_read_tokens` — prompt cache read tokens (charged at ~10% of input rate)
- `cache_creation_tokens` — prompt cache write tokens (charged at ~125% of input rate for 5-min TTL)
- `ttft_ms` — time to first token in ms
- `stop_reason` — e.g. `tool_use`, `end_turn`

**Rates (USD per 1M tokens, verified 2026-05-28):**

| Model                          | Input   | Cache Write (5m) | Cache Write (1h) | Cache Read | Output   |
| ------------------------------ | ------- | ---------------- | ---------------- | ---------- | -------- |
| `claude-opus-4-7`              | $5.00   | $6.25            | $10.00           | $0.50      | $25.00   |
| `claude-opus-4-6`              | $5.00   | $6.25            | $10.00           | $0.50      | $25.00   |
| `claude-opus-4-5`              | $5.00   | $6.25            | $10.00           | $0.50      | $25.00   |
| `claude-sonnet-4-6`            | $3.00   | $3.75            | $6.00            | $0.30      | $15.00   |
| `claude-sonnet-4-5`            | $3.00   | $3.75            | $6.00            | $0.30      | $15.00   |
| `claude-sonnet-4`              | $3.00   | $3.75            | $6.00            | $0.30      | $15.00   |
| `claude-haiku-4-5`             | $1.00   | $1.25            | $2.00            | $0.10      | $5.00    |
| `claude-opus-4-7` (fast mode)  | $30.00  | $37.50           | $60.00           | $3.00      | $150.00  |
| `claude-opus-4-6` (fast mode)  | $30.00  | $37.50           | $60.00           | $3.00      | $150.00  |

**Deprecated models (for historical sessions):**

| Model                                | Input   | Cache Read | Output   |
| ------------------------------------ | ------- | ---------- | -------- |
| `claude-opus-4-1` / `claude-opus-4`  | $15.00  | $1.50      | $75.00   |
| `claude-haiku-3-5`                   | $0.80   | $0.08      | $4.00    |

**Notable event — Opus 4.7 tokenizer change (April 16, 2026):**

A new tokenizer was deployed for claude-opus-4-7 on April 16, 2026 that generates up to 35% more tokens for the same input text. Per-token prices did not change, but effective cost per request can be up to 35% higher for sessions after this date compared to sessions before. This is not a billing model change — just affects token counts.

**Known gaps:**

- **Cache write TTL**: Anthropic supports 5-minute and 1-hour cache TTLs at different rates. The `cache_creation_tokens` field in telemetry does not distinguish between them. Claude Code CLI uses 5-minute caches by default, so the 5-minute rate is used. If 1-hour caches are in use, cost will be underestimated by ~37%.
- **Fast mode (`/fast`)**: When Claude Code's fast mode is active, Opus requests are billed at $30 input / $150 output per MTok — 6× the standard Opus rate. The model ID in telemetry does not carry a `-fast` suffix, so fast-mode sessions are costed at the standard Opus rate and will be significantly underestimated.
- **Deprecated models**: Models older than claude-opus-4 (e.g. claude-3-5-sonnet, claude-3-opus) may appear in historical sessions. Add them to `RATES` in `pricing.ts` if encountered; missing models show as `~$?`.

---

## Codex

Codex CLI uses OpenAI token-based pricing only — no request-multiplier system.

### Billing model — Token-based (input / cached input / output)

**Who it applies to:** All Codex CLI users.

**Sources:**

- Rate card (official, may require login): <https://help.openai.com/en/articles/20001106-codex-rate-card>
- Codex CLI pricing page (credits; divide by 25 for USD): <https://developers.openai.com/codex/pricing>
- API pricing (USD, includes codex models): <https://developers.openai.com/api/docs/pricing>
- `codex-mini-latest` model spec: <https://developers.openai.com/api/docs/models/codex-mini-latest>
- Prompt caching mechanics: <https://developers.openai.com/api/docs/guides/prompt-caching>
- Token concepts: <https://developers.openai.com/api/docs/concepts/tokens>

**Formula:**

```text
non_cached_input = gen_ai.usage.input_tokens - gen_ai.usage.cache_read.input_tokens
cost = (non_cached_input / 1_000_000 × inputRate)
     + (cacheReadTokens / 1_000_000 × cacheReadRate)
     + (outputTokens / 1_000_000 × outputRate)
```

**OTEL fields (from Codex CLI telemetry):**

On `handle_responses` spans (per-API-call):

- `gen_ai.usage.input_tokens` — total input including cached portion
- `gen_ai.usage.output_tokens` — total output including reasoning tokens
- `gen_ai.usage.cache_read.input_tokens` — cached portion of input
- `codex.usage.reasoning_output_tokens` — reasoning subset of output (billed at output rate; no separate reasoning rate observed)

On `session_task.turn` spans (per-turn aggregate):

- `codex.turn.token_usage.input_tokens`
- `codex.turn.token_usage.cached_input_tokens`
- `codex.turn.token_usage.non_cached_input_tokens`
- `codex.turn.token_usage.output_tokens`
- `codex.turn.token_usage.reasoning_output_tokens`

Model name available on `codex.user_prompt`, `codex.turn_ttft`, and `codex.tool_decision` spans via `model` attribute.

**Rates (USD per 1M tokens, verified 2026-05-28):**

| Model                   | Input   | Cached Input | Output  | Cache discount | Notes                                          |
| ----------------------- | ------- | ------------ | ------- | -------------- | ---------------------------------------------- |
| `gpt-5.5`               | $5.00   | $0.50        | $30.00  | 90%            | Flagship; used directly by Codex CLI           |
| `gpt-5.4`               | $2.50   | $0.25        | $15.00  | 90%            |                                                |
| `gpt-5.4-mini`          | $0.75   | $0.075       | $4.50   | 90%            |                                                |
| `gpt-5.3-codex`         | $1.75   | $0.175       | $14.00  | 90%            | Current primary Codex model                    |
| `gpt-5.3-codex-spark`   | TBD     | TBD          | TBD     | —              | Research preview, no rates published           |
| `gpt-5.2`               | $1.75   | $0.175       | $14.00  | 90%            | Deprecated                                     |
| `gpt-5.1-codex`         | $1.75   | $0.175       | $14.00  | 90%            | Deprecated                                     |
| `gpt-5.1-codex-mini`    | $0.75   | $0.075       | $4.50   | 90%            | Deprecated                                     |
| `codex-mini-latest`     | $1.50   | $0.375       | $6.00   | 75%            | Fine-tuned o4-mini; 200K ctx; deprecated       |

**Credits to USD conversion:** Rates on the Codex CLI pricing page are expressed in credits. 1 USD = 25 credits (verified: gpt-5.5 listed as 125 credits/MTok input = $5.00).

**Known gaps:**

- Long-context surcharges: `gpt-5.5` has a long-context tier ($10/$1.00/$45 above a certain token threshold — verify the cutoff from the API pricing page). Not yet implemented.
- `gpt-5.3-codex-spark`: research preview with no published rates.
- Reasoning tokens (`codex.usage.reasoning_output_tokens`): included in `gen_ai.usage.output_tokens` and billed at the standard output rate per available data; verify against the official rate card.

---

## Notes for maintainers

- The `PRICING_LAST_UPDATED` constant in `media/src/pricing.ts` surfaces in the UI. Update it whenever rates change.
- Model IDs in telemetry often include date suffixes (e.g. `claude-sonnet-4-6-20260501`).
  `normalizeModelId()` in `pricing.ts` strips these before table lookup.
- If a model appears in telemetry but is missing from the rate table, the UI shows `~$?` rather than $0
  to avoid silently under-reporting cost. Add the model to `RATES` in `pricing.ts` to resolve.
