#!/usr/bin/env python3
"""Validate and summarize the committed dataset. No network or cloud access."""
import argparse
import csv
import io
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FIELDS = ["run", "shell", "mcp", "discovery", "failed", "input_tokens", "cached_input_tokens",
          "output_tokens", "seconds_subject_process", "seconds_recorded_attempts"]


def load_records():
    data = json.loads((ROOT / "data/runs.json").read_text())
    records = data["records"]
    expected = {f"step1-{arm}-task{task}" for arm in ["cli", "mcp"] for task in [1, 2, 3]}
    expected |= {f"step1r-cli-task{task}" for task in [1, 2, 3]}
    expected |= {"step3a", "step3a-r", "step3b", "step3c"}
    assert {record["name"] for record in records} == expected
    assert len(records) == len(expected)
    for record in records:
        counts = record["counts"]
        actions = record["actions"]
        assert sum(a["kind"] == "shell" for a in actions) == counts["shell"]
        assert sum(a["kind"] == "mcp" for a in actions) == counts["mcp"]
        assert sum(a["discovery"] for a in actions) == counts["discovery"]
        assert sum(a["failed"] for a in actions) == counts["failed"]
        assert record["usage"]["cached_input_tokens"] <= record["usage"]["input_tokens"]
        assert record["seconds_recorded_attempts"] >= record["seconds_subject_process"]
    return records


def csv_text(records):
    output = io.StringIO(newline="")
    writer = csv.writer(output, lineterminator="\n")
    writer.writerow(FIELDS)
    for record in records:
        counts, usage = record["counts"], record["usage"]
        writer.writerow([record["name"], *[counts[k] for k in ["shell", "mcp", "discovery", "failed"]],
                         *[usage[k] for k in ["input_tokens", "cached_input_tokens", "output_tokens"]],
                         f'{record["seconds_subject_process"]:.3f}',
                         f'{record["seconds_recorded_attempts"]:.3f}'])
    return output.getvalue()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write-csv", action="store_true", help="Regenerate data/metrics.csv")
    parser.add_argument("--check-csv", action="store_true", help="Verify the committed CSV matches runs.json")
    args = parser.parse_args()
    records = load_records()
    table = csv_text(records)
    if args.write_csv:
        (ROOT / "data/metrics.csv").write_text(table)
    if args.check_csv:
        assert (ROOT / "data/metrics.csv").read_text() == table, "metrics.csv differs from runs.json"
    print("| Run | Shell | MCP | Discovery | Failed | Input / cached / output | Seconds, recorded attempts |")
    print("|---|---:|---:|---:|---:|---:|---:|")
    for record in records:
        c, u = record["counts"], record["usage"]
        print(f'| {record["name"]} | {c["shell"]} | {c["mcp"]} | {c["discovery"]} | {c["failed"]} | '
              f'{u["input_tokens"]:,} / {u["cached_input_tokens"]:,} / {u["output_tokens"]:,} | '
              f'{record["seconds_recorded_attempts"]:.3f} |')
    print("\nValidated 13 run records. Cached input is part of input. No cloud commands were executed.")


if __name__ == "__main__":
    main()
