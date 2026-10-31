# If an AI agent can use a CLI, what does MCP add?

An AI agent with shell access can run a CLI, read its help, and use the output to decide what to do next. That already covers a lot of useful work. So I wanted to make the MCP question concrete: what changes when the same agent gets a tool schema instead of a command it has to learn?

I used a small local deployment experiment. The agent had to find a project, deploy it, check whether the deployment succeeded, inspect its runtime logs, and report errors. I ran the same task with a CLI, with an MCP server, and with the CLI plus an `AGENTS.md` containing its commands.

The app, deployment service and both adapters ran on my machine. Codex used a remote OpenAI model. There was no hosted PipeOps project involved. This matters because the results describe the interfaces I built for this lab, rather than the behavior of a production deployment platform.

The [repository](https://github.com/prewsh/mcp-vs-cli-demo) contains the code, exact prompt, instructions, traces and backend audit records.

The three conditions were:

| Run | Available deployment interface | Extra command reference |
|---|---|---|
| A | `democtl` CLI | None |
| C | `democtl` CLI | `AGENTS.md` |
| B | Local MCP server | Tool definitions and argument schemas |

Both adapters called the same localhost service and exposed four operations: list projects, start a deployment, get its status, and read runtime logs. Here, deployment meant starting the Flask app in a real Gunicorn worker. Dependency installation happened during setup. The service reported success after the worker answered its health endpoint.

I also gave the app one deliberate problem. When `DEMO_GREETING` was unset, it logged an error and continued with a fallback greeting:

```text
DEMO_GREETING environment variable is not set; falling back to default greeting.
```

Its `/health` endpoint still returned `{"status":"ok"}`. Finding an `ERROR` line and reporting a failed deployment would therefore be the wrong conclusion. The task required the agent to inspect both the deployment state and the logs.

I used Codex `0.166.0-alpha.5.1` with `gpt-6.1-sol`, high reasoning effort, and the same shell sandbox settings. Each run started with a fresh working folder, HOME, Codex home and local backend. I disabled the usual plugins, memories and other integrations. Run B had no `democtl` on PATH. I prepared C's instructions before collecting the trials and fixed the order as A, C, B. The [protocol](local/PROTOCOL.md) records these controls and their limits.

All three runs completed the requested work. Each found the project, started a new deployment, confirmed success and reported the missing environment variable. The verifier also checked the real HTTP health response and captured the startup error from the worker's logs.

The difference appeared in how the agent got to those operations:

| Observation | A: CLI | C: CLI + AGENTS.md | B: MCP |
|---|---:|---:|---:|
| Visible Codex action items | 6 | 4 | 5 |
| Shell executions | 6 | 4 | 1 |
| MCP calls | 0 | 0 | 4 |
| Deployment-service requests | 4 | 4 | 4 |
| Failed deployment-service operations | 0 | 0 | 0 |
| Elapsed time, seconds | 19.0 | 18.1 | 21.5 |

These numbers come from the [captured results](local/results/RESULTS.md), with links to each trace and audit record. They are individual observations from one trial per condition.

In A, the agent first checked that `democtl` existed, then ran `democtl --help`. The help response described the entire four-operation command surface. After that, the agent listed projects, deployed the matching project, read its logs and checked its status. It did not make an invalid deployment-service request.

In C, the agent went straight to the four operations. The instruction file already supplied commands such as:

```bash
democtl projects deploy --project-id PROJECT_ID
democtl deployments status --deployment-id DEPLOYMENT_ID
democtl deployments logs --deployment-id DEPLOYMENT_ID --tail 100
```

That removed the visible help step in this run. A short command reference was enough for the CLI workflow to complete the task with four shell executions.

B made the four matching MCP calls. It also spent one shell execution looking around the empty working folder and checking for `democtl`. That check ended with exit code 1 because the CLI was unavailable. The trace counter marks the item as failed, but no deployment-service operation failed. Counting it as an MCP deployment error would misrepresent what happened.

This is why I kept the backend audit alongside the agent trace. A shell execution can contain several commands. An MCP call is another unit. In this particular series, each task operation corresponded to one request to the shared deployment service. Internal health probes and the verifier's later checks sit outside that request count.

The useful comparison was the source of the agent's interface knowledge. In A, it came from CLI help during the session. In C, it came from an instruction file loaded as context. In B, the MCP server published named tools with argument schemas. I registered those tools with the [official MCP SDK](https://ts.sdk.modelcontextprotocol.io/v2/get-started/first-server), which validates arguments against the declared schemas before calling the handlers. The CLI had its own argument validation too.

I deliberately made the CLI return JSON by default. The experiment therefore gives no evidence for a claim that MCP succeeds because CLIs force an agent to parse human-formatted text. A CLI can provide structured output, and this one did. The distinction here was shell command syntax and documentation versus named protocol operations and schemas.

I would also avoid calling MCP discovery free. Tool definitions can consume context even when they do not appear as separate help commands. Codex reported input totals of 73,461 tokens for A, 61,441 for C and 62,148 for B; the corresponding cached-input fields were 57,344, 55,168 and 55,424. Cached input is part of the input total. The sessions took different paths, and these turn-level totals do not isolate the cost of schemas, instructions, repeated context or caching. The raw usage fields remain in the evidence rather than becoming a percentage-saving claim.

There was a setup failure before this reported series. My first runner configuration disabled approvals but did not explicitly approve the local MCP tools. Codex rejected B's first project-list call before it reached the backend. I retained that entire first A/C/B series under [pilot-results](local/pilot-results/README.md), configured explicit approval for the four authored local tools, and reran all three conditions under the corrected runner. The [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference) documents the server-level approval setting. This was a runner error, and it shows why listing tools successfully is not enough to prove that the agent can call them.

The final reports were also narrower than the full scoring rubric. All three performed the four requested behaviors. None added an explicit recommendation to set the missing variable, so each met four of the protocol's five checks. The prompt asked for errors, not remediation; I kept the extra recommendation as a separate observation.

For this small interface, CLI plus instructions was enough. The MCP route reached the same operational result through named tools and schemas. That is the conclusion these traces support. A larger command surface, unfamiliar flags, different error behavior or another agent client could produce a different result. The fixed order, one reported trial per condition and correction after inspecting the pilot also limit the comparison.

You can reproduce the setup with:

```bash
./local/setup.sh
npm test --prefix local

export MODEL=gpt-6.1-sol
export EFFORT=high
node local/run.mjs A
node local/run.mjs C
node local/run.mjs B
```

Use a model available to your account and keep it fixed across the series. The runner saves JSON traces using [Codex's non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode), records source hashes, and gives each trial a fresh backend.

I would use this lab to examine where an agent learns an interface and how it uses that knowledge. Before adding MCP to a system that already has a CLI, I would check the CLI's help, structured output and command reference, then test the actual workflow. This experiment gives me a working example of both paths and enough evidence to inspect the difference.
