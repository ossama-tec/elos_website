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
      <div class="footer-bottom">
        <p>&copy; 2026 ELOS Development Team. جميع الحقوق محفوظة.</p>
        <p><a href="/">الرئيسية</a> · <a href="/about.html">عن ELOS</a> · <a href="/privacy.html">سياسة الخصوصية</a></p>
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
