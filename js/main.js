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

  document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.p-filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    // On vérifie que les éléments existent sur la page actuelle (ex: projets.html)
    if (filterButtons.length > 0 && projectCards.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const filterValue = button.getAttribute('data-filter');

                projectCards.forEach(card => {
                    const categories = card.getAttribute('data-category');
                    if (filterValue === 'all' || (categories && categories.includes(filterValue))) {
                        card.classList.remove('hide');
                    } else {
                        card.classList.add('hide');
                    }
                });
            });
        });
    }
});
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

  /* ---------- Tilt 3D Spécifique pour la Photo Pro ---------- */
  function initPhotoTilt() {
    const container = document.getElementById('photoProContainer');
    if (!container || reduceMotion || !finePointer) return;

    container.addEventListener('pointermove', (e) => {
      const r = container.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      
      const rx = (-py * 14).toFixed(2);
      const ry = (px * 14).toFixed(2);
      
      container.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    container.addEventListener('pointerleave', () => {
      container.style.transform = '';
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

  /* ---------- SCÈNE 3D MINIO LOGIN ---------- */
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

    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(FOV, 1, 0.1, 100);
    camera.position.z = CAM_Z;

    const root = new T.Group();
    scene.add(root);

    /* 1. Réseau de nœuds 3D interconnectés style MinIO Server */
    const nodeCount = 45;
    const nodes = [];
    const nodePositions = new Float32Array(nodeCount * 3);
    
    for (let i = 0; i < nodeCount; i++) {
      const x = (Math.random() - 0.5) * 16;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 8;
      nodes.push({ x, y, z, vx: (Math.random() - 0.5) * 0.008, vy: (Math.random() - 0.5) * 0.008 });
      nodePositions[i * 3] = x;
      nodePositions[i * 3 + 1] = y;
      nodePositions[i * 3 + 2] = z;
    }

    const pGeo = new T.BufferGeometry();
    pGeo.setAttribute('position', new T.BufferAttribute(nodePositions, 3));
    const pMat = new T.PointsMaterial({
      color: COLORS.glow,
      size: 0.12,
      transparent: true,
      opacity: 0.85
    });
    const pointCloud = new T.Points(pGeo, pMat);
    root.add(pointCloud);

    /* Lignes de connexion réseau dynamic */
    const lineGeo = new T.BufferGeometry();
    const lineMat = new T.LineBasicMaterial({
      color: COLORS.sky,
      transparent: true,
      opacity: 0.25
    });
    const lineMesh = new T.LineSegments(lineGeo, lineMat);
    root.add(lineMesh);

    /* 2. Cubes de stockage MinIO flottants en 3D */
    const cubes = [];
    const cubeGroup = new T.Group();
    root.add(cubeGroup);

    for (let i = 0; i < 8; i++) {
      const geo = new T.BoxGeometry(0.5, 0.5, 0.5);
      const mat = new T.MeshBasicMaterial({
        color: i % 2 === 0 ? COLORS.gold : COLORS.sky,
        wireframe: true,
        transparent: true,
        opacity: 0.5
      });
      const mesh = new T.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6
      );
      cubeGroup.add(mesh);
      cubes.push({
        mesh,
        rotX: (Math.random() - 0.5) * 0.02,
        rotY: (Math.random() - 0.5) * 0.02
      });
    }

    /* Redimensionnement */
    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    layout();
    window.addEventListener('resize', layout);

    /* Interaction Souris */
    let mx = 0, my = 0;
    window.addEventListener('pointermove', (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 0.8;
      my = (e.clientY / window.innerHeight - 0.5) * 0.8;
    }, { passive: true });

    /* Boucle d'animation MinIO */
    const clock = new T.Clock();
    let raf = 0;

    const animate = () => {
      const dt = clock.getDelta();
      
      // Animation douce de la caméra / scène
      root.rotation.y += (mx - root.rotation.y) * 0.05;
      root.rotation.x += (my - root.rotation.x) * 0.05;

      // Mise à jour des positions des nœuds
      const linePositions = [];
      const posAttr = pointCloud.geometry.attributes.position;

      for (let i = 0; i < nodeCount; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (Math.abs(n.x) > 8) n.vx *= -1;
        if (Math.abs(n.y) > 5) n.vy *= -1;

        posAttr.setXYZ(i, n.x, n.y, n.z);

        // Connexions entre nœuds proches
        for (let j = i + 1; j < nodeCount; j++) {
          const n2 = nodes[j];
          const dist = Math.hypot(n.x - n2.x, n.y - n2.y, n.z - n2.z);
          if (dist < 3.2) {
            linePositions.push(n.x, n.y, n.z);
            linePositions.push(n2.x, n2.y, n2.z);
          }
        }
      }

      posAttr.needsUpdate = true;
      lineGeo.setAttribute('position', new T.Float32BufferAttribute(linePositions, 3));

      // Animation des cubes
      cubes.forEach((c) => {
        c.mesh.rotation.x += c.rotX;
        c.mesh.rotation.y += c.rotY;
      });

      renderer.render(scene, camera);
      if (!reduceMotion) raf = requestAnimationFrame(animate);
    };

    animate();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initNav();
    initTyped();
    initCounters();
    initTilt();
    initPhotoTilt();
    initFilters();
    initScene();
  });
})();