# Design

## Context

Каталог реализует фильтры вида («all», «cat», «dog») и поиск по имени (AND-логика). renderAnimals(filter) отвечает за рендер карточек и пустого состояния. setActiveFilter(filter) переключает визуальное состояние фильтров и вызывает renderAnimals. Поиск, счётчики и форма заявки уже работают.

## Goals / Non-Goals

**Goals:**
- Сохранять выбранный фильтр в localStorage и восстанавливать его при загрузке.
- Обрабатывать только поддерживаемые значения (all/cat/dog); при иных — использовать all.
- Не сохранять поисковый запрос и любые персональные данные.
- Сохранить текущее поведение поиска, счётчиков, формы и «Познакомиться».

**Non-Goals:**
- Любые сетевые запросы или backend.
- Изменение структуры данных животных.

## Decisions

- Ключ localStorage: `shelter.catalog.filter` (стабильный, описательный).
- Сохранение: при вызове setActiveFilter(filter) дополнительно записывать filter в localStorage.
- Восстановление: в initializeCatalog() читать значение, валидировать (all/cat/dog), падать обратно на all, затем вызвать setActiveFilter(validFilter). Это сохранит единый путь обновления UI.
- Валидация: сравнение по строгому списку; любые иные или нестроковые значения игнорируются.
- Без влияния на поиск: поисковое поле не записывается и инициализируется пустым, как сейчас.

Альтернативы:
- sessionStorage вместо localStorage — отклонено: требуется межсессионное запоминание.

## Взаимодействие компонентов (Mermaid)

```mermaid
sequenceDiagram
  participant U as Пользователь
  participant UIF as UI фильтров
  participant Init as initializeCatalog
  participant Set as setActiveFilter
  participant LS as localStorage
  participant Render as renderAnimals

  %% 1) Выбор фильтра: Пользователь → UI → setActiveFilter → localStorage и renderAnimals → UI
  U->>UIF: Выбирает фильтр (Все/Кошки/Собаки)
  UIF->>Set: setActiveFilter(filter)
  Set->>LS: setItem('shelter.catalog.filter', filter)
  Set->>Render: renderAnimals(filter)
  Render->>UIF: Обновить карточки каталога

  %% 2) Загрузка страницы: initializeCatalog → localStorage → валидация → setActiveFilter → renderAnimals → UI
  Init->>LS: getItem('shelter.catalog.filter')
  Init->>Init: Валидация (all|cat|dog) или fallback 'all'
  Init->>Set: setActiveFilter(validFilter)
  Set->>Render: renderAnimals(validFilter)
  Render->>UIF: Обновить карточки каталога

  %% 3) Поиск: вызывает renderAnimals с активным фильтром, запрос не сохраняется
  U->>UIF: Вводит поиск по имени
  UIF->>Render: renderAnimals(activeFilter + query)
  Note over UIF,LS: Поисковый запрос не сохраняется в localStorage
```

## Risks / Trade-offs

- Повреждённое значение в localStorage: защищено валидатором, fallback на all.
- Потенциальная гонка с первым рендером: ensure порядок — восстановление фильтра до первого renderAnimals().

## Migration Plan

- Реализация без изменения DOM структуры; только логика.
- Проверить node --check и ручные сценарии: восстановление фильтра, совместимость с поиском и «Познакомиться».
