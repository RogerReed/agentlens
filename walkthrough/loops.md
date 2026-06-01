The **Sessions** tab continuously scans your sessions for five failure patterns. Expand any session and open the **Overview** sub-tab to see Insights:

| Signal | What it detects |
| --- | --- |
| **Tool Call Deadlock** | Same tool + arguments called 5+ times — agent not retaining results |
| **State Corruption Spiral** | File edited then reverted — agent oscillating between conflicting states |
| **Hallucination Amplification** | Same error recurring 3+ times — fix attempts not resolving root cause |
| **Escalating Scope** | Too many steps for task complexity — unclear success criteria |
| **Context Accumulation Loop** | Input tokens growing while output collapses — agent stuck |

Each detected signal shows the evidence and concrete examples (tool names, file paths, error messages). Use the **⧉** button to copy the recommended prompt to your clipboard, then paste it into your agent session. Use **Ignore** to dismiss a signal that represents intentional behavior.

Check the **Alerts** tab to configure proactive notifications when sessions exceed thresholds for context window usage, turn count, error rate, or tool repetition.
