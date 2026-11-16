---
layout: post
title: "Dirty Frag & Januscape: Dua Celah Kernel yang Lebih Berbahaya dari NoisyTCP"
description: "Dirty Frag memberi root, Januscape memungkinkan escape dari VM. Keduanya ditemukan peneliti yang sama yang menemukan NoisyTCP."
date: 2026-11-17 09:00:00 +0700
categories: [keamanan, linux]
image: /assets/images/news/dirtyfrag-cover.webp
image_alt: "Foto lorong data center dengan rak server"
cover: /assets/images/news/dirtyfrag-cover.webp
cover_alt: "Foto lorong data center dengan rak server"
---

NoisyTCP (CVE-2026-99288) hanya menyebabkan server crash. Dua celah lain yang ditemukan peneliti yang sama – Hyunwoo Kim – jauh lebih berbahaya: **Dirty Frag** dan **Januscape**.

## Dirty Frag (Mei 2026)

Dirty Frag merantai dua celah page-cache write:

- **RxRPC** – CVE-2026-43500
- **xfrm-ESP** – CVE-2026-43284

Kombinasi keduanya memungkinkan penyerang yang sudah punya akses lokal menulis ke page cache dan **mendapatkan hak root** pada distribusi utama: Ubuntu, Red Hat Enterprise Linux, CentOS Stream, dan Fedora.

Ini adalah kelas celah yang sama dengan Dirty Pipe (2022) dan Dirty Cow (2016): menulis ke file yang seharusnya read-only dengan memanipulasi page cache kernel. Bedanya, Dirty Frag memanfaatkan dua subsistem berbeda (RxRPC dan xfrm-ESP) yang jarang diaudit bersama.

## Januscape (Juli 2026)

Januscape adalah celah berumur **16 tahun** di kernel Linux. Dampaknya bukan root di mesin lokal, melainkan **escape dari virtual machine**: penyerang di dalam VM bisa menjalankan kode arbitrer di host.

Untuk lingkungan cloud dan multi-tenant, ini adalah mimpi buruk. Satu tenant yang terkompromi bisa keluar dari isolasi VM dan mengakses data tenant lain atau host hypervisor.

## Pola yang sama

Ketiga celah (NoisyTCP, Dirty Frag, Januscape) ditemukan oleh peneliti yang sama dalam rentang enam bulan. Artinya:

- Subsistem kernel yang jarang disentuh (RxRPC, xfrm-ESP, TCP SYN cookie) menyimpan bug lama.
- Peneliti yang sistematis bisa menemukan banyak celah dalam waktu singkat.
- Organisasi yang tidak mempatch kernel secara rutin terakumulasi risiko.

## Yang perlu dilakukan

1. **Patch kernel** untuk ketiga celah (CVE-2026-99288, CVE-2026-43500, CVE-2026-43284) sesuai advisory distro.
2. **Reboot** setelah patch kernel.
3. **Batasi akses lokal** – Dirty Frag butuh akses awal (meskipun hanya user biasa).
4. Untuk cloud: **isolasi tenant yang ketat**, monitor VM escape (anomali akses host), dan patch hypervisor.
5. **Audit subsistem yang jarang dipakai** (RxRPC, xfrm-ESP) – nonaktifkan jika tidak diperlukan.

## Sumber

- [New NoisyTCP Linux kernel flaw lets attackers crash servers – BleepingComputer](https://www.bleepingcomputer.com/news/linux/new-noisytcp-linux-kernel-flaw-lets-attackers-crash-servers/)
- [CVE-2026-99288 – Red Hat Customer Portal](https://access.redhat.com/security/cve/CVE-2026-99288)

*Artikel ini ringkasan dan analisis pribadi. Detail CVE Dirty Frag dan Januscape merujuk pada pengungkapan Hyunwoo Kim yang disebut dalam artikel BleepingComputer di atas.*