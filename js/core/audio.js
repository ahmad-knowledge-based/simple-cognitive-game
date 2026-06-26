// Suara sederhana berbasis WebAudio + saklar matikan suara.
let soundOn = true;
let actx = null;

export function setSound(on){ soundOn = on; }
export function isSound(){ return soundOn; }

// Harus dipanggil setelah interaksi pengguna pertama agar audio "terbuka" di mobile.
export function unlock(){
  if(!actx){
    try{ actx = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){}
  }
  if(actx && actx.state === "suspended") actx.resume();
}

export function beep(freq = 440, dur = 0.18, type = "sine", vol = 0.18){
  if(!soundOn) return;
  unlock();
  if(!actx) return;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0, actx.currentTime);
  g.gain.linearRampToValueAtTime(vol, actx.currentTime + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
  o.connect(g); g.connect(actx.destination);
  o.start(); o.stop(actx.currentTime + dur);
}

export const sGood = () => { beep(660, 0.12, "sine"); setTimeout(() => beep(880, 0.16, "sine"), 120); };
export const sSoft = () => { beep(300, 0.22, "sine", 0.14); };
export const sWin  = () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.18, "triangle"), i * 150)); };
export const sTap  = () => { beep(520, 0.07, "square", 0.10); };
