(function () {
  var $ = function (s) { return document.querySelector(s); }, $$ = function (s) { return [].slice.call(document.querySelectorAll(s)); };
  var D = 'https://cdn.jsdelivr.net/npm/devicon@2.16.0/icons/', GH = 'https://github.com/Joel4268';
  var TL = [['rocket_launch', '04/2026 – 09/2026', 'Développeur DevOps && Développeur Full stack chez ITDC MADA', 'DockerOpt, EpiMad et VonjyMed : Docker, Jenkins, Prometheus', 'Expérience pro'],
    ['school', '2025 – 2026', 'Master 2 Professionnel en Informatique', 'E.N.I Fianarantsoa'], ['laptop_mac', '2024 – 2025', 'Master 1 Professionnel en Informatique', 'E.N.I Fianarantsoa'],
    ['menu_book', '2021 – 2024', 'Licence Professionnelle en Informatique', 'E.N.I Fianarantsoa', 'Mention Bien'], ['account_balance', '2020 – 2021', 'Baccalauréat Série C', 'Lycée Joël Sylvain, Ambalavao', 'Mention Assez-Bien']];
  var EXP = [['DockerOpt', 'Visualisation et optimisation des ressources des applications Docker.', 'Prometheus · cAdvisor · React · Node.js · PostgreSQL', 'https://docker-opt.duckdns.org'],
    ['EpiMad', 'Plateforme de suivi épidémiologique à Madagascar, déployée avec Docker, Jenkins et HTTPS.', 'FastAPI · PostgreSQL / PostGIS · Jenkins · Nginx · Certbot', 'https://epimad.ddns.net'],
    ['VonjyMed', 'Plateforme médicale réunissant patients et médecins, avec dossiers de santé.', 'NestJS · Next.js · MinIO · PostgreSQL · Jenkins', 'https://app-web-vonjy-med.duckdns.org']];
  // Remplacez GH par l'adresse exacte de chaque dépôt : GH + '/NOM-DU-DEPOT'
  var REPOS = [['Audit des retraits bancaires', 'Supervision et analyse des opérations bancaires. ENI, 02/2026.', 'Django · Python · PostgreSQL'], ['Plateforme de recrutement', 'Recherche d\'emploi et gestion des informations. Projet de fin d\'étude M1.', 'React JS · Express JS · PostgreSQL'],
    ['Gestion des salaires', 'Application mobile de gestion salariale des professeurs. ENI, 2025.', 'Java · MySQL'], ['Suivi d\'emploi des étudiants', 'Stage à la Faculté des Sciences de Fianarantsoa, 2023.', 'Flutter · Dart · Express JS · MySQL'], ['Gestion des pavillons', 'Stage à la Commune Urbaine d\'Ambalavao, 2022.', 'Laravel · MySQL · JavaScript']];
  var T = [['HTML5', 'html5'], ['CSS3', 'css3'], ['JavaScript', 'javascript'], ['TypeScript', 'typescript'], ['React', 'react'], ['Next.js', 'nextjs'], ['Node.js', 'nodejs'], ['NestJS', 'nestjs'], ['Express', 'express'], ['Python', 'python'], ['FastAPI', 'fastapi'], ['Django', 'django'], ['PHP', 'php'], ['Laravel', 'laravel'],
    ['PostgreSQL', 'postgresql'], ['MySQL', 'mysql'], ['SQLite', 'sqlite'], ['Docker', 'docker'], ['Jenkins', 'jenkins'], ['Git', 'git'], ['GitHub', 'github'], ['Nginx', 'nginx'], ['Prometheus', 'prometheus'], ['Linux', 'linux'], ['Flutter', 'flutter'], ['Dart', 'dart'], ['Java', 'java'], ['Android Studio', 'androidstudio']];
  var ico = function (n) { return D + n + '/' + n + '-original.svg'; };
  $('#tl').innerHTML = TL.map(function (t) { return '<article class="rv"><span class="ic"><i class="mi">' + t[0] + '</i></span><time>' + t[1] + '</time><h3>' + t[2] + '</h3><p>' + t[3] + '</p>' + (t[4] ? '<span class="pill">' + t[4] + '</span>' : '') + '</article>'; }).join('');
  $('#slider').innerHTML = EXP.map(function (p) { return '<article class="card rv"><span class="pill live"><i class="mi">fiber_manual_record</i> En ligne</span><h4>' + p[0] + '</h4><p>' + p[1] + '</p><small>' + p[2] + '</small><a class="btn btn-sm" href="' + p[3] + '" target="_blank" rel="noopener noreferrer">Voir le projet <i class="mi">open_in_new</i></a></article>'; }).join('');
  $('#repos').innerHTML = REPOS.map(function (p) { return '<article class="card rv"><h4>' + p[0] + '</h4><p>' + p[1] + '</p><small>' + p[2] + '</small><a class="btn btn-sm btn-ghost" href="' + GH + '" target="_blank" rel="noopener noreferrer">Voir sur GitHub <i class="mi">open_in_new</i></a></article>'; }).join('');
  var tile = function (t, i) { return '<div class="sk" style="--d:-' + (i % 5) + 's"><div><img loading="lazy" src="' + ico(t[1]) + '" alt="' + t[0] + '" onerror="this.outerHTML=\'<b>' + t[0].slice(0, 2) + '</b>\'"></div>' + t[0] + '</div>'; };
  [T.slice(0, 14), T.slice(14)].forEach(function (a, k) { var h = a.map(tile).join(''); $('#mq').insertAdjacentHTML('beforeend', '<div class="row' + (k ? ' rev' : '') + '">' + h + h + '</div>'); });
  $('#ring').innerHTML = ['docker', 'react', 'nodejs', 'jenkins', 'postgresql', 'git'].map(function (n, i) { return '<span style="--r:' + i * 60 + 'deg"><img src="' + ico(n) + '" alt="' + n + '"></span>'; }).join('');
  var nav = $('#nav'), tl = $('#tl'), links = $$('.menu a[href^="#"]');
  function onScroll() {
    nav.classList.toggle('stuck', scrollY > 20);
    links.forEach(function (a) { var s = $(a.getAttribute('href')), y = scrollY + 120; a.classList.toggle('on', s.offsetTop <= y && s.offsetTop + s.offsetHeight > y); });
    var r = tl.getBoundingClientRect(); tl.style.setProperty('--p', Math.max(0, Math.min(1, (innerHeight * .6 - r.top) / r.height)) * 100 + '%');
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  $('#burger').onclick = function () { $('#menu').classList.toggle('open'); }; $('#menu').onclick = function () { this.classList.remove('open'); };
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .12 });
  $$('.rv').forEach(function (el) { io.observe(el); });
  $$('.arrows button').forEach(function (b) { b.onclick = function () { $('#slider').scrollBy({ left: b.dataset.dir * 384, behavior: 'smooth' }); }; });
  $$('.card,.cv').forEach(function (el) {
    el.onmousemove = function (e) { var r = el.getBoundingClientRect(); el.style.transform = 'rotateY(' + ((e.clientX - r.left) / r.width - .5) * 12 + 'deg) rotateX(' + -((e.clientY - r.top) / r.height - .5) * 12 + 'deg) translateZ(8px)'; };
    el.onmouseleave = function () { el.style.transform = ''; };
  });
  var W = ['DevOps', 'Mobile', 'Cloud', 'Web'], wi = 0, ci = 0, del = false;
  (function tick() { var w = W[wi]; ci += del ? -1 : 1; $('#ty').textContent = w.slice(0, ci); if (!del && ci === w.length) { del = true; return setTimeout(tick, 1400); } if (del && ci === 0) { del = false; wi = (wi + 1) % W.length; } setTimeout(tick, del ? 60 : 110); })();
  $$('[data-n]').forEach(function (el) { var v = 0, t = setInterval(function () { el.textContent = ++v; if (v >= +el.dataset.n) clearInterval(t); }, 180); });
  emailjs.init('gZlLcr5SoH6DT0ScF'); var form = $('#form'), st = $('#status'), btn = $('#send');
  function say(ok, t) { st.hidden = false; st.className = 'status ' + (ok ? 'ok' : 'ko'); st.textContent = t; }
  function validEmail(e) {
    var d = (e.split('@')[1] || '').toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(e) || /^(gmai|gmil|yaho|hotmai|outlok)\.com$/.test(d)) return Promise.resolve(false);
    return fetch('https://dns.google/resolve?name=' + d + '&type=MX').then(function (r) { return r.json(); }).then(function (j) { return !!(j.Answer && j.Answer.length); }).catch(function () { return true; });
  }
  form.onsubmit = function (ev) {
    ev.preventDefault(); if (!form.checkValidity()) return form.reportValidity();
    btn.disabled = true; btn.textContent = 'Envoi en cours…';
    validEmail($('#email').value.trim()).then(function (ok) {
      if (!ok) return say(false, "L'adresse e-mail est invalide. Veuillez vérifier votre saisie.");
      return emailjs.sendForm('service_5kjugn9', 'template_ygwbnom', form).then(function () { say(true, 'Votre message a bien été envoyé !'); form.reset(); }).catch(function () { say(false, "Une erreur est survenue lors de l'envoi."); });
    }).then(function () { btn.disabled = false; btn.textContent = 'Envoyer'; });
  };
})();
