# Blog (Jekyll)

Portal artikel pribadi berbasis Jekyll, siap deploy ke GitHub Pages.

## Struktur
- `_config.yml` — konfigurasi situs
- `_layouts/` — template
- `_posts/` — artikel (format `YYYY-MM-DD-judul.md`)
- `assets/css/style.css` — stylesheet
- `about.md` — halaman Tentang

## Deploy ke GitHub Pages
1. Buat repo GitHub baru (mis. `zidanherlangga.github.io` atau `blog`).
2. Copy isi folder `blog/` ke root repo tersebut.
3. Di repo → Settings → Pages → Source: `Deploy from a branch` → branch `main`, folder `/ (root)`.
4. GitHub Pages akan build Jekyll otomatis. URL: `https://<username>.github.io/<repo>/`.

## Menambah artikel
Buat file di `_posts/` dengan nama `YYYY-MM-DD-judul.md`:
```markdown
---
layout: post
title: "Judul Artikel"
date: 2026-01-02
categories: [web]
---
Isi artikel...
```

## Catatan
- Tema gelap mengikuti palet steel blue (#7d9cc0) situs utama.
- Untuk deploy ke Vercel, gunakan GitHub Actions (Jekyll tidak native di Vercel).
