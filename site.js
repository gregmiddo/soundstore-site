(function () {
  var root = document.documentElement;
  var header = document.querySelector('.site-header');
  function measure() { if (header) root.style.setProperty('--header-h', header.querySelector('.bar').offsetHeight + 'px'); }

  // One feature on screen at a time, chosen by the address (#feature-id).
  var stage = document.querySelector('.stage');
  var toc = document.querySelector('.toc');
  if (stage) {
    var baseTitle = document.title;
    var wideOK = window.matchMedia('(min-width: 900px) and (min-height: 560px)');
    // A long feature is tightened, then given a wider text column, until its copy fits the screen.
    var fit = function (f) {
      var c = f.querySelector('.copy'); if (!c) return;
      f.classList.remove('dense', 'wide', 'denser');
      if (!wideOK.matches) return;
      ['dense', 'wide', 'denser'].some(function (k) {
        if (c.scrollHeight <= c.clientHeight + 1) return true;
        f.classList.add(k); return false;
      });
    };
    window.addEventListener('resize', function () { var a = stage.querySelector('.feature.is-active'); if (a) fit(a); });
    var feats = Array.prototype.slice.call(stage.querySelectorAll('.feature'));
    var links = toc ? Array.prototype.slice.call(toc.querySelectorAll('a')) : [];
    var show = function () {
      var id = decodeURIComponent(location.hash.slice(1));
      var cur = feats.filter(function (f) { return f.id === id; })[0] || feats[0];
      feats.forEach(function (f) { f.classList.toggle('is-active', f === cur); });
      links.forEach(function (a) {
        var on = a.getAttribute('href') === '#' + cur.id;
        if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        if (on && toc) {
          if (toc.scrollWidth > toc.clientWidth + 2) toc.scrollLeft = a.offsetLeft - (toc.clientWidth - a.offsetWidth) / 2;
          else if (a.offsetTop < toc.scrollTop || a.offsetTop + a.offsetHeight > toc.scrollTop + toc.clientHeight) toc.scrollTop = a.offsetTop - toc.clientHeight / 3;
        }
      });
      var copy = cur.querySelector('.copy'); if (copy) copy.scrollTop = 0;
      fit(cur);
      window.scrollTo(0, 0);
      var h = cur.querySelector('h2');
      document.title = (h ? h.textContent + ' | ' : '') + baseTitle;
    };
    show();
    window.addEventListener('hashchange', show);

    // Arrow keys step through features.
    document.addEventListener('keydown', function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey || /input|textarea|select/i.test(e.target.tagName)) return;
      var cur = stage.querySelector('.feature.is-active'); if (!cur) return;
      var key = e.key === 'ArrowRight' || e.key === 'PageDown' ? 'next' : e.key === 'ArrowLeft' || e.key === 'PageUp' ? 'prev' : null;
      if (!key) return;
      var a = cur.querySelector('.steps [data-key="' + key + '"]');
      if (a) { e.preventDefault(); location.href = a.href; }
    });

    // Swap the main picture with its smaller companion.
    stage.addEventListener('click', function (e) {
      var b = e.target.closest('.inset'); if (!b) return;
      var main = b.parentNode.querySelector('.main'), small = b.querySelector('img');
      ['src', 'alt', 'width', 'height'].forEach(function (k) { var v = main.getAttribute(k); main.setAttribute(k, small.getAttribute(k)); small.setAttribute(k, v); });
    });
  }
  measure(); window.addEventListener('resize', measure);

  // Tour menus: one open at a time; close on outside click, Escape, or when a link inside is followed.
  Array.prototype.forEach.call(document.querySelectorAll('.menu'), function (menu, _, all) {
    menu.addEventListener('toggle', function () { if (menu.open) Array.prototype.forEach.call(all, function (m) { if (m !== menu) m.open = false; }); });
    document.addEventListener('click', function (e) { if (menu.open && !menu.contains(e.target)) menu.open = false; });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary').focus(); } });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) menu.open = false; });
  });

  // Home page: Music shop or Teaching studio. Remembered, and #shop / #studio in the address picks one.
  var picks = document.querySelectorAll('.chooser input');
  if (picks.length) {
    var setTour = function (k, save) {
      document.body.classList.toggle('tour-studio', k === 'studio');
      Array.prototype.forEach.call(picks, function (i) { i.checked = i.value === k; });
      if (save) { try { localStorage.setItem('ss-tour', k); } catch (e) {} }
    };
    var start = /^#(shop|studio)$/.test(location.hash) ? location.hash.slice(1) : null;
    if (!start) { try { start = localStorage.getItem('ss-tour'); } catch (e) {} }
    setTour(start === 'studio' ? 'studio' : 'shop', false);
    Array.prototype.forEach.call(picks, function (i) {
      i.addEventListener('change', function () { if (i.checked) { setTour(i.value, true); history.replaceState(null, '', '#' + i.value); } });
    });
  }

  // Filter on the A to Z page.
  var q = document.getElementById('q');
  if (q) {
    var items = document.querySelectorAll('#dir li[data-k]');
    var count = document.getElementById('count');
    q.addEventListener('input', function () {
      var terms = q.value.toLowerCase().trim().split(/\s+/).filter(Boolean), n = 0;
      items.forEach(function (li) { var ok = terms.every(function (t) { return li.dataset.k.indexOf(t) !== -1; }); li.hidden = !ok; if (ok) n++; });
      document.querySelectorAll('#dir .dir-page').forEach(function (p) { p.hidden = !p.querySelector('li:not([hidden])'); });
      document.querySelectorAll('#dir .dir-tour').forEach(function (p) { p.hidden = !p.querySelector('li:not([hidden])'); });
      count.textContent = n + (n === 1 ? ' feature' : ' features');
    });
  }
})();
