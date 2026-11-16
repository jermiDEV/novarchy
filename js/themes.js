// Три темы: black / white / green. T — открыть пикер.
const themes = [
  { id: 'black', name: 'Black' },
  { id: 'white', name: 'White' },
  { id: 'green', name: 'Green' },
];
// старые id из прошлых версий маппим на black
const FALLBACK = 'black';
function known(id) { return themes.some(t => t.id === id); }
let themeIndex = 0;
function currentTheme() { return themes[themeIndex]; }
function applyTheme(id) {
  let i = themes.findIndex(t => t.id === id);
  if (i < 0) i = 0;
  themeIndex = i;
  document.documentElement.dataset.theme = themes[themeIndex].id;
  document.querySelectorAll('#themeList button').forEach(b =>
    b.classList.toggle('active', b.dataset.id === themes[themeIndex].id));
  try { localStorage.setItem('demo-theme', themes[themeIndex].id); } catch {}
  window.dispatchEvent(new CustomEvent('demo:theme', { detail: themes[themeIndex] }));
  if (window.drawHero) window.drawHero();
}
function initThemes() {
  let stored = null;
  try { stored = localStorage.getItem('demo-theme'); } catch {}
  const fromAttr = document.documentElement.dataset.theme;
  const id = known(stored) ? stored : (known(fromAttr) ? fromAttr : FALLBACK);
  themeIndex = Math.max(0, themes.findIndex(t => t.id === id));
  document.documentElement.dataset.theme = themes[themeIndex].id;
  const tl = document.getElementById('themeList');
  if (tl) {
    tl.innerHTML = '';
    themes.forEach(t => {
      const b = document.createElement('button');
      b.textContent = t.name; b.dataset.id = t.id;
      if (t.id === themes[themeIndex].id) b.classList.add('active');
      b.onclick = () => applyTheme(t.id);
      tl.appendChild(b);
    });
  }
}
