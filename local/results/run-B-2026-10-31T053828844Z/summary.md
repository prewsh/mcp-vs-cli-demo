| # | Kind | Action | D/T/F (auto) | Result |
|---|------|--------|--------------|--------|
| 1 | command_execution | pwd; rg --files -g 'AGENTS.md' -g '*democtl*' -g 'README*' -g 'package.json' -g '"'!node_modules'"' -g '"'!vendor'"' .; command -v democtl | F | exit 1 |
| 2 | mcp_tool_call | local_lab.list_projects({}) | T | completed |
| 3 | mcp_tool_call | local_lab.deploy_project({"project_id": "local-demo-project"}) | T | completed |
| 4 | mcp_tool_call | local_lab.get_runtime_logs({"deployment_id": "deployment-1", "tail": 100}) | T | completed |
| 5 | mcp_tool_call | local_lab.get_deployment({"deployment_id": "deployment-1"}) | T | completed |

- Observed action items: 5
- Discovery (auto): 0
- Task (auto): 4
- Failed (auto): 1
- Needs review (auto): 0
- Shell executions: 1
- MCP tool calls: 4
- Tokens: input_tokens=62148, cached_input_tokens=55424, cache_write_input_tokens=0, output_tokens=366, reasoning_output_tokens=0
- Run-level error events: 0

Review every label and outcome against the trace. One shell execution may contain multiple commands.
MCP discovery is not necessarily a visible action; tool schemas and instructions can still use context tokens.
These traces do not isolate schema token cost, and action count is not API request count.
