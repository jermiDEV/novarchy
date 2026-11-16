// Поиск-палитра + стек проектов (заглушки, не копия оригинала)
const items = ['Проекты', 'Темы', 'Поиск'];
function initSearch() {
  const pal = document.getElementById('palette');
  const input = document.getElementById('palInput');
  const list = document.getElementById('palList');
  if (!pal || !input || !list) return;
  const render = (f = '') => {
    list.innerHTML = '';
    items.filter(x => x.toLowerCase().includes(f.toLowerCase())).forEach(x => {
      const li = document.createElement('li'); li.textContent = x; li.onclick = close; list.appendChild(li);
    });
  };
  const open = () => { pal.classList.add('open'); render(); setTimeout(() => input.focus(), 30); };
  const close = () => pal.classList.remove('open');
  window.__openSearch = open; window.__closeSearch = close;
  const sb = document.getElementById('searchBtn');
  if (sb) sb.onclick = open;
  pal.addEventListener('click', e => { if (e.target === pal) close(); });
  input.oninput = e => render(e.target.value);
}
// СТЕК ПРОЕКТОВ: добавляй новые объекты в этот массив.
// Структура карточки — как в оригинале: название ★, описание, автор - рубрика.
const projects = [
  { name: 'Radio Atlas', stars: 67, desc: 'Живое радио на вращающемся глобусе, станции прямо из медиабара.', meta: 'Автор 1 - Виджеты' },
  { name: 'Omagotchi', stars: 18, desc: '1-битный питомец в баре в духе оригиналов 1997 года: корми, мой, играй.', meta: 'Автор 2 - Остальное' },
  { name: 'AirPods', stars: 197, desc: 'AirPods в баре: батарея кейса и наушников, режимы, шумодав.', meta: 'Автор 3 - Железо' },
  { name: 'Сапёр', stars: 10, desc: 'Классический сапёр в терминале: открой все клетки и не подорвись.', meta: 'Автор 4 - Игры' },
  { name: 'Бэкапы', stars: 104, desc: 'Снапшоты и восстановление одной командой, локально и в облако.', meta: 'Автор 5 - Система' },
  { name: 'Зверьки', stars: 5, desc: 'Пиксельные зверьки в углу экрана: живут, спят и просят внимания.', meta: 'Автор 6 - Фан' },
];
function initDemoContent() {
  const grid = document.getElementById('projectGrid');
  if (!grid) return;
  grid.innerHTML = '';
  projects.forEach(p => {
    const d = document.createElement('article');
    d.className = 'pcard';
    const thumb = document.createElement('div');
    thumb.className = 'pthumb';
    const body = document.createElement('div');
    body.className = 'pbody';
    const title = document.createElement('div');
    title.className = 'ptitle';
    const n = document.createElement('span');
    n.textContent = p.name;
    const s = document.createElement('span');
    s.className = 'pstars';
    s.textContent = '★ ' + p.stars;
    title.appendChild(n);
    title.appendChild(s);
    const desc = document.createElement('p');
    desc.className = 'pdesc';
    desc.textContent = p.desc;
    const meta = document.createElement('div');
    meta.className = 'pmeta';
    meta.textContent = p.meta;
    body.appendChild(title);
    body.appendChild(desc);
    body.appendChild(meta);
    d.appendChild(thumb);
    d.appendChild(body);
    grid.appendChild(d);
  });
}
