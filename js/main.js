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
          if (ok) { shown++; card.classList.add('on'); }
        });
        if (counter) counter.textContent = shown + (shown > 1 ? ' projets affichés' : ' projet affiché');
      });
    });
  }

  /* ---------- Scène 3D (Three.js) ---------- */
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

    const COLORS = { gold: 0xf0c060, sky: 0x2979ff, glow: 0x5ca8ff, frost: 0xb8d9ff };
    const FOV = 45;
    const CAM_Z = 12;
    const MAX_R = 3.6;

    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(FOV, 1, 0.1, 100);
    camera.position.z = CAM_Z;

    const root = new T.Group();   // placé sur la photo et mis à l'échelle
    const tilt = new T.Group();   // réagit à la souris
    scene.add(root);
    root.add(tilt);

    /* Particules */
    const COUNT = 260;
    const positions = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const r = 4.2 + Math.random() * 3.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const pGeo = new T.BufferGeometry();
    pGeo.setAttribute('position', new T.BufferAttribute(positions, 3));
    const particles = new T.Points(pGeo, new T.PointsMaterial({
      color: COLORS.glow, size: 0.05, transparent: true, opacity: 0.75, depthWrite: false
    }));
    tilt.add(particles);

    /* Formes filaires flottantes */
    const wire = (geo, color, opacity) => new T.Mesh(
      geo, new T.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity })
    );
    const shapes = [
      { mesh: wire(new T.IcosahedronGeometry(0.6, 0), COLORS.gold, 0.85), pos: [2.9, 2.3, -1.0], spin: [0.5, 0.7] },
      { mesh: wire(new T.OctahedronGeometry(0.55, 0), COLORS.sky, 0.9), pos: [-3.1, -1.7, 0.8], spin: [0.6, -0.5] },
      { mesh: wire(new T.TorusKnotGeometry(0.42, 0.13, 90, 12), COLORS.frost, 0.7), pos: [3.1, -1.5, 1.0], spin: [0.35, 0.55] },
      { mesh: wire(new T.TetrahedronGeometry(0.45, 0), COLORS.glow, 0.85), pos: [-2.7, 2.6, 0.4], spin: [-0.4, 0.6] }
    ];
    shapes.forEach((s) => { s.mesh.position.set(...s.pos); tilt.add(s.mesh); });

    /* Anneaux orbitaux + étiquettes de technologies */
    const ringDefs = [
      { r: 3.3, color: COLORS.gold, tx: 1.15, tz: 0.2, speed: 0.22, labels: ['React', 'Node.js', 'Docker', 'Python'] },
      { r: 3.0, color: COLORS.sky, tx: -0.9, tz: -0.5, speed: -0.28, labels: ['Flutter', 'PostgreSQL', 'Jenkins'] },
      { r: 3.6, color: COLORS.frost, tx: 0.35, tz: 0.9, speed: 0.16, labels: ['Laravel', 'Django', 'Git', 'Prometheus'] }
    ];
    const rings = [];
    const sprites = [];

    const hex = (n) => '#' + n.toString(16).padStart(6, '0');
    const roundRect = (g, x, y, w, h, r) => {
      g.beginPath();
      g.moveTo(x + r, y);
      g.arcTo(x + w, y, x + w, y + h, r);
      g.arcTo(x + w, y + h, x, y + h, r);
      g.arcTo(x, y + h, x, y, r);
      g.arcTo(x, y, x + w, y, r);
      g.closePath();
    };
    const makeLabel = (text, color) => {
      const c = document.createElement('canvas');
      c.width = 320; c.height = 96;
      const g = c.getContext('2d');
      roundRect(g, 6, 6, 308, 84, 42);
      g.fillStyle = 'rgba(7, 30, 61, 0.9)';
      g.fill();
      g.lineWidth = 3;
      g.strokeStyle = hex(color);
      g.stroke();
      g.fillStyle = hex(color);
      g.beginPath(); g.arc(46, 48, 9, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#eaf3ff';
      g.font = '600 34px Outfit, "Segoe UI", Arial, sans-serif';
      g.textBaseline = 'middle';
      g.fillText(text, 72, 50);
      const tex = new T.CanvasTexture(c);
      tex.anisotropy = 4;
      const spr = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
      spr.scale.set(1.8, 0.54, 1);
      return spr;
    };

    const buildRings = () => {
      ringDefs.forEach((def) => {
        const pivot = new T.Group();
        pivot.rotation.set(def.tx, 0, def.tz);
        const spinner = new T.Group();
        pivot.add(spinner);

        const torus = new T.Mesh(
          new T.TorusGeometry(def.r, 0.012, 8, 180),
          new T.MeshBasicMaterial({ color: def.color, transparent: true, opacity: 0.55 })
        );
        spinner.add(torus);

        const comet = new T.Mesh(
          new T.SphereGeometry(0.09, 16, 16),
          new T.MeshBasicMaterial({ color: def.color })
        );
        comet.position.set(def.r, 0, 0);
        spinner.add(comet);

        def.labels.forEach((text, i) => {
          const a = (i / def.labels.length) * Math.PI * 2 + 0.6;
          const spr = makeLabel(text, def.color);
          spr.position.set(Math.cos(a) * def.r, Math.sin(a) * def.r, 0);
          spinner.add(spr);
          sprites.push(spr);
        });

        tilt.add(pivot);
        rings.push({ spinner, speed: def.speed });
      });
    };

    /* Dimensionnement : centré sur la photo */
    const photo = document.querySelector('.photo-wrapper');
    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      const ppu = h / (2 * Math.tan(T.MathUtils.degToRad(FOV / 2)) * CAM_Z);
      let cx = w / 2, cy = h / 2, pw = 300;
      if (photo) {
        const pr = photo.getBoundingClientRect();
        cx = pr.left + pr.width / 2 - rect.left;
        cy = pr.top + pr.height / 2 - rect.top;
        pw = pr.width;
      }
      // 0.78 : marge pour que les étiquettes ne soient pas coupées sur les bords
      const R = Math.min(pw * 0.8, Math.min(cx, w - cx) * 0.78, cy * 0.98);
      root.scale.setScalar(R / (MAX_R * ppu));
      root.position.set((cx - w / 2) / ppu, -(cy - h / 2) / ppu, 0);
    };

    layout();
    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(layout);
      ro.observe(canvas);
      if (photo) ro.observe(photo);
    } else {
      window.addEventListener('resize', layout);
    }
    window.addEventListener('load', layout);

    /* Souris */
    let mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener('pointermove', (e) => {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    /* Boucle d'animation */
    const clock = new T.Clock();
    const v = new T.Vector3();
    let raf = 0;
    let running = false;

    const frame = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      rx += (my * 0.3 - rx) * 0.05;
      ry += (mx * 0.45 - ry) * 0.05;
      tilt.rotation.y = ry + Math.sin(t * 0.3) * 0.08;
      tilt.rotation.x = rx * 0.8 + Math.cos(t * 0.25) * 0.05;

      rings.forEach((r) => { r.spinner.rotation.z += r.speed * dt; });
      shapes.forEach((s) => {
        s.mesh.rotation.x += s.spin[0] * dt;
        s.mesh.rotation.y += s.spin[1] * dt;
        s.mesh.position.y = s.pos[1] + Math.sin(t * 0.8 + s.pos[0]) * 0.12;
      });
      particles.rotation.y = t * 0.03;

      const depthRange = MAX_R * root.scale.x;
      sprites.forEach((spr) => {
        spr.getWorldPosition(v);
        const d = (v.z - root.position.z) / depthRange;
        spr.material.opacity = 0.45 + 0.55 * (d * 0.5 + 0.5);
      });

      renderer.render(scene, camera);
      if (running) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running || reduceMotion) return;
      running = true;
      clock.getDelta();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    const ready = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    ready.then(() => {
      buildRings();
      layout();
      frame();           // premier rendu (image fixe si mouvement réduit)
      start();
    });

    const hero = document.getElementById('hero');
    if (hero && 'IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        entries[0].isIntersecting ? start() : stop();
      }, { threshold: 0.05 }).observe(hero);
    }
    document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initNav();
    initTyped();
    initCounters();
    initTilt();
    initFilters();
    initScene();
  });
})();