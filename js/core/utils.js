// Helper kecil dipakai semua modul.

// Buat elemen DOM ringkas: el('button',{class:'x',text:'Hi',onClick:fn}, child1, child2)
export function el(tag, attrs = {}, ...children){
  const node = document.createElement(tag);
  for(const [k, v] of Object.entries(attrs)){
    if(v == null) continue;
    if(k === "class") node.className = v;
    else if(k === "text") node.textContent = v;
    else if(k === "html") node.innerHTML = v;
    else if(k === "style" && typeof v === "object") Object.assign(node.style, v);
    else if(k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v);
    else node.setAttribute(k, v);
  }
  for(const c of children.flat()){
    if(c == null) continue;
    node.append(c.nodeType ? c : document.createTextNode(c));
  }
  return node;
}

export function shuffle(a){
  a = [...a];
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const randInt = (n) => Math.floor(Math.random() * n);
export const sample = (arr, n) => shuffle(arr).slice(0, n);

// Baris pilihan (chip). Kembalikan { el, setActive(value) } agar bisa
// disorot dari kode (mis. saat level naik otomatis).
export function chipRow(label, options, current, onPick){
  const buttons = new Map();
  const row = el("div", { class: "opts" });
  if(label) row.append(el("span", { class: "opts-label", text: label }));
  options.forEach(o => {
    const b = el("button", { class: "chip" + (o.value === current ? " active" : ""), text: o.label });
    b.addEventListener("click", () => { setActive(o.value); onPick(o.value); });
    buttons.set(o.value, b);
    row.append(b);
  });
  function setActive(v){ buttons.forEach((b, k) => b.classList.toggle("active", k === v)); }
  return { el: row, setActive };
}
