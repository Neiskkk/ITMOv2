# Unified Contract: 001-favorites-pets (UI ⇄ Logic)

Status: Approved
Created: 2026-10-30

Scope: этот документ фиксирует согласованный контракт между командами UI и Логики для функции «Избранные питомцы». Он не изменяет исходные спецификации; служит единым источником правды о границах ответственности и формах обмена.

References:
- .specify/memory/constitution.md (Version 1.0.0)
- specs/001-favorites-pets/spec.md (UI Spec, Draft)
- specs/001-favorites-pets/logic-spec.md (Logic Spec, Draft)

---

## 1) Разделение ответственности (обязательные пункты контракта)

1. UI отвечает за:
   - отображение кнопок избранного на карточках, визуальные состояния, aria-атрибуты (aria-pressed, aria-label),
   - флаг favoritesOnly (видимый переключатель в UI),
   - пустое состояние раздела «Питомцы»,
   - вызов повторного рендера списка (renderAnimals) после изменений.

2. Логика отвечает за:
   - множество избранных идентификаторов (Set<string>) и его валидацию относительно каталога животных,
   - персистенцию в localStorage под ключом shelter.catalog.favorites,
   - корректную обработку ошибок хранилища и повреждённых данных.

3. UI передаёт стабильный строковый animalId в операцию toggleFavorite(animalId: string). Идентификаторы не преобразуются и не генерируются UI.

4. Результат toggleFavorite обязателен к структуре:
   - ok: boolean,
   - changed: boolean,
   - isFavorite: boolean,
   - favoritesIds: string[] (текущее полное множество избранных),
   - favoritesCount: number,
   - persisted: boolean (успешность последней синхронизации с localStorage),
   - code?: "UNKNOWN_ID" | "STORAGE_UNAVAILABLE" | "CORRUPTED_DATA_RECOVERED" | "OK_NOOP",
   - message?: string (ненавязчивое локализуемое пояснение для UI при необходимости).

5. При UNKNOWN_ID возвращается ok=false; состояние UI не меняется. UI может показать мягкое уведомление и оставить кнопку в исходном состоянии.

6. При ошибке localStorage (чтение/запись):
   - состояние сохраняется в памяти (in-memory Set),
   - операция остаётся успешной (ok=true), persisted=false,
   - UI показывает одно ненавязчивое сообщение за сессию (debounced), что «избранные не будут сохранены после перезагрузки».

7. Повреждённый JSON: значение в localStorage заменяется на [] (исправляющая запись). Поле persisted зависит от успешности этой записи; при успехе persisted=true, иначе persisted=false. Возвращается code=CORRUPTED_DATA_RECOVERED.

8. favoritesOnly не сохраняется между перезагрузками и принадлежит UI. Логика не персистит и не навязывает значение favoritesOnly; начальное значение по умолчанию — false.

9. Фильтрация выполняется по AND-логике: базовый набор ограничивается favoritesOnly (если включён), затем применяется фильтр вида (all/cat/dog), затем поиск только по имени (case-insensitive). Порядок не влияет на результат, но зафиксирован для предсказуемости.

10. После получения результата toggleFavorite UI обновляет aria-pressed, aria-label, публикует короткое сообщение в aria-live="polite" и повторно вызывает renderAnimals с актуальными фильтрами.

11. Отсутствует лимит на количество избранных; состояние избранных сохраняется между сессиями при доступном localStorage и корректных данных.

12. Таблица соответствия требований UI и Логики — см. раздел 3.

13. Общая Mermaid sequenceDiagram — см. раздел 4.

14. Human approval — см. раздел 5.

---

## 2) API и форматы обмена

### 2.1 Сигналы UI → Логика

- toggleFavorite(animalId: string): переключение состояния для конкретного питомца. Требование: animalId — стабильная строка.
- requestFavoritesState(): явная синхронизация при входе в раздел (опционально; используется для инициализации UI).

Примечание: favoritesOnly — состояние UI. UI не обязан вызывать setFavoritesOnly в логику; если такой хук присутствует для телеметрии, он не влияет на персистенцию и бизнес-логику.

### 2.2 Ответы Логики на toggleFavorite

Структура результата описана в п.4. Семантика полей:
- ok: общий успех операции. ok=false как минимум при code=UNKNOWN_ID.
- changed: true, если множество избранных изменилось (add/remove), иначе false (идемпотент).
- isFavorite: итоговое состояние данного animalId.
- favoritesIds, favoritesCount: полный набор и счётчик для синхронизации UI и фильтров.
- persisted: true при успешной синхронизации с localStorage для этой операции/последней попытки.
- code/message: уточнение причины особого состояния (например, STORAGE_UNAVAILABLE, CORRUPTED_DATA_RECOVERED, OK_NOOP).

### 2.3 Инициализация и чтение состояния

- getFavoritesState(): { favoritesIds: string[], favoritesCount: number, persisted: boolean } — используется UI для первичной синхронизации и отображения избранных меток на карточках.

### 2.4 Правила персистенции и валидации

- Ключ localStorage: shelter.catalog.favorites
- Формат: JSON-массив строковых id (например, ["cat-101", "dog-202"]).
- Валидация при чтении: массив, элементы — непустые строки; дубликаты удаляются; неизвестные id (отсутствующие в каталоге) игнорируются. При отличиях выполняется корректирующая запись приведённого массива при первой возможности.
- Ошибки localStorage: см. п.6; UI информируется через persisted=false и прилагаемое message.

---

## 3) Таблица соответствия требований UI и Логики

| Требование/Обязанность | UI | Логика |
|---|---|---|
| Кнопка избранного на карточке, состояния, aria-pressed/aria-label | ✓ | — |
| Пустое состояние и CTA «Вернуться к списку» | ✓ | — |
| favoritesOnly (видимый переключатель), не сохраняется между сессиями | ✓ | — |
| Вызов renderAnimals после toggle и переключателей | ✓ | — |
| Множество избранных id (Set), валидация, идемпотентность | — | ✓ |
| Персистенция под ключом shelter.catalog.favorites | — | ✓ |
| Обработка UNKNOWN_ID (ok=false), UI не меняет состояние | — | ✓ |
| Ошибка localStorage: in-memory продолжает, persisted=false, 1 уведомление | — | ✓ |
| Повреждённый JSON: замена [], code=CORRUPTED_DATA_RECOVERED | — | ✓ |
| Комбинированная фильтрация (AND): favoritesOnly → вид → поиск по имени | ✓ | ✓ (набор/данные) |
| Возврат результата toggle: ok, changed, isFavorite, favoritesIds, favoritesCount, persisted, code?, message? | — | ✓ |
| Сохранение избранных между сессиями при доступном storage | — | ✓ |

---

## 4) Mermaid sequenceDiagram (общая схема взаимодействия)

```mermaid
sequenceDiagram
  participant UI
  participant Logic
  participant Storage as localStorage
  participant Render as renderAnimals

  Note over UI,Logic: Инициализация раздела «Питомцы»
  UI->>Logic: requestFavoritesState()
  Logic->>Storage: getItem("shelter.catalog.favorites")
  alt Валидные данные
    Storage-->>Logic: "[\"id1\",\"id2\"]"
    Logic->>Logic: parse + validate + dedupe + filter unknown
    Logic-->>UI: favoritesIds=[id1,id2], favoritesCount=2, persisted=true
  else Повреждённый JSON
    Storage-->>Logic: "{bad json}"
    Logic->>Logic: set empty; attempt corrective write []
    alt Исправление удалось
      Logic-->>UI: favoritesIds=[], persisted=true, code=CORRUPTED_DATA_RECOVERED
    else Исправление не удалось
      Logic-->>UI: favoritesIds=[], persisted=false, code=CORRUPTED_DATA_RECOVERED
    end
  else Storage недоступен
    Logic->>Logic: use in-memory; mark persisted=false
    Logic-->>UI: favoritesIds=[], persisted=false, code=STORAGE_UNAVAILABLE
  end
  UI->>Render: renderAnimals(favoritesOnly=false + search + species)

  Note over UI,Logic: Пользователь нажимает «Избранное» на карточке
  UI->>Logic: toggleFavorite(animalId)
  Logic->>Logic: update in-memory Set
  Logic->>Storage: setItem(key, json)
  alt Запись удалась
    Storage-->>Logic: ok
    Logic-->>UI: ok=true, changed=?, isFavorite=?, favoritesIds, favoritesCount, persisted=true
  else Запись не удалась
    Logic->>Logic: keep in-memory; persisted=false
    Logic-->>UI: ok=true, changed=?, isFavorite=?, favoritesIds, favoritesCount, persisted=false, code=STORAGE_UNAVAILABLE
  end
  UI->>UI: update aria-pressed/aria-label; aria-live polite
  UI->>Render: renderAnimals(updated filters)

  Note over UI,Logic: Включение favoritesOnly (UI-состояние)
  UI->>UI: favoritesOnly=true (not persisted)
  UI->>Render: renderAnimals(favoritesOnly=true AND species AND name)
```

---

## 5) Human approval

Status: Approved

Approved by: Anastasia Kolesnik, project owner and human reviewer

Date: 2026-10-30

Notes: UI specification, logic specification and unified contract approved before plan, tasks and implementation.

---

## 6) Противоречия и замечания

После анализа UI и Logic спецификаций выявлены следующие моменты:

1) Владение favoritesOnly.
   - Logic-spec упоминает сигнал setFavoritesOnly(enabled) (раздел 8), что может читаться как участие логики в этом состоянии.
   - Контракт фиксирует: favoritesOnly — состояние UI и не персистится; любые вызовы в логику (если останутся) считаются необязательными и не влияющими на данные. Это уточнение, а не конфликт поведения.

2) Возврат favoritesIds из toggleFavorite.
   - Logic-spec (разделы 5 и 8) упоминает, что результаты операций включают актуальный массив favoritesIds, хотя не явно в сигнатуре toggle в п.91–99.
   - Контракт закрепляет обязательность возвращать favoritesIds и favoritesCount в ответе toggleFavorite — это согласовано с п.154 Logic-spec.

3) UI-спецификация (FR-012) говорит о возврате состояния кнопки «назад» при «неподтверждённой логикой» операции.
   - Контракт уточняет критерий: откат состояния UI выполняется только при ok=false (например, UNKNOWN_ID). При ошибках хранения (STORAGE_UNAVAILABLE) ok=true и persisted=false — UI не откатывает, а показывает ненавязчивое сообщение. Это соответствует Logic-spec (пп. 62–69, 124–126).

На текущий момент иных противоречий не обнаружено. Если появятся новые требования, они должны быть отражены дополнением к данному контракту и пройти Human approval.
