# Отчёт по домашней работе 7.2

**Тестовый репозиторий:** [Neiskkk/ITMOv2](https://github.com/Neiskkk/ITMOv2)  
**Ветка:** `2026-kolesnik-anastasia-practice-07-2`  


## 1. Классификация Issues — 2 балла

`Github Trigger` принимает события Issues. `If issue opened` пропускает только `action == opened`. Классификатор возвращает тип и confidence, `Route Issue` выбирает HTTP-запрос назначения лейбла.

| Тип | Тестовый Issue | Успешный Execution | Результат |
|---|---|---|---|
| bug | [№14](https://github.com/Neiskkk/ITMOv2/issues/14) | #6597, 2.282 с | bug |
| task | [№15](https://github.com/Neiskkk/ITMOv2/issues/15) | #6599, 3.368 с | task |
| feature | [№16](https://github.com/Neiskkk/ITMOv2/issues/16) | #6601, 2.129 с | feature |

![Issues с тремя автоматически назначенными лейблами](screenshots/criterion-1-all-labels.png)

![Запуск ветки bug](screenshots/criterion-1-bug-execution.png)

![Запуск ветки task](screenshots/criterion-1-task-execution.png)

![Запуск ветки feature](screenshots/criterion-1-feature-execution.png)

## 2. Эскалация в needs-triage — 1 балл

Для [Issue №17 «Иногда не работает»](https://github.com/Neiskkk/ITMOv2/issues/17) получены `type = unknown`, `confidence = 0.55`. Значение ниже 0.8, поэтому Switch выбрал Fallback и назначил `needs-triage`. Комментарий не опубликован. Execution #6603 завершился успешно за 2.582 с.

![Confidence 0.55 и выполнение Fallback](screenshots/criterion-2-confidence.png)

![Issue с needs-triage без комментария](screenshots/criterion-2-no-comment.png)

## 3. Классификатор в Sub-workflow — 2 балла

Отдельный сценарий «7.2 — Классификатор Issues — Sub-workflow» принимает `title` и `body` через `When Executed by Another Workflow`. Basic LLM Chain использует OpenAI Chat Model и Structured Output Parser. `Return classification` возвращает `type` и `confidence`.

Основной сценарий передаёт поля Issue через `Call Issue classifier` (Execute Sub-workflow), ожидает завершения и маршрутизирует результат. После переноса проверены все ветки.

| Issue | Основной Execution | Ответ классификатора | Результат |
|---|---|---|---|
| [№18](https://github.com/Neiskkk/ITMOv2/issues/18) | #6612 | bug, 0.97 | bug |
| [№19](https://github.com/Neiskkk/ITMOv2/issues/19) | #6616 | task, 0.9 | task |
| [№20](https://github.com/Neiskkk/ITMOv2/issues/20) | #6619 | feature, 0.96 | feature |
| [№21](https://github.com/Neiskkk/ITMOv2/issues/21) | #6622 | unknown, 0.55 | needs-triage без комментария |

![Вызов Sub-workflow и ветка bug](screenshots/criterion-3-bug-execution.png)

![Вызов Sub-workflow и ветка task](screenshots/criterion-3-task-execution.png)

![Вызов Sub-workflow и ветка feature](screenshots/criterion-3-feature-execution.png)

![Вызов Sub-workflow и Fallback](screenshots/criterion-3-unknown-execution.png)

Дочерний Execution #6623 завершился успешно за 1.46 с и вернул unknown с confidence 0.55.

![Дочерний запуск классификатора](screenshots/criterion-3-unknown-child-execution.png)

## 4. Расписание и сбор данных за неделю — 2 балла

В «7.2 — Еженедельная статистика Issues» настроен Schedule Trigger с cron `0 9 * * MON`, часовой пояс `Europe/Moscow`. Запуск по расписанию — по понедельникам в 09:00 МСК. Для проверки использованы ручные запуски.

`Report period` задаёт единый интервал семи суток перед запуском. Четыре GET-запроса к `https://api.github.com/search/issues` используют репозиторий, `is:issue`, отдельный лейбл, `created:>=period_start`, `created:<period_end` и `per_page=100`.

Execution #6643 завершился успешно за 2.438 с. Во всех ответах `incomplete_results = false`.

| Нода | Лейбл | total_count |
|---|---|---:|
| Get weekly bugs | bug | 3 |
| Get weekly tasks | task | 2 |
| Get weekly features | feature | 2 |
| Get weekly triage | needs-triage | 2 |

![Cron еженедельного запуска](screenshots/criterion-4-cron.png)

![Часовой пояс workflow](screenshots/criterion-4-timezone.png)

![Ответ GitHub для bug](screenshots/criterion-4-bugs-execution.png)

![Ответ GitHub для task](screenshots/criterion-4-tasks-execution.png)

![Ответ GitHub для feature](screenshots/criterion-4-features-execution.png)

![Ответ GitHub для needs-triage](screenshots/criterion-4-triage-execution.png)

## 5. Группировка по типу и автору — 2 балла

Code-нода `Aggregate weekly stats` считает обращения по лейблам. Общий итог и группировка по авторам используют уникальные GitHub ID, поэтому Issue с несколькими лейблами учитывается в общем итоге один раз. Если API вернул неполные данные, выполнение останавливается.

Execution #6645 завершился успешно за 2.396 с. Получены `total = 9`, bug = 3, task = 2, feature = 2, needs-triage = 2, автор Neiskkk — 9 обращений.

![Результат агрегирования по типам и автору](screenshots/criterion-5-grouped-stats.png)

## 6. HTML-отчёт через Gmail — 2 балла

`Build report email` формирует тему и HTML с периодом в московском времени, общим итогом и таблицами по типам и авторам. `Send weekly report` использует подключение Gmail OAuth2, операцию Send, тип HTML и поля `subject`/`html`.

Отправка и получение письма подтверждены. В первом тесте Gmail-нода завершилась за 870 мс. Итоговый запуск с отправкой №7413 и полученное письмо приведены в разделе 9.

![Успешная отправка отчёта через Gmail](screenshots/criterion-6-gmail-send.png)

## 7. Сохранение недельной статистики — 1 балл

Создана Data Table `weekly_issue_stats`. Столбцы `week_key`, `period_start`, `period_end`, `by_type`, `by_author` имеют тип String, `total` — Number. Распределения хранятся как JSON-строки.

После успешной отправки Gmail нода `Save weekly stats` выполняет Upsert по дате окончания периода `week_key`. Повторный запуск за тот же день обновляет запись. Первый подтверждённый запуск сохранения занял 128 мс, в таблице появился текущий итог 9.

![Сохранение недельных итогов](screenshots/criterion-7-save-weekly-stats.png)

![Сохранённая строка недельной статистики](screenshots/criterion-7-weekly-table.png)

## 8. Изменения к предыдущей неделе — 2 балла

`Get previous week` читает из Data Table запись с ключом даты начала текущего периода. `Calculate weekly delta` вычисляет текущее количество минус предыдущее для общего итога, типов и авторов. При отсутствии истории Δ не рассчитывается и в письме выводится соответствующее сообщение.

Для проверки сохранены две недели. Текущий итог получен из GitHub. Предыдущая неделя добавлена вручную как тестовая запись, что разрешено README задания.

| Показатель | Предыдущая неделя, тест | Текущая неделя | Δ |
|---|---:|---:|---:|
| Всего Issues | 6 | 9 | +3 |
| bug | 2 | 3 | +1 |
| task | 1 | 2 | +1 |
| feature | 2 | 2 | 0 |
| needs-triage | 1 | 2 | +1 |
| Автор Neiskkk | 6 | 9 | +3 |

Ключ предыдущей строки — `2026-11-15`, текущей — `2026-11-22`. Расчёт подтверждён выполнением Code-ноды и полученным письмом с колонками Δ.

![Две недели в Data Table](screenshots/criterion-8-two-weeks.png)

![Результат расчёта разницы](screenshots/criterion-8-calculated-delta.png)

![Полученное письмо с Δ](screenshots/criterion-8-received-email-delta.png)

## 9. AI-комментарий недели — 2 балла

Basic LLM Chain `Generate weekly comment` получает текущую статистику, сохранённые предыдущие итоги и Δ. Промпт требует краткий текст на русском языке только по переданным данным, без вымышленных причин изменений. Модель возвращает поле `text`.

`Build report email` получает статистику из `Calculate weekly delta`, экранирует ответ модели и добавляет блок **«AI-комментарий недели»**. При пустом ответе модели выполнение останавливается.

![Результат Basic LLM Chain на статистике и Δ](screenshots/criterion-9-generated-comment.png)



![Успешный итоговый запуск во вкладке Executions](screenshots/criterion-9-weekly-execution-7413.png)



![Полученное итоговое письмо с AI-комментарием недели](screenshots/criterion-9-received-email-ai.png)

## Дополнительные задания практики

**First-time contributor.** После обычной классификации проверяется `author_association == NONE`. Ветка назначает `first-time-contributor` и публикует приветствие с упоминанием автора и ссылкой на `CONTRIBUTING.md`.

Условие NONE проверено на смоделированном payload существующего [Issue №18](https://github.com/Neiskkk/ITMOv2/issues/18), поскольку второй аккаунт был недоступен. Ручной запуск завершился за 4.448 с; реальные запросы GitHub API создали лейбл и один комментарий. Это не проверка обращения от реального внешнего аккаунта. Файл `CONTRIBUTING.md` существует локально, доступность ссылки в ветке на GitHub ещё предстоит проверить после отправки файлов.

![Проверка ветки нового участника на тестовых данных](screenshots/practical-first-time-execution.png)

![Опубликованное приветствие в Issue](screenshots/practical-first-time-comment.png)

**Дедупликация.** Таблица `processed_issues` хранит GitHub ID, автора и время обработки. `Continue if issue unprocessed` пропускает только отсутствующий ID; после завершения выбранной ветки `Save processed issue` сохраняет запись.

[Issue №22](https://github.com/Neiskkk/ITMOv2/issues/22) впервые обработан в Execution #6631 за 2.71 с. Повторная доставка opened в Execution #6634 завершилась за 272 мс: проверка вернула 0 элементов, модель и запросы GitHub повторно не запускались, в таблице осталась одна строка. Событие reopened отдельно остановлено фильтром в Execution #6636.

![Повторная доставка остановлена до вызова классификатора](screenshots/practice-dedup-repeat-execution.png)

![Одна строка после повторной доставки](screenshots/practice-dedup-repeat-table.png)
