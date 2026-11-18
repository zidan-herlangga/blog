---
layout: post
title: "Cara Rotasi Secret di GitHub Actions Tanpa Downtime"
description: "Panduan rotasi secret di GitHub Actions: dari secret repository dan environment sampai OIDC, tanpa mematikan pipeline CI/CD."
date: 2026-11-18 09:00:00 +0700
categories: [keamanan, web]
keywords: [rotasi secret GitHub Actions, GitHub Actions secrets, CI/CD secrets, OIDC GitHub, manajemen kredensial, secret scanning]
image: /assets/images/news/github-secrets-cover.webp
thumb: /assets/images/news/github-secrets-cover-thumb.webp
image_alt: "Tangkapan layar terminal Linux dengan perintah ping, pwd, cd, ls, dan yum"
cover: /assets/images/news/github-secrets-cover.webp
cover_alt: "Tangkapan layar terminal Linux dengan perintah ping, pwd, cd, ls, dan yum"
series: "Sorotan Keamanan November 2026"
---

Rotasi kredensial adalah salah satu tugas yang paling sering ditunda. Alasannya sederhana: kalau salah langkah, pipeline CI/CD berhenti, deployment gagal, dan tim panik. Hasilnya, secret yang seharusnya diganti tiap 90 hari bertahan bertahun-tahun.

Artikel ini membahas cara merotasi secret di **GitHub Actions** dengan aman, termasuk pola yang tidak mematikan pipeline. Sebagian besar rekomendasi di sini merujuk dokumentasi resmi GitHub; sisanya adalah praktik yang umum dipakai tim DevOps.

## Mengapa rotasi sering gagal

Tiga penyebab utama:

1. **Satu secret dipakai di banyak tempat.** Secret `DATABASE_URL` yang sama dipakai di workflow build, deploy, dan migrasi. Menggantinya berarti mengubah semuanya sekaligus.
2. **Tidak ada periode tumpang tindih.** Secret lama langsung dihapus sebelum secret baru terbukti bekerja.
3. **Tidak ada uji.** Rotasi dilakukan langsung di production tanpa dry run.

Solusinya adalah pola **dual secret**: secret lama dan baru hidup berdampingan selama jendela transisi, lalu secret lama dihapus setelah verifikasi.

## Jenis secret di GitHub Actions

Sebelum merotasi, pahami dulu tempat secret disimpan:

- **Repository secret** – tersedia untuk semua workflow di repo.
- **Environment secret** – tersedia hanya untuk job yang menarget environment tertentu (mis. `production`, `staging`), dan bisa dilindungi dengan *required reviewers* atau *wait timer*.
- **Organization secret** – dibagikan ke beberapa repo, dengan kebijakan akses.
- **Dependabot secret** – untuk workflow Dependabot.

Prioritas rotasi: environment secret untuk `production` paling kritis, lalu repository secret, lalu organization secret.

## Pola rotasi tanpa downtime

### 1. Siapkan secret baru dengan nama berbeda

Jangan langsung timpa secret lama. Buat secret baru dengan sufiks versi:

- `DATABASE_URL` (lama)
- `DATABASE_URL_NEW` (baru)

Dengan dua nama, workflow bisa membaca keduanya dan memilih yang tersedia.

### 2. Ubah workflow untuk menerima keduanya

Contoh di workflow:

```yaml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL_NEW || secrets.DATABASE_URL }}
```

GitHub Actions mengevaluasi `||` pada string kosong, jadi kalau `DATABASE_URL_NEW` belum ada, ia jatuh ke `DATABASE_URL`. Ini membuat transisi mulus.

### 3. Deploy dan verifikasi

Jalankan pipeline dengan secret baru. Pastikan:

- Build sukses.
- Migrasi database (jika ada) berhasil.
- Smoke test endpoint production lulus.
- Tidak ada error autentikasi di log.

### 4. Promosikan secret baru

Setelah verifikasi:

1. Salin nilai `DATABASE_URL_NEW` ke `DATABASE_URL`.
2. Hapus `DATABASE_URL_NEW`.
3. Kembalikan workflow ke `secrets.DATABASE_URL` saja.

Jendela tumpang tindih biasanya 24–72 jam, cukup untuk menangkap regresi.

## Rotasi untuk secret yang tidak bisa ditumpuk

Beberapa secret tidak bisa hidup berdampingan, misalnya token API pihak ketiga yang hanya mengizinkan satu sesi aktif. Untuk kasus ini:

1. Buat kredensial baru di sisi provider (token kedua).
2. Simpan sebagai secret baru di GitHub.
3. Tukar workflow ke secret baru.
4. Verifikasi.
5. Cabut kredensial lama di provider.
6. Hapus secret lama dari GitHub.

Kuncinya: **cabut di provider dulu, baru hapus di GitHub**, bukan sebaliknya. Kalau hapus di GitHub dulu lalu gagal deploy, Anda kehilangan jejak.

## Alternatif yang lebih baik: OIDC

Cara paling aman menghindari rotasi adalah **tidak menyimpan secret sama sekali**. GitHub Actions mendukung **OpenID Connect (OIDC)** untuk autentikasi ke cloud provider (AWS, GCP, Azure) dan layanan lain.

Dengan OIDC:

- Workflow meminta token JWT sementara dari GitHub.
- Provider memverifikasi token dan mengeluarkan kredensial jangka pendek.
- Tidak ada secret yang disimpan di repository.

Contoh untuk AWS:

```yaml
permissions:
  id-token: write
  contents: read
steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::123456789012:role/github-actions
      aws-region: ap-southeast-1
```

OIDC menghilangkan masalah rotasi untuk kredensial cloud. Untuk secret lain (token API, kunci database), rotasi tetap diperlukan.

## Checklist sebelum rotasi

- [ ] Inventarisasi semua tempat secret dipakai (workflow, environment, script).
- [ ] Pastikan secret lama dan baru bisa hidup berdampingan, atau siapkan kredensial kedua di provider.
- [ ] Uji di branch non-production terlebih dahulu.
- [ ] Siapkan rollback: simpan nilai lama di tempat aman (password manager) selama jendela transisi.
- [ ] Jadwalkan rotasi saat traffic rendah.
- [ ] Aktifkan **secret scanning** dan **push protection** di repository.

## Secret scanning dan push protection

GitHub menyediakan **secret scanning** yang mendeteksi kredensial yang bocor di kode. **Push protection** memblokir commit yang mengandung secret sebelum masuk ke repository.

Aktifkan di *Settings → Code security and analysis*. Ini bukan pengganti rotasi, tetapi jaring pengaman yang menangkap kebocoran sebelum menjadi insiden.

## Pertanyaan yang sering diajukan

**Apakah secret di GitHub Actions terenkripsi?**
Ya, secret dienkripsi saat disimpan dan disuntikkan sebagai variabel lingkungan pada runtime. Namun, siapa pun dengan akses tulis ke workflow bisa mengeksfiltrasi secret dengan menambahkan langkah yang mencetaknya.

**Seberapa sering secret harus dirotasi?**
Minimal setiap 90 hari untuk kredensial produksi, atau segera setelah ada indikasi kebocoran. Token jangka pendek via OIDC menghilangkan kebutuhan rotasi untuk kredensial cloud.

**Apakah environment protection rules membantu?**
Ya. Dengan *required reviewers*, secret environment production tidak bisa dipakai oleh job yang belum disetujui, sehingga rotasi bisa diuji di staging tanpa risiko production.

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Apakah secret di GitHub Actions terenkripsi?",
      "acceptedAnswer": { "@type": "Answer", "text": "Ya, secret dienkripsi saat disimpan dan disuntikkan sebagai variabel lingkungan pada runtime. Namun, siapa pun dengan akses tulis ke workflow bisa mengeksfiltrasi secret dengan menambahkan langkah yang mencetaknya." }
    },
    {
      "@type": "Question",
      "name": "Seberapa sering secret harus dirotasi?",
      "acceptedAnswer": { "@type": "Answer", "text": "Minimal setiap 90 hari untuk kredensial produksi, atau segera setelah ada indikasi kebocoran. Token jangka pendek via OIDC menghilangkan kebutuhan rotasi untuk kredensial cloud." }
    },
    {
      "@type": "Question",
      "name": "Apakah environment protection rules membantu?",
      "acceptedAnswer": { "@type": "Answer", "text": "Ya. Dengan required reviewers, secret environment production tidak bisa dipakai oleh job yang belum disetujui, sehingga rotasi bisa diuji di staging tanpa risiko production." }
    }
  ]
}
</script>

## Sumber

- [Encrypted secrets – GitHub Docs](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Using environments for deployment – GitHub Docs](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [Configuring OpenID Connect in cloud providers – GitHub Docs](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-cloud-providers)
- [Secret scanning – GitHub Docs](https://docs.github.com/en/code-security/secret-scanning)
- [Linux command-line. Bash. GNOME Terminal. screenshot, ZxxZxxZ, CC BY-SA (GNU GPL) – Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Linux_command-line._Bash._GNOME_Terminal._screenshot.png)
