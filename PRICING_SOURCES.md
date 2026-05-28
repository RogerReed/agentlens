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

Coming soon.

---

## Notes for maintainers

- The `PRICING_LAST_UPDATED` constant in `media/src/pricing.ts` surfaces in the UI. Update it whenever rates change.
- Model IDs in telemetry often include date suffixes (e.g. `claude-sonnet-4-6-20260501`).
  `normalizeModelId()` in `pricing.ts` strips these before table lookup.
- If a model appears in telemetry but is missing from the rate table, the UI shows `~$?` rather than $0
  to avoid silently under-reporting cost. Add the model to `RATES` in `pricing.ts` to resolve.
