// Game Teka-Teki Silang — disusun otomatis dari bank kata, dengan tingkat kesulitan.
import { el, chipRow } from "../core/utils.js";
import { sTap, sGood, sWin } from "../core/audio.js";
import { generate } from "../core/crossword.js";
import { TTS_BANK } from "../data/tts-bank.js";

export const meta = { id: "tts", title: "Teka-Teki Silang", emoji: "📝", desc: "Isi kotak dari pertanyaan yang diberikan." };

const LEVELS = [
  { label: "Mudah", count: 4,  min: 3, max: 5 },
  { label: "Sedang", count: 6, min: 3, max: 6 },
  { label: "Sulit", count: 8,  min: 3, max: 7 },
  { label: "Ahli", count: 10, min: 3, max: 8 },
];

export function mount(root){
  let level = 0;
  let puzzle = null;
  let inputs = {};        // "r,c" -> <input>
  let activeClue = null;

  const levelCtrl = chipRow("Tingkat", LEVELS.map((l, i) => ({ value: i, label: l.label })), level,
    v => { level = v; newPuzzle(); });
  const status = el("div", { class: "status" });
  const board = el("div", { class: "tts-board" });
  const checkBtn = el("button", { class: "btn", text: "Periksa Jawaban", onClick: check });
  const newBtn = el("button", { class: "btn secondary", text: "Soal Baru", onClick: newPuzzle });
  const clearBtn = el("button", { class: "btn ghost", text: "Hapus Semua", onClick: clearAll });
  const acrossHost = el("div");
  const downHost = el("div");
  const clues = el("div", { class: "clues" },
    el("h4", { text: "➡️ Mendatar" }), acrossHost,
    el("h4", { text: "⬇️ Menurun" }), downHost);

  root.append(levelCtrl.el, status, board,
    el("div", { class: "actions" }, checkBtn, newBtn, clearBtn), clues);

  function newPuzzle(){
    const cfg = LEVELS[level];
    puzzle = generate(TTS_BANK, cfg);
    activeClue = null;
    if(!puzzle){ status.textContent = "Maaf, gagal menyusun teka-teki. Coba 'Soal Baru'."; return; }
    renderBoard();
    renderClues();
    status.className = "status";
    status.textContent = "Sentuh sebuah pertanyaan di bawah, lalu isi kotaknya.";
  }

  function renderBoard(){
    board.style.gridTemplateColumns = `repeat(${puzzle.cols},minmax(0,1fr))`;
    board.style.maxWidth = Math.min(puzzle.cols * 60, 560) + "px";
    board.innerHTML = "";
    inputs = {};
    for(let r = 0; r < puzzle.rows; r++){
      for(let c = 0; c < puzzle.cols; c++){
        if(!puzzle.solution[r][c]){ board.append(el("div", { class: "tcell block" })); continue; }
        const cell = el("div", { class: "tcell" });
        const num = puzzle.numbers[r + "," + c];
        if(num) cell.append(el("span", { class: "tnum", text: num }));
        const inp = el("input", { maxlength: "1", inputmode: "text",
          "aria-label": `Kotak baris ${r + 1} kolom ${c + 1}` });
        inp.dataset.r = r; inp.dataset.c = c;
        inp.addEventListener("input", () => {
          inp.value = inp.value.toUpperCase().replace(/[^A-Z]/g, "");
          if(inp.value) sTap();
          cell.classList.remove("ok", "no");
          if(inp.value) focusNext(r, c);
        });
        inp.addEventListener("focus", () => highlightContaining(r, c));
        inp.addEventListener("keydown", e => handleKey(e, r, c, inp));
        cell.append(inp);
        board.append(cell);
        inputs[r + "," + c] = inp;
      }
    }
  }

  function renderClues(){
    const build = (list, host) => {
      host.innerHTML = "";
      list.forEach(cl => {
        const b = el("button", { class: "clue", html: `<b>${cl.num}.</b> ${cl.clue}` });
        b.addEventListener("click", () => {
          document.querySelectorAll(".clue").forEach(x => x.classList.remove("active"));
          b.classList.add("active");
          selectClue(cl);
        });
        cl._btn = b;
        host.append(b);
      });
    };
    build(puzzle.across, acrossHost);
    build(puzzle.down, downHost);
  }

  function clearHighlight(){ document.querySelectorAll(".tcell.hl").forEach(d => d.classList.remove("hl")); }

  function selectClue(cl){
    activeClue = cl;
    clearHighlight();
    cl.cells.forEach(([r, c]) => inputs[r + "," + c].parentElement.classList.add("hl"));
    const [r, c] = cl.cells[0];
    inputs[r + "," + c].focus();
  }

  function highlightContaining(r, c){
    if(activeClue && activeClue.cells.some(([rr, cc]) => rr === r && cc === c)) return;
    const all = [...puzzle.across, ...puzzle.down];
    const found = all.find(cl => cl.cells.some(([rr, cc]) => rr === r && cc === c));
    if(!found) return;
    document.querySelectorAll(".clue").forEach(x => x.classList.remove("active"));
    if(found._btn) found._btn.classList.add("active");
    activeClue = found;
    clearHighlight();
    found.cells.forEach(([rr, cc]) => inputs[rr + "," + cc].parentElement.classList.add("hl"));
  }

  function focusNext(r, c){
    if(!activeClue) return;
    const idx = activeClue.cells.findIndex(([rr, cc]) => rr === r && cc === c);
    const nxt = activeClue.cells[idx + 1];
    if(nxt) inputs[nxt[0] + "," + nxt[1]].focus();
  }

  // Cari kotak terisi berikutnya ke arah (dr,dc), lewati kotak hitam & tepi.
  function findInDir(r, c, dr, dc){
    let rr = r + dr, cc = c + dc;
    while(rr >= 0 && cc >= 0 && rr < puzzle.rows && cc < puzzle.cols){
      const inp = inputs[rr + "," + cc];
      if(inp) return inp;
      rr += dr; cc += dc;
    }
    return null;
  }
  function focusInput(inp){ if(inp){ inp.focus(); inp.select && inp.select(); } return inp; }

  function handleKey(e, r, c, inp){
    switch(e.key){
      case "ArrowRight": e.preventDefault(); focusInput(findInDir(r, c, 0, 1)); return;
      case "ArrowLeft":  e.preventDefault(); focusInput(findInDir(r, c, 0, -1)); return;
      case "ArrowDown":  e.preventDefault(); focusInput(findInDir(r, c, 1, 0)); return;
      case "ArrowUp":    e.preventDefault(); focusInput(findInDir(r, c, -1, 0)); return;
      case "Backspace":
        if(inp.value) return; // kotak ada isinya: biarkan terhapus di tempat (event 'input' membersihkan tanda)
        e.preventDefault();   // kotak kosong: mundur satu kotak lalu hapus isinya
        let prev = null;
        if(activeClue){
          const idx = activeClue.cells.findIndex(([rr, cc]) => rr === r && cc === c);
          if(idx > 0){ const [pr, pc] = activeClue.cells[idx - 1]; prev = inputs[pr + "," + pc]; }
        }
        if(!prev) prev = findInDir(r, c, 0, -1) || findInDir(r, c, -1, 0);
        if(prev){ prev.value = ""; prev.parentElement.classList.remove("ok", "no"); focusInput(prev); }
        return;
    }
  }

  function check(){
    let filled = 0, correct = 0, total = 0;
    for(let r = 0; r < puzzle.rows; r++){
      for(let c = 0; c < puzzle.cols; c++){
        const sol = puzzle.solution[r][c];
        if(!sol) continue;
        total++;
        const inp = inputs[r + "," + c], cell = inp.parentElement;
        cell.classList.remove("ok", "no");
        const v = (inp.value || "").toUpperCase();
        if(!v) continue;
        filled++;
        if(v === sol){ cell.classList.add("ok"); correct++; }
        else cell.classList.add("no");
      }
    }
    if(correct === total){ status.className = "status"; status.textContent = "Selamat! Semua jawaban benar 🏆"; sWin(); }
    else if(filled === 0){ status.className = "status soft"; status.textContent = "Isi dulu beberapa kotak ya 😊"; }
    else { status.className = "status"; status.textContent = `Benar ${correct} dari ${total} kotak. Yang hijau sudah tepat — lanjutkan! 👍`; sGood(); }
  }

  function clearAll(){
    for(const k in inputs){ inputs[k].value = ""; inputs[k].parentElement.classList.remove("ok", "no"); }
    status.className = "status";
    status.textContent = "Sudah dikosongkan. Silakan mulai lagi 😊";
  }

  newPuzzle();
  return { unmount(){} };
}
