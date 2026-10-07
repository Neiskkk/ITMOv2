# Отчёт: локальные модели

Отчёт ведёт OpenCode по фактическим результатам команд и вашим сообщениям в чате. Поручите агенту заполнить разделы и показать diff. Выводы студента он записывает после обсуждения; отсутствующие измерения отмечает как невыполненные.

## 0–10. Результаты команд

make install

```
Standard library only: ready
```

make test

```
Standard library only: ready
make -C demo test
make[1]: Entering directory '/home/anast/AI_Technology_Itmo/ITMOv2/practices/practice_03/lab/demo'
python3 -m unittest -v
test_duplicate (test_service.SubscribeTest.test_duplicate) ... ok
test_empty (test_service.SubscribeTest.test_empty) ... ok
test_subscribe (test_service.SubscribeTest.test_subscribe) ... ok

----------------------------------------------------------------------
Ran 3 tests in 0.000s

OK
make[1]: Leaving directory '/home/anast/AI_Technology_Itmo/ITMOv2/practices/practice_03/lab/demo'
```

## 10–25. Локальный сервер

Проверка Ollama API

```
curl --fail --silent http://localhost:11434/api/tags
{"models":[{"name":"itmo-local:latest","model":"itmo-local:latest","modified_at":"2026-09-25T11:19:54.816978232+03:00","size":2741192902,"digest":"d277c827c99c35f629989bcd2b1cab733e9fb11a64b14cd29a71fd1057d13c1a","details":{"parent_model":"qwen3.5:2b","format":"gguf","family":"qwen35","families":["qwen35"],"parameter_size":"2.3B","quantization_level":"Q8_0","context_length":262144,"embedding_length":2048},"capabilities":["completion","vision","tools","thinking"]},{"name":"qwen3.5:2b","model":"qwen3.5:2b","modified_at":"2026-09-25T10:35:12.439937123+03:00","size":2741192820,"digest":"324d162be6ca5629ae4517c8710434d0bd2d665bc94dbad46e9af8fbf8a2f0df","details":{"parent_model":"","format":"gguf","family":"qwen35","families":["qwen35"],"parameter_size":"2.3B","quantization_level":"Q8_0","context_length":262144,"embedding_length":2048},"capabilities":["completion","vision","tools","thinking"]}]}
```

Создание/обновление локальной модели

```
mkdir -p results && ollama create itmo-local -f Modelfile
gathering model components
using existing layer sha256:b709d81508a078a686961de6ca07a953b895d9b286c46e17f00fb267f4f2d297
using existing layer sha256:9be69ef463066202c1b1bd299aaf42bad370a01ba4b40d293617859720776c17
using existing layer sha256:4c6af4f6e6173ce0a71c18ffb70284000cda69e394e79beb61a9cef7b2e678b8
using existing layer sha256:123a277d2063f93f95b40b71ae55d0f66b784a395bea435cf45c59d73c7b7d1d
writing manifest
success
```

Тестовый запрос (две фразы) в itmo-local

```
ollama run itmo-local "Объясни разницу между моделью и сервером двумя предложениями"
Вывод: модель начала выдавать развёрнутый "Thinking..." с внутренними рассуждениями и длинным текстом. Процесс не завершился в отведённое время инструмента.
1-я попытка: прервано по таймауту 120000 ms.
2-я попытка: прервано по таймауту 300000 ms; вывод был длинным (цепочка рассуждений), без финального краткого ответа за лимит времени.
Попытка передать параметры через флаг -o:
ollama run -o '{"think": false, "temperature": 0.2, "seed": 42}' itmo-local "…"
Error: unknown shorthand flag: 'o' in -o
```

Проверка тэгов API (повтор)

```
curl --fail http://localhost:11434/api/tags
HTTP 200; тело совпадает с предыдущим вызовом и содержит itmo-local и qwen3.5:2b
```

Запуск эксперимента (baseline)

```
python3 experiment.py --mode baseline --output results/baseline.json
На основе описания проекта и его структуры (Python, `service.py`, проверка через `make test`), наиболее вероятной CI-системой является **GitHub Actions**.

Вот основные аргументы в пользу этого вывода:

1.  **Стандарт де-факто для Python:** GitHub Actions — это стандарт индустрии для запуска тестов проектов на Python (особенно тех, что используют `pytest` или `unittest`).
2.  **Формат команды `make test`:** В CI-пайплайнах GitHub часто используется скрипт `.github/workflows/ci.yml`, который содержит команду:
    ```yaml
    - name: Test
      run: make test
    ```
    Это позволяет легко переключаться между разными окружениями (например, `make test` для локального запуска и `make test-ci` для продакшена) без изменения основного кода.
3.  **Контекст "Учебный сервис":** Такие проекты обычно разрабатываются студентами или в учебных целях, где GitHub Actions является основным инструментом автоматизации сборки и тестирования перед публикацией на репозиторий.

Хотя теоретически это может быть GitLab CI или Jenkins, формат команды `make test` в контексте Python-проектов с GitHub-репозиториеми почти всегда указывает на **GitHub Actions**.

**Ответ:** **GitHub Actions** (вероятно, через скрипт `.github/workflows/ci.yml`).
Saved: results/baseline.json
```

Проверка файла results/baseline.json

```
Поле response.message.content: непустое (ответ о GitHub Actions).
Метрики присутствуют: total_duration=24357854517, load_duration=3602878, eval_count=321, eval_duration=22338344000, decode_tokens_per_second=14.36991032101574, wall_seconds=24.39899025500017.
Вывод: файл содержит фактический ответ и метрики; результат не пустой и не сгенерирован вручную.
```

## Окружение

ОС / CPU / GPU / RAM / VRAM / свободный диск:
- Linux (WSL2) kernel 6.6.87.2, Ubuntu 24.04.4; CPU: 12th Gen Intel Core i5-1235U (12 vCPU)
- GPU: дискретная GPU не обнаружена (nvidia-smi/rocm-smi недоступны); /dev/dxg присутствует (WSL)
- RAM: 7.6 GiB; свободно 5.3 GiB (free -h)
- Свободная VRAM: не применимо — дискретная GPU отсутствует
- Диск /: 1007G всего, 31G использовано, 926G доступно (df -h /)
Ollama или LM Studio / OpenCode / Python, версии:
- Ollama 0.34.4; OpenCode 1.18.32; Python 3.12.3; curl 8.5.0; GNU Make 4.3
Модель, разработчик, семейство, тег и ID:
- Разработчик: Qwen (Alibaba Group); семейство: qwen35
- Тег и ID: qwen3.5:2b, ID 324d162be6ca (ollama list)
Формат, квантизация, лицензия, источник:
- Формат GGUF; квантизация Q8_0; размер весов 2.7 GB; лицензия Apache 2.0 (ollama list/show)
Фактический контекст, размещение CPU/GPU:
- itmo-local:latest num_ctx=4096 (Modelfile)
 - ollama ps: на момент первичной проверки нет активных процессов; размещение CPU/GPU не подтверждено
 - После запроса подготовки: qwen3.5:2b PROCESSOR=100% CPU; CONTEXT=4096; UNTIL=~4 minutes (ollama ps)
Почему выбрана эта конфигурация:
- Устройство с ~8 GB RAM. Вес qwen3.5:2b в Q8_0 ≈2.7 GB и умеренные требования к памяти делают модель практичной для WSL без дискретного GPU. Для локальной работы и демонстраций хватает качества и скорости на CPU.

## Сравнение семейств

| Разработчик / модель | Задача | Параметры / формат | Лицензия | Язык / tools | Источник |
|---|---|---|---|---|---|
| Qwen / qwen3.5:2b | Многоцелевой LLM (чат, completion) | 2.3B; GGUF (Ollama); Q8_0 | Apache 2.0 | Русский: заявлен (мультиязычн. 100+); tools: заявлено | Qwen Docs: https://qwen.readthedocs.io/; локально: ollama show qwen3.5:2b |
| Google Gemma / Gemma 2 2B (Instruct) | Малый open-weights LLM (инструкции/чат) | 2B; формат — не подтверждено | Лицензия — не подтверждено | Русский: не подтверждено; tools: не подтверждено | Офиц. источники: GitHub https://github.com/google-deepmind/gemma; Gemma 2 Report https://goo.gle/gemma2report |

## Воспроизведение

Команды и файлы конфигурации:
- Обновлён FROM: lab/Modelfile и Modelfile.agent -> qwen3.5:2b
- PREPARATION.md: команды pull/run/show заменены на qwen3.5:2b
- experiment.py: default --model=qwen3.5:2b
- results: mkdir -p results; ollama create itmo-local -f Modelfile
- Слайды: в slides/content.json приведено примечание к baseline к тегу qwen3.5:2b (ранее упоминался 4b)
- OpenCode demo config: lab/demo/opencode.json использует локальный Ollama baseURL=http://localhost:11434/v1; внешние MCP/плагины не указаны. Глобальные настройки: ~/.config/opencode/opencode.jsonc найден, но без содержательных параметров.
Допрос локальной модели и сохранение ответа:
- ollama run itmo-local "Объясни разницу между моделью и сервером двумя предложениями" > lab/results/answer.txt
- Фактический вывод сохранён в lab/results/answer.txt; модель вывела развёрнутые рассуждения вместо краткого двухпредложного ответа
Подтверждение локального endpoint и скачанных весов:
- curl http://localhost:11434/api/tags содержит qwen3.5:2b и itmo-local
Проверка без сети после подготовки:
- Выполнено: по сообщению пользователя запрос без интернета при OLLAMA_NO_CLOUD=1 успешно отработал; результат сохранён в lab/results/offline_answer.txt
- Файл существует; офлайн-успех подтверждён пользователем (см. переписку)
Анализ сохранённого ответа:
- Требование «два предложения»: выполнено для онлайн-запроса с think=false (подтверждено пользователем). В сохранённом офлайн-файле наблюдается одно развёрнутое предложение — двухпредложная форма офлайн-повтора не подтверждена.
- Содержательное ограничение ответа: утверждение, что «сервер — это реальный технический объект физического оборудования», неполное; сервером также может называться программа или процесс, обслуживающий запросы.
Если работали в паре, чей компьютер и почему:
- Не применимо

## Эксперимент

Фактор A/B и условия запуска:
- Менялся один фактор: system-сообщение.
- Постоянные параметры: модель qwen3.5:2b, один и тот же пользовательский вопрос и входной контекст (lab/demo/README.md), temperature=0.2, seed=42, num_ctx=4096, num_predict=512, think=false.

Оценка ответов (25–40):
- Baseline: ответ неверный — модель без фактов назвала GitHub Actions и сослалась на файл .github/workflows/ci.yml, которого в переданном контексте нет.
- System: ответ правильный — модель признала отсутствие сведений о CI и не стала выдумывать систему. Формат выполнен частично: ответ короткий, но отдельное основание из контекста не приведено.

Примечание по времени: вывод о сравнительной скорости по этим двум запускам не делается, так как system-запуск включал ~6.62 секунды загрузки модели (load), а baseline выполнялся на прогретой модели.

### 40–50. Одна настройка (temperature)

Фактор сравнения: только `temperature` — 0.2 против 0.8. Для сопоставимых пар условия одинаковые: модель qwen3.5:2b, mode=system, один и тот же входной контекст и вопрос, один и тот же system prompt, `think=false`, `num_ctx=4096`, `num_predict=512`, matched seeds 42, 43 и 44.

Отдельный прогрев (не включался в медианы):
- `warmup.json`, temperature=0.2, seed=41
- wall_seconds=10.6607; load_seconds=6.9688

Обозначения результатов: файлы `cold42/cold43/cold44` — это запуски с низкой температурой (temperature=0.2), а не «холодный старт».

Результаты шести запусков (wall_seconds, total_seconds, load_seconds, decode_tokens_per_second):

| run    | temperature | seed | wall_seconds | total_seconds | load_seconds | decode_tokens_per_second |
|---|---|---:|---:|---:|---:|---:|
| cold42 | 0.2 | 42 | 0.846304483 | 0.724869811 | 0.012909202 | 16.210287048 |
| cold43 | 0.2 | 43 | 1.523565253 | 1.410258162 | 0.013807704 | 16.183994030 |
| cold44 | 0.2 | 44 | 2.078313324 | 2.037856534 | 0.003197620 | 16.923114530 |
| hot42  | 0.8 | 42 | 2.617736189 | 2.577293007 | 0.004649168 | 16.357450273 |
| hot43  | 0.8 | 43 | 3.264734295 | 3.227581505 | 0.002424021 | 15.923172462 |
| hot44  | 0.8 | 44 | 9.277689615 | 9.243500404 | 0.007086084 | 14.977548145 |

Медианы по трём запускам:
- temperature=0.2: wall=1.523565253; total=1.410258162; load=0.012909202; decode=16.210287048
- temperature=0.8: wall=3.264734295; total=3.227581505; load=0.004649168; decode=15.923172462

Оценка (40–50):
- При temperature=0.2 все три ответа одинаковые, короткие и корректно признают отсутствие сведений о CI.
- При temperature=0.8 ответы также не выдумывают CI, но форма менее стабильна: `hot44` добавил подробное основание и лучше выполнил требуемый формат.
- Высокая температура в этом эксперименте не привела к фактической ошибке.
- Более высокое wall/total время у 0.8 нельзя объяснять только температурой, так как `hot44` сгенерировал существенно более длинный ответ.
- Скорость генерации близкая: медианы decode ~16.21 и ~15.92 токена/с.
- Для предсказуемых коротких ответов предпочтение — temperature=0.2.

Примечание: TTFT не измерялся, поскольку запросы непотоковые.

## 50–65. Локальная модель в OpenCode

Создание профиля модели:

```
ollama create itmo-agent -f Modelfile.agent
gathering model components
using existing layer sha256:b709d81508a078a686961de6ca07a953b895d9b286c46e17f00fb267f4f2d297
using existing layer sha256:9be69ef463066202c1b1bd299aaf42bad370a01ba4b40d293617859720776c17
creating new layer sha256:507eb1c1c053f840992a77fc4bbfef25af8a27a12711f6663385a757c36beb83
writing manifest
success
```

Проверка профиля и запуск:

```
ollama show itmo-agent
  Model
    architecture        qwen35
    parameters          2.3B
    context length      262144
    embedding length    2048
    quantization        Q8_0
    requires            0.17.1

  Capabilities
    completion
    vision
    tools
    thinking
        levels     false, true
        default    true

  Parameters
    num_ctx             65536
    presence_penalty    1.5
    temperature         0.2
    top_k               20
    top_p               0.95

  License
    Apache License
    Version 2.0, January 2004

ollama run itmo-agent "Ответь: READY"
(модель напечатала развёрнутый блок "Thinking..." с внутренними рассуждениями и не завершила ответ за лимит инструмента)

ollama ps
NAME                 ID              SIZE      PROCESSOR    CONTEXT    UNTIL
itmo-agent:latest    db69124abd12    3.5 GB    100% CPU     65536      4 minutes from now
```

Фактический контекст и размещение:
- context length фактический: 65536 (параметры профиля; show/ps подтверждают)
- размещение: CPU (ollama ps PROCESSOR=100% CPU). Ошибок нехватки памяти нет.

Конфигурация локального агента:
- demo/opencode.json использует локальный Ollama endpoint `http://localhost:11434/v1` и модель `ollama/itmo-agent`.
- Агент `local-guide` имеет только права на чтение (`read`, `glob`, `grep`), без внешних MCP/плагинов и облачного fallback.

Тестовая сессия OpenCode:

```
opencode run --dir demo --agent local-guide --model ollama/itmo-agent --format json \
  "Прочитай README.md инструментом read. Назови команду тестирования со ссылкой на файл" \
  > results/read-check.jsonl
```

Проверка results/read-check.jsonl:
- Событие вызова инструмента: зафиксирован фактический вызов `read` (callID=call_4wih5esg) c путём `practices/practice_03/lab/demo/README.md`.
- Фактическое чтение README.md: содержимое файла прочитано (строки 1–8, включая "Проверка: make test.").
- Ответ агента: `Команда тестирования: make test [README.md](file:///home/anast/AI_Technology_Itmo/ITMOv2/practices/practice_03/lab/demo/README.md)`.
- Облачного провайдера нет: используется `provider.ollama` с локальным baseURL, внешние MCP/плагины отсутствуют.
- Ошибки: не обнаружены; шаги завершались reason=tool-calls/stop.

## 65–80. Проверка на проекте

Эталоны по коду demo/ (file:line):
- Как запустить тесты? Источник: demo/README.md:6 — «Проверка: make test.»; также demo/Makefile:3 — команда `python3 -m unittest -v`.
- Пустое имя: demo/service.py:5–6 — при пустом `name.strip()` выбрасывается `ValueError("empty name")`.
- Unsubscribe: в demo/service.py нет функции `unsubscribe` (файл целиком 1–9), предпосылка вопроса неверна, удаление не реализовано.
- CI: в файлах demo/README.md, demo/Makefile, demo/service.py, demo/test_service.py, demo/opencode.json, demo/repo-system.txt сведений о конкретной CI-системе нет.
- Хранение подписок: demo/service.py:1 — `subscribers = set()` хранит состояние в памяти процесса; перезапуск очищает множество.

Запуски локального агента (отдельные сессии):

```
opencode run --dir demo --agent local-guide --model ollama/itmo-agent --format json "Как запустить тесты? Укажи файл-источник." > results/question1.jsonl
opencode run --dir demo --agent local-guide --model ollama/itmo-agent --format json "Что будет при пустом имени подписчика? Подтверди кодом." > results/question2.jsonl
opencode run --dir demo --agent local-guide --model ollama/itmo-agent --format json "Где реализован unsubscribe? Проверь предпосылку вопроса." > results/question3.jsonl
opencode run --dir demo --agent local-guide --model ollama/itmo-agent --format json "Какая CI-система запускает тесты? Если сведений нет, скажи об этом." > results/question4.jsonl
opencode run --dir demo --agent local-guide --model ollama/itmo-agent --format json "Сохраняются ли подписки после перезапуска процесса? Подтверди кодом." > results/question5.jsonl
```

Проверка результатов:
- question1: инструменты glob (поиска *.sh, *test*) и grep("test") вызваны; прочитан demo/Makefile строки 1–3 и demo/README.md:6; ответ: «Используйте Makefile… make test … Файл-источник — Makefile, строка 3: python3 -m unittest». Оценка: верно; источники: README.md:6 и Makefile:3; выдуманных файлов нет.
- question2 (исходный): фактические события — glob по расширениям, grep; вызовов read нет; итогового события text нет; reason=stop. Оценка: не завершён, ответ отсутствует.
  Повтор вопроса (question2_retry.jsonl): выполнены glob по расширениям (demo и practices), вызовов read/grep нет; итогового события text нет; reason=stop. Требуемое подтверждение кода с ссылкой на service.py:5–6 отсутствует. Оценка: не завершён.
- question3: инструменты glob, затем перечисление файлов, read service.py и test_service.py; ответ: «unsubscribe не реализован» со ссылкой на service.py. Оценка: частично верно — отсутствие unsubscribe подтверждено, но формулировка «предпосылка соблюдена» неверна (предпосылка вопроса была неверной).
- question4: glob, затем read README.md и test_service.py; ответ: «Нет информации об используемой CI». Оценка: верно; выдуманных сущностей нет.
- question5: glob *.py; read service.py и test_service.py; ответ: «подписки не сохраняются… subscribers = set() в памяти процесса». Оценка: частично верно — хранение в памяти процесса подтверждено; уточнение: данные теряются при любом завершении процесса, а не только при отрицательном exit-коде.

make test:

```
Standard library only: ready
make -C demo test
python3 -m unittest -v
… OK (3 tests)
```

## Скорость

- Отдельный прогрев: warmup.json (temperature=0.2, seed=41) — wall_seconds=10.6607 s, load_seconds=6.9688 s; в медианы не включался.
- Выполнено по три прогретых запуска для temperature=0.2 и temperature=0.8 (matched seeds 42, 43, 44).
- Медиана temperature=0.2: wall=1.523565253 s, total=1.410258162 s, load=0.012909202 s, decode=16.210287048 token/s.
- Медиана temperature=0.8: wall=3.264734295 s, total=3.227581505 s, load=0.004649168 s, decode=15.923172462 token/s.
- Единицы: секунды и токены в секунду. Метод: медиана трёх прогретых запусков для каждой температуры.
- TTFT не измерялся, поскольку режим непотоковый.
- Предыдущие попытки (ранние неудачные запросы): первые запросы через /api/generate занимали десятки секунд; ответ отсутствовал (response="").

## Вывод

Что работает:
- Локальный Ollama API и qwen3.5:2b работают на этом устройстве без облака.
- System prompt устранил галлюцинацию о CI.
- Temperature=0.2 дала наиболее стабильные короткие ответы.
- itmo-agent с num_ctx=65536 успешно загрузился на CPU без ошибки памяти.
- OpenCode через локальный endpoint действительно вызвал инструменты glob/read/grep и прочитал README.md.
- make test проходит: 3 теста успешно.

Обнаруженные ограничения:
- Прямой ollama run с включённым thinking выдаёт длинные рассуждения и может не завершить краткий ответ за лимит.
- Question2 не сформировал итоговый ответ ни в исходном запуске, ни при повторе: модель выбирала нерелевантные glob и не прочитала service.py.
- Question3 правильно обнаружил отсутствие unsubscribe, но ошибочно написал «предпосылка соблюдена».
- Question5 правильно определил хранение в памяти, но неточно связал потерю данных только с отрицательным exit-кодом.
- Все вычисления выполнялись на CPU.
- Холодная загрузка заметно увеличивает время первого ответа.

Оценка пяти вопросов:
- 2 верных; 2 частично верных; 1 не завершён.

Выбранная конфигурация:
- API-эксперименты: qwen3.5:2b, think=false, temperature=0.2, num_ctx=4096.
- Агент OpenCode: itmo-agent, num_ctx=65536, локальный provider Ollama, права local-guide только на чтение.

Разница между SYSTEM и агентом:
- SYSTEM задаёт модели правила формирования ответа внутри одного запроса.
- Инструкции агента и opencode.json дополнительно определяют доступные инструменты, права, рабочий каталог и поведение при чтении проекта.
- Наличие SYSTEM само по себе не даёт модели доступ к файлам и инструментам.

Статус этапов:
- Обязательные этапы практики и домашняя работа выполнены; конфигурации, вопросы, эталоны, сырые результаты и сравнительная оценка сохранены в `homework/`.

## Домашняя работа 3: A/B system prompt

Сравнивались две конфигурации одной локальной модели `itmo-agent` (Qwen3.5 2.3B, Q8_0, Ollama): A с краткой общей инструкцией и B со строгим требованием читать файлы, указывать `file:line`, не выдумывать сведения и отклонять ложные предпосылки. Модель, endpoint, фикстура, вопросы, права read-only и лимит шагов одинаковы; менялся только system prompt.

OpenCode 2.0.20 запускался в `--standalone` из изолированной фикстуры. Каждый из десяти вопросов запускался в отдельной сессии. Ответы и tool events сохранены в `homework/results/`, эталоны — отдельно в `homework/answers_gold.md`.

Итог: A — один частично корректный и четыре некорректных ответа; B — один частично корректный и четыре некорректных. A галлюцинировал файл `PRIME.md`; B правильно разобрал различие P1-01/P1-02, но часто достигал лимита шагов без финального текста. Выбрана B как более безопасная основа, поскольку её правила явно запрещают домыслы.

После прогрева проведены одношаговые замеры времени ответа. Полученная медиана для конфигурации A — 39.384 с, для конфигурации B — 47.949 с. Подробная сравнительная оценка находится в `homework/evaluation.md`.

Повторная проверка make test:

```
Standard library only: ready
make -C demo test
python3 -m unittest -v
test_duplicate (test_service.SubscribeTest.test_duplicate) ... ok
test_empty (test_service.SubscribeTest.test_empty) ... ok
test_subscribe (test_service.SubscribeTest.test_subscribe) ... ok

----------------------------------------------------------------------
Ran 3 tests in 0.000s

OK
```
