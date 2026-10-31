# Retained calibration series: not the reported comparison

All first attempts are preserved here. A and C reached the local backend. B's
`list_projects` call was rejected by Codex with:

    MCP tool call requires approval, but approval policy is never

B made zero backend requests. This is a runner approval-configuration failure,
not an observed inability of MCP to deploy the application. No attempt was erased.

The next series retains the same sandbox, model, effort, prompt, backend, adapters
and C instructions, and explicitly approves/allowlists the four local MCP tools.
All three conditions were rerun, in A/C/B order, under the new runner hash.
