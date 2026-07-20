/* ========================================
   ELOS Accounting System - Main JavaScript
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ── Sticky Navbar ──
  const navbar = document.querySelector('.navbar');

  // ── V3.2 Announcement Bar ──
  const announceClose = document.getElementById('announceClose');
  const ANNOUNCE_KEY = 'elos_announce_v32_released_dismissed';
  let announceDismissed = false;
  try { announceDismissed = localStorage.getItem(ANNOUNCE_KEY) === '1'; } catch (e) {}
  if (announceDismissed) document.body.classList.add('announce-off');

  if (announceClose) {
    announceClose.addEventListener('click', () => {
      announceDismissed = true;
      document.body.classList.add('announce-off');
      try { localStorage.setItem(ANNOUNCE_KEY, '1'); } catch (e) {}
    });
  }

  function handleNavbarScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
      document.body.classList.add('announce-off');
    } else {
      navbar.classList.remove('scrolled');
      if (!announceDismissed) document.body.classList.remove('announce-off');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  // ── Mobile Menu Toggle ──
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const overlay = document.querySelector('.mobile-overlay');

  function openMenu() {
    menuToggle.classList.add('active');
    navLinks.classList.add('open');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menuToggle.classList.remove('active');
    navLinks.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      if (navLinks.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (overlay) {
    overlay.addEventListener('click', closeMenu);
  }

  // Close menu on nav link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // ── Smooth Scroll for Anchor Links ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = navbar.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ── Active Nav Link Highlight ──
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  function highlightActiveSection() {
    const scrollPos = window.scrollY + navbar.offsetHeight + 100;

    let currentSection = '';
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentSection = section.getAttribute('id');
      }
    });

    navAnchors.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + currentSection) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', highlightActiveSection, { passive: true });
  highlightActiveSection();

  // ── FAQ Accordion ──
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const isActive = item.classList.contains('active');

      // Close all others
      document.querySelectorAll('.faq-item.active').forEach(openItem => {
        openItem.classList.remove('active');
      });

      // Toggle clicked
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // ── Cookie Notice ──
  const cookieNotice = document.getElementById('cookieNotice');
  const cookieAccept = document.getElementById('cookieAccept');
  const COOKIE_KEY = 'elos_cookie_ack';
  if (cookieNotice) {
    let acked = false;
    try { acked = localStorage.getItem(COOKIE_KEY) === '1'; } catch (e) {}
    if (!acked) cookieNotice.hidden = false;
    if (cookieAccept) {
      cookieAccept.addEventListener('click', () => {
        cookieNotice.hidden = true;
        try { localStorage.setItem(COOKIE_KEY, '1'); } catch (e) {}
      });
    }
  }

  // ── Conversion Event Tracking ──
  function trackEvent(name, params = {}) {
    if (typeof gtag === 'function') gtag('event', name, params);
    if (typeof fbq === 'function') fbq('trackCustom', name, params);
  }

  // Track all elements with data-track attribute
  document.querySelectorAll('[data-track]').forEach(el => {
    el.addEventListener('click', () => {
      const name = el.getAttribute('data-track');
      const label = el.textContent.trim().slice(0, 60);
      trackEvent(name, { label });
    });
  });

  // Track WhatsApp clicks (any wa.me link)
  document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    link.addEventListener('click', () => {
      trackEvent('whatsapp_click', { source: link.getAttribute('data-track') || 'inline' });
      if (typeof fbq === 'function') fbq('track', 'Contact');
    });
  });

  // Track download clicks
  document.querySelectorAll('a[download]').forEach(link => {
    link.addEventListener('click', () => {
      const platform = link.href.includes('.apk') ? 'mobile' : 'desktop';
      trackEvent('download', { platform });
      if (typeof fbq === 'function') fbq('track', 'Lead', { content_name: 'ELOS-' + platform });
    });
  });

  // ── Lead Capture Form (Pre-Download) ──
  const leadForms = document.querySelectorAll('form[data-lead-form]');
  leadForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const name = (formData.get('shop_name') || '').trim();
      const phone = (formData.get('phone') || '').trim();
      const platform = form.dataset.platform || 'desktop';

      if (!name || !phone) return;

      trackEvent('lead_submitted', { platform, has_name: !!name, has_phone: !!phone });
      if (typeof fbq === 'function') fbq('track', 'Lead', { content_name: 'ELOS-' + platform });

      // Open WhatsApp with pre-filled message → founder gets the lead
      const safeName = encodeURIComponent(name);
      const safePhone = encodeURIComponent(phone);
      const message = `مرحباً، اسمي/محلي: ${safeName}%0Aرقمي: ${safePhone}%0Aحابب أحمل ELOS ${platform === 'mobile' ? 'تطبيق الموبايل' : 'نسخة الكمبيوتر'} وأبدأ التجربة المجانية`;
      const waUrl = `https://wa.me/201031372078?text=${message}`;
      window.open(waUrl, '_blank', 'noopener');

      // Trigger download after short delay
      const downloadUrl = form.dataset.downloadUrl;
      if (downloadUrl) {
        setTimeout(() => {
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = '';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }, 800);
      }

      // Show confirmation
      const successMsg = form.querySelector('.lead-success');
      if (successMsg) {
        form.querySelector('.lead-fields').style.display = 'none';
        successMsg.style.display = 'block';
      }
    });
  });

  // ── Lightbox (popup with original-quality image) ──
  const lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    const lbImg     = lightbox.querySelector('img');
    const lbCaption = lightbox.querySelector('.lightbox-caption');
    const lbClose   = lightbox.querySelector('.lightbox-close');
    const lbStage   = lightbox.querySelector('.lightbox-stage');
    let upgradeToken = 0;

    function openLightbox(displayedSrc, originalSrc, alt) {
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      lbImg.alt = alt || '';
      lbCaption.textContent = alt || '';

      // 1. Show what's already cached (WebP rendered on page) — instant
      lbImg.src = displayedSrc;

      // 2. If a higher-quality original exists, upgrade silently in background
      const myToken = ++upgradeToken;
      if (originalSrc && originalSrc !== displayedSrc) {
        lightbox.classList.add('loading');
        const tmp = new Image();
        tmp.onload = () => {
          // Only upgrade if user hasn't closed/changed image meanwhile
          if (myToken === upgradeToken && lightbox.classList.contains('open')) {
            lbImg.src = originalSrc;
          }
          lightbox.classList.remove('loading');
        };
        tmp.onerror = () => lightbox.classList.remove('loading');
        tmp.src = originalSrc;
      }

      trackEvent('lightbox_open', { image: (displayedSrc.split('/').pop()) });
    }

    function closeLightbox() {
      upgradeToken++;
      lightbox.classList.remove('open');
      lightbox.classList.remove('loading');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    // Make every screenshot <picture> clickable
    document.querySelectorAll('picture').forEach(pic => {
      const img = pic.querySelector('img');
      if (!img) return;
      const path = img.getAttribute('src') || '';
      if (!path.includes('screenshots/')) return;
      pic.classList.add('zoomable');
      pic.addEventListener('click', () => {
        // currentSrc = what's actually rendered (WebP if supported, else PNG)
        // src        = always the PNG fallback (max quality)
        const displayed = img.currentSrc || img.src;
        openLightbox(displayed, img.src, img.alt);
      });
    });

    // Close handlers
    lbClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target === lbStage) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
    });
  }

  // ── Fade-In Animation on Scroll (Intersection Observer) ──
  const fadeElements = document.querySelectorAll('.fade-up');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    fadeElements.forEach(el => observer.observe(el));
  } else {
    // Fallback: show all elements
    fadeElements.forEach(el => el.classList.add('visible'));
  }

  // ── Hero pointer glow (desktop, motion-safe only) ──
  const hero = document.querySelector('.hero');
  if (hero &&
      matchMedia('(prefers-reduced-motion: no-preference)').matches &&
      matchMedia('(pointer: fine)').matches) {
    let glowRaf = null;
    hero.addEventListener('mousemove', (e) => {
      if (glowRaf) return;
      glowRaf = requestAnimationFrame(() => {
        const rect = hero.getBoundingClientRect();
        hero.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100) + '%');
        hero.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100) + '%');
        glowRaf = null;
      });
    }, { passive: true });
  }

});
