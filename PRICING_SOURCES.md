# Pricing Sources

This file records exactly where each agent's billing data is retrieved from, and the current
best-known rates for each model. It's a reference + refresh runbook, not a changelog — pricing
corrections that change displayed cost belong in `CHANGELOG.md` at release time, not here.

## How to refresh this file

1. Fetch each source URL below and compare against the rate tables here.
2. Update `RATES` in both `src/pricing.ts` and `media/src/pricing.ts` to match. See
   "Notes for maintainers" at the bottom for lookup/normalization details.
3. Bump `PRICING_LAST_UPDATED` in `media/src/pricing.ts` and the "verified" dates below.
4. Run `tsc --noEmit` (both configs), `eslint src media/src`, and `mocha` to confirm nothing broke.
5. If a rate or model can't be confirmed from a source, add it to that section's "Known gaps"
   instead of guessing.

---

## Copilot

Copilot has three billing models depending on plan type and date.

### Model 1 — Token-based AI Credits (from Jun 1, 2026)

**Who it applies to:** All Copilot plans on the new billing model, default from June 1, 2026.

**Source:** <https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing> (verified 2026-07-19)

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

**Source:** <https://docs.github.com/en/copilot/reference/copilot-billing/model-multipliers-for-annual-plans> (verified 2026-07-19)

**What this page provides:**

- Post-June multipliers for annual plan holders (`multiplierAnnualPostJun1` field in `ModelRates`)
- Formula is the same as Model 3 — only the multiplier values differ
- A separate note: Copilot code review has a model multiplier of 13 (each code review request
  deducts 13 from the premium request quota) — see Known gaps below

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

This model is now fully historical (we're past the June 1, 2026 cutover), so its source page no
longer lists per-model multipliers directly — it points to the annual-plan legacy page instead,
which 404s. `multiplier` values in `RATES` are frozen at their last-known state for historical
sessions; don't expect to re-verify them.

**Known gaps:**

- **Copilot code review multiplier**: not currently modeled in `pricing.ts` — AgentLens doesn't
  distinguish code-review-triggered requests from regular premium requests.
- `gpt-4.1`, `gpt-4o`, `gpt-4o-mini` are no longer listed on the current AI Credits pricing page
  at all (paid or included). Kept in `RATES` at their legacy rate for historical/legacy sessions;
  treat as deprecated.

---

## Claude

Claude Code CLI uses Anthropic API token-based pricing only — no request-multiplier system.

### Billing model — Token-based (input / cache write / cache read / output)

**Who it applies to:** All Claude Code CLI users billed through the Anthropic API.

**Source:** <https://platform.claude.com/docs/en/about-claude/pricing> (verified 2026-07-19)

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

**Rates (USD per 1M tokens, verified 2026-07-19):**

| Model                                                                  | Input  | Cache Write (5m) | Cache Write (1h) | Cache Read | Output  |
| ----------------------------------------------------------------------- | ------ | ----------------- | ----------------- | ---------- | ------- |
| `claude-opus-4-8`                                                        | $5.00  | $6.25              | $10.00             | $0.50      | $25.00  |
| `claude-opus-4-7`                                                        | $5.00  | $6.25              | $10.00             | $0.50      | $25.00  |
| `claude-opus-4-6`                                                        | $5.00  | $6.25              | $10.00             | $0.50      | $25.00  |
| `claude-opus-4-5`                                                        | $5.00  | $6.25              | $10.00             | $0.50      | $25.00  |
| `claude-sonnet-5` (introductory, through 2026-08-31)                     | $2.00  | $2.50              | $4.00              | $0.20      | $10.00  |
| `claude-sonnet-5` (standard, from 2026-09-01)                            | $3.00  | $3.75              | $6.00              | $0.30      | $15.00  |
| `claude-sonnet-4-6`                                                      | $3.00  | $3.75              | $6.00              | $0.30      | $15.00  |
| `claude-sonnet-4-5`                                                      | $3.00  | $3.75              | $6.00              | $0.30      | $15.00  |
| `claude-sonnet-4`                                                        | $3.00  | $3.75              | $6.00              | $0.30      | $15.00  |
| `claude-haiku-4-5`                                                       | $1.00  | $1.25              | $2.00              | $0.10      | $5.00   |
| `claude-fable-5`                                                         | $10.00 | $12.50             | $20.00             | $1.00      | $50.00  |
| `claude-mythos-5` (limited availability, see anthropic.com/glasswing)   | $10.00 | $12.50             | $20.00             | $1.00      | $50.00  |
| `claude-opus-4-8` (fast mode, 2x)                                        | $10.00 | $12.50             | $20.00             | $1.00      | $50.00  |
| `claude-opus-4-7` (fast mode, 6x)                                        | $30.00 | $37.50             | $60.00             | $3.00      | $150.00 |
| `claude-opus-4-6` (fast mode — bills at standard rate, see note below)  | $5.00  | $6.25              | $10.00             | $0.50      | $25.00  |

Fast mode is currently only available for Opus 4.7 and 4.8. `claude-opus-4-6` no longer supports
fast mode — requests with `speed: "fast"` run at standard speed and bill at the standard rate, so
its `-fast` entry in `RATES` is set equal to the standard rate rather than a multiplied one.
Opus 4.7 fast mode is deprecated and scheduled for removal on 2026-07-24 — after that date, check
whether the source page still lists it and update or drop the entry accordingly.

**Tiered pricing — `claude-sonnet-4` only:**

`claude-sonnet-4` has a two-tier rate structure where per-token rates increase once a single API call exceeds 200K tokens for a given token category. The tier is applied per-category (input, output, cache read, cache write each evaluated against the 200K threshold independently):

| Token category | ≤200K rate | >200K rate |
| -------------- | ---------- | ---------- |
| Input          | $3.00/MTok | $6.00/MTok |
| Output         | $15.00/MTok| $22.50/MTok|
| Cache write    | $3.75/MTok | $7.50/MTok |
| Cache read     | $0.30/MTok | $0.60/MTok |

The threshold applies per API call, not cumulatively across a session. `calcTokenCostUsd` in `src/pricing.ts` applies this tiered rate per turn (which corresponds to one API call). The session-level `calcTokenCost` in `media/src/pricing.ts` uses flat rates as an approximation because it operates on session totals rather than per-call counts.

**Deprecated models (for historical sessions):**

| Model                                | Input   | Cache Read | Output   |
| ------------------------------------ | ------- | ---------- | -------- |
| `claude-opus-4-1` / `claude-opus-4`  | $15.00  | $1.50      | $75.00   |
| `claude-haiku-3-5`                   | $0.80   | $0.08      | $4.00    |

**Tokenizer note:**

Claude Opus 4.7 and later Opus models, Claude Fable 5, Claude Mythos 5, Claude Mythos Preview, and Claude Sonnet 5 use a newer tokenizer that produces approximately 30% more tokens for the same input text than the previous tokenizer (used by Sonnet 4.6 and earlier). Per-token prices are unaffected — this only changes token counts, so effective cost per request can be meaningfully higher for these models even at the same rate card.

**Known gaps:**

- **Cache write TTL**: Anthropic supports 5-minute and 1-hour cache TTLs at different rates (1.25x and 2x base input price respectively; cache reads are 0.1x base input). The `cache_creation_tokens` field in telemetry does not distinguish between them. Claude Code CLI uses 5-minute caches by default, so the 5-minute rate is used. If 1-hour caches are in use, cost will be underestimated by roughly 37%.
- **Fast mode (`/fast`)**: When fast mode is active, `usage.speed` is `"fast"` in the log. AgentLens reads this and appends `-fast` to the stored model ID (e.g. `claude-opus-4-7-fast`) so the correct rate is applied. See the fast-mode note under the rate table above for current per-model status.
- **Data residency multiplier**: `inference_geo: "us"` (Opus 4.6, Sonnet 4.6, and later models) applies a 1.1x multiplier to all token pricing categories. Not currently modeled — cost is underestimated by ~10% for sessions pinned to US-only inference.
- **Sonnet 5 introductory pricing cutover**: the rate table currently holds the introductory rate ($2/$0.20/$2.50/$10). It must be updated by hand to the standard rate ($3/$0.30/$3.75/$15) on 2026-09-01, since there's no date-driven rate selection in `pricing.ts`.
- **Deprecated models**: Models older than claude-opus-4 (e.g. claude-3-5-sonnet, claude-3-opus) may appear in historical sessions. Add them to `RATES` in `pricing.ts` if encountered; missing models show as `~$?`.

---

## Codex

Codex CLI uses OpenAI token-based pricing only — no request-multiplier system.

### Billing model — Token-based (input / cached input / output)

**Who it applies to:** All Codex CLI users.

**Sources:**

- Rate card (official, may require login): <https://help.openai.com/en/articles/20001106-codex-rate-card> — returned 403 on 2026-07-19; requires an authenticated session to fetch.
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

**Rates (USD per 1M tokens, verified 2026-07-19):**

| Model                   | Input   | Cached Input | Output  | Cache discount | Notes                                          |
| ----------------------- | ------- | ------------ | ------- | -------------- | ---------------------------------------------- |
| `gpt-5.6-sol`           | $5.00   | $0.50        | $30.00  | 90%            | Flagship; same rate as gpt-5.5; has a long-context surcharge tier, threshold unconfirmed |
| `gpt-5.6-terra`         | $2.50   | $0.25        | $15.00  | 90%            | Mid tier; same rate as gpt-5.4                 |
| `gpt-5.6-luna`          | $1.00   | $0.10        | $6.00   | 90%            | Small/fast tier                                |
| `gpt-5.5`               | $5.00   | $0.50        | $30.00  | 90%            |                                                 |
| `gpt-5.4`               | $2.50   | $0.25        | $15.00  | 90%            |                                                 |
| `gpt-5.4-mini`          | $0.75   | $0.075       | $4.50   | 90%            |                                                 |
| `gpt-5.3-codex`         | $1.75   | $0.175       | $14.00  | 90%            | Deprecated — superseded by the GPT-5.6 family  |
| `gpt-5.3-codex-spark`   | TBD     | TBD          | TBD     | —              | Research preview; specialized low-latency hardware; not available in the API, no rates published |
| `gpt-5.2`               | $1.75   | $0.175       | $14.00  | 90%            | Deprecated                                     |
| `gpt-5.1-codex`         | $1.75   | $0.175       | $14.00  | 90%            | Deprecated                                     |
| `gpt-5.1-codex-mini`    | $0.75   | $0.075       | $4.50   | 90%            | Deprecated                                     |
| `codex-mini-latest`     | $1.50   | $0.375       | $6.00   | 75%            | Fine-tuned o4-mini; 200K ctx; deprecated       |

**Credits to USD conversion:** Rates on the Codex CLI pricing page are expressed in credits. 1 USD = 25 credits — verify by checking `inputPerMTok × 25` against the listed credits figure for any current model (e.g. gpt-5.6-sol: $5.00 × 25 = 125 credits, matching the page).

**Known gaps:**

- Long-context surcharges: `gpt-5.5` and `gpt-5.6-sol` have a long-context tier ($10/$1.00/$45 above a certain token threshold — verify the cutoff from the API pricing page). Not yet implemented.
- `gpt-5.3-codex-spark`: research preview with no published rates.
- Reasoning tokens (`codex.usage.reasoning_output_tokens`): included in `gen_ai.usage.output_tokens` and billed at the standard output rate per available data; verify against the official rate card once it's fetchable (see Sources above).
- Which GPT-5.6 variant (Sol/Terra/Luna) is the actual default model invoked by plain `codex` CLI runs (as opposed to an explicit model flag) is not confirmed by public docs.

---

## OpenCode

OpenCode uses token-based pricing for third-party models (routed through its provider abstraction) and offers a free stealth model called **big-pickle** during a limited evaluation period.

### big-pickle — OpenCode Zen free model

**Who it applies to:** Users of OpenCode's built-in Zen model tier during the limited evaluation period.

**Source:** <https://opencode.ai/docs/zen/> (verified 2026-07-19)

**Rates:** $0 — free during evaluation. All token fields (`inputPerMTok`, `cacheReadPerMTok`, `cacheWritePerMTok`, `outputPerMTok`) are set to 0 in the rate table.

**Model ID in OpenCode SQLite:** Stored as JSON `{"id":"big-pickle","providerID":"opencode"}` in the `model` column of the `session` table. AgentLens extracts the `id` field and normalizes it for rate lookup.

**Known gaps:**

- big-pickle pricing is stated as free "during limited evaluation" — it may become paid in the future. Check the source URL and update the rate table when rates are published.
- **Other free Zen-exclusive models not yet in `RATES`:** OpenCode Zen also lists DeepSeek V4 Flash Free, MiMo-V2.5 Free, North Mini Code Free, and Nemotron 3 Ultra Free as $0 models, alongside 40+ paid third-party models (GPT, Claude, Gemini, Grok, DeepSeek, Qwen, MiniMax, GLM, Kimi families). Not added here because their exact `id` string as it appears in the OpenCode SQLite `model` JSON column isn't confirmed — guessing the wrong slug would silently fail to match rather than cause harm (missing models fall back to `~$?`), but confirm from real telemetry (or the OpenCode Zen model list API) before adding.
- Other models used through OpenCode (e.g. Anthropic, OpenAI, or Google models routed via OpenCode's provider abstraction) are billed by the underlying provider at their standard rates. AgentLens applies the provider's published rates for those models automatically.

---

## Notes for maintainers

- The `PRICING_LAST_UPDATED` constant in `media/src/pricing.ts` surfaces in the UI. Update it whenever rates change.
- Model IDs in telemetry often include date suffixes (e.g. `claude-sonnet-4-6-20260501`).
  `normalizeModelId()` in `pricing.ts` strips these before table lookup.
- If a model appears in telemetry but is missing from the rate table, the UI shows `~$?` rather than $0
  to avoid silently under-reporting cost. Add the model to `RATES` in `pricing.ts` to resolve.
- Pricing corrections that change displayed cost for real sessions (not just new-model additions)
  are user-facing bug fixes — log them in `CHANGELOG.md` under `### Fixed` at the next release,
  same as any other bug.
