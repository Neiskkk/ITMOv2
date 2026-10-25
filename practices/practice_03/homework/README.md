# Домашка 3: A/B эксперименты помощника

## Конфигурации
- Конфиг A: `practices/practice_03/homework/configs/configA.json`; профиль OpenCode v2 — `configs/agentA.md` (System A из `systemA.txt`)
- Конфиг B: `practices/practice_03/homework/configs/configB.json`; профиль OpenCode v2 — `configs/agentB.md` (System B из `systemB.txt`)

Провайдер: Ollama локально (`http://localhost:11434/v1`). Модель: `ollama/itmo-agent`. Агент: `homework-guide` (mode `primary`). Ограничения: только `read`, `glob`, `grep`; остальные инструменты запрещены.

## Вопросы
См. `practices/practice_03/homework/questions.md`.

## Эталоны
См. `practices/practice_03/homework/answers_gold.md`.

## Воспроизводимость и изоляция
Эксперименты выполняются на изолированной копии входных файлов в `/tmp`, чтобы тестируемая модель не видела ответы, системный промпт другой конфигурации и будущие результаты.

### Подготовка фикстуры
1. Запустите скрипт подготовки из корня репозитория:
   - `bash practices/practice_03/homework/prepare_fixture.sh`
2. Скрипт:
   - определяет корень через `git rev-parse --show-toplevel`;
   - создаёт временную директорию: `mktemp -d /tmp/practice03-homework.XXXXXX`;
   - копирует в неё корневой `Makefile` и весь каталог `practices/practice_01` с сохранением пути `practices/practice_01`;
   - считает SHA-256 всех файлов копии с относительными путями и сохраняет манифест в `practices/practice_03/homework/input_manifest.sha256`;
   - выводит путь созданной временной директории.

### Запуск эксперимента
1. Из корня, передайте путь фикстуры в скрипт запуска:
   - `bash practices/practice_03/homework/run_experiment.sh /tmp/practice03-homework.XYZ123`
2. Скрипт:
   - по очереди копирует конфиг A/B как корневой `opencode.jsonc` и профиль как `.opencode/agents/homework-guide.md` во временную фикстуру;
   - удаляет временные конфиг, профиль агента и созданные пустые каталоги при завершении скрипта;
   - запускает 5 вопросов для A и B отдельно, каждый — новая сессия, без `--continue` и без `--session`;
   - указывает `--standalone`, `--agent homework-guide`, `--format json`, чтобы каждый запуск использовал конфигурацию текущей фикстуры, а не фоновый сервер другого проекта;
   - сохраняет результаты в `practices/practice_03/homework/results/` как `A_q1.jsonl ... A_q5.jsonl` и `B_q1.jsonl ... B_q5.jsonl`;
   - сохраняет готовые непустые ответы при повторном запуске и продолжает с отсутствующего вопроса;
   - ограничивает один локальный запуск четырьмя минутами, записывает таймаут и продолжает остальные вопросы;
   - stderr сохраняется отдельно в файлы `.err`;
   - прекращает работу при ошибке.

### Замер скорости
Скрипт выполняет:
- один прогрев для A (`A_speed_warmup.jsonl`) и один для B (`B_speed_warmup.jsonl`), без замера времени;
- три прогретых запуска одного и того же вопроса для A (`A_speed_r1.jsonl ... r3.jsonl`), и три для B (`B_speed_r1.jsonl ... r3.jsonl`);
- стеночное время (секунды) записывается в `results/speed_times.csv` (прогревы не входят в медиану).

## Ожидаемые файлы результатов
- Основные ответы: `A_q1.jsonl ... A_q5.jsonl`, `B_q1.jsonl ... B_q5.jsonl`
- Ошибки: соответствующие `.err`
- Прогрев: `A_speed_warmup.jsonl`, `B_speed_warmup.jsonl` и `.err`
- Повторы: `A_speed_r1.jsonl ... r3.jsonl`, `B_speed_r1.jsonl ... r3.jsonl` и `.err`
- Времена: `speed_times.csv`

## Единицы измерения
- Время: секунды стеночного времени (wall-clock).

## Конфигурации и режимы
- OpenCode 2.0.20 фактически не подхватил отдельный JSON через `OPENCODE_CONFIG`, `OPENCODE_CONFIG_CONTENT` или проектный `opencode.json`; поэтому скрипт использует документированный файловый профиль `.opencode/agents/homework-guide.md` внутри изолированной временной фикстуры.
- В обеих конфигурациях механизм загрузки одинаков; единственное различие A/B — `systemA.txt` и `systemB.txt`.
- A и B отличаются только системным промптом (`systemA.txt` vs `systemB.txt`).
- Режим reasoning: `think=false` одинаково для A и B; каждый ответ ограничен шестью шагами агента, чтобы исключить зацикливание малой модели.
- Из-за того что OpenCode 2.0.20 не передал `think=false` в автоматически обнаруженный Ollama runtime, к каждому одинаковому пользовательскому вопросу добавляется управляющая директива Qwen `/no_think`.

## Проверки воспроизводимости
- Новая session ID: каждый запуск — новая сессия (не используются `--continue`/`--session`). Идентификатор сессии находится в поле `sessionID` события JSONL; проверьте, что у всех 10 основных запусков он уникален.
- События инструментов: событие вызова инструмента имеет `type == "tool_use"`, имя инструмента — в поле `part.tool`, успешность — `part.state.status == "completed"`. Финальный ответ находится в событии `type == "text"`, текст — в поле `part.text`.
- Итоговые медианы времени находятся в `results/speed_summary.csv`. Технический аудит основных запусков — в `results/run_audit.json`.
