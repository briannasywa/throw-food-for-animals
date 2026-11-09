# 🍖 Dokumen Progres Pengembangan Game: Throw Food For Animals

Game ini dibuat menyerupai game Roblox populer **"Throw Food For Animals"** dengan arsitektur web modern (Vite, Three.js 3D Voxel Engine, TailwindCSS, Web Audio API).

---

## 🚀 Status Server & Cara Menjalankan

Saat ini aplikasi dapat diakses di dua port aktif:
1. **Server Produksi (Sangat Stabil / Zero Error):**
   * **URL:** `http://localhost:3000/`
   * Menjalankan build bundle optimasi Three.js yang sudah terkompilasi (`dist/`).
2. **Server Development (Live Reload):**
   * **URL:** `http://localhost:5173/`

Jika port tertutup atau ingin dijalankan ulang secara manual:
```bash
# Jalankan mode development
cd web-game
npm run dev

# Atau jalankan mode production
cd web-game
npm run build
npx serve -s dist -p 3000
```

---

## 📋 Catatan Progres Lengkap (Changelog & Features)

---

## 🦁 1.7 Anatomi Hewan Voxel Spesifik & Gimmick Tingkat Kelangkaan (Update Sangar)

Setiap hewan tidak lagi berbentuk kotak generik, melainkan memiliki **model 3D voxel prosedural unik yang presisi** dan gimmick visual yang semakin garang/mitologis seiring meningkatnya kelangkaan (*Rarity*):

| Tier Bioma & Kelangkaan | Nama Hewan | Anatomi Voxel Unik & Gimmick Visual Sangar |
| :--- | :--- | :--- |
| **Zone 1: Common** | **Kelinci Putih** | Tubuh bulat putih, telinga panjang tegak pink, ekor bola halus. |
| **Zone 1: Common** | **Tupai Cincang** | Ekor lengkung besar (*S-curve*) ke atas sambil memegang buah kenari di tangan. |
| **Zone 1: Rare** | **Landak Mini** | Puluhan duri-duri tajam runcing (*spikes*) mencuat di seluruh punggung. |
| **Zone 1: Epic** | **Rusa Emas** | Tanduk bercabang emas (*golden branched antlers*) dan kaki jenjang anggun. |
| **Zone 2: Common** | **Zebra Liar** | Corak belang monokrom hitam-putih di seluruh torso dan kaki. |
| **Zone 2: Rare** | **Jerapah Tutul** | Leher super tinggi menjulang ke langit dengan tanduk kecil di kepala. |
| **Zone 2: Epic** | **Kanguru Petinju** | Paha belakang berotot kekar melompat, kantung depan, dan ekor penyeimbang tebal. |
| **Zone 2: Legendary** | **Raja Singa** | **SANGAR:** Surai lebat raksasa mengelilingi kepala dengan taring taring tajam keluar. |
| **Zone 3: Common** | **Unta Gurun** | Punuk pasir besar di punggung dan leher melengkung tahan haus. |
| **Zone 3: Rare** | **Kalajengking** | **SANGAR:** Sepasang capit besar di depan dan ekor sengat beracun melengkung ke atas. |
| **Zone 3: Epic** | **Rubah Fennec** | Telinga segitiga gurun raksasa dan moncong runcing waspada. |
| **Zone 3: Legendary** | **Kobra Mahkota** | **SANGAR:** Berdiri tegak dengan tudung (*hood*) melebar siap mematuk dengan taring berbisa. |
| **Zone 4: Common** | **Pinguin** | Tuxedo hitam-putih, paruh oranye, sayap seluncur (*flippers*). |
| **Zone 4: Rare** | **Anjing Laut** | Tubuh silinder tidur dengan sirip samping dan sirip ekor dayung. |
| **Zone 4: Epic** | **Beruang Es** | Tubuh raksasa berotot dengan cakar cakar salju tebal. |
| **Zone 4: Legendary** | **Mammoth Purba** | **SUPER SANGAR:** Tubuh purba raksasa dengan belalai dan sepasang gading melengkung super panjang. |
| **Zone 5: Rare** | **Kucing Void** | Kucing hitam kosmik dengan mata neon cyan bercahaya dan tanduk kristal. |
| **Zone 5: Epic** | **Paus Kosmik** | Paus melayang di udara dengan bentangan sayap kosmik raksasa. |
| **Zone 5: Legendary** | **Burung Phoenix** | **SANGAR API:** Sayap api bertingkat merah-emas berkobar dan ekor mahkota dewa surya. |
| **Zone 5: Mythic (Paling Sangar)** | **Naga Astral** | **DEWA KOSMIK:** Naga raksasa dengan tanduk kembar, taring naga, jajaran duri punggung (*dragon spines*), dan bentangan sayap naga merah darah raksasa. |

* **Gimmick Mutasi (Gold, Diamond, Emerald, Rainbow):**
  * Setiap hewan mutasi mendapatkan **Halo Mahkota Bercahaya 3D** yang melayang di atas kepalanya dengan partikel warna mutasi masing-masing.

Seluruh estetika game telah dirombak total dari gaya *"AI Slop"* menjadi **Retro Isometric Voxel yang estetik dan kohesif**:

1. **Kamera True Orthographic Isometric:**
   * Sudut pandang isometrik murni (*30-degree orthographic projection*) tanpa distorsi perspektif.
   * Memberikan kejelasan geometris voxel yang tajam dan rapi khas game indie retro berkualitas tinggi.

2. **Palet Warna Terkontrol (Endesga 32 Palette):**
   * Menghilangkan warna neon pelangi silau yang acak.
   * Menggunakan palet retro bernuansa hangat: Dark Purple (`#262b44`), Slate Navy (`#3a4466`), Warm Cream (`#e4a672`), Muted Green (`#38734a`), dan Gold Accent (`#fee761`).

3. **Tipografi & UI 8-Bit Asli:**
   * Menggunakan font **Press Start 2P** dan **Silkscreen** monospace.
   * Frame UI menggunakan teknik *inset shadow border* 8-bit klasik tanpa gradien plastik modern.
   * Menghapus tumpukan emoji dan menggantinya dengan label teks ikonik terstruktur.

4. **Karakter & Hewan Voxel Chibi:**
   * Avatar pemain bergaya voxel kotak mini dengan animasi kaki mengayun khas Crossy Road.
   * Hewan dan umpan makanan dimodelkan dengan kubus voxel proporsional.
   * Radar peta disederhanakan menjadi grid piksel CRT retro.

Pembaruan besar ini merombak simulator menjadi **Open World 3D nyata**:

1. **Kontrol Karakter Bebas (Free Movement & Third-Person Camera):**
   * **[W, A, S, D] / Arrow Keys:** Bergerak bebas ke segala arah di dunia 3D.
   * **[SHIFT]:** Sprint (berlari cepat dengan sistem konsumsi Stamina).
   * **[Mouse Kanan / Klik Geser]:** Mengatur rotasi sudut pandang kamera (*Orbit Camera Yaw & Pitch*).
   * **Animasi Kaki & Tangan R6:** Tangan dan kaki mengayun secara dinamis saat berjalan maupun berlari.

2. **Mini-Map Radar Real-time:**
   * Radar melingkar di pojok kanan atas layar dengan scan rotasi player.
   * Menampilkan titik-titik lokasi penting:
     * 🟠 **Titik Oranye:** Garis Lempar (*Throw Pad*).
     * 🔵 **Titik Biru:** Gym Pull-up.
     * 🟡 **Titik Kuning:** Booth Master Game NPC.
     * 🟢 **Titik Hijau:** Kandang Plot Hewan Pemain.
     * ⚪ **Jalur Putih:** Runway lintasan lempar stud.

3. **Mekanik Lemparan Lebih Sulit (Higher Difficulty & Physics):**
   * **Sistem Angin Dinamis (Wind Speed & Direction):**
     * Kecepatan angin berubah setiap beberapa detik (0–12 m/s).
     * *Tailwind (Dorong)* memberi jarak bonus, sedangkan *Headwind (Lawan)* menahan jarak lemparan makanan hingga berkurang drastis.
     * Kecepatan jarum *Throw Meter* berosilasi lebih cepat dan tidak menentu sesuai kekuatan angin.
   * **Sistem Stamina:**
     * Melempar makanan membutuhkan stamina fisik (-25% stamina). Jika karakter kehabisan stamina, jarak lemparan terkena penalti hingga 50%.
     * Berlari cepat (*Sprint*) juga menguras stamina.

4. **Sistem Deteksi Interaksi Stasiun Dunia (Interactive Proximity Prompts):**
   * Saat avatar mendekati stasiun tertentu di map, muncul balon prompt aksi:
     * Berada di **Throw Line:** Tekan **[SPASI]** untuk langsung melempar makanan.
     * Berada di **Gym Pull-Up:** Tekan **[E]** untuk memulai latihan pull-up.
     * Berada di **Master NPC Booth:** Jual hewan tangkapan.
     * Berada di **Player Base Plot:** Melihat hewan-hewan 3D hidup di kandang.
* **Bugfix (Fixed):** Memperbaiki missing import `RARITY_COLORS` pada `roblox3D.js` yang sebelumnya memicu `ReferenceError` saat inisialisasi biome gate hewan 3D.
* **Instanced Stud Grid:** Menambahkan 400 silinder stud 3D asli di sepanjang lintasan runway agar tekstur lantai identik dengan *Roblox Baseplate*.
* **Avatar R6 Roblox Blocky 3D:**
  * Kepala kubus kuning klasik dengan stud silinder di atas kepala, serta stiker mata dan senyuman.
  * Badan biru (*Classic Blue Torso*), celana hijau (*Classic Green Legs*).
  * Animasi *idle breathing* dan animasi memegang serta melempar makanan.
* **Live 3D Base Plot Animals:**
  * Hewan yang berhasil ditangkap kini otomatis di-render sebagai model pikel/voxel 3D hidup di dalam area kandang (*Base Plot*) pemain.
  * Hewan dengan mutasi langka memancarkan cincin aura bercahaya di sekelilingnya.
* **Fitur Rebirth Prestige System (Baru):**
  * Tombol Rebirth untuk mereset uang & power demi mendapatkan pengganda permanen (+50% per Rebirth) untuk mempercepat progresi lemparan ke galaksi.
* **Tiang Pull-Up 3D Roblox:**
  * Tiang besi pipa ganda dengan billboard neon kuning `"TRAIN POWER"`.
  * Ketika mode pull-up aktif, avatar secara fisik berpindah ke bawah bar dan melakukan animasi pull-up naik-turun.
* **Lintasan Lempar (Runway Studs):**
  * Lintasan batu panjang ribuan studs dengan marka pembatas garis bahaya (*hazard stripes* kuning/hitam).
  * Tiang penanda jarak (*milestone posts*) di setiap 100 stud.
  * Base plot milik pemain dengan pagar pembatas kayu.
* **Gerbang Bioma & Patung Voxel 3D:**
  * Portal gapura 3D yang menandai pintu masuk ke zona-zona baru.
  * Patung voxel hewan 3D di samping gerbang tiap bioma.
* **Kamera Pelacak Dinamis (Dynamic Chase Camera):**
  * Kamera 3D meluncur mengejar proyektil burger/daging pikel yang berputar di udara sepanjang lintasan menuju zona pendaratan.
  * Kembali secara mulus (*smooth lerp*) ke posisi karakter setelah makanan mendarat.

---

### 2. Mekanik Gameplay Inti (Core Mechanics)

| Fitur | Status | Detail Implementasi |
| :--- | :---: | :--- |
| **Throw Food (Lempar Makanan)** | ✅ Selesai | Mekanik meteran presisi (skala 0–20). Klik tombol saat jarum di angka 20 untuk lemparan jarak terjauh. |
| **AFK Pull-up Training** | ✅ Selesai | Menambah stat *Throw Power* secara otomatis tiap detik. Karakter beranimasi pull-up di tiang bar. |
| **Simpan Hewan (Base Plot)** | ✅ Selesai | Hewan tertangkap ditempatkan di plot kandang dan menghasilkan *Cash Per Second* (CPS) pasif. |
| **Jual Hewan ke Master NPC** | ✅ Selesai | Jual satuan atau jual semua hewan langsung ke Master Game NPC untuk mendapatkan koin instan. Auto-sell aktif jika kandang penuh. |
| **Upgrade Level Pull-up** | ✅ Selesai | Meningkatkan perolehan power per detik dengan skala biaya eksponensial. |
| **Perluas Kandang (Base Expansion)**| ✅ Selesai | Menambah kapasitas slot penyimpanan hewan di plot. |
| **Upgrade Tier Makanan (Bait)** | ✅ Selesai | 7 Tingkatan makanan dari Wortel ($0) hingga Kue Bintang Galaksi ($1M) dengan pengganda keberuntungan hingga 25x. |
| **Sistem Mutasi & Keberuntungan** | ✅ Selesai | Varian mutasi: *Normal (1x)*, *Gold (1.8x)*, *Diamond (3.5x)*, *Emerald (6.0x)*, dan *Rainbow (12.0x)* + efek partikel confetti. |
| **Indeks Hewan Tiap Zona (Bestiary)** | ✅ Selesai | Modal interaktif untuk melacak koleksi spesies hewan dan mutasi yang telah dibuka dari 5 bioma. |
| **Leaderboard Global** | ✅ Selesai | Melacak 3 kategori: *Tangkapan Terbanyak*, *Total Uang Terkumpul*, dan *Tangkapan Paling Beruntung*. |
| **Audio Synthesizer FX** | ✅ Selesai | Web Audio API tanpa aset eksternal (sound pop, lemparan, jingle gacha, dan suara koin). |
| **Auto-Save System** | ✅ Selesai | Progres uang, kekuatan, level upgrade, dan isi kandang otomatis tersimpan di `localStorage`. |

---

## 🗺️ 3. Daftar Zona & Bioma yang Tersedia

1. **Backyard Forest** (0 – 800 studs): Kelinci Putih, Tupai Cincang, Landak Mini, Rusa Emas.
2. **Sunny Savanna** (801 – 2,500 studs): Zebra Liar, Jerapah Tutul, Kanguru Petinju, Raja Singa.
3. **Red Desert Dunes** (2,501 – 6,000 studs): Unta Gurun, Kalajengking Bara, Rubah Fennec, Kobra Mahkota.
4. **Frozen Glacier** (6,001 – 14,000 studs): Pinguin Seluncur, Anjing Laut, Beruang Es Raksasa, Mammoth Purba.
5. **Mythic Galaxy Rift** (14,001 – 50,000 studs): Kucing Nebula, Paus Kosmik, Burung Phoenix Surya, Naga Bintang Keabadian.

---

## 📂 4. Struktur File Proyek

```
web-game/
├── index.html              # Entry point HTML & font
├── vite.config.js          # Konfigurasi Vite & Tailwind
├── package.json            # Dependensi (three, canvas-confetti, tailwindcss)
├── src/
│   ├── main.js             # Kontroler UI, event binding & loop utama
│   ├── roblox3D.js         # Three.js 3D Voxel Engine (Avatar R6, Lintasan, Bar Pull-up, Kamera)
│   ├── gameState.js        # State management & LocalStorage save/load
│   ├── gameData.js         # Konfigurasi 5 bioma, hewan, makanan & mutasi
│   ├── audio.js            # Synthesizer Web Audio API
│   └── style.css           # Styling Roblox UI buttons, studs, dan panel
└── dist/                   # Production build siap deploy
```
