# Blog (Jekyll)

Portal artikel pribadi berbasis Jekyll, live di **https://zidan-herlangga.github.io/blog/**.

## Struktur
- `_config.yml` — konfigurasi situs (`url` + `baseurl: /blog`)
- `_layouts/` — template (`default.html`, `post.html`)
- `_includes/sidebar.html` — sidebar kanan (kategori, tulisan terbaru, arsip, tautan)
- `_posts/` — artikel (format `YYYY-MM-DD-judul.md`)
- `assets/css/style.css` — stylesheet (palet steel blue, sama dengan situs utama)
- `index.md` — beranda
- `about.md` — halaman Tentang
- `kategori.html` — halaman semua kategori (`/blog/kategori/`)
- `arsip.html` — halaman arsip per tahun (`/blog/arsip/`)

## Sidebar
Sidebar kanan otomatis terisi dari data Jekyll:
- **Kategori** diambil dari `categories` di front matter tiap artikel
- **Tulisan terbaru** = 5 artikel terakhir
- **Arsip** dikelompokkan per tahun
- **Tautan** statis (situs utama, GitHub, RSS, email)

Di layar < 900px sidebar turun ke bawah konten (2 kolom), lalu 1 kolom di ponsel.

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
- Halaman `kategori.html` & `arsip.html` sengaja berekstensi **.html**, bukan `.md`,
  karena kramdown meng-*escape* blok HTML mentah di dalam Markdown.
- Nama repo harus `blog` agar URL akhirnya `https://zidan-herlangga.github.io/blog/`.
- Tema gelap default, bisa diganti ke terang lewat tombol di header
  (`localStorage` key `theme`).
