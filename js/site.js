/*
 * PRZEŁĄCZNIK PREMIERY
 * --------------------
 * APP_LIVE = false  ->  przyciski „Wkrótce w Google Play” (nieaktywne, aria-disabled)
 *                       z notką o zbliżającej się premierze. Tak też wygląda HTML bez JS.
 * APP_LIVE = true   ->  przyciski zamieniają się w link „Pobierz z Google Play”
 *                       prowadzący do PLAY_URL.
 * Po publikacji aplikacji w sklepie zmień jedną linijkę poniżej na `true` i wypchnij.
 */
const APP_LIVE = false;
const PLAY_URL = "https://play.google.com/store/apps/details?id=pl.szybciejsienieda.app";

(function () {
  "use strict";

  /* ---------- CTA ---------- */
  if (APP_LIVE) {
    document.querySelectorAll("[data-cta]").forEach(function (box) {
      box.innerHTML =
        '<a class="btn btn-live" href="' + PLAY_URL + '" rel="noopener">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M6 3.6v16.8c0 .8.9 1.3 1.6.9l14-8.4c.6-.4.6-1.3 0-1.7l-14-8.4C6.9 2.3 6 2.8 6 3.6z"/></svg>' +
        "Pobierz z Google Play</a>";
    });
  }

  /* ---------- Mozaika 500 słów ---------- */
  var svg = document.querySelector("[data-mosaic]");
  var words = window.WORDS || [];
  if (!svg || words.length < 500) return;

  var section = svg.closest(".why");
  var countEl = document.querySelector("[data-count]");
  var marks = document.querySelectorAll("[data-mark]");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var wide = window.matchMedia("(min-width: 961px) and (min-height: 640px)");
  var NS = "http://www.w3.org/2000/svg";
  var COUNT = 500;
  var groups = [];
  var lit = -1;

  // Squarified treemap — ten sam algorytm i wykładnik (0,65), co mozaika w aplikacji.
  function layout(count, W, H, exponent) {
    var weights = [], total = 0, i;
    for (i = 1; i <= count; i++) { var w = 1 / Math.pow(i, exponent); weights.push(w); total += w; }
    var areas = weights.map(function (w) { return w * W * H / total; });
    var cells = [], free = { x: 0, y: 0, w: W, h: H }, row = [], rowArea = 0;

    function worst(extra, side) {
      if (!row.length && extra == null) return Infinity;
      var mx = 0, mn = Infinity;
      row.forEach(function (k) { mx = Math.max(mx, areas[k]); mn = Math.min(mn, areas[k]); });
      if (extra != null) { mx = Math.max(mx, extra); mn = Math.min(mn, extra); }
      var s = rowArea + (extra || 0), s2 = side * side;
      return Math.max(s2 * mx / (s * s), s * s / (s2 * mn));
    }
    function place() {
      var horiz = free.w >= free.h, side = Math.min(free.w, free.h), depth = rowArea / side, off = 0;
      row.forEach(function (k) {
        var len = areas[k] / depth;
        cells.push(horiz
          ? { rank: k, x: free.x, y: free.y + off, w: depth, h: len }
          : { rank: k, x: free.x + off, y: free.y, w: len, h: depth });
        off += len;
      });
      free = horiz
        ? { x: free.x + depth, y: free.y, w: free.w - depth, h: free.h }
        : { x: free.x, y: free.y + depth, w: free.w, h: free.h - depth };
    }
    i = 0;
    while (i < count) {
      var side = Math.min(free.w, free.h);
      if (!row.length || worst(areas[i], side) <= worst(null, side)) { row.push(i); rowArea += areas[i]; i++; }
      else { place(); row = []; rowArea = 0; }
    }
    if (row.length) place();
    return cells;
  }

  function build() {
    var box = svg.getBoundingClientRect();
    var W = 1000, H = Math.round(1000 * (box.height / Math.max(box.width, 1))) || 1000;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    // Odstęp i etykiety liczone w pikselach ekranu, nie jednostkach viewBox.
    var px = W / Math.max(box.width, 1);
    var gap = 1.6 * px;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    groups = new Array(COUNT);
    var frag = document.createDocumentFragment();
    layout(COUNT, W, H, 0.65).forEach(function (c) {
      var g = document.createElementNS(NS, "g");
      var r = document.createElementNS(NS, "rect");
      r.setAttribute("x", (c.x + gap / 2).toFixed(2));
      r.setAttribute("y", (c.y + gap / 2).toFixed(2));
      r.setAttribute("width", Math.max(c.w - gap, 0.5).toFixed(2));
      r.setAttribute("height", Math.max(c.h - gap, 0.5).toFixed(2));
      r.setAttribute("rx", (Math.min(c.w, c.h) > 40 * px ? 4 : 1.5) * px);
      g.appendChild(r);
      var word = words[c.rank] === "i" ? "I" : words[c.rank];
      var fs = Math.min(c.h * 0.42, (c.w - 6 * px) / (word.length * 0.62 + 0.3));
      if (fs >= 10 * px) {
        var t = document.createElementNS(NS, "text");
        t.setAttribute("x", (c.x + c.w / 2).toFixed(2));
        t.setAttribute("y", (c.y + c.h / 2).toFixed(2));
        t.setAttribute("font-size", fs.toFixed(2));
        t.textContent = word;
        g.appendChild(t);
      }
      groups[c.rank] = g;
      frag.appendChild(g);
    });
    svg.appendChild(frag);
    var n = lit; lit = -1; paint(n < 0 ? 0 : n);
  }

  // Zapala słowa 0..n-1; ostatnie kilkanaście „gorące” (limonka), reszta stonowana.
  function paint(n) {
    n = Math.max(0, Math.min(COUNT, n));
    if (n === lit) return;
    var hot = Math.max(0, n - 14);
    for (var k = 0; k < COUNT; k++) {
      var g = groups[k]; if (!g) continue;
      var on = k < n, h = on && k >= hot && n < COUNT;
      g.setAttribute("class", h ? "lit hot" : on ? "lit" : "");
    }
    lit = n;
    if (countEl) countEl.textContent = n;
    marks.forEach(function (m) { m.classList.toggle("on", n >= +m.getAttribute("data-mark")); });
  }

  function progress() {
    var r;
    if (section.classList.contains("scrolly")) {
      r = section.getBoundingClientRect();
      var span = r.height - window.innerHeight;
      return span > 0 ? -r.top / span : 1;
    }
    r = svg.getBoundingClientRect();
    var vh = window.innerHeight;
    // Od chwili, gdy mozaika wchodzi od dołu, do chwili, gdy jej dół mija 45% ekranu.
    var start = vh * 0.9, end = vh * 0.45 - r.height;
    return (start - r.top) / (start - end);
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var p = Math.max(0, Math.min(1, progress()));
      // Lekkie przyspieszenie na końcu, żeby ostatnie drobne pola nie ciągnęły się w nieskończoność.
      paint(Math.round(COUNT * (1 - Math.pow(1 - p, 1.3))));
    });
  }

  function mode() {
    var still = reduce.matches;
    section.classList.toggle("scrolly", !still && wide.matches);
    build();
    window.removeEventListener("scroll", onScroll);
    if (still) { paint(COUNT); return; }
    paint(0);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  var rt;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(mode, 150); });
  [reduce, wide].forEach(function (mq) {
    if (mq.addEventListener) mq.addEventListener("change", mode); else if (mq.addListener) mq.addListener(mode);
  });
  mode();
})();
