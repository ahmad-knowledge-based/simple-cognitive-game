// Titik masuk aplikasi: rakit menu & navigasi dari daftar game.
// Menambah game baru cukup: buat file di games/, lalu daftarkan di array GAMES.
import { el } from "./core/utils.js";
import { createApp } from "./core/router.js";
import { setSound, isSound, unlock } from "./core/audio.js";

import * as memori from "./games/memori.js";
import * as simon from "./games/simon.js";
import * as beda from "./games/beda.js";
import * as tts from "./games/tts.js";

const GAMES = [memori, simon, beda, tts];

const app = createApp(document.getElementById("app"));

// Saklar suara di header.
const soundBtn = document.getElementById("soundToggle");
soundBtn.addEventListener("click", () => {
  setSound(!isSound());
  soundBtn.setAttribute("aria-pressed", String(isSound()));
  soundBtn.textContent = isSound() ? "🔊 Suara: Nyala" : "🔇 Suara: Mati";
});

function showMenu(){
  app.render(root => {
    root.append(
      el("p", { class: "intro", text: "Pilih permainan di bawah. Tidak ada batas waktu, tidak ada hukuman — santai saja dan nikmati. 😊" }),
      el("div", { class: "menu-grid" },
        GAMES.map(g => {
          const card = el("button", { class: "game-card" },
            el("span", { class: "emoji", text: g.meta.emoji }),
            el("span", {},
              el("p", { class: "t", text: g.meta.title }),
              el("p", { class: "d", text: g.meta.desc })));
          card.addEventListener("click", () => { unlock(); openGame(g); });
          return card;
        })),
      el("p", { class: "footer-note", text: "Tombol besar, huruf besar, dan kontras tinggi sengaja dipakai agar nyaman di mata dan mudah disentuh." })
    );
    return null;
  });
}

function openGame(g){
  app.render(root => {
    const gameRoot = el("div");
    const bar = el("div", { class: "bar" },
      el("button", { class: "back", text: "← Kembali", onClick: showMenu }),
      el("h2", { class: "title", text: g.meta.title }));
    root.append(el("section", { class: "panel" }, bar, gameRoot));
    return g.mount(gameRoot, {}); // kembalikan { unmount } dari game
  });
}

showMenu();
