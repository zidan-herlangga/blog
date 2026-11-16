---
layout: post
title: "NoisyTCP: Bug 11 Tahun di Kernel Linux yang Bisa Mematikan Server"
description: "CVE-2026-99288 memungkinkan penyerang tanpa login memicu kernel panic dari jarak jauh. Hampir semua distro Linux terdampak."
date: 2026-11-16 10:00:00 +0700
categories: [keamanan, linux]
image: /assets/images/news/noisytcp-cover.png
image_alt: "Kartu artikel bertema steel blue: bug kernel Linux NoisyTCP dan server yang mati"
cover: /assets/images/news/noisytcp-cover.png
cover_alt: "Ilustrasi kernel Linux, paket TCP, dan kernel panic"
---

Ada bug di kernel Linux yang sudah berumur 11 tahun dan baru sekarang ditambal. Namanya **NoisyTCP**, tercatat sebagai **CVE-2026-99288**. Dampaknya bukan pencurian data, bukan eksekusi kode, tetapi sesuatu yang cukup untuk membuat layanan mati: **kernel panic**.

Yang membuatnya serius adalah syaratnya yang rendah. Penyerang tidak perlu login, tidak perlu mengirim payload rumit, dan hampir semua distribusi Linux terdampak — termasuk server yang menjalankan Nginx, Apache, atau SSH dengan konfigurasi default.

## Akar masalahnya: race condition di socket lookup

Kernel Linux menangani koneksi TCP masuk dengan *lockless socket lookup*. Saat paket datang, kernel mencari socket yang cocok di tabel hash tanpa selalu mengambil lock. Untuk mengurangi overhead, Linux juga memakai **SYN cookie** ketika antrean koneksi mulai penuh.

Masalahnya muncul ketika dua hal berjalan bersamaan di RX queue berbeda:

1. Satu paket memicu pembuatan SYN cookie dan menyimpan state sementara.
2. Paket lain melakukan lookup ke tabel ehash saat sebuah socket sedang dibebaskan dan dialokasikan ulang.

Dalam jendela waktu yang sempit, kernel bisa membaca **socket yang sudah di-recycle tetapi belum diinisialisasi dan di-hash dengan benar**. Hasilnya adalah *NULL pointer dereference*, dan kernel panik.

Red Hat menjelaskan intinya begini: diperlukan lookup ehash yang basi bersamaan dengan pembebasan dan realokasi request socket di konteks RX yang berbeda. Karena itu, serangan lebih mudah berhasil pada server dengan **dua RX queue atau lebih**, atau yang memakai RPS untuk menyebarkan paket ke beberapa CPU.

{% include figure.html src="/assets/images/news/diagram-noisytcp.png" alt="Diagram race condition NoisyTCP di dua RX queue yang berujung kernel panic" caption="Dua RX queue memproses SYN cookie dan socket reuse secara bersamaan; jendela race yang sempit tetap bisa memicu kernel panic." %}

## Seberapa berbahaya?

Untuk konteks yang jujur: ini **denial of service**, bukan kompromi penuh. Penyerang tidak bisa mencuri data, mengubah isi disk, atau menjalankan kode arbitrer. Dampaknya adalah layanan berhenti sampai server di-reboot.

Tetapi jangan meremehkan DoS. Untuk bisnis, server yang mati sama saja dengan gangguan layanan. Untuk penyedia hosting, satu bug yang bisa mematikan banyak tenant sekaligus adalah masalah operasional besar. Dan karena kernel dipakai bersama, **container ikut terdampak walau container-nya sendiri tidak menjalankan Nginx** — yang menentukan adalah kernel host.

Penemunya, Hyunwoo Kim, mencatat bahwa jendela race-nya sempit. Pada server *bare-metal* yang lalu lintasnya sepi, memicu bug ini bisa memakan waktu lama. Tetapi penyerang tidak perlu berhasil pada percobaan pertama; mereka bisa mengirim traffic terus-menerus.

## Apakah sudah ada perbaikan?

Ya. Patch sudah tersedia dan perbaikannya sudah masuk ke kernel Linux mainline sekitar dua minggu sebelum publikasi. Distribusi biasanya merilis kernel baru dengan nomor versi masing-masing, jadi langkah yang benar adalah mengikuti advisory distro kamu, bukan menunggu nomor versi tertentu.

Setelah patch terpasang, **reboot tetap wajib**. Patch kernel tidak aktif sampai sistem boot ulang. Ini sering menjadi bagian yang terlewat: patch tercatat "terpasang", tetapi host masih menjalankan kernel lama.

## Kalau belum bisa patch hari ini

Ada mitigasi sementara yang disebut oleh peneliti, dengan trade-off yang harus dipahami:

| Mitigasi | Perintah | Konsekuensi |
| --- | --- | --- |
| Matikan SYN cookie | `sysctl -w net.ipv4.tcp_syncookies=0` | Perlindungan terhadap SYN flood melemah |
| Paksa satu RX queue | `ethtool -L <interface> combined 1` | Throughput dan paralelisme jaringan turun |

Keduanya bukan solusi permanen. Anggap sebagai tambal darurat sambil menyiapkan jendela maintenance untuk patch dan reboot.

Langkah lain yang masuk akal:

- Periksa apakah host benar-benar menerima paket TCP langsung dari internet. Server di belakang load balancer dengan proteksi L4 punya paparan lebih kecil, tetapi tetap perlu dipatch.
- Pantau log kernel untuk `NULL pointer dereference` di subsistem jaringan, dan siapkan auto-restart untuk layanan kritikal.
- Pastikan prosedur rollback dan snapshot tersedia sebelum patch massal.

## Pola yang berulang

NoisyTCP bukan bug pertama di subsistem kernel yang baru ditemukan setelah bertahun-tahun. Pada Mei 2026, peneliti yang sama mengungkap **Dirty Frag**, rantai dua celah page-cache yang bisa berujung root. Pada Juli, ada **Januscape**, bug berumur 16 tahun yang memungkinkan escape dari virtual machine.

Artinya jelas: kernel adalah permukaan serangan yang sangat besar, dan sebagian bug lama baru terlihat ketika orang mulai mencarinya dengan cara yang lebih sistematis. Bagi tim operasional, prioritasnya bukan membaca setiap CVE, tetapi memastikan jalur patch kernel berjalan cepat dan bisa diuji tanpa takut downtime.

## Sumber

- [New NoisyTCP Linux kernel flaw lets attackers crash servers — BleepingComputer](https://www.bleepingcomputer.com/news/linux/new-noisytcp-linux-kernel-flaw-lets-attackers-crash-servers/)
- [CVE-2026-99288 — Red Hat Customer Portal](https://access.redhat.com/security/cve/CVE-2026-99288)

*Artikel ini ringkasan dan analisis pribadi. Selalu ikuti advisory resmi distribusi dan vendor infrastruktur kamu sebelum menerapkan perubahan pada sistem produksi.*
