# Captured local results

Reported series: 2026-10-31, Africa/Lagos. Fixed order A, C, B. One trial per condition.

| Metric | A: CLI | C: CLI + AGENTS.md | B: MCP |
|---|---:|---:|---:|
| Visible action items | 6 | 4 | 5 |
| Shell executions | 6 | 4 | 1 |
| MCP calls | 0 | 0 | 4 |
| Discovery items (manual review) | 2 | 0 | 1 |
| Nonzero shell items | 0 | 0 | 1 |
| Failed backend operations | 0 | 0 | 0 |
| Deployment-service requests | 4 | 4 | 4 |
| Elapsed seconds | 19.011 | 18.107 | 21.48 |
| Reported input tokens | 73461 | 61441 | 62148 |
| Cached input tokens (subset) | 57344 | 55168 | 55424 |
| Reported output tokens | 359 | 265 | 366 |

All three reports passed the four task checks: found the project, started a new deployment, correctly reported success, and reported the planted runtime error. None added an explicit configuration-fix recommendation, so each has four of the protocol's five checks. The fifth was not requested by the task prompt.

Manual review: A used `command -v democtl` and `democtl --help` before its four operations. C used the four operations directly. B first ran a shell discovery item ending with `command -v democtl`, which exited 1 as the CLI was absent; its four MCP operations then succeeded. The counter labels the nonzero discovery shell item F. It is not a failed deployment-service request.

All operational requests used the expected adapter label. No source/answer-key reads, direct backend API calls, absolute-path CLI fallback in B, or coaching appeared in the reviewed traces. Context isolation does not enforce a hard host filesystem boundary.

The audit snapshots contain only requests made during the agent run. Post-run verifier requests and internal HTTP health probes are outside that metric. MCP initialization/tool listing is also outside it.

Input totals include cached input. Different model turn paths, prompt replay and cache behavior prevent isolating schema overhead from these totals. Do not infer cost or general speed rankings from one run per condition.

The earlier full calibration series is retained under [pilot-results](../pilot-results/README.md). B hit a Codex approval-policy error before any backend operation. The runner was corrected and all three conditions were collected again. Source hashes distinguish the series.

- A: [trace](run-A-2026-10-31T053731900Z/trace.jsonl), [actions](run-A-2026-10-31T053731900Z/actions.json), [report](run-A-2026-10-31T053731900Z/final-answer.md), [audit](run-A-2026-10-31T053731900Z/audit.jsonl), [verification](run-A-2026-10-31T053731900Z/verification.json), [metadata](run-A-2026-10-31T053731900Z/metadata.json).

- C: [trace](run-C-2026-10-31T053759668Z/trace.jsonl), [actions](run-C-2026-10-31T053759668Z/actions.json), [report](run-C-2026-10-31T053759668Z/final-answer.md), [audit](run-C-2026-10-31T053759668Z/audit.jsonl), [verification](run-C-2026-10-31T053759668Z/verification.json), [metadata](run-C-2026-10-31T053759668Z/metadata.json).

- B: [trace](run-B-2026-10-31T053828844Z/trace.jsonl), [actions](run-B-2026-10-31T053828844Z/actions.json), [report](run-B-2026-10-31T053828844Z/final-answer.md), [audit](run-B-2026-10-31T053828844Z/audit.jsonl), [verification](run-B-2026-10-31T053828844Z/verification.json), [metadata](run-B-2026-10-31T053828844Z/metadata.json).
