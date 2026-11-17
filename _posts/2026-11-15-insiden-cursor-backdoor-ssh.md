---
layout: post
title: "Insiden Cursor: Kunci API Bocor hingga Backdoor SSH di 5.000 Developer"
description: "Kunci API Fireworks AI yang bocor membuka jalan bagi ekstensi Claude Code palsu di Cursor. Hingga 5.000 developer terpapar backdoor SSH."
date: 2026-11-15 09:30:00 +0700
categories: [keamanan, rantai-pasok]
image: /assets/images/news/cursor-cover.webp
thumb: /assets/images/news/cursor-cover-thumb.webp
image_alt: "Foto monitor yang menampilkan kode sumber di editor"
cover: /assets/images/news/cursor-cover.webp
cover_alt: "Foto monitor yang menampilkan kode sumber di editor"
---

Cursor mengungkap insiden keamanan yang berakhir di tempat yang paling sensitif bagi developer: marketplace ekstensi editor. Bukan karena bug di VS Code atau di ekstensi resmi Anthropic, tetapi karena kredensial yang bocor dan data latih AI yang menyimpan rahasia.

Laporan insiden dirilis Jumat, 13 November 2026. Serangan terhadap marketplace-nya sendiri terjadi pada 29 Oktober 2026 dan berlangsung sekitar 11 jam sebelum ekstensi berbahaya dicabut.

## Apa yang sebenarnya terjadi

Urutannya kurang lebih seperti ini:

1. Penyerang mendapatkan kunci akses yang tersimpan di **Fireworks AI**, penyedia pihak ketiga yang dipakai Cursor untuk training dan inference model.
2. Kunci itu dipakai membaca bucket penyimpanan *read-only* yang berisi **trace historis coding agent**, kebanyakan dari 2025. Trace ini berasal dari pengguna yang tidak mengaktifkan Privacy Mode.
3. Sebagian trace masih menyimpan **kredensial API mentah** – bukan hanya potongan kode.
4. Kredensial tersebut membuka akses ke beberapa sistem internal dan tool SaaS Cursor.
5. Dari situ penyerang memperoleh kredensial yang bisa **mempublikasikan ekstensi ke marketplace** Cursor.
6. Pada 29 Oktober, mereka mengunggah salinan palsu ekstensi Claude Code versi **2.1.312** dan **2.1.313** ke cache marketplace yang melayani pengguna VS Code.

Ekstensi palsu itu menjalankan JavaScript berbahaya yang mengumpulkan informasi sistem, menanam **SSH key milik penyerang**, mencoba mengaktifkan SSH, lalu memasang mekanisme persistence agar akses bisa dipertahankan.

{% include figure.html src="/assets/images/news/diagram-cursor.png" width="1200" height="780" alt="Diagram lima tahap rantai serangan Cursor" caption="Rantai serangan: kunci pihak ketiga → trace AI → kredensial internal → marketplace → backdoor SSH." %}

## Seberapa besar dampaknya

Cursor menyebut angka yang relatif kecil, tetapi tetap besar dalam hitungan orang:

- Kurang dari **0,05% pengguna** memiliki trace coding agent yang terekspos.
- Kurang dari **0,01% pelanggan** mengalami kebocoran kredensial API.
- Hingga **5.000 pengguna** yang meminta versi ekstensi terdampak selama jendela paparan berpotensi menerima build berbahaya.

Data yang diambil dari tool SaaS mencakup arsip repositori source non-produksi, informasi kontak bisnis, percakapan dukungan pelanggan, metrik penggunaan produk, ringkasan percakapan coding agent, dan kredensial yang pernah dikirim pelanggan ke tim support.

Yang **tidak** terdampak menurut Cursor: ekstensi resmi Anthropic, Open VSX, infrastruktur produksi, rilis aplikasi resmi, repositori kode pelanggan, serta kode dan prompt milik pengguna dengan Privacy Mode aktif.

Satu hal yang sedikit melegakan: peneliti menemukan kesalahan koding pada malware tersebut, sehingga backdoor kemungkinan gagal berjalan di banyak sistem Windows dan macOS yang SSH-nya belum aktif. Tetapi mengandalkan bug milik penyerang bukan strategi pertahanan.

Sebagai respons, Cursor memindahkan seluruh traffic inference dari Fireworks, mencabut dan merotasi kredensial, membangun ulang marketplace ekstensi, serta men-deploy ulang infrastruktur produksi.

## Kenapa kasus ini penting

**Pertama, marketplace ekstensi adalah rantai pasok.** Developer terbiasa melakukan `npm audit` untuk dependensi, tetapi jarang mempertanyakan ekstensi editor yang berjalan dengan hak penuh di mesin lokal. Satu kredensial publikasi yang bocor bisa menjangkau ribuan laptop dalam hitungan jam.

**Kedua, data latih AI bukan data biasa.** Prompt, trace, dan log agen sering berisi token, connection string, dan kunci API yang tidak sengaja ditempel. Kalau data itu disimpan untuk training, kredensial di dalamnya harus dianggap sebagai secret yang bocor sejak awal.

**Ketiga, ini bukan insiden tunggal.** BleepingComputer menyebut gelombang serangan terhadap platform developer AI sebagai "Black October". Railway, Northflank, Lightning AI, OpenCode, dan Warp ikut terdampak. Di Railway, kredensial curian dipakai untuk menghasilkan tagihan inference sekitar **USD 740.000**, dan sebagian insiden juga dikaitkan dengan upaya *model distillation*.

Pola yang sama berulang: kredensial pihak ketiga → akses ke sistem internal → dampak ke pengguna. Serangan berbasis otomasi seperti yang dibahas di [artikel ARTEX]({{ '/2026/11/16/artex-serangan-ai-tiga-jam/' | relative_url }}) membuat rantai seperti ini makin cepat dieksekusi.

## Yang perlu kamu lakukan sekarang

Kalau kamu memakai Cursor atau ekstensi Claude Code:

- Cek apakah kamu pernah memakai versi **2.1.312** atau **2.1.313** pada 29 Oktober 2026.
- Periksa `~/.ssh/authorized_keys` (Windows: `%USERPROFILE%\.ssh\authorized_keys`) dan hapus key yang tidak kamu kenali.
- Rotasi kredensial yang pernah kamu simpan di folder proyek, file `.env`, atau yang pernah kamu kirim ke tim support.
- Cari koneksi SSH keluar yang tidak wajar dan proses yang mencoba mengaktifkan layanan SSH.
- Aktifkan Privacy Mode untuk data kode dan prompt.

Untuk tim engineering, ini checklist yang lebih tahan lama:

1. **Pisahkan secret dari data observability.** Jangan pernah mengirim `.env` atau token ke prompt, log, maupun trace AI.
2. **Gunakan token berumur pendek dan berlingkup sempit.** Satu kunci yang bisa membaca seluruh bucket adalah masalah arsitektur, bukan sekadar kelalaian.
3. **Perlakukan marketplace sebagai dependensi.** Pin versi, tinjau publisher, dan blokir instalasi otomatis untuk ekstensi baru di lingkungan kerja.
4. **Batasi egress.** Backdoor SSH butuh koneksi keluar. Aturan egress yang ketat memutus banyak rantai serangan di tengah jalan.
5. **Siapkan playbook rotasi.** Saat kunci bocor, yang menentukan adalah berapa menit, bukan berapa halaman dokumen.

## Pertanyaan yang sering diajukan

**Apakah ekstensi resmi Anthropic ikut terdampak?**
Tidak. Penyerang mempublikasikan *salinan palsu* di cache marketplace Cursor. Ekstensi resmi Anthropic dan Open VSX tidak terdampak.

**Berapa banyak developer yang terpapar?**
Hingga 5.000 pengguna yang meminta versi 2.1.312 atau 2.1.313 selama jendela paparan ±11 jam. Kurang dari 0,05% pengguna memiliki trace yang terekspos, dan kurang dari 0,01% pelanggan mengalami kebocoran kredensial API.

**Apa yang harus dilakukan jika sempat memasang ekstensi terdampak?**
Periksa `~/.ssh/authorized_keys`, rotasi semua kredensial yang pernah disimpan di proyek, cari koneksi SSH keluar yang tidak wajar, dan ikuti panduan remediasi Cursor.

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Apakah ekstensi resmi Anthropic ikut terdampak?",
      "acceptedAnswer": { "@type": "Answer", "text": "Tidak. Penyerang mempublikasikan salinan palsu di cache marketplace Cursor. Ekstensi resmi Anthropic dan Open VSX tidak terdampak." }
    },
    {
      "@type": "Question",
      "name": "Berapa banyak developer yang terpapar?",
      "acceptedAnswer": { "@type": "Answer", "text": "Hingga 5.000 pengguna yang meminta versi 2.1.312 atau 2.1.313 selama jendela paparan sekitar 11 jam." }
    },
    {
      "@type": "Question",
      "name": "Apa yang harus dilakukan jika sempat memasang ekstensi terdampak?",
      "acceptedAnswer": { "@type": "Answer", "text": "Periksa authorized_keys, rotasi semua kredensial yang pernah disimpan di proyek, cari koneksi SSH keluar yang tidak wajar, dan ikuti panduan remediasi Cursor." }
    }
  ]
}
</script>

## Sumber

- [Cursor confirms security breach led to malicious Claude Code extension – BleepingComputer](https://www.bleepingcomputer.com/news/security/cursor-confirms-security-breach-led-to-malicious-claude-code-extension/)
- [Stolen Fireworks AI key led to Cursor extension incident – The Hacker News](https://thehackernews.com/2026/11/stolen-fireworks-ai-key-led-to-cursor.html)
- [Code on computer monitor (Unsplash), CC0 – Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Code_on_computer_monitor_(Unsplash).jpg)

*Artikel ini ringkasan dan analisis pribadi. Detail resmi ada di laporan insiden Cursor dan pemberitaan di atas.*
