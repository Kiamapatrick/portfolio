/* ============================================================
   PATRICK KIAMA — certifications.js
   Certifications page animations.
   All base behaviour (navbar, hamburger, smooth scroll,
   .fade-in reveal) comes from main.js.
   This file adds page-specific interactions only.
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initCertCardReveal();
  initProgressBars();
  initPlatformHoverGlow();
});

/* ============================================================
   1. CERT CARD STAGGER REVEAL
   Each grid of cert cards fades children in with a stagger
   as the grid enters the viewport.
   ============================================================ */
function initCertCardReveal() {
  const grids = document.querySelectorAll('.cert-grid');
  if (!grids.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const cards = entry.target.querySelectorAll('.cert-card');
      cards.forEach((card, i) => {
        card.style.opacity    = '0';
        card.style.transform  = 'translateY(18px)';
        card.style.transition = `opacity 0.55s ease ${i * 0.08}s, transform 0.55s ease ${i * 0.08}s`;

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            card.style.opacity   = '1';
            card.style.transform = 'translateY(0)';
          });
        });
      });

      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -20px 0px',
  });

  grids.forEach(grid => {
    grid.querySelectorAll('.cert-card').forEach(card => {
      card.style.opacity   = '0';
      card.style.transform = 'translateY(18px)';
    });
    observer.observe(grid);
  });
}

/* ============================================================
   2. PROGRESS BARS — animate width when card scrolls into view
   ============================================================ */
function initProgressBars() {
  const bars = document.querySelectorAll('.cert-progress-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      // Trigger the CSS transition by adding the class
      entry.target.classList.add('animated');
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.5,
  });

  bars.forEach(bar => observer.observe(bar));
}

/* ============================================================
   3. PLATFORM CARDS — subtle radial glow that follows cursor
   ============================================================ */
function initPlatformHoverGlow() {
  document.querySelectorAll('.cert-platform-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width)  * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.background =
        `radial-gradient(circle at ${x}% ${y}%, rgba(37,99,235,0.03), transparent 65%), var(--bg-card)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.background = '';
    });
  });
}