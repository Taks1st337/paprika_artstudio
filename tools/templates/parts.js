/**
 * Спільні шматочки розмітки: картка майстер-класу й кольорова заглушка фото
 */

const { esc, ICONS } = require('../lib/html');

/* Кольорова заглушка в тоні напряму, поки фото ще немає */
function photoPlaceholder(text = 'Тут буде фото з заняття') {
  return `<div class="photo-ph">
  <span class="photo-ph__tiles" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></span>
  <span class="photo-ph__text">${esc(text)}</span>
</div>`;
}

/**
 * Картка майстер-класу для головної та каталогу.
 * Уся картка клікабельна, але посилання для читача екрана — лише назва.
 *   base    — шлях до кореня сайту ('' або '../')
 *   heading — рівень заголовка назви (h3/h4)
 *   more    — показувати «Детальніше →» (каталог)
 */
function masterclassCard(mc, { base = '', heading = 'h3', more = false } = {}) {
  const media = mc.cover
    ? `<img src="${base}${mc.cover.thumb}" alt="" width="${mc.cover.thumbWidth}" height="${mc.cover.thumbHeight}" loading="lazy">`
    : photoPlaceholder();
  const videoBadge = mc.videos.length
    ? `\n    <span class="mc-card__badge">${ICONS.playSmall}Є відео</span>`
    : '';
  const result = `<p class="mc-card__result"><b>Додому:</b> ${esc(mc.result)}</p>`;
  const footer = more
    ? `<div class="mc-card__footer">
      ${result}
      <span class="mc-card__more" aria-hidden="true">Детальніше →</span>
    </div>`
    : result;

  return `<article class="mc-card cat-${mc.category.id} reveal">
  <div class="mc-card__media">
${indentLines(media, 4)}${videoBadge}
  </div>
  <div class="mc-card__body">
    <span class="tag">${esc(mc.category.label)}</span>
    <${heading} class="mc-card__title"><a class="mc-card__link" href="${base}masterclasses/${mc.slug}.html">${esc(mc.title)}</a></${heading}>
    <p class="mc-card__text">${esc(mc.short)}</p>
    ${footer}
  </div>
</article>`;
}

function indentLines(html, spaces) {
  const pad = ' '.repeat(spaces);
  return html.split('\n').map((line) => pad + line).join('\n');
}

module.exports = { photoPlaceholder, masterclassCard };
