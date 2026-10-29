# Implementation Plan: «Избранные питомцы» (Plan artifacts only)

Status: Plan artifacts generated (no tasks/implement)

Meta:
- Branch: 2026-kolesnik_anastasia-practice-05
- Feature Directory: practices/practice_04/specs/001-favorites-pets
- FEATURE_SPEC: practices/practice_04/specs/001-favorites-pets/spec.md (Approved)
- LOGIC_SPEC: practices/practice_04/specs/001-favorites-pets/logic-spec.md (Approved)
- CONTRACT: practices/practice_04/specs/001-favorites-pets/contract.md (Approved)
- IMPL_PLAN: practices/practice_04/specs/001-favorites-pets/plan/plan.md

Scope: создать только артефакты плана на основе утверждённых спецификаций и конституции проекта. Код приложения (index.html, styles.css, script.js) не изменяется. tasks и implement не запускаются.

---

## Technical Context

- Текущий проект: одностраничный SPA на HTML5, CSS3, JavaScript (ES2022+) без фреймворков и зависимостей; локальный запуск через python3 -m http.server.
- Основные файлы: index.html, styles.css, script.js; данные животных — массив объектов (см. AGENTS.md).
- Фича: «Избранные питомцы» — кнопка на карточке, режим «Только избранные», интеграция с поиском (только по имени) и фильтрами вида (Все/Кошки/Собаки).
- Контракт UI ⇄ Логика: toggleFavorite(animalId) возвращает ok, changed, isFavorite, favoritesIds, favoritesCount, persisted, code?, message?.
- Персистенция: localStorage ключ shelter.catalog.favorites; формат JSON-списка строковых id; валидация и dedupe; fallback на in-memory Set при ошибке хранилища.
- favoritesOnly принадлежит UI и не сохраняется между перезагрузками.
- Фильтрация: AND-логика — favoritesOnly → вид → поиск по имени (case-insensitive).
- Доступность: aria-pressed, aria-label, aria-live="polite"; клавиатура (Tab, Enter/Space); видимый focus; prefers-reduced-motion уважать.

Unknowns → решены в research.md:
- Размещение aria-live региона и сообщения persisted=false.
- Текстовые шаблоны aria-label и live-уведомлений.
- Соглашения по data-* атрибутам для привязки UI к логике.

---

## Constitution Check (Pre-Design)

Checked against .specify/memory/constitution.md v1.0.0:
- I. Технологический стек: соблюдается (HTML5/CSS3/ES2022+, DOM API; без фреймворков/сетевых запросов/зависимостей).
- II. Доступность: предусмотрены aria-атрибуты, клавиатурная навигация, видимый фокус, aria-live, aria-invalid не требуется для этой фичи; не только цветом.
- III. Адаптивность: mobile-first; контрольные 320/768/1440 px — без горизонтального скролла.
- IV. Безопасность: без innerHTML для пользовательских данных; id — строки; JSON.parse в try/catch; нет персональных данных; localStorage только id.
- V. Спецификации до кода: UI и Логика Approved; единый контракт Approved; план создаётся до кода.
- VI. Человеческое согласование: зафиксировано Approved во всех трёх документах; этот план — после согласования.
- VII. Сценарии: план включает основной/ошибочный/граничный/регрессионный сценарии в quickstart.md.
- VIII. Диаграммы Mermaid: UI и Логика содержат диаграммы; ссылка на них в отчёте; экспорт в изображения — шаг в валидации.
- IX. Доказательства: quickstart.md определяет артефакты проверок (скриншоты/логи) для отчёта.
- X. Непрерывность критических функций: поиск, фильтры, форма заявки и «Познакомиться» сохраняются; регрессионные проверки включены.

Gate Evaluation: PASS. Нарушений конституции не выявлено.

---

## Phase 0: Outline & Research

Artifacts:
- practices/practice_04/specs/001-favorites-pets/plan/research.md — решает все NEEDS CLARIFICATION из Technical Context.

Key outcomes:
- Размещён live-регион; определены тексты уведомлений; согласованы data-* селекторы; политика одного уведомления при STORAGE_UNAVAILABLE.

---

## Phase 1: Design & Contracts

Artifacts:
- practices/practice_04/specs/001-favorites-pets/plan/data-model.md — сущности, валидация, состояния.
- practices/practice_04/specs/001-favorites-pets/plan/contracts/README.md — ссылка на утверждённый unified contract.
- practices/practice_04/specs/001-favorites-pets/plan/quickstart.md — валидационный гайд сценариев.

Post-Design Constitution Check: PASS — артефакты соответствуют конституции.

---

## Completion

Этот документ фиксирует артефакты плана и останавливается до задач и реализации.
