# Data Model — «Избранные питомцы»

Status: Designed (plan phase)

Scope: сущности и валидационные правила для реализации функции без изменения кода на этом этапе.

---

## Entities

### Animal (existing)
- id: string (stable, non-empty)
- name: string (non-empty)
- species: "cat" | "dog"
- age: string
- sex: string
- image: string (local path)
- alt: string (meaningful)
- description: string

Validation:
- id unique across catalog; string, length > 0.
- species limited to {cat,dog}.
- alt present and meaningful per accessibility rules.

### FavoritesSet (logic)
- Type: Set<string> in-memory
- Persistence: JSON array in localStorage under key shelter.catalog.favorites

Validation on read:
- Accept only Array.
- Elements: string, length > 0.
- Remove duplicates (Set semantics).
- Ignore unknown ids (not present in current catalog) and non-string/empty values.
- If normalized array differs from stored — schedule corrective write when possible.

### UI State (ui)
- favoritesOnly: boolean (default false; not persisted)
- searchTerm: string (applies to name only; case-insensitive)
- speciesFilter: "all" | "cat" | "dog"

---

## Derived States

- isFavorite(animalId): boolean — membership in FavoritesSet.
- favoritesIds: string[] — ordered or arbitrary; ui should not assume order.
- favoritesCount: number — size of FavoritesSet.

---

## Transitions (informal)

- toggleFavorite(id):
  - If unknown id → Result { ok=false, code=UNKNOWN_ID, persisted } (no change)
  - If present → remove; else → add
  - Attempt persist; persisted reflects storage outcome
  - Return: ok, changed, isFavorite, favoritesIds, favoritesCount, persisted, code?, message?

- Initialization:
  - Read storage → parse → validate → set FavoritesSet
  - On SyntaxError: set empty; corrective write [] (code=CORRUPTED_DATA_RECOVERED; persisted depends on write)
  - On storage unavailable: operate in-memory; persisted=false

---

## Filtering (AND)

Order (logical, commutative for outcome):
1) favoritesOnly (if true → base subset = favoritesIds)
2) speciesFilter (within base subset)
3) searchTerm applied to Animal.name (case-insensitive)

UI ensures renderAnimals(filter) composes these correctly.

---

## Accessibility Contracts

- Button aria-pressed reflects isFavorite.
- aria-label template uses Animal.name per spec.
- aria-live="polite" region for confirmation and storage notices (debounced).

---

No implementation in this document. This model aligns with approved specs and the unified contract.
