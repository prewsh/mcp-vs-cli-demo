#!/usr/bin/env python3
"""Count observed Codex action items; retain failures and incomplete traces.

One command_execution item is one shell execution, even if it contains a pipeline
or several commands. Heuristic D/T/F labels require manual review.
"""
import argparse
import json
import re

DISCOVERY = re.compile(r"(?:--help\b|(?:^|\s)-h(?:\s|$)|--version\b|AGENTS\.md|^\s*(?:which|command -v|man|ls|find|rg|cat|head)\b)")


def unwrap(command):
    if isinstance(command, list):
        return " ".join(map(str, command))
    command = str(command)
    match = re.match(r"^(?:/bin/)?(?:bash|zsh|sh) -l?c\s+(['\"])(.*)\1$", command.strip(), re.S)
    return match.group(2) if match else command


def shorten(value, limit=140):
    value = " ".join(str(value).split())
    return value if len(value) <= limit else value[:limit-1] + "…"


def result_is_error(result):
    return isinstance(result, dict) and bool(result.get("isError") or result.get("is_error"))


def summarize(path):
    items, usage, errors, warnings = {}, {}, [], []
    completed_turns = 0
    with open(path) as stream:
        for number, line in enumerate(stream, 1):
            if not line.strip():
                continue
            try:
                event = json.loads(line)
            except json.JSONDecodeError:
                warnings.append(f"Malformed JSON at line {number}; action totals may be incomplete.")
                continue
            if not isinstance(event, dict):
                warnings.append(f"Non-object event at line {number}.")
                continue
            kind = event.get("type", "")
            if kind == "turn.completed":
                completed_turns += 1
                for key, value in (event.get("usage") or {}).items():
                    if isinstance(value, (int, float)) and not isinstance(value, bool):
                        usage[key] = usage.get(key, 0) + value
            if kind in ("error", "turn.failed"):
                errors.append(event)
            if kind not in ("item.started", "item.updated", "item.completed"):
                continue
            item = event.get("item") or {}
            if item.get("type") == "error":
                warnings.append("Codex diagnostic: " + str(item.get("message", "unknown error")))
                continue
            # Keep the final state of an item instead of counting start + completion.
            identity = item.get("id", f"line-{number}")
            items[identity] = (item, kind)
    actions = []
    non_actions = {"agent_message", "reasoning", "plan", "todo_list"}
    for identity, (item, event_kind) in items.items():
        kind = item.get("type", "unknown")
        if kind in non_actions:
            continue
        incomplete = event_kind != "item.completed"
        failed = item.get("status") == "failed" or bool(item.get("error"))
        label = "?"
        if kind == "command_execution":
            action = unwrap(item.get("command", ""))
            code = item.get("exit_code")
            failed = failed or code not in (0, None)
            result = f"exit {code}" if code is not None else item.get("status", "unknown")
            label = "D" if DISCOVERY.search(action) else "T"
        elif kind == "mcp_tool_call":
            action = f"{item.get('server','?')}.{item.get('tool','?')}({json.dumps(item.get('arguments',{}),ensure_ascii=False)})"
            failed = failed or result_is_error(item.get("result"))
            result = item.get("status", "unknown")
            label = "T"
        else:
            action = json.dumps(item, ensure_ascii=False)
            result = item.get("status", "review")
            if kind not in {"web_search", "file_change"}:
                warnings.append(f"Unclassified item type {kind}; review item {identity} before using totals.")
        if failed:
            label = "F"
        if incomplete:
            label, result = "?", "incomplete"
        actions.append(dict(id=identity, kind=kind, action=action, label=label,
                            result=result, failed=bool(failed), incomplete=incomplete))
    if not completed_turns:
        warnings.append("No turn.completed event: this is not a completed run; token usage may be unavailable.")
    return dict(actions=actions, usage=usage, errors=errors, warnings=warnings,
                completed_turns=completed_turns)


def table_cell(text):
    return shorten(text).replace("|", "&#124;").replace("`", "&#96;")


def render(summary):
    print("| # | Kind | Action | D/T/F (auto) | Result |")
    print("|---|------|--------|--------------|--------|")
    for number, action in enumerate(summary["actions"], 1):
        print(f"| {number} | {action['kind']} | {table_cell(action['action'])} | {action['label']} | {table_cell(action['result'])} |")
    print()
    print(f"- Observed action items: {len(summary['actions'])}")
    for label, description in [("D", "Discovery"), ("T", "Task"), ("F", "Failed"), ("?", "Needs review")]:
        print(f"- {description} (auto): {sum(a['label']==label for a in summary['actions'])}")
    print(f"- Shell executions: {sum(a['kind']=='command_execution' for a in summary['actions'])}")
    print(f"- MCP tool calls: {sum(a['kind']=='mcp_tool_call' for a in summary['actions'])}")
    print("- Tokens: " + (", ".join(f"{k}={v}" for k,v in summary["usage"].items()) or "unavailable"))
    print(f"- Run-level error events: {len(summary['errors'])}")
    for warning in summary["warnings"]:
        print(f"- TRACE WARNING: {warning}")
    print()
    print("Review every label and outcome against the trace. One shell execution may contain multiple commands.")
    print("MCP discovery is not necessarily a visible action; tool schemas and instructions can still use context tokens.")
    print("These traces do not isolate schema token cost, and action count is not API request count.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("trace")
    parser.add_argument("--json-output")
    args = parser.parse_args()
    summary = summarize(args.trace)
    if args.json_output:
        with open(args.json_output, "w") as stream:
            json.dump(summary, stream, ensure_ascii=False, indent=2)
            stream.write("\n")
    render(summary)


if __name__ == "__main__":
    main()
