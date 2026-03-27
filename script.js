/* ═══════════════════════════════════════════════════════════════
   COVE STUDIO — script.js
═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── Utility ─────────────────────────────────────────────────
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const lerp = (a, b, t) => a + (b - a) * t;

  // ─── Custom Cursor (disabled — using default browser cursor) ──

  // ─── Sticky Nav ───────────────────────────────────────────────
  const nav = $('#nav');
  let lastScroll = 0;

  function onScroll() {
    const y = window.scrollY;
    if (y > 80) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = y;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ─── Floating CTA ─────────────────────────────────────────────
  const floatingCta = $('#floatingCta');
  const heroEl      = $('#hero');

  function updateFloatingCta() {
    if (!heroEl || !floatingCta) return;
    const heroH = heroEl.offsetHeight;
    if (window.scrollY > heroH * 0.7) {
      floatingCta.classList.add('visible');
    } else {
      floatingCta.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', updateFloatingCta, { passive: true });

  // ─── Mobile Menu ──────────────────────────────────────────────
  const hamburger  = $('#hamburger');
  const mobileMenu = $('#mobileMenu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    $$('a', mobileMenu).forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ─── Smooth Scroll ────────────────────────────────────────────
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = link.getAttribute('href');
      if (target === '#') return;
      const el = document.querySelector(target);
      if (!el) return;
      e.preventDefault();
      const offset = el.getBoundingClientRect().top + window.scrollY - (nav ? nav.offsetHeight : 72);
      window.scrollTo({ top: offset, behavior: 'smooth' });
    });
  });

  // ─── Fade-Up & Stagger Animations ────────────────────────────
  // Automatically stagger siblings in grids
  function applyStagger(containerSel, itemSel) {
    $$(containerSel).forEach(container => {
      const items = $$(itemSel, container);
      items.forEach((item, i) => {
        item.style.transitionDelay = `${i * 0.1}s`;
      });
    });
  }

  applyStagger('.portfolio-grid', '.ptile');
  applyStagger('.services-grid', '.service-card');
  applyStagger('.testimonials-grid', '.tcard');
  applyStagger('.pricing-grid', '.pcard');

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  // Observe all .fade-up elements
  $$('.fade-up').forEach(el => fadeObserver.observe(el));

  // Also observe portfolio tiles, service cards, testimonials, pricing
  const autoFadeItems = '.ptile, .service-card, .tcard, .pcard, .style-tile';
  $$(autoFadeItems).forEach(el => {
    if (!el.classList.contains('fade-up')) {
      el.classList.add('fade-up');
      fadeObserver.observe(el);
    }
  });

  // ─── Count-Up Numbers ─────────────────────────────────────────
  const countEls = $$('.stat-num[data-target]');
  let countsDone = new Set();

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function animateCount(el, target, duration = 2200) {
    const start = performance.now();
    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const val = Math.round(easeOut(progress) * target);
      el.textContent = val;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  const countObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countsDone.has(entry.target)) {
        countsDone.add(entry.target);
        const target = parseInt(entry.target.dataset.target, 10);
        animateCount(entry.target, target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  countEls.forEach(el => countObserver.observe(el));

  // ─── Process Timeline ─────────────────────────────────────────
  const timelineEl   = $('#processTimeline');
  const timelineFill = $('#timelineFill');
  const steps        = $$('.timeline-step', timelineEl || document);

  function updateTimeline() {
    if (!timelineEl || !timelineFill) return;
    const rect = timelineEl.getBoundingClientRect();
    const wh = window.innerHeight;

    // Progress: 0 when top of timeline hits bottom of viewport, 1 when bottom hits center
    const rawProgress = (wh - rect.top) / (rect.height + wh * 0.3);
    const progress = Math.max(0, Math.min(1, rawProgress));

    timelineFill.style.width = (progress * 100) + '%';

    // Activate steps progressively
    steps.forEach((step, i) => {
      const threshold = i / steps.length;
      if (progress >= threshold + 0.05) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', updateTimeline, { passive: true });
  updateTimeline();

  // ─── Mobile Accordion ─────────────────────────────────────────
  const accItems = $$('.acc-item');

  accItems.forEach(item => {
    const btn = $('.acc-btn', item);
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close all
      accItems.forEach(i => i.classList.remove('open'));
      // Open if was closed
      if (!isOpen) item.classList.add('open');
    });
  });

  // ─── Styles Horizontal Drag Scroll ───────────────────────────
  const stylesWrap = $('#stylesScrollWrap');

  if (stylesWrap) {
    let isDown = false;
    let startX;
    let scrollLeft;
    let moved = false;

    stylesWrap.addEventListener('mousedown', e => {
      isDown = true; moved = false;
      stylesWrap.classList.add('dragging');
      startX = e.pageX - stylesWrap.offsetLeft;
      scrollLeft = stylesWrap.scrollLeft;
    });

    stylesWrap.addEventListener('mouseleave', () => {
      isDown = false;
      stylesWrap.classList.remove('dragging');
    });

    stylesWrap.addEventListener('mouseup', () => {
      isDown = false;
      stylesWrap.classList.remove('dragging');
    });

    stylesWrap.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      moved = true;
      const x = e.pageX - stylesWrap.offsetLeft;
      const walk = (x - startX) * 1.4;
      stylesWrap.scrollLeft = scrollLeft - walk;
    });

    // Prevent link clicks when dragging
    stylesWrap.addEventListener('click', e => {
      if (moved) e.preventDefault();
    });

    // Touch scroll (native) — just let it work
  }

  // ─── Nav Active State ─────────────────────────────────────────
  const navLinks = $$('.nav-links a:not(.nav-cta-link)');
  const sections = $$('section[id]');

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          const href = link.getAttribute('href').replace('#', '');
          link.classList.toggle('active-nav', href === id);
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => sectionObserver.observe(s));

  // ─── Form Submission ──────────────────────────────────────────
  const consultForm = $('#consultForm');
  const submitBtn   = $('#submitBtn');

  if (consultForm && submitBtn) {
    consultForm.addEventListener('submit', e => {
      e.preventDefault();

      // Basic validation
      const required = $$('[required]', consultForm);
      let valid = true;
      required.forEach(field => {
        if (!field.value.trim()) {
          valid = false;
          field.style.borderColor = 'rgba(220,80,80,0.6)';
          field.addEventListener('input', () => {
            field.style.borderColor = '';
          }, { once: true });
        }
      });

      if (!valid) return;

      // Success state
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Request Received ✦';
      submitBtn.style.background = '#4A7C59';
      submitBtn.disabled = true;

      setTimeout(() => {
        consultForm.reset();
        submitBtn.textContent = originalText;
        submitBtn.style.background = '';
        submitBtn.disabled = false;
      }, 3500);
    });
  }

  // ─── Hero scroll offset for nav CTA ──────────────────────────
  // (handled above via smooth scroll)

  // ─── Init ─────────────────────────────────────────────────────
  // Run once on page load
  window.addEventListener('DOMContentLoaded', () => {
    updateFloatingCta();
    updateTimeline();
  });

})();
