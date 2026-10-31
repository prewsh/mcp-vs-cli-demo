# Retained startup and parser failures

These failures occurred before subject tool execution and are separate from failed tool-item counts.

Three original resume attempts (CLI Tasks 2 and 3, and MCP Task 2) rejected a sandbox flag:

```text
error: unexpected argument '-s' found
```

Subsequent resumes used the equivalent `sandbox_mode` config setting. The installed fresh-exec interface still accepted `-s`.

One original MCP log-task startup failed before a turn:

```text
pipeops: timed out awaiting tools/list after 30s
```

That failed startup took 62.677 seconds. One unchanged retry completed in 56.742 seconds, so the comparison uses 119.419 seconds for that task. The failed startup emitted no turn usage; no token value is assigned to it.

Successful runs also emitted model-catalog refresh timeout diagnostics. Recorded elapsed time therefore includes startup overhead. Operator and screenshot pauses are excluded.
