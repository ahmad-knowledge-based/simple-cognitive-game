# 🧠 Senam Otak — Game Kognitif untuk Lansia

Kumpulan permainan sederhana untuk menstimulasi otak lansia. Ramah lansia:
tombol besar, kontras tinggi, **tanpa batas waktu**, umpan balik lembut saat
salah (tidak ada hukuman), dan suara bisa dimatikan.

## 🎮 Cara Bermain

1. Buka halaman game (lihat **Cara Mengakses** di bawah).
2. Di menu utama, sentuh salah satu kartu permainan.
3. Mainkan. Tombol **← Kembali** di kiri atas untuk memilih game lain.
4. Tombol **🔊 Suara** di pojok kanan atas untuk menyalakan/mematikan suara.

### Permainan yang tersedia

| Game | Melatih | Cara main | Varian & tingkat |
|------|---------|-----------|------------------|
| 🃏 **Kartu Memori** | Memori jangka pendek | Buka dua kartu, cari pasangan yang sama | 4 tema (buah/hewan/wajah/kendaraan), 5 tingkat: 3→10 pasang |
| 🎵 **Ikuti Urutan** | Memori kerja & atensi | Perhatikan kilatan warna+suara, lalu ulangi | 4 atau 6 warna, 3 kecepatan |
| 🔍 **Cari yang Beda** | Atensi visuospasial | Temukan gambar yang berbeda di dalam grid | Cari 1 / 2 beda, grid 2×2 → 6×6 |
| 📝 **Teka-Teki Silang** | Bahasa & memori | Sentuh pertanyaan, isi kotak hurufnya | 120 pertanyaan, 4 tingkat (Mudah → Ahli), soal acak tiap main |

> Pada **Teka-Teki Silang**, tekan **Periksa Jawaban** untuk menandai kotak yang
> benar (hijau), atau **Soal Baru** untuk teka-teki acak yang berbeda.

## 🌐 Cara Mengakses

### Online (GitHub Pages)
Setelah workflow `Deploy to GitHub Pages` berhasil dan Pages aktif:

```
https://ahmad-knowledge-based.github.io/simple-cognitive-game/
```

Tinggal buka tautan itu di HP atau komputer — tidak perlu memasang apa pun.

### Menjalankan secara lokal
Proyek ini memakai **ES Modules**, jadi **tidak bisa** dibuka langsung dengan
klik dua kali (`file://`) — perlu dijalankan lewat server lokal kecil:

```bash
# di dalam folder proyek
python -m http.server 8000
```

Lalu buka di browser: <http://localhost:8000>

(Alternatif lain: `npx serve` jika Node.js terpasang.)

## 🗂️ Struktur Proyek

```
index.html              Shell halaman (header + wadah #app)
css/styles.css          Seluruh tampilan
js/
  main.js               Menu utama + navigasi antar layar
  core/
    router.js           Pindah layar & pembersihan (unmount)
    audio.js            Suara (WebAudio) + saklar matikan
    utils.js            Helper: el(), shuffle, chipRow, dll.
    crossword.js        Generator teka-teki silang otomatis
  data/
    tts-bank.js         120 pertanyaan teka-teki silang
    beda-sets.js        Pasangan ikon untuk "Cari yang Beda"
  games/
    memori.js  simon.js  beda.js  tts.js
```

### Menambah konten
- **Pertanyaan TTS baru:** tambah satu baris di [`js/data/tts-bank.js`](js/data/tts-bank.js)
  (`{ a: "JAWABAN", q: "pertanyaan" }`, huruf kapital A–Z, 3–8 huruf). Generator
  otomatis menyusunnya.
- **Game baru:** buat file di `js/games/` (ekspor `meta` dan `mount(root)`),
  lalu daftarkan di array `GAMES` dalam [`js/main.js`](js/main.js).

## 🚀 Deploy

Deploy otomatis ke GitHub Pages tiap `push` ke branch `main`
([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)). Pastikan di
**Settings → Pages**, sumber (*Source*) diset ke **GitHub Actions**.
