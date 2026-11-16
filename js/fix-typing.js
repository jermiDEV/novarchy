// Печатная анимация заголовка "We can fix every..." — порт оригинала omarchy.org.
// Фразы оригинала: thing. / missing app. / incompatibility. / paper cut.
(function () {
  var PHRASES = ["thing.", " missing app.", " incompatibility.", " paper cut."];

  // Тайминги оригинала (HomePage.NkPKGj8e.js):
  var TYPE_BASE = 58;    // vd
  var TYPE_RAND = 60;    // yd
  var SPACE_EXTRA = 95;  // bd
  var END_EXTRA = 70;    // xd
  var PAUSE_CHANCE = 0.07; // Sd
  var PAUSE_EXTRA = 140;   // Cd
  var DELETE_SPEED = 27;   // wd
  var HOLD_FULL = 3000;    // Td в оригинале 2100, увеличено до ~3с по ТЗ
  var HOLD_PREFIX = 420;   // Ed

  function commonPrefix(a, b) {
    var n = 0;
    while (n < a.length && n < b.length && a[n] === b[n]) n++;
    return n;
  }

  function initOne(block) {
    var out = block.querySelector("[data-typed-text]");
    var wrap = block.querySelector("[data-typing]");
    if (!out || !wrap) return;
    if (!PHRASES.length) return;

    // prefers-reduced-motion: просто показываем первую фразу
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      out.textContent = PHRASES[0];
      return;
    }

    var timer = 0;
    var idx = 0;      // c — индекс фразы
    var len = 0;      // l — длина видимого среза
    var deleting = false; // u
    var running = false;  // d

    // Фикс высоты, чтобы страница не прыгала при смене фраз
    function stabilize() {
      var cur = out.textContent;
      block.style.minHeight = "";
      var max = 0;
      for (var k = 0; k < PHRASES.length; k++) {
        out.textContent = PHRASES[k];
        max = Math.max(max, block.getBoundingClientRect().height);
      }
      out.textContent = cur;
      block.style.minHeight = Math.ceil(max) + "px";
    }

    function tickDelay() {
      var cur = PHRASES[idx];
      if (deleting) return DELETE_SPEED;
      var d = TYPE_BASE + Math.random() * TYPE_RAND;
      if (cur[len - 1] === " ") d += SPACE_EXTRA;
      if (len >= cur.length - 2) d += END_EXTRA;
      if (Math.random() < PAUSE_CHANCE) d += PAUSE_EXTRA;
      return d;
    }

    function step() {
      var cur = PHRASES[idx];
      out.textContent = cur.slice(0, len);
      var delay = tickDelay();

      if (!deleting && len === cur.length) {
        deleting = true;
        delay = HOLD_FULL;
      } else if (deleting && len === commonPrefix(cur, PHRASES[(idx + 1) % PHRASES.length])) {
        deleting = false;
        idx = (idx + 1) % PHRASES.length;
        delay = HOLD_PREFIX;
      } else {
        len += deleting ? -1 : 1;
      }

      // data-typing="1" гасит мигание курсора пока печатает (как в оригинале)
      try {
        wrap.setAttribute("data-typing", (delay > 2099 || delay === HOLD_PREFIX) ? "0" : "1");
      } catch (e) {}

      timer = window.setTimeout(step, delay);
    }

    function start() { if (!running) { running = true; step(); } }
    function stop() { running = false; window.clearTimeout(timer); }

    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) start();
      else stop();
    }, { rootMargin: "96px" });

    function ready() { stabilize(); io.observe(block); }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(ready);
    else ready();

    window.addEventListener("resize", function () { if (running) stabilize(); });
  }

  function initFixTyping() {
    document.querySelectorAll('[data-typed-block]').forEach(initOne);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFixTyping);
  } else {
    initFixTyping();
  }
  window.initFixTyping = initFixTyping;
})();
