/**
 * LazyCoders — main.js
 * Dark mode, mobile nav, 3D tilt cards, misc interactivity
 */

/* ── DARK MODE ── */
(function () {
  const root   = document.documentElement;
  const btn    = document.getElementById('darkToggle');
  const stored = localStorage.getItem('lc-theme');

  // Apply saved preference or system preference
  if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    root.classList.add('dark');
  }

  if (btn) {
    btn.addEventListener('click', () => {
      root.classList.toggle('dark');
      localStorage.setItem('lc-theme', root.classList.contains('dark') ? 'dark' : 'light');
    });
  }
})();

/* ── MOBILE MENU TOGGLE ── */
(function () {
  const menuBtn  = document.getElementById('mobileMenuBtn');
  const menu     = document.getElementById('mobileMenu');
  const menuIcon = document.getElementById('menuIcon');

  if (!menuBtn || !menu) return;

  menuBtn.addEventListener('click', () => {
    const isOpen = !menu.classList.contains('hidden');
    menu.classList.toggle('hidden');

    // Swap icon
    menuIcon.innerHTML = isOpen
      ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>'
      : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>';
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!menuBtn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.add('hidden');
      menuIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>';
    }
  });
})();

/* ── 3D TILT EFFECT FOR CARDS ── */
(function () {
  function applyTilt(cards, maxTilt = 8) {
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect   = card.getBoundingClientRect();
        const cx     = rect.left + rect.width  / 2;
        const cy     = rect.top  + rect.height / 2;
        const dx     = (e.clientX - cx) / (rect.width  / 2);
        const dy     = (e.clientY - cy) / (rect.height / 2);
        const tiltX  = -dy * maxTilt;
        const tiltY  =  dx * maxTilt;

        card.style.transform = `
          translateY(-10px)
          rotateX(${tiltX}deg)
          rotateY(${tiltY}deg)
        `;
        card.style.transition = 'transform 0.1s ease';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
      });
    });
  }

  // Apply tilt to member cards
  applyTilt(document.querySelectorAll('.member-card'), 10);

  // Apply a subtler tilt to project card inners
  applyTilt(document.querySelectorAll('.project-card-inner'), 5);
})();

/* ── SCROLL REVEAL ── */
(function () {
  const els = document.querySelectorAll('.animate-slide-up, .member-card, .project-card');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });
})();

/* ── SMOOTH SCROLL FOR ANCHOR LINKS ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ── VISITOR COUNTER ANIMATION ── */
(function () {
  const counters = document.querySelectorAll('[data-count]');
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-count'));
    let current  = 0;
    const step   = Math.max(1, Math.floor(target / 60));

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      counter.textContent = current.toLocaleString();
    }, 16);
  });
})();

/* ── TOAST NOTIFICATION HELPER ── */
window.showToast = function (message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `
    fixed bottom-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium
    flex items-center gap-2
    ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}
    animate-slide-up
  `;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : '❌'}</span>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
};

console.log('%cLazyCoders 🚀', 'font-size:20px;font-weight:bold;color:#f97316;');
console.log('%cBuilt with Node.js + EJS + TailwindCSS', 'color:#9ca3af;');
