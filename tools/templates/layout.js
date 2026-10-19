/**
 * Каркас згенерованих сторінок: <head>, шапка з меню й підвал.
 * Тексти, контакти й адреса — ті самі, що на головній (index.html).
 */

const { esc } = require('../lib/html');

/**
 *   base        — шлях до кореня сайту ('' для каталогу, '../' для сторінок майстер-класів)
 *   path        — шлях сторінки від кореня (для canonical/og:url), напр. 'masterclasses.html'
 *   siteUrl     — повна адреса сайту або '' (тоді canonical/og:url не додаємо)
 *   image       — фото для превʼю в соцмережах (шлях від кореня) або null
 *   bodyClass   — додатковий клас для <body>
 *   bookHref    — куди веде кнопка «Записатися» в шапці
 */
function page({ title, description, base, path, siteUrl, image = null, bodyClass = '', bookHref = '#book', main, after = '' }) {
  const absolute = (rel) => (siteUrl ? new URL(rel, siteUrl).href : '');
  const seo = siteUrl
    ? `
  <link rel="canonical" href="${absolute(path)}">
  <meta property="og:url" content="${absolute(path)}">${image ? `
  <meta property="og:image" content="${absolute(image)}">` : ''}`
    : '';

  return `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="theme-color" content="#E8591A">

  <!-- Open Graph (превʼю при поширенні в соцмережах) -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:locale" content="uk_UA">${seo}

  <link rel="icon" type="image/png" href="${base}images/logo.png">
  <link rel="apple-touch-icon" href="${base}images/logo.png">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@600;700&family=Nunito:wght@400;600;700&display=swap">

  <link rel="stylesheet" href="${base}css/style.css">
  <script src="${base}js/main.js" defer></script>
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
  <!-- Цю сторінку створює tools/build-masterclasses.js — не редагуйте її вручну -->
  <a class="skip-link" href="#main">Перейти до змісту</a>

${header(base, bookHref)}

  <main id="main">
${main}
  </main>

${footer(base)}
${after}</body>
</html>
`;
}

function header(base, bookHref) {
  const home = `${base}index.html`;
  return `  <!-- ===================== Шапка ===================== -->
  <header class="header">
    <div class="container header__inner">
      <a class="logo" href="${home}">
        <img src="${base}images/logo.png" alt="" width="46" height="46">
        <span>Paprika Artstudio</span>
      </a>

      <nav class="nav" id="site-nav" aria-label="Розділи">
        <ul class="nav__list">
          <li><a class="nav__link" href="${home}#about">Про нас</a></li>
          <li><a class="nav__link is-active" href="${base}masterclasses.html" aria-current="page">Майстер-класи</a></li>
          <li><a class="nav__link" href="${home}#gallery">Галерея</a></li>
          <li><a class="nav__link" href="${home}#team">Майстри</a></li>
          <li><a class="nav__link" href="${home}#book">Запис</a></li>
        </ul>
        <a class="btn nav__cta-mobile" href="${bookHref}">Записатися</a>
      </nav>

      <a class="btn btn--small header__cta" href="${bookHref}">Записатися</a>

      <button class="burger" type="button" aria-controls="site-nav" aria-expanded="false" aria-label="Відкрити меню">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>`;
}

function footer(base) {
  return `  <!-- ===================== Підвал ===================== -->
  <footer class="footer">
    <div class="container">
      <div class="footer__inner">
        <div class="footer__about">
          <a class="logo" href="${base}index.html">
            <img src="${base}images/logo.png" alt="" width="46" height="46" loading="lazy">
            <span>Paprika Artstudio</span>
          </a>
          <p>Разом робимо світ яскравішим! ❤️</p>
        </div>

        <div>
          <h2 class="footer__title">Контакти</h2>
          <ul class="footer__list">
            <li><a href="tel:+380671717288">067 171 72 88</a></li>
            <li><a href="tel:+380938850040">093 885 00 40</a></li>
            <li><a href="https://instagram.com/paprika_artstudio" target="_blank" rel="noopener">@paprika_artstudio</a></li>
          </ul>
        </div>

        <div>
          <h2 class="footer__title">Адреса</h2>
          <ul class="footer__list">
            <li>Підгородне, вул. Шосейна, 90Б</li>
            <li>Вт, ср, чт · 16:00–18:00</li>
          </ul>
        </div>
      </div>

      <div class="footer__bottom">
        © <span id="year">2026</span> Paprika Artstudio
      </div>
    </div>
  </footer>`;
}

/* Хлібні крихти: [{ label, href }], останній пункт — поточна сторінка */
function breadcrumbs(items) {
  const last = items.length - 1;
  return `<nav class="breadcrumbs" aria-label="Ви тут">
  <ol>
${items.map((item, i) => (i === last
    ? `    <li><span aria-current="page">${esc(item.label)}</span></li>`
    : `    <li><a href="${item.href}">${esc(item.label)}</a></li>`)).join('\n')}
  </ol>
</nav>`;
}

module.exports = { page, breadcrumbs };
