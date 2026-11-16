# Blog (Jekyll)

Portal artikel pribadi berbasis Jekyll, live di **https://zidan-herlangga.github.io/blog/**.

## Struktur
- `_config.yml` — konfigurasi situs (`url` + `baseurl: /blog`)
- `_layouts/` — template (`default.html`, `post.html`)
- `_posts/` — artikel (format `YYYY-MM-DD-judul.md`)
- `assets/css/style.css` — stylesheet (palet steel blue, sama dengan situs utama)
- `index.md` — beranda
- `about.md` — halaman Tentang

## Menambah artikel
Buat file di `_posts/` dengan nama `YYYY-MM-DD-judul.md`:

```markdown
---
layout: post
title: "Judul Artikel"
description: "Ringkasan singkat untuk daftar & SEO."
date: 2026-01-02
categories: [web]
---
Isi artikel...
```

Commit & push ke `main` — GitHub Pages akan build otomatis.

## Deploy
Repo: `zidan-herlangga/blog` → Settings → Pages → Source: `Deploy from a branch`, branch `main`, folder `/ (root)`.

## Catatan penting
- Situs ini adalah **project page**, jadi semua aset & tautan dirender memakai
  `relative_url` agar otomatis berawalan `/blog/`. Jangan ganti `baseurl`.
- Nama repo harus `blog` agar URL akhirnya `https://zidan-herlangga.github.io/blog/`.
- Tema gelap default, bisa diganti ke terang lewat tombol di header
  (`localStorage` key `theme`).
