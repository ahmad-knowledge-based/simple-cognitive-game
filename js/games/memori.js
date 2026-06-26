// Game Kartu Memori — varian tema + tingkat (jumlah pasang).
import { el, shuffle, sample, chipRow } from "../core/utils.js";
import { sTap, sGood, sSoft, sWin } from "../core/audio.js";

export const meta = { id: "memori", title: "Kartu Memori", emoji: "🃏", desc: "Cocokkan pasangan gambar yang sama." };

const THEMES = {
  buah:      ["🍎","🍌","🍊","🍇","🍓","🍉","🍍","🥝","🍑","🍒"],
  hewan:     ["🐶","🐱","🐭","🐰","🦊","🐻","🐼","🐨","🦁","🐮"],
  wajah:     ["😀","😉","😍","😎","😴","😮","😆","🥰","😋","🤗"],
  kendaraan: ["🚗","🚕","🚌","🏎️","🚓","🚑","🚒","🚚","🚲","🛵"],
};
const THEME_OPTS = [
  { value: "buah", label: "🍎 Buah" }, { value: "hewan", label: "🐶 Hewan" },
  { value: "wajah", label: "😀 Wajah" }, { value: "kendaraan", label: "🚗 Kendaraan" },
];
const LEVELS = [3, 4, 6, 8, 10]; // jumlah pasang

export function mount(root){
  let theme = "buah", level = 0;
  let flipped = [], lock = false, matched = 0;

  const themeCtrl = chipRow("Tema kartu", THEME_OPTS, theme, v => { theme = v; newRound(); });
  const levelCtrl = chipRow("Tingkat", LEVELS.map((p, i) => ({ value: i, label: `${p} pasang` })), level,
    v => { level = v; newRound(); });
  const status = el("div", { class: "status" });
  const grid = el("div", { class: "mem-grid" });
  const restart = el("button", { class: "btn ghost", text: "Ulang", onClick: newRound });

  root.append(themeCtrl.el, levelCtrl.el, status, grid, el("div", { class: "actions" }, restart));

  function newRound(){
    const pairs = LEVELS[level];
    matched = 0; flipped = []; lock = false;
    status.className = "status";
    status.textContent = "Cari dua kartu yang sama.";
    const pick = sample(THEMES[theme], pairs);
    const deck = shuffle([...pick, ...pick]);
    const cols = pairs <= 3 ? 3 : (pairs <= 8 ? 4 : 5);
    grid.style.gridTemplateColumns = `repeat(${cols},minmax(0,1fr))`;
    grid.style.maxWidth = (cols * 92) + "px";
    grid.innerHTML = "";
    deck.forEach(em => {
      const b = el("button", { class: "mcard", "aria-label": "Kartu tertutup" });
      b.dataset.em = em; b.textContent = em;
      b.addEventListener("click", () => flip(b));
      grid.append(b);
    });
  }

  function flip(b){
    if(lock || b.classList.contains("matched") || b.classList.contains("flipped")) return;
    b.classList.add("flipped"); b.setAttribute("aria-label", "Kartu " + b.dataset.em);
    sTap();
    flipped.push(b);
    if(flipped.length < 2) return;
    lock = true;
    const [a, c] = flipped;
    if(a.dataset.em === c.dataset.em){
      setTimeout(() => {
        a.classList.add("matched"); c.classList.add("matched");
        flipped = []; lock = false; matched++;
        sGood();
        if(matched === LEVELS[level]) win();
      }, 420);
    }else{
      status.className = "status soft";
      status.textContent = "Belum sama, coba lagi ya 😊";
      sSoft();
      setTimeout(() => {
        a.classList.remove("flipped"); c.classList.remove("flipped");
        a.setAttribute("aria-label", "Kartu tertutup"); c.setAttribute("aria-label", "Kartu tertutup");
        flipped = []; lock = false;
        status.className = "status";
        status.textContent = "Cari dua kartu yang sama.";
      }, 900);
    }
  }

  function win(){
    sWin();
    if(level < LEVELS.length - 1){
      status.className = "status";
      status.textContent = "Hebat! Lanjut ke tingkat berikutnya 🎉";
      level++;
      levelCtrl.setActive(level);
      setTimeout(newRound, 1400);
    }else{
      status.textContent = "Luar biasa! Semua tingkat selesai 🏆";
    }
  }

  newRound();
  return { unmount(){} };
}
