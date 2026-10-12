/* ============================================================
   PATRICK KIAMA — main.js
   Modular, clean JavaScript for all interactive features.
   Contact form now POSTs to the backend API.
   ============================================================ */

'use strict';

/* ── API base URL — update this when you deploy the backend ── */
var API_BASE = 'https://pk-portfolio-api.onrender.com'; // ← change after deploy
// During local development use: const API_BASE = 'http://localhost:5000';

/* ===== DOM Ready ===== */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHamburger();
  initTypingAnimation();
  initScrollFadeIn();
  initSmoothScroll();
  initProjectCards();
  initContactForm();
  initSkillCardGlow();
  initOrbit();
  initThemeToggle();
});

/* ============================================================
   1. NAVBAR — scroll-based background change
   ============================================================ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const handleScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ============================================================
   2. HAMBURGER MENU — mobile nav toggle
   ============================================================ */
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const navbar = document.querySelector('.navbar');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    }
  });
}

/* ============================================================
   3. TYPING ANIMATION — hero text cycles
   ============================================================ */
function initTypingAnimation() {
  const el = document.getElementById('typingText');
  if (!el) return;

  const phrases = [
    'Building Web Apps',
    'Building Blockchain Systems',
    'Building Secure Platforms',
    'Crafting APIs & Backends',
    'Deploying Smart Contracts',
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let paused = false;

  const TYPE_SPEED = 75;
  const DELETE_SPEED = 40;
  const PAUSE_AFTER = 1600;
  const PAUSE_BEFORE = 300;

  function tick() {
    if (paused) return;

    const currentPhrase = phrases[phraseIndex];

    if (!isDeleting) {
      charIndex++;
      el.textContent = currentPhrase.slice(0, charIndex);

      if (charIndex === currentPhrase.length) {
        paused = true;
        setTimeout(() => {
          isDeleting = true;
          paused = false;
          setTimeout(tick, DELETE_SPEED);
        }, PAUSE_AFTER);
        return;
      }
      setTimeout(tick, TYPE_SPEED);
    } else {
      charIndex--;
      el.textContent = currentPhrase.slice(0, charIndex);

      if (charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        paused = true;
        setTimeout(() => {
          paused = false;
          setTimeout(tick, TYPE_SPEED);
        }, PAUSE_BEFORE);
        return;
      }
      setTimeout(tick, DELETE_SPEED);
    }
  }

  setTimeout(tick, 1200);
}

/* ============================================================
   4. SCROLL FADE-IN — Intersection Observer for sections
   ============================================================ */
function initScrollFadeIn() {
  const fadeElements = document.querySelectorAll('.fade-in');
  if (!fadeElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -30px 0px',
  });

  fadeElements.forEach(el => observer.observe(el));
}

/* ============================================================
   5. SMOOTH SCROLLING — anchor links
   ============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const navHeight = document.getElementById('navbar')?.offsetHeight || 70;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });
}

/* ============================================================
   6. PROJECT CARDS — hover tilt interaction
   ============================================================ */
function initProjectCards() {
  const cards = document.querySelectorAll('.project-card');
  if (!cards.length) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-6px) rotateX(${y * -4}deg) rotateY(${x * 4}deg)`;
      card.style.transition = 'transform 0.1s ease';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease, border-color 0.4s ease';
    });
  });
}

/* ============================================================
   7. CONTACT FORM (index.html) — POST to backend API
   ============================================================ */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = form.querySelector('[type="submit"]');
    const originalText = btn.textContent;
    const name = form.querySelector('#name')?.value?.trim();
    const email = form.querySelector('#email')?.value?.trim();
    const message = form.querySelector('#message')?.value?.trim();

    // Basic client-side guard
    if (!name || !email || !message) return;

    btn.textContent = 'Sending…';
    btn.disabled = true;

    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        btn.textContent = '✓ Message Sent!';
        btn.style.background = '#16a34a';
        form.reset();

        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.disabled = false;
        }, 3500);
      } else {
        // Show server-side error (e.g. validation, rate limit)
        const errMsg = data.errors?.[0] || data.error || 'Something went wrong.';
        btn.textContent = `⚠ ${errMsg}`;
        btn.style.background = '#dc2626';
        btn.disabled = false;

        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
        }, 4000);
      }

    } catch (err) {
      // Network / CORS error
      console.error('Contact form error:', err);
      btn.textContent = '⚠ Could not connect. Try email.';
      btn.style.background = '#dc2626';
      btn.disabled = false;

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
      }, 4000);
    }
  });
}

/* ============================================================
   8. SKILL CARD GLOW TRAIL
   ============================================================ */
function initSkillCardGlow() {
  document.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(37,99,235,0.04), transparent 60%), var(--bg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.background = '';
    });
  });
}

/* ============================================================
   9. TECH STACK ORBIT
   ============================================================ */
function initOrbit() {
  'use strict';

  const TECHS = [
    { id: 'html5', label: 'HTML5', cat: 'Frontend', emoji: '🌐', desc: 'Semantic, accessible markup — the foundation of every web page Patrick builds.', tags: ['Semantic', 'Accessible', 'SEO'] },
    { id: 'css3', label: 'CSS3', cat: 'Frontend', emoji: '🎨', desc: 'Advanced layouts with Grid, Flexbox, animations, and custom properties for pixel-perfect UI.', tags: ['Grid', 'Flexbox', 'Animations'] },
    { id: 'js', label: 'JavaScript', cat: 'Frontend', emoji: '⚡', desc: 'ES6+ JavaScript for dynamic, interactive web experiences — client and server side.', tags: ['ES6+', 'DOM', 'Async/Await'] },
    { id: 'react', label: 'React', cat: 'Frontend', emoji: '⚛', desc: 'Component-based UI development with hooks, context, and state management.', tags: ['Hooks', 'Context', 'SPA'] },
    { id: 'nextjs', label: 'Next.js', cat: 'Frontend', emoji: '▲', desc: 'Full-stack React framework with SSR, SSG, and API routes for production-grade apps.', tags: ['SSR', 'SSG', 'API Routes'] },
    { id: 'responsive', label: 'Responsive', cat: 'Frontend', emoji: '📱', desc: 'Mobile-first responsive design using CSS Grid, Flexbox, and media queries.', tags: ['Mobile', 'Grid', 'Flexbox'] },
    { id: 'nodejs', label: 'Node.js', cat: 'Backend', emoji: '🟢', desc: 'Server-side JavaScript runtime for building scalable backend services and APIs.', tags: ['Runtime', 'Event Loop', 'NPM'] },
    { id: 'express', label: 'Express.js', cat: 'Backend', emoji: '🚂', desc: 'Minimalist web framework for building RESTful APIs and middleware-driven backends.', tags: ['REST', 'Middleware', 'Routing'] },
    { id: 'auth', label: 'Auth Systems', cat: 'Backend', emoji: '🔐', desc: 'JWT, OAuth2, session-based auth, and secure role-based access control.', tags: ['JWT', 'OAuth2', 'RBAC'] },
    { id: 'mongo', label: 'MongoDB', cat: 'Database', emoji: '🍃', desc: 'NoSQL document database for flexible, scalable data storage in modern apps.', tags: ['NoSQL', 'Documents', 'Atlas'] },
    { id: 'pg', label: 'PostgreSQL', cat: 'Database', emoji: '🐘', desc: 'Powerful relational database for complex queries, ACID compliance, and data integrity.', tags: ['SQL', 'ACID', 'Relational'] },
    { id: 'mysql', label: 'MySQL', cat: 'Database', emoji: '🗄', desc: "Widely-used relational database powering many of Patrick's web platforms.", tags: ['SQL', 'Relational', 'Indexes'] },
    { id: 'solidity', label: 'Solidity', cat: 'Blockchain', emoji: '💎', desc: 'Smart contract programming language for Ethereum-compatible blockchains.', tags: ['EVM', 'Smart Contracts', 'ABI'] },
    { id: 'remix', label: 'Remix IDE', cat: 'Blockchain', emoji: '🔧', desc: 'Browser-based IDE for writing, testing, and deploying Solidity smart contracts.', tags: ['IDE', 'Deploy', 'Debug'] },
    { id: 'metamask', label: 'MetaMask', cat: 'Blockchain', emoji: '🦊', desc: "Browser wallet and dApp gateway — integrated in all of Patrick's Web3 projects.", tags: ['Wallet', 'dApp', 'Signing'] },
    { id: 'polygon', label: 'Polygon', cat: 'Blockchain', emoji: '⬡', desc: 'L2 Ethereum scaling network used for deploying low-cost smart contracts.', tags: ['L2', 'EVM', 'Low fees'] },
    { id: 'web3js', label: 'Web3.js', cat: 'Blockchain', emoji: '🌍', desc: 'JavaScript library for interacting with Ethereum nodes from the frontend.', tags: ['ABI', 'Providers', 'Events'] },
    { id: 'evm', label: 'EVM', cat: 'Blockchain', emoji: '⚙', desc: 'Ethereum Virtual Machine — the execution environment for all EVM-compatible smart contracts.', tags: ['Ethereum', 'Opcodes', 'State'] },
    { id: 'mpesa', label: 'M-Pesa API', cat: 'Payments', emoji: '💚', desc: "Safaricom Daraja API for mobile money payments in Patrick's Kenyan platforms.", tags: ['Daraja', 'STK Push', 'Kenya'] },
    { id: 'paystack', label: 'Paystack', cat: 'Payments', emoji: '💳', desc: 'Payment gateway for African markets used for checkout flows in web apps.', tags: ['Checkout', 'Africa', 'Cards'] },
    { id: 'stripe', label: 'Stripe', cat: 'Payments', emoji: '💰', desc: 'International payment processing for subscription billing and one-time payments.', tags: ['Cards', 'Webhooks', 'SCA'] },
    { id: 'vscode', label: 'VS Code', cat: 'Tools', emoji: '🔷', desc: 'Primary code editor with extensions for linting, debugging, and productivity.', tags: ['IDE', 'Extensions', 'Debug'] },
    { id: 'git', label: 'Git', cat: 'Tools', emoji: '🔀', desc: 'Version control for tracking changes, branching, and collaboration.', tags: ['Branching', 'Commits', 'Merge'] },
    { id: 'github', label: 'GitHub', cat: 'Tools', emoji: '🙂', desc: 'Code hosting, CI/CD pipelines, and open-source collaboration.', tags: ['Repos', 'Actions', 'PRs'] },
    { id: 'postman', label: 'Postman', cat: 'Tools', emoji: '📮', desc: 'API testing and documentation tool used throughout the development workflow.', tags: ['API Testing', 'Collections', 'Mock'] },
    { id: 'npm', label: 'npm', cat: 'Tools', emoji: '📦', desc: 'Node Package Manager for installing, managing, and publishing JavaScript packages.', tags: ['Packages', 'Registry', 'Scripts'] },
    { id: 'cursor', label: 'Cursor', cat: 'AI Tools', emoji: '✦', desc: 'AI-first code editor for accelerated development with inline completions and chat.', tags: ['AI Coding', 'Copilot', 'Autocomplete'] },
    { id: 'windsurf', label: 'Windsurf', cat: 'AI Tools', emoji: '🏄', desc: 'Next-gen AI coding tool for full-stack dev with agentic code generation.', tags: ['AI', 'Agent', 'Full Stack'] },
    { id: 'ibm', label: 'IBM', cat: 'Learning', emoji: '🔵', desc: 'IBM Data Science Professional Certificate — machine learning, Python, and data analysis.', tags: ['Data Science', 'Python', 'ML'] },
    { id: 'cisco', label: 'Cisco', cat: 'Learning', emoji: '🛡', desc: 'Cisco Cybersecurity certification covering network security and ethical hacking.', tags: ['Cybersecurity', 'Networks'] },
    { id: 'zalego', label: 'Zalego', cat: 'Learning', emoji: '📚', desc: 'Programming certification from Zalego Institute covering applied software development.', tags: ['Programming', 'Certificate'] },
    { id: 'credly', label: 'Credly', cat: 'Learning', emoji: '🏅', desc: 'Digital badge platform verifying multiple skills and completed learning paths.', tags: ['Badges', 'Verified', 'Digital'] },
    { id: 'netlify', label: 'Netlify', cat: 'Deployment', emoji: '🌿', desc: 'JAMstack deployment with automatic builds, preview deploys, and serverless functions.', tags: ['CI/CD', 'JAMstack', 'CDN'] },
    { id: 'vercel', label: 'Vercel', cat: 'Deployment', emoji: '◆', desc: 'Zero-config deployment platform optimised for Next.js and frontend frameworks.', tags: ['Next.js', 'Edge', 'Serverless'] },
    { id: 'ghpages', label: 'GH Pages', cat: 'Deployment', emoji: '📄', desc: 'GitHub Pages for hosting static sites and project demos directly from repos.', tags: ['Static', 'Free', 'GitHub'] },
  ];

  const CATS = ['All', ...[...new Set(TECHS.map(t => t.cat))]];

  const cfWrap = document.getElementById('catFilter');
  const stage = document.getElementById('orbitStage');
  const canvas = document.getElementById('orbitCanvas');
  const infoBox = document.getElementById('orbitInfo');
  if (!cfWrap || !stage || !canvas || !infoBox) return;

  const IS_MOBILE = () => window.innerWidth <= 600;

  function buildMobileGrid() {
    stage.style.display = 'none';
    canvas.style.display = 'none';

    let grid = document.getElementById('orbitMobileGrid');
    if (grid) { grid.style.display = ''; return; }

    grid = document.createElement('div');
    grid.id = 'orbitMobileGrid';
    grid.className = 'orbit-mobile-grid';

    TECHS.forEach((t, i) => {
      const btn = document.createElement('button');
      btn.className = 'orbit-mobile-pill';
      btn.innerHTML = `<span class="omp-emoji">${t.emoji}</span><span class="omp-label">${t.label}</span>`;
      btn.addEventListener('click', () => showInfo(i));
      grid.appendChild(btn);
    });

    cfWrap.insertAdjacentElement('afterend', grid);
  }

  let activeIdx = null;
  const nodeEls = [];

  function showInfo(idx) {
    infoBox.style.opacity = '0';
    setTimeout(() => {
      if (idx === null) {
        document.getElementById('oiCat').textContent = 'All technologies';
        document.getElementById('oiName').textContent = "Patrick Kiama's Stack";
        document.getElementById('oiDesc').textContent = 'Tap any node to learn about a technology.';
        document.getElementById('oiTags').innerHTML = '';
      } else {
        const t = TECHS[idx];
        document.getElementById('oiCat').textContent = t.cat;
        document.getElementById('oiName').textContent = t.label;
        document.getElementById('oiDesc').textContent = t.desc;
        document.getElementById('oiTags').innerHTML = t.tags.map(tg => `<span class="oi-tag">${tg}</span>`).join('');
      }
      infoBox.style.opacity = '1';
    }, 160);
    activeIdx = idx;

    document.querySelectorAll('.orbit-mobile-pill').forEach((b, i) =>
      b.classList.toggle('active', i === idx));
    nodeEls.forEach((el, i) => el.classList.toggle('active', i === idx));
  }

  window.PKOrbit = { showInfo };

  let activeCat = 'All';

  CATS.forEach(c => {
    const b = document.createElement('button');
    b.className = 'cat-pill' + (c === 'All' ? ' active' : '');
    b.textContent = c;
    b.addEventListener('click', () => setCat(c));
    cfWrap.appendChild(b);
  });

  function setCat(c) {
    activeCat = c;
    cfWrap.querySelectorAll('.cat-pill').forEach(b =>
      b.classList.toggle('active', b.textContent === c));
    nodeEls.forEach((el, i) =>
      el.classList.toggle('dimmed', c !== 'All' && TECHS[i].cat !== c));
    document.querySelectorAll('.orbit-mobile-pill').forEach((el, i) =>
      el.classList.toggle('dimmed', c !== 'All' && TECHS[i].cat !== c));
  }

  const BASE_SPD = 0.00024;
  let angles = TECHS.map((_, i) => (i / TECHS.length) * Math.PI * 2);
  let speedMult = 1;
  let cachedW = 0;
  let rafRunning = false;
  const ctx = canvas.getContext('2d');

  function layout(W) {
    const tiny = W <= 300;
    const small = W <= 380;
    const rings = tiny ? 1 : small ? 1 : 2;
    const margin = tiny ? 0.06 : small ? 0.07 : 0.06;
    const outerR = W * (0.5 - margin);
    const innerR = W * (rings === 1 ? 0 : 0.29);
    return { rings, outerR, innerR };
  }

  TECHS.forEach((t, i) => {
    const el = document.createElement('button');
    el.className = 'tech-node';
    el.title = t.label;
    el.setAttribute('data-label', t.label);
    el.textContent = t.emoji || t.label[0];
    const toggle = () => showInfo(activeIdx === i ? null : i);
    el.addEventListener('click', toggle);
    el.addEventListener('touchend', e => { e.preventDefault(); toggle(); });
    stage.appendChild(el);
    nodeEls.push(el);
  });

  function onResize(W) {
    if (W <= 0) return;
    cachedW = W;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = W * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawRings(W, lay) {
    ctx.clearRect(0, 0, W, W);
    const cx = W / 2, cy = W / 2;
    const radii = lay.rings === 1 ? [lay.outerR] : [lay.innerR, lay.outerR];
    radii.forEach(r => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(37,99,235,0.12)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 8]);
      ctx.stroke();
      ctx.setLineDash([]);
    });
  }

  function positionNodes(W, lay) {
    const cx = W / 2, cy = W / 2;
    TECHS.forEach((_, i) => {
      const r = lay.rings === 1 ? lay.outerR : (i % 2 === 0 ? lay.outerR : lay.innerR);
      const x = cx + Math.cos(angles[i]) * r;
      const y = cy + Math.sin(angles[i]) * r;
      nodeEls[i].style.left = x + 'px';
      nodeEls[i].style.top = y + 'px';
    });
  }

  function animate() {
    if (!cachedW) { requestAnimationFrame(animate); return; }

    const W = cachedW;
    const lay = layout(W);
    const ss = Math.min(1, W / 400);

    angles = angles.map((a, i) =>
      a + BASE_SPD * speedMult * ss * (1 + (i % 3) * 0.2 + (i % 5) * 0.08));

    drawRings(W, lay);
    positionNodes(W, lay);
    requestAnimationFrame(animate);
  }

  stage.addEventListener('mouseenter', () => { speedMult = 0.08; });
  stage.addEventListener('mouseleave', () => { speedMult = 1; });
  stage.addEventListener('touchstart', () => { speedMult = 0.03; }, { passive: true });
  stage.addEventListener('touchend', () => { setTimeout(() => { speedMult = 1; }, 1400); });
  stage.addEventListener('touchcancel', () => { speedMult = 1; });

  function applyLayout() {
    if (IS_MOBILE()) {
      stage.style.display = 'none';
      buildMobileGrid();
    } else {
      stage.style.display = '';
      const mg = document.getElementById('orbitMobileGrid');
      if (mg) mg.style.display = 'none';
    }
  }

  const ro = new ResizeObserver(entries => {
    const W = entries[0]?.contentRect?.width || stage.offsetWidth;
    if (!IS_MOBILE()) {
      onResize(W);
      if (!rafRunning && W > 0) {
        rafRunning = true;
        requestAnimationFrame(animate);
      }
    }
  });
  ro.observe(stage);

  applyLayout();

  let resizeT;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(applyLayout, 120);
  }, { passive: true });
}

/* ============================================================
   10. THEME TOGGLE
   ============================================================ */
function initThemeToggle() {
  const currentTheme = localStorage.getItem('theme') || 'light';
  if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'theme-toggle';
  toggleBtn.setAttribute('aria-label', 'Toggle dark mode');
  toggleBtn.innerHTML = `
    <svg class="moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
    <svg class="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  `;
  document.body.appendChild(toggleBtn);

  toggleBtn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
  });
}

(function () {
  const BADGES = [
    { name: 'CyberOps Associate', issuer: 'Cisco', iconClass: 'bt-icon--cisco', emoji: '🛡' },
    { name: 'Ethical Hacker', issuer: 'Cisco', iconClass: 'bt-icon--cisco', emoji: '🎯' },
    { name: 'Linux Unhatched', issuer: 'Cisco', iconClass: 'bt-icon--cisco', emoji: '🐚' },
    { name: 'IBM Data Science Practitioner', issuer: 'IBM', iconClass: 'bt-icon--ibm', emoji: '🔵' },
    { name: 'IBM SkillsBuild Cybersecurity Certificate', issuer: 'IBM SkillsBuild', iconClass: 'bt-icon--ibm', emoji: '🔐' },
    { name: 'Cloud Security', issuer: 'IBM SkillsBuild', iconClass: 'bt-icon--ibm', emoji: '☁️' },
    { name: 'Docker Essentials', issuer: 'IBM', iconClass: 'bt-icon--ibm', emoji: '🐳' },
    { name: 'Governance, Risk & Compliance', issuer: 'IBM SkillsBuild', iconClass: 'bt-icon--ibm', emoji: '📋' },
    { name: 'Incident Response & Systems Forensics', issuer: 'IBM SkillsBuild', iconClass: 'bt-icon--ibm', emoji: '🔍' },
    { name: 'Quantum Enigmas', issuer: 'IBM SkillsBuild', iconClass: 'bt-icon--ibm', emoji: '⚛️' },
    { name: 'Security Operations & Management', issuer: 'IBM SkillsBuild', iconClass: 'bt-icon--ibm', emoji: '🖥️' },
    { name: 'System & Network Security', issuer: 'IBM SkillsBuild', iconClass: 'bt-icon--ibm', emoji: '🌐' },
    { name: 'Vulnerability Management', issuer: 'IBM SkillsBuild', iconClass: 'bt-icon--ibm', emoji: '🛠️' },
    { name: 'Web Development Fundamentals', issuer: 'IBM SkillsBuild', iconClass: 'bt-icon--ibm', emoji: '💻' },
    { name: 'Developing Secure Software', issuer: 'Linux Foundation', iconClass: 'bt-icon--lf', emoji: '🔒' },
    { name: 'Introduction to Linux', issuer: 'Linux Foundation', iconClass: 'bt-icon--linux', emoji: '🐧' },
    { name: 'Introduction to Kubernetes', issuer: 'Linux Foundation', iconClass: 'bt-icon--lf', emoji: '⚙️' },
    { name: 'Blockchain: Uses & Implications', issuer: 'Linux Foundation', iconClass: 'bt-icon--lf', emoji: '⛓️' },
  ];

  const toast = document.getElementById('badgeToast');
  const icon = document.getElementById('btIcon');
  const name = document.getElementById('btName');
  const issuer = document.getElementById('btIssuer');
  const progress = document.getElementById('btProgress');
  const closeBtn = document.getElementById('btClose');

  if (!toast) return;

  const DURATION = 4200; // ms per badge
  const PAUSE = 800;  // gap between badges
  let idx = 0;
  let timer, progressTimer, dismissed = false;

  function showBadge() {
    if (dismissed) return;
    const b = BADGES[idx % BADGES.length];

    icon.className = 'bt-icon ' + b.iconClass;
    icon.textContent = b.emoji;
    name.textContent = b.name;
    issuer.textContent = b.issuer;

    toast.classList.remove('bt-visible');
    void toast.offsetWidth; // reflow

    progress.style.transition = 'none';
    progress.style.transform = 'scaleX(1)';
    void progress.offsetWidth;

    toast.classList.add('bt-visible');

    // Link toast to certifications page
    toast.onclick = (e) => {
      if (e.target === closeBtn) return;
      window.location.href = 'certifications.html';
    };

    progress.style.transition = `transform ${DURATION}ms linear`;
    progress.style.transform = 'scaleX(0)';

    timer = setTimeout(() => {
      toast.classList.remove('bt-visible');
      idx++;
      setTimeout(() => { if (!dismissed) showBadge(); }, PAUSE);
    }, DURATION);
  }

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dismissed = true;
    clearTimeout(timer);
    toast.classList.remove('bt-visible');
  });

  // Start after page settles
  setTimeout(showBadge, 3500);
})();