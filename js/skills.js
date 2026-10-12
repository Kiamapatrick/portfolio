/* ============================================================
   PATRICK KIAMA — skills.js
   Skills page animations and interactions.
   Base functionality (navbar, hamburger, smooth scroll)
   all comes from main.js — this file only adds skills-specific behaviour.
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initSkillCategoryReveal();
  initSkCardHoverGlow();
  initToolCardTilt();
  initBubbleHoverRipple();
});

/* ============================================================
   1. SKILL CATEGORY STAGGER REVEAL
   Each .sk-category fades in as it enters the viewport,
   with a slight extra delay so sibling cards stagger nicely.
   ============================================================ */
function initSkillCategoryReveal() {
  // .fade-in on .sk-category is already handled by main.js initScrollFadeIn()
  // This extends that to also stagger the individual sk-cards inside each category

  const cardGroups = document.querySelectorAll('.sk-cards-grid');
  if (!cardGroups.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const cards = entry.target.querySelectorAll('.sk-card');
      cards.forEach((card, i) => {
        // Cards start invisible via inline style, then fade in with stagger
        card.style.opacity    = '0';
        card.style.transform  = 'translateY(16px)';
        card.style.transition = `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s`;

        // Trigger reflow then animate
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

  cardGroups.forEach(grid => {
    // Set cards invisible before they're observed
    grid.querySelectorAll('.sk-card').forEach(card => {
      card.style.opacity   = '0';
      card.style.transform = 'translateY(16px)';
    });
    observer.observe(grid);
  });
}

/* ============================================================
   2. SKILL CARD HOVER GLOW
   A soft radial glow follows the cursor within each card —
   identical pattern to the home page skill cards.
   ============================================================ */
function initSkCardHoverGlow() {
  document.querySelectorAll('.sk-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width)  * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.background =
        `radial-gradient(circle at ${x}% ${y}%, rgba(37,99,235,0.04), transparent 65%), var(--bg-card)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.background = '';
    });
  });
}

/* ============================================================
   3. TOOL CARD SUBTLE TILT
   Matches the project card tilt from main.js but lighter.
   ============================================================ */
function initToolCardTilt() {
  document.querySelectorAll('.sk-tool-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect  = card.getBoundingClientRect();
      const x     = (e.clientX - rect.left) / rect.width  - 0.5;
      const y     = (e.clientY - rect.top)  / rect.height - 0.5;
      const tiltX = y * -5;
      const tiltY = x *  5;

      card.style.transform  = `translateY(-4px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      card.style.transition = 'transform 0.1s ease';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease, border-color 0.4s ease';
    });
  });
}

/* ============================================================
   4. HERO BUBBLE HOVER RIPPLE
   Briefly pause the float animation on hover so the
   cursor feel stays snappy.
   ============================================================ */
function initBubbleHoverRipple() {
  document.querySelectorAll('.sk-bubble').forEach(bubble => {
    bubble.addEventListener('mouseenter', () => {
      bubble.style.animationPlayState = 'paused';
    });
    bubble.addEventListener('mouseleave', () => {
      bubble.style.animationPlayState = 'running';
    });
  });
}