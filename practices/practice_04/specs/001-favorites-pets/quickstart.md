# Quickstart Validation Guide — «Избранные питомцы»

Status: Plan-only validation guide (no implementation)

Prereqs:
- Approved specs and contract
- Local static server (python3 -m http.server 8000)
- Browser with devtools (for console and localStorage inspection)

Scenarios:

## 1) Happy path
- Step: Открыть каталог, нажать «Избранное» на карточке.
- Expect: aria-pressed=true; live: «<Имя> добавлен(а) в избранное.»; persisted=true; в localStorage ключ shelter.catalog.favorites содержит id.
- Step: Включить «Только избранные».
- Expect: отображаются только избранные; поиск и фильтр вида ограничивают подмножество.
- Step: Перезагрузить страницу.
- Expect: состояние избранных восстановлено.

## 2) Ошибочные
- Corrupted JSON: вручную записать {bad json} в ключ и перезагрузить.
- Expect: список избранных пустой; live: «Список избранных восстановлен.»; persisted зависит от исправляющей записи.
- Storage unavailable: эмулировать приватный режим/ошибку setItem.
- Expect: ok=true, persisted=false; одно live-сообщение «Избранные не сохранятся после перезагрузки.»; состояние сохраняется в памяти.
- UNKNOWN_ID: вызвать toggleFavorite("ghost") в консоли.
- Expect: ok=false; UI-состояние не меняется.

## 3) Граничные
- Удаление последнего избранного при включённом favoritesOnly.
- Expect: пустое состояние без мерцаний; CTA «Вернуться к списку» выключает favoritesOnly.
- Большой набор избранных (N≈100).
- Expect: toggle ≤ 50 мс; без заметных лагов.

## 4) Регрессионные
- Поиск по имени и фильтры вида при favoritesOnly=false работают как прежде.
- Форма заявки «Познакомиться» и кнопка не зависят от избранного.

Artifacts for report:
- Скриншоты/видео ключевых сценариев (до/после)
- Экспорт диаграмм Mermaid из спецификаций в изображения
- Консольные логи ошибок/исправлений (при ошибочных сценариях)
