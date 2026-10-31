# CLI vs MCP: a real PipeOps agent experiment

I ran the same Codex model through the PipeOps CLI and the PipeOps MCP server to see how it discovered operations, answered deployment questions and attempted a small configuration change. This repository contains the public, redacted results from those runs on 31 October 2026.

The contents on `main` replace the earlier local simulation. That simulation is not evidence for the results below.

The production project is anonymized throughout this export. Credentials, account and project identifiers, private URLs, raw traces and Codex login files are excluded. You can inspect the evidence and reproduce the analysis without a PipeOps account.

## What I tested

| Stage | Request | Interfaces and conditions |
|---|---|---|
| Step 1 | Find the latest deployment, inspect recent logs, explain the last three deployments | CLI and MCP in separate fresh sessions, continuing within each three-task arm; the same prompts and a read-only service token |
| Step 1R | Repeat the three read tasks after naming the CLI in Task 1 | Fresh CLI session; only the availability sentence in the first prompt changed |
| Step 2 | Project-description change | Skipped because the saved MCP inventory says description updates are unsupported |
| Step 3a | Merge `AGENT_EXPERIMENT_A=1` without reading other variables or issuing a deploy command | Fresh CLI session using the machine's normal login, with no service token passed |
| Step 3a-R | Repeat 3a after naming the CLI | Fresh CLI session; only the availability sentence changed |
| Step 3b | Merge `AGENT_EXPERIMENT_B=1` | Fresh MCP session with the user-confirmed read-only token |
| Step 3c | The same B request | Fresh MCP session with the user-confirmed write-enabled token |

Every subject used **`gpt-6.1-sol`, high reasoning, Codex `0.166.0-alpha.5.1`, and the `workspace-write` sandbox with command network access**. The PipeOps CLI version was `0.2.104`. The baseline inventory listed **144 MCP tools**. [METHOD.md](METHOD.md) records the prompts, authentication differences and operator rules.

## What happened

### Naming the CLI changed whether the agent used it

The original prompt said, “PipeOps tools are available in this session.” In the original CLI arm, the agent looked for a connector and never invoked `pipeops`. It did not verify any of the three requested operational answers.

For Step 1R, I changed that sentence to:

> The PipeOps CLI (`pipeops`) is installed and logged in on this machine.

The agent then used CLI help, found the project, and answered both deployment questions. Its log queries returned empty or placeholder data, so it could not establish error and warning counts. I kept the original run and labelled the rerun separately because the prompt had changed.

| Read task | Original CLI | Clarified CLI rerun | MCP |
|---|---|---|---|
| Latest deployment | Unverified; no CLI invocation | Verified against the recorded baseline | Verified against the recorded baseline |
| Recent runtime logs | No log read | Counts unavailable from returned CLI data | Seven INFO entries; zero ERROR/WARNING entries; all seven were HTTP 401 access records |
| Last three deployments | Unverified; no history read | Three successful deployments and webhook triggers verified | Three successful deployments and webhook triggers verified |

The MCP log task needed one retry after a startup timeout. Its HTTP 401 **application log entries** are separate from the **environment-update authorization errors** in Step 3. Also, the CLI and MCP log observations occurred at different times and used different queries, so this was not a simultaneous comparison of identical log data.

### The CLI update succeeded and automatically redeployed the app

Original 3a also stopped before using the CLI. In clarified 3a-R, the agent found the project and ran a one-key merge using the machine's normal CLI login. The command returned:

```text
[OK] Project environment variables merged
```

The agent issued no deployment command, but History showed a new **Env Changed** deployment that finished **RUNNING in 22 seconds**. Its final claim, “No deployment was triggered,” did not describe that automatic redeployment correctly.

The deployment listing stayed unchanged while deployment history gained the new record. I therefore checked both surfaces rather than treating a successful command or an unchanged listing as complete verification.

### Both MCP update runs received the same server error

I configured both clean MCP homes to allow `update_project_env_variables`. Codex allowed the calls. The tool returned an upstream PipeOps API response containing:

```text
401 invalid or unauthorized service account token
```

| Run | Update calls | Result | New deployment |
|---|---:|---|---|
| Original CLI 3a | 0 | Agent declined before a CLI request | None |
| Clarified CLI 3a-R | 1 | Merge succeeded using normal CLI login | One Env Changed deployment |
| MCP 3b, read-only token | 1 | Upstream HTTP 401 | None |
| MCP 3c, write-enabled token | 2 | Same upstream HTTP 401 on both subject attempts | None |

These were PipeOps tool responses, not Codex approval blocks. But the generic error does **not** establish that missing write scope caused the refusal. Both token roles failed, and both MCP agents sent the project slug while the successful CLI command used the project UUID. I did not resolve those differences with another write test.

### The saved tool description did not warn about redeployment

The exact entry for `update_project_env_variables` in the saved baseline inventory reads:

> Update project environment variables; merges by default or replaces all when requested.

That sentence and the observed CLI success output do not mention redeployment. The inventory itself says its descriptions were **condensed from metadata**. This is evidence about that saved wording, not a claim that the complete live MCP schema, every tool response or the PipeOps documentation lacks a warning. See the [saved inventory](evidence/mcp-tools.md).

## What the results mean

The experiment shows how interface discovery, available operations, client approvals, credentials and server responses affected these particular runs. The agent needed a clearer CLI availability cue. CLI discovery continued in later tasks. MCP supplied an advertised tool menu, and its environment-update calls passed Codex's approval layer before receiving API errors. The successful CLI change had a production consequence that the agent's final answer missed.

The results do not identify a universal winner. They do not isolate a token-scope effect, prove that service tokens can never update variables, or measure the token cost of MCP schemas alone. The arms differ in prompt wording, continuing context, authentication in Step 3, returned data, retries and request identifiers. One trial per condition provides observations, not a statistical benchmark.

## Inspect the evidence

- [RESULTS.md](RESULTS.md): detailed counts, token usage, elapsed time, failures and refusal attribution.
- [METHOD.md](METHOD.md): prompts, controls, changed conditions and guidance for an independent run.
- [data/runs.json](data/runs.json): 13 curated run records, action metadata and redacted final answers.
- [data/metrics.csv](data/metrics.csv): the same numeric measurements in a spreadsheet-friendly format.
- [Evidence index](evidence/README.md): redacted timelines, answers, inventory and startup failures.
- [PRIVACY.md](PRIVACY.md): what was removed and the limits of the public evidence.

The public timelines omit production read payloads, private host output and Python helper bodies. They preserve action order, statuses, measured counters and selected safe output. Original private JSONL traces and dashboard screenshots are not included.

## Reproduce the analysis

Clone this repository and run the offline scripts with Python 3.9 or later:

```bash
python3 scripts/summarize.py
python3 scripts/check_publication.py
```

The first command validates the exported counters and prints the measurements. The second checks file checksums, local Markdown links and common credential patterns. Neither script contacts PipeOps or performs cloud operations.

To run a new live experiment, use your own disposable project, credentials and current tools, following [METHOD.md](METHOD.md). These observations describe the versions and date above; a new run may behave differently.
