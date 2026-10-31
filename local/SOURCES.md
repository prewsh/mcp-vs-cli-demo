# Source map

Implementation and article claims about this lab are supported by the code,
`integration-test-output.txt`, `PROTOCOL.md`, and the captured `results/` files.

External references checked on 2026-10-31:

- [MCP TypeScript SDK v2: first server](https://ts.sdk.modelcontextprotocol.io/v2/get-started/first-server): `McpServer`, `registerTool`, `serveStdio`, and stdio logging rules.
- [MCP TypeScript SDK v1: server](https://ts.sdk.modelcontextprotocol.io/server): local subprocess stdio transport and remote transport distinction. The implementation uses v2, pinned in `package-lock.json`.
- [OpenAI: non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode): `codex exec --json`, final-message output and ephemeral runs.
- [OpenAI: configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference): sandbox network setting and configuration controls.

Npm registry versions resolved during setup: `@modelcontextprotocol/server` and
`@modelcontextprotocol/client` 2.4.0, `zod` 4.6.7. Dependency audit reported zero
vulnerabilities after installing those versions. This is a setup observation,
not a guarantee about future dependency releases.
- [OpenAI: MCP setup](https://learn.chatgpt.com/docs/extend/mcp) and [configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference): server-level `default_tools_approval_mode` and explicit enabled-tool lists. The calibration error and corrected configuration are retained in `pilot-results/` and the runner source.
