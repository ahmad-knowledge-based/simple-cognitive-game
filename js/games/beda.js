// Game Cari yang Beda — varian (1 beda / 2 beda) + tingkat (ukuran grid).
import { el, randInt, shuffle, chipRow } from "../core/utils.js";
import { sGood, sSoft, sWin } from "../core/audio.js";
import { BEDA_SETS } from "../data/beda-sets.js";

export const meta = { id: "beda", title: "Cari yang Beda", emoji: "🔍", desc: "Temukan gambar yang berbeda." };

const VARIANT_OPTS = [{ value: 1, label: "Cari 1 beda" }, { value: 2, label: "Cari 2 beda" }];
const LEVELS = [2, 3, 4, 5, 6]; // ukuran grid n x n

export function mount(root){
  let diffCount = 1, level = 0;
  let remaining = 0;

  const variantCtrl = chipRow("Tantangan", VARIANT_OPTS, diffCount, v => { diffCount = v; newRound(); });
  const levelCtrl = chipRow("Tingkat", LEVELS.map((n, i) => ({ value: i, label: `${n}×${n}` })), level,
    v => { level = v; newRound(); });
  const status = el("div", { class: "status" });
  const grid = el("div", { class: "beda-grid" });
  const again = el("button", { class: "btn ghost", text: "Soal Lain", onClick: newRound });

  root.append(variantCtrl.el, levelCtrl.el, status, grid, el("div", { class: "actions" }, again));

  function newRound(){
    const n = LEVELS[level];
    const total = n * n;
    const wanted = Math.min(diffCount, total - 1);
    remaining = wanted;
    status.className = "status";
    status.textContent = wanted === 1
      ? "Satu gambar berbeda. Sentuh gambar itu."
      : `Ada ${wanted} gambar yang berbeda. Temukan keduanya.`;

    const set = BEDA_SETS[randInt(BEDA_SETS.length)];
    const diffIdx = new Set(shuffle([...Array(total).keys()]).slice(0, wanted));

    grid.style.gridTemplateColumns = `repeat(${n},minmax(0,1fr))`;
    grid.style.maxWidth = (n * 84) + "px";
    grid.innerHTML = "";
    for(let i = 0; i < total; i++){
      const isDiff = diffIdx.has(i);
      const c = el("button", { class: "icell", "aria-label": "Gambar", text: isDiff ? set.diff : set.base });
      c.addEventListener("click", () => tap(c, isDiff));
      grid.append(c);
    }
  }

  function tap(c, isDiff){
    if(c.classList.contains("right")) return;
    if(isDiff){
      c.classList.add("right"); sGood();
      remaining--;
      if(remaining > 0){
        status.className = "status";
        status.textContent = `Bagus! Tinggal ${remaining} lagi 👍`;
      }else{
        win();
      }
    }else{
      c.classList.add("wrong"); sSoft();
      status.className = "status soft";
      status.textContent = "Belum, coba lihat lagi ya 😊";
      setTimeout(() => c.classList.remove("wrong"), 600);
    }
  }

  function win(){
    sWin();
    if(level < LEVELS.length - 1){
      status.className = "status";
      status.textContent = "Tepat sekali! Lanjut ke tingkat berikutnya 🎉";
      level++;
      levelCtrl.setActive(level);
      setTimeout(newRound, 1300);
    }else{
      status.textContent = "Hebat! Semua tingkat selesai 🏆";
    }
  }

  newRound();
  return { unmount(){} };
}
