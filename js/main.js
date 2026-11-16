
initThemes();
initPicker();
initSearch();
initDemoContent();
if (window.drawHero) window.drawHero();

var topbar = document.querySelector('.topbar');
function syncBar() { if (topbar) topbar.classList.toggle('scrolled', window.scrollY > 10); }
window.addEventListener('scroll', syncBar, { passive: true });
syncBar();

window.addEventListener('keydown', e => {
  const tag = document.activeElement?.tagName;
  const typing = tag === 'INPUT' || tag === 'TEXTAREA';
  if (e.key.toLowerCase() === 't' && !e.metaKey && !e.ctrlKey && !e.altKey && !typing) {
    e.preventDefault();
    document.getElementById('picker').classList.contains('open') ? closePicker() : openPicker();
  }
  if (e.key === '/' && !typing) { e.preventDefault(); window.__openSearch?.(); }
  if (e.key === 'Escape') { window.__closeSearch?.(); closePicker(); }
  if (document.getElementById('picker').classList.contains('open')) {
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'Enter') confirmStep();
  }
});
