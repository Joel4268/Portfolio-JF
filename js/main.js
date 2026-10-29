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
