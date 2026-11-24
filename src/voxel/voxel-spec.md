# Voxel Spec — ZOO TOSS

> Status: **Lengkap**. 36 hewan di 9 zona (`animals/*.json`) sudah disetujui Art Director (9 November 2026). Farm adalah pilot.
> Konteks: game web Three.js (prototype). Semua hewan **dibangun dari kode** berdasarkan data di file ini, tanpa file model 3D.
> Acuan visual: `art-direction.md` (gaya voxel halus, palet Sunny).

---

## 1. Isi Folder

| File | Fungsi |
|---|---|
| `voxel-spec.md` | Dokumen ini: format data dan aturan gaya |
| `animals/*.json` | Data voxel hewan, satu file per zona |
| `voxel-builder.js` | Fungsi pembangun Three.js (ES module) yang dipakai engineer di prototype |
| `preview.html` | Halaman preview untuk Art Director (ada tombol pilih zona; warna tanah tiap zona diambil dari `../palette.json`). Dibuat otomatis oleh `tools/build_preview.py`, jangan diedit manual. Buka langsung zona tertentu dengan `preview.html#<zona>` |
| `tools/build_preview.py` | Menggabungkan builder dan data ke `preview.html` (jalankan: `python tools/build_preview.py`) |

---

## 2. Format Data

Satu file zona berisi daftar hewan:

```json
{
  "zone": "farm",
  "animals": [
    {
      "id": "pastel_chick",
      "name": "Farm Chick",
      "rarity": "Common",
      "frame": "bird",
      "colors": { "body": "#FFE29A", "eye": "#1B2233" },
      "parts": [
        { "name": "body", "pivot": [0, 0, 0], "anim": null,
          "boxes": [ [0, 3, 0, 4, 4, 4, "body"] ] }
      ]
    }
  ]
}
```

| Field | Arti |
|---|---|
| `id` | Sama dengan `id` hewan di data zona prototype |
| `name` | Nama tampilan |
| `rarity` | Common / Rare / Epic / Legendary / Mythic |
| `frame` | Kerangka dasar (lihat Bagian 4). Hanya sebagai label, tidak dibaca builder |
| `colors` | Nama warna → hex. Semua warna diambil dari palet (Bagian 3) |
| `glow` | (opsional) Nama warna → kekuatan glow 0–1, misalnya `{ "glow": 1 }`. Balok dengan warna itu ikut menyala (emissive) memakai warnanya sendiri. Tidak menambah draw call, karena dibawa sebagai atribut vertex di material bersama |
| `parts` | Bagian tubuh. **Satu part = satu mesh = satu draw call.** Bagian yang tidak bergerak digabung ke `body` |
| `pivot` | Titik putar part `[x, y, z]`, misalnya pangkal kaki atau pangkal sayap |
| `anim` | Gerakan part: `legFL`, `legFR`, `legBL`, `legBR` (kaki depan/belakang kiri/kanan), `legL`, `legR` (dua kaki), `armL`, `armR` (lengan kerangka `upright`, berayun berlawanan dengan kaki; diam saat tidak berjalan), `squish` (kerangka `blob`: badan memipih dan memanjang seperti jeli, pivot di tanah), `tentacleA`, `tentacleB` (dua kelompok tentakel yang bergoyang berlawanan), `finL`, `finR` (sirip lebar seperti pari, kepakan pelan), `wingL`, `wingR`, `tail`, `head`, atau `null` |
| `boxes` | Daftar balok `[x, y, z, lebar, tinggi, panjang, warna]`. `x, y, z` = titik tengah balok dalam koordinat hewan, bukan relatif ke pivot |

**Koordinat:** satuan = 1 voxel. Sumbu Y ke atas, tanah di `y = 0`, hewan menghadap **+Z**, dan sumbu X ke kanan-kiri (simetris di `x = 0`). Ukuran hewan di game diatur engineer lewat satu angka skala, misalnya 1 voxel = 0,25 meter.

---

## 3. Aturan Gaya

1. **Balok halus, tanpa tekstur.** Warna per balok (vertex color), material Lambert, bayangan aktif.
2. **Bentuk chibi:** kepala besar, kaki pendek, dan mata besar di bagian depan kepala. Supaya lucu dan terbaca dari jauh.
3. **Mata selalu sama:** balok navy `#1B2233` dengan titik kilau putih kecil di kiri atas. Ini ciri khas semua hewan Zoo Toss.
4. **Setiap zona punya tema warna** yang **tidak sama** dengan warna tanah zonanya, supaya hewan tidak "tenggelam" di tanah:
   - Farm: pastel (krem, lavender, pink, kuning mentega). **Hindari hijau**, karena tanah Farm hijau pastel.
   - Lobby: "Cozy Pets", warna bulu peliharaan asli (putih krem, karamel, jahe, emas) + aksen merah. **Hindari hijau**, karena tanah Lobby hijau cerah.
   - Jungle: "Sunset", kuning, oranye, coral, magenta. **Hindari hijau**, karena tanah Jungle hijau tua.
   - Toxic: "Toxic Halloween", hijau limau neon, oranye labu, krem perban. **Hindari ungu gelap**, karena tanah Toxic ungu gelap.
   - Lava: "Magma", oranye api, kuning bara, merah lava, krem tanduk. **Hindari cokelat tua**, karena tanah Lava cokelat kemerahan gelap. Aksesori boleh biru muda sebagai kontras.
   - Glow Sea: "Neon Reef", badan terang (pink coral, aqua pucat, putih mutiara) dengan bagian glow cyan `#3FF0FF` dan pink `#FF5FD2`. **Hindari biru navy**, karena tanah Glow Sea biru laut gelap.
   - Christmas: "Cookie & Peppermint", cokelat jahe, karamel, hijau mint, pink permen, biru es lavender. Tanah Christmas sekarang **krem salju hangat** (`#F2E6D8`/`#E3D2C0`, revisi 9 Nov 2026), jadi hindari krem/putih polos sebagai warna badan utama; merah dan putih boleh untuk detail.
   - Frost: "Aurora", warna pekat cahaya kutub: teal, indigo, rose, dengan kristal es cyan yang sedikit menyala. **Hindari biru muda dan putih sebagai warna badan**, karena tanah Frost biru es dan salju.
   - Galaxy: "Starlight", pink nebula, periwinkle, kuning bintang, cyan, dengan bintang dan rasi yang menyala. **Hindari ungu gelap**, karena tanah Galaxy ungu luar angkasa. Mythic boleh memakai warna rarity Mythic `#19E6C1` sebagai aksesori kecil (permata).
5. **Makin langka, makin detail dan besar:**

| Rarity | Ukuran kira-kira (tinggi) | Detail |
|---|---|---|
| Common | 5–7 voxel | Bentuk dasar + 1 ciri khas |
| Rare | 7–9 voxel | + 2 ciri khas |
| Epic | 9–12 voxel | + aksesori (selendang, bunga, topi) |
| Legendary | 13–16 voxel | + aksesori menonjol (mahkota), ukuran raksasa |
| Mythic | 16+ voxel | + efek glow (bahan emissive). Warna UI Mythic: mint-toska `#19E6C1` (gelap `#0B7A66`), disetujui 9 Nov 2026 |

6. **Warna kelangkaan tidak dipakai di badan hewan**, kecuali sebagai aksesori kecil (misalnya mahkota emas pada Legendary). Kelangkaan ditandai lewat UI.
7. **Desain original.** Jangan meniru model dari game atau paket aset lain.

---

## 4. Kerangka Dasar

| Kerangka | Isi | Dipakai untuk (rencana 36 hewan) |
|---|---|---|
| `small` | Badan + kepala besar, 4 kaki pendek, ekor | Rabbit, Puppy, Cat, Golden Retriever, Toxic Bunny, Mummy Cat, Gingerbread Kitty, Nebula Cat, Frost Wolf |
| `quadruped` | Badan besar, 4 kaki, kepala di leher | Farm Sheep, Farm Donkey, Giant Farm Pig, Elephant, Mammoth, Yeti |
| `bird` | Badan bulat, 2 kaki, 2 sayap | Farm Chick, Jungle Parrot, Star Phoenix |
| `reptile` | Badan rendah memanjang, ekor panjang | Croc, Raptor, Ankylo, Trike, Brachio |
| `dragon` | Reptil + sayap + tanduk | Peppermint Dragon, Frost Whelp, Frost Wyrm, Cosmic Dragon |
| `sea` | Badan + sirip/tentakel | Squid, Hermit Crab, Manta, Serpent, Astral Whale |
| `upright` | Berdiri dua kaki, lengan | Monkey, Bat Bear, Reindeer |
| `blob` | Badan bulat tanpa kaki | Slime Frog |

---

## 4b. Daftar 36 Hewan (disetujui Art Director, 9 November 2026)

Struktur slot mengikuti data zona di prototype (`web-game-drab.vercel.app`): 9 zona × 4 slot. Angka penghasilan dan peluang tetap ikut prototype. Nama dan desain ditentukan tim visual. Nama masih bahasa Inggris sementara, karena bahasa nama hewan belum diputuskan.

| Zona | Slot 1 | Slot 2 | Slot 3 | Slot 4 |
|---|---|---|---|---|
| Lobby (C, C, R, E) ✅ disetujui | Rabbit (C) | Puppy (C) | Cat (R) | Golden Retriever (E) |
| Farm ✅ disetujui (pilot) | Farm Chick (C) | Farm Sheep (R) | Farm Donkey (E) | Giant Farm Pig (L) |
| Jungle ✅ disetujui | Jungle Monkey (C) | Jungle Parrot (R) | Jungle Croc (E) | Giant Jungle Elephant (L) |
| Toxic ✅ disetujui | Toxic Bunny (C) | Slime Frog (R) | Mummy Cat (E) | Giant Bat Bear (L) |
| Lava ✅ disetujui | Lava Raptor (C) | Magma Ankylo (R) | Lava Trike (E) | Volcano Brachio (L) |
| Glow Sea ✅ disetujui | Glow Squid (C) | Glow Hermit Crab (R) | Glow Manta (E) | Abyss Serpent (L) |
| Christmas ✅ disetujui | Gingerbread Kitty (C) | Candy Reindeer (R) | Peppermint Dragon (E) | Giant Yeti (L) |
| Frost ✅ disetujui | Frost Whelp (C) | Frost Wolf (R) | Ice Mammoth (E) | Frost Wyrm (L) |
| Galaxy (R, E, L, M) ✅ disetujui | Nebula Cat (R) | Astral Whale (E) | Star Phoenix (L) | Cosmic Dragon (Mythic) |

Id hewan di prototype (untuk dicocokkan engineer): lobby `rabbit, dog, cat, golden_retriever` · farm `chicken, pig, sheep, cow` · jungle `monkey, parrot, snake, gorilla` · toxic `mutant_rat, toxic_slime, mutant_bat, radioactive_spider` · lava `magma_snail, fire_lizard, hell_hound, volcano_golem` · glow_sea `anglerfish, glow_jellyfish, giant_squid, leviathan` · christmas `gingerbread_man, snow_reindeer, nutcracker, santa_yeti` · frost `ice_golem, frost_wolf, mammoth_frost, frost_wyrm` · galaxy `star_cat, void_whale, phoenix_sun, cosmic_dragon`. Data hewan di prototype perlu diganti nama dan id-nya sesuai tabel di atas (cukup perubahan data).

**Cadangan & roadmap v2/v3:** lihat `art-direction/voxel/animal-roadmap.md`. Nama memakai awalan zona (Farm …, Jungle …); warna tetap palet pastel / sunset.

**Tema warna hewan per zona** (tidak boleh sama dengan warna tanah zonanya, lihat `palette.json` → `biome`): Farm pastel (tanpa hijau). Zona lain ditentukan saat dikerjakan, misalnya Jungle "sunset" (kuning, oranye, magenta) atau Glow Sea "glow" (cyan dan pink neon, memakai bahan emissive).

## 5. Performa (target)

| Ukuran | Target |
|---|---|
| Segitiga per hewan | Di bawah 1.500 (1 balok = 12 segitiga, jadi maksimal ±120 balok) |
| Draw call per hewan | 1–7 (badan + bagian yang bergerak) |
| Material | Satu material bersama untuk semua hewan |
| Geometri | Dibuat sekali per jenis hewan, lalu dipakai ulang untuk setiap salinan |
