/**
 * Дрібні помічники для шаблонів: екранування тексту, відмінки, значки
 */

/* Екранує текст для вставки в HTML (і в атрибути) */
function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* 1 майстер-клас, 2 майстер-класи, 5 майстер-класів */
function plural(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

function countClasses(n) {
  return `${n} ${plural(n, 'майстер-клас', 'майстер-класи', 'майстер-класів')}`;
}

/* Зсуває кожен рядок фрагмента на потрібну кількість пробілів */
function indent(html, spaces) {
  const pad = ' '.repeat(spaces);
  return html
    .split('\n')
    .map((line) => (line ? pad + line : line))
    .join('\n');
}

const svg = (size, body, extra = '') =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}>${body}</svg>`;

/* Значки напрямів (з макета Main.html) */
const CATEGORY_ICONS = {
  cook: '<path d="M3 21h18"/><path d="M5 21v-8h14v8"/><path d="M5 13c0-2 1.5-3 3.5-3h7c2 0 3.5 1 3.5 3"/><path d="M12 10V7"/><path d="M12 4v.5"/>',
  craft: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9"/><path d="M14.5 14.5 20 20"/><path d="M8.1 8.1 12 12"/>',
  paint: '<path d="M12 2a10 10 0 0 0 0 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.4A5.6 5.6 0 0 0 22 9.8C22 5.5 17.5 2 12 2z"/><circle cx="7.5" cy="10.5" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="16.5" cy="10.5" r="1"/>',
  decor: '<path d="M20 12v9H4v-9"/><path d="M2 7h20v5H2z"/><path d="M12 21V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
  nature: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"/><path d="M2 21c0-3 1.9-5.4 5.1-6"/>',
};

const ICONS = {
  arrow: svg(18, '<path d="M5 12h14M13 6l6 6-6 6"/>', '').replace('stroke-width="2"', 'stroke-width="2.4"'),
  back: svg(20, '<path d="M15 18l-6-6 6-6"/>').replace('stroke-width="2"', 'stroke-width="2.4"'),
  calendar: svg(20, '<rect x="3" y="4.5" width="18" height="16" rx="3"/><path d="M8 2.5v4M16 2.5v4M3 10h18"/><path d="m9 15 2 2 4-4"/>').replace('stroke-width="2"', 'stroke-width="2.2"'),
  heart: svg(19, '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>').replace('stroke-width="2"', 'stroke-width="2.2"'),
  share: svg(20, '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>'),
  phone: svg(20, '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>'),
  play: '<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
  playSmall: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg>',
  categoryIcon: (id) => svg(22, CATEGORY_ICONS[id] || ''),
};

module.exports = { esc, plural, countClasses, indent, ICONS };
