// ==========================================================
// Pokemon Demo — script.js (versi elegan + responsif + komentar detail)
// ==========================================================
// Catatan umum format komentar di file ini:
// - Baris yang diawali "=== ..." → judul bagian besar (section).
// - Komentar di atas fungsi menjelaskan apa yang dilakukan fungsi tsb,
//   argumen apa saja yang dipakai, dan nilai balikan (jika ada).
// - Komentar di dalam fungsi menjelaskan langkah-langkah penting.
// ==========================================================


// === KONFIGURASI DASAR API & STATE UI ===

// Base URL untuk PokeAPI; semua fetch akan relative ke ini.
const API_BASE = 'https://pokeapi.co/api/v2';

// Variabel untuk pagination dan status loading list utama.
let limit = 20, offset = 0, loading = false;

// Cache untuk menyimpan respons API agar tidak fetch berulang.
// - cache       : menyimpan data detail pokemon (by name & id).
// - speciesCache: menyimpan data species (by name & id).
const cache = new Map();
const speciesCache = new Map();

// Ambil referensi elemen UI yang sering dipakai.
const errorEl  = document.getElementById('error');
const grid     = document.getElementById('grid');
const spinner  = document.getElementById('spinner');
const prevBtn  = document.getElementById('prev');
const nextBtn  = document.getElementById('next');
const input    = document.getElementById('search');


// === UTILITAS UI SEDERHANA (ERROR, SPINNER, RENDER GRID) ===

// Tampilkan pesan error (mengisi teks & menonaktifkan d-none).
const showError = (m) => { errorEl.textContent = m; errorEl.classList.remove('d-none'); };

// Sembunyikan pesan error & kosongkan teksnya.
const clearError = () => { errorEl.classList.add('d-none'); errorEl.textContent = ''; };

// Render daftar kartu pokemon: items (array) → HTML string via card(p).
function renderList(items){ grid.innerHTML = items.map(card).join(''); }

// Tampilkan/sembunyikan spinner loading kecil di atas grid.
const showSpinner = (on) => spinner.classList.toggle('d-none', !on);



// ==========================================================
// === BAGIAN API: AMBIL DATA POKEMON & SPESIES =============
// ==========================================================

// getPokemon(key)
// - Mengambil detail pokemon berdasarkan nama atau id (boleh string/number).
// - Menggunakan cache agar lebih hemat request.
// - Return: objek detail pokemon (JSON dari PokeAPI).
async function getPokemon(key) {
  // Normalisasi key ke lowercase string (aman untuk name ataupun id).
  key = String(key).toLowerCase().trim();

  // Jika sudah ada di cache, langsung pakai (hindari fetch ulang).
  if (cache.has(key)) return cache.get(key);

  // Fetch detail pokemon dari API.
  const r = await fetch(`${API_BASE}/pokemon/${encodeURIComponent(key)}`);
  if (!r.ok) throw new Error('HTTP ' + r.status);

  // Parse JSON & simpan ke cache by name & by id (dua kunci).
  const d = await r.json();
  cache.set(key, d);
  cache.set(String(d.id), d);
  return d;
}

// getSpecies(key)
// - Mengambil data species (warna, habitat, evolution chain, varieties, dst).
// - Key boleh nama atau id; disimpan di speciesCache untuk hemat request.
// - Return: objek species.
async function getSpecies(key) {
  const norm = String(key).toLowerCase().trim();
  if (speciesCache.has(norm)) return speciesCache.get(norm);

  const r = await fetch(`${API_BASE}/pokemon-species/${encodeURIComponent(norm)}`);
  if (!r.ok) throw new Error('HTTP ' + r.status);

  const d = await r.json();
  speciesCache.set(norm, d);
  speciesCache.set(String(d.id), d);
  return d;
}



// ==========================================================
// === WARNA DASAR & PALET ELEGAN (BERDASAR SPECIES.COLOR) ==
// ==========================================================

// Peta warna bawaan PokeAPI (10 warna). Ini jadi anchor color tiap species.
const COLOR_MAP = {
  black:'#2b2b2b', blue:'#3b82f6', brown:'#8b5e3c', gray:'#6b7280',
  green:'#22c55e', pink:'#ec4899', purple:'#8b5cf6', red:'#ef4444',
  white:'#e5e7eb', yellow:'#f59e0b',
};

// Helper singkat: ambil hex untuk nama warna species; fallback abu-abu.
const colorHex = (name) => COLOR_MAP[name?.toLowerCase()] || '#6b7280';

// makeElegantPalette(baseHex)
// - Membangun 4 warna turunan (soft, strong, accent, accentBorder) dari warna species.
// - Tujuannya bikin tampilan lebih elegan (kurangi saturasi, atur lightness).
function makeElegantPalette(baseHex) {
  // Konversi antar format warna (RGB ↔ HSL) + util mix.
  const toRGB = (hex) => {
    const s = String(hex||'').replace('#','').trim();
    const n = (s.length===3 ? s.split('').map(c=>c+c).join('') : s);
    const v = parseInt(n,16); if (Number.isNaN(v) || n.length!==6) return {r:75,g:85,b:99};
    return { r:(v>>16)&255, g:(v>>8)&255, b:v&255 };
  };
  const fromRGB = (r,g,b)=>`#${[r,g,b].map(v=>Math.max(0,Math.min(255,v|0)).toString(16).padStart(2,'0')).join('')}`;
  const rgb2hsl = ({r,g,b})=>{
    r/=255; g/=255; b/=255;
    const max=Math.max(r,g,b), min=Math.min(r,g,b);
    let h,s,l=(max+min)/2;
    if(max===min){ h=s=0; }
    else{
      const d=max-min;
      s = l>0.5 ? d/(2-max-min) : d/(max+min);
      switch(max){
        case r: h=(g-b)/d+(g<b?6:0); break;
        case g: h=(b-r)/d+2; break;
        case b: h=(r-g)/d+4; break;
      }
      h/=6;
    }
    return {h,s,l};
  };
  const hsl2rgb = ({h,s,l})=>{
    const hue2rgb=(p,q,t)=>{
      if(t<0) t+=1; if(t>1) t-=1;
      if(t<1/6) return p+(q-p)*6*t;
      if(t<1/2) return q;
      if(t<2/3) return p+(q-p)*(2/3 - t)*6;
      return p;
    };
    let r,g,b;
    if(s===0){ r=g=b=l; }
    else{
      const q = l<0.5 ? l*(1+s) : l+s - l*s;
      const p = 2*l - q;
      r = hue2rgb(p,q,h+1/3);
      g = hue2rgb(p,q,h);
      b = hue2rgb(p,q,h-1/3);
    }
    return {r:Math.round(r*255), g:Math.round(g*255), b:Math.round(b*255)};
  };
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const mix=(hex1, hex2, t=0.5)=>{
    const toRGB2 = (hex) => {
      const s = String(hex||'').replace('#','').trim();
      const n = (s.length===3 ? s.split('').map(c=>c+c).join('') : s);
      const v = parseInt(n,16); if (Number.isNaN(v) || n.length!==6) return {r:148,g:163,b:184};
      return { r:(v>>16)&255, g:(v>>8)&255, b:v&255 };
    };
    const a=toRGB2(hex1), b=toRGB2(hex2);
    const toHex=(v)=>Math.max(0,Math.min(255,v|0)).toString(16).padStart(2,'0');
    return `#${toHex(a.r+(b.r-a.r)*t)}${toHex(a.g+(b.g-a.g)*t)}${toHex(a.b+(b.b-a.b)*t)}`;
  };

  // Konversi base → HSL lalu turunkan saturasi sedikit.
  const baseRGB = toRGB(baseHex);
  let {h,s,l} = rgb2hsl(baseRGB);
  s = clamp(s*0.72, 0, 1);

  // Bentuk dua varian: soft (lebih terang) & strong (lebih gelap).
  const softHsl   = {h, s: clamp(s*0.95,0,1), l: clamp(l*0.85 + 0.10, 0, 1)};
  const strongHsl = {h, s: clamp(s*1.05,0,1), l: clamp(l*0.65 + 0.02, 0, 1)};

  // Kembali ke RGB hex.
  const soft   = fromRGB(...Object.values(hsl2rgb(softHsl)));
  const strong = fromRGB(...Object.values(hsl2rgb(strongHsl)));

  // Accent untuk border/badge: blend dengan putih/hitam.
  const accent        = mix(baseHex, '#ffffff', 0.20);
  const accentBorder  = mix(baseHex, '#000000', 0.30);

  return { soft, strong, accent, accentBorder };
}

// applyModalTheme(hex)
// - Menulis variabel CSS pada header modal untuk tema warna.
function applyModalTheme(hex) {
  const pal = makeElegantPalette(hex);
  const header = document.querySelector('#detailModal .poke-modal-header');
  if (header){
    header.style.setProperty('--theme-soft', pal.soft);
    header.style.setProperty('--theme-strong', pal.strong);
    header.style.setProperty('--theme-accent', pal.accent);
    header.style.setProperty('--theme-accent-border', pal.accentBorder);
  }
}

// setModalBodyBackground(baseHex)
// - Mengatur background body modal (bagian isi) agar seragam
//   dengan kartu & header: ada pattern dots + gradients elegan.
function setModalBodyBackground(baseHex) {
  const pal = makeElegantPalette(baseHex);

  // Helper kecil konversi hex → rgba string.
  const toRGB = (hex) => {
    const s = String(hex||'').replace('#','').trim();
    const n = (s.length===3 ? s.split('').map(c=>c+c).join('') : s);
    const v = parseInt(n,16); if (Number.isNaN(v) || n.length!==6) return {r:43,g:43,b:43};
    return { r:(v>>16)&255, g:(v>>8)&255, b:v&255 };
  };
  const rgba = (hex,a=0.9) => {
    const c=toRGB(hex); return `rgba(${c.r},${c.g},${c.b},${Math.max(0,Math.min(1,a))})`;
  };

  // Buat pola titik halus sebagai layer paling atas.
  const dotsSize = 14;
  const dotsSVG  = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${dotsSize}' height='${dotsSize}'>
       <circle cx='${dotsSize/2}' cy='${dotsSize/2}' r='1.05' fill='white' fill-opacity='0.14'/>
     </svg>`
  );
  const pattern  = `url("data:image/svg+xml,${dotsSVG}")`;

  // Set style pada body modal.
  const body = document.querySelector('#detailModal .modal-body');
  if (!body) return;
  body.style.background = `
    ${pattern},
    radial-gradient(120% 120% at 50% 20%, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.06) 38%, rgba(255,255,255,0.00) 70%),
    radial-gradient(120% 140% at 50% 120%, rgba(0,0,0,0.22) 10%, rgba(0,0,0,0.00) 55%),
    linear-gradient(135deg, ${rgba(pal.soft,0.98)} 0%, ${rgba(pal.strong,0.98)} 100%)
  `;
  body.style.backgroundSize = `${dotsSize}px ${dotsSize}px, cover, cover, cover`;
  body.style.backgroundBlendMode = 'soft-light, screen, multiply, normal';
  body.style.borderTop = `1px solid ${rgba(pal.accentBorder,0.25)}`;
  body.style.boxShadow = `inset 0 1px 0 rgba(255,255,255,0.08)`;
}



// ==========================================================
// === UTIL RINGAN LAINNYA (BADGE, TEKS, PARSING ID) ========
// ==========================================================

// makeTypeBadge(name)
// - Membuat span badge untuk nama tipe (tampilan netral).
function makeTypeBadge(name) {
  return `<span class="badge text-capitalize bg-secondary">${name}</span>`;
}

// getFlavorText(species)
// - Ambil flavor text bahasa Inggris pertama (fallback entri pertama).
// - Menghapus karakter kontrol & newline agar rapi.
function getFlavorText(species) {
  const arr = Array.isArray(species.flavor_text_entries) ? species.flavor_text_entries : [];
  const en = arr.find(e => e.language?.name === 'en') || arr[0];
  const raw = en?.flavor_text || '';
  return raw.replace(/\f/g,' ').replace(/\n/g,' ').replace(/\s+/g,' ').trim();
}

// computeGenderRatio(gender_rate)
// - gender_rate -1 → genderless; 0..8 → female% = rate*12.5
function computeGenderRatio(gender_rate) {
  if (gender_rate === -1) return { male: '-', female: '-', note: 'Genderless' };
  const f = Math.round(gender_rate * 12.5);
  const m = 100 - f;
  return { male: `${m}%`, female: `${f}%` };
}

// speciesIdFromUrl(url)
// - Ekstrak angka id species dari URL PokeAPI.
function speciesIdFromUrl(url) {
  const m = String(url).match(/\/pokemon-species\/(\d+)\//);
  return m ? parseInt(m[1],10) : null;
}

// artworkUrlById(id)
// - URL gambar official-artwork untuk id tertentu.
function artworkUrlById(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}



// ==========================================================
// === EVOLUTION & ATRIBUT LAIN (RENDERING) =================
// ==========================================================

// fetchEvolutionChain(evoUrl)
// - Ambil seluruh rantai evolusi dan flatten jadi array urut {id,name}.
async function fetchEvolutionChain(evoUrl) {
  const r = await fetch(evoUrl);
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const chainJson = await r.json();

  // DFS ke kanan (evolves_to[]) untuk membuat list urut.
  const out = [];
  const walk = (node) => {
    const sid = speciesIdFromUrl(node?.species?.url || '');
    if (sid) out.push({ id: sid, name: node.species.name });
    (node?.evolves_to || []).forEach(walk);
  };
  walk(chainJson?.chain || {});
  return out;
}

// renderEvolutionLine(list)
// - Render deretan gambar + nama tiap tahap evolusi (dengan panah).
function renderEvolutionLine(list) {
  if (!list || !list.length) return '<div class="text-muted">No data.</div>';
  return list.map((e, i) => {
    const img = artworkUrlById(e.id);
    const arrow = i < list.length-1 ? `<span class="mx-1 text-dark">→</span>` : '';
    return `
      <div class="d-flex align-items-center gap-2">
        <img src="${img}" alt="${e.name}" width="64" height="64" loading="lazy">
        <div class="text-capitalize text-dark fw-semibold">${e.name}</div>
      </div>
      ${arrow}
    `;
  }).join('');
}

// renderHeldItems(p)
// - Menampilkan item yang dipegang (held items) dalam bentuk chip.
function renderHeldItems(p) {
  const arr = Array.isArray(p.held_items) ? p.held_items : [];
  if (!arr.length) return '-';
  return arr.map(h => h?.item?.name).filter(Boolean).map(n => `<span class="badge bg-light text-dark text-capitalize">${n}</span>`).join(' ');
}

// renderEggGroups(species)
// - Menampilkan egg groups dalam bentuk chip biru muda.
function renderEggGroups(species) {
  const arr = Array.isArray(species.egg_groups) ? species.egg_groups : [];
  if (!arr.length) return '-';
  return arr.map(g => g?.name).filter(Boolean).map(n => `<span class="badge bg-info text-capitalize">${n}</span>`).join(' ');
}



// ==========================================================
// === VARIETIES → WARNA CHIP (BERDASARKAN KEYWORD) =========
// ==========================================================

// Peta warna untuk berbagai bentuk/region/variasi. Keyword pada nama variety
// akan dicari (case-insensitive), lalu dipilih warna dominan yang cocok.
const VARIETY_COLOR_MAP = {
  // regional
  alola:'#0ea5e9', galar:'#6366f1', hisui:'#22c55e', paldea:'#ef4444', kalos:'#a78bfa', sinnoh:'#06b6d4',
  // special forms
  mega:'#a855f7', gmax:'#f59e0b', gigantamax:'#f59e0b', totem:'#f97316', primal:'#dc2626', shadow:'#475569',
  // cosmetic/alt
  female:'#ec4899', male:'#60a5fa', origin:'#14b8a6', sky:'#38bdf8', land:'#84cc16', therian:'#9333ea',
  dusk:'#f59e0b', dawn:'#f472b6', plant:'#16a34a', sandy:'#f59e0b', trash:'#ef4444',
  blue:'#3b82f6', red:'#ef4444', yellow:'#facc15', white:'#e5e7eb', black:'#111827',
  // default
  default:'#94a3b8',
};

// colorForVariety(name)
// - Menentukan warna chip variety berdasarkan prioritas keyword.
// - Jika tidak ada keyword yang match, pakai warna default abu-abu kebiruan.
function colorForVariety(name) {
  const n = String(name || '').toLowerCase();
  const priority = [
    'gigantamax','gmax','mega','totem','primal',
    'alola','galar','hisui','paldea','kalos','sinnoh',
    'origin','therian','sky','land','dusk','dawn',
    'female','male','plant','sandy','trash',
    'blue','red','yellow','white','black'
  ];
  for (const key of priority) {
    if (n.includes(key)) return VARIETY_COLOR_MAP[key];
  }
  return VARIETY_COLOR_MAP.default;
}

// chipStyles(hex)
// - Menghasilkan CSS inline untuk chip variety (gradient, border, shadow).
function chipStyles(hex) {
  const toRGB = (h) => {
    const s = String(h||'').replace('#','').trim();
    const n = (s.length===3 ? s.split('').map(c=>c+c).join('') : s);
    const v = parseInt(n,16); if (Number.isNaN(v) || n.length!==6) return {r:148,g:163,b:184};
    return { r:(v>>16)&255, g:(v>>8)&255, b:v&255 };
  };
  const rgba = (h,a)=>{ const c=toRGB(h); return `rgba(${c.r},${c.g},${c.b},${a})`; };
  const c1 = rgba(hex, 0.18);
  const c2 = rgba(hex, 0.38);
  const bd = rgba(hex, 0.55);
  const tx = '#111';
  return `
    background: linear-gradient(180deg, ${c1}, ${c2});
    border: 1px solid ${bd};
    color: ${tx};
    box-shadow: 0 1px 0 rgba(255,255,255,.6) inset, 0 6px 14px ${rgba(hex,0.18)};
  `;
}

// renderVarieties(species)
// - Render semua variety sebagai chip yang punya warna berbeda-beda.
function renderVarieties(species) {
  const vars = Array.isArray(species.varieties) ? species.varieties : [];
  if (!vars.length) return '<span class="text-muted">-</span>';

  return vars.map(v => {
    const nm  = v?.pokemon?.name || 'unknown';
    const hex = colorForVariety(nm);
    const st  = chipStyles(hex);
    return `
      <span class="badge text-capitalize"
            style="border-radius:999px; padding:.35rem .6rem; ${st}">
        ${nm.replace(/-/g,' ')}
      </span>`;
  }).join(' ');
}

// primaryVarietyHex(species)
// - Mengambil warna variety "utama" pertama yang bukan default untuk dipakai
//   sebagai aksen tambahan (mis. tema radar).
function primaryVarietyHex(species) {
  const vars = Array.isArray(species.varieties) ? species.varieties : [];
  for (const v of vars) {
    const nm = v?.pokemon?.name || '';
    const hex = colorForVariety(nm);
    if (hex !== VARIETY_COLOR_MAP.default) return hex;
  }
  return VARIETY_COLOR_MAP.default;
}



// ==========================================================
// === RADAR CHART RESPONSIF (CANVAS) =======================
// ==========================================================

// Util warna kecil untuk radar.
function _toRGB(hex) {
  const s = String(hex||'').replace('#','').trim();
  const n = (s.length===3 ? s.split('').map(c=>c+c).join('') : s);
  const v = parseInt(n,16); if (Number.isNaN(v) || n.length!==6) return {r:75,g:85,b:99};
  return { r:(v>>16)&255, g:(v>>8)&255, b:v&255 };
}
function _rgba(hex, a=1){
  const c=_toRGB(hex); return `rgba(${c.r},${c.g},${c.b},${Math.max(0,Math.min(1,a))})`;
}
function _shade(hex, amt=0){
  const c=_toRGB(hex); const t=Math.max(-1,Math.min(1,amt));
  const toHex=(v)=>Math.max(0,Math.min(255,v|0)).toString(16).padStart(2,'0');
  if (t>=0) return `#${toHex(c.r+(255-c.r)*t)}${toHex(c.g+(255-c.g)*t)}${toHex(c.b+(255-c.b)*t)}`;
  const k=1+t; return `#${toHex(c.r*k)}${toHex(c.g*k)}${toHex(c.b*k)}`;
}
function _mix(h1,h2,ratio=0.5){
  const a=_toRGB(h1), b=_toRGB(h2), t=Math.max(0,Math.min(1,ratio));
  const toHex=(v)=>Math.max(0,Math.min(255,v|0)).toString(16).padStart(2,'0');
  return `#${toHex(a.r+(b.r-a.r)*t)}${toHex(a.g+(b.g-a.g)*t)}${toHex(a.b+(b.b-a.b)*t)}`;
}

// drawRadarResponsive(canvas, stats, themeHex)
// - Menggambar radar yang mengisi wadah parent-nya dan skala dengan DPR.
// - stats urutan: [HP, Atk, Def, SpA, SpD, Spe] (0..255+).
function drawRadarResponsive(canvas, stats, themeHex='#6366f1'){
  const parent = canvas.parentElement;
  // DPR max 2 biar tidak terlalu berat tapi tetap tajam di retina.
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

  // Pakai ukuran parent sebagai acuan responsive.
  const w = Math.max(200, parent.clientWidth);
  const h = Math.max(160, parent.clientHeight);

  // Set ukuran internal canvas (pixel) dan transform agar skala pas.
  canvas.width  = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const W = w, H = h;
  const cx = W/2, cy = H/2, R = Math.min(W,H)*0.36;

  // Warna tema untuk garis & area radar (turunan dari themeHex).
  const base   = themeHex;
  const cLine  = _rgba(_shade(base, -0.10), 0.90);
  const cGrid  = 'rgba(0,0,0,.12)';
  const cAxis  = 'rgba(0,0,0,.18)';
  const cText  = '#111';

  // Konfigurasi label, batas nilai, dan sudut tiap sumbu (6 sisi).
  const labels = ['HP','Atk','Def','SpA','SpD','Spe'];
  const maxVal = 255;
  const angs   = Array.from({length:6}, (_,i)=> -Math.PI/2 + i*(Math.PI*2/6));

  // Background radial lembut agar tampak "hidup".
  const rg = ctx.createRadialGradient(cx, cy, R*0.2, cx, cy, R*1.1);
  rg.addColorStop(0, _rgba(_shade(base,+0.35), 0.10));
  rg.addColorStop(1, 'rgba(255,255,255,0.0)');
  ctx.fillStyle = rg;
  ctx.fillRect(0,0,W,H);

  // Grid polygon konsentris (3 cincin).
  ctx.strokeStyle = cGrid;
  ctx.lineWidth = 1;
  [0.33, 0.66, 1].forEach(f => {
    ctx.beginPath();
    angs.forEach((a, i) => {
      const x = cx + Math.cos(a)*R*f;
      const y = cy + Math.sin(a)*R*f;
      (i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
    });
    ctx.closePath(); ctx.stroke();
  });

  // Garis sumbu dari pusat ke tiap sudut.
  ctx.strokeStyle = cAxis;
  angs.forEach(a => {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a)*R, cy + Math.sin(a)*R);
    ctx.stroke();
  });

  // Label di ujung sumbu (posisi dinamis mengikuti sudut).
  ctx.fillStyle = cText;
  ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, Arial';
  labels.forEach((lb, i) => {
    const a = angs[i];
    const x = cx + Math.cos(a)*(R+12);
    const y = cy + Math.sin(a)*(R+12);
    ctx.textAlign = (Math.cos(a)>0.2) ? 'left' : (Math.cos(a)<-0.2 ? 'right' : 'center');
    ctx.textBaseline = (Math.sin(a)>0.2) ? 'top' : (Math.sin(a)<-0.2 ? 'bottom' : 'middle');
    ctx.fillText(lb, x, y);
  });

  // Hitung titik polygon berdasarkan stats/maxVal.
  const pts = stats.map((v,i) => {
    const f = Math.max(0, Math.min(1, v/maxVal));
    const a = angs[i];
    return [ cx + Math.cos(a)*R*f, cy + Math.sin(a)*R*f ];
  });

  // Fill polygon pakai radial gradient halus + stroke dengan cLine.
  const pg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
  pg.addColorStop(0, _rgba(_shade(base, +0.25), 0.28));
  pg.addColorStop(1, _rgba(_shade(base, -0.05), 0.12));
  ctx.fillStyle = pg;
  ctx.strokeStyle = cLine;
  ctx.lineWidth = 2;

  ctx.beginPath();
  pts.forEach(([x,y],i)=> i?ctx.lineTo(x,y):ctx.moveTo(x,y));
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // Titik-titik pada vertex agar lebih informatif.
  ctx.fillStyle = _rgba(_shade(base, -0.05), 0.85);
  pts.forEach(([x,y])=>{
    ctx.beginPath(); ctx.arc(x,y,3.5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x,y,6,0,Math.PI*2);
    ctx.strokeStyle=_rgba(_shade(base,+0.40),0.3); ctx.stroke();
  });
}

// mountResponsiveRadar(canvasId, stats, themeHex)
// - Menyimpan state radar per-canvas dan memasang ResizeObserver
//   agar otomatis redraw saat ukuran wadah berubah (responsif).
const _radarState = new Map(); // id → { stats, theme }
function mountResponsiveRadar(canvasId, stats, themeHex){
  const cvs = document.getElementById(canvasId);
  if(!cvs) return;

  _radarState.set(canvasId, { stats, themeHex });

  const redraw = () => {
    const st = _radarState.get(canvasId);
    if (st) drawRadarResponsive(cvs, st.stats, st.themeHex);
  };

  // Gambar pertama kali.
  redraw();

  // Pasang observer sekali per canvas agar responsive.
  if (!cvs._ro){
    const ro = new ResizeObserver(redraw);
    ro.observe(cvs.parentElement || cvs);
    cvs._ro = ro;
  }
}



// ==========================================================
// === MODAL DETAIL: BUKA & ISI KONTEN ======================
// ==========================================================

// openDetail(key)
// - Dibuka saat klik tombol "Detail" pada kartu.
// - Mengisi semua field modal: gambar, tipe, habitat, egg/held/varieties,
//   deskripsi, evolution line, dan radar stats responsif.
async function openDetail(key) {
  try {
    // Siapkan modal: set state "Loading..." agar terasa responsif.
    const modal = new bootstrap.Modal(document.getElementById('detailModal'));
    document.getElementById('dm-title').textContent = 'Loading...';
    document.getElementById('dm-img').src = '';
    document.getElementById('dm-types').innerHTML = '';
    document.getElementById('dm-habitat').textContent = '-';
    document.getElementById('dm-height').textContent = '-';
    document.getElementById('dm-weight').textContent = '-';
    document.getElementById('dm-eggs').textContent = '-';
    document.getElementById('dm-held').textContent = '-';
    document.getElementById('dm-var').innerHTML = '';
    document.getElementById('dm-desc').textContent = '-';
    document.getElementById('dm-evo').innerHTML = '<span class="text-muted">Loading...</span>';
    modal.show();

    // Ambil detail pokemon & species paralel-ish.
    const p  = await getPokemon(key);
    const sp = await getSpecies(p.id);

    // Tema warna: species.color → header & body modal.
    const bgHex = colorHex(sp.color?.name);
    applyModalTheme(bgHex);
    setModalBodyBackground(bgHex);

    // Judul + gambar header.
    const pid = p.id != null ? String(p.id).padStart(3,'0') : '---';
    document.getElementById('dm-title').textContent = `#${pid} ${p.name}`;
    const img = p.sprites.other?.['official-artwork']?.front_default
             || p.sprites.other?.home?.front_default
             || p.sprites.front_default || '';
    const imgEl = document.getElementById('dm-img');
    imgEl.src = img; imgEl.alt = p.name;

    // Types badge.
    document.getElementById('dm-types').innerHTML =
      (p.types||[]).map(t => makeTypeBadge(t?.type?.name || 'unknown')).join(' ');

    // Habitat (rapikan strip → spasi).
    document.getElementById('dm-habitat').textContent =
      sp.habitat?.name ? sp.habitat.name.replace(/-/g,' ') : '-';

    // Tinggi/berat dalam satuan metrik (m/kg).
    const heightM = (p.height != null) ? (p.height/10).toFixed(1) + ' m' : '-';
    const weightKg= (p.weight != null) ? (p.weight/10).toFixed(1) + ' kg' : '-';
    document.getElementById('dm-height').textContent = heightM;
    document.getElementById('dm-weight').textContent = weightKg;

    // Bagian chips & deskripsi.
    document.getElementById('dm-eggs').innerHTML = renderEggGroups(sp);
    document.getElementById('dm-held').innerHTML = renderHeldItems(p);
    document.getElementById('dm-var').innerHTML  = renderVarieties(sp);
    document.getElementById('dm-desc').textContent = getFlavorText(sp) || '-';

    // Gender ratio.
    const gr = computeGenderRatio(sp.gender_rate);
    document.getElementById('dm-gender-m').textContent = gr.male;
    document.getElementById('dm-gender-f').textContent = gr.female;

    // Evolution line (handle error/fallback).
    if (sp.evolution_chain?.url) {
      try {
        const evoList = await fetchEvolutionChain(sp.evolution_chain.url);
        document.getElementById('dm-evo').innerHTML = renderEvolutionLine(evoList);
      } catch {
        document.getElementById('dm-evo').innerHTML = '<span class="text-muted">No data.</span>';
      }
    } else {
      document.getElementById('dm-evo').innerHTML = '<span class="text-muted">No data.</span>';
    }

    // Radar stats: urut [HP, Atk, Def, SpA, SpD, Spe].
    const findStat = (name) => (p.stats||[]).find(s => (s.stat?.name||'')===name)?.base_stat ?? 0;
    const stats = [
      findStat('hp'),
      findStat('attack'),
      findStat('defense'),
      findStat('special-attack'),
      findStat('special-defense'),
      findStat('speed'),
    ];

    // Tema radar = campuran warna species & warna variety "utama".
    const themeSpecies = bgHex;
    const themeVar     = primaryVarietyHex(sp);
    const themeMix     = _mix(themeSpecies, themeVar, 0.45); // 45% variety, 55% species

    // Gambar radar & buat responsif.
    mountResponsiveRadar('dm-stats', stats, themeMix);

  } catch (err) {
    // Jika ada masalah fetch/parsing, tampilkan error sederhana di modal.
    document.getElementById('dm-title').textContent = 'Error';
    document.getElementById('dm-desc').textContent = 'Gagal memuat detail.';
  }
}



// ==========================================================
// === RENDER KARTU GRID (LIST) =============================
// ==========================================================

// card(p)
// - Menghasilkan HTML satu kartu pokemon untuk grid.
// - Background kartu memakai gradient & pola titik berdasarkan warna species.
function card(p) {
  // Pilih gambar terbaik yang tersedia (official-artwork > home > default).
  const img = p.sprites.other?.['official-artwork']?.front_default
           || p.sprites.other?.home?.front_default
           || p.sprites.front_default || '';

  // Warna dasar diambil dari properti _bgHex (disisipkan saat fetch list/search).
  const base = p._bgHex || '#2b2b2b';

  // Util lokal untuk manipulasi warna ala quick & ringan.
  const toRGB = (hex) => {
    const s = String(hex||'').replace('#','').trim();
    const n = (s.length===3 ? s.split('').map(c=>c+c).join('') : s);
    const v = parseInt(n,16); if (Number.isNaN(v) || n.length!==6) return {r:43,g:43,b:43};
    return { r:(v>>16)&255, g:(v>>8)&255, b:v&255 };
  };
  const toHex = (r,g,b) => {
    const h = (v)=>Math.max(0,Math.min(255,v|0)).toString(16).padStart(2,'0');
    return `#${h(r)}${h(g)}${h(b)}`;
  };
  const shade = (hex, amt=0) => {
    const c=toRGB(hex); const t=Math.max(-1,Math.min(1,amt));
    if (t>=0) return toHex(c.r+(255-c.r)*t, c.g+(255-c.g)*t, c.b+(255-c.b)*t);
    const k = 1+t; return toHex(c.r*k, c.g*k, c.b*k);
  };
  const rgba = (hex,a=0.9) => {
    const c=toRGB(hex); return `rgba(${c.r},${c.g},${c.b},${Math.max(0,Math.min(1,a))})`;
  };

  // Dua shade dari warna species + pola titik halus.
  const cLight   = rgba(shade(base, +0.28), 0.96);
  const cDark    = rgba(shade(base, -0.16), 0.96);
  const dotsSize = 14;
  const dotsSVG  = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${dotsSize}' height='${dotsSize}'>
       <circle cx='${dotsSize/2}' cy='${dotsSize/2}' r='1.1' fill='white' fill-opacity='0.16'/>
     </svg>`
  );
  const pattern  = `url("data:image/svg+xml,${dotsSVG}")`;

  // Warna aksen untuk badge type (peta TYPE_COLOR).
  const TYPE_COLOR = {
    normal:'#A8A77A', fire:'#EE8130', water:'#6390F0', electric:'#F7D02C',
    grass:'#7AC74C', ice:'#96D9D6', fighting:'#C22E28', poison:'#A33EA1',
    ground:'#E2BF65', flying:'#A98FF3', psychic:'#F95587', bug:'#A6B91A',
    rock:'#B6A136', ghost:'#735797', dragon:'#6F35FC', dark:'#705746',
    steel:'#B7B7CE', fairy:'#D685AD'
  };
  const t0 = (p.types?.[0]?.type?.name || '').toLowerCase();
  const accent = TYPE_COLOR[t0] || '#9ca3af';

  // Beberapa info kecil untuk bar mini (tinggi/berat).
  const pid     = p.id != null ? String(p.id).padStart(3,'0') : '---';
  const heightM = (p.height != null) ? (p.height/10).toFixed(1) : '-';
  const weightKg= (p.weight != null) ? (p.weight/10).toFixed(1) : '-';

  // Style background 3 layer: dots + radial glow + linear gradient species.
  const bgStyle = `
    background:
      ${pattern},
      radial-gradient(120% 120% at 85% 10%,
        rgba(255,255,255,0.22) 0%,
        rgba(255,255,255,0.10) 36%,
        rgba(255,255,255,0.00) 62%),
      linear-gradient(135deg, ${cLight} 0%, ${cDark} 100%);
    background-size: ${dotsSize}px ${dotsSize}px, cover, cover;
    background-blend-mode: soft-light, screen, normal;
  `;

  // HTML kartu lengkap (header → gambar → konten → footer tombol Detail).
  return `
  <div class="col">
    <article class="poke-card card h-100 overflow-hidden"
      style="${bgStyle}; border:0; border-radius:16px;
             box-shadow: 0 10px 24px rgba(0,0,0,.28), inset 0 0 0 1px rgba(255,255,255,.06);
             transition: transform .2s ease, box-shadow .2s ease;">
      <header class="d-flex justify-content-between align-items-center px-3 mb-2 pt-3">
        <h5 class="card-title text-capitalize mb-0 text-white" style="text-shadow:0 1px 2px rgba(0,0,0,.35)">
          ${p.name}
        </h5>
        <span class="badge rounded-pill" style="
            background:${rgba(accent,0.95)};
            border:1px solid ${rgba(accent,0.7)};
            color:#fff;">#${pid}</span>
      </header>

      <div class="position-relative px-2">
        <div class="ratio ratio-1x1 mt-2 rounded-3" style="background:rgba(255,255,255,0.10);">
          ${img ? `<img alt="${p.name}" src="${img}" loading="lazy"
                   class="w-100 h-100 object-fit-contain p-3">` : ''}
        </div>
        <!-- Lapisan glossy tipis agar terlihat "berkilau" -->
        <div style="position:absolute; inset:0;
          background: linear-gradient(180deg, rgba(255,255,255,.18), rgba(255,255,255,0) 40%);
          pointer-events:none; border-radius:14px;"></div>
      </div>

      <div class="card-body pt-3 text-white">
        <!-- Chip tipe (warna border mengikuti type color) -->
        <div class="d-flex flex-wrap gap-2 mb-2">
          ${(p.types||[]).map(t => {
            const nm = (t?.type?.name||'').toLowerCase();
            const col= TYPE_COLOR[nm] || '#9ca3af';
            return `<span class="badge text-capitalize"
                      style="background:rgba(255,255,255,.16);
                             border:1px solid ${rgba(col,0.6)};
                             color:#fff;">${nm||'unknown'}</span>`;
          }).join('')}
        </div>

        <!-- Dua mini progress bar (tinggi/berat) -->
        <div class="row g-2 small opacity-95">
          <div class="col">
            <div class="d-flex justify-content-between">
              <span class="fw-semibold">Height</span>
              <span>${heightM} m</span>
            </div>
            <div class="mini-bar" style="--bar:${Math.min(1, (p.height||10)/20)}; --accent:${accent};"></div>
          </div>
          <div class="col">
            <div class="d-flex justify-content-between">
              <span class="fw-semibold">Weight</span>
              <span>${weightKg} kg</span>
            </div>
            <div class="mini-bar" style="--bar:${Math.min(1, (p.weight||100)/300)}; --accent:${accent};"></div>
          </div>
        </div>
      </div>

      <footer class="px-3 pb-3">
        <!-- Tombol buka modal detail -->
        <button class="btn btn-sm"
          onclick="openDetail(${p.id})"
          style="background:rgba(255,255,255,.16);
                 border:1px solid ${rgba(accent,0.6)};
                 color:#fff;">Detail</button>
      </footer>
    </article>
  </div>`;
}



// ==========================================================
// === PAGINATION + FETCH LIST UTAMA ========================
// ==========================================================

// Navigasi halaman: ubah offset & muat list berikut/ sebelumnya.
prevBtn?.addEventListener('click', () => { if (!loading && offset>0){ offset -= limit; fetchList(); }});
nextBtn?.addEventListener('click', () => { if (!loading){ offset += limit; fetchList(); }});

// fetchList()
// - Mengambil daftar pokemon (name+url), lalu untuk tiap item ambil detailnya.
// - Menyisipkan _bgHex ke tiap objek (dari species.color → hex) agar kartu
//   bisa mewarnai background sesuai species.
async function fetchList() {
  loading = true; showSpinner(true); clearError();
  prevBtn && (prevBtn.disabled = offset === 0);

  try {
    const r = await fetch(`${API_BASE}/pokemon?limit=${limit}&offset=${offset}`);
    const data = await r.json();

    // Ambil detail + species untuk tiap hasil agar bisa render lengkap.
    const items = await Promise.all(
      data.results.map(async (x) => {
        const p  = await getPokemon(x.name);
        const sp = await getSpecies(p.id);
        return Object.assign({}, p, { _bgHex: colorHex(sp.color?.name) });
      })
    );

    renderList(items);
    nextBtn && (nextBtn.disabled = !data.next); // disable Next jika tidak ada halaman berikut.
  } catch (e) {
    renderList([]); showError('Gagal memuat.');
  } finally {
    loading = false; showSpinner(false);
  }
}

// Mulai: load halaman pertama saat file di-load.
fetchList();



// ==========================================================
// === PENCARIAN NAMA (CLIENT-SIDE-ISH) =====================
// ==========================================================

// nameIndex akan berisi daftar semua nama pokemon (untuk filter includes()).
let nameIndex = null;

// loadNameIndex()
// - Ambil index nama pokemon dari endpoint /pokemon (halaman pertama).
//   *Catatan:* Ini hanya contoh sederhana; untuk index penuh, perlu pagination all.
async function loadNameIndex() {
  if (nameIndex) return nameIndex;
  const allData = await fetch('https://pokeapi.co/api/v2/pokemon');
  const dataJson = await allData.json();
  nameIndex = dataJson.results.map(x => x.name);
  return nameIndex;
}

// doSearch()
// - Dipanggil setiap input berubah (event 'input').
// - Jika query kosong → kembali ke fetchList() (mode normal).
// - Jika ada query → filter nameIndex dengan includes(q) lalu render hasilnya.
const doSearch = async () => {
  const q = input.value.trim().toLowerCase();

  // Tanpa query: sembunyikan error & muat list normal.
  if (!q) { clearError(); fetchList(); return; }

  showSpinner(true); clearError();

  try {
    const all = await loadNameIndex();
    const matches = all.filter(n => n.includes(q));

    // Jika tidak ada yang cocok, kosongkan grid & tampilkan pesan.
    if (matches.length === 0) {
      renderList([]);
      showError('Tidak ada hasil.');
      return;
    }

    // Ambil detail & species untuk semua match lalu render seperti biasa.
    const items = await Promise.all(
      matches.map(async (n) => {
        const p  = await getPokemon(n);
        const sp = await getSpecies(p.id);
        return Object.assign({}, p, { _bgHex: colorHex(sp.color?.name) });
      })
    );

    renderList(items);

    // Saat mode pencarian, nonaktifkan tombol pagination agar tidak rancu.
    prevBtn && (prevBtn.disabled = true);
    nextBtn && (nextBtn.disabled = true);
  } catch (e) {
    renderList([]);
    showError('Gagal memuat hasil.');
  } finally {
    showSpinner(false);
  }
};

// Pasang listener: jalankan doSearch setiap user mengetik.
input.addEventListener('input', doSearch);
