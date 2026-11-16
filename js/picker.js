let preview = 0;
function sync() {
  const cur = themes.findIndex(t => t.id === document.documentElement.dataset.theme);
  preview = cur < 0 ? 0 : cur;
}
function renderPicker() {
  syncPreviewDom();
}
function syncPreviewDom() {
  const n = themes.length;
  const L = themes[(preview - 1 + n) % n], C = themes[preview], R = themes[(preview + 1) % n];
  document.getElementById('pL').textContent = L.name;
  document.getElementById('pC').textContent = C.name;
  document.getElementById('pR').textContent = R.name;
  document.getElementById('pName').textContent = C.name;
}
function openPicker() { sync(); syncPreviewDom(); document.getElementById('picker').classList.add('open'); }
function closePicker() { document.getElementById('picker').classList.remove('open'); }
function step(d) { preview = (preview + d + themes.length) % themes.length; syncPreviewDom(); }
function confirmStep() { applyTheme(themes[preview].id); closePicker(); }
function initPicker() {
  const tb = document.getElementById('themeBtn');
  if (tb) tb.onclick = openPicker;
  const pb = document.getElementById('paletteBtn');
  if (pb) pb.onclick = openPicker;
  document.getElementById('prevT').onclick = e => { e.stopPropagation(); step(-1); };
  document.getElementById('nextT').onclick = e => { e.stopPropagation(); step(1); };
  document.getElementById('pC').onclick = confirmStep;
  document.getElementById('picker').addEventListener('click', e => { if (e.target.id === 'picker') closePicker(); });
  setTimeout(() => {
    try {
      if (!localStorage.getItem('demo-hint')) {
        const h = document.getElementById('hint'); if (h) h.style.display = 'block';
        setTimeout(() => { if (h) h.style.display = 'none'; }, 5000);
      }
    } catch {}
  }, 1600);
  const h = document.getElementById('hint');
  if (h) h.onclick = () => { h.style.display = 'none'; openPicker(); try { localStorage.setItem('demo-hint', '1'); } catch {} };
}
