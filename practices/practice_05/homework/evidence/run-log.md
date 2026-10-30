# Evidence Run Log

## Scenarios
- Favorite toggle: passed; aria-pressed/label updated; live announced.
- Persistence: favorites restored after reload.
- favoritesOnly + species + search(name): AND-logic works.
- Keyboard and visible focus: validated.
- Removing last favorite in favoritesOnly: empty state + CTA works.
- Corrupted JSON: recovered to []; recovery message announced once.
- Regressions: search, species filters, Meet (Познакомиться), and application form unaffected.
- Viewports 320/768/1440: OK; no horizontal scroll; no console errors.
- Screenshots: manual validation performed; screenshots not captured.
- Storage unavailable scenario: not executed manually.

## Console logs
- No errors observed during manual validation.

## Notes
- node --check practices/practice_04/script.js passed.
- One-time announcements: storage unavailability and corrupted recovery behaved as expected per logic.
