# Asset Coverage & Parked Assets

> Status of manifest-driven asset wiring across the DS. Generated from the asset coverage audit.
> Assets resolve through [`assets.manifest.json`](./assets.manifest.json) via the [`assets.ts`](./assets.ts)
> API (`assetUrl` / `assetSource`) — components/screens reference **stable IDs only**, never raw paths
> or URLs. Manifest: **239 assets**, base `https://raw.githubusercontent.com/georgewassfy-del/justlife-design-system/main/`.
>
> Last updated: **2026-06-24**

---

## 1. Assets currently wired through the manifest

| Asset ID                          | Screen · location                              | Purpose                                                             |
| --------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------- |
| `thank-you-card/01`               | `ThankYouScreen.tsx`                           | Assigned-professional composed card (photo + shape + rating + name) |
| `professional/cleaning-female-01` | `HomeCleaningFunnelScreen.tsx` (DateTime step) | "Choose your pro" photo — Rewata                                    |
| `professional/cleaning-female-02` | `HomeCleaningFunnelScreen.tsx` (DateTime step) | "Choose your pro" photo — Jennefer                                  |
| `professional/cleaning-female-03` | `HomeCleaningFunnelScreen.tsx` (DateTime step) | "Choose your pro" photo — Maria                                     |
| `professional/cleaning-male-01`   | `HomeCleaningFunnelScreen.tsx` (DateTime step) | "Choose your pro" photo — Daniel                                    |
| `logo/wordmark`                   | `HomeCleaningFunnelScreen.tsx` (Service step)  | "Powered by justlife" brand wordmark                                |
| `payment/tabby`                   | `HomeCleaningFunnelScreen.tsx` (Checkout step) | Tabby BNPL "interest-free instalments" row                          |
| `add-on/balcony`                  | `HomeCleaningFunnelScreen.tsx` (AddOns step)   | Add-on tile photo — Balcony Cleaning                                |
| `add-on/ironing-folding`          | `HomeCleaningFunnelScreen.tsx` (AddOns step)   | Add-on tile photo — Ironing and Folding                             |
| `add-on/fridge`                   | `HomeCleaningFunnelScreen.tsx` (AddOns step)   | Add-on tile photo — Fridge Cleaning                                 |
| `add-on/wardrobe`                 | `HomeCleaningFunnelScreen.tsx` (AddOns step)   | Add-on tile photo — Wardrobe Cleaning                               |
| `add-on/cupboard`                 | `HomeCleaningFunnelScreen.tsx` (AddOns step)   | Add-on tile photo — Cupboard Cleaning                               |
| `add-on/party-cleaning`           | `HomeCleaningFunnelScreen.tsx` (AddOns step)   | Add-on tile photo — Party Cleaning                                  |

**Wiring pattern:** `assetUrl('id')` for URL-string slots (e.g. module-top-level consts, `photo` props);
`assetSource('id')` for `<Image source>` objects. `assetUrl` is imported from the defining module
`../assets/assets` (not the `../index` barrel) in module-top-level consts to avoid the circular-import
init crash. Components themselves stay **source-agnostic** — they never wire assets directly.

## 2. Screens completed

- `packages/ui/src/screens/HomeCleaningFunnelScreen.tsx` — all production placeholders resolved
  (tabby, 4 professional photos, company wordmark, 6 add-on tiles).
- `packages/ui/src/screens/ThankYouScreen.tsx` — assigned-professional card wired.

All **production-screen** placeholders are now wired. No `MissingLogo`/green placeholders remain in
production screen code.

## 3. Parked production items

**None.** The HomeCleaningFunnel add-on tiles (balcony, ironing/folding, fridge, wardrobe, cupboard,
party cleaning) are now **wired** to `add-on/*` manifest assets (see §1) — the prod CloudFront URLs were
removed. All production-screen imagery now resolves through the manifest.

## 4. Parked story/demo items

| Item                              | File                                                                                                                                                  | Reason                                                                    |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Hero / promo banner               | `WomensSalon.stories.tsx`                                                                                                                             | only generic `banner/*` campaign assets; no salon-specific hero           |
| Service-card images (5 mani-pedi) | `WomensSalon.stories.tsx`                                                                                                                             | `service/*` are generic photos; no nail/salon-specific match              |
| Placeholder demo images           | ~10 component `*.stories.tsx` (`ServiceCard`, `ProductCard`, `BookCard`, `CategoryCard`, `AddOnsCard`, `ReviewCard`, `ServiceTileRow`, `Overview`, …) | demo-only (`PlaceholderImage` → picsum); don't ship; generic-only matches |
| GlassSurface backdrop             | `GlassSurface.stories.tsx`                                                                                                                            | story demo (unsplash)                                                     |

**Reason:** demo-only and/or low-confidence matches.

## 5. Missing assets needed before next wiring

| Needed asset                            | Unblocks                              |
| --------------------------------------- | ------------------------------------- |
| Salon / nail service photos             | `WomensSalon` service cards           |
| Salon hero banner                       | `WomensSalon` hero                    |
| Empty-state illustrations               | empty/no-result states (none in repo) |
| Review media (photos/videos, if needed) | `ReviewCard` real content             |

## 6. Rule

**Do not replace photo tiles with unrelated 3D icons** (`icon3d/*`) unless design explicitly approves.
Photo tiles and 3D illustrations are different visual treatments; substituting one for the other is a
mismatch. Keep low-confidence items **parked** until matching assets are added. Never invent asset IDs —
use only IDs present in `assets.manifest.json`.

---

### Notes

- **Duplicate paths in the manifest:** none (each file maps to exactly one ID).
- **`professional-card/01–04`:** superseded by `thank-you-card/*` for the Thank-You card and no longer
  referenced by any screen, but still valid assets — **keep** unless confirmed unused everywhere.
- **Unwired-but-valid IDs** (avatars, banners, generic services, icons, flags, shapes, the 3 logos):
  a library naturally exceeds what the demo screens consume — these are available, not obsolete.
