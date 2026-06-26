// Game Ikuti Urutan (Simon) — varian jumlah pad + kecepatan.
import { el, randInt, chipRow } from "../core/utils.js";
import { beep, sGood, sSoft } from "../core/audio.js";

export const meta = { id: "simon", title: "Ikuti Urutan", emoji: "🎵", desc: "Perhatikan kilatan warna, lalu ulangi." };

const PADS = [
  { cls: "red",    shape: "●", freq: 330, label: "Merah" },
  { cls: "green",  shape: "■", freq: 392, label: "Hijau" },
  { cls: "blue",   shape: "▲", freq: 494, label: "Biru" },
  { cls: "yellow", shape: "★", freq: 587, label: "Kuning" },
  { cls: "purple", shape: "◆", freq: 659, label: "Ungu" },
  { cls: "orange", shape: "⬢", freq: 784, label: "Oranye" },
];
const COUNT_OPTS = [{ value: 4, label: "4 warna" }, { value: 6, label: "6 warna" }];
const SPEED_OPTS = [{ value: 950, label: "🐢 Santai" }, { value: 720, label: "Biasa" }, { value: 520, label: "🐇 Cepat" }];

export function mount(root){
  let padCount = 4, stepDelay = 950;
  let seq = [], input = [], showing = false, timer = null;
  let padEls = [];

  const countCtrl = chipRow("Jumlah warna", COUNT_OPTS, padCount, v => { padCount = v; buildPads(); reset(); });
  const speedCtrl = chipRow("Kecepatan", SPEED_OPTS, stepDelay, v => { stepDelay = v; });
  const status = el("div", { class: "status" });
  const board = el("div", { class: "simon-grid" });
  const startBtn = el("button", { class: "btn", text: "Mulai", onClick: () => { reset(); next(); } });
  const replayBtn = el("button", { class: "btn secondary", text: "Putar Ulang", onClick: () => { if(seq.length) play(); } });

  root.append(countCtrl.el, speedCtrl.el, status, board,
    el("div", { class: "actions" }, startBtn, replayBtn));

  function buildPads(){
    board.innerHTML = "";
    board.style.gridTemplateColumns = padCount === 4 ? "1fr 1fr" : "1fr 1fr 1fr";
    board.style.maxWidth = padCount === 4 ? "380px" : "440px";
    padEls = [];
    for(let i = 0; i < padCount; i++){
      const p = PADS[i];
      const b = el("button", { class: "pad " + p.cls, "aria-label": p.label, text: p.shape });
      b.addEventListener("click", () => press(i));
      board.append(b);
      padEls.push(b);
    }
  }

  function stop(){ if(timer){ clearTimeout(timer); timer = null; } showing = false; }
  function reset(){
    stop();
    seq = []; input = [];
    status.className = "status";
    status.textContent = 'Tekan "Mulai" lalu perhatikan.';
  }
  function lit(i){
    const b = padEls[i]; b.classList.add("lit");
    beep(PADS[i].freq, 0.32, "sine", 0.2);
    setTimeout(() => b.classList.remove("lit"), 360);
  }
  function next(){
    input = [];
    seq.push(randInt(padCount));
    play();
  }
  function play(){
    showing = true;
    status.className = "status";
    status.textContent = "Perhatikan... (urutan " + seq.length + ")";
    let i = 0;
    const step = () => {
      if(i >= seq.length){ showing = false; status.textContent = "Sekarang giliran Anda 👆"; return; }
      lit(seq[i]); i++;
      timer = setTimeout(step, stepDelay);
    };
    timer = setTimeout(step, 500);
  }
  function press(i){
    if(showing || seq.length === 0) return;
    lit(i); input.push(i);
    const idx = input.length - 1;
    if(input[idx] !== seq[idx]){
      status.className = "status soft";
      status.textContent = "Hampir! Mari kita putar ulang 😊";
      sSoft();
      setTimeout(play, 1100);
      return;
    }
    if(input.length === seq.length){
      status.textContent = "Bagus sekali! 🎉";
      sGood();
      setTimeout(next, 1100);
    }
  }

  buildPads();
  reset();
  return { unmount(){ stop(); } };
}
