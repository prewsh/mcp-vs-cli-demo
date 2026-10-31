| # | Kind | Action | D/T/F (auto) | Result |
|---|------|--------|--------------|--------|
| 1 | command_execution | command -v democtl | F | exit 1 |
| 2 | mcp_tool_call | local_lab.list_projects({}) | F | failed |

- Observed action items: 2
- Discovery (auto): 0
- Task (auto): 0
- Failed (auto): 2
- Needs review (auto): 0
- Shell executions: 1
- MCP tool calls: 1
- Tokens: input_tokens=36135, cached_input_tokens=33280, cache_write_input_tokens=0, output_tokens=273, reasoning_output_tokens=87
- Run-level error events: 0

Review every label and outcome against the trace. One shell execution may contain multiple commands.
MCP discovery is not necessarily a visible action; tool schemas and instructions can still use context tokens.
These traces do not isolate schema token cost, and action count is not API request count.
