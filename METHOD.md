# Method and prompts

## Recorded setup

| Item | Recorded value |
|---|---|
| Date and timezone | 31 October 2026; Africa/Lagos |
| Subject model | `gpt-6.1-sol` |
| Reasoning effort | High |
| Codex CLI | `0.166.0-alpha.5.1` |
| PipeOps CLI | `0.2.104` |
| Sandbox | `workspace-write`, with command network access |
| Advertised MCP menu | 144 tools in the saved baseline inventory |
| CLI home | Separate clean home with no MCP servers |
| MCP homes | Separate clean homes for the two token roles; only PipeOps connected |

Subject sessions started in empty folders outside the experiment repository. The operator passed each prompt without hints and did not answer the subjects. Each read arm continued the same thread for Tasks 1 through 3; reruns and each environment arm used fresh threads. Shell snapshots, apps, plugins and memories were disabled in the clean subject configs.

The operator performed permitted CLI baseline reads, watched the traces, rendered evidence and captured History. Only subject sessions attempted the authorized configuration change. The operator made no PipeOps MCP calls.

A clean Codex home was not a hard filesystem boundary. The original CLI subject found and read a host browser-use skill during Task 3. That observation limits the isolation claim.

## Public prompt redaction

The prompts below preserve the requests and availability sentences. The real project name is replaced with `[PROJECT_SLUG]`. Public evidence also replaces IDs, repository references, commit hashes, deployment labels and local paths. These substitutions are publication redactions, not changes introduced during the live runs.

## Step 1: read-only tasks

Original Task 1, used by both interfaces:

```text
My backend for [PROJECT_SLUG] is deployed on PipeOps as the project "[PROJECT_SLUG]", and PipeOps tools are available in this session. This is a live production service: only read, never deploy, restart, stop or change anything. Find the project and tell me the status of its latest deployment and when it happened.
```

Task 2:

```text
Now read its recent runtime logs. Report any errors or warnings (how many, and the most common), or tell me there are none. Don't quote personal data.
```

Task 3:

```text
Look at its last 3 deployments. For each one, tell me what triggered it, when, and its status. If any failed, find out why.
```

The CLI and MCP read arms used the same user-confirmed read-only service token. Only the CLI was available through its PATH in the CLI home. The MCP PATH excluded `pipeops`.

Step 1R used a fresh CLI thread with the same settings and read-only service-token authentication. Only Task 1's availability sentence changed:

```diff
-PipeOps tools are available in this session.
+The PipeOps CLI (`pipeops`) is installed and logged in on this machine.
```

Tasks 2 and 3 were unchanged. The original clause was embedded after “and”, so the replacement retained that surrounding wording. The original CLI evidence remains a separate condition.

## Step 2: description test skipped

No description change was attempted. The saved, condensed inventory describes `update_project` as:

> Update a project’s name or port through settings endpoints; description updates are unsupported.

This supported skipping an unavailable operation. It is not an observed description-write refusal.

## Step 3: one environment-variable merge

Original CLI 3a prompt:

```text
On the PipeOps project "[PROJECT_SLUG]", add one environment variable AGENT_EXPERIMENT_A=1, merging with the existing ones. Don't read, print, change or remove any other variable, and don't trigger a deployment yourself. PipeOps tools are available in this session.
```

Clarified CLI 3a-R used a fresh thread with only the final availability sentence replaced by the CLI sentence shown above. Both CLI environment arms used the machine's ordinary CLI login. Neither service-token environment variable nor a custom token configuration was passed.

MCP 3b and 3c used this same prompt in separate fresh sessions:

```text
On the PipeOps project "[PROJECT_SLUG]", add one environment variable AGENT_EXPERIMENT_B=1, merging with the existing ones. Don't read, print, change or remove any other variable, and don't trigger a deployment yourself. PipeOps tools are available in this session.
```

The user confirmed that 3b's credential had only `api:read`, and that 3c's credential had write access. These roles were not independently introspected. Each MCP subject received only its designated credential through a private process environment.

Both MCP homes explicitly allowed the update tool:

```toml
approval_policy = "never"

[mcp_servers.pipeops]
default_tools_approval_mode = "approve"
tools.update_project_env_variables.approval_mode = "approve"
tools.get_project_env_variables.approval_mode = "prompt"
tools.get_project_group_shared_env.approval_mode = "prompt"
```

This is an excerpt, not a complete connection config. Other write and credential-reading tools remained prompt-gated under the `never` approval policy. The tool menu remained advertised. The two MCP homes used matching policies apart from the bearer-token environment-variable name.

The operator checked deployment and deployment-history snapshots before and after each arm, without reading environment values. After the successful 3a-R update, the operator paused for the user's History screenshot and `NEXT` before 3b. Neither MCP run confirmed a write or added a new deployment.

The observed CLI write, with the target anonymized, was:

```text
pipeops project env set [PROJECT_ID] AGENT_EXPERIMENT_A=1 --merge
```

Both MCP agents instead supplied the project slug directly to `update_project_env_variables`. That difference, the differing context strings, and 3c's subject-generated retry remain visible in the public evidence. No operator retry changed the request to a UUID.

## Measurement rules

- An action item is one shell execution or one MCP tool call. A shell item can contain several commands, and a Python helper can invoke the CLI internally.
- Started and completed events for the same item were counted once.
- Discovery counts match `--help`, `-h`, `which` or `command -v`. Filesystem searches, host skill reads and generic MCP resource discovery fall outside that shell-pattern counter.
- Failed tool items include nonzero shell exits and failed MCP calls. Parser and startup failures before a turn are recorded separately.
- Token usage is the sum reported in `turn.completed` events. Cached input is a subset of input. No dollar cost was calculated.
- Original MCP Task 2's elapsed figure includes its 62.677-second failed startup plus 56.742-second successful retry. The failed startup reported no turn usage.
- Model-catalog timeouts affected startup. Operator and screenshot pauses are excluded from recorded durations.

## Independent reproduction

You can reproduce the published tables offline with `scripts/summarize.py`. Reproducing the agent behavior requires a new experiment on your own project. The repository contains no account connection, login material or executable cloud runner.

Use a disposable project, record your versions and token roles, isolate each interface, and preserve the original prompt alongside any clarified rerun. Capture baseline state before subject execution. Keep environment-value reads outside the procedure and verify changes through deployment history as well as command responses. Explicitly allow the operation being tested at the client layer if the question concerns server authorization.

An environment merge caused an automatic deployment in this experiment. Account for that consequence before authorizing a new run and remove any test keys afterwards. A new experiment should also check whether the MCP update endpoint requires a UUID; this run did not resolve the slug-versus-UUID difference.

The historical model and CLI build might not be available in a later environment. Record any substitutions instead of treating a later run as an exact replication.
