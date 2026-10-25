#!/usr/bin/env python3
import json
import os
import sys
import statistics


def read_speed_times(path):
    times = {"A": [], "B": []}
    with open(path, "r", encoding="utf-8") as f:
        header = f.readline().strip()
        # Expect header: label,run,wall_seconds
        for line in f:
            line = line.strip()
            if not line:
                continue
            parts = line.split(",")
            if len(parts) != 3:
                continue
            label, run, secs = parts
            try:
                val = float(secs)
            except ValueError:
                continue
            if label in times:
                times[label].append(val)
    return times


def parse_jsonl_validate(filepath):
    session_id = None
    tool_use_counts = {"read": 0, "glob": 0, "grep": 0}
    final_texts = []
    with open(filepath, "r", encoding="utf-8") as f:
        for lineno, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError as e:
                raise RuntimeError(f"Invalid JSON at {filepath}:{lineno}: {e}")

            # sessionID presence
            if session_id is None:
                session_id = obj.get("sessionID")

            # tool_use events
            if obj.get("type") == "tool_use":
                part = obj.get("part", {})
                tool = part.get("tool")
                state = part.get("state", {})
                status = state.get("status")
                if status == "completed" and tool in tool_use_counts:
                    tool_use_counts[tool] += 1

            # final text events
            if obj.get("type") == "text":
                part = obj.get("part", {})
                text = part.get("text")
                if isinstance(text, str):
                    final_texts.append(text)

    if session_id is None:
        raise RuntimeError(f"Missing sessionID in {filepath}")
    return session_id, tool_use_counts, final_texts


def main():
    if len(sys.argv) != 2:
        print("Usage: analyze_results.py <results_dir>", file=sys.stderr)
        sys.exit(1)
    results_dir = sys.argv[1]
    if not os.path.isdir(results_dir):
        print(f"Results dir not found: {results_dir}", file=sys.stderr)
        sys.exit(1)

    # Speed times
    speed_csv = os.path.join(results_dir, "speed_times.csv")
    times = read_speed_times(speed_csv)
    # Ensure exactly three measurements for A and B
    if len(times["A"]) != 3 or len(times["B"]) != 3:
        raise RuntimeError("Expected exactly 3 measurements for A and 3 for B in speed_times.csv")

    summary_csv = os.path.join(results_dir, "speed_summary.csv")
    with open(summary_csv, "w", encoding="utf-8") as f:
        f.write("label,median_wall_seconds\n")
        f.write(f"A,{statistics.median(times['A']):.6f}\n")
        f.write(f"B,{statistics.median(times['B']):.6f}\n")

    # Parse 10 main JSONL files
    main_files = [
        "A_q1.jsonl", "A_q2.jsonl", "A_q3.jsonl", "A_q4.jsonl", "A_q5.jsonl",
        "B_q1.jsonl", "B_q2.jsonl", "B_q3.jsonl", "B_q4.jsonl", "B_q5.jsonl",
    ]

    session_ids = []
    audit = {"files": {}}
    for name in main_files:
        path = os.path.join(results_dir, name)
        session_id, tool_counts, final_texts = parse_jsonl_validate(path)
        session_ids.append(session_id)
        audit["files"][name] = {
            "sessionID": session_id,
            "tool_use": tool_counts,
            "final_text_events": len(final_texts)
        }

    # Ensure 10 unique session IDs
    if len(set(session_ids)) != 10:
        raise RuntimeError("Expected 10 unique sessionIDs across main runs")

    audit_path = os.path.join(results_dir, "run_audit.json")
    with open(audit_path, "w", encoding="utf-8") as f:
        json.dump(audit, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
