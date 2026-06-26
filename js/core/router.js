// Pengelola layar sederhana: pasang satu tampilan ke dalam elemen root,
// dan bersihkan (unmount) tampilan sebelumnya — penting agar timer game
// (mis. Simon) berhenti saat berpindah layar.
export function createApp(rootEl){
  let current = null;
  return {
    render(viewFactory){
      if(current && current.unmount) current.unmount();
      rootEl.innerHTML = "";
      current = viewFactory(rootEl) || null;
      window.scrollTo(0, 0);
    },
  };
}
