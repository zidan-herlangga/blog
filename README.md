# Blog (Jekyll)

Portal artikel pribadi berbasis Jekyll, live di **https://zidan-herlangga.github.io/blog/**.

## Struktur
- `_config.yml` – konfigurasi situs (`url` + `baseurl: /blog`)
- `_layouts/` – template (`default.html`, `post.html`)
- `_includes/sidebar.html` – sidebar kanan (kategori, tulisan terbaru, arsip, tautan)
- `_includes/figure.html` – komponen gambar + caption
- `_includes/comments.html` – kolom komentar (utterances)
- `_includes/breadcrumbs.html` – breadcrumb tampil + JSON-LD BreadcrumbList
- `_posts/` – artikel (format `YYYY-MM-DD-judul.md`)
- `assets/images/` – gambar artikel (termasuk `og-default.png`)
- `assets/images/news/` – cover & diagram untuk seri sorotan keamanan
- `assets/fonts/` – font Inter & Space Grotesk (self-hosted)
- `assets/css/style.css` – stylesheet (palet steel blue, sama dengan situs utama)
- `index.md` – beranda
- `about.html` – halaman Tentang (dengan foto profil)
- `kategori.html` – halaman semua kategori (`/blog/kategori/`)
- `arsip.html` – halaman arsip per tahun (`/blog/arsip/`)

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

Commit & push ke `main` – GitHub Pages akan build otomatis.

## Deploy
Repo: `zidan-herlangga/blog` → Settings → Pages → Source: `Deploy from a branch`, branch `main`, folder `/ (root)`.

## Menambahkan gambar

1. Simpan file gambar di `assets/images/` (jpg, png, webp, atau svg).
2. Sisipkan di artikel dengan salah satu cara:

**Markdown biasa**

```markdown
![Deskripsi gambar]({{ "/assets/images/foto.webp" | relative_url }})
```

**Dengan caption (disarankan)**

```liquid
{% include figure.html src="/assets/images/foto.webp" alt="Deskripsi gambar" caption="Keterangan di bawah gambar." %}
```

> Selalu bungkus path dengan `relative_url` supaya otomatis berawalan `/blog/`.
> Kalau ditulis `/assets/images/...` saja, gambar akan 404.

**Cover & gambar OG (opsional, di front matter)**

```yaml
image: /assets/images/og.png      # dipakai untuk og:image / preview sosmed
image_alt: "Deskripsi gambar"
cover: /assets/images/cover.png   # gambar hero besar di atas artikel
cover_alt: "Deskripsi cover"
```

## Komentar

Komentar memakai **[utterances](https://utteranc.es)** – berbasis GitHub Issues,
tanpa database, tanpa iklan, tanpa pelacakan. Konfigurasinya di `_config.yml`:

```yaml
comments:
  enabled: true
  repo: "zidan-herlangga/blog"
  issue_term: "pathname"   # satu issue per URL artikel
  label: ""                # opsional, mis. "komentar"
  theme_light: "github-light"
  theme_dark: "github-dark"
```

**Aktivasi sekali saja (wajib):**

1. Buka https://github.com/apps/utterances
2. Klik **Install**, pilih **Only select repositories** → `zidan-herlangga/blog`
3. Selesai. Komentar pertama akan otomatis membuat issue baru di repo tersebut

Moderasi: edit/hapus issue di tab **Issues** repo. Untuk menonaktifkan komentar,
set `comments.enabled: false`.

## SEO
Sudah otomatis, tidak perlu diurus per artikel:

- `jekyll-seo-tag` menulis `<title>`, description, canonical, Open Graph,
  Twitter card, dan JSON-LD (`BlogPosting`, `Person`, `WebSite`)
- `jekyll-sitemap` → `https://zidan-herlangga.github.io/blog/sitemap.xml`
- `jekyll-feed` → `https://zidan-herlangga.github.io/blog/feed.xml`
- Breadcrumb (`BreadcrumbList`) + navigasi antar artikel
- Gambar OG default: `assets/images/og-default.png` (dipakai kalau artikel
  tidak punya `image:` di front matter)
- Font di-self-host, tanpa request ke Google Fonts

**Checklist sekali saja (manual):**

1. Buka [Google Search Console](https://search.google.com/search-console)
2. **Add property** → **URL prefix** → `https://zidan-herlangga.github.io/blog/`
3. Verifikasi dengan salah satu cara:
   - **HTML tag**: salin `<meta name="google-site-verification" ...>` ke
     `_layouts/default.html` (di dalam `<head>`), atau
   - **HTML file**: taruh file `googleXXXX.html` dari Google di folder root repo
4. **Sitemaps** → tambahkan `sitemap.xml` → Submit
5. **URL Inspection** → tempel URL artikel → **Request indexing**

Tips konten: satu artikel = satu topik/kata kunci, description 120–155 karakter,
saling tautkan antar artikel, dan posting rutin (minimal 1–2× per bulan).

## Catatan penting
- Situs ini adalah **project page**, jadi semua aset & tautan dirender memakai
  `relative_url` agar otomatis berawalan `/blog/`. Jangan ganti `baseurl`.
- Halaman `kategori.html` & `arsip.html` sengaja berekstensi **.html**, bukan `.md`,
  karena kramdown meng-*escape* blok HTML mentah di dalam Markdown.
- Nama repo harus `blog` agar URL akhirnya `https://zidan-herlangga.github.io/blog/`.
- Tema gelap default, bisa diganti ke terang lewat tombol di header
  (`localStorage` key `theme`).
