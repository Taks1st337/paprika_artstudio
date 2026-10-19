/**
 * Сторінка одного майстер-класу (masterclasses/<slug>.html) — макети Detail.html і MobileDetail.html
 */

const { esc, indent, ICONS } = require('../lib/html');
const { page, breadcrumbs } = require('./layout');
const { photoPlaceholder } = require('./parts');
const { formOptions } = require('./home');

const BASE = '../';

/* --- Відео ---------------------------------------------------------------- */

/* Плитка відео. Поки посилання немає — лише позначене місце (не кнопка) */
function videoTile(mc, video, className) {
  if (!video) {
    return `<div class="video-tile video-tile--empty ${className}" aria-hidden="true">
  <span class="video-tile__play">${ICONS.play}</span>
  <span class="video-tile__note">Тут буде відео з заняття</span>
</div>`;
  }

  const label = `Відео${video.duration ? ` · ${esc(video.duration)}` : ''}`;
  const inner = `${video.kind === 'youtube' ? `<img src="https://i.ytimg.com/vi/${video.id}/hqdefault.jpg" alt="" width="480" height="360" loading="lazy">\n  ` : ''}<span class="video-tile__play">${ICONS.play}</span>
  <span class="video-tile__label">${label}</span>`;

  // YouTube вбудовуємо лише після натискання (js/main.js), інше відкриваємо в новій вкладці
  if (video.kind === 'youtube') {
    return `<button class="video-tile ${className}" type="button" data-youtube="${video.id}" data-title="${esc(`Відео з майстер-класу «${mc.title}»`)}" aria-label="${esc(`Переглянути відео з майстер-класу «${mc.title}»`)}">
  ${inner}
</button>`;
  }
  return `<a class="video-tile ${className}" href="${esc(video.url)}" target="_blank" rel="noopener" aria-label="${esc(`Переглянути відео з майстер-класу «${mc.title}» (відкриється в новій вкладці)`)}">
  ${inner}
</a>`;
}

/* --- Верхній блок ----------------------------------------------------------- */

function slide(content) {
  return `<li class="mc-slider__slide">\n${indent(content, 2)}\n</li>`;
}

/* Фото вгорі: на комп'ютері видно перше, на телефоні всі гортаються пальцем.
   Другим слайдом іде відео (або місце під нього), як у макеті MobileDetail.html */
function heroMedia(mc) {
  const photoSlides = mc.photos.map((photo, i) => slide(
    `<img src="${BASE}${photo.src}" srcset="${BASE}${photo.thumb} ${photo.thumbWidth}w, ${BASE}${photo.src} ${photo.width}w" sizes="(max-width: 760px) 85vw, 540px" alt="${esc(photo.alt)}" width="${photo.width}" height="${photo.height}"${i === 0 ? '' : ' loading="lazy"'}>`,
  ));
  const videoSlides = (mc.videos.length ? mc.videos : [null]).map((video) => slide(videoTile(mc, video, 'mc-slider__video')));
  const first = photoSlides.length ? photoSlides[0] : slide(photoPlaceholder());
  const slides = [first, ...videoSlides, ...photoSlides.slice(1)];

  return `<div class="mc-slider">
  <ul class="mc-slider__track" tabindex="0" aria-label="Фото й відео з заняття">
${indent(slides.join('\n'), 4)}
  </ul>
  <div class="mc-slider__dots" aria-hidden="true">
${slides.map((_, i) => `    <span${i === 0 ? ' class="is-active"' : ''}></span>`).join('\n')}
  </div>
</div>`;
}

function hero(mc) {
  return `<div class="mc-hero cat-${mc.category.id}">
  <div class="container">
${indent(breadcrumbs([
    { label: 'Головна', href: `${BASE}index.html` },
    { label: 'Майстер-класи', href: `${BASE}masterclasses.html` },
    { label: mc.title },
  ]), 4)}

    <!-- На телефоні замість хлібних крихт -->
    <div class="mc-topbar">
      <a class="mc-topbar__back" href="${BASE}masterclasses.html">${ICONS.back}Усі майстер-класи</a>
      <button class="mc-topbar__share" type="button" data-share aria-label="Поділитися">${ICONS.share}</button>
    </div>

    <div class="mc-hero__inner">
      <div class="mc-hero__text">
        <span class="tag mc-hero__tag">${esc(mc.category.label)}</span>
        <h1>«${esc(mc.title)}»</h1>
        <p class="mc-hero__lead">${esc(mc.description)}</p>
        <div class="mc-hero__actions">
          <a class="cta" href="#book">
            Записатися на цей майстер-клас
            <span class="cta__icon">${ICONS.calendar}</span>
          </a>
          <button class="share-btn" type="button" data-share>
            <span class="share-btn__icon">${ICONS.heart}</span>
            Поділитися з друзями
          </button>
        </div>
      </div>

${indent(heroMedia(mc), 6)}
    </div>
  </div>
</div>`;
}

/* --- Фото й відео з занять --------------------------------------------------- */

function photoButton(mc, photo, hidden = false) {
  return `<button class="gallery-tile" type="button" data-lightbox data-full="${BASE}${photo.src}"${hidden ? ' hidden' : ''}>
  <img src="${BASE}${photo.thumb}" alt="${esc(photo.alt)}" width="${photo.thumbWidth}" height="${photo.thumbHeight}" loading="lazy">
</button>`;
}

function gallery(mc) {
  const videos = mc.videos.length ? mc.videos : [null];
  const tiles = videos.map((video, i) => videoTile(mc, video, i === 0 ? 'mc-gallery__main' : ''));

  // Поруч із великою плиткою відео — 4 клітинки (менше, якщо відео кілька)
  const slots = Math.max(2, 4 - (videos.length - 1));
  const { photos } = mc;
  if (photos.length <= slots) {
    tiles.push(...photos.map((p) => photoButton(mc, p)));
    for (let i = photos.length; i < slots; i++) {
      tiles.push('<div class="gallery-tile gallery-tile--empty" aria-hidden="true">Фото з заняття</div>');
    }
  } else {
    const visible = slots - 1;
    tiles.push(...photos.slice(0, visible).map((p) => photoButton(mc, p)));
    tiles.push(`<button class="gallery-tile gallery-tile--more" type="button" data-lightbox-open="${visible}">
  <span>+ ще ${photos.length - visible} фото</span>
</button>`);
    tiles.push(...photos.slice(visible).map((p) => photoButton(mc, p, true)));
  }

  const openAll = photos.length > 1
    ? '\n      <button class="link-more link-button" type="button" data-lightbox-open="0">Відкрити всі фото →</button>'
    : '';

  return `<section class="section mc-media" aria-labelledby="media-title">
  <div class="container">
    <div class="subhead">
      <h2 id="media-title">Фото й відео з занять</h2>${openAll}
    </div>
    <div class="mc-gallery" data-lightbox-group>
${indent(tiles.join('\n'), 6)}
    </div>
  </div>
</section>`;
}

/* --- Що готуємо / що розвиває ------------------------------------------------ */

function details(mc) {
  const blocks = [];
  if (mc.extra) {
    blocks.push(`<div>
  <h2>${esc(mc.extra.title)}</h2>
  <ul class="pills">
${mc.extra.items.map((item) => `    <li>${esc(item)}</li>`).join('\n')}
  </ul>
</div>`);
  }
  if (mc.develops) {
    blocks.push(`<div>
  <h2>Що розвиває заняття</h2>
  <ul class="develops">
${mc.develops.map((d) => `    <li><b>${esc(d.title)}</b> <span>${esc(d.text)}</span></li>`).join('\n')}
  </ul>
</div>`);
  }
  if (!blocks.length) return '';

  return `
<section class="section section--alt mc-details">
  <div class="container mc-details__inner">
${indent(blocks.join('\n'), 4)}
  </div>
</section>`;
}

/* --- Майстриня ---------------------------------------------------------------- */

function masterCard(mc) {
  const m = mc.master;
  if (!m) return '';
  return `
<section class="section mc-master-section" aria-label="Хто проводить заняття">
  <div class="container">
    <div class="mc-master">
      <img src="${BASE}${m.photo}" alt="${esc(m.alt)}" width="140" height="140" loading="lazy">
      <div class="mc-master__body">
        <span class="section__eyebrow">Проводить заняття</span>
        <b class="mc-master__name">${esc(m.name)}</b>
        <span class="mc-master__role">${esc(m.role)}</span>
        <p class="mc-master__quote">«${esc(m.quote)}»</p>
      </div>
      <a class="btn btn--ghost" href="${BASE}index.html#bio-${m.id}">Читати історію</a>
    </div>
  </div>
</section>`;
}

/* --- Запис ---------------------------------------------------------------------- */

function booking(site, mc) {
  return `<section class="section section--alt" id="book" aria-labelledby="book-title">
  <div class="container booking">
    <div>
      <span class="section__eyebrow">Запис</span>
      <h2 id="book-title">Записатися на майстер-клас «${esc(mc.title)}»</h2>
      <p>Залиште телефон, і ми передзвонимо, щоб підтвердити участь. Якщо дитині потрібна особлива підтримка — просто напишіть про це в коментарі.</p>
      <p><b>Телефон:</b> <a href="tel:+380671717288">067 171 72 88</a>, <a href="tel:+380938850040">093 885 00 40</a></p>
    </div>

    <form class="form" id="booking-form" novalidate>
      <label class="form__field">
        Ім'я
        <input class="form__input" name="name" type="text" autocomplete="name" placeholder="Як до вас звертатися" required>
        <span class="form__error" data-error-for="name" aria-live="polite"></span>
      </label>

      <label class="form__field">
        Номер телефону
        <input class="form__input" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+380 __ ___ __ __" required>
        <span class="form__error" data-error-for="phone" aria-live="polite"></span>
      </label>

      <label class="form__field">
        Майстер-клас
        <select class="form__input" name="kind">
${indent(formOptions(site, mc.slug), 10)}
        </select>
      </label>

      <label class="form__field">
        Коментар (необов'язково)
        <textarea class="form__input" name="comment" rows="2" placeholder="Вік дитини, побажання"></textarea>
      </label>

      <button class="btn" type="submit">Надіслати заявку</button>
      <p class="form__note">Заняття безкоштовні. Ми зателефонуємо, щоб підтвердити запис.</p>

      <div class="form__success" id="booking-success" role="status" hidden>
        Дякуємо! Заявку прийнято, скоро зв'яжемося з вами.
      </div>
    </form>
  </div>
</section>`;
}

/* --- Вам також може сподобатися ----------------------------------------------- */

function related(mc) {
  const cards = mc.related.map((r) => {
    const media = r.cover
      ? `<img src="${BASE}${r.cover.thumb}" alt="" width="${r.cover.thumbWidth}" height="${r.cover.thumbHeight}" loading="lazy">`
      : '<span class="related__ph" aria-hidden="true"></span>';
    return `<li>
  <a class="related cat-${r.category.id}" href="${r.slug}.html">
    ${media}
    <span class="related__text">
      <span class="related__cat">${esc(r.category.label)}</span>
      <b class="related__title">${esc(r.title)}</b>
    </span>
  </a>
</li>`;
  });

  return `<section class="section mc-related" aria-labelledby="related-title">
  <div class="container">
    <h2 id="related-title">Вам також може сподобатися</h2>
    <ul class="related-list">
${indent(cards.join('\n'), 6)}
    </ul>
    <p class="mc-related__back"><a class="link-more" href="${BASE}masterclasses.html">← Усі майстер-класи</a></p>
  </div>
</section>`;
}

/* --- Нижня панель на телефоні й лайтбокс ----------------------------------------- */

const MOBILE_BAR = `  <!-- Панель запису внизу екрана (лише на телефоні) -->
  <div class="mobile-bar">
    <a class="mobile-bar__call" href="tel:+380671717288" aria-label="Подзвонити: 067 171 72 88">${ICONS.phone}</a>
    <a class="cta cta--auto-shine mobile-bar__cta" href="#book">
      Записатися безкоштовно
      <span class="cta__icon">${ICONS.calendar.replace('width="20" height="20"', 'width="19" height="19"')}</span>
    </a>
  </div>

  <!-- Перегляд фото на весь екран -->
  <dialog class="lightbox" id="lightbox" aria-label="Перегляд фото">
    <form method="dialog">
      <button class="lightbox__close" type="submit" aria-label="Закрити">&times;</button>
    </form>
    <img alt="">
    <button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Попереднє фото" hidden>‹</button>
    <button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Наступне фото" hidden>›</button>
    <p class="lightbox__caption"></p>
  </dialog>

  <!-- Повідомлення «Посилання скопійовано» -->
  <div class="toast" role="status" aria-live="polite"></div>
`;

/* --- Сторінка ---------------------------------------------------------------------- */

function detailPage(site, mc) {
  const main = [
    hero(mc),
    gallery(mc),
    details(mc),
    masterCard(mc),
    booking(site, mc),
    related(mc),
  ].filter(Boolean).map((block) => block.trim()).join('\n\n');

  return page({
    title: `${mc.title} — майстер-клас для дітей | Paprika Artstudio`,
    description: mc.short,
    base: BASE,
    path: `masterclasses/${mc.slug}.html`,
    siteUrl: site.siteUrl,
    image: mc.cover ? mc.cover.src : null,
    // Клас напряму на <body>: заглушки фото й відео по всій сторінці мають його колір
    bodyClass: `has-mobile-bar cat-${mc.category.id}`,
    main: indent(main, 4),
    after: MOBILE_BAR,
  });
}

module.exports = { detailPage };
