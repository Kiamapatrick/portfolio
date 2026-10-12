/* ============================================================
   PATRICK KIAMA — github.js
   GitHub page animations and interactions.
   Base behaviour (navbar, hamburger, smooth scroll, .fade-in)
   comes from main.js. This adds page-specific logic only.
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initContribGrid();
  initCardReveal();
  initWorkflowReveal();
  initCardHoverGlow();
});

/* ============================================================
   1. CONTRIBUTION GRID GENERATOR
   Fills the hero profile card with a realistic-looking
   GitHub-style contribution grid using randomised intensity.
   NOTE: This grid is purely decorative/illustrative — it is
   randomly generated on each page load and does not reflect
   actual GitHub contribution data.
   ============================================================ */
function initContribGrid() {
  const grid = document.getElementById('ghContribGrid');
  if (!grid) return;

  const totalCells = 18 * 7;          // 18 weeks × 7 days = 126 cells
  const levels = [0, 0, 0, 1, 1, 2, 3, 4]; // weighted towards light

  const fragment = document.createDocumentFragment();

  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement('div');
    cell.className = 'gh-contrib-cell';

    const lvl = levels[Math.floor(Math.random() * levels.length)];
    if (lvl > 0) cell.classList.add(`lvl-${lvl}`);

    // Slightly higher density in recent weeks (last third)
    const isRecent = i > totalCells * 0.65;
    if (isRecent && Math.random() > 0.45) {
      const boost = Math.min(4, lvl + 1);
      cell.className = `gh-contrib-cell lvl-${boost}`;
    }

    fragment.appendChild(cell);
  }

  grid.appendChild(fragment);

  // Animate cells in sequentially
  const cells = grid.querySelectorAll('.gh-contrib-cell');
  cells.forEach((cell, i) => {
    cell.style.opacity = '0';
    cell.style.transform = 'scale(0.6)';
    cell.style.transition = `opacity 0.3s ease ${i * 0.003}s, transform 0.3s ease ${i * 0.003}s`;

    // Trigger after a short page load delay
    setTimeout(() => {
      cell.style.opacity = '1';
      cell.style.transform = 'scale(1)';
    }, 800 + i * 3);
  });
}

/* ============================================================
   2. CARD GRID STAGGER REVEAL
   Applies staggered fade-in to repo cards, deploy cards,
   value cards, and mindset stat cards.
   ============================================================ */
function initCardReveal() {
  const selectors = [
    '.gh-repo-grid',
    '.gh-deploy-grid',
    '.gh-approach-values',
    '.gh-mindset-stats',
  ];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const children = entry.target.querySelectorAll(
        '.gh-repo-card, .gh-deploy-card, .gh-value-card, .gh-ms-card'
      );

      children.forEach((child, i) => {
        child.style.opacity   = '0';
        child.style.transform = 'translateY(18px)';
        child.style.transition = `opacity 0.52s ease ${i * 0.09}s, transform 0.52s ease ${i * 0.09}s`;

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            child.style.opacity   = '1';
            child.style.transform = 'translateY(0)';
          });
        });
      });

      observer.unobserve(entry.target);
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -20px 0px' });

  selectors.forEach(sel => {
    const el = document.querySelector(sel);
    if (!el) return;
    el.querySelectorAll('.gh-repo-card, .gh-deploy-card, .gh-value-card, .gh-ms-card').forEach(c => {
      c.style.opacity   = '0';
      c.style.transform = 'translateY(18px)';
    });
    observer.observe(el);
  });
}

/* ============================================================
   3. WORKFLOW STEP REVEAL
   Timeline-style steps stagger in as the workflow track
   enters the viewport.
   ============================================================ */
function initWorkflowReveal() {
  const track = document.querySelector('.gh-workflow-track');
  if (!track) return;

  const steps = track.querySelectorAll('.gh-step');
  steps.forEach(s => {
    s.style.opacity   = '0';
    s.style.transform = 'translateX(-12px)';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      steps.forEach((step, i) => {
        step.style.transition = `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            step.style.opacity   = '1';
            step.style.transform = 'translateX(0)';
          });
        });
      });

      observer.unobserve(entry.target);
    });
  }, { threshold: 0.06 });

  observer.observe(track);
}

/* ============================================================
   4. CARD HOVER GLOW (cursor-tracking radial)
   Same pattern used across all portfolio pages.
   ============================================================ */
function initCardHoverGlow() {
  const targets = [
    '.gh-repo-card',
    '.gh-value-card',
    '.gh-ms-card',
    '.gh-deploy-card',
  ];

  targets.forEach(sel => {
    document.querySelectorAll(sel).forEach(card => {
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
  });
}