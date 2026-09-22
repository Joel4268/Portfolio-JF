(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Apparition au scroll ---------- */
  function initReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('on'));
      return;
    }
    let index = 0;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.style.transitionDelay = (index++ % 4) * 80 + 'ms';
        el.classList.add('on');
        setTimeout(() => { el.style.transitionDelay = ''; }, 900);
        observer.unobserve(el);
      });
    }, { threshold: 0.12 });
    items.forEach((el) => observer.observe(el));
  }

  /* ---------- Menu mobile ---------- */
  function initNav() {
    const burger = document.getElementById('burger');
    const menu = document.getElementById('menu');
    if (!burger || !menu) return;
    const icon = burger.querySelector('.material-symbols-outlined');
    const setOpen = (open) => {
      menu.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      if (icon) icon.textContent = open ? 'close' : 'menu';
    };
    burger.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  }

  /* ---------- Texte qui s'écrit ---------- */
  function initTyped() {
    const el = document.getElementById('typed');
    if (!el || reduceMotion) return;
    const words = ['Développeur Full Stack', 'Ingénieur DevOps', 'Développeur Web & Mobile'];
    let w = 0, i = words[0].length, deleting = true;
    const tick = () => {
      const word = words[w];
      el.textContent = word.slice(0, i);
      let delay = deleting ? 45 : 85;
      if (!deleting && i === word.length) { deleting = true; delay = 1800; }
      else if (deleting && i === 0) { deleting = false; w = (w + 1) % words.length; delay = 350; }
      i += deleting ? -1 : 1;
      if (i < 0) i = 0;
      setTimeout(tick, delay);
    };
    setTimeout(tick, 2200);
  }

  /* ---------- Compteurs ---------- */
  function initCounters() {
    const nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;
    const run = (el) => {
      const target = parseInt(el.dataset.count, 10);
      if (reduceMotion) { el.textContent = target; return; }
      const start = performance.now();
      const dur = 1400;
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { run(e.target); obs.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    nums.forEach((n) => obs.observe(n));
  }

  /* ---------- Inclinaison 3D des cartes ---------- */
  function initTilt() {
    if (reduceMotion || !finePointer) return;
    document.querySelectorAll('.tilt').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--ry', (px * 8).toFixed(2) + 'deg');
        card.style.setProperty('--rx', (-py * 8).toFixed(2) + 'deg');
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---------- Inclinaison douce de la photo de profil ---------- */
  function initPhotoTilt() {
    const wrap = document.querySelector('.photo-3d');
    if (!wrap || reduceMotion || !finePointer) return;
    const hero = document.getElementById('hero') || wrap;
    hero.addEventListener('pointermove', (e) => {
      const r = wrap.getBoundingClientRect();
      const px = (e.clientX - (r.left + r.width / 2)) / r.width;
      const py = (e.clientY - (r.top + r.height / 2)) / r.height;
      wrap.style.setProperty('--py', (px * 8).toFixed(2) + 'deg');
      wrap.style.setProperty('--px', (-py * 8).toFixed(2) + 'deg');
    });
    hero.addEventListener('pointerleave', () => {
      wrap.style.setProperty('--px', '0deg');
      wrap.style.setProperty('--py', '0deg');
    });
  }

  /* ---------- Filtres des projets ---------- */
  function initFilters() {
    const chips = document.querySelectorAll('[data-filter]');
    const cards = document.querySelectorAll('[data-cat]');
    const counter = document.getElementById('project-count');
    if (!chips.length || !cards.length) return;
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const f = chip.dataset.filter;
        chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
        let shown = 0;
        cards.forEach((card) => {
          const ok = f === 'all' || card.dataset.cat.split(' ').includes(f);
          card.hidden = !ok;
          if (ok) shown++;
        });
        if (counter) counter.textContent = shown + (shown > 1 ? ' projets affichés' : ' projet affiché');
      });
    });
  }

  /* ---------- Fenêtre de détails projet ---------- */
  function initProjectDialogs() {
    const dialog = document.getElementById('proj-dialog');
    if (!dialog) return;
    const titleEl = dialog.querySelector('.dlg-title');
    const metaEl = dialog.querySelector('.dlg-meta');
    const descEl = dialog.querySelector('.dlg-desc');
    const listEl = dialog.querySelector('.dlg-list');
    const tagsEl = dialog.querySelector('.dlg-tags');
    const gitEl = dialog.querySelector('.dlg-git');
    const closeBtn = dialog.querySelector('.dlg-close');

    const fill = (list, el, render) => {
      el.innerHTML = '';
      list.forEach((item) => el.appendChild(render(item)));
    };

    document.querySelectorAll('[data-open-project]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const card = btn.closest('[data-cat]');
        if (!card) return;
        titleEl.textContent = card.dataset.title || '';

        fill(JSON.parse(card.dataset.meta || '[]'), metaEl, (m) => {
          const span = document.createElement('span');
          span.innerHTML = `<span class="material-symbols-outlined">${m.icon}</span>${m.text}`;
          return span;
        });

        descEl.textContent = card.dataset.desc || '';

        const points = JSON.parse(card.dataset.points || '[]');
        listEl.style.display = points.length ? '' : 'none';
        fill(points, listEl, (t) => {
          const li = document.createElement('li');
          li.innerHTML = `<span class="material-symbols-outlined">check_circle</span><span>${t}</span>`;
          return li;
        });

        fill((card.dataset.tags || '').split(',').filter(Boolean), tagsEl, (t) => {
          const span = document.createElement('span');
          span.className = 'tag';
          span.textContent = t;
          return span;
        });

        const gitUrl = card.dataset.git;
        gitEl.style.display = gitUrl ? '' : 'none';
        if (gitUrl) gitEl.href = gitUrl;

        dialog.showModal();
      });
    });

    closeBtn.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  }

  /* ================================================================
     Fond 3D animé de la section d'accueil : nappe ondulante façon
     écran de connexion MinIO — un seul dégradé bleu, sans grille ni
     motif superposé à la photo.
  ================================================================ */
  function initScene() {
    const canvas = document.getElementById('scene');
    if (!canvas || !window.THREE) return;
    const T = window.THREE;

    let renderer;
    try {
      renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch (err) {
      canvas.style.display = 'none';
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 3.1, 6.4);
    camera.lookAt(0, -0.2, -3);

    /* Nappe ondulante : lignes horizontales seules (pas de croisillons/
       quadrillage), façon courbes de niveau — même esprit que la vague
       animée de l'écran de connexion MinIO. */
    const W = 30, D = 24, ROWS = 34, PTS = 90;
    const rowsBase = [];
    const linePositions = new Float32Array(ROWS * (PTS - 1) * 2 * 3);
    const lineColors = new Float32Array(ROWS * (PTS - 1) * 2 * 3);

    for (let r = 0; r < ROWS; r++) {
      const row = new Float32Array(PTS);
      const z = -1 - (r / (ROWS - 1)) * D;
      for (let i = 0; i < PTS; i++) row[i] = z;
      rowsBase.push({ z, xs: (() => {
        const xs = new Float32Array(PTS);
        for (let i = 0; i < PTS; i++) xs[i] = -W / 2 + (i / (PTS - 1)) * W;
        return xs;
      })() });
    }

    const colorDeep = new T.Color(0x0b3265);
    const colorMid = new T.Color(0x2979ff);
    const colorGlow = new T.Color(0x9fcdff);

    const lineGeo = new T.BufferGeometry();
    lineGeo.setAttribute('position', new T.BufferAttribute(linePositions, 3));
    lineGeo.setAttribute('color', new T.BufferAttribute(lineColors, 3));
    const mat = new T.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.6
    });
    const mesh = new T.LineSegments(lineGeo, mat);
    mesh.position.y = -1.7;
    scene.add(mesh);

    /* Fine brume de particules pour la profondeur */
    const STAR_COUNT = 140;
    const starPos = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 24;
      starPos[i * 3 + 1] = Math.random() * 7 - 0.5;
      starPos[i * 3 + 2] = -Math.random() * 20 - 1;
    }
    const starGeo = new T.BufferGeometry();
    starGeo.setAttribute('position', new T.BufferAttribute(starPos, 3));
    const stars = new T.Points(starGeo, new T.PointsMaterial({
      color: 0xb8d9ff, size: 0.035, transparent: true, opacity: 0.5, depthWrite: false
    }));
    scene.add(stars);

    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    layout();
    if ('ResizeObserver' in window) {
      new ResizeObserver(layout).observe(canvas);
    } else {
      window.addEventListener('resize', layout);
    }

    let mx = 0;
    window.addEventListener('pointermove', (e) => {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
    }, { passive: true });

    const clock = new T.Clock();
    let raf = 0;
    let running = false;

    const waveY = (x, z, t) =>
      Math.sin(x * 0.32 + t * 0.55) * 0.38 +
      Math.sin(z * 0.22 - t * 0.4) * 0.46 +
      Math.sin((x - z) * 0.15 + t * 0.25) * 0.22;

    const frame = () => {
      const t = clock.getElapsedTime();
      let p = 0, c = 0;

      for (let r = 0; r < ROWS; r++) {
        const { z, xs } = rowsBase[r];
        const depth = T.MathUtils.clamp((-z) / D, 0, 1);
        let prevY = waveY(xs[0], z, t);
        for (let i = 0; i < PTS - 1; i++) {
          const x0 = xs[i], x1 = xs[i + 1];
          const y0 = prevY;
          const y1 = waveY(x1, z, t);
          prevY = y1;

          linePositions[p++] = x0; linePositions[p++] = y0; linePositions[p++] = z;
          linePositions[p++] = x1; linePositions[p++] = y1; linePositions[p++] = z;

          const lift0 = T.MathUtils.clamp((y0 + 1) / 1.6, 0, 1);
          const lift1 = T.MathUtils.clamp((y1 + 1) / 1.6, 0, 1);
          const col0 = colorDeep.clone().lerp(colorMid, depth).lerp(colorGlow, lift0 * 0.6);
          const col1 = colorDeep.clone().lerp(colorMid, depth).lerp(colorGlow, lift1 * 0.6);
          lineColors[c++] = col0.r; lineColors[c++] = col0.g; lineColors[c++] = col0.b;
          lineColors[c++] = col1.r; lineColors[c++] = col1.g; lineColors[c++] = col1.b;
        }
      }
      lineGeo.attributes.position.needsUpdate = true;
      lineGeo.attributes.color.needsUpdate = true;

      camera.position.x = mx * 0.6;
      camera.lookAt(0, -0.2, -3);
      stars.rotation.y = t * 0.01;

      renderer.render(scene, camera);
      if (running) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    frame();
    if (!reduceMotion) start();

    const hero = document.getElementById('hero');
    if (hero && 'IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        if (reduceMotion) return;
        entries[0].isIntersecting ? start() : stop();
      }, { threshold: 0.05 }).observe(hero);
    }
    document.addEventListener('visibilitychange', () => {
      if (reduceMotion) return;
      document.hidden ? stop() : start();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initNav();
    initTyped();
    initCounters();
    initTilt();
    initPhotoTilt();
    initFilters();
    initProjectDialogs();
    initScene();
  });
})();
