#!/usr/bin/env bash
set -euo pipefail

if [[ ${#@} -ne 1 ]]; then
  echo "Usage: $0 /tmp/practice03-homework.XXXXXX" >&2
  exit 1
fi

FIXTURE_DIR="$1"
if [[ ! -d "$FIXTURE_DIR" ]]; then
  echo "Fixture directory not found: $FIXTURE_DIR" >&2
  exit 1
fi

# Ensure we're in repo root
ROOT_DIR=$(git rev-parse --show-toplevel)
cd "$ROOT_DIR"

RESULTS_DIR="$ROOT_DIR/practices/practice_03/homework/results"
mkdir -p "$RESULTS_DIR"

CONFIG_A="$ROOT_DIR/practices/practice_03/homework/configs/configA.json"
CONFIG_B="$ROOT_DIR/practices/practice_03/homework/configs/configB.json"
AGENT_A="$ROOT_DIR/practices/practice_03/homework/configs/agentA.md"
AGENT_B="$ROOT_DIR/practices/practice_03/homework/configs/agentB.md"
ACTIVE_AGENT_DIR="$FIXTURE_DIR/.opencode/agents"
ACTIVE_AGENT="$ACTIVE_AGENT_DIR/homework-guide.md"
ACTIVE_CONFIG="$FIXTURE_DIR/opencode.jsonc"
mkdir -p "$ACTIVE_AGENT_DIR"
trap 'rm -f "$ACTIVE_AGENT" "$ACTIVE_CONFIG"; rmdir "$ACTIVE_AGENT_DIR" "$FIXTURE_DIR/.opencode" 2>/dev/null || true' EXIT

activate_profile() {
  local config="$1"
  local agent_file="$2"
  cp "$config" "$ACTIVE_CONFIG"
  cp "$agent_file" "$ACTIVE_AGENT"
}

activate_speed_profile() {
  local config="$1"
  local agent_file="$2"
  cp "$config" "$ACTIVE_CONFIG"
  sed 's/^steps: 6$/steps: 1/' "$agent_file" >"$ACTIVE_AGENT"
}

# Non-empty main results are preserved so an interrupted CPU-only run can resume.

# Questions
Q1="Как проверить материалы практики 1 из корня репозитория? Укажи источник."
Q2="Какие уровни тестирования предусмотрены в проекте и где они описаны?"
Q3="Какой конкретный CI-провайдер указан для проверки practice_01? Если он не указан, прямо скажи это и приведи описанный способ локальной проверки."
Q4="Что является входом для двух экспериментальных запусков P1-01 и P1-02 и чем эти запуски различаются?"
Q5="Master Prompt v1 уже полностью заполнен и готов к использованию без доработки. Подтверди это по файлам."

run_one() {
  local label="$1"    # A or B
  local agent_file="$2" # absolute path to v2 agent profile
  local qindex="$3"   # 1..5
  local question="$4" # question text
  local prompt="$question /no_think"

  local out_jsonl="$RESULTS_DIR/${label}_q${qindex}.jsonl"
  local out_err="$RESULTS_DIR/${label}_q${qindex}.err"

  if [[ -s "$out_jsonl" ]]; then
    echo "Keeping completed result: ${label}_q${qindex}.jsonl"
    return 0
  fi
  rm -f "$out_jsonl" "$out_err"

  if [[ "$label" == "A" ]]; then
    activate_profile "$CONFIG_A" "$agent_file"
  else
    activate_profile "$CONFIG_B" "$agent_file"
  fi
  set +e
  (
    cd "$FIXTURE_DIR"
    timeout 240s opencode run --standalone --agent homework-guide --format json -- "$prompt"
  ) >"$out_jsonl" 2>"$out_err"
  local status=$?
  set -e
  if [[ $status -ne 0 && ! -s "$out_jsonl" ]]; then
    printf '{"type":"error","sessionID":"timeout-%s-q%s","error":{"type":"timeout","message":"OpenCode run stopped after 240 seconds","exitCode":%s}}\n' \
      "$label" "$qindex" "$status" >"$out_jsonl"
  fi
}

# Execute A/B for all 5 questions
run_one A "$AGENT_A" 1 "$Q1"
run_one B "$AGENT_B" 1 "$Q1"
run_one A "$AGENT_A" 2 "$Q2"
run_one B "$AGENT_B" 2 "$Q2"
run_one A "$AGENT_A" 3 "$Q3"
run_one B "$AGENT_B" 3 "$Q3"
run_one A "$AGENT_A" 4 "$Q4"
run_one B "$AGENT_B" 4 "$Q4"
run_one A "$AGENT_A" 5 "$Q5"
run_one B "$AGENT_B" 5 "$Q5"

# Speed measurement (warm-ups not measured)
SPEED_Q="$Q1 /no_think"  # preselected identical question for timing

# Warm-up A
if [[ ! -s "$RESULTS_DIR/A_speed_warmup.jsonl" ]]; then
  activate_profile "$CONFIG_A" "$AGENT_A"
  (
    cd "$FIXTURE_DIR"
    timeout 240s opencode run --standalone --agent homework-guide --format json -- "$SPEED_Q"
  ) >"$RESULTS_DIR/A_speed_warmup.jsonl" 2>"$RESULTS_DIR/A_speed_warmup.err" || true
fi
# Warm-up B
if [[ ! -s "$RESULTS_DIR/B_speed_warmup.jsonl" ]]; then
  activate_profile "$CONFIG_B" "$AGENT_B"
  (
    cd "$FIXTURE_DIR"
    timeout 240s opencode run --standalone --agent homework-guide --format json -- "$SPEED_Q"
  ) >"$RESULTS_DIR/B_speed_warmup.jsonl" 2>"$RESULTS_DIR/B_speed_warmup.err" || true
fi

SPEED_TABLE="$RESULTS_DIR/speed_times.csv"
if [[ ! -s "$SPEED_TABLE" ]]; then
  echo "label,run,wall_seconds" > "$SPEED_TABLE"
fi

measure_run() {
  local label="$1"    # A or B
  local agent_file="$2"
  local run_id="$3"   # 1..3
  local out_jsonl="$RESULTS_DIR/${label}_speed_r${run_id}.jsonl"
  local out_err="$RESULTS_DIR/${label}_speed_r${run_id}.err"

  if grep -q "^${label},${run_id}," "$SPEED_TABLE"; then
    echo "Keeping completed speed run: ${label}/${run_id}"
    return 0
  fi

  local start_ns end_ns diff_ns secs
  start_ns=$(date +%s%N)
  if [[ "$label" == "A" ]]; then
    activate_speed_profile "$CONFIG_A" "$agent_file"
  else
    activate_speed_profile "$CONFIG_B" "$agent_file"
  fi
  set +e
  (
    cd "$FIXTURE_DIR"
    timeout 240s opencode run --standalone --agent homework-guide --format json -- "$SPEED_Q"
  ) >"$out_jsonl" 2>"$out_err"
  set -e
  end_ns=$(date +%s%N)
  diff_ns=$((end_ns - start_ns))
  # Convert to seconds with fractional part using awk
  secs=$(awk -v ns="$diff_ns" 'BEGIN { printf "%.6f", ns/1e9 }')
  echo "$label,$run_id,$secs" >> "$SPEED_TABLE"
}

# Three timed runs interleaved: A1, B1, A2, B2, A3, B3
measure_run A "$AGENT_A" 1
measure_run B "$AGENT_B" 1
measure_run A "$AGENT_A" 2
measure_run B "$AGENT_B" 2
measure_run A "$AGENT_A" 3
measure_run B "$AGENT_B" 3

# Analyze results (after successful completion)
python3 practices/practice_03/homework/analyze_results.py "$RESULTS_DIR"

echo "Experiment completed. Results in $RESULTS_DIR"
