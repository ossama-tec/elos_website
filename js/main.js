/* ========================================
   ELOS Accounting System - Main JavaScript
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ── Sticky Navbar ──
  const navbar = document.querySelector('.navbar');

  // ── V4 Announcement Bar ──
  const announceClose = document.getElementById('announceClose');
  const ANNOUNCE_KEY = 'elos_announce_v4_released_dismissed';
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
    // موافقة ضمنية: لو كمّل قراءة (نزل 900px) الشريط يختفي لوحده
    if (!acked) {
      const implicitAck = () => {
        if (window.scrollY > 900) {
          cookieNotice.hidden = true;
          try { localStorage.setItem(COOKIE_KEY, '1'); } catch (e) {}
          window.removeEventListener('scroll', implicitAck);
        }
      };
      window.addEventListener('scroll', implicitAck, { passive: true });
    }
    if (cookieAccept) {
      cookieAccept.addEventListener('click', () => {
        cookieNotice.hidden = true;
        try { localStorage.setItem(COOKIE_KEY, '1'); } catch (e) {}
      });
    }
  }

  // ── رقم الإصدار الحالي من version.json (نفس الملف اللي البرنامج بيقرأه) ──
  const verEls = document.querySelectorAll('[data-app-version]');
  if (verEls.length && 'fetch' in window) {
    fetch('version.json', { cache: 'no-cache' })
      .then(r => r.ok ? r.json() : null)
      .then(v => { if (v && v.latest) verEls.forEach(el => { el.textContent = v.latest; }); })
      .catch(() => {});
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

  // ── Device class (Android → تطبيق الموبايل الأول، الويندوز → فورم الكمبيوتر) ──
  const UA = navigator.userAgent || '';
  const IS_ANDROID = /Android/i.test(UA);
  const IS_IOS = /iPhone|iPad|iPod/i.test(UA);
  const IS_MOBILE = IS_ANDROID || IS_IOS || /Mobile/i.test(UA);
  const DEVICE = IS_ANDROID ? 'android' : IS_IOS ? 'ios' : /Windows/i.test(UA) ? 'windows' : /Mac/i.test(UA) ? 'mac' : 'other';
  document.body.classList.add('dev-' + DEVICE, IS_MOBILE ? 'dev-mobile' : 'dev-desktop');

  // ── Attribution (UTM / click ids) — first touch 30 يوم ──
  const UTM_KEY = 'elos_attrib_v1';
  const PAGE_LOADED_AT = Date.now();
  function readAttribution() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(UTM_KEY) || 'null'); } catch (e) {}
    if (saved && saved.at && Date.now() - saved.at < 30 * 864e5) return saved;
    return null;
  }
  function captureAttribution() {
    const q = new URLSearchParams(location.search);
    const utm = {};
    ['source', 'medium', 'campaign', 'content', 'term'].forEach(k => {
      const v = q.get('utm_' + k); if (v) utm[k] = v.slice(0, 80);
    });
    const fbclid = q.get('fbclid') || '';
    const gclid = q.get('gclid') || '';
    const ttclid = q.get('ttclid') || '';
    const hasNew = Object.keys(utm).length || fbclid || gclid || ttclid;
    const prev = readAttribution();
    if (!hasNew && prev) return prev;
    const rec = {
      at: Date.now(),
      utm,
      fbclid: fbclid.slice(0, 120),
      gclid: gclid.slice(0, 120),
      ttclid: ttclid.slice(0, 120),
      ref: (document.referrer || '').slice(0, 200),
      landing: location.pathname + (location.hash || '')
    };
    if (hasNew || !prev) { try { localStorage.setItem(UTM_KEY, JSON.stringify(rec)); } catch (e) {} }
    return rec;
  }
  const ATTRIB = captureAttribution();

  // ── Country picker for the phone field ──
  // trunk = الرقم المحلي بيبدأ بصفر بيتشال قبل مفتاح الدولة · len = عدد الأرقام بعد شيل الصفر
  const COUNTRIES = [
    { iso: 'EG', name: 'مصر',         dial: '20',  flag: '🇪🇬', trunk: true,  len: [10, 10], ex: '01012345678' },
    { iso: 'SA', name: 'السعودية',    dial: '966', flag: '🇸🇦', trunk: true,  len: [9, 9],   ex: '0512345678' },
    { iso: 'AE', name: 'الإمارات',    dial: '971', flag: '🇦🇪', trunk: true,  len: [9, 9],   ex: '0501234567' },
    { iso: 'KW', name: 'الكويت',      dial: '965', flag: '🇰🇼', trunk: false, len: [8, 8],   ex: '51234567' },
    { iso: 'QA', name: 'قطر',         dial: '974', flag: '🇶🇦', trunk: false, len: [8, 8],   ex: '33123456' },
    { iso: 'BH', name: 'البحرين',     dial: '973', flag: '🇧🇭', trunk: false, len: [8, 8],   ex: '36123456' },
    { iso: 'OM', name: 'عُمان',       dial: '968', flag: '🇴🇲', trunk: false, len: [8, 8],   ex: '92123456' },
    { iso: 'JO', name: 'الأردن',      dial: '962', flag: '🇯🇴', trunk: true,  len: [9, 9],   ex: '0791234567' },
    { iso: 'IQ', name: 'العراق',      dial: '964', flag: '🇮🇶', trunk: true,  len: [10, 10], ex: '07712345678' },
    { iso: 'LY', name: 'ليبيا',       dial: '218', flag: '🇱🇾', trunk: true,  len: [9, 9],   ex: '0912345678' },
    { iso: 'SD', name: 'السودان',     dial: '249', flag: '🇸🇩', trunk: true,  len: [9, 9],   ex: '0912345678' },
    { iso: 'YE', name: 'اليمن',       dial: '967', flag: '🇾🇪', trunk: true,  len: [9, 9],   ex: '0712345678' },
    { iso: 'PS', name: 'فلسطين',      dial: '970', flag: '🇵🇸', trunk: true,  len: [9, 9],   ex: '0591234567' },
    { iso: 'LB', name: 'لبنان',       dial: '961', flag: '🇱🇧', trunk: true,  len: [7, 8],   ex: '03123456' },
    { iso: 'SY', name: 'سوريا',       dial: '963', flag: '🇸🇾', trunk: true,  len: [9, 9],   ex: '0912345678' },
    { iso: 'MA', name: 'المغرب',      dial: '212', flag: '🇲🇦', trunk: true,  len: [9, 9],   ex: '0612345678' },
    { iso: 'DZ', name: 'الجزائر',     dial: '213', flag: '🇩🇿', trunk: true,  len: [9, 9],   ex: '0551234567' },
    { iso: 'TN', name: 'تونس',        dial: '216', flag: '🇹🇳', trunk: false, len: [8, 8],   ex: '20123456' },
    { iso: 'TR', name: 'تركيا',       dial: '90',  flag: '🇹🇷', trunk: true,  len: [10, 10], ex: '05321234567' },
    { iso: 'US', name: 'أمريكا',      dial: '1',   flag: '🇺🇸', trunk: false, len: [10, 10], ex: '2015550123' },
    { iso: 'CA', name: 'كندا',        dial: '1',   flag: '🇨🇦', trunk: false, len: [10, 10], ex: '4165550123' },
    { iso: 'GB', name: 'بريطانيا',    dial: '44',  flag: '🇬🇧', trunk: true,  len: [10, 10], ex: '07400123456' },
    { iso: 'DE', name: 'ألمانيا',     dial: '49',  flag: '🇩🇪', trunk: true,  len: [10, 11], ex: '015123456789' },
    { iso: 'FR', name: 'فرنسا',       dial: '33',  flag: '🇫🇷', trunk: true,  len: [9, 9],   ex: '0612345678' },
    { iso: 'IT', name: 'إيطاليا',     dial: '39',  flag: '🇮🇹', trunk: false, len: [9, 10],  ex: '3123456789' }
  ];
  const TZ_COUNTRY = {
    'Africa/Cairo': 'EG', 'Asia/Riyadh': 'SA', 'Asia/Dubai': 'AE', 'Asia/Kuwait': 'KW', 'Asia/Qatar': 'QA',
    'Asia/Bahrain': 'BH', 'Asia/Muscat': 'OM', 'Asia/Amman': 'JO', 'Asia/Baghdad': 'IQ', 'Africa/Tripoli': 'LY',
    'Africa/Khartoum': 'SD', 'Asia/Aden': 'YE', 'Asia/Gaza': 'PS', 'Asia/Hebron': 'PS', 'Asia/Beirut': 'LB',
    'Asia/Damascus': 'SY', 'Africa/Casablanca': 'MA', 'Africa/Algiers': 'DZ', 'Africa/Tunis': 'TN',
    'Europe/Istanbul': 'TR', 'Europe/London': 'GB', 'Europe/Berlin': 'DE', 'Europe/Paris': 'FR', 'Europe/Rome': 'IT'
  };
  const byIso = iso => COUNTRIES.find(c => c.iso === iso);

  // تحويل الأرقام العربية/الفارسية للاتينية
  function toLatinDigits(str) {
    return String(str || '')
      .replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 0x0660))
      .replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 0x06F0));
  }
  // بيرجّع {e164, national} أو {error}
  function parsePhone(raw, country) {
    let digits = toLatinDigits(raw).replace(/\D/g, '');
    if (!digits) return { error: 'اكتب رقم الواتساب' };
    // الناس بتكتب مفتاح الدولة برضه: 0020... أو +20... أو 20...
    if (digits.startsWith('00')) digits = digits.slice(2);
    if (digits.startsWith(country.dial) && digits.length > country.len[1] + (country.trunk ? 1 : 0)) {
      digits = digits.slice(country.dial.length);
    }
    if (country.trunk && digits.startsWith('0')) digits = digits.slice(1);
    if (digits.length < country.len[0] || digits.length > country.len[1]) {
      const need = country.len[0] === country.len[1]
        ? `${country.len[0] + (country.trunk ? 1 : 0)} رقم`
        : `${country.len[0]}-${country.len[1]} رقم`;
      return { error: `الرقم مش مظبوط لـ${country.name} — المفروض ${need} زي ${country.ex}` };
    }
    if (country.iso === 'EG' && !digits.startsWith('1')) {
      return { error: 'رقم الموبايل المصري بيبدأ بـ 010 / 011 / 012 / 015' };
    }
    return { e164: '+' + country.dial + digits, national: (country.trunk ? '0' : '') + digits };
  }

  const CC_KEY = 'elos_cc_v1';
  function detectCountry() {
    // 1) اختيار سابق للمستخدم
    try { const s = localStorage.getItem(CC_KEY); if (s && byIso(s)) return Promise.resolve({ iso: s, how: 'saved' }); } catch (e) {}
    // 2) لوكيشن بالـ IP (مهلة قصيرة) ← 3) التايم زون ← 4) لغة المتصفح ← 5) مصر
    const fallback = () => {
      let iso = null;
      try { iso = TZ_COUNTRY[Intl.DateTimeFormat().resolvedOptions().timeZone]; } catch (e) {}
      if (!iso) { const m = /-([A-Z]{2})$/.exec(navigator.language || ''); if (m && byIso(m[1])) iso = m[1]; }
      return { iso: iso || 'EG', how: 'fallback' };
    };
    if (!('fetch' in window)) return Promise.resolve(fallback());
    const ctrl = ('AbortController' in window) ? new AbortController() : null;
    const timer = setTimeout(() => ctrl && ctrl.abort(), 2500);
    return fetch('https://ipapi.co/country/', { signal: ctrl ? ctrl.signal : undefined, cache: 'no-store' })
      .then(r => r.ok ? r.text() : '')
      .then(t => {
        clearTimeout(timer);
        const iso = String(t || '').trim().toUpperCase();
        return byIso(iso) ? { iso, how: 'geo' } : fallback();
      })
      .catch(() => { clearTimeout(timer); return fallback(); });
  }

  function setupPhoneField(form) {
    const select = form.querySelector('select[name="cc"]');
    const input = form.querySelector('input[name="phone"]');
    const hint = form.querySelector('.phone-hint');
    if (!select || !input) return null;
    select.innerHTML = COUNTRIES.map(c => `<option value="${c.iso}">${c.flag} ${c.name} +${c.dial}</option>`).join('');
    const apply = (iso) => {
      const c = byIso(iso) || byIso('EG');
      select.value = c.iso;
      input.placeholder = c.ex;
      if (hint) hint.textContent = `اكتب الرقم من غير مفتاح الدولة — مثال: ${c.ex}`;
    };
    apply('EG');
    let touched = false;
    select.addEventListener('change', () => {
      touched = true; apply(select.value);
      try { localStorage.setItem(CC_KEY, select.value); } catch (e) {}
      input.focus();
    });
    detectCountry().then(({ iso }) => { if (!touched) apply(iso); });
    return { select, input };
  }

  // ── Lead Capture Form (Pre-Download) ──
  // 1) يسجّل الليد في الـCRM مباشرة (fetch في الخلفية — الفريق بيتنبّه فورًا)
  // 2) يفتح واتساب برسالة جاهزة (بيتفتح فورًا في نفس الضغطة عشان ما يتبلوكش)
  // 3) على الويندوز: يبدأ التحميل · على الموبايل: هنبعت اللينك على واتساب
  const CRM_LEAD_URL = 'https://crm.elos-system.com/api/leads/from-site';
  const CRM_SITE_TOKEN = 'LcT3xJGmv_yf5Tp15BTUz3MGDq2hKTDu';

  function sendLeadToCrm(payload) {
    if (!('fetch' in window)) return Promise.resolve(false);
    return fetch(CRM_LEAD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Site-Token': CRM_SITE_TOKEN },
      body: JSON.stringify(payload),
      keepalive: true,
      mode: 'cors'
    }).then(r => r.ok).catch(() => false);
  }

  const leadForms = document.querySelectorAll('form[data-lead-form]');
  leadForms.forEach(form => {
    const phoneField = setupPhoneField(form);
    const errBox = form.querySelector('.lead-error');
    const showError = (msg) => {
      if (!errBox) return;
      errBox.textContent = msg; errBox.hidden = !msg;
      if (msg && phoneField) { phoneField.input.classList.add('is-invalid'); phoneField.input.focus(); }
    };
    if (phoneField) phoneField.input.addEventListener('input', () => { phoneField.input.classList.remove('is-invalid'); showError(''); });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const name = (formData.get('shop_name') || '').trim();
      const rawPhone = (formData.get('phone') || '').trim();
      const platform = form.dataset.platform || 'desktop';
      const country = byIso(formData.get('cc')) || byIso('EG');

      if (!name) { showError('اكتب اسم محلك'); return; }
      const parsed = parsePhone(rawPhone, country);
      if (parsed.error) { showError(parsed.error); return; }
      showError('');

      trackEvent('lead_submitted', { platform, device: DEVICE, country: country.iso });
      if (typeof fbq === 'function') fbq('track', 'Lead', { content_name: 'ELOS-' + platform });

      // 1) CRM — في الخلفية، مش بنستنى الرد
      sendLeadToCrm({
        shop: name,
        phone: parsed.e164,
        platform,
        device: DEVICE,
        country: country.iso,
        utm: ATTRIB.utm || {},
        fbclid: ATTRIB.fbclid || '',
        gclid: ATTRIB.gclid || '',
        ttclid: ATTRIB.ttclid || '',
        ref: ATTRIB.ref || '',
        page: location.href.slice(0, 200),
        t: PAGE_LOADED_AT,
        elapsed: Date.now() - PAGE_LOADED_AT,
        website: (formData.get('website') || '')   // honeypot — لازم يفضل فاضي
      }).then(ok => trackEvent('lead_crm_' + (ok ? 'saved' : 'failed'), { platform }));

      // 2) واتساب — بيتفتح فورًا (نفس الضغطة) عشان المتصفح ما يبلوكش النافذة
      const lines = [
        `مرحباً، اسم محلي: ${name}`,
        `رقمي: ${parsed.e164}`,
        IS_MOBILE
          ? 'حابب أجرب ELOS — ابعتولي لينك نسخة الكمبيوتر عشان أحمّلها على جهاز الويندوز'
          : `حابب أحمل ELOS ${platform === 'mobile' ? 'تطبيق الموبايل' : 'نسخة الكمبيوتر'} وأبدأ التجربة المجانية`
      ];
      const src = (ATTRIB.utm && ATTRIB.utm.source) || (ATTRIB.fbclid ? 'facebook' : ATTRIB.gclid ? 'google' : ATTRIB.ttclid ? 'tiktok' : '');
      if (src) lines.push(`(جاي من ${src}${ATTRIB.utm && ATTRIB.utm.campaign ? ' — ' + ATTRIB.utm.campaign : ''})`);
      const waUrl = `https://wa.me/201031372078?text=${encodeURIComponent(lines.join('\n'))}`;
      window.open(waUrl, '_blank', 'noopener');

      // 3) التحميل — على الويندوز بس (ملف 100 ميجا على الموبايل ملوش لازمة)
      const downloadUrl = form.dataset.downloadUrl;
      const willDownload = !!downloadUrl && !IS_MOBILE;
      if (willDownload) {
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
        const title = successMsg.querySelector('h4');
        const text = successMsg.querySelector('p');
        if (!willDownload && title && text) {
          title.textContent = 'تمام! سجّلنا بياناتك';
          text.textContent = 'نسخة الكمبيوتر بتتحمّل من جهاز ويندوز — هنبعتلك اللينك على واتساب ونساعدك في التركيب.';
        }
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
