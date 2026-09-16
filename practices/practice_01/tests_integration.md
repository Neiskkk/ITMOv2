# Integration-проверки

`TRAINING_PR.diff` подтверждает только цепочку `POST /api/reviews -> review_service.review -> llm.generate` и текущий ответ `{"comment": answer}`. Остальные строки ниже проверяют требуемое поведение из `CASE.md`; они не утверждают, что оно уже реализовано.

| Связь компонентов | Что может сломаться | Как воспроизводим | Ожидаемый результат | Evidence |
|---|---|---|---|---|
| API -> ReviewService | Передача не того diff | Подменить ReviewService spy-объектом; отправить `POST /api/reviews` с diff с уникальным маркером | Spy получает ровно значение поля `diff`; текущая связь подтверждена учебным diff | `TRAINING_PR.diff`: `app/api.py` |
| API -> проверка размера | Ошибка на нижней стороне границы | Отправить по одному запросу с diff длиной 19 999 и 20 000 символов; наблюдать вызов ReviewService | Оба входа не отклоняются как превышающие лимит; точный успешный HTTP-код источником не задан | `CASE.md`: API-1; `TRAINING_PR.diff`: `app/api.py` |
| API -> проверка размера | Принятие превышенного размера | Отправить diff длиной 20 001 символ; наблюдать вызов ReviewService | HTTP 413; ReviewService и внешний LLM не вызываются | `CASE.md`: API-1; `TRAINING_PR.diff`: `app/api.py` |
| ReviewService -> LLM | Утечка тестового токена | Передать diff с уникальным тестовым токеном; LLM заменить spy | В аргументе `llm.generate` отсутствует исходный токен | `CASE.md`: SEC-1; `TRAINING_PR.diff`: `app/review_service.py` |
| ReviewService -> LLM | Утечка тестового пароля | Передать diff с уникальным тестовым паролем; LLM заменить spy | В аргументе `llm.generate` отсутствует исходный пароль | `CASE.md`: SEC-1; `TRAINING_PR.diff`: `app/review_service.py` |
| ReviewService -> LLM | Утечка тестового приватного ключа | Передать diff с тестовым приватным ключом; LLM заменить spy | В аргументе `llm.generate` отсутствует исходный ключ | `CASE.md`: SEC-1; `TRAINING_PR.diff`: `app/review_service.py` |
| ReviewService -> LLM | Внешний вызов зависает | LLM-mock не отвечает дольше 10 секунд | Вызов ограничен timeout 10 секунд, сервис формирует контролируемый ответ; его точные код и схема неизвестны | `CASE.md`: REL-1; `TRAINING_PR.diff`: `app/review_service.py` |
| ReviewService -> LLM | Ошибка зависимости выходит наружу без обработки | LLM-mock возвращает ошибку | Клиент получает контролируемый ответ, а не необработанную ошибку; точный контракт неизвестен | `CASE.md`: REL-1; `TRAINING_PR.diff`: `app/review_service.py` |
| LLM -> ReviewService -> API | Ответ не соответствует контракту | LLM-mock возвращает данные для summary, четырёх рисков и checks; отправить запрос к API | Ответ содержит `summary`, `risks`, `checks`; рисков не более трёх, каждый имеет `file`, `line`, `evidence`, `risk`. Текущий `{"comment": answer}` фиксируется как разрыв | `CASE.md`: OUT-1; `TRAINING_PR.diff`: `app/review_service.py`, `app/api.py` |
| LLM -> ReviewService -> API | Неподтверждённый риск попадает в ответ | LLM-mock возвращает риск без строки diff и без релевантного правила | Такой риск отсутствует в итоговом `risks` | `CASE.md`: QA-1, OUT-1; `TRAINING_PR.diff`: `app/review_service.py` |
| Запрос -> журнал (точка наблюдения неизвестна) | В лог попадают diff или ответ модели | Отправить запрос с двумя уникальными маркерами: один в diff, второй в ответе LLM-mock; собрать записи запроса | В записи есть только `request_id`, длительность и статус; оба маркера отсутствуют | `CASE.md`: OBS-1; `context.md`: точка логирования не указана |
| Сервис -> внешние действия (клиент не показан) | Сервис пишет код или выполняет approve/merge | Выполнить запрос и наблюдать доступные внешние зависимости; если их нельзя перечислить, зафиксировать ограничение стенда | Возвращается только совет; внешних действий записи, approve и merge нет | `CASE.md`: SCOPE-1; `context.md`: GitHub-интеграция не описана |

## Как использовали AI

- Строка в [`prompts.md`](prompts.md):
  - P1-03 (Заполнение SDLC).
- Техника Практики 2:
  - RAG из [`../practice_02/rag/experiment.md`](../practice_02/rag/experiment.md).
- Что проверили и исправили сами:
  - Сверили компоненты с `TRAINING_PR.diff`, требования — с `CASE.md`, неизвестные — с `context.md`; не добавляли отдельный компонент нормализации, middleware, gateway, GitHub-клиент и неподтверждённые результаты запусков.
