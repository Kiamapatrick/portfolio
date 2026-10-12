/* ============================================================
   PATRICK KIAMA — contact.js
   Contact page: form validation, character counter,
   card reveals, hover interactions, and API submission.
   ============================================================ */

'use strict';

/* ── API base URL — update this when you deploy the backend ── */
var API_BASE = 'https://pk-portfolio-api.onrender.com'; // ← change after deploy
// During local dev use: const API_BASE = 'http://localhost:5000';

document.addEventListener('DOMContentLoaded', () => {
  initContactForm();
  initCharCounter();
  initCardReveal();
  initAvailCardGlow();
});

/* ============================================================
   1. CONTACT FORM — validation + real API POST
   ============================================================ */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('ctSubmitBtn');
  const btnLabel = document.getElementById('ctBtnLabel');
  const toast = document.getElementById('ctSuccessToast');

  if (!form) return;

  /* ── Real-time validation helpers ── */
  function validateField(input, errorId, checkFn) {
    const err = document.getElementById(errorId);
    const ok = checkFn(input.value.trim());
    input.classList.toggle('is-valid', ok);
    input.classList.toggle('is-invalid', !ok);
    if (err) err.classList.toggle('visible', !ok);
    return ok;
  }

  const fields = {
    ctName: { el: document.getElementById('ctName'), errId: 'ctNameErr', check: v => v.length >= 2 },
    ctEmail: { el: document.getElementById('ctEmail'), errId: 'ctEmailErr', check: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
    ctSubject: { el: document.getElementById('ctSubject'), errId: 'ctSubjectErr', check: v => v !== '' },
    ctMessage: { el: document.getElementById('ctMessage'), errId: 'ctMessageErr', check: v => v.length >= 10 },
  };

  Object.values(fields).forEach(({ el, errId, check }) => {
    if (!el) return;
    let touched = false;
    el.addEventListener('blur', () => {
      touched = true;
      validateField(el, errId, check);
    });
    el.addEventListener('input', () => {
      if (touched) validateField(el, errId, check);
    });
  });

  /* ── Submit ── */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all fields
    let allValid = true;
    Object.values(fields).forEach(({ el, errId, check }) => {
      if (!el) return;
      if (!validateField(el, errId, check)) allValid = false;
    });

    if (!allValid) {
      submitBtn.style.animation = 'ctShake 0.35s ease';
      setTimeout(() => { submitBtn.style.animation = ''; }, 400);
      return;
    }

    // Collect form data
    const payload = {
      name: fields.ctName.el.value.trim(),
      email: fields.ctEmail.el.value.trim(),
      subject: fields.ctSubject.el.value.trim(),
      message: fields.ctMessage.el.value.trim(),
    };

    // Show loading state
    submitBtn.disabled = true;
    btnLabel.textContent = 'Sending…';

    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // ── Success ──
        btnLabel.textContent = '✓ Message Sent!';
        submitBtn.style.background = '#16a34a';

        // Show toast notification
        if (toast) toast.classList.add('visible');

        // Reset form
        form.reset();
        Object.values(fields).forEach(({ el }) => {
          if (!el) return;
          el.classList.remove('is-valid', 'is-invalid');
        });
        const charCount = document.getElementById('ctCharCount');
        if (charCount) charCount.textContent = '0';

        // Reset UI after 4s
        setTimeout(() => {
          btnLabel.textContent = 'Send Message';
          submitBtn.style.background = '';
          submitBtn.disabled = false;
          if (toast) toast.classList.remove('visible');
        }, 4000);

      } else {
        // ── Server validation / rate limit error ──
        const errMsg = data.errors?.[0] || data.error || 'Something went wrong. Please try again.';
        btnLabel.textContent = `⚠ ${errMsg}`;
        submitBtn.style.background = '#dc2626';
        submitBtn.disabled = false;

        setTimeout(() => {
          btnLabel.textContent = 'Send Message';
          submitBtn.style.background = '';
        }, 4500);
      }

    } catch (err) {
      // ── Network / CORS error ──
      console.error('Contact form network error:', err);
      btnLabel.textContent = '⚠ Could not connect. Try emailing directly.';
      submitBtn.style.background = '#dc2626';
      submitBtn.disabled = false;

      setTimeout(() => {
        btnLabel.textContent = 'Send Message';
        submitBtn.style.background = '';
      }, 5000);
    }
  });
}

/* ============================================================
   2. CHARACTER COUNTER for textarea
   ============================================================ */
function initCharCounter() {
  const textarea = document.getElementById('ctMessage');
  const counter = document.getElementById('ctCharCount');
  const MAX_CHARS = 1000;

  if (!textarea || !counter) return;

  textarea.addEventListener('input', () => {
    const len = textarea.value.length;
    counter.textContent = len;

    const parent = counter.closest('.ct-char-count');
    if (parent) {
      parent.style.color = len > MAX_CHARS * 0.9 ? '#ef4444' : '';
    }

    if (len > MAX_CHARS) {
      textarea.value = textarea.value.slice(0, MAX_CHARS);
      counter.textContent = MAX_CHARS;
    }
  });
}

/* ============================================================
   3. CARD STAGGER REVEAL
   ============================================================ */
function initCardReveal() {
  const selectors = [
    { wrap: '.ct-info-cards', items: '.ct-info-card' },
    { wrap: '.ct-social-links', items: '.ct-social-card' },
    { wrap: '.ct-avail-types', items: '.ct-avail-type-card' },
  ];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const items = entry.target.querySelectorAll(entry.target.dataset.items);
      items.forEach((item, i) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(16px)';
        item.style.transition = `opacity 0.5s ease ${i * 0.09}s, transform 0.5s ease ${i * 0.09}s`;

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          });
        });
      });

      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });

  selectors.forEach(({ wrap, items }) => {
    const el = document.querySelector(wrap);
    if (!el) return;

    el.querySelectorAll(items).forEach(c => {
      c.style.opacity = '0';
      c.style.transform = 'translateY(16px)';
    });

    el.dataset.items = items;
    observer.observe(el);
  });
}

/* ============================================================
   4. AVAILABILITY CARD GLOW
   ============================================================ */
function initAvailCardGlow() {
  document.querySelectorAll('.ct-avail-type-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.background =
        `radial-gradient(circle at ${x}% ${y}%, rgba(37,99,235,0.04), transparent 65%), var(--bg-card)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.background = '';
    });
  });
}

/* ============================================================
   Shake keyframe
   ============================================================ */
(function injectShake() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ctShake {
      0%,100% { transform: translateX(0); }
      20%     { transform: translateX(-6px); }
      40%     { transform: translateX(6px); }
      60%     { transform: translateX(-4px); }
      80%     { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(style);
})();
