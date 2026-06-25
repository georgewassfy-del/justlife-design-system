<!--
  Justlife Design System — Pull Request
  The system's integrity comes first. Reuse before creation; tokens only.
-->

## What & why

<!-- What does this change and why? Link the request/issue. -->

## Reuse-first checklist (required)

- [ ] I checked for an existing **component** that solves this.
- [ ] I checked for an existing **pattern**/composition.
- [ ] I checked for existing **tokens** (no new token unless justified below).
- [ ] I checked for an existing **variant/state** before adding a new one.

> If you created something new, explain why no existing solution fit:
>
> _…_

## Tokens

- [ ] No raw colours/dimensions — values come from `@justlife/tokens` (lint passes).
- [ ] If I added a token: it is documented and justified (a new token is a
      system-level decision and needs design-system CODEOWNERS approval).

## Component quality (if applicable)

- [ ] Stories cover all variants and the full state matrix.
- [ ] MDX docs follow the template (Purpose / Usage / Do-Not-Use / Variants /
      States / Accessibility / Responsive / Platform notes / Tokens used).
- [ ] Accessibility: roles, labels, ≥44px touch targets, contrast.
- [ ] Tests added/updated (unit + a11y).
- [ ] Platform differences handled via `.web/.ios/.android` files (not forced).

## Changeset

- [ ] Added a changeset (`pnpm changeset`) if a published package changed.
