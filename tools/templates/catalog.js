/**
 * Каталог «Усі майстер-класи» (masterclasses.html) — макети Catalog.html і MobileCatalog.html
 */

const { esc, plural, countClasses, indent } = require('../lib/html');
const { page, breadcrumbs } = require('./layout');
const { masterclassCard } = require('./parts');

const STEPS = [
  { cat: 'cook', title: 'Записуєтеся', text: 'Через форму на сайті або телефоном. Ми передзвонимо й підтвердимо час.' },
  { cat: 'paint', title: 'Приходите', text: 'Вт, ср або чт о 16:00 у Підгородному, вул. Шосейна, 90Б. Усі матеріали чекають на місці.' },
  { cat: 'nature', title: 'Творимо разом', text: 'Кожна дитина працює у своєму темпі, а майстриня допомагає саме тоді, коли це потрібно.' },
  { cat: 'decor', title: 'Забираєте додому', text: 'Готову роботу чи смаколик — і привід для гордості на весь вечір.' },
];

function filterButton(id, label, count, pressed) {
  return `<button class="filter${id === 'all' ? '' : ` cat-${id}`}" type="button" data-filter="${id}" aria-pressed="${pressed}">
  ${esc(label)} <span class="filter__count">${count}</span>
</button>`;
}

function catalogPage(site) {
  const { categories, masterclasses, siteUrl } = site;
  const total = masterclasses.length;
  const collage = masterclasses.filter((mc) => mc.featured && mc.cover).slice(0, 3);

  const main = `    <!-- ===================== Вступ ===================== -->
    <div class="page-hero">
      <div class="container page-hero__inner">
        <div>
${indent(breadcrumbs([{ label: 'Головна', href: 'index.html' }, { label: 'Майстер-класи' }]), 10)}
          <h1>Усі майстер-класи <span>«Паприки»</span></h1>
          <p class="page-hero__lead">${total} ${plural(total, 'заняття', 'заняття', 'занять')}, на яких діти готують, ліплять, плетуть, малюють і вирощують. Кожен працює у своєму темпі й забирає додому роботу, якою можна пишатися.</p>
          <ul class="badges">
            <li>Безкоштовно</li>
            <li>Вт, ср, чт · 16:00–18:00</li>
            <li>Для дітей з будь-якими можливостями</li>
          </ul>
        </div>

        <div class="collage" aria-hidden="true">
${collage.map((mc) => `          <img src="${mc.cover.thumb}" alt="" width="${mc.cover.thumbWidth}" height="${mc.cover.thumbHeight}">`).join('\n')}
        </div>
      </div>
    </div>

    <!-- ===================== Каталог ===================== -->
    <section class="section catalog" aria-labelledby="catalog-title">
      <div class="container">
        <h2 class="visually-hidden" id="catalog-title">Список майстер-класів</h2>

        <!-- Фільтри працюють через js/main.js; без JavaScript їх сховано й видно всі картки -->
        <div class="filters" role="group" aria-label="Напрями майстер-класів">
${indent([filterButton('all', 'Усі', total, true), ...categories.map((c) => filterButton(c.id, c.label, c.count, false))].join('\n'), 10)}
        </div>
        <p class="catalog__status" role="status">Показано: <b data-shown-count>${total}</b> · натисніть на картку, щоб побачити фото, відео й опис</p>

        <ul class="mc-grid mc-grid--catalog">
${indent(masterclasses.map((mc) => `<li data-category="${mc.category.id}">\n${indent(masterclassCard(mc, { more: true }), 2)}\n</li>`).join('\n'), 10)}
        </ul>
      </div>
    </section>

    <!-- ===================== Як проходить заняття ===================== -->
    <section class="section section--alt" aria-labelledby="steps-title">
      <div class="container">
        <span class="section__eyebrow">Для батьків</span>
        <h2 id="steps-title">Як проходить заняття</h2>
        <ol class="steps">
${STEPS.map((step, i) => `          <li class="step cat-${step.cat}">
            <span class="step__num" aria-hidden="true">${i + 1}</span>
            <b class="step__title">${esc(step.title)}</b>
            <span class="step__text">${esc(step.text)}</span>
          </li>`).join('\n')}
        </ol>
      </div>
    </section>

    <!-- ===================== Не знаєте, що обрати? ===================== -->
    <section class="section" aria-labelledby="help-title">
      <div class="container">
        <div class="help-box">
          <div class="help-box__text">
            <h2 id="help-title">Не знаєте, що обрати?</h2>
            <p>Зателефонуйте нам, і ми разом підберемо майстер-клас, який підійде саме вашій дитині: за віком, інтересами та можливостями.</p>
          </div>
          <div class="help-box__actions">
            <a class="btn btn--ghost" href="tel:+380671717288"><span class="visually-hidden">Подзвонити:</span> 067 171 72 88</a>
            <a class="btn" href="index.html#book">Записатися</a>
          </div>
        </div>
      </div>
    </section>`;

  return page({
    title: 'Усі майстер-класи — Paprika Artstudio',
    description: `${countClasses(total)} для дітей: кулінарія, ремесла, малювання, декор і природа. Безкоштовно, вт–чт 16:00–18:00, Підгородне.`,
    base: '',
    path: 'masterclasses.html',
    siteUrl,
    image: collage[0] ? collage[0].cover.src : null,
    bookHref: 'index.html#book',
    main,
  });
}

module.exports = { catalogPage };
