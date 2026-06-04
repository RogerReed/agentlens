# AgentLens MCP
Before starting any task, use the agentlens MCP server to orient yourself:

- Call get_recent_sessions to see what was worked on recently and what it cost
- Call get_workspace_patterns to surface recurring efficiency problems and known traps

Only call find_relevant_context when your task keywords closely match past session
prompts (works well for established workflows like auth, tests, or a named component;
unreliable for new feature work — keyword overlap is weak and file suggestions will
often be wrong).
