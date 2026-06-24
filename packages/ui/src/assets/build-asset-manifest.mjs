// Generate assets.manifest.json from the repo's root asset folders.
//
// The manifest maps a stable, clean id ("professional/cleaning-female-01") to the real
// on-disk path ("Photos (export PNG)/professional-cleaning-female-01.png"). Components
// reference ids only; the resolver (assets.ts) turns an id into a usable URL and handles
// the spaces/parentheses in folder names.
//
// Input modes:
//   node build-asset-manifest.mjs                 # scan ASSET_FOLDERS under the repo root
//   node build-asset-manifest.mjs --root <dir>    # scan under a specific root
//   node build-asset-manifest.mjs --tree <json>   # derive from a GitHub `git/trees` json
//                                                  # (used while the asset folders live only
//                                                  #  in the remote repo)
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, 'assets.manifest.json');

// The six root asset folders (names are faithful to disk — spaces + parens included).
const FOLDERS = {
  'icon': '2D Icons (export SVG)',
  'icon3d': '3D Icons (export PNG)',
  'photo': 'Photos (export PNG)', // photos split into sub-kinds by filename
  'payment': 'Payment Cards (export SVG)',
  'flag': 'Flags (export SVG)',
  'shape': 'Shapes (export SVG)',
  'logo': 'Logo',
};

const BASE_URL = 'https://raw.githubusercontent.com/georgewassfy-del/justlife-design-system/main/';

const pad2 = (n) => String(n).padStart(2, '0');
const stemOf = (file) => file.replace(/\.[^.]+$/, '');
const extOf = (file) => (file.match(/\.([^.]+)$/)?.[1] || '').toLowerCase();

/** Derive { id, kind, category? } for a file in a given folder. */
function classify(folderKey, file) {
  const stem = stemOf(file);
  switch (folderKey) {
    case 'icon':
      return { id: `icon/${stem}`, kind: 'icon' };
    case 'icon3d':
      return { id: `icon3d/${stem}`, kind: 'icon3d' };
    case 'flag':
      return { id: `flag/${stem}`, kind: 'flag' };
    case 'shape':
      return { id: `shape/${stem}`, kind: 'shape' };
    case 'logo':
      // Logo filenames are `style=full.svg` / `style=mark.svg` / `style=wordmark.svg` → logo/<variant>.
      return { id: `logo/${stem.replace(/^style=/, '')}`, kind: 'logo' };
    case 'payment': {
      // tamara-logo-en -> tamara ; apple-pay / google-pay / master / visa / tabby / amex / careem unchanged
      const slug = stem.replace(/-logo(-[a-z]{2})?$/, '');
      return { id: `payment/${slug}`, kind: 'payment' };
    }
    case 'photo':
      return classifyPhoto(stem);
    default:
      return null;
  }
}

function classifyPhoto(stem) {
  // Thank-You professional-card images — composed cards used on the Thank-You screen.
  if (/^thank-you-professional-card-\d+$/.test(stem)) {
    const m = stem.match(/-(\d+)$/);
    return { id: `thank-you-card/${pad2(m[1])}`, kind: 'thank-you-card' };
  }
  // Generic avatars + state demos
  if (stem === 'avatar-active') return { id: 'avatar/active', kind: 'avatar' };
  if (stem === 'avatar-disabled') return { id: 'avatar/disabled', kind: 'avatar' };
  if (/^Avatar(-\d+)?$/.test(stem)) {
    const m = stem.match(/-(\d+)$/);
    return { id: m ? `avatar/${pad2(m[1])}` : 'avatar/default', kind: 'avatar' };
  }
  // Composed professional-card mockups (reference)
  if (/^professional-card(-\d+)?$/.test(stem)) {
    const m = stem.match(/-(\d+)$/);
    return { id: `professional-card/${pad2(m ? m[1] : 1)}`, kind: 'professional-card' };
  }
  // Real professional cutout photos
  if (stem.startsWith('professional-')) {
    const slug = stem.replace(/^professional-/, '');
    const category = slug.split('-')[0]; // cleaning | doctor | handyman | nurse | salon
    return { id: `professional/${slug}`, kind: 'professional', category };
  }
  // Service card imagery
  if (/^Service Image(-\d+)?$/.test(stem)) {
    const m = stem.match(/-(\d+)$/);
    return { id: m ? `service/service-image-${pad2(m[1])}` : 'service/service-image', kind: 'service' };
  }
  // Promo / campaign banners — keep the vertical/service, drop locale + offer codes
  let s = stem.split('-en')[0].replace(/^common-sv-/, '');
  return { id: `banner/${s}`, kind: 'banner' };
}

// ---- gather the file list (tree mode or folder scan) ----
const args = process.argv.slice(2);
const treeIdx = args.indexOf('--tree');
const rootIdx = args.indexOf('--root');

/** -> [{ folderKey, file }] */
function gatherFromTree(treePath) {
  const tree = JSON.parse(readFileSync(treePath, 'utf8'));
  const blobs = (tree.tree || []).filter((t) => t.type === 'blob').map((t) => t.path);
  const out = [];
  for (const [folderKey, folder] of Object.entries(FOLDERS)) {
    const prefix = folder + '/';
    for (const p of blobs) {
      if (p.startsWith(prefix)) out.push({ folderKey, file: p.slice(prefix.length) });
    }
  }
  return out;
}

function gatherFromFolders(root) {
  const out = [];
  for (const [folderKey, folder] of Object.entries(FOLDERS)) {
    const dir = join(root, folder);
    if (!existsSync(dir)) {
      console.warn(`[assets] folder not found, skipping: ${folder}`);
      continue;
    }
    for (const file of readdirSync(dir)) {
      if (file.startsWith('.')) continue;
      out.push({ folderKey, file });
    }
  }
  return out;
}

let files;
if (treeIdx !== -1) {
  files = gatherFromTree(resolve(args[treeIdx + 1]));
} else {
  const root = rootIdx !== -1 ? resolve(args[rootIdx + 1]) : resolve(__dirname, '../../../..');
  files = gatherFromFolders(root);
}

// ---- build manifest ----
const assets = {};
const dups = [];
const kindCount = {};
for (const { folderKey, file } of files) {
  const c = classify(folderKey, file);
  if (!c) continue;
  if (assets[c.id]) dups.push(c.id);
  const entry = { path: `${FOLDERS[folderKey]}/${file}`, kind: c.kind, format: extOf(file) };
  if (c.category) entry.category = c.category;
  assets[c.id] = entry;
  kindCount[c.kind] = (kindCount[c.kind] || 0) + 1;
}

if (dups.length) {
  console.error(`[assets] DUPLICATE ids: ${[...new Set(dups)].join(', ')}`);
  process.exit(1);
}

const sortedIds = Object.keys(assets).sort();
const sortedAssets = {};
for (const id of sortedIds) sortedAssets[id] = assets[id];

const manifest = {
  $schema: 'justlife-ds-assets/v1',
  version: '0.1.0',
  source: 'georgewassfy-del/justlife-design-system @ main — root asset folders',
  baseUrl: BASE_URL,
  kinds: Object.keys(kindCount).sort(),
  count: sortedIds.length,
  countByKind: Object.fromEntries(Object.entries(kindCount).sort()),
  assets: sortedAssets,
};

writeFileSync(OUT, JSON.stringify(manifest, null, 2) + '\n');
console.log(`[assets] wrote ${sortedIds.length} assets across ${Object.keys(kindCount).length} kinds -> ${OUT}`);
console.log('[assets] by kind:', JSON.stringify(manifest.countByKind));
