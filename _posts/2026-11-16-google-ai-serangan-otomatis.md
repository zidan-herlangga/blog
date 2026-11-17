---
layout: post
title: "Google GTIG: Serangan AI yang Sepenuhnya Otomatis Sudah Dimulai"
description: "GTIG mengonfirmasi ancaman baru: kerangka kerja LLM yang mengotomatiskan pencarian dan eksploitasi celah tanpa manusia di loop."
date: 2026-11-16 14:00:00 +0700
categories: [keamanan, ai]
series: "Sorotan Keamanan November 2026"
image: /assets/images/news/google-ai-cover.webp
thumb: /assets/images/news/google-ai-cover-thumb.webp
image_alt: "Foto layar yang menampilkan kode program"
cover: /assets/images/news/google-ai-cover.webp
cover_alt: "Foto layar yang menampilkan kode program"
---

Google Threat Intelligence Group (GTIG) merilis laporan yang mengubah cara kita melihat keamanan siber: **serangan yang sepenuhnya otomatis, tanpa manusia di dalam loop, sudah bukan proyeksi lagi**. Kuartal ini mereka menemukannya di lapangan.

## Apa yang berubah

Selama ini, AI dipakai penyerang secara eksperimental – membantu menulis skrip, meringkas hasil scan, atau mempercepat reconnaissance. Sekarang, AI dipakai untuk **menjalankan seluruh rantai serangan** secara otonom: pencarian celah, penyusunan exploit, eksekusi, dan eksfiltrasi data.

GTIG mencatat adopsi besar-besaran oleh kelompok keuangan maupun aktor negara. Contoh yang disebut:

- Framework multi-agen **CAIRN** dipakai dalam serangan terhadap sektor kedirgantaraan Amerika Serikat.
- Agen **exploit_agent** mengotomatiskan pencarian dan eksploitasi celah pada situs media, hiburan, dan pendidikan di Prancis.
- Aktor yang diduga Korea Utara memakai **Claude Code** untuk membantu pengiriman malware.

GTIG juga menemukan penyerang secara sistematis menyalahgunakan open-source pentest suite – ARTEX, CAIRN, CyberStrikeAI, dan HexStrike AI – untuk menjalankan serangan adaptif terhadap endpoint yang terbuka ke internet dan rentan terhadap celah berkompleksitas rendah, yang LLM mudah bangun exploit-nya.

## Proyeksi GTIG

- **3 bulan ke depan:** serangan tidak canggih yang memerlukan sedikit atau tanpa interaksi manusia, bergantung pada beberapa agen AI.
- **6 bulan ke depan:** serangan otonom yang lebih matang dan canggih.

"In the past quarter, GTIG identified threat actors using LLM frameworks to fully automate vulnerability discovery and exploitation without a human in the loop for the first time," tulis Google.

## Yang membuatnya berbahaya

Biaya dan keahlian serangan turun drastis. Celah yang butuh tiga hari bagi manusia bisa selesai dalam hitungan menit bagi agen. Volume percobaan naik, sementara waktu respons tim bertahan tetap sama.

## Yang perlu dilakukan

1. **Patch celah berkompleksitas rendah dengan cepat** – ini yang paling mudah dieksploitasi LLM.
2. **Kurangi permukaan serangan** – inventarisasi endpoint yang terbuka, tutup panel admin, hapus layanan legacy.
3. **Rate limiting & WAF** di API dan endpoint sensitif.
4. **MFA & least privilege** untuk akses admin dan konsol cloud.
5. **Monitoring** – lonjakan request otomatis, perubahan kredensial, transfer data keluar.
6. **Siapkan playbook respons** sebelum insiden – karena serangan bisa mencapai akses istimewa dalam hitungan jam.

## Sumber

- [Google warns that fully-automated AI attacks are coming soon – BleepingComputer](https://www.bleepingcomputer.com/news/security/google-warns-that-fully-automated-ai-attacks-are-coming-soon/)
- [FBI warns ARTEX AI hacking tool is powering global cyberattacks – BleepingComputer](https://www.bleepingcomputer.com/news/security/fbi-warns-artex-ai-hacking-tool-is-powering-global-cyberattacks/)

*Artikel ini ringkasan dan analisis pribadi. Untuk detail resmi, baca laporan GTIG.*