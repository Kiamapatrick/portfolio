/* ============================================================
   PATRICK KIAMA — about.js
   About page specific JS — timeline stagger animations
   All base functionality lives in main.js (navbar, hamburger, etc.)
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initTimelineReveal();
  initValueCards();
});

/* ============================================================
   TIMELINE STAGGER REVEAL
   Uses IntersectionObserver — each item fades in with a delay
   ============================================================ */
function initTimelineReveal() {
  const items = document.querySelectorAll('.timeline-item');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -30px 0px',
  });

  items.forEach(item => observer.observe(item));
}

/* ============================================================
   VALUE CARDS — subtle interactive background gradient
   ============================================================ */
function initValueCards() {
  document.querySelectorAll('.value-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(37,99,235,0.04), transparent 65%), var(--bg-card)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.background = '';
    });
  });
}
