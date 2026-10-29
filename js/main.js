(function () {
  var $ = function (s) { return document.querySelector(s); };
  var nav = $('#nav'), menu = $('#menu');

  // Menu collant + lien actif
  var links = [].slice.call(document.querySelectorAll('.menu a[href^="#"]'));
  function onScroll() {
    nav.classList.toggle('stuck', window.scrollY > 20);
    var y = window.scrollY + 120;
    links.forEach(function (a) {
      var s = $(a.getAttribute('href'));
      a.classList.toggle('on', s.offsetTop <= y && s.offsetTop + s.offsetHeight > y);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  $('#burger').addEventListener('click', function () { menu.classList.toggle('open'); });
  menu.addEventListener('click', function () { menu.classList.remove('open'); });

  // Apparition au défilement
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .12 });
  document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });


  // Logos des outils (Devicon)
  var D = 'https://cdn.jsdelivr.net/npm/devicon@2.16.0/icons/';
  var T = [['HTML5','html5'],['CSS3','css3'],['JavaScript','javascript'],['TypeScript','typescript'],['React','react'],['Next.js','nextjs'],['Node.js','nodejs'],['NestJS','nestjs'],['Express','express'],['Python','python'],['FastAPI','fastapi'],['Django','django'],['PHP','php'],['Laravel','laravel'],['PostgreSQL','postgresql'],['MySQL','mysql'],['SQLite','sqlite'],['Docker','docker'],['Jenkins','jenkins'],['Git','git'],['GitHub','github'],['Nginx','nginx'],['Prometheus','prometheus'],['Linux','linux'],['Flutter','flutter'],['Dart','dart'],['Java','java'],['Android Studio','androidstudio']];
  function tile(t, i) {
    return '<div class="sk" style="--d:-' + (i % 5) + 's"><div><img loading="lazy" src="' + D + t[1] + '/' + t[1] + '-original.svg" alt="' + t[0] + '" onerror="this.outerHTML=\'<b>' + t[0].slice(0, 2) + '</b>\'"></div>' + t[0] + '</div>';
  }
  var half = Math.ceil(T.length / 2);
  [T.slice(0, half), T.slice(half)].forEach(function (a, k) {
    var h = a.map(tile).join('');
    $('#mq').insertAdjacentHTML('beforeend', '<div class="row' + (k ? ' rev' : '') + '">' + h + h + '</div>');
  });
  var ring = $('#ring');
  ['docker','react','nodejs','jenkins','postgresql','git'].forEach(function (n, i) {
    ring.insertAdjacentHTML('beforeend', '<span style="--r:' + i * 60 + 'deg"><img src="' + D + n + '/' + n + '-original.svg" alt="' + n + '"></span>');
  });

  // Texte tapé
  var W = ['DevOps', 'Mobile', 'Cloud', 'Web'], wi = 0, ci = 0, del = false, ty = $('#ty');
  (function tick() {
    var w = W[wi]; ci += del ? -1 : 1; ty.textContent = w.slice(0, ci);
    if (!del && ci === w.length) { del = true; return setTimeout(tick, 1400); }
    if (del && ci === 0) { del = false; wi = (wi + 1) % W.length; }
    setTimeout(tick, del ? 60 : 110);
  })();

  // Compteurs
  document.querySelectorAll('[data-n]').forEach(function (el) {
    var n = +el.dataset.n, v = 0;
    var t = setInterval(function () { el.textContent = ++v; if (v >= n) clearInterval(t); }, 180);
  });

  // Ligne de progression du parcours
  var tl = $('#tl');
  function prog() {
    var r = tl.getBoundingClientRect(), p = (innerHeight * .6 - r.top) / r.height;
    tl.style.setProperty('--p', Math.max(0, Math.min(1, p)) * 100 + '%');
  }
  addEventListener('scroll', prog, { passive: true }); prog();

  // Inclinaison 3D
  document.querySelectorAll('.card,.cv').forEach(function (el) {
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.transform = 'rotateY(' + x * 12 + 'deg) rotateX(' + -y * 12 + 'deg) translateZ(8px)';
    });
    el.addEventListener('mouseleave', function () { el.style.transform = ''; });
  });

  // Carrousel des projets en ligne
  var slider = $('#slider');
  document.querySelectorAll('.arrows button').forEach(function (b) {
    b.addEventListener('click', function () {
      slider.scrollBy({ left: b.dataset.dir * (slider.firstElementChild.offsetWidth + 24), behavior: 'smooth' });
    });
  });

  // Formulaire de contact (EmailJS)
  emailjs.init('gZlLcr5SoH6DT0ScF');
  var form = $('#form'), st = $('#status'), btn = $('#send');
  function say(ok, t) { st.hidden = false; st.className = 'status ' + (ok ? 'ok' : 'ko'); st.textContent = t; }
  function validEmail(e) {
    if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(e)) return Promise.resolve(false);
    var d = e.split('@')[1].toLowerCase();
    if (['gmai.com', 'gmil.com', 'yaho.com', 'hotmai.com', 'outlok.com'].indexOf(d) > -1) return Promise.resolve(false);
    return fetch('https://dns.google/resolve?name=' + d + '&type=MX')
      .then(function (r) { return r.json(); })
      .then(function (j) { return !!(j.Answer && j.Answer.length); })
      .catch(function () { return true; });
  }
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    btn.disabled = true; btn.textContent = 'Vérification…';
    validEmail($('#email').value.trim()).then(function (ok) {
      if (!ok) { say(false, "L'adresse e-mail est invalide. Veuillez vérifier votre saisie."); return; }
      btn.textContent = 'Envoi en cours…';
      return emailjs.sendForm('service_5kjugn9', 'template_ygwbnom', form)
        .then(function () { say(true, 'Votre message a bien été envoyé !'); form.reset(); })
        .catch(function () { say(false, "Une erreur est survenue lors de l'envoi."); });
    }).then(function () { btn.disabled = false; btn.textContent = 'Envoyer'; });
  });
})();
