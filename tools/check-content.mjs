#!/usr/bin/env node
import { readFileSync, readdirSync, existsSync, statSync, readdirSync as rd } from 'node:fs';
import { join, dirname, basename, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..'); // blog root
const blog = root;
const errors = [];
const warnings = [];
const rel = (p) => relative(root, p).replace(/\\/g, '/');

function fail(msg) { errors.push(msg); }
function warn(msg) { warnings.push(msg); }

function readUtf8(file) {
  const raw = readFileSync(file, 'utf8');
  if (raw.charCodeAt(0) === 0xFEFF) fail(`${rel(file)}: BOM di awal berkas`);
  if (raw.includes('\uFFFD')) fail(`${rel(file)}: karakter rusak (U+FFFD)`);
  if (raw.includes('\u2014')) fail(`${rel(file)}: mengandung em dash (—), ganti dengan en dash (–)`);
  return raw;
}

function parseFrontMatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fm = {};
  if (!m) return fm;
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([a-zA-Z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    fm[kv[1]] = v;
  }
  return fm;
}

function parseCategories(v) {
  if (!v) return [];
  const s = String(v).trim();
  if (s.startsWith('[') && s.endsWith(']')) {
    return s.slice(1, -1).split(',').map((x) => x.trim()).filter(Boolean);
  }
  return [s];
}

// 1. posts
const postsDir = join(blog, '_posts');
const postFiles = existsSync(postsDir) ? readdirSync(postsDir).filter((f) => f.endsWith('.md')) : [];
const titles = new Map();
const postRoutes = new Set();
for (const f of postFiles) {
  const file = join(postsDir, f);
  const raw = readUtf8(file);
  const fm = parseFrontMatter(raw);
  const m = f.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)\.md$/);
  if (m) postRoutes.add(`/${m[1]}/${m[2]}/${m[3]}/${m[4]}/`);
  for (const req of ['title', 'description', 'date', 'categories']) {
    if (!fm[req]) fail(`${rel(file)}: front matter wajib "${req}" kosong`);
  }
  if (fm.title && titles.has(fm.title)) fail(`${rel(file)}: judul duplikat dengan ${titles.get(fm.title)}`);
  else if (fm.title) titles.set(fm.title, rel(file));
  const cats = parseCategories(fm.categories);
  if (cats.length === 0) fail(`${rel(file)}: categories kosong`);
  for (const key of ['cover', 'thumb', 'image']) {
    if (fm[key]) {
      const asset = join(blog, fm[key].replace(/^\//, ''));
      if (!existsSync(asset)) fail(`${rel(file)}: berkas ${fm[key]} tidak ditemukan`);
    }
  }
  if (fm.cover && fm.cover.endsWith('.webp')) {
    const base = fm.cover.replace(/\.webp$/, '');
    for (const suf of ['-800.webp', '-thumb.webp']) {
      const p = join(blog, (base + suf).replace(/^\//, ''));
      if (!existsSync(p)) fail(`${rel(file)}: varian ${base + suf} tidak ditemukan (konvensi cover)`);
    }
  }
  if (fm.categories && !fm.image_alt && !fm.cover_alt) warn(`${rel(file)}: image_alt/cover_alt kosong`);
}

// 2. category pages exist for every category used
const usedCats = new Set();
for (const f of postFiles) {
  const fm = parseFrontMatter(readFileSync(join(postsDir, f), 'utf8'));
  parseCategories(fm.categories).forEach((c) => usedCats.add(c));
}
for (const c of usedCats) {
  const p = join(blog, 'kategori', c, 'index.html');
  if (!existsSync(p)) fail(`kategori/${c}: halaman hub kategori tidak ditemukan (kategori/${c}/index.html)`);
}

// 3. all blog files for em dash / BOM / encoding (md, html, css, yml)
const scanRoots = [blog];
const skipDirs = new Set(['assets', 'node_modules', 'vendor', '.git', 'tools']);
function walk(dir, cb) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (skipDirs.has(e.name) || e.name.startsWith('.')) continue;
      walk(join(dir, e.name), cb);
    } else if (/\.(md|html|css|yml|yaml|json|js|mjs)$/.test(e.name)) {
      cb(join(dir, e.name));
    }
  }
}
for (const r of scanRoots) walk(r, (file) => readUtf8(file));

// 4. CSS freshness
const srcCss = join(blog, '_includes', 'style.css');
const outCss = join(blog, 'assets', 'css', 'style.css');
if (existsSync(srcCss) && existsSync(outCss)) {
  if (statSync(outCss).mtimeMs < statSync(srcCss).mtimeMs) {
    fail('assets/css/style.css lebih lama dari _includes/style.css – jalankan node tools/build-css.mjs');
  }
  const built = readFileSync(outCss, 'utf8');
  if (built.includes('{{') || built.includes('relative_url')) fail('assets/css/style.css masih berisi Liquid ({{ / relative_url })');
  if (built.trim().startsWith('---')) fail('assets/css/style.css punya front matter (akan ditimpa tema GitHub)');
}

// 5. internal link scan in posts/pages (literal href/src starting with / or /blog/)
const validRoutes = new Set([...postRoutes, '/kategori/', '/cari/', '/arsip/', '/about/', '/kontak/', '/privasi/', '/404.html', '/feed.xml', '/sitemap.xml', '/search.json', '/robots.txt', '/assets/']);
// add category pages
for (const c of usedCats) validRoutes.add(`/kategori/${c}/`);
// add asset files
function walkAssets(dir, base) {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) walkAssets(join(dir, e.name), base);
    else validRoutes.add('/assets/' + relative(base, join(dir, e.name)).replace(/\\/g, '/'));
  }
}
walkAssets(join(blog, 'assets'), join(blog, 'assets'));
const linkRe = /(?:href|src)\s*=\s*["'](\/[^"']*)["']/g;
const filesToScan = [];
walk(blog, (f) => { if (/\.(md|html)$/.test(f)) filesToScan.push(f); });
for (const file of filesToScan) {
  const raw = readFileSync(file, 'utf8');
  let m;
  while ((m = linkRe.exec(raw)) !== null) {
    let url = m[1].split('?')[0].split('#')[0];
    if (url.startsWith('/blog/')) url = url.slice(5) || '/';
    if (url.startsWith('http')) continue;
    if (url === '/' ) continue;
    // normalize trailing
    const ok = [...validRoutes].some((r) => url === r || url.startsWith(r) && (r.endsWith('/') ? true : false) || url.startsWith('/assets/'));
    if (!ok && !url.startsWith('/assets/')) {
      // allow partial matches for assets
      if (!url.startsWith('/assets/')) warn(`${rel(file)}: tautan internal tidak terverifikasi: ${m[1]}`);
    }
  }
}

// 6. authors.yml key matches _config.yml author
try {
  const cfg = readFileSync(join(blog, '_config.yml'), 'utf8');
  const am = cfg.match(/^author:\s*"?(.+?)"?\s*$/m);
  const author = am ? am[1].trim() : '';
  const authors = readFileSync(join(blog, '_data', 'authors.yml'), 'utf8');
  if (author && !authors.includes(author + ':')) fail(`_data/authors.yml tidak memuat kunci "${author}" (harus sama dengan author di _config.yml)`);
} catch (e) { warn('gagal memeriksa authors.yml: ' + e.message); }

// report
if (warnings.length) {
  console.log('Peringatan:');
  warnings.forEach((w) => console.log('  - ' + w));
}
if (errors.length) {
  console.log('\nKesalahan (' + errors.length + '):');
  errors.forEach((e) => console.log('  - ' + e));
  process.exit(1);
} else {
  console.log('\nOK: tidak ada kesalahan. ' + (warnings.length ? warnings.length + ' peringatan.' : ''));
}
