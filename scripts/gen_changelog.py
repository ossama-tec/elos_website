# -*- coding: utf-8 -*-
"""
يولّد changelog.html من ريليزات GitHub (ossama-tec/elos_website).

الاستخدام (من جذر ريبو الموقع، بعد أي ريليز):
    python scripts/gen_changelog.py
    git add changelog.html && git commit -m "changelog: vX.Y.Z" && git push

المتطلبات: gh CLI مسجّل دخول. مفيش مكتبات خارجية.
"""
import json
import subprocess
import sys
import re
import html
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'changelog.html'
REPO = 'ossama-tec/elos_website'

AR_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
             'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']


def fetch_releases():
    # gh release list مش بيرجّع body — بنستخدم الـREST API مباشرة
    out = subprocess.run(
        ['gh', 'api', f'repos/{REPO}/releases?per_page=100'],
        capture_output=True, text=True, encoding='utf-8', check=True).stdout
    rels = []
    for r in json.loads(out):
        if r.get('draft'):
            continue
        rels.append({
            'tagName': r['tag_name'],
            'name': r.get('name') or r['tag_name'],
            'body': r.get('body') or '',
            'publishedAt': r.get('published_at') or r.get('created_at'),
        })
    rels.sort(key=lambda r: r['publishedAt'], reverse=True)
    return rels


def ar_date(iso):
    y, m, d = iso[:10].split('-')
    return f'{int(d)} {AR_MONTHS[int(m) - 1]} {y}'


def body_to_html(body):
    """ملاحظات الريليز نص حر (سطور / نقاط / فواصل «+») → قائمة نقاط."""
    body = (body or '').strip()
    if not body:
        return '<p class="cl-empty">إصلاحات وتحسينات عامة.</p>'
    lines = []
    for raw in body.replace('\r', '').split('\n'):
        raw = raw.strip()
        if not raw:
            continue
        raw = re.sub(r'^[-*•]\s*', '', raw)
        # الملاحظات القصيرة بتيجي في سطر واحد مفصولة بـ « + » أو «،» — نفصلها نقاط
        parts = [p.strip() for p in re.split(r'\s\+\s', raw) if p.strip()]
        lines.extend(parts)
    if len(lines) == 1 and '،' in lines[0] and len(lines[0]) > 120:
        lines = [p.strip() for p in lines[0].split('،') if p.strip()]
    return '<ul>' + ''.join(f'<li>{html.escape(l)}</li>' for l in lines) + '</ul>'


def major_of(tag):
    m = re.match(r'v?(\d+)', tag)
    return m.group(1) if m else '0'


def render(rels):
    latest = rels[0]['tagName'].lstrip('v') if rels else ''
    groups = {}
    order = []
    for r in rels:
        mj = major_of(r['tagName'])
        if mj not in groups:
            groups[mj] = []
            order.append(mj)
        groups[mj].append(r)

    sections = []
    for mj in order:
        items = []
        for i, r in enumerate(groups[mj]):
            tag = r['tagName'].lstrip('v')
            is_latest = (r is rels[0])
            badge = '<span class="cl-badge">الحالي</span>' if is_latest else ''
            major_badge = '<span class="cl-badge cl-badge--major">إصدار رئيسي</span>' if tag.endswith('.0.0') else ''
            items.append(f'''
        <article class="cl-item{' cl-item--latest' if is_latest else ''}" id="v{html.escape(tag)}">
          <div class="cl-meta">
            <h3>الإصدار {html.escape(tag)} {badge}{major_badge}</h3>
            <time datetime="{r['publishedAt'][:10]}">{ar_date(r['publishedAt'])}</time>
          </div>
          <div class="cl-body">{body_to_html(r.get('body'))}</div>
        </article>''')
        sections.append(f'''
      <section class="cl-group">
        <h2 class="cl-group-title">ELOS V{mj}</h2>
        {''.join(items)}
      </section>''')

    return TEMPLATE.replace('{{LATEST}}', html.escape(latest)) \
                   .replace('{{COUNT}}', str(len(rels))) \
                   .replace('{{SECTIONS}}', ''.join(sections))


TEMPLATE = '''<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>الجديد في كل إصدار — سجل تحديثات ELOS</title>
  <meta name="description" content="سجل تحديثات برنامج ELOS لمحلات الموبايلات: كل إصدار وإيه اللي اتضاف واتصلح فيه. آخر إصدار {{LATEST}}.">
  <link rel="canonical" href="https://elos-system.com/changelog.html">
  <meta name="theme-color" content="#06131d">
  <meta property="og:title" content="سجل تحديثات ELOS — آخر إصدار {{LATEST}}">
  <meta property="og:description" content="كل إصدار من ELOS وإيه اللي اتضاف واتصلح فيه. التحديث بيوصل المستخدمين تلقائي جوه البرنامج.">
  <meta property="og:image" content="https://elos-system.com/assets/og-cover.jpg">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://elos-system.com/changelog.html">
  <meta property="og:locale" content="ar_EG">
  <link rel="icon" type="image/png" href="/assets/favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Tajawal:wght@400;500;700;800&display=swap">
  <link rel="stylesheet" href="/css/style.css">
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-RLBB64DHQP"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-RLBB64DHQP', { 'send_page_view': true });
  </script>
  <style>
    .cl-page { padding: 140px 0 80px; min-height: 100vh; }
    .cl-page .container { max-width: 860px; }
    .cl-head { text-align: center; margin-bottom: 48px; }
    .cl-head h1 { font-family: var(--display); font-size: clamp(2rem, 4vw, 2.8rem); margin: 14px 0 10px; }
    .cl-head p { color: var(--mute); font-size: 1.05rem; line-height: 1.8; }
    .cl-head .btn { margin-top: 18px; }
    .cl-group { margin-bottom: 48px; }
    .cl-group-title { font-family: var(--display); font-size: 1.35rem; color: var(--teal-bright); margin: 0 0 18px; padding-bottom: 10px; border-bottom: 1px solid var(--stone); }
    .cl-item { display: grid; grid-template-columns: 200px 1fr; gap: 20px; padding: 22px 0; border-bottom: 1px dashed var(--stone); }
    .cl-item--latest { background: linear-gradient(90deg, rgba(13,148,136,.10), transparent); border-radius: var(--radius-sm); padding-inline: 16px; margin-inline: -16px; }
    .cl-meta h3 { font-size: 1.1rem; margin: 0 0 6px; color: var(--ink); display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
    .cl-meta time { font-size: 0.85rem; color: var(--mute); }
    .cl-badge { font-size: 0.7rem; font-weight: 700; color: #06131d; background: var(--teal-bright); border-radius: 999px; padding: 2px 10px; }
    .cl-badge--major { background: #fbbf24; }
    .cl-body ul { margin: 0; padding-inline-start: 18px; color: var(--ink-soft, var(--ink)); line-height: 1.9; }
    .cl-body li { margin-bottom: 4px; }
    .cl-empty { color: var(--mute); margin: 0; }
    @media (max-width: 640px) { .cl-item { grid-template-columns: 1fr; gap: 8px; } .cl-page { padding-top: 110px; } }
  </style>
</head>
<body>
  <div class="mobile-overlay"></div>
  <nav class="navbar scrolled">
    <div class="container">
      <a href="/" class="nav-logo"><img src="/assets/favicon.png" alt="ELOS" class="nav-logo-icon"> ELOS <span>V4</span></a>
      <ul class="nav-links">
        <li><a href="/#features">المميزات</a></li>
        <li><a href="/#mobile-app">تطبيق الموبايل</a></li>
        <li><a href="/#pricing">الباقات</a></li>
        <li><a href="/changelog.html" class="active">التحديثات</a></li>
        <li><a href="/#download">التحميل</a></li>
      </ul>
      <div class="nav-actions">
        <a href="https://wa.me/201031372078" target="_blank" rel="noopener noreferrer" class="nav-phone" data-track="nav-whatsapp" aria-label="واتساب"><span>01031372078</span></a>
        <a href="/#download" class="btn btn-primary btn-sm nav-cta" data-track="nav-cta">جرب مجاناً</a>
      </div>
      <button class="menu-toggle" aria-label="القائمة"><span></span><span></span><span></span></button>
    </div>
  </nav>

  <main class="cl-page">
    <div class="container">
      <div class="cl-head">
        <span class="section-badge">سجل التحديثات</span>
        <h1>الجديد في كل إصدار من ELOS</h1>
        <p>آخر إصدار <strong>{{LATEST}}</strong> · {{COUNT}} إصدار لحد دلوقتي. مستخدم حالي؟ التحديث بيوصلك تلقائي جوه البرنامج — مش محتاج تعمل حاجة.</p>
        <a href="/#download" class="btn btn-primary" data-track="changelog-download">⬇️ حمّل أحدث إصدار</a>
      </div>
      {{SECTIONS}}
    </div>
  </main>

  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="footer-logo">
            <img src="/assets/logo-64.webp" alt="ELOS" class="footer-logo-icon" width="32" height="32">
            ELOS V4
          </div>
          <p>أقوى نظام لمحلات الموبايلات في مصر. نقطة بيع، مخزون، صيانة، تقارير، وتطبيق موبايل في نظام واحد.</p>
          <div class="footer-social" aria-label="حسابات التواصل الاجتماعي">
            <a href="https://www.facebook.com/ElOsAccSystem/" target="_blank" rel="noopener" data-track="social-facebook" aria-label="فيسبوك">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://www.instagram.com/elos_acc/" target="_blank" rel="noopener" data-track="social-instagram" aria-label="انستجرام">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a href="https://www.youtube.com/@ElOsAccSystem" target="_blank" rel="noopener" data-track="social-youtube" aria-label="يوتيوب">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
            <a href="https://www.tiktok.com/@elos_accounting" target="_blank" rel="noopener" data-track="social-tiktok" aria-label="تيك توك">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z"/></svg>
            </a>
          </div>
        </div>
        <div class="footer-col">
          <h4>روابط سريعة</h4>
          <ul>
            <li><a href="/#features">المميزات</a></li>
            <li><a href="/الأسعار/">الباقات والأسعار</a></li>
            <li><a href="/download">تحميل / تحديث البرنامج</a></li>
            <li><a href="/changelog.html">سجل التحديثات</a></li>
            <li><a href="/about.html">عن ELOS</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>حلول</h4>
          <ul>
            <li><a href="/برنامج-محاسبة-محلات-موبايلات/">برنامج محاسبة محلات موبايلات</a></li>
            <li><a href="/برنامج-صيانة-موبايلات/">برنامج صيانة موبايلات</a></li>
            <li><a href="/برنامج-مخازن-موبايلات-IMEI/">مخزون الموبايلات بالـ IMEI</a></li>
            <li><a href="/برنامج-تقسيط-موبايلات/">برنامج تقسيط موبايلات</a></li>
            <li><a href="/برنامج-فروع-محلات-موبايلات/">إدارة فروع محلات الموبايلات</a></li>
            <li><a href="/تطبيق-متابعة-محل-الموبايلات/">تطبيق متابعة المحل من الموبايل</a></li>
            <li><a href="/الأسعار/">الأسعار والباقات</a></li>
            <li><a href="/elos-vs-dexef/">ELOS مقابل DEXEF</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>تواصل معنا</h4>
          <ul class="footer-contact">
            <li><span class="contact-icon">💬</span><a href="https://wa.me/201031372078?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%B9%D9%86%D8%AF%D9%8A%20%D8%B3%D8%A4%D8%A7%D9%84%20%D8%B9%D9%86%20%D8%A8%D8%B1%D9%86%D8%A7%D9%85%D8%AC%20ELOS" data-wa-msg="مرحباً، عندي سؤال عن برنامج ELOS" target="_blank" rel="noopener noreferrer" data-track="footer-whatsapp">01031372078</a></li>
            <li><span class="contact-icon">📧</span><a href="mailto:support@elos-system.com">support@elos-system.com</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 ELOS Development Team. جميع الحقوق محفوظة.</p>
        <p><a href="/privacy.html">سياسة الخصوصية</a></p>
      </div>
    </div>
  </footer>
  <script src="/js/main.js"></script>
</body>
</html>
'''

if __name__ == '__main__':
    rels = fetch_releases()
    if not rels:
        sys.exit('مفيش ريليزات؟')
    OUT.write_text(render(rels), encoding='utf-8', newline='\n')
    print(f'changelog.html: {len(rels)} إصدار، الأحدث {rels[0]["tagName"]}')
