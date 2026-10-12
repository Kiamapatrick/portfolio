/* ============================================================
   PATRICK KIAMA — StaggeredMenu.js
   Vanilla JS port of the ReactBits StaggeredMenu component.
   Uses the Web Animations API (WAAPI) for smooth GSAP-like
   tweens — no external library needed.

   HOW IT WORKS:
   1. The script builds the staggered-menu-wrapper structure
      programmatically (pre-layers, panel, header) and injects
      it into <body> before all other children.
   2. The existing .navbar in index.html is hidden via CSS
      so the StaggeredMenu header takes over.
   3. All GSAP-style animation is replicated with WAAPI
      using cubic-bezier easing curves.
   ============================================================ */

'use strict';

(function () {

    /* ── CONFIG ─────────────────────────────────────────────── */
    const CONFIG = {
        position: 'right',
        colors: ['#B19EEF', '#2563eb'],   // pre-layer swoosh colours
        accentColor: '#2563eb',            // matches --accent
        logoText: 'PK.',
        logoHref: 'index.html',
        menuButtonColor: null,             // resolved dynamically from CSS
        openMenuButtonColor: '#ffffff',    // open state (over coloured layers)
        numbering: true,
        socials: [
            { label: 'GitHub', link: 'github.html' },
            { label: 'LinkedIn', link: 'https://www.linkedin.com/in/patrick-kiama-ba91103b9/' },
            { label: 'Email', link: 'mailto:patokiama2000@gmail.com' },
        ],
        items: [
            { label: 'Home', link: 'index.html', aria: 'Go to home' },
            { label: 'About', link: 'about.html', aria: 'About Patrick' },
            { label: 'Skills', link: 'skills.html', aria: 'View skills' },
            { label: 'Credentials', link: 'certifications.html', aria: 'View credentials' },
            { label: 'Projects', link: 'projects.html', aria: 'Browse projects' },
            { label: 'Blockchain', link: 'blockchain.html', aria: 'Blockchain work' },
            { label: 'GitHub', link: 'github.html', aria: 'GitHub profile' },
            { label: 'Contact', link: 'contact.html', aria: 'Get in touch' },
        ],
    };

    /* ── EASING HELPERS ─────────────────────────────────────── */
    const EASE = {
        power4out: 'cubic-bezier(0.16, 1, 0.3, 1)',
        power3in: 'cubic-bezier(0.55, 0, 1, 0.45)',
        power3inout: 'cubic-bezier(0.65, 0, 0.35, 1)',
        power2out: 'cubic-bezier(0.22, 1, 0.36, 1)',
        power3out: 'cubic-bezier(0.33, 1, 0.68, 1)',
    };

    /* ── STATE ───────────────────────────────────────────────── */
    let isOpen = false;
    let isBusy = false;
    let activeAnimations = [];

    /* ── DOM REFS ────────────────────────────────────────────── */
    let wrapper, header, logoEl, toggleBtn, textWrap, textInner;
    let iconEl, plusH, plusV;
    let backdropEl, prelayersEl, panelEl;
    let preLayerEls = [];
    let itemLabelEls = [];
    let itemEls = [];
    let socialsTitle, socialLinkEls;

    /* ── TEXT CYCLING ────────────────────────────────────────── */
    const LABELS = ['Menu', 'Close'];
    let textLines = ['Menu', 'Close'];

    /* ── BUILD DOM ───────────────────────────────────────────── */
    function build() {
        /* Wrapper */
        wrapper = document.createElement('div');
        wrapper.className = 'staggered-menu-wrapper';
        wrapper.style.setProperty('--sm-accent', CONFIG.accentColor);

        /* Backdrop (click-away) */
        backdropEl = document.createElement('div');
        backdropEl.className = 'sm-backdrop';
        backdropEl.addEventListener('mousedown', () => { if (isOpen) toggle(); });
        backdropEl.addEventListener('touchstart', () => { if (isOpen) toggle(); }, { passive: true });

        /* Pre-layers */
        prelayersEl = document.createElement('div');
        prelayersEl.className = 'sm-prelayers';
        prelayersEl.setAttribute('aria-hidden', 'true');

        // Build 2 pre-layers from config colours (same logic as the React source)
        let layerColors = [...CONFIG.colors.slice(0, 4)];
        if (layerColors.length >= 3) {
            layerColors.splice(Math.floor(layerColors.length / 2), 1);
        }
        layerColors.forEach(color => {
            const div = document.createElement('div');
            div.className = 'sm-prelayer';
            div.style.background = color;
            div.style.transform = 'translateX(100%)'; // start offscreen right
            prelayersEl.appendChild(div);
            preLayerEls.push(div);
        });

        /* Panel */
        panelEl = document.createElement('aside');
        panelEl.id = 'sm-panel';
        panelEl.className = 'sm-panel';
        panelEl.setAttribute('aria-hidden', 'true');
        panelEl.setAttribute('role', 'dialog');
        panelEl.setAttribute('aria-label', 'Navigation menu');
        panelEl.style.transform = 'translateX(100%)';

        const panelInner = document.createElement('div');
        panelInner.className = 'sm-panel-inner';

        /* Nav list */
        const list = document.createElement('ul');
        list.className = 'sm-panel-list';
        list.setAttribute('role', 'list');
        if (CONFIG.numbering) list.setAttribute('data-numbering', '');

        CONFIG.items.forEach(it => {
            const li = document.createElement('li');
            li.className = 'sm-panel-itemWrap';

            const a = document.createElement('a');
            a.className = 'sm-panel-item';
            a.href = it.link;
            a.setAttribute('aria-label', it.aria || it.label);

            const span = document.createElement('span');
            span.className = 'sm-panel-itemLabel';
            span.textContent = it.label;
            span.style.transform = 'translateY(140%) rotate(10deg)';
            span.style.display = 'inline-block';
            span.style.transformOrigin = '50% 100%';

            a.appendChild(span);
            li.appendChild(a);
            list.appendChild(li);

            itemLabelEls.push(span);
            itemEls.push(a);
        });

        panelInner.appendChild(list);

        /* Socials */
        if (CONFIG.socials && CONFIG.socials.length) {
            const socialsWrap = document.createElement('div');
            socialsWrap.className = 'sm-socials';

            socialsTitle = document.createElement('h3');
            socialsTitle.className = 'sm-socials-title';
            socialsTitle.textContent = 'Socials';
            socialsTitle.style.opacity = '0';

            const socialList = document.createElement('ul');
            socialList.className = 'sm-socials-list';
            socialList.setAttribute('role', 'list');
            socialLinkEls = [];

            CONFIG.socials.forEach(s => {
                const li = document.createElement('li');
                li.className = 'sm-socials-item';
                const a = document.createElement('a');
                a.className = 'sm-socials-link';
                a.href = s.link;
                if (s.link.startsWith('http')) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
                a.textContent = s.label;
                a.style.transform = 'translateY(25px)';
                a.style.opacity = '0';
                li.appendChild(a);
                socialList.appendChild(li);
                socialLinkEls.push(a);
            });

            socialsWrap.appendChild(socialsTitle);
            socialsWrap.appendChild(socialList);
            panelInner.appendChild(socialsWrap);
        }

        panelEl.appendChild(panelInner);

        /* Header */
        header = document.createElement('header');
        header.className = 'sm-header';
        header.setAttribute('aria-label', 'Main navigation header');

        /* Logo */
        logoEl = document.createElement('a');
        logoEl.className = 'sm-logo';
        logoEl.href = CONFIG.logoHref;
        logoEl.setAttribute('aria-label', 'Home');
        logoEl.innerHTML = 'PK<span class="dot">.</span>';

        /* Toggle button */
        toggleBtn = document.createElement('button');
        toggleBtn.className = 'sm-toggle';
        toggleBtn.setAttribute('type', 'button');
        toggleBtn.setAttribute('aria-label', 'Open menu');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.setAttribute('aria-controls', 'sm-panel');
        // Don't set inline color — let CSS (including dark mode) control it

        /* Text wrap */
        textWrap = document.createElement('span');
        textWrap.className = 'sm-toggle-textWrap';
        textWrap.setAttribute('aria-hidden', 'true');

        textInner = document.createElement('span');
        textInner.className = 'sm-toggle-textInner';
        renderTextLines();

        textWrap.appendChild(textInner);

        /* Icon */
        iconEl = document.createElement('span');
        iconEl.className = 'sm-icon';
        iconEl.setAttribute('aria-hidden', 'true');
        iconEl.style.transformOrigin = '50% 50%';

        plusH = document.createElement('span');
        plusH.className = 'sm-icon-line';
        plusH.style.transformOrigin = '50% 50%';

        plusV = document.createElement('span');
        plusV.className = 'sm-icon-line';
        plusV.style.transformOrigin = '50% 50%';
        plusV.style.transform = 'translate(-50%, -50%) rotate(90deg)';

        iconEl.appendChild(plusH);
        iconEl.appendChild(plusV);

        toggleBtn.appendChild(textWrap);
        toggleBtn.appendChild(iconEl);

        header.appendChild(logoEl);
        header.appendChild(toggleBtn);

        /* Assemble */
        wrapper.appendChild(backdropEl);
        wrapper.appendChild(prelayersEl);
        wrapper.appendChild(panelEl);
        wrapper.appendChild(header);

        document.body.insertBefore(wrapper, document.body.firstChild);

        /* Wire scroll listener — updates scrolled class */
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        /* Wire toggle */
        toggleBtn.addEventListener('click', toggle);

        /* ── CLOSE ON SCROLL OUTSIDE THE PANEL ──────────────────
           Desktop: wheel event on the backdrop (the area outside
           the panel when the menu is open).
           Mobile:  touchmove on the backdrop.
           Both fire when the user tries to scroll the page while
           the panel is open — close and let them scroll freely.
        ───────────────────────────────────────────────────────── */
        backdropEl.addEventListener('wheel', (e) => {
            if (isOpen) {
                e.preventDefault();          // stop the page jumping first
                toggle();
            }
        }, { passive: false });

        backdropEl.addEventListener('touchmove', (e) => {
            if (isOpen) {
                toggle();
            }
        }, { passive: true });

        /* ── CLOSE ON ESCAPE KEY ──────────────────────────────── */
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen) toggle();
        });
    }

    /* ── TEXT RENDERING ──────────────────────────────────────── */
    function renderTextLines() {
        textInner.innerHTML = '';
        textLines.forEach(l => {
            const s = document.createElement('span');
            s.className = 'sm-toggle-line';
            s.textContent = l;
            textInner.appendChild(s);
        });
    }

    /* ── SCROLL ──────────────────────────────────────────────── */
    function onScroll() {
        if (window.scrollY > 60) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    }

    /* ── ANIMATE UTILS ───────────────────────────────────────── */
    function animEl(el, from, to, opts = {}) {
        const { duration = 300, easing = EASE.power4out, delay = 0, fill = 'forwards' } = opts;
        const anim = el.animate([from, to], { duration, easing, delay, fill });
        activeAnimations.push(anim);
        return anim;
    }

    function killAll() {
        activeAnimations.forEach(a => { try { a.cancel(); } catch (e) { } });
        activeAnimations = [];
    }

    /* ── OPEN SEQUENCE ───────────────────────────────────────── */
    function playOpen() {
        killAll();

        const offX = 100; // xPercent equivalent (%)
        const pw = panelEl.offsetWidth;

        /* Reset item labels */
        itemLabelEls.forEach(el => {
            el.style.transform = 'translateY(140%) rotate(10deg)';
            el.style.opacity = '1';
        });
        itemEls.forEach(el => { el.style.setProperty('--sm-num-opacity', '0'); });
        if (socialsTitle) socialsTitle.style.opacity = '0';
        socialLinkEls && socialLinkEls.forEach(el => {
            el.style.transform = 'translateY(25px)';
            el.style.opacity = '0';
        });

        /* Pre-layers stagger in */
        preLayerEls.forEach((el, i) => {
            const start = parseFloat(getComputedStyle(el).transform === 'none'
                ? '100' : getTranslateX(el));
            animEl(el,
                { transform: `translateX(${start}%)` },
                { transform: 'translateX(0%)' },
                { duration: 500, easing: EASE.power4out, delay: i * 70 }
            );
        });

        const panelDelay = preLayerEls.length * 70 + 80;

        /* Panel slides in */
        animEl(panelEl,
            { transform: 'translateX(100%)' },
            { transform: 'translateX(0%)' },
            { duration: 650, easing: EASE.power4out, delay: panelDelay }
        );

        /* Item labels tumble in */
        const itemsDelay = panelDelay + 650 * 0.15;
        itemLabelEls.forEach((el, i) => {
            animEl(el,
                { transform: 'translateY(140%) rotate(10deg)' },
                { transform: 'translateY(0%) rotate(0deg)' },
                { duration: 1000, easing: EASE.power4out, delay: itemsDelay + i * 100 }
            );
        });

        /* Item numbers fade in */
        itemEls.forEach((el, i) => {
            const a = el.animate(
                [{ opacity: 0 }, { opacity: 1 }],
                { duration: 600, easing: EASE.power2out, delay: itemsDelay + 100 + i * 80, fill: 'forwards' }
            );
            a.onfinish = () => { el.style.setProperty('--sm-num-opacity', '1'); a.cancel(); };
            activeAnimations.push(a);
        });

        /* Socials */
        const socialsDelay = panelDelay + 650 * 0.4;
        if (socialsTitle) {
            animEl(socialsTitle,
                { opacity: 0 },
                { opacity: 1 },
                { duration: 500, easing: EASE.power2out, delay: socialsDelay }
            );
        }
        if (socialLinkEls) {
            socialLinkEls.forEach((el, i) => {
                animEl(el,
                    { transform: 'translateY(25px)', opacity: 0 },
                    { transform: 'translateY(0px)', opacity: 1 },
                    { duration: 550, easing: EASE.power3out, delay: socialsDelay + 40 + i * 80 }
                );
            });
        }

        panelEl.setAttribute('aria-hidden', 'false');
        wrapper.setAttribute('data-open', '');
        document.body.style.overflow = 'hidden';

        // Release busy after longest animation
        setTimeout(() => { isBusy = false; }, panelDelay + 1100);
    }

    /* ── CLOSE SEQUENCE ──────────────────────────────────────── */
    function playClose() {
        killAll();

        const all = [...preLayerEls, panelEl];
        const longest = 320;

        all.forEach(el => {
            animEl(el,
                { transform: 'translateX(0%)' },
                { transform: 'translateX(100%)' },
                { duration: longest, easing: EASE.power3in }
            );
        });

        setTimeout(() => {
            /* Reset hidden states for next open */
            itemLabelEls.forEach(el => {
                el.style.transform = 'translateY(140%) rotate(10deg)';
            });
            itemEls.forEach(el => { el.style.setProperty('--sm-num-opacity', '0'); });
            if (socialsTitle) socialsTitle.style.opacity = '0';
            socialLinkEls && socialLinkEls.forEach(el => {
                el.style.transform = 'translateY(25px)';
                el.style.opacity = '0';
            });
            panelEl.setAttribute('aria-hidden', 'true');
            isBusy = false;
        }, longest + 20);

        wrapper.removeAttribute('data-open');
        document.body.style.overflow = '';
    }

    /* ── ICON ANIMATION ──────────────────────────────────────── */
    function animIcon(opening) {
        if (opening) {
            animEl(iconEl,
                { transform: 'rotate(0deg)' },
                { transform: 'rotate(225deg)' },
                { duration: 800, easing: EASE.power4out }
            );
        } else {
            animEl(iconEl,
                { transform: 'rotate(225deg)' },
                { transform: 'rotate(0deg)' },
                { duration: 350, easing: EASE.power3inout }
            );
        }
    }

    /* ── BUTTON COLOR ────────────────────────────────────────── */
    function animColor(opening) {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        // In light mode the panel is white — use dark text; in dark mode use white text
        const openColor = isDark ? '#ffffff' : '#111111';

        if (opening) {
            animEl(toggleBtn,
                { color: getComputedStyle(toggleBtn).color },
                { color: openColor },
                { duration: 300, easing: EASE.power2out, delay: 180 }
            );
            setTimeout(() => { toggleBtn.style.color = openColor; }, 480);
        } else {
            // Return to CSS-controlled color (respects dark mode)
            // fill:'none' is critical — prevents WAAPI from holding the open color after animation
            const cssColor = getComputedStyle(document.documentElement)
                .getPropertyValue('--text').trim() || (isDark ? '#ffffff' : '#111111');
            animEl(toggleBtn,
                { color: openColor },
                { color: cssColor },
                { duration: 300, easing: EASE.power2out, fill: 'none' }
            );
            // Clear the inline style so CSS takes full control
            setTimeout(() => { toggleBtn.style.color = ''; }, 305);
        }
    }

    /* ── TEXT CYCLING ────────────────────────────────────────── */
    function animText(opening) {
        // Simple: just show the two states without cycling to avoid text bleed
        const seq = opening ? ['Menu', 'Close'] : ['Close', 'Menu'];
        textLines = seq;
        renderTextLines();

        // Reset to top before animating
        textInner.style.transform = 'translateY(0%)';

        const lineCount = seq.length;
        const finalShift = ((lineCount - 1) / lineCount) * 100;

        animEl(textInner,
            { transform: 'translateY(0%)' },
            { transform: `translateY(-${finalShift}%)` },
            { duration: 380, easing: EASE.power4out }
        );
    }

    /* ── TOGGLE ──────────────────────────────────────────────── */
    function toggle() {
        if (isBusy) return;
        isBusy = true;
        isOpen = !isOpen;

        toggleBtn.setAttribute('aria-expanded', isOpen.toString());
        toggleBtn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');

        if (isOpen) playOpen();
        else playClose();

        animIcon(isOpen);
        animColor(isOpen);
        animText(isOpen);
    }

    /* ── HELPER: get current translateX % from inline transform ── */
    function getTranslateX(el) {
        const t = el.style.transform;
        const m = t.match(/translateX\(([\d.]+)%\)/);
        return m ? parseFloat(m[1]) : 100;
    }

    /* ── HIDE ORIGINAL NAVBAR ────────────────────────────────── */
    function hideOriginalNav() {
        const original = document.getElementById('navbar');
        if (original) original.style.display = 'none';
    }

    /* ── INIT ────────────────────────────────────────────────── */
    document.addEventListener('DOMContentLoaded', () => {
        hideOriginalNav();
        build();

        // Watch for theme changes and update toggle button color immediately
        const themeObserver = new MutationObserver(() => {
            // Only update when panel is closed (open state always uses white)
            if (!isOpen) {
                toggleBtn.style.color = '';
            }
        });
        themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });
    });

})();