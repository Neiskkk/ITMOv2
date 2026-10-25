# Эталонные ответы и источники

## Вопрос 1
- Ожидаемый ответ: Выполнить команду `make step1` из корня репозитория.
- Источники:
  - practices/practice_01/README.md:45-49
  - Makefile:8-10

## Вопрос 2
- Ожидаемый ответ: Предусмотрены уровни Unit, Integration, Load и E2E; подтверждены заголовками и таблицами.
- Источники:
  - practices/practice_01/tests_unit.md:1,5
  - practices/practice_01/tests_integration.md:1,5
  - practices/practice_01/tests_load.md:1,5,9
  - practices/practice_01/tests_e2e.md:1,5,7-9

## Вопрос 3
- Ожидаемый ответ: Конкретный CI-провайдер в `practices/practice_01` не указан; локальная проверка выполняется командой `make step1` из корня репозитория.
- Источники (локальная проверка):
  - practices/practice_01/README.md:45-49
  - Makefile:8-10
- Отрицательный поиск (CI-провайдер): по текстовым файлам каталога `practices/practice_01` (исключая бинарный PDF) по ключевым словам: `GitHub Actions|GitLab|Jenkins|CI|CI/CD|pipeline` — совпадений нет.

## Вопрос 4
- Ожидаемый ответ: Вход для обоих запусков — `TRAINING_PR.diff`. P1-01 — только diff (zero-shot). P1-02 — тот же diff плюс Master Prompt v1.
- Источники:
  - practices/practice_01/README.md:111-114,115-123,174-179
  - practices/practice_01/prompts.md:9-10
  - practices/practice_01/TRAINING_PR.diff:1-5

## Вопрос 5
- Ожидаемый ответ: Утверждение неверно. `prompts.md` содержит незаполненный шаблон Master Prompt v1; его требуется собрать по инструкции из `README.md`.
- Источники:
  - practices/practice_01/prompts.md:13-16,17-56
  - practices/practice_01/README.md:95-101
