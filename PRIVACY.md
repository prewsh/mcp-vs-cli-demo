# Public evidence and privacy

This repository is a curated publication export. The original private experiment directory was not copied into Git.

## Included

- Measured action counts, timing, token usage, exit status and run conditions.
- Redacted prompts, final answers and action timelines.
- Selected output: public help excerpts, the safe merge confirmation, the timestamp-parsing error and identifier-redacted server refusals.
- The subject-generated inventory of 144 MCP tools, whose descriptions were condensed from metadata.
- Offline analysis and publication checks.

## Excluded or replaced

- Both PipeOps credentials, access/refresh tokens, cookies and authorization headers.
- Codex authentication files, clean homes, session databases and shell snapshots.
- Raw JSONL traces, raw logs, production response payloads and Python helper bodies.
- Project/workspace/deployment UUIDs, thread IDs, source repository references, commit hashes, private URLs, host paths and account details.
- Original dashboard screenshots and experiment archives.

Project targets use `[PROJECT_SLUG]` and `[PROJECT_ID]`. Workspace identifiers use `[WORKSPACE_ID]`. Deployment labels are aliases such as `DEPLOYMENT_ENV_A`. Timestamp and numeric measurement values are retained where they support the results. The test key names and their nonsensitive value `1` are retained to explain the experiment.

The API error wording is preserved, but identifiers in its URL are redacted. This is not a byte-for-byte publication of the private trace. Production read results are withheld, so public readers can verify the exported counters and reported observations rather than independently reconstruct every live project-state check.

## Checks before publication

The export was built in a separate directory using selected fields. The outgoing files were checked for common credential formats, private identifiers and host paths. The old repository history was also checked for credential patterns before the replacement commit. No matches were found by those checks. Pattern scanning is not a guarantee that arbitrary text can never contain sensitive information.

`scripts/check_publication.py` verifies the published file checksums, local Markdown links, allowed file types and common credential patterns. Keep future raw evidence outside this repository and review any new material before publishing it.

Deleting a token from a file does not revoke it. Token revocation and removal of the successful test key remain account-owner actions outside this public repository.
