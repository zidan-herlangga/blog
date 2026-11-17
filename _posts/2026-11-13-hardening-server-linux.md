---
layout: post
title: "Checklist Hardening Server Linux untuk Pemula"
description: "Langkah-langkah praktis mengamankan server Linux: SSH, firewall, update, fail2ban, backup, dan monitoring."
date: 2026-11-13 10:00:00 +0700
categories: [keamanan, linux]
image: /assets/images/news/hardening-cover.webp
thumb: /assets/images/news/hardening-cover-thumb.webp
image_alt: "Foto data center dengan rak server"
cover: /assets/images/news/hardening-cover.webp
cover_alt: "Foto data center dengan rak server"
---

Server Linux yang baru dipasang belum aman. Berikut checklist minimal yang sebaiknya dilakukan sebelum server menerima traffic produksi.

## 1. Update sistem

- `apt update && apt upgrade -y` (Debian/Ubuntu) atau `dnf update -y` (RHEL/Fedora).
- Aktifkan unattended upgrades untuk patch keamanan otomatis.
- Jadwalkan reboot jika kernel diperbarui.

## 2. Amankan SSH

- Nonaktifkan login root: `PermitRootLogin no` di `/etc/ssh/sshd_config`.
- Pakai autentikasi kunci, bukan password: `PasswordAuthentication no`.
- (Opsional) Ganti port default dan batasi user dengan `AllowUsers`.
- Restart SSH: `systemctl restart sshd`.

## 3. Firewall

- Aktifkan UFW: `ufw default deny incoming`, `ufw default allow outgoing`, `ufw allow 22/tcp`, `ufw allow 80/tcp`, `ufw allow 443/tcp`, lalu `ufw enable`.
- Atau pakai `firewalld` / nftables sesuai distro.
- Hanya buka port yang benar-benar dipakai.

## 4. Fail2ban

- Install fail2ban untuk memblokir IP yang berulang gagal login.
- Aktifkan jail untuk SSH: `systemctl enable --now fail2ban`.
- Cek status: `fail2ban-client status sshd`.

## 5. Pengguna & hak akses

- Buat user non-root dengan sudo: `adduser deploy && usermod -aG sudo deploy`.
- Jangan berbagi akun root.
- Nonaktifkan akun yang tidak dipakai.

## 6. Layanan & permukaan serangan

- Cek layanan aktif: `systemctl list-units --type=service --state=running`.
- Nonaktifkan yang tidak diperlukan: `systemctl disable --now <service>`.
- Hapus paket yang tidak dipakai.

## 7. Patch kernel rutin

- Kernel adalah permukaan serangan besar (lihat Dirty Frag, Januscape, NoisyTCP).
- Pastikan jalur update kernel berjalan dan ada jendela maintenance untuk reboot.

## 8. Logging & audit

- Pastikan journald/rsyslog aktif.
- Kirim log ke tempat terpusat (opsional) untuk deteksi insiden.
- Pantau login gagal, sudo, dan perubahan file penting.

## 9. Backup

- Backup konfigurasi dan data secara rutin (rsync, restic, borg).
- Uji restore secara berkala – backup yang tidak pernah diuji = tidak ada backup.

## 10. (Opsional) MAC & monitoring

- Aktifkan AppArmor/SELinux (biasanya sudah aktif di distro modern).
- Pasang monitoring sederhana (uptime, CPU, disk, login) – Netdata, Prometheus, atau Uptime Kuma.

## Ringkasan

Urutan yang paling berdampak: **update → SSH → firewall → fail2ban → user**. Lima langkah ini bisa dilakukan dalam 30 menit dan menutup sebagian besar vektor serangan umum.

## Sumber

- [New NoisyTCP Linux kernel flaw lets attackers crash servers – BleepingComputer](https://www.bleepingcomputer.com/news/linux/new-noisytcp-linux-kernel-flaw-lets-attackers-crash-servers/)

*Artikel ini ringkasan praktis, bukan panduan resmi. Sesuaikan dengan kebijakan dan lingkungan kamu.*