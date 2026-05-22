The **Recommendations** tab continuously scans your sessions for five failure patterns:

| Signal | What it detects |
|---|---|
| **Tool Call Deadlock** | Same tool + arguments called 5+ times — agent not retaining results |
| **State Corruption Spiral** | File edited then reverted — agent oscillating between conflicting states |
| **Hallucination Amplification** | Same error recurring 3+ times — fix attempts not resolving root cause |
| **Escalating Scope** | Too many steps for task complexity — unclear success criteria |
| **Context Accumulation Loop** | Input tokens growing while output collapses — agent stuck |

Each detected signal shows the evidence, concrete examples (tool names, file paths, error messages), and an **Ask AI to Help** button that injects a summary of the issue into your chat session.

Check the **Alerts** tab to configure proactive notifications when sessions exceed thresholds for context window usage, turn count, error rate, or tool repetition.
