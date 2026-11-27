# 100 Hari Mengubah Pulau Tandus - Hari 1

Video vertikal 720x1280, 30 fps, durasi sekitar 2 menit 25 detik, memakai narasi ElevenLabs Anda apa adanya (voiceover.wav, tidak dipercepat dan jedanya tidak dipotong).

## Cara render (Windows)
1. Pasang Node.js LTS dari nodejs.org (cek dengan `node -v`).
2. Ekstrak zip ini dengan Extract All.
3. Tekan Windows+R, tempel jalur folder ini + `\test_render.bat`, lalu Enter. Ini hanya merender 3 detik pertama (tanpa suara) untuk memastikan semuanya jalan.
4. Kalau tes itu berhasil, jalankan `render.bat`. Render penuh membuat 4.366 frame dan bisa memakan 20 sampai 60 menit tergantung komputer. Hasilnya `final.mp4` di folder ini.
5. Kalau gagal, jalankan `check.bat` lalu kirim isi `out\check_log.txt`.

Mac/Linux: `bash render.sh`.

## Isi video
- Karakter 2D datar (rambut pompadour dengan jambul yang bergoyang tertiup angin, bandana, rompi), bergerak di pulau 3D bergaya toon.
- Mulut mengikuti volume suara narasi, mata berkedip, alis dan ekspresi berganti sesuai emosi tiap bagian, lengan bergestur sesuai kalimat.
- Objek: sumur kering, pagar rusak, bangkai perahu, kaktus, pohon mati, tengkorak, semak bergulir, retakan tanah, ransel, sekop, kapak pemecah batu, papan "HARI 1", kalender 100 hari, tumpukan batu mata air, tetesan air, sungai yang mengalir, ikon pohon/rumah/kupu-kupu/tetes air, anak pohon, bendungan, kolam, papan "PILIHAN 1" dan "PILIHAN 2", papan komentar.
- Subtitle satu kata per kata mengikuti suara.

## Catatan jujur
- Saya sudah merender 22 frame pengecekan (satu per adegan) dan melihat hasilnya: karakter, mulut, sungai, papan, ikon, dan subtitle satu kata tampil benar. Kamera 7 adegan (penggalian, tetesan, detak, pilihan 1 dan 2) sudah diperbaiki karena karakter sempat terpotong di tepi layar.
- Video penuh BELUM dirender di cloud: tanpa kartu grafis, satu frame butuh sekitar 25 detik (4.366 frame = sekitar 30 jam). Render penuh dijalankan di komputer Anda dengan render.bat.
- Batas tiap bagian ditentukan dari jeda di audio, jadi pergantian adegan bisa meleset sekitar satu detik di beberapa tempat.
- src/story.js berisi seluruh storyboard (posisi, kamera, ekspresi, gestur) dan mudah diubah.
