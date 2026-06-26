// Generator teka-teki silang dari bank kata.
// Menyusun kata-kata yang saling bersilang secara acak, lalu mengembalikan
// grid + daftar pertanyaan mendatar/menurun yang siap dirender.
import { shuffle } from "./utils.js";

const DIRS = { across: [0, 1], down: [1, 0] };

// Cek apakah `word` boleh diletakkan mulai (r,c) ke arah `dir`.
// Mengembalikan jumlah persilangan, atau null jika tidak valid.
function canPlace(grid, word, r, c, dir){
  const [dr, dc] = DIRS[dir];
  const len = word.length;
  // Sel tepat sebelum & sesudah kata harus kosong (agar tidak menyatu kata lain).
  if(grid.has((r - dr) + "," + (c - dc))) return null;
  if(grid.has((r + dr * len) + "," + (c + dc * len))) return null;

  let crossings = 0;
  const pr = dc, pc = dr; // arah tegak lurus
  for(let i = 0; i < len; i++){
    const rr = r + dr * i, cc = c + dc * i;
    const cur = grid.get(rr + "," + cc);
    if(cur){
      if(cur !== word[i]) return null;   // bentrok huruf
      crossings++;                       // titik silang
    }else{
      // Sel baru: tetangga tegak lurus harus kosong (hindari kata sejajar nempel).
      if(grid.has((rr + pr) + "," + (cc + pc))) return null;
      if(grid.has((rr - pr) + "," + (cc - pc))) return null;
    }
  }
  return crossings;
}

function placeWord(grid, placed, entry, r, c, dir){
  const [dr, dc] = DIRS[dir];
  const cells = [];
  for(let i = 0; i < entry.a.length; i++){
    const rr = r + dr * i, cc = c + dc * i;
    grid.set(rr + "," + cc, entry.a[i]);
    cells.push([rr, cc]);
  }
  placed.push({ entry, dir, cells });
}

// Coba sisipkan satu kata dengan menyilang kata yang sudah ada.
function tryPlace(grid, placed, entry){
  const word = entry.a;
  const candidates = [];
  for(let j = 0; j < word.length; j++){
    for(const p of placed){
      for(let k = 0; k < p.entry.a.length; k++){
        if(p.entry.a[k] !== word[j]) continue;
        const dir = p.dir === "across" ? "down" : "across";
        const [dr, dc] = DIRS[dir];
        const [cr, cc] = p.cells[k];
        const r = cr - dr * j, c = cc - dc * j;
        const cross = canPlace(grid, word, r, c, dir);
        if(cross !== null && cross >= 1) candidates.push({ r, c, dir, score: cross });
      }
    }
  }
  if(!candidates.length) return false;
  candidates.sort((a, b) => b.score - a.score);
  const pick = candidates[0];
  placeWord(grid, placed, entry, pick.r, pick.c, pick.dir);
  return true;
}

function buildOne(pool, target){
  const words = shuffle(pool).slice(0, Math.min(pool.length, target * 4))
                             .sort((a, b) => b.a.length - a.a.length);
  if(!words.length) return null;
  const grid = new Map(), placed = [];
  placeWord(grid, placed, words[0], 0, 0, "across");
  let changed = true;
  while(placed.length < target && changed){
    changed = false;
    for(const w of words){
      if(placed.length >= target) break;
      if(placed.some(p => p.entry === w)) continue;
      if(tryPlace(grid, placed, w)) changed = true;
    }
  }
  return { grid, placed };
}

function finalize({ grid, placed }){
  let minR = Infinity, minC = Infinity, maxR = -Infinity, maxC = -Infinity;
  for(const key of grid.keys()){
    const [r, c] = key.split(",").map(Number);
    if(r < minR) minR = r; if(c < minC) minC = c;
    if(r > maxR) maxR = r; if(c > maxC) maxC = c;
  }
  const rows = maxR - minR + 1, cols = maxC - minC + 1;
  const solution = Array.from({ length: rows }, () => Array(cols).fill(null));
  for(const [key, ch] of grid){
    const [r, c] = key.split(",").map(Number);
    solution[r - minR][c - minC] = ch;
  }
  placed.forEach(p => { p.cells = p.cells.map(([r, c]) => [r - minR, c - minC]); });

  // Penomoran sel awal kata (kiri-atas ke kanan-bawah).
  const numbers = {}; let n = 0;
  for(let r = 0; r < rows; r++){
    for(let c = 0; c < cols; c++){
      if(!solution[r][c]) continue;
      const startA = (c === 0 || !solution[r][c - 1]) && (c + 1 < cols && solution[r][c + 1]);
      const startD = (r === 0 || !solution[r - 1][c]) && (r + 1 < rows && solution[r + 1][c]);
      if(startA || startD) numbers[r + "," + c] = ++n;
    }
  }
  const across = [], down = [];
  placed.forEach(p => {
    const [sr, sc] = p.cells[0];
    const obj = { num: numbers[sr + "," + sc], clue: p.entry.q, answer: p.entry.a, cells: p.cells };
    (p.dir === "across" ? across : down).push(obj);
  });
  across.sort((a, b) => a.num - b.num);
  down.sort((a, b) => a.num - b.num);
  return { rows, cols, solution, numbers, across, down, count: placed.length };
}

// API utama. opts = { count, min, max }
export function generate(bank, opts){
  const pool = bank.filter(e => /^[A-Z]+$/.test(e.a) && e.a.length >= opts.min && e.a.length <= opts.max);
  let best = null;
  for(let attempt = 0; attempt < 80; attempt++){
    const res = buildOne(pool, opts.count);
    if(res && (!best || res.placed.length > best.placed.length)){
      best = res;
      if(best.placed.length >= opts.count) break;
    }
  }
  return best ? finalize(best) : null;
}
