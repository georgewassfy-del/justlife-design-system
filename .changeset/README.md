# Changesets

This folder holds [changesets](https://github.com/changesets/changesets). When
you change a published package (`@justlife/tokens`, `@justlife/ui`, …), add a
changeset describing the change and its semver impact:

```bash
pnpm changeset
```

Releases run `pnpm version-packages` then `pnpm release`.
