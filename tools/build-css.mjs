// Bangun assets/css/style.css (versi minify) dari _includes/style.css (sumber).
//
// Kenapa dua berkas:
// - `_includes/style.css` adalah sumber yang enak dibaca/di-edit.
// - `assets/css/style.css` dilayani sebagai berkas statis, jadi Liquid TIDAK
//   diproses di sana. Skrip ini mengganti URL font Liquid menjadi path relatif
//   (../fonts/...) dan meminify CSS lewat csso.
//
// Jalankan dari root repo blog setiap kali `_includes/style.css` berubah:
//   node tools/build-css.mjs

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";

const SRC = "_includes/style.css";
const OUT = "assets/css/style.css";
const BANNER =
  "/*! Zidan Herlangga - Blog. Hasil build dari _includes/style.css; " +
  "jangan disunting langsung. Build ulang: node tools/build-css.mjs */\n";

const tmp = path.join(os.tmpdir(), "blog-style.min.css");

execSync(`npx --yes csso-cli@4 "${SRC}" --output "${tmp}"`, {
  stdio: "inherit",
  shell: true,
});

let css = fs.readFileSync(tmp, "utf8");
css = css.replace(
  /url\('\{\{\s*"\/assets\/fonts\/([^"']+)"\s*\|\s*relative_url\s*\}\}'\)/g,
  "url(../fonts/$1)"
);

if (css.includes("relative_url")) {
  throw new Error("Masih ada Liquid di CSS hasil build.");
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, BANNER + css);
console.log(`${OUT}: ${BANNER.length + css.length} byte`);
