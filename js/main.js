document.addEventListener('DOMContentLoaded', () => {
  // Animation au scroll (Reveal)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('on');
        
        // Animation des barres de progression
        const bars = entry.target.querySelectorAll('.sk-fill');
        bars.forEach(b => b.style.width = b.dataset.w + '%');
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});