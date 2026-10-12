/* ============================================================
   PATRICK KIAMA — blockchain.js
   Blockchain page animations and interactions.
   Base behaviour (navbar, hamburger, smooth scroll, .fade-in)
   all comes from main.js. This adds page-specific effects only.
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initBlockchainCardReveal();
  initPillarHoverGlow();
  initTechCardGlow();
  initChainNodeHighlight();
});

/* ============================================================
   1. STAGGER CARD REVEAL
   Applies to all card grids on the page — pillars, contracts,
   identity cards, tech cards, and future features.
   ============================================================ */
function initBlockchainCardReveal() {
  const selectors = [
    '.bc-approach-pillars',
    '.bc-contracts-cards',
    '.bc-identity-cards',
    '.bc-tech-grid',
    '.bc-future-features',
  ];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      // Pick child cards based on the parent type
      const children = entry.target.querySelectorAll(
        '.bc-pillar-card, .bc-contract-card, .bc-identity-card, .bc-tech-card, .bc-future-feature'
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
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -20px 0px',
  });

  selectors.forEach(sel => {
    const el = document.querySelector(sel);
    if (!el) return;

    // Pre-hide children
    el.querySelectorAll(
      '.bc-pillar-card, .bc-contract-card, .bc-identity-card, .bc-tech-card, .bc-future-feature'
    ).forEach(c => {
      c.style.opacity   = '0';
      c.style.transform = 'translateY(18px)';
    });

    observer.observe(el);
  });
}

/* ============================================================
   2. PILLAR CARD HOVER GLOW
   Radial cursor-tracking glow inside each approach pillar card.
   ============================================================ */
function initPillarHoverGlow() {
  document.querySelectorAll('.bc-pillar-card').forEach(card => {
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
   3. TECH CARD GLOW
   Same pattern applied to the tech grid cards.
   ============================================================ */
function initTechCardGlow() {
  document.querySelectorAll('.bc-tech-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width)  * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.background =
        `radial-gradient(circle at ${x}% ${y}%, rgba(37,99,235,0.04), transparent 60%), var(--bg-card)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.background = '';
    });
  });
}

/* ============================================================
   4. HERO CHAIN NODE HIGHLIGHT
   Clicking a chain node in the hero visually selects it with
   a brief flash, adding visual interactivity.
   ============================================================ */
function initChainNodeHighlight() {
  const nodes = document.querySelectorAll('.bc-node:not(.bc-node-center)');
  if (!nodes.length) return;

  nodes.forEach(node => {
    node.style.cursor = 'pointer';

    node.addEventListener('click', () => {
      // Reset all
      nodes.forEach(n => {
        n.style.borderColor = '';
        n.style.color       = '';
        n.style.background  = '';
        n.style.boxShadow   = '';
      });

      // Highlight clicked
      node.style.borderColor = 'var(--accent)';
      node.style.color       = 'var(--accent)';
      node.style.background  = 'var(--accent-light)';
      node.style.boxShadow   = 'var(--shadow-blue)';

      // Reset after 1.5s
      setTimeout(() => {
        node.style.borderColor = '';
        node.style.color       = '';
        node.style.background  = '';
        node.style.boxShadow   = '';
      }, 1500);
    });
  });
}