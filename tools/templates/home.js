/**
 * Блок «Майстер-класи» на головній (index.html, між позначками mc:home)
 * і варіанти в списку форми запису (між позначками mc:options)
 */

const { esc, countClasses, indent, ICONS } = require('../lib/html');
const { masterclassCard } = require('./parts');

function directionTile(category) {
  return `<li>
  <a class="direction cat-${category.id}" href="masterclasses.html?napriam=${category.id}">
    <span class="direction__icon" aria-hidden="true">
      ${ICONS.categoryIcon(category.id)}
    </span>
    <b class="direction__title">${esc(category.label)}</b>
    <span class="direction__text">${esc(category.blurb)}</span>
    <span class="direction__count">${countClasses(category.count)}</span>
  </a>
</li>`;
}

function homeBlock({ categories, masterclasses }) {
  const total = masterclasses.length;
  const featured = masterclasses.filter((mc) => mc.featured);

  return `<div class="classes-head">
  <div class="classes-head__text">
    <span class="section__eyebrow">Чим займаємося</span>
    <h2>${countClasses(total)}, де кожна дитина творить власноруч</h2>
    <p>Готуємо, ліпимо, плетемо, малюємо й вирощуємо. Оберіть напрям, який сподобається саме вашій дитині.</p>
  </div>
  <a class="btn" href="masterclasses.html">
    Усі майстер-класи
    ${ICONS.arrow}
  </a>
</div>

<ul class="directions">
${indent(categories.map(directionTile).join('\n'), 2)}
</ul>

<div class="subhead">
  <h3>Улюблені майстер-класи дітей</h3>
  <a class="link-more" href="masterclasses.html">Дивитися всі ${total} →</a>
</div>

<ul class="mc-grid">
${indent(featured.map((mc) => `<li>\n${indent(masterclassCard(mc, { heading: 'h4' }), 2)}\n</li>`).join('\n'), 2)}
</ul>`;
}

function formOptions({ masterclasses }, selectedSlug = null) {
  return masterclasses
    .map((mc) => `<option${mc.slug === selectedSlug ? ' selected' : ''}>${esc(mc.title)}</option>`)
    .join('\n');
}

module.exports = { homeBlock, formOptions };
