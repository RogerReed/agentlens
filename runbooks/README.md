# Runbooks

Recurring maintenance tasks in this repo — the kind that come up periodically, get done the same
way each time, and are easy to forget about between runs. This file is an index, not the
instructions themselves; each task's actual procedure lives in its own doc, linked below.

These are agent- or human-initiated on demand (e.g. "is pricing stale?"), not scheduled or
automated — there's no cron job or CI check that triggers them.

## Tasks

| Task | Trigger | Instructions |
| --- | --- | --- |
| Refresh model pricing | A vendor changes rates, adds/retires a model, or you notice cost estimates look off | [`PRICING_SOURCES.md`](../PRICING_SOURCES.md) |

## Adding a new runbook

1. Write the task's step-by-step procedure as a standalone doc. If it's tightly coupled to an
   existing root-level doc (like pricing is to `PRICING_SOURCES.md`), extend that doc instead of
   creating a new one. Otherwise, add a new file in this directory.
2. Include: what triggers the task, the exact steps in order, and how to verify the change
   (which tests/lint/build commands to run before considering it done).
3. Add a row to the table above.
