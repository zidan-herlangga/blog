---
layout: post
title: "Cara Mengamankan Kredensial di Aplikasi Web"
description: "Checklist praktis menyimpan secret: env var, secret manager, rotasi, scanning, dan least privilege."
date: 2026-11-14 10:00:00 +0700
categories: [keamanan, web]
image: /assets/images/news/secrets-cover.webp
thumb: /assets/images/news/secrets-cover-thumb.webp
image_alt: "Foto gembok logam dengan kunci"
cover: /assets/images/news/secrets-cover.webp
cover_alt: "Foto gembok logam dengan kunci"
---

Kebocoran kredensial adalah pintu masuk favorit penyerang – dari insiden Cursor (kunci API Fireworks AI) hingga kampanye yang mencuri token dari trace AI. Berikut checklist praktis agar secret tidak bocor.

## 1. Jangan pernah commit secret ke repo

- Tambahkan `.env`, `*.key`, `*.pem` ke `.gitignore` sebelum commit pertama.
- Pakai **secret scanning** di CI: gitleaks, trufflehog, atau GitHub secret scanning.
- Kalau secret sudah ter-commit: **rotasi segera**, lalu bersihkan history dengan `git filter-repo` (rotasi lebih penting daripada membersihkan history).

## 2. Pakai environment variable, bukan hardcode

- Baca secret dari env var di runtime, bukan dari source code.
- Pisahkan file `.env` per environment (dev, staging, prod) dan jangan commit.
- Di frontend (browser), jangan taruh secret apa pun – anggap semua kode frontend publik.

## 3. Secret manager untuk produksi

- Gunakan vault: AWS Secrets Manager, GCP Secret Manager, Azure Key Vault, HashiCorp Vault, atau Doppler.
- Aplikasi mengambil secret saat startup atau via sidecar, bukan dari file konfigurasi.
- Rotasi otomatis jika didukung (mis. database password).

## 4. Batasi hak akses (least privilege)

- Satu kunci = satu tujuan. Kunci yang bisa membaca seluruh bucket adalah masalah arsitektur.
- Pakai token berumur pendek (short-lived) dan scoped (read-only, per-resource).
- Pisahkan kredensial per layanan; jangan satu key untuk semua.

## 5. Jangan log atau tampilkan secret

- Secret tidak boleh muncul di log, error message, stack trace, atau trace AI/prompt.
- Masking di logger: ganti nilai secret dengan `***`.
- Audit kode untuk `console.log`, `print`, `logger.info` yang mencetak env.

## 6. Deteksi kebocoran

- Aktifkan alert GitHub/GitLab untuk push secret.
- Pantau penggunaan kredensial: request dari IP baru, volume tidak wajar, akses di luar jam kerja.
- Pakai honeytoken (kredensial palsu) untuk mendeteksi penggunaan tidak sah.

## 7. Backup & recovery

- Simpan secret di tempat yang terenkripsi dan ter-backup (vault), bukan di chat atau dokumen.
- Siapkan prosedur rotasi cepat: siapa yang bisa revoke, berapa lama, dan bagaimana deploy ulang.

## Ringkasan

Secret yang aman adalah secret yang **tidak pernah muncul di kode, log, atau prompt**, **berumur pendek**, dan **bisa dirotasi dalam hitungan menit**. Insiden Cursor menunjukkan satu kunci yang bocor bisa membuka jalan ke seluruh sistem – bukan karena teknologi canggih, tapi karena kredensial disimpan di tempat yang salah.

## Sumber

- [Cursor confirms security breach led to malicious Claude Code extension – BleepingComputer](https://www.bleepingcomputer.com/news/security/cursor-confirms-security-breach-led-to-malicious-claude-code-extension/)

*Artikel ini ringkasan praktis, bukan panduan resmi vendor. Sesuaikan dengan kebijakan keamanan organisasimu.*