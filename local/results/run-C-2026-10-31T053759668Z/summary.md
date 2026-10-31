| # | Kind | Action | D/T/F (auto) | Result |
|---|------|--------|--------------|--------|
| 1 | command_execution | democtl projects list | T | exit 0 |
| 2 | command_execution | democtl projects deploy --project-id local-demo-project | T | exit 0 |
| 3 | command_execution | democtl deployments status --deployment-id deployment-1 | T | exit 0 |
| 4 | command_execution | democtl deployments logs --deployment-id deployment-1 --tail 100 | T | exit 0 |

- Observed action items: 4
- Discovery (auto): 0
- Task (auto): 4
- Failed (auto): 0
- Needs review (auto): 0
- Shell executions: 4
- MCP tool calls: 0
- Tokens: input_tokens=61441, cached_input_tokens=55168, cache_write_input_tokens=0, output_tokens=265, reasoning_output_tokens=0
- Run-level error events: 0

Review every label and outcome against the trace. One shell execution may contain multiple commands.
MCP discovery is not necessarily a visible action; tool schemas and instructions can still use context tokens.
These traces do not isolate schema token cost, and action count is not API request count.
