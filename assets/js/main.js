/* Beta Matric Hr. Sec. School: interactions (vanilla, no dependencies) */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  };

  /* ---------- Theme ---------- */
  const saved = store.get('beta-theme');
  if (saved) root.dataset.theme = saved;
  $('[data-theme-toggle]').addEventListener('click', () => {
    const dark = root.dataset.theme
      ? root.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    store.set('beta-theme', root.dataset.theme);
  });
  if (!saved && matchMedia('(prefers-color-scheme: dark)').matches) root.dataset.theme = 'dark';

  /* ---------- Split headings into words ---------- */
  $$('.split').forEach((el) => {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          const prev = n.previousSibling;
          n.textContent.split(/(\s+)/).forEach((part, k) => {
            if (!part) return;
            // glue punctuation straight after an <em> onto its last word so it never wraps alone
            if (k === 0 && /^[.,;:!?]+$/.test(part) && prev && prev.nodeType === 1) {
              const last = [...prev.querySelectorAll('.w > span')].pop();
              if (last) {
                const p = document.createElement('span');
                p.className = 'punct';
                p.textContent = part;
                last.append(p);
                return;
              }
            }
            if (/^\s+$/.test(part)) { frag.append(' '); return; }
            const w = document.createElement('span');
            w.className = 'w';
            const inner = document.createElement('span');
            inner.style.setProperty('--i', i++);
            inner.textContent = part;
            w.append(inner);
            frag.append(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    walk(el);
    $$('.w', el).forEach((w) => w.setAttribute('aria-hidden', 'true'));
  });

  /* ---------- Loader ---------- */
  const loader = $('.loader');
  const num = $('[data-loader-num]');
  let loaded = false;
  const finishLoad = () => {
    if (loaded) return;
    loaded = true;
    num.textContent = '35';
    loader.classList.add('is-done');
    document.body.classList.add('is-loaded');
    setTimeout(() => $$('.hero .reveal, .hero .reveal-img, .hero .split').forEach((el) => el.classList.add('is-in')), 250);
  };
  if (reduce) { num.textContent = '35'; finishLoad(); }
  else {
    const t0 = performance.now(), dur = 1300;
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      num.textContent = Math.round(35 * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
      else setTimeout(finishLoad, 250);
    };
    requestAnimationFrame(tick);
    setTimeout(finishLoad, 2200); // rAF pauses in background tabs
  }

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target._revealChild || e.target;
      el.classList.add('is-in');
      if (el.dataset.count !== undefined) countUp(el);
      io.unobserve(e.target);
    });
  }, { threshold: 0.01, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal, .reveal-img, .split, [data-timeline], .results, [data-count]')
    .filter((el) => !el.closest('.hero'))
    .forEach((el) => {
      // clip-path hides the element from IO, so watch its parent instead
      if (el.classList.contains('reveal-img')) { el.parentElement._revealChild = el; io.observe(el.parentElement); }
      else io.observe(el);
    });
  root.classList.add('js');

  /* ---------- Counters ---------- */
  function countUp(el) {
    const end = +el.dataset.count;
    if (reduce) { el.textContent = end; return; }
    const t0 = performance.now(), dur = 1800;
    const step = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- Nav: scrolled / hide on scroll-down / progress / active link ---------- */
  const nav = $('[data-nav]');
  const bar = $('.progress span');
  const dock = $('[data-dock]');
  const ring = $('.dock__ring circle');
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? y / max : 0;
    bar.style.transform = `scaleX(${p})`;
    ring.style.strokeDashoffset = 100.5 * (1 - p);
    nav.classList.toggle('is-scrolled', y > 40);
    const drawerOpen = $('[data-drawer]').classList.contains('is-open');
    nav.classList.toggle('is-hidden', !drawerOpen && y > 600 && y > lastY + 4);
    if (y < lastY - 4) nav.classList.remove('is-hidden');
    dock.classList.toggle('is-on', y > 700);
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const links = $$('.nav__links a');
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach((s) => spy.observe(s));

  /* ---------- Mobile drawer ---------- */
  const burger = $('[data-burger]');
  const drawer = $('[data-drawer]');
  const setDrawer = (open) => {
    drawer.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    drawer.setAttribute('aria-hidden', !open);
    document.body.classList.toggle('is-locked', open);
    if (open) nav.classList.remove('is-hidden');
  };
  burger.addEventListener('click', () => setDrawer(!drawer.classList.contains('is-open')));
  $$('a', drawer).forEach((a) => a.addEventListener('click', () => setDrawer(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer.classList.contains('is-open')) setDrawer(false); });
  matchMedia('(min-width: 1121px)').addEventListener('change', (m) => m.matches && setDrawer(false));

  /* ---------- Hero parallax (pointer) ---------- */
  const visual = $('[data-tilt]');
  if (visual && !reduce && matchMedia('(pointer: fine)').matches) {
    const layers = $$('[data-depth]', visual);
    let raf;
    visual.parentElement.addEventListener('pointermove', (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = visual.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) / r.width;
        const y = (e.clientY - (r.top + r.height / 2)) / r.height;
        layers.forEach((l) => {
          const d = +l.dataset.depth * 18;
          l.style.transform = `translate3d(${-x * d}px, ${-y * d}px, 0)`;
        });
      });
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (!reduce && matchMedia('(pointer: fine)').matches) {
    $$('.magnetic').forEach((b) => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
      });
      b.addEventListener('pointerleave', () => (b.style.transform = ''));
    });
  }

  /* ---------- Facilities rail: buttons + drag ---------- */
  const rail = $('[data-rail]');
  const stepSize = () => (rail.firstElementChild.getBoundingClientRect().width + 18) * (innerWidth < 640 ? 1 : 2);
  $$('[data-slide]').forEach((b) =>
    b.addEventListener('click', () => rail.scrollBy({ left: b.dataset.slide === 'next' ? stepSize() : -stepSize() }))
  );
  let down = false, sx = 0, sl = 0, moved = false;
  rail.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return;
    down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft;
  });
  addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - sx;
    if (Math.abs(dx) > 4) { moved = true; rail.classList.add('is-drag'); }
    rail.scrollLeft = sl - dx;
  });
  addEventListener('pointerup', () => {
    if (!down) return;
    down = false;
    rail.classList.remove('is-drag');
  });
  rail.addEventListener('click', (e) => moved && e.preventDefault(), true);
  rail.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') rail.scrollBy({ left: stepSize() / 2 });
    if (e.key === 'ArrowLeft') rail.scrollBy({ left: -stepSize() / 2 });
  });

  /* ---------- Tabs (toppers) ---------- */
  const tablist = $('[role="tablist"]');
  const tabs = $$('[role="tab"]', tablist);
  const ink = $('.tabs__ink', tablist);
  const moveInk = (t) => { ink.style.width = t.offsetWidth + 'px'; ink.style.transform = `translateX(${t.offsetLeft - 5}px)`; };
  const selectTab = (t) => {
    tabs.forEach((x) => {
      const on = x === t;
      x.setAttribute('aria-selected', on);
      x.tabIndex = on ? 0 : -1;
      $('#' + x.getAttribute('aria-controls')).hidden = !on;
    });
    moveInk(t);
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t));
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      const n = tabs[(i + d + tabs.length) % tabs.length];
      n.focus(); selectTab(n);
    });
  });
  const syncInk = () => moveInk(tabs.find((t) => t.getAttribute('aria-selected') === 'true'));
  addEventListener('resize', syncInk);
  addEventListener('load', syncInk);
  syncInk();

  /* ---------- Rules search ---------- */
  const search = $('[data-rule-search]');
  const acc = $('[data-acc]');
  const items = $$('.acc__item', acc);
  items.forEach((d) => $$('li', d).forEach((li) => (li.dataset.text = li.textContent)));
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  search.addEventListener('input', () => {
    const q = search.value.trim();
    const re = q ? new RegExp(`(${esc(q)})`, 'gi') : null;
    let any = false;
    items.forEach((d) => {
      let hits = 0;
      $$('li', d).forEach((li) => {
        const txt = li.dataset.text;
        const match = !re || re.test(txt);
        re && (re.lastIndex = 0);
        li.classList.toggle('is-hidden', !match);
        li.innerHTML = '';
        if (re && match) {
          txt.split(re).forEach((part, idx) => {
            if (idx % 2) { const m = document.createElement('mark'); m.textContent = part; li.append(m); }
            else li.append(part);
          });
        } else li.textContent = txt;
        if (match) hits++;
      });
      d.hidden = !!re && !hits;
      if (re && hits) d.open = true;
      if (hits) any = true;
    });
    $('.acc__empty', acc).hidden = any;
  });

  /* ---------- Gallery filter ---------- */
  const filterBtns = $$('[data-filter]');
  const tiles = $$('.tile');
  filterBtns.forEach((b) =>
    b.addEventListener('click', () => {
      filterBtns.forEach((x) => x.classList.toggle('is-on', x === b));
      const f = b.dataset.filter;
      tiles.forEach((t) => t.classList.toggle('is-out', f !== 'all' && t.dataset.cat !== f));
    })
  );

  /* ---------- Lightbox ---------- */
  const lb = $('[data-lb]');
  const lbImg = $('[data-lb-img]');
  const lbCap = $('[data-lb-cap]');
  let group = [], idx = 0, opener = null;
  const show = (i) => {
    idx = (i + group.length) % group.length;
    const el = group[idx];
    lbImg.src = el.dataset.lightbox;
    lbImg.alt = el.dataset.caption || '';
    lbCap.textContent = el.dataset.caption || '';
    lbImg.style.animation = 'none'; lbImg.offsetHeight; lbImg.style.animation = '';
  };
  const openLb = (el) => {
    const inGallery = el.classList.contains('tile');
    group = inGallery ? tiles.filter((t) => !t.classList.contains('is-out')) : [el];
    opener = el;
    $$('.lb__nav', lb).forEach((n) => (n.hidden = group.length < 2));
    show(group.indexOf(el));
    lb.hidden = false;
    document.body.classList.add('is-locked');
    $('[data-lb-close]').focus();
  };
  const closeLb = () => {
    lb.hidden = true;
    document.body.classList.remove('is-locked');
    opener && opener.focus();
  };
  $$('[data-lightbox]').forEach((el) => el.addEventListener('click', () => openLb(el)));
  $('[data-lb-close]').addEventListener('click', closeLb);
  $('[data-lb-prev]').addEventListener('click', () => show(idx - 1));
  $('[data-lb-next]').addEventListener('click', () => show(idx + 1));
  lb.addEventListener('click', (e) => e.target === lb && closeLb());
  addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowRight' && group.length > 1) show(idx + 1);
    if (e.key === 'ArrowLeft' && group.length > 1) show(idx - 1);
    if (e.key === 'Tab') {
      const f = $$('button:not([hidden])', lb);
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  let tx = 0;
  lb.addEventListener('touchstart', (e) => (tx = e.touches[0].clientX), { passive: true });
  lb.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50 && group.length > 1) show(idx + (dx < 0 ? 1 : -1));
  });

  /* ---------- Enquiry form → opens email to school ---------- */
  const form = $('[data-enquiry]');
  const note = $('[data-form-note]');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    $$('input[required], select[required]', form).forEach((f) => {
      const bad = !f.checkValidity();
      f.closest('.field').classList.toggle('is-error', bad);
      if (bad) ok = false;
    });
    if (!ok) { note.className = 'form-note err'; note.textContent = 'Please fill in your name, a valid mobile number and the class.'; return; }
    const d = Object.fromEntries(new FormData(form));
    const body = `Parent: ${d.name}\nMobile: ${d.phone}\nClass sought: ${d.class}\n\n${d.message || ''}`;
    location.href = `mailto:betamhss@gmail.com?subject=${encodeURIComponent('Admission enquiry – ' + d.class)}&body=${encodeURIComponent(body)}`;
    note.className = 'form-note ok';
    note.textContent = 'Thank you! Your email app is opening. You can also call +91 93810 03423.';
    form.reset();
  });
  $$('input, select', form).forEach((f) => f.addEventListener('input', () => f.closest('.field').classList.remove('is-error')));

  /* ---------- Misc ---------- */
  $('[data-year]').textContent = new Date().getFullYear();
})();
