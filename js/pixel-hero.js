// Пыль hero как в оригинале: крупный пиксель (~12px, чуть меньше курсора),
// ТОЛЬКО два цвета (яркий cream / тусклый gray), пыль по всему полю,
// анимация — прыжки вверх/вниз как эквалайзер. Слово — Wordmark.
(function () {
  var hero = document.querySelector('.hero');
  var cv = document.getElementById('dust');
  var wcv = document.getElementById('word');
  if (!hero || !cv || !wcv) return;
  var ctx = cv.getContext('2d');

  var W = 0, H = 0, cell = 16, PX = 12;
  var GX = 0, GY = 0, WORDBOX = null;
  var dust = [], parts = [];
  var mouse = { x: -9999, y: -9999 };
  var dustA = '236,229,200', dustB = '150,150,140';
  var COL_BRIGHT = '', COL_DIM = '';
  function readDustColors() {
    try {
      var cs = getComputedStyle(document.documentElement);
      dustA = cs.getPropertyValue('--dust-a').trim() || dustA;
      dustB = cs.getPropertyValue('--dust-b').trim() || dustB;
    } catch (e) {}
    // приглушённые: ярко — видно, тускло — едва
    COL_BRIGHT = 'rgba(' + dustA + ',0.55)';
    COL_DIM = 'rgba(' + dustB + ',0.20)';
  }

  function mulberry(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function buildDust() {
    readDustColors();
    var r = hero.getBoundingClientRect();
    W = Math.max(1, Math.floor(r.width)); H = Math.max(1, Math.floor(r.height));
    cv.width = W; cv.height = H;
    // Крупный пиксель: ячейка 16, квадрат 12 — чуть меньше курсора
    cell = W < 640 ? 14 : 16;
    PX = W < 640 ? 10 : 12;
    dust = [];
    var gx = Math.ceil(W / cell), gy = Math.ceil(H / cell);
    var R = mulberry(987654321);
    // Чистая зона вокруг надписи: считается по ОБЁРТКЕ слова (стабильный размер),
    // а не по канвасу — у канваса теперь поля под разлёт, он огромный.
    var wordBox = null;
    try {
      var hr0 = hero.getBoundingClientRect(), wr0 = wcv.parentElement.getBoundingClientRect();
      if (wr0.width > 10) {
        var ox0 = wr0.left - hr0.left, oy0 = wr0.top - hr0.top;
        var m = cell * 2; // отступ вокруг слова
        wordBox = {
          x0: Math.floor((ox0 - m) / cell), x1: Math.ceil((ox0 + wr0.width + m) / cell),
          y0: Math.floor((oy0 - m) / cell), y1: Math.ceil((oy0 + wr0.height + m) / cell)
        };
      }
    } catch (e) {}
    GX = gx; GY = gy; WORDBOX = wordBox;
    function inWord(x, y) {
      return wordBox && x >= wordBox.x0 && x <= wordBox.x1 && y >= wordBox.y0 && y <= wordBox.y1;
    }
    // Поле по всему hero: редко в центре, гуще к бокам и чуть гуще книзу
    for (var y = 0; y < gy; y++) {
      for (var x = 0; x < gx; x++) {
        if (inWord(x, y)) continue;
        var sideK = Math.pow(Math.abs(x / gx - 0.5) * 2, 2); // 0 центр, 1 бока
        var bottomK = Math.max(0, (y / gy - 0.6) / 0.4);
        var p = 0.020 + sideK * 0.055 + bottomK * 0.015;
        // верхушка-стены слева/справа как в оригинале
        if (y < gy * 0.3) p += sideK * 0.05;
        if (R() < p) {
          dust.push({
            x: x, y: y, ox: x, oy: y,
            bright: R() > 0.78, // только два цвета
            ph: R() * 6.283,
            sp: 0.8 + R() * 1.6, // скорость прыжков
            bsp: 0.3 + R() * 0.9, // скорость мигания (исчез/появился)
            bph: R() * 6.283,
            amp: R() < 0.3 ? 0 : 1, // часть стоит, часть прыгает на клетку
            free: false
          });
        }
      }
    }
    // «земля» снизу: низкая (2-5 рядов), рваная, из тех же двух цветов
    var mound1 = 0.12 + R() * 0.7, mound2 = 0.12 + R() * 0.7;
    for (var gx0 = 0; gx0 < gx; gx0++) {
      var u = gx0 / gx;
      var edgeK = Math.pow(Math.abs(u - 0.5) * 2, 1.6);
      var hills = Math.sin(gx0 * 0.32) * 0.8 + Math.sin(gx0 * 0.11 + 2.0) * 1.1;
      var mounds = Math.exp(-Math.pow((u - mound1) * 9, 2)) * 2 + Math.exp(-Math.pow((u - mound2) * 9, 2)) * 2;
      var h = 2 + Math.floor(R() * 1.5 + edgeK * (2 + R() * 2.5) + hills + mounds);
      if (h < 1) h = 1;
      if (h > 6) h = 6;
      for (var k = 0; k < h; k++) {
        var deep = k < h - 1;
        if (deep) { if (R() < 0.22) continue; }
        else { if (R() < 0.55) continue; }
        dust.push({
          x: gx0, y: gy - 1 - k, ox: gx0, oy: gy - 1 - k,
          bright: R() > 0.62,
          ph: R() * 6.283,
          sp: 0.8 + R() * 1.6,
          bsp: 0.3 + R() * 0.9,
          bph: R() * 6.283,
          amp: R() < 0.5 ? 0 : 1,
          free: false
        });
      }
    }
  }

  // Осыпи у слова нет: зона надписи всегда чистая (как в оригинале)
  function addTailScatter() {}

  function burstAt(x, y, n, power) {
    power = power || 1;
    for (var i = 0; i < n; i++) {
      var an = Math.random() * 6.283, sp = (60 + Math.random() * 260) * power;
      parts.push({
        x: x, y: y,
        vx: Math.cos(an) * sp, vy: Math.sin(an) * sp - 40 * power, g: 220,
        age: 0, life: 0.5 + Math.random() * 0.6, cream: Math.random() > 0.3
      });
    }
    if (parts.length > 700) parts.splice(0, parts.length - 700);
  }

  function frame(ts) {
    var t = ts / 1000;
    var intro = Math.max(0, Math.min(1, (performance.now() - bootT - 900) / 1400));
    ctx.clearRect(0, 0, W, H);
    // часть пикселей перерождается в новом месте: исчез/появился
    if (intro >= 1 && dust.length && GX > 0) {
      for (var rr = 0; rr < 3; rr++) {
        if (Math.random() < 0.35) {
          var d0 = dust[(Math.random() * dust.length) | 0];
          var nx = (Math.random() * GX) | 0, ny = (Math.random() * GY) | 0;
          if (WORDBOX && nx >= WORDBOX.x0 && nx <= WORDBOX.x1 && ny >= WORDBOX.y0 && ny <= WORDBOX.y1) continue;
          var sideK0 = Math.pow(Math.abs(nx / GX - 0.5) * 2, 2);
          if (Math.random() > 0.05 + sideK0 * 0.12) continue;
          d0.ox = d0.x = nx; d0.oy = d0.y = ny;
          d0.ph = Math.random() * 6.283; d0.bph = Math.random() * 6.283;
        }
      }
    }
    for (var i = 0; i < dust.length; i++) {
      var d = dust[i];
      // исчезновение/появление: жёсткое вкл/выкл, без полутонов
      var on = Math.sin(t * (d.bsp || 0.6) + (d.bph || 0)) > -0.55;
      if (!on) continue;
      // прыжки вверх/вниз на клетку как эквалайзер
      var jump = d.amp ? Math.round(Math.sin(t * d.sp + d.ph)) : 0; // -1,0,1
      var cx = (d.x + 0.5) * cell;
      var cy = (d.y + 0.5) * cell + jump * cell;
      ctx.fillStyle = d.bright ? COL_BRIGHT : COL_DIM;
      ctx.globalAlpha = intro;
      ctx.fillRect(Math.round(cx - PX / 2), Math.round(cy - PX / 2), PX, PX);
    }
    ctx.globalAlpha = 1;
    for (var k = parts.length - 1; k >= 0; k--) {
      var p = parts[k];
      p.age += 1 / 60;
      if (p.age < 0) continue;
      if (p.age >= p.life) { parts.splice(k, 1); continue; }
      p.x += p.vx / 60; p.y += p.vy / 60; p.vy += (p.g || 0) / 60;
      var f = 1 - p.age / p.life;
      if (p.hot) f = Math.min(1, f * 1.1 + 0.25);
      ctx.fillStyle = p.cream
        ? 'rgba(' + dustA + ',' + (f * 0.9).toFixed(3) + ')'
        : 'rgba(' + dustB + ',' + (f * 0.7).toFixed(3) + ')';
      var sz = Math.max(2, cell * 0.7 * f + 1) * (p.hot ? 1.5 : 1);
      ctx.fillRect(p.x, p.y, sz, sz);
    }
    requestAnimationFrame(frame);
  }

  function heroPos(e) {
    var r = hero.getBoundingClientRect();
    var cx = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
    var cy = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;
    return { x: cx - r.left, y: cy - r.top };
  }

  hero.addEventListener('mousemove', function (e) {
    var p = heroPos(e);
    mouse.x = p.x; mouse.y = p.y;
  });
  hero.addEventListener('mouseleave', function () { mouse.x = -9999; mouse.y = -9999; });
  hero.addEventListener('click', function (e) {
    var p = heroPos(e);
    burstAt(p.x, p.y, 46, 1);
  });
  wcv.parentElement.style.cursor = 'pointer';
  wcv.parentElement.addEventListener('click', function (e) {
    // Канвас с полями под разлёт больше слова — перезапуск только при клике
    // строго по самой надписи, клики по полям/фону игнорируем
    try {
      var r = wcv.parentElement.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
    } catch (err) {}
    Wordmark.play();
  });

  window.drawHero = function () { Wordmark.build(wcv); buildDust(); };

  var rT;
  window.addEventListener('resize', function () {
    clearTimeout(rT);
    rT = setTimeout(function () { Wordmark.build(wcv); buildDust(); }, 150);
  });
  window.addEventListener('demo:theme', function () { Wordmark.build(wcv); });

  var bootT = performance.now();

  function spawnCluster(fx, fy, n, spread) {
    for (var i = 0; i < n; i++) {
      var an = Math.random() * 6.283, sp = 20 + Math.random() * spread;
      parts.push({
        x: fx * W, y: fy * H,
        vx: Math.cos(an) * sp, vy: Math.sin(an) * sp - 30, g: 60,
        age: -0.2 - Math.random() * 0.5, life: 2.4, cream: Math.random() > 0.25, hot: true
      });
    }
  }

  Wordmark.build(wcv);
  buildDust();
  Wordmark.clear(); // при входе слова нет — только песок, собирается из пустоты
  requestAnimationFrame(frame);
  setTimeout(function () { Wordmark.play(15); }, 250); // вход — ПЕСОК: отдельные квадраты как фон, не массой
})();
