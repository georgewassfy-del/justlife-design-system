# AGENTS.md — Justlife Design System

Operating rules for **anyone (or any AI tool) building in this repo** — Claude Code, Cursor, Copilot,
a teammate, whoever. Tool-agnostic on purpose. **Read this before creating or changing anything.**

- Formal policy & approval flow → [`docs/governance.md`](docs/governance.md)
- Day-to-day commands & setup → [`docs/contributing.md`](docs/contributing.md)
- Cross-platform (RN / RNW) rules → [`docs/platform-rules.md`](docs/platform-rules.md)
- Current build state / where to resume → [`docs/HANDOFF.md`](docs/HANDOFF.md)

This is a **code-first** design system: code is the source of truth, Figma is reference. Mobile-first
(React Native + react-native-web), every visual value comes from `@justlife/tokens`.

---

## The three non-negotiables

1. **Reuse before creation.** Audit existing components → patterns → tokens → variants before adding
   anything new. The smallest addition that fits the system wins.
2. **Tokens only.** No raw colours or dimensions in component/pattern code — ever. Use `useTheme()`.
3. **Everything is documented & tested.** Each component ships stories, MDX docs, and tests.

## Never invent — ask first

This is a **company** design system. Do **not** invent tokens, colours, assets, icons, or components
on your own. If something seems missing, surface it and ask. Adding a token is a **system-level
decision** (justify in the PR, place in the right tier, get CODEOWNERS approval — see governance).
The one historical carve-out (motion tokens) was explicitly authorised; treat it as the exception,
not the pattern.

---

## Design conventions

The accumulated, reusable rules. **Enforcement** says how the rule holds today — `Enforced` means a
token/default/lint/test makes it automatic; `Convention` means you must apply it by judgment (and it's
a candidate to graduate into code — see the ladder below).

> **This table is the living rulebook, fed by the user's design feedback.** Every critique — a high-level
> expectation or a small recurring preference — gets distilled into a row here (and pushed down the ladder
> into a token/component/lint where possible) so it's applied *automatically* next time, not repeated. When
> you get feedback, add or sharpen a rule before moving on.

| # | Rule | Why | Enforcement |
|---|------|-----|-------------|
| 1 | **Every visual value comes from a token** (`useTheme()` → `t.*`). No raw hex / rgb / dimension literals. | System integrity; theming. | **Enforced** — `justlife/no-raw-values` ESLint rule. |
| 2 | **Text uses Poppins via typography tokens** (`t.typography.*` / `<Text variant=…>`), never ad-hoc font sizes/weights. | One type system. | **Enforced** (colour/dimension lint) + Convention (variant choice). |
| 3 | **Defaults:** corner radius **12** (`radius.default`), horizontal spacing **8** (`space.default`), stroke **0.5** (`borderWidth.hairline`). | Consistency baseline. | **Enforced** — baked into token values. |
| 4 | **Off-scale spacing snaps to the nearest `space` step** (e.g. Figma 12→`sm`/8 region, 6→`xs`). Don't add a token for a one-off gap. | Avoid token proliferation. | Convention (lint blocks raw numbers; "snap" is judgment). |
| 5 | **Bottom-anchored bars clear the iOS home indicator** — `CheckoutBar` / `BottomNavigation` sit `safeArea.bottom` (34px) above the screen edge. Anchor the bar flush to `bottom: 0` and let the component supply the inset. | Matches iOS / Instagram; avoids clipping. | **Enforced** — `safeArea.bottom` token + component default. Convention when hand-placing a new bar. |
| 6 | **Keep a component's shape consistent across its states.** A state change must not alter geometry the user reads as "the same element" — e.g. the expanded `CheckoutBar` keeps the collapsed bar's bottom-corner curvature. | Avoids jarring transitions. | Convention (candidate: visual-regression test). |
| 7 | **In-card action CTAs use `Button size="xs"`** (~22px), never `sm`/`md`. | Big in-card buttons read as wrong. | Convention. |
| 8 | **Two selection treatments:** *chips/segments* → solid brand fill + `onBrand` text; *cards & `TabGroup`* → `#00C3FF` outline + `background.selected` light-blue fill. | One selected-state language. | Convention. |
| 9 | **Mobile-first.** Stories render in a 375px phone frame by default; full screens opt out with `layout: 'fullscreen'`. Screen demos must **fill the viewport** (absolute inset:0), not a fixed height, so bars reach the real device edge. | Real mobile sizing. | **Enforced** (preview decorator default) + Convention (fill-viewport for screens). |
| 10 | **Don't dress static info as interactive.** Solid-brand fills, button/pill shapes and "selected" styling are reserved for live, tappable choices. Informative values (a chosen plan, a summary field) are plain text — optionally a small icon or muted `Badge` — never a CTA-sized pill. | Affordance must match behaviour; avoids fake buttons. | Convention. |
| 11 | **Self-check every build:** corner radius, spacing, and font-size accuracy/consistency — before handing off, not after the user flags it. | Quality bar. | Convention (process). |
| 12 | **A page's top inset depends on its first item.** If the first item is a **card**, its top gap equals the page's left/right padding (`space.md`) so the inset reads even on all sides. If the first item is **text** (a heading/label), give it more room (`space.lg`) under the rounded card top. | Even framing for cards; breathing room for text. | Convention (`PageShell contentInsetTop`). |
| 13 | **Equal-size rows/items — HARD RULE.** Repeated rows in a table, list, or any "kinda design" with stacked items must all be the **same height** (fixed/`minHeight` + vertically-centred content), regardless of how much each one's text wraps. Never let one row be taller than its neighbours. | Rhythm; the user enforces this strictly. | Convention (set a shared row height). |
| 14 | **Reference/informational content stays neutral — don't colour to nudge.** A policy, fee schedule, or any read-only reference is plain neutral text — no green/amber/red severity coding that could read as steering a choice (e.g. a cancellation-fee table must not look like it's encouraging cancellation). Reserve tone colours for genuine status/feedback. Keep disclaimers/containers low-emphasis (`background.tertiary`), not loud tints. | Don't editorialise neutral info. | Convention. |
| 15 | **Consistent scroll — IMPORTANT RULE.** Every screen scrolls the same way: the **inner content area owns the scroll**, the page frame never rubber-bands. A screen whose content fits must stay put — not bounce the whole page — exactly like one whose content overflows and scrolls. Lock the document against the iOS overscroll bounce (`overscroll-behavior: none` on `html, body`, in `preview-head.html`); pinned screens scroll inside `PageShell`'s content `ScrollView`, never the body. | Pages felt different (short ones bounced the frame, long ones scrolled); the user flagged this as important. | **Enforced** — `overscroll-behavior: none` globally. |
| 16 | **Promote reusable atoms as you build — don't leave them inline.** When you compose a screen, any piece that's reusable (a chip, picker, card, section, callout) becomes a real `@justlife/ui` component (folder + `stories`/`docs`/`tests` + exported) **as part of that work**, not a local `function` in the screen. Screen-specific compositions (step bodies, sheet contents) stay inline — but say so explicitly. Don't ship a screen with reusable building blocks trapped inside it. | The DS is the source of truth; inline atoms are invisible, untested, and get duplicated. The user flagged the funnel's chips/pickers/cards being trapped in the screen while Profile's were promoted. | Convention (process). |
| 17 | **Spacing between items is always a `space.*` token via `gap` — never leftover space.** Don't use `justify="space-between"` to *create* gaps (those are leftover space, vary by screen width, aren't a token). To spread items across the width evenly, give them `flex: 1` and a token `gap`. | Every gap must be a real token (extends #4); the user flagged a weekday row whose inter-chip gaps weren't ours. | Convention (candidate: lint `space-between` used for spacing). |
| 18 | **Verify before you assert — read the code / rendered value, don't claim from memory.** Before stating a fact (a contrast ratio, which step something is on, "X is missing/broken/already there"), check it in the source or the running build. Flag judgment calls as conventions. | Wrong claims erode trust; in one pass I mis-stated a step number and an avatar-contrast "failure" that actually passed. | Convention (process). |
| 19 | **Text scales up, never down — a floor at the token size.** `Text` honours the OS Text-Size (Dynamic Type) setting **upward** (a user who needs bigger text gets it) but never renders **smaller** than its base token: scaling is off when the user's `fontScale` < 1, on at ≥ 1. Min-size is consistent on every phone; growth is the user's choice (uncapped — add `maxFontSizeMultiplier` only if a specific layout needs a ceiling). | A phone on a small Text-Size setting made the app look shrunken; a hard lock would hurt accessibility. | **Enforced** — default on the `Text` primitive (`allowFontScaling={fontScale >= 1}` via `useWindowDimensions`). |
| 20 | **Type-scale parity — font sizes are all odd (the user dislikes mixing odd & even).** The active text scale is **23 · 19 · 15 · 13 · 11 · 9** — every role is odd (moved off the even 24/20/16/14 → 23/19/15/13). **Never introduce an even text size.** | The user's stated preference — "if some fonts are odd and some even, I don't feel good." | **Enforced** — baked into the `font-size` scale → `typography` tokens (all active roles odd). |
| 21 | **All selectable chips share one *main-label* treatment.** Every `Selectable`-based chip — `PillGroup`, `TimeSlotPicker`, `NumberSelector`, `WeekdayPicker`, `DatePicker` — renders its **main label** identically: `labelBase` (13px semibold), `text.onBrand` when selected / `text.primary` when not. **Exception — captions:** a chip may add a small label *above* its main one (e.g. `DatePicker`'s weekday over the date number) — that's an intentional **`bodyMicro` (9px) / `text.secondary`** caption, deliberately smaller + muted. Keep the *main* label uniform across pickers; don't let it drift. | They're the same component (the user flagged a weekday chip drifted small/muted) — but the date's weekday is a caption the user wants smaller. | Convention (candidate: a shared chip-label helper). |

| 22 | **Lean light & airy — don't over-container.** Improve a screen through type **hierarchy, spacing, and selective accent** — *not* by wrapping simple form sections in white cards/boxes or padding them out with decorative strips. Reserve cards for genuine **content units** (product / plan / selectable cards — add-ons, frequency plans), never as containers for plain form fields (hours, pickers, yes-no). Empty space is fine; restraint over density. Don't add reassurance/trust elements that weren't asked for. | The user rejected a carded form step as "too boxy/heavy" and a trust strip as gimmicky; the brand reads clean and airy. | Convention. |

| 23 | **Emphasis scales to its surface — weight first, size only when standalone.** To emphasise a value (a total, a key figure), change **weight/colour**; step its **size** up *only* in a **standalone** surface (a titled card). Inside a **compact / `embedded`** surface (e.g. the `CheckoutBar` panel) keep the row's size and emphasise by **weight** alone — don't enlarge text in a tight space. | The user accepted the standalone checkout total going 11→13 semibold, but wanted the bottom-bar's embedded total back at 11, semibold only. | **Enforced** for `PriceDetails` (total `labelBase` standalone / `labelXSmall` embedded); Convention elsewhere. |

| 24 | **A reassurance / secondary block should recede — pale, tone-on-tone, single flat tones.** Style a "promise" / benefits block (e.g. "justlife Promise") to sit quietly *in* the paper: **no brand colour, no card / background, no emphasis**. Flat single tones in soft greys, paleness stepping **down** (point titles → heading → a faded seal icon). The seal is the faintest mark — the palest icon token + an `opacity` step. | The user wanted it "softer… 1 tone… softer than the heading," pressed into the paper; an earlier brand-glow "aurora card" was rejected. | Convention (Enforced in `PromiseList`). |
| 25 | **"Redesign" means recompose, not redecorate.** When the user asks to *redesign* something, change the **composition / layout** — don't just wrap the same arrangement in a background, card, or colour. Offer genuinely different structures and let them choose. | The user pushed back that adding a glow panel behind the same list wasn't a redesign. | Convention (process). |

When you add or change a component, also follow the **full state matrix** (default · hover[web] ·
pressed · focused · disabled · loading · error/success), a11y props, and the colocated
`*.tsx` / `index.ts` / `*.stories.tsx` / `*.docs.mdx` / `*.test.tsx` layout. Export from
`packages/ui/src/index.ts`.

---

## Surface elevation

**`#FFF` (white) = raised; `#FBFAF7` = recessed.** That single rule drives every background:

| Level | Token | Light | Used for |
|---|---|---|---|
| Canvas (page base) | `background.canvas` | `#FBFAF7` | the screen / `PageShell` surface |
| Raised (cards on the page) | `background.surface` | `#FFFFFF` | cards, panels sitting on the canvas |
| Overlay (modals) | `background.surface-raised` | `#FFFFFF` | `BottomSheet` and other modal surfaces |
| Recessed (nested fills) | `background.secondary` | `#FBFAF7` | fills **inside** a white surface — cards inside a sheet, the close-circle, `NoteChip`, input fields |

So a card is **white on the canvas**, but **`#FBFAF7` when nested inside a white surface** (e.g. the same `PaymentMethodCard` is white on the checkout page, recessed inside the change-payment sheet — via its `recessed` prop). Don't hardcode page white; use `background.canvas` for screens so a screen can still opt into a white base later if a design calls for it. (Inverted 2026-06-19 from the old white-page model.)

---

## Enforcing rules in code (the ladder)

Conventions are not meant to stay conventions forever — graduate them down this ladder as we go:

1. **Tokens / component defaults** — strongest; the rule is just *true* and can't be forgotten
   (e.g. `safeArea.bottom`, the default radius/spacing).
2. **Custom ESLint rules** — `tools/eslint-plugin-justlife/index.js` (wired in `eslint.config.mjs`).
   `no-raw-values` lives here; new rules (e.g. "a floating bottom bar must use `safeArea`",
   "no numeric spacing literal outside the scale") are added the same way and gated in CI.
3. **Tests** — unit + a11y today (Vitest + RNTL + jest-axe). Visual-regression (Chromatic /
   Storybook test-runner) is the path for shape/spacing drift like rule #6.
4. **CI gates** — `typecheck · lint · test · build` block merges that violate the above.

So: **yes, any convention here can become code-enforced.** When you implement a rule structurally,
move its row to `Enforced` and note the mechanism.

---

## Before you finish

Run the verification recipe (see `docs/contributing.md` / `HANDOFF.md`): `pnpm --filter @justlife/ui
typecheck`, `pnpm lint`, `pnpm --filter @justlife/ui test`, and verify visually in Storybook. Report
results honestly — if something's a convention you applied by judgment, say so.
