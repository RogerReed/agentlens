# Pricing Sources

This file records exactly where each agent's billing data is retrieved from, and the current
best-known rates for each model. It's a reference + refresh runbook, not a changelog — pricing
corrections that change displayed cost belong in `CHANGELOG.md` at release time, not here.

## How to refresh this file

Do this on its own branch, with its own PR, scoped to pricing changes only — don't bundle a
pricing refresh into a PR that also does something else. This keeps `git blame` on the rate tables
meaningful (every pricing PR is a pricing PR, nothing more) and makes each refresh easy to review
and revert independently if a source turns out to have been misread.

1. Fetch each source URL below and compare against the rate tables here.
2. Update `RATES` in both `src/pricing.ts` and `media/src/pricing.ts` to match. See
   "Notes for maintainers" at the bottom for lookup/normalization details.
3. If you added, removed, or renamed a model key in `RATES`, update `PRICING_SECTIONS` in
   `media/src/pricing.ts` to match — it's the vendor grouping + source citations the in-app Pricing
   page (`$` icon in the header, `media/src/tabs/Pricing.tsx`) renders. A model left out doesn't go
   missing — the page has an "Uncategorized" fallback for exactly this — but it should still land in
   the right vendor group rather than sit there as a nudge to finish the job. If a source URL in a
   section changed, update `PRICING_SECTIONS[].sources` too.
4. Bump every date that records when pricing was last verified — there's more than one, and it's
   easy to miss one:
   - `PRICING_LAST_UPDATED` in `media/src/pricing.ts`
   - The `PRICING_LAST_UPDATED: <date>` comment at the top of `src/pricing.ts`
   - Every per-section "verified `<date>`" source line below, for whichever sections you actually
     re-checked
   - The matching `PRICING_SECTIONS[].verified` date(s) in `media/src/pricing.ts` — these mirror the
     sections below and drive the "verified `<date>`" text shown on the in-app Pricing page itself
   - `ARCHITECTURE.md`'s "Cost Calculation" section — it has its own "Last updated: `<date>`" line
     independent of the two constants above (found missed once already; check it every time)
5. Run `tsc --noEmit` (both configs), `eslint src media/src`, and `mocha` to confirm nothing broke.
6. If a rate or model can't be confirmed from a source, add it to that section's "Known gaps"
   instead of guessing.

---

## Copilot

Copilot has three billing models depending on plan type and date.

### Model 1 — Token-based AI Credits (from Jun 1, 2026)

**Who it applies to:** All Copilot plans on the new billing model, default from June 1, 2026.

**Source:** <https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing> (verified 2026-08-12)

**What this page provides:**

- Per-model token rates: `inputPerMTok`, `cacheReadPerMTok`, `cacheWritePerMTok`, `outputPerMTok` (USD per 1M tokens)
- List of included models (effectively $0 — look for models with no token rate listed)
- Per-model "long context" surcharge tiers for some models — 2x input/cache-read/cache-write, 1.5x
  output above a per-model token-per-call threshold (272K for GPT-5.4/5.5/5.6-Sol/5.6-Terra, 200K
  for GPT-5.6-Luna/Gemini 3.1 Pro/Grok 4.5). Modeled in `RATES` via `longContextThresholdTokens` +
  the `*AboveThresholdPerMTok` fields (`src/pricing.ts` only — `media/src/pricing.ts`'s
  session-level estimate stays flat-rate, see that file's own comment for why).

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

**Source:** <https://docs.github.com/en/copilot/reference/copilot-billing/model-multipliers-for-annual-plans> (verified 2026-08-12)

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
- `gpt-4o`, `gpt-4o-mini` are no longer listed on the current AI Credits pricing page at all (paid
  or included). Kept in `RATES` at their legacy rate for historical/legacy sessions; treat as
  deprecated. `gpt-4.1` is **not** listed on Copilot's own model pricing page as of 2026-08-12
  (confirmed absent, re-checked twice this refresh) — but it's still live on OpenAI's general API
  pricing page at the same rate ($2.00/$0.50/$8.00) that Codex CLI uses directly (see the Codex
  section below), so `RATES` is left unchanged. Copilot apparently just doesn't currently offer it
  as a selectable model; that's a different thing from the rate being wrong.
- `gpt-5.1-codex`, `gpt-5.1-codex-mini`, `gpt-5.1-codex-max`: not independently re-confirmed in the
  2026-08-07 refresh — absent from the general API pricing page (only base `gpt-5.1` was listed,
  and it turned out to have been repriced down to $1.25/$10.00 from $1.75/$14.00). Left unchanged
  at their prior values on the assumption they didn't move, but that's unverified — re-check next
  refresh.
- **New third-party marketplace models** (`grok-4.5`, `kimi-k3`, `gemini-3.6-flash`): added
  2026-08-07 from the Copilot pricing page. Exact telemetry model-ID slugs are unconfirmed (guessed
  from the docs display name, following the existing naming convention) — verify against real
  telemetry when encountered. `mai-code-1.1-flash` added 2026-08-12 on the same basis (new on the
  pricing page this refresh, slug guessed from display name). Separately: `grok-4.5`, `kimi-k3`,
  `kimi-k2.7-code`, and `mai-code-1-flash` existed in `media/src/pricing.ts` (browser) but had never
  been added to `src/pricing.ts` (extension host) — a real sync gap, not a rate error, that made
  `cost_usd` store as `0` rather than the correct amount for any Copilot session using them. Fixed
  2026-08-12; both files now match.

---

## Claude

Claude Code CLI uses Anthropic API token-based pricing only — no request-multiplier system.

### Billing model — Token-based (input / cache write / cache read / output)

**Who it applies to:** All Claude Code CLI users billed through the Anthropic API.

**Source:** <https://platform.claude.com/docs/en/about-claude/pricing> (verified 2026-08-12)

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

**Rates (USD per 1M tokens, verified 2026-08-12):**

| Model                                                                  | Input  | Cache Write (5m) | Cache Write (1h) | Cache Read | Output  |
| ----------------------------------------------------------------------- | ------ | ----------------- | ----------------- | ---------- | ------- |
| `claude-opus-5`                                                          | $5.00  | $6.25              | $10.00             | $0.50      | $25.00  |
| `claude-opus-4-8`                                                        | $5.00  | $6.25              | $10.00             | $0.50      | $25.00  |
| `claude-opus-4-7`                                                        | $5.00  | $6.25              | $10.00             | $0.50      | $25.00  |
| `claude-opus-4-6`                                                        | $5.00  | $6.25              | $10.00             | $0.50      | $25.00  |
| `claude-opus-4-5`                                                        | $5.00  | $6.25              | $10.00             | $0.50      | $25.00  |
| `claude-sonnet-5` (standard — see note below)                           | $2.00  | $2.50              | $4.00              | $0.20      | $10.00  |
| `claude-sonnet-4-6`                                                      | $3.00  | $3.75              | $6.00              | $0.30      | $15.00  |
| `claude-sonnet-4-5`                                                      | $3.00  | $3.75              | $6.00              | $0.30      | $15.00  |
| `claude-sonnet-4`                                                        | $3.00  | $3.75              | $6.00              | $0.30      | $15.00  |
| `claude-haiku-4-5`                                                       | $1.00  | $1.25              | $2.00              | $0.10      | $5.00   |
| `claude-fable-5`                                                         | $10.00 | $12.50             | $20.00             | $1.00      | $50.00  |
| `claude-mythos-5` (limited availability, see anthropic.com/glasswing)   | $10.00 | $12.50             | $20.00             | $1.00      | $50.00  |
| `claude-opus-5` (fast mode, 2x)                                          | $10.00 | $12.50             | $20.00             | $1.00      | $50.00  |
| `claude-opus-4-8` (fast mode, 2x)                                        | $10.00 | $12.50             | $20.00             | $1.00      | $50.00  |
| `claude-opus-4-7` (fast mode, 6x — **historical only, removed**)        | $30.00 | $37.50             | $60.00             | $3.00      | $150.00 |
| `claude-opus-4-6` (fast mode — bills at standard rate, see note below)  | $5.00  | $6.25              | $10.00             | $0.50      | $25.00  |

Fast mode is currently available only for Opus 5 and Opus 4.8 (both listed together, same rate, on
Anthropic's fast-mode pricing table). Anthropic's docs continue to confirm (re-checked 2026-08-12)
that Opus 4.7 fast mode has been removed — requests with `speed: "fast"` now return an error
rather than being billed. Its `-fast` entry in `RATES` is frozen for historical sessions only.
`claude-opus-4-6` still doesn't support fast mode — requests with `speed: "fast"` run at standard
speed and bill at the standard rate, so its `-fast` entry is set equal to the standard rate rather
than a multiplied one.

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
- **Deprecated models**: Models older than claude-opus-4 (e.g. claude-3-5-sonnet, claude-3-opus) may appear in historical sessions. Add them to `RATES` in `pricing.ts` if encountered; missing models show as `~$?`.

---

## Codex

Codex CLI uses OpenAI token-based pricing only — no request-multiplier system.

### Billing model — Token-based (input / cached input / output)

**Who it applies to:** All Codex CLI users.

**Sources:**

- Rate card (official, may require login): <https://help.openai.com/en/articles/20001106-codex-rate-card> — returned 403 on 2026-07-19; requires an authenticated session to fetch. Not re-attempted since.
- Codex CLI pricing page (credits; divide by 25 for USD): <https://developers.openai.com/codex/pricing> — as of 2026-08-07 this 308-redirects to <https://learn.chatgpt.com/docs/pricing>; use that URL directly.
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

**Rates (USD per 1M tokens, verified 2026-08-12):**

| Model                   | Input   | Cached Input | Cache Write | Output  | Cache discount | Notes                                          |
| ----------------------- | ------- | ------------ | ----------- | ------- | -------------- | ---------------------------------------------- |
| `gpt-5.6-sol`           | $5.00   | $0.50        | $6.25       | $30.00  | 90%            | Flagship; same rate as gpt-5.5; long-context surcharge tier above 272K (2x input/cache, 1.5x output) |
| `gpt-5.6-terra`         | $2.00   | $0.20        | $2.50       | $12.00  | 90%            | Mid tier. Long-context surcharge tier above 272K |
| `gpt-5.6-luna`          | $0.20   | $0.02        | $0.25       | $1.20   | 90%            | Small/fast tier. Long-context surcharge tier above 200K (lower threshold than the rest of the 5.6 family) |
| `gpt-5.5`               | $5.00   | $0.50        | —           | $30.00  | 90%            | Long-context surcharge tier above 272K |
| `gpt-5.4`               | $2.50   | $0.25        | —           | $15.00  | 90%            | Long-context surcharge tier above 272K |
| `gpt-5.4-mini`          | $0.75   | $0.075       | —           | $4.50   | 90%            |                                                 |
| `gpt-5.3-codex`         | $1.75   | $0.175       | —           | $14.00  | 90%            | Deprecated — superseded by the GPT-5.6 family  |
| `gpt-5.3-codex-spark`   | TBD     | TBD          | —           | TBD     | —              | Research preview; specialized low-latency hardware; not available in the API, no rates published |
| `gpt-5.2`               | $1.75   | $0.175       | —           | $14.00  | 90%            | Deprecated                                     |
| `gpt-5.1`               | $1.25   | $0.125       | —           | $10.00  | 90%            | Corrected 2026-08-07 (was $1.75/$14.00 — repriced down below gpt-5.2) |
| `gpt-5.1-codex`         | $1.75   | $0.175       | —           | $14.00  | 90%            | Deprecated; not independently re-confirmed 2026-08-12 (see Known gaps) |
| `gpt-5.1-codex-mini`    | $0.75   | $0.075       | —           | $4.50   | 90%            | Deprecated; not independently re-confirmed 2026-08-12 (see Known gaps) |
| `gpt-4.1`               | $2.00   | $0.50        | —           | $8.00   | 75%            | Confirmed 2026-08-12 on OpenAI's general API pricing page (not currently on Copilot's own model list — see the Copilot section's Known gaps) |
| `gpt-4.1-mini`          | $0.40   | $0.10        | —           | $1.60   | 75%            | Added 2026-08-12 — new to `RATES`, confirmed on the API pricing page |
| `codex-mini-latest`     | $1.50   | $0.375       | —           | $6.00   | 75%            | Fine-tuned o4-mini; 200K ctx; deprecated       |

**Credits to USD conversion:** Rates on the Codex CLI pricing page are expressed in credits. 1 USD = 25 credits — verify by checking `inputPerMTok × 25` against the listed credits figure for any current model (e.g. gpt-5.6-sol: $5.00 × 25 = 125 credits, matching the page).

**Known gaps:**

- `gpt-5.3-codex-spark`: research preview with no published rates.
- Reasoning tokens (`codex.usage.reasoning_output_tokens`): included in `gen_ai.usage.output_tokens` and billed at the standard output rate per available data; verify against the official rate card once it's fetchable (see Sources above).
- Which GPT-5.6 variant (Sol/Terra/Luna) is the actual default model invoked by plain `codex` CLI runs (as opposed to an explicit model flag) is not confirmed by public docs.
- `gpt-5.1-codex`, `gpt-5.1-codex-mini`, `gpt-5.1-codex-max`: absent from the general API pricing
  page during both the 2026-08-07 and 2026-08-12 refreshes (only base `gpt-5.1` is listed, and it
  had in fact been repriced back on 2026-08-07). Left unchanged on the assumption they didn't move
  — re-verify next refresh, ideally against the auth-gated rate card directly.

---

## OpenCode

OpenCode uses token-based pricing for third-party models (routed through its provider abstraction) and offers a free stealth model called **big-pickle** during a limited evaluation period.

### Free Zen-exclusive models

**Who it applies to:** Users of OpenCode's built-in Zen model tier during each model's limited evaluation period.

**Source:** <https://opencode.ai/docs/zen/> (verified 2026-08-12)

**Rates:** $0 — free during evaluation. All token fields (`inputPerMTok`, `cacheReadPerMTok`, `cacheWritePerMTok`, `outputPerMTok`) are set to 0 in the rate table.

**Models in `RATES` (all free, all subject to becoming paid without notice — re-check the source URL periodically):**

- `big-pickle` — OpenCode's own stealth model
- `deepseek-v4-flash-free`, `mimo-v2.5-free`, `hy3-free`, `laguna-s-2.1-free`, `ling-3.0-tiny-free`, `nemotron-3-ultra-free`, `nemotron-3.5-lightning-free` — added 2026-08-12, exact ID slugs confirmed from the Zen docs (previously withheld pending confirmation)

**Model ID in OpenCode SQLite:** Stored as JSON `{"id":"<model-id>","providerID":"opencode"}` in the `model` column of the `session` table. AgentLens extracts the `id` field and normalizes it for rate lookup.

**Known gaps:**

- All of the above are free "during limited evaluation" — any may become paid in the future. Check the source URL and update `RATES` when rates are published.
- Two models previously listed in this file's Known gaps — **North Mini Code Free** and **LongCat-2.0 Free** — were not found on the Zen docs page during the 2026-08-12 refresh. Unclear whether they were renamed, retired, or just missed by this pass; not removed from anywhere since they were never added to `RATES` in the first place. Re-check next refresh.
- OpenCode Zen also lists 40+ paid third-party models (GPT, Claude, Gemini, Grok, DeepSeek, Qwen, MiniMax, GLM, Kimi families) not covered here — those are billed by the underlying provider at standard rates; AgentLens applies the provider's published rates for those models automatically via the existing per-provider entries in `RATES` (not OpenCode-specific ones).
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
