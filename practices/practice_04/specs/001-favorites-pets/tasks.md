# Tasks — «Избранные питомцы» (Executable Checklist)

Feature dir: practices/practice_04/specs/001-favorites-pets
Plan: practices/practice_04/specs/001-favorites-pets/plan.md
Docs: spec.md (UI), logic-spec.md, contract.md, data-model.md, research.md, quickstart.md

Conventions:
- Checklist format: - [ ] T### [P?] [US#?] Description with file path
- [P] marks safe parallel tasks (different files, no unmet deps)
- Do not change code outside practices/practice_04 unless explicitly instructed (homework evidence paths are outside but allowed by request)

---

## Phase 1 — Setup (validation infrastructure)

- [ ] T001 [P] Create evidence directories ../practice_05/homework/evidence/diagrams and ../practice_05/homework/evidence/screenshots (filesystem only)
- [ ] T002 [P] Create evidence log ../practice_05/homework/evidence/run-log.md with sections: Scenarios, Console logs, Notes
- [ ] T003 [P] Create evidence README ../practice_05/homework/evidence/README.md referencing quickstart.md and contract.md; include how to run local server and node --check
- [ ] T004 [P] Export Mermaid diagrams to PNG per specs into ../practice_05/homework/evidence/diagrams (document tool used) — sources: specs/001-favorites-pets/spec.md, logic-spec.md, contract.md

## Phase 2 — Foundational (Logic baseline, no UI yet)

- [ ] T005 Initialize favorites constants and state in practices/practice_04/script.js (STORAGE_KEY="shelter.catalog.favorites", in-memory Set, persisted flag)
- [ ] T006 Implement initFavorites() in practices/practice_04/script.js: read getItem; if null → []; try/catch JSON.parse
- [ ] T007 Validate storage payload in practices/practice_04/script.js: Array only; elements type string, length>0; dedupe; drop unknown ids (not in animals array)
- [ ] T008 Corrective write in practices/practice_04/script.js: when normalized array differs, setItem JSON of unique strings; set code=CORRUPTED_DATA_RECOVERED; persisted per write result
- [ ] T009 Handle storage unavailable in practices/practice_04/script.js: catch SecurityError/QuotaExceededError; keep in-memory; persisted=false; prepare single message for UI
- [ ] T010 Implement getFavoritesState() in practices/practice_04/script.js → { favoritesIds, favoritesCount, persisted } (exact contract)
- [ ] T011 Implement isFavorite(animalId) in practices/practice_04/script.js (boolean membership)
- [ ] T012 Implement addFavorite(animalId) in practices/practice_04/script.js: precondition unknown id → { ok:false, code:"UNKNOWN_ID", persisted }; idem for existing id → { ok:true, changed:false }
- [ ] T013 Implement removeFavorite(animalId) in practices/practice_04/script.js: idem semantics; storage sync
- [ ] T014 Implement toggleFavorite(animalId) in practices/practice_04/script.js: returns ok, changed, isFavorite, favoritesIds, favoritesCount, persisted, code?, message? per contract
- [ ] T015 Run syntax check node --check practices/practice_04/script.js and record output in ../practice_05/homework/evidence/run-log.md (must be OK)

## Phase 3 — User Story 1 (P1): Отметить питомца как избранного
Goal: Toggle favorite; aria correctness; live; focus maintained

- [ ] T016 [US1] Add visually hidden live region in practices/practice_04/index.html within section#pets: <div id="fav-live" aria-live="polite" class="visually-hidden"></div>
- [ ] T017 [US1] Add favorite button via safe DOM API inside createAnimalCard in practices/practice_04/script.js: create button type="button" with [data-favorite-btn] and [data-animal-id], set aria-pressed and aria-label from research.md
- [ ] T018 [US1] Style focus/active/hover in practices/practice_04/styles.css for [data-favorite-btn] (visible focus, WCAG AA, prefers-reduced-motion respected)
- [ ] T019 [US1] Wire delegated click handler only in practices/practice_04/script.js for [data-favorite-btn] → toggleFavorite(animalId); rely on native button keyboard behavior (no keydown handler) and add a separate keyboard accessibility check task
- [ ] T020 [US1] Update button state in practices/practice_04/script.js post-toggle: aria-pressed; aria-label per research.md; announce to #fav-live
- [ ] T021 [US1] Maintain/restore keyboard focus in practices/practice_04/script.js after renderAnimals: return focus to same [data-animal-id] button or next control
- [ ] T022 [US1] Validate no console errors; capture screenshot/GIF; log notes in ../practice_05/homework/evidence/screenshots and run-log.md

## Phase 4 — User Story 2 (P1): Показать только избранных (favoritesOnly)
Goal: Show only favorites; empty state; CTA returns

- [ ] T023 [US2] Add favoritesOnly control (checkbox/toggle) in practices/practice_04/index.html id="favorites-only-toggle" with accessible label
- [ ] T024 [US2] Implement favoritesOnly UI state in practices/practice_04/script.js (not persisted); onchange → re-render
- [ ] T025 [US2] Implement AND-filtering in practices/practice_04/script.js within renderAnimals: base=favoritesIds when favoritesOnly=true → then species → then search(name, ci)
- [ ] T026 [US2] Extend existing #empty-state in practices/practice_04/index.html for favorites mode: add state variant and CTA «Вернуться к списку» (unchecks favorites-only and renders), preserving existing empty state for search/filters
- [ ] T027 [US2] Ensure removing last favorite while favoritesOnly=true shows empty state without flicker in practices/practice_04/script.js (debounced re-render if needed)
- [ ] T028 [US2] Validate behavior and record evidence in ../practice_05/homework/evidence

## Phase 5 — User Story 3 (P2): Совместная работа с поиском и фильтрами
Goal: With favoritesOnly, search by name and species filter apply within favorites subset

- [ ] T029 [US3] Ensure search (name-only, ci) composes with favoritesOnly in practices/practice_04/script.js; pipeline order enforced
- [ ] T030 [US3] Ensure species filter (all/cat/dog) composes within favorites subset in practices/practice_04/script.js; empty shows hint
- [ ] T031 [US3] Validate combinations and log examples in ../practice_05/homework/evidence/run-log.md

## Phase 6 — Accessibility & Adaptivity (Cross-cutting)

- [ ] T032 [P] Ensure visible focus styles for interactive elements in practices/practice_04/styles.css (buttons, toggle); no color-only cues
- [ ] T033 [P] Mobile-first adjustments for favorite button at 320/768/1440 in practices/practice_04/styles.css (icon-only at 320; optional text at 768/1440); no horizontal scroll
- [ ] T034 [P] Respect prefers-reduced-motion in practices/practice_04/styles.css: no complex animations; instant state change

## Phase 7 — Error, Edge, Regression Scenarios (Validation)

- [ ] T035 Simulate corrupted JSON and validate corrective write []; log code=CORRUPTED_DATA_RECOVERED and persisted in ../practice_05/homework/evidence/run-log.md
- [ ] T036 Simulate storage unavailable (private mode/exception); confirm ok=true, persisted=false; single live message; log in ../practice_05/homework/evidence/run-log.md
- [ ] T037 Edge: remove last favorite while favoritesOnly=true; verify empty state; log evidence in ../practice_05/homework/evidence
- [ ] T038 Regression: verify search, species filters, application form and «Познакомиться» unaffected; log evidence in ../practice_05/homework/evidence
- [ ] T039 Run node --check practices/practice_04/script.js; append output to ../practice_05/homework/evidence/run-log.md (must be clean)
- [ ] T040 Launch local server python3 -m http.server 8000 from practices/practice_04, test 320/768/1440; capture screenshots in ../practice_05/homework/evidence/screenshots

## Phase 8 — Reporting & Reflection

- [ ] T041 Export final PNGs exist and referenced in ../practice_05/homework/evidence/README.md
- [ ] T042 Assemble evidence bundle in ../practice_05/homework/evidence (screenshots, logs, PNGs); update index
- [ ] T043 Update practices/practice_04/README.md with run commands and manual checklist
- [ ] T044 Add reflection ../practice_05/homework/reflection.md (decisions, trade-offs, performance, accessibility)

---

Dependencies & Order
- Foundational logic (Phase 2) → US1 (Phase 3) → US2 (Phase 4) → US3 (Phase 5); cross-cutting and validation afterwards
- Parallel [P] tasks in Phases 1 and 6 are independent

MVP Scope
- Complete US1 (Phase 3) on top of Phase 2 logic

Format validation
- All tasks follow checklist format with IDs and file paths

Summary
- Total tasks: 44
- Phase counts: Phase 1=4, Phase 2=11, Phase 3=7, Phase 4=6, Phase 5=3, Phase 6=3, Phase 7=6, Phase 8=4
