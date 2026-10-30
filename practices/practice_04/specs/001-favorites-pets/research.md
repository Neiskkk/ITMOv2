# Research & Decisions — «Избранные питомцы»

Status: Complete (pre-design research)

Scope: закрыть открытые вопросы из Technical Context перед проектированием и реализацией. Основано на утверждённых UI Spec, Logic Spec и Unified Contract.

---

## R-001: Размещение aria-live региона
- Decision: один живой регион aria-live="polite" в разделе «Питомцы», рядом с заголовком секции (visually hidden). Сообщения короткие, без блокировки фокуса.
- Rationale: единая точка для сообщений «Добавлено/Удалено из избранного» и уведомлений об офлайн-персистенции (persisted=false).
- Alternatives considered: toast/alertdialog — избыточно; inline-подписи на кнопках — дублирование и риск переизбыточности.

## R-002: Шаблоны aria-label для кнопки
- Decision: 
  - Неизбранный: «Добавить в избранное: <Имя питомца>»
  - Избранный: «Убрать из избранного: <Имя питомца>»
- Rationale: соответствует UI Spec FR-004 и Accessibility.
- Alternatives considered: сокращённые подписи без имени — хуже ясность при нескольких карточках в фокусе.

## R-003: Сообщения в aria-live
- Decision: 
  - Добавление: «<Имя> добавлен(а) в избранное.»
  - Удаление: «<Имя> удалён(а) из избранного.»
  - Storage unavailable (debounced once per session): «Избранные не сохранятся после перезагрузки.»
  - Corrupted data recovered: «Список избранных восстановлен.»
- Rationale: краткие, нейтральные, не блокируют фокус, покрывают контрактные коды.

## R-004: data-* атрибуты и связывание UI↔Логика
- Decision: 
  - Кнопка избранного: [data-favorite-btn][data-animal-id="<id>"]
  - Карточка: [data-animal-card][data-animal-id]
  - Контрол «Только избранные»: #favorites-only-toggle (type=checkbox)
- Rationale: устойчивые селекторы без привязки к классам/DOM-структуре; соответствуют AGENTS.md.

## R-005: Обработка persisted=false
- Decision: UI показывает одно ненавязчивое сообщение в live-регионе (debounced) и не откатывает UI-состояние; persisted=false сигнализируется логикой в ответах; UI добавляет подсказку в подсказочный блок «под контролами» при повторных событиях (без дублирования).
- Rationale: контракт п.6; Logic Spec §4.

## R-006: Инициализация состояния из localStorage
- Decision: при входе в раздел UI вызывает getFavoritesState(); применяет favoritesIds к карточкам; ошибки парсинга и восстановление [] обрабатываются логикой, UI только отображает уведомление при необходимости.
- Rationale: инкапсуляция логики; UI — отображение.

## R-007: AND-логика фильтров
- Decision: применение фильтров строго в порядке: favoritesOnly → species → search(name, ci). Реализация в renderAnimals(filter) остаётся в существующем файле script.js, UI формирует filter на основе текущих контролов и favoritesIds.
- Rationale: предсказуемость, соответствие обоим спецификациям.

## R-008: Производительность и доступность
- Decision: обработчики событий делегируются на контейнер списка; aria-pressed обновляется синхронно; без принудительных перерисовок вне renderAnimals; фокус остаётся на кнопке.
- Rationale: AC-LOGIC-007; WCAG; минимизация layout thrash.

---

All unknowns resolved. Hand-off ready for Phase 1 design.
