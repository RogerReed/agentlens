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
```
cost = (inputTokens / 1_000_000 × inputRate)
     + (cacheReadTokens / 1_000_000 × cacheReadRate)
     + (cacheWriteTokens / 1_000_000 × cacheWriteRate)
     + (outputTokens / 1_000_000 × outputRate)
aiCredits = cost / 0.01
```

### Model 2 — Request-based with multipliers (pre-Jun 1, 2026)

**Who it applies to:** All Copilot plans before June 1, 2026 (active billing as of this file's date).

**Source:** <https://docs.github.com/en/copilot/concepts/billing/copilot-requests>

**What this page provides:**

- Per-model request multipliers (`multiplier` field in `ModelRates`)
- Clarification that only **user-initiated prompts** count as premium requests in agentic sessions —
  autonomous tool calls and internal LLM calls within a session do NOT count
- Models with a 0× multiplier are included and cost nothing under this model

**Formula:**
```
cost = userPromptCount × multiplier × $0.04
```

### Model 3 — Annual-plan request-based (post-Jun 1, 2026)

**Who it applies to:** Copilot annual-plan holders who opt to stay on request-based billing
after June 1, 2026. These users face significantly higher multipliers than the pre-June rates.

**Source:** <https://docs.github.com/en/copilot/reference/copilot-billing/model-multipliers-for-annual-plans>

**What this page provides:**

- Post-June multipliers for annual plan holders (`multiplierAnnualPostJun1` field in `ModelRates`)
- Formula is the same as Model 2 — only the multiplier values differ

**Formula:**
```
cost = userPromptCount × multiplierAnnualPostJun1 × $0.04
```

---

## Claude

Coming soon.

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
```
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

| Model | Input | Cached Input | Output | Cache discount | Notes |
| --- | --- | --- | --- | --- | --- |
| `gpt-5.5` | $5.00 | $0.50 | $30.00 | 90% | Flagship; used directly by Codex CLI |
| `gpt-5.4` | $2.50 | $0.25 | $15.00 | 90% | |
| `gpt-5.4-mini` | $0.75 | $0.075 | $4.50 | 90% | |
| `gpt-5.3-codex` | $1.75 | $0.175 | $14.00 | 90% | Current primary Codex model |
| `gpt-5.3-codex-spark` | TBD | TBD | TBD | — | Research preview, no rates published |
| `gpt-5.2` | $1.75 | $0.175 | $14.00 | 90% | Deprecated |
| `gpt-5.1-codex` | $1.75 | $0.175 | $14.00 | 90% | Deprecated |
| `gpt-5.1-codex-mini` | $0.75 | $0.075 | $4.50 | 90% | Deprecated |
| `codex-mini-latest` | $1.50 | $0.375 | $6.00 | 75% | Fine-tuned o4-mini; 200K ctx; deprecated |

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
