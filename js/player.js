// Фейковый плеер: анимация прогресса без реального аудио
let playing = false, t0 = 0, acc = 0;
const DUR = 132;
function initPlayer() {
  const bar = document.getElementById('playBar');
  const btn = document.getElementById('playToggle');
  const tick = () => {
    if (playing) {
      const pos = (acc + (Date.now() - t0) / 1000) % DUR;
      bar.style.transform = `scaleX(${(pos / DUR).toFixed(3)})`;
    }
    requestAnimationFrame(tick);
  };
  const toggle = () => {
    playing = !playing;
    if (playing) t0 = Date.now(); else acc = (acc + (Date.now() - t0) / 1000) % DUR;
    btn.textContent = playing ? '❚❚' : '···';
  };
  btn.onclick = toggle;
  requestAnimationFrame(tick);
}
