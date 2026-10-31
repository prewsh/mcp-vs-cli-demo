# Local experiment: protocol fixed before collection

Date: 2026-10-31, Africa/Lagos. One trial per condition, fixed order A, C, B.

| Condition | democtl CLI on PATH | local MCP server | CLI AGENTS.md |
|---|---|---|---|
| A | yes | no | no |
| C | yes | no | yes |
| B | no | yes | no |

Use identical `prompt.txt`, Codex 0.166.0-alpha.5.1, gpt-6.1-sol, high reasoning
effort, workspace-write sandbox with command network access. Capture exact binary
versions and source hashes. Fresh HOME, CODEX_HOME, work folder and backend for
each trial. Disable user plugins, apps, memory, host skills, browser tools, web
search and additional agents. No coaching during trials. Freeze C's instructions
from CLI help before collecting A. CLI outputs JSON by default in A and C.

The app, CLI, MCP server and deployment service run on localhost. Codex uses a
remote model: "local" describes the tool/app execution, not offline inference.
The service launches an actual Gunicorn worker for the existing Flask app. It
provides one seeded local project; no PipeOps resources or credentials are used.
CLI and MCP call the same endpoints with matching capabilities. The backend emits
an audit record with the adapter label for each operational request.

The task is to find the named project, deploy it, assess the new deployment,
inspect runtime logs and report errors. The app intentionally logs a nonfatal
missing-environment-variable error. It still serves a healthy endpoint. Keep that
variable unset in every trial. Do not give experimental agents the answer key or
app source as task context.

Score each final report for: correct project, triggered new deployment, correct
success assessment, observed planted runtime error, appropriate configuration
suggestion. An error log line is distinct from a failed deployment. Check claims
against backend audit, status, real HTTP health and captured process logs.

Record visible Codex action items, shell executions, MCP calls, backend requests,
help invocations, runtime-log reads, failures, elapsed time and reported tokens.
Inspect compound shell commands and classify them manually; one shell execution
may contain multiple backend operations. Do not equate shell item counts with MCP
calls or HTTP requests. MCP tool metadata has context overhead even if discovery
is not a visible action. Store actual tool schemas, not an invented schema cost.
Token totals include system/task/tool context; cached input is a subset of input.

One run per condition is a descriptive example. The CLI/parser and four MCP tools
are deliberately small, authored for this lab; results cannot establish real
PipeOps behavior or general CLI/MCP superiority. The simple CLI help exposes its
entire command surface in one response. Fixed ordering and prompt cache effects
also limit interpretation. Replication should preregister more trials and balance
orders.

Context isolation and PATH exclusion are not host filesystem isolation. Review
traces for reads of source/answer keys, absolute CLI invocation in B, or direct
backend API calls outside the adapters. Mark a deviating attempt instead of
silently replacing it. Public evidence must be checked for credentials before
commit. Any fixes after collection require a new series and new control hashes.

## Calibration correction before the reported series

The first attempted A/C/B series used approval policy `never` without an explicit
MCP server approval setting. B's first `list_projects` call was rejected by Codex
before reaching the backend. A and C had run successfully. Preserve all three
under `pilot-results/`; do not combine them with the reported series.

For the reported series, retain the same sandbox and prompt, explicitly approve
the four authored local MCP tools via `default_tools_approval_mode = "approve"`,
allowlist those tool names, and run A, C, B again from a new runtime root. This
setting applies only to the local lab server. Each CLI condition still has no
MCP connection. Runner source hashes distinguish the two series. This correction
was made after viewing the pilot outcomes, which is a limitation of this case study.
