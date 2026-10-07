# STYLE_GUIDE — учебный лендинг «Лапа помощи»

Основано на текущей реализации (`index.html`, `styles.css`). Используй как справочник при доработках и код-ревью.

## 1. Цвета и токены (`:root`)
- paper: `#f2f5f0` — фон страницы.
- ink: `#18362f` — основной текст и границы.
- blue: `#3159d8` — акцентный фон CTA и hero.
- yellow: `#f2c94c` — маркеры, бейджи, фон пустых состояний.
- sage: `#bfd0c0` — вторичный фон, disabled.
- white: `#ffffff` — фон карточек и полей.
- line: `rgba(24, 54, 47, 0.24)` — вспомогательные линии (пока не используется явно).
- radius-small: `0.4rem` — кнопки, поля.
- radius-large: `1.25rem` — карточки, контейнеры.
- shadow: `5px 5px 0 var(--ink)` — ретро-тень для акцентных элементов.
- content-width: `1180px` — максимальная ширина контента.

## 2. Типографика
- База: `font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif`; `line-height: 1.55`.
- Заголовки: жирный гротеск (семейство с fallback: `"Arial Black", "Segoe UI Black", "Segoe UI", sans-serif`).
- h1: `clamp(3.4rem, 12vw, 7.5rem)`, `line-height: 0.9`, `letter-spacing: -0.065em`.
- h2: `clamp(2.35rem, 8vw, 5rem)`, `line-height: 0.96`, `letter-spacing: -0.055em`.
- h3 (в карточках): `clamp(1.9rem, 8vw, 2.75rem)`, `line-height: 1`, `letter-spacing: -0.045em`.
- Тексты разделов: ~`1.08–1.12rem` в зависимости от блока.
- Ссылки наследуют цвет и имеют `text-underline-offset: 0.25rem`.

## 3. Отступы и сетка
- Контейнеры секций: внутренний отступ `padding: 4.5rem 1rem` (на десктопе увеличивается до `padding-block: 6rem`).
- Заголовочные блоки (pets-heading): gap `2rem`, отступ снизу `2.25rem`.
- Сетка карточек (`.animal-grid`): mobile `1 кол.`; ≥600 px — `2 кол.`; ≥1024 px — `3 кол.`. Gap `1rem`.
- Карточка (`.animal-card`): граница `2px solid var(--ink)`, `border-radius: var(--radius-large)`, overflow hidden.
- Внутри карточки: `.animal-body` padding `1.15rem`.
- Hero: двухколоночная сетка с ≥768 px; постер имеет декоративную окружность.

## 4. Кнопки и элементы управления
- Primary action (`.primary-action`):
  - Цвета: текст `white`, фон `blue`, рамка `2px ink`, тень `var(--shadow)`.
  - Состояния: hover/focus-visible — уменьшенная тень (`2px 2px 0`) и лёгкий смещённый трансформ.
  - Размер: `min-height: 48px`; `font-weight: 800`; скругление `radius-small`.
- Фильтры (`.filter-button`):
  - База: прозрачный фон, рамка `2px ink`, `font-weight: 800`, `min-height: 46px`.
  - Счётчик (`span`): круглый бейдж `sage`, `font-size: 0.75rem`.
  - Active/hover/focus-visible: инверсия — фон `ink`, текст `white`; активный бейдж `yellow` с тёмным текстом.
  - :active — лёгкий `translateY(2px)`.
- CTA карточки (`.meet-button`):
  - База: фон `yellow`, текст `ink`, рамка `2px ink`, `min-height: 48px`, жирный.
  - Hover/focus-visible: фон `blue`, текст `white`.
  - :active — `translateY(2px)`.
- Disabled-action (заглушка Feature 2):
  - Серый стиль: фон `sage`, граница `#4f625d`, курсор `not-allowed`.

## 5. Формы
- Поля (`input`, `select`): высота `≥48px`, внутренний отступ `0.75rem`, фон `white`, рамка `2px ink`, скругление `radius-small`.
- Лейблы: `display: block`, `margin-bottom: 0.4rem`, `font-weight: 800`.

## 6. Состояния фокуса и доступность
- Глобальный фокус: `:focus-visible { outline: 4px solid var(--yellow); outline-offset: 3px; }`.
- Кнопки и ссылки имеют явные состояния `:hover` и `:focus-visible`.
- Поддержана клавиатурная доступность в фильтрах (через `aria-pressed`) и live-обновления каталога (`aria-live="polite"`).

## 7. Изображения
- Карточки: `img.animal-photo` с `aspect-ratio: 4/3`, `object-fit: cover`, `loading="lazy"`, фиксированная граница снизу `2px ink`.

## 8. Адаптивность и брейкпоинты
- Mobile-first, min-width: 320 px.
- ≥600 px: `.animal-grid` → 2 колонки; `.help-list` в 2 колонки; footer в строку.
- ≥768 px: hero становится двухколоночным; увеличены внутренние отступы секций; формы и контент — двухколоночные сетки.
- ≥1024 px: `.animal-grid` → 3 колонки; каждая 2-я карточка имеет декоративный сдвиг (`transform: translateY(1.25rem)`).
- ≤700 px: в хедере скрываются второстепенные ссылки навигации, остаётся CTA.
- `prefers-reduced-motion: reduce`: отключает плавный скролл и анимации переходов.

## 9. Композиция и стиль
- Визуальный язык — контрастные рамки `2px` и жирные заголовки с отрицательным трекингом.
- Акценты: синий и жёлтый на фоне «бумаги» (`paper`).
- Использовать Flex/Grid; избегать абсолютного позиционирования как основы макета.

## 10. Тональность интерфейса
- Тексты на русском, дружелюбные и прямые: «Смотреть питомцев», «Познакомиться с …», «Начнём знакомство».
