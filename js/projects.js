/* ============================================================
   PATRICK KIAMA — projects.js
   Projects page: modal system, stagger reveals, hover effects.
   Base behaviour (navbar, hamburger, smooth scroll, .fade-in)
   comes from main.js. This file only adds page-specific logic.
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initProjectModal();
  initProjectCardReveal();
  initCardTilt();
});

/* ============================================================
   1. PROJECT MODAL
   Reads data-* attributes from the clicked .proj-card and
   populates the modal, then opens it with a smooth animation.
   ============================================================ */
function initProjectModal() {
  const overlay   = document.getElementById('projModalOverlay');
  const modal     = document.getElementById('projModal');
  const closeBtn  = document.getElementById('projModalClose');
  const closeBtnF = document.getElementById('projModalCloseBtn');

  if (!overlay || !modal) return;

  /* ── Populate & open ── */
  function openModal(card) {
    const title    = card.dataset.title    || '';
    const overview = card.dataset.overview || '';
    const tech     = card.dataset.tech     || '';
    const problem  = card.dataset.problem  || '';
    const features = card.dataset.features || '';
    const link     = card.dataset.link     || '';

    // Category label — read from nearest section-label
    const section = card.closest('.proj-section');
    const catEl   = section ? section.querySelector('.section-label') : null;
    const cat     = catEl ? catEl.textContent.replace(/[0-9\/]/g,'').trim() : 'Project';

    document.getElementById('modalCategory').textContent = cat;
    document.getElementById('modalTitle').textContent    = title;
    document.getElementById('modalOverview').textContent = overview;
    document.getElementById('modalProblem').textContent  = problem;

    // Features — split by comma, build list items
    const featuresEl = document.getElementById('modalFeatures');
    featuresEl.innerHTML = '';
    features.split(',').map(f => f.trim()).filter(Boolean).forEach(f => {
      const li = document.createElement('li');
      li.textContent = f;
      featuresEl.appendChild(li);
    });

    // Tech tags
    const techEl = document.getElementById('modalTech');
    techEl.innerHTML = '';
    tech.split(',').map(t => t.trim()).filter(Boolean).forEach(t => {
      const span = document.createElement('span');
      span.textContent = t;
      techEl.appendChild(span);
    });

    // Project link
    const linkEl = document.getElementById('modalLink');
    if (link) {
      linkEl.href = link;
      linkEl.style.display = '';
    } else {
      linkEl.style.display = 'none';
    }

    // Open
    modal.scrollTop = 0;
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    // Focus trap — put focus on close button
    setTimeout(() => closeBtn.focus(), 60);
  }

  /* ── Close ── */
  function closeModal() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  /* ── Trigger buttons ── */
  document.querySelectorAll('.proj-read-more').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.proj-card');
      if (card) openModal(card);
    });
  });

  // Clicking the card image area also opens modal
  document.querySelectorAll('.proj-card-img').forEach(imgWrap => {
    imgWrap.style.cursor = 'pointer';
    imgWrap.addEventListener('click', () => {
      const card = imgWrap.closest('.proj-card');
      if (card) openModal(card);
    });
  });

  /* ── Close handlers ── */
  closeBtn.addEventListener('click',  closeModal);
  closeBtnF.addEventListener('click', closeModal);

  // Click outside modal panel
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
      closeModal();
    }
  });
}

/* ============================================================
   2. PROJECT CARD STAGGER REVEAL
   Each .proj-grid fades in its children sequentially as it
   enters the viewport.
   ============================================================ */
function initProjectCardReveal() {
  const grids = document.querySelectorAll('.proj-grid');
  if (!grids.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const cards = entry.target.querySelectorAll('.proj-card');
      cards.forEach((card, i) => {
        card.style.opacity    = '0';
        card.style.transform  = 'translateY(20px)';
        card.style.transition = `opacity 0.55s ease ${i * 0.1}s, transform 0.55s ease ${i * 0.1}s`;

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
    threshold: 0.06,
    rootMargin: '0px 0px -20px 0px',
  });

  grids.forEach(grid => {
    grid.querySelectorAll('.proj-card').forEach(card => {
      card.style.opacity   = '0';
      card.style.transform = 'translateY(20px)';
    });
    observer.observe(grid);
  });
}

/* ============================================================
   3. CARD TILT ON MOUSE MOVE
   Subtle perspective tilt matching the home page project cards,
   skipped on the wide hero card (SafeEscrow) to avoid odd feel.
   ============================================================ */
function initCardTilt() {
  const cards = document.querySelectorAll('.proj-card:not(.proj-card-hero)');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect  = card.getBoundingClientRect();
      const x     = (e.clientX - rect.left) / rect.width  - 0.5;
      const y     = (e.clientY - rect.top)  / rect.height - 0.5;
      const tiltX = y * -4;
      const tiltY = x *  4;

      card.style.transform  = `translateY(-6px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      card.style.transition = 'transform 0.1s ease';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = 'transform 0.45s cubic-bezier(0.4,0,0.2,1), box-shadow 0.45s ease, border-color 0.45s ease';
    });
  });
}