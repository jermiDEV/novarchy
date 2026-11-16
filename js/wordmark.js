// Пиксельный шрифт вордмарка в метриках оригинала:
// сетка 81x19, стойки 3px, счётчики 3px, перекладины на рядах 8-9,
// ступени сверху/снизу, потёки ножек. Буквы свои: N,O,V,A,R,C,H,Y.
// 20 медленных сборок из пустоты (1.9с), при входе — песок,
// по клику — случайная. Контроллер версий + сборка при
// сворачивании вкладки: залипаний нет.
var Wordmark = (function () {
  var WORD = 'NOVARCHY'; // переименовано
  var GH = 19, GAP = 1;

  var GLYPHS = {
    N: [
      "...........",
      ".#####.....",
      ".######....",
      "###.####...",
      "###.#####..",
      "###..####..",
      "###..#####.",
      "###...####.",
      "###...####.",
      "###...###..",
      "###...###..",
      "###...###..",
      "###...###..",
      "###...###..",
      "###...###..",
      "###...###..",
      "###...###..",
      "...........",
      "..........."
    ],
    O: [
      ".........",
      "..#####..",
      ".#######.",
      "###...###",
      "###...###",
      "###...###",
      "###...###",
      "###...###",
      "###...###",
      "###...###",
      "###...###",
      "###...###",
      "###...###",
      "###...###",
      "###...###",
      ".#######.",
      "..#####..",
      ".........",
      "........."
    ],
    V: [
      ".........",
      "###...###",
      "###...###",
      "###...###",
      "###...###",
      "###...###",
      "###...###",
      "###...###",
      "###...###",
      "###...###",
      "###...###",
      ".###.###.",
      ".###.###.",
      "..#####..",
      "..#####..",
      "...###...",
      "...###...",
      ".........",
      "........."
    ],
    A: [
      "...###...",
      "..#####..",
      ".#######.",
      "###...###",
      "###...###",
      "###...###",
      "###...###",
      "###...###",
      "#########",
      "#########",
      "###...###",
      "###...###",
      "###...###",
      "###...###",
      "###...###",
      "###...###",
      "###...###",
      ".........",
      "........."
    ],
    R: [
      ".........",
      "..#####..",
      ".#######.",
      "###...###",
      "###...###",
      "###...###",
      "###...###",
      "###...###",
      "#########",
      "#########",
      "###...##.",
      "###...##.",
      "###...##.",
      "###...##.",
      "###...##.",
      "###...##.",
      "###...##.",
      "###...#..",
      "###......"
    ],
    C: [
      ".........",
      "..#####..",
      ".#######.",
      "###......",
      "###......",
      "###......",
      "###......",
      "###......",
      "###......",
      "###......",
      "###......",
      "###......",
      "###....##",
      "###...###",
      "###...###",
      ".#######.",
      "..#####..",
      ".........",
      "........."
    ],
    H: [
      ".........",
      ".#.....#.",
      ".##...##.",
      "###...###",
      "###...###",
      "###...###",
      "###...###",
      "###...###",
      "#########",
      "#########",
      "###...###",
      "###...###",
      "###...###",
      "###...###",
      "###...###",
      "###...###",
      "###...###",
      ".........",
      "........."
    ],
    Y: [
      ".........",
      ".#.....#.",
      ".##...##.",
      "###...###",
      "###...###",
      "###...###",
      "###...###",
      ".#######.",
      "..#####..",
      "...###...",
      "...###...",
      "...###...",
      "...###...",
      "...###...",
      "...###...",
      "...###...",
      "..####...",
      ".........",
      "........."
    ]
  };

  var S = { cv: null, ctx: null, cols: 0, rows: GH, px: [], anim: null };

  function mulberry(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function cssVar(n, fb) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    return v || fb;
  }
  function band(t, cream, mid, low, dim) {
    return t < 0.40 ? cream : (t < 0.60 ? mid : (t < 0.78 ? low : dim));
  }

  // Суперсемплинг канваса: движение плавное (60fps), пиксели чёткие за счёт
  // pixelated-скейлинга — каждый юнит рисуется блоком SSxSS.
  var SS = 4;
  // Поля вокруг слова: разлёт не режется о края канваса (иначе видна рамка).
  var PADX = 72, PADY = 48;

  function build(canvas) {
    S.cv = canvas;
    S.ctx = canvas.getContext('2d');
    try { S.ctx.imageSmoothingEnabled = false; } catch (e) {}
    var cream = cssVar('--cream', '#ece5c8'),
        mid = cssVar('--cream-mid', '#cfc7a4'),
        low = cssVar('--cream-low', '#8f8b7a'),
        dim = cssVar('--cream-dim', '#6f6c5e');
    var R = mulberry(20240);
    S.bright = cream;
    S.cols = 0;
    S.px = [];
    var ox = 0;
    for (var li = 0; li < WORD.length; li++) {
      var g = GLYPHS[WORD[li]];
      if (!g) continue;
      var gw = g[0].length;
      var maxY = {};
      for (var y = 0; y < GH; y++) {
        for (var x = 0; x < gw; x++) {
          if (g[y][x] !== '#') continue;
          S.px.push({ x: ox + x, y: y, L: li, c: band(y / (GH - 1), cream, mid, low, dim), d: 0, ox: 0, oy: 0, ph: 0 });
          if (maxY[x] == null || y > maxY[x]) maxY[x] = y;
        }
      }
      ox += gw + GAP;
    }
    S.cols = ox - GAP;
    var WU = S.cols + PADX * 2, HU = GH + PADY * 2;
    canvas.width = WU * SS;
    canvas.height = HU * SS;
    // Обёртка — размер строго под слово; канвас с полями висит абсолютом
    // по центру, поэтому разлёт не режется и вёрстку не раздувает
    var wrap = canvas.parentElement;
    if (wrap) {
      wrap.style.position = 'relative';
      wrap.style.aspectRatio = S.cols + ' / ' + GH;
    }
    canvas.style.position = 'absolute';
    canvas.style.left = '50%';
    canvas.style.top = '50%';
    canvas.style.transform = 'translate(-50%,-50%)';
    canvas.style.aspectRatio = WU + ' / ' + HU;
    canvas.style.width = (WU / S.cols * 100) + '%';
    canvas.style.maxWidth = 'none';
    canvas.style.height = 'auto';
    canvas.style.marginLeft = '0';
    drawStatic();
  }

  function PX_(x) { return (x + PADX) * SS; }
  function PY_(y) { return (y + PADY) * SS; }

  function drawStatic() {
    var c = S.ctx;
    c.clearRect(0, 0, (S.cols + PADX * 2) * SS, (S.rows + PADY * 2) * SS);
    for (var i = 0; i < S.px.length; i++) {
      var p = S.px[i];
      c.fillStyle = p.c;
      c.fillRect(PX_(p.x), PY_(p.y), SS, SS);
    }
  }

  function clearAll() {
    if (!S.ctx) return;
    animSeq++;
    S.anim = null;
    S.ctx.clearRect(0, 0, (S.cols + PADX * 2) * SS, (S.rows + PADY * 2) * SS);
  }

  function pick(v) {
    var R = mulberry((Math.random() * 1e9) | 0);
    S.ghost = false; // силуэта-призрака нет ни в одной анимации
    S.dur = 1900;
    for (var i = 0; i < S.px.length; i++) {
      var p = S.px[i];
      var u = p.x / S.cols, vv = p.y / S.rows;
      p.ox = 0; p.oy = 0; p.back = false; p.calm = false; p.front = false; p.pop = false; p.sparse = false;
      switch (v) {
        case 0: // из пустоты: прилетают отовсюду
          p.d = R() * 0.70;
          p.ox = (R() - 0.5) * S.cols * 0.45;
          p.oy = (R() - 0.5) * S.rows * 0.7;
          break;
        case 1: // дождь сверху
          p.d = R() * 0.40;
          p.oy = -(10 + R() * 30);
          break;
        case 2: // подъём снизу
          p.d = R() * 0.40;
          p.oy = 10 + R() * 24;
          break;
        case 3: // шторка слева
          p.d = u * 0.75;
          p.ox = -(1 - u) * 40;
          break;
        case 4: // шторка справа
          p.d = (1 - u) * 0.75;
          p.ox = u * 40;
          break;
        case 5: // волна
          p.d = 0.5 + 0.45 * Math.sin(u * 9 + vv * 4);
          p.d = Math.max(0, Math.min(1, p.d)) * 0.7;
          p.oy = 5 * Math.sin(u * 9 + 1);
          break;
        case 6: // печатная машинка: побуквенно
          p.d = (p.L / WORD.length) * 0.68 + R() * 0.12;
          p.oy = 5; p.calm = true;
          S.dur = 1800;
          break;
        case 7: // шахматы
          p.d = (((p.x + p.y) % 2) * 0.5 + R() * 0.25) * 0.9;
          break;
        case 8: { // из центра наружу
          var dx = (u - 0.5) * 1.5, dy = vv - 0.5;
          var dist = Math.sqrt(dx * dx + dy * dy);
          p.d = Math.min(1, dist) * 0.75;
          p.ox = dx * 52; p.oy = dy * 38;
          break;
        }
        case 10: // диагональ из угла
          p.d = (u + vv) / 2 * 0.75;
          p.ox = -(1 - u) * 30; p.oy = -(1 - vv) * 24;
          break;
        case 11: // водоворот
          var wang = Math.atan2(vv - 0.5, (u - 0.5) * 1.5);
          var wr = Math.sqrt(Math.pow((u - 0.5) * 1.5, 2) + Math.pow(vv - 0.5, 2));
          p.d = ((wang / 6.283 + 0.5) * 0.4 + Math.min(1, wr) * 0.45) * 0.9;
          p.ox = -Math.sin(wang) * 34; p.oy = Math.cos(wang) * 26;
          break;
        case 12: // колонны падают с отскоком
          p.d = u * 0.6 + R() * 0.15;
          p.oy = 46;
          break;
        case 13: // каскад побуквенно с разлётом
          p.d = (p.L / WORD.length) * 0.5 + R() * 0.35;
          p.ox = (R() - 0.5) * 50; p.oy = (R() - 0.5) * 30;
          break;
        case 14: // ряды из центра
          p.d = Math.abs(vv - 0.5) * 2 * 0.7;
          p.oy = (vv > 0.5 ? 1 : -1) * (14 + R() * 20);
          break;
        case 15: { // ПЕСОК: хаотичное облако вокруг — без рамки, разные дистанции
          var ang = R() * 6.283;
          var dist = 6 + Math.pow(R(), 1.6) * 34; // 6..40: кто рядом, кто далеко
          p.d = R() * 0.90;
          p.ox = Math.cos(ang) * dist * 1.6;
          p.oy = Math.sin(ang) * dist;
          p.back = true; p.sparse = true;
          S.dur = 4500;
          break;
        }
        case 16: // салют с двух сторон
          var side = u < 0.5 ? -1 : 1;
          p.d = Math.abs(u - 0.5) * 2 * 0.55 + R() * 0.20;
          p.ox = side * (26 + R() * 40);
          p.oy = (R() - 0.5) * 22;
          S.dur = 1500;
          break;
        case 17: // попиксельно, построчно — медленно, дискретно
          p.d = (p.y * S.cols + p.x) / (S.cols * S.rows) * 0.88;
          p.pop = true;
          S.dur = 4200;
          break;
        case 18: // угли снизу вверх
          p.d = (1 - vv) * 0.55 + R() * 0.30;
          p.oy = 12 + R() * 26;
          p.ox = (R() - 0.5) * 10;
          break;
        case 19: // имплозия: с кольца в центр
          var ix = (u - 0.5) * 1.5, iy = vv - 0.5;
          var ir = Math.sqrt(ix * ix + iy * iy) || 0.001;
          p.d = (1 - Math.min(1, ir)) * 0.7;
          p.ox = ix / ir * 44; p.oy = iy / ir * 32;
          break;
        case 20: // ETCH сверху: призрак + разреженный фронт вниз
          S.ghost = true;
          S.dur = 4800;
          p.d = vv * 0.88 + R() * 0.10;
          p.ox = (R() - 0.5) * 4;
          p.oy = -(R() * 10);
          p.sparse = true;
          break;
        case 21: // ETCH снизу: призрак + разреженный фронт вверх
          S.ghost = true;
          S.dur = 4800;
          p.d = (1 - vv) * 0.88 + R() * 0.10;
          p.ox = (R() - 0.5) * 4;
          p.oy = R() * 10;
          p.sparse = true;
          break;
        default: { // глитч-полосы
          var bnd = Math.floor(vv * 8);
          p.d = (bnd / 8) * 0.7 + R() * 0.15;
          p.ox = (R() > 0.5 ? 1 : -1) * (20 + R() * 54);
        }
      }
      p.d = Math.max(0, Math.min(1, p.d));
      p.ph = R() * 6.283;
    }
  }

  var animSeq = 0;

  function easeOutBack(x) {
    var c1 = 1.4, c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  }

  function play(only) {
    if (!S.ctx || !S.px.length) return;
    S.ctx.clearRect(0, 0, (S.cols + PADX * 2) * SS, (S.rows + PADY * 2) * SS); // начинаем с пустоты
    pick(only != null ? only : ((Math.random() * 22) | 0));
    var id = ++animSeq;
    S.anim = { t0: performance.now(), dur: S.dur || 1900, id: id };
    requestAnimationFrame(function (now) { step(now, id); });
  }

  function finish() {
    animSeq++;
    S.anim = null;
    drawStatic();
  }

  if (typeof document !== 'undefined' && document.addEventListener) {
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && S.anim) finish(); // вкладка свернулась — собрать мгновенно, не залипать
    });
  }

  function step(now, id) {
    var an = S.anim;
    if (!an || id !== an.id) return;
    var t = Math.min(1, (now - an.t0) / an.dur);
    var c = S.ctx;
    c.clearRect(0, 0, (S.cols + PADX * 2) * SS, (S.rows + PADY * 2) * SS);
    for (var i = 0; i < S.px.length; i++) {
      var p = S.px[i];
      var span = 1 - p.d * 0.7;
      var l = t / span - p.d * 0.45;
      l = l < 0 ? 0 : (l > 1 ? 1 : l);
      if (l <= 0) continue;
      var e = p.back ? easeOutBack(l) : (1 - Math.pow(1 - l, 3));
      var a, col;
      if (l >= 1) { a = 1; col = p.c; }
      else if (p.sparse) { // виден только в конце своего хода — разреженный дождь
        if (l < 0.25) continue;
        var ll = (l - 0.25) / 0.75;
        a = Math.min(1, ll * 5);
        col = l > 0.85 ? S.bright : p.c;
      }
      else if (p.pop) { // дискретное вщёлкивание: вспышка, потом цвет
        a = Math.min(1, l * 7);
        col = l < 0.85 ? S.bright : p.c;
      }
      else if (p.front && l > 0.7) { // вспышка у посадки
        a = 0.65 + 0.35 * Math.abs(Math.sin(l * 36 + p.ph));
        col = S.bright;
      }
      else if (p.front) { // перелёт — тускло в своём цвете
        a = Math.min(1, l * 4) * 0.45;
        col = p.c;
      }
      else if (p.calm) { a = Math.min(1, l * 3); col = p.c; }
      else {
        a = l > 0.8 ? 0.65 + 0.35 * Math.abs(Math.sin(l * 36 + p.ph)) : Math.min(1, l * 4);
        col = p.c;
      }
      c.globalAlpha = a;
      c.fillStyle = col;
      c.fillRect(PX_(p.x + p.ox * (1 - e)), PY_(p.y + p.oy * (1 - e)), SS, SS);
    }
    c.globalAlpha = 1;
    if (t < 1) requestAnimationFrame(function (n) { step(n, id); });
    else { S.anim = null; drawStatic(); }
  }

  return { build: build, play: play, clear: clearAll };
})();
