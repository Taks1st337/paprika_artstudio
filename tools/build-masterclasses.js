#!/usr/bin/env node
/**
 * Paprika Artstudio — генератор розділу «Майстер-класи»
 *
 * Що робить:
 *   1. Готує фото (зменшує завеликі, робить мініатюри) — tools/resize-photos.ps1
 *   2. Читає тексти з data/masterclasses.json і фото з images/masterclasses/<slug>/
 *   3. Оновлює блок «Майстер-класи» й список у формі на головній (index.html)
 *   4. Створює каталог masterclasses.html і сторінки masterclasses/<slug>.html
 *
 * Запуск (з папки сайту, у терміналі VS Code):
 *   node tools/build-masterclasses.js
 *   node tools/build-masterclasses.js --no-resize   (без обробки фото)
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const { findPhotos } = require('./lib/images');
const { indent } = require('./lib/html');
const { homeBlock, formOptions } = require('./templates/home');
const { catalogPage } = require('./templates/catalog');
const { detailPage } = require('./templates/detail');

/* Повна адреса опублікованого сайту, наприклад 'https://paprika.example.com/'.
   Коли вона відома — впишіть її сюди: з'являться canonical, og:url і sitemap.xml
   (це допомагає Google і соцмережам правильно показувати сторінки). */
const SITE_URL = '';

const ROOT = path.join(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data', 'masterclasses.json');

/* 1. Фото
   ========================================================================== */

function preparePhotos() {
  if (process.argv.includes('--no-resize')) return;
  if (process.platform !== 'win32') {
    console.log('⚠ Обробка фото працює лише на Windows — пропускаю (сторінки все одно буде створено).');
    return;
  }
  console.log('Готую фото…');
  const result = spawnSync('powershell', [
    '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(__dirname, 'resize-photos.ps1'),
  ], { encoding: 'utf8' });

  if (result.status !== 0) {
    console.error(result.stdout, result.stderr);
    throw new Error('Не вдалося обробити фото (див. повідомлення вище).');
  }
  const lines = result.stdout.trim().split(/\r?\n/);
  for (const line of lines) {
    const [kind, ...rest] = line.split(' ');
    const text = rest.join(' ');
    if (kind === 'RESIZED') console.log(`  зменшено: ${text}`);
    if (kind === 'THUMB') console.log(`  мініатюра: ${text}`);
    if (kind === 'REMOVED') console.log(`  прибрано зайву мініатюру: ${text}`);
    if (kind === 'SKIP') console.log(`  ⚠ ${text.replace(': format not supported, save it as JPG', '')} — цей формат браузери не показують, збережіть фото як JPG`);
  }
  if (lines.length === 1) console.log('  усі фото вже готові');
}

/* 2. Дані
   ========================================================================== */

function normalizeVideo(video) {
  const { url, duration = '' } = typeof video === 'string' ? { url: video } : video;
  const youtube = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{11})/);
  if (youtube) return { url, duration, kind: 'youtube', id: youtube[1] };
  if (/instagram\.com/.test(url)) return { url, duration, kind: 'instagram' };
  return { url, duration, kind: 'link' };
}

function loadData() {
  const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const problems = [];
  const categories = raw.categories.map((c) => ({ ...c, count: 0 }));
  const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]));
  const slugs = new Set();

  const masterclasses = raw.masterclasses.map((mc) => {
    if (slugs.has(mc.slug)) problems.push(`slug «${mc.slug}» повторюється`);
    slugs.add(mc.slug);

    const category = categoryById[mc.category];
    if (!category) problems.push(`«${mc.title}»: невідомий напрям «${mc.category}»`);
    else category.count++;

    const master = mc.master ? raw.masters[mc.master] : null;
    if (mc.master && !master) problems.push(`«${mc.title}»: невідома майстриня «${mc.master}»`);

    // Порожня папка для фото створюється автоматично
    const dir = path.join(ROOT, 'images', 'masterclasses', mc.slug);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, '.gitkeep'), '');
      console.log(`  створено папку для фото: images/masterclasses/${mc.slug}/`);
    }

    const alts = mc.alts || {};
    const photos = findPhotos(ROOT, mc.slug).map((photo, i) => ({
      ...photo,
      alt: alts[photo.name] || `${mc.title} — фото з заняття ${i + 1}`,
    }));

    return {
      ...mc,
      category,
      master: master ? { id: mc.master, ...master } : null,
      photos,
      cover: photos[0] || null,
      videos: (mc.videos || []).map(normalizeVideo),
    };
  });

  masterclasses.forEach((mc) => { mc.related = pickRelated(mc, masterclasses); });

  const featured = masterclasses.filter((mc) => mc.featured).length;
  if (featured !== 3) problems.push(`«Улюблених» (featured: true) має бути 3, а зараз ${featured}`);

  if (problems.length) {
    throw new Error(`У data/masterclasses.json є помилки:\n  - ${problems.join('\n  - ')}`);
  }
  return { categories, masterclasses, masters: raw.masters };
}

/* «Вам також може сподобатися»: до 2 з того самого напряму (наступні за списком),
   решта — зі схожих напрямів (поле related у categories) */
function pickRelated(mc, all, limit = 3) {
  const after = (list) => {
    const i = list.indexOf(mc);
    return i < 0 ? list : [...list.slice(i + 1), ...list.slice(0, i)];
  };
  const sameCategory = after(all.filter((x) => x.category === mc.category)).slice(0, 2);
  const picked = [...sameCategory];
  for (const id of mc.category.related || []) {
    for (const x of all.filter((item) => item.category.id === id)) {
      if (picked.length >= limit) break;
      picked.push(x);
    }
  }
  for (const x of after(all)) {
    if (picked.length >= limit) break;
    if (!picked.includes(x)) picked.push(x);
  }
  return picked.slice(0, limit);
}

/* 3. Запис файлів
   ========================================================================== */

/* Замінює вміст між <!-- mc:name:start --> і <!-- mc:name:end -->,
   зберігаючи відступ, з яким стоїть позначка */
function replaceRegion(html, name, content) {
  const re = new RegExp(`([ \\t]*)(<!-- mc:${name}:start[^>]*-->)[\\s\\S]*?<!-- mc:${name}:end -->`);
  if (!re.test(html)) throw new Error(`У index.html не знайдено позначок mc:${name}`);
  return html.replace(re, (_, pad, start) =>
    `${pad}${start}\n${indent(content, pad.length)}\n${pad}<!-- mc:${name}:end -->`);
}

function writeIfChanged(rel, content) {
  const file = path.join(ROOT, rel);
  const old = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  if (old === content) return false;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  return true;
}

function updateHome(site) {
  const rel = 'index.html';
  let html = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  html = replaceRegion(html, 'home', homeBlock(site));
  html = replaceRegion(html, 'options', formOptions(site));
  return writeIfChanged(rel, html) ? [rel] : [];
}

function writeDetailPages(site) {
  const changed = [];
  const expected = new Set();
  for (const mc of site.masterclasses) {
    const rel = `masterclasses/${mc.slug}.html`;
    expected.add(`${mc.slug}.html`);
    if (writeIfChanged(rel, detailPage(site, mc))) changed.push(rel);
  }

  // Сторінки майстер-класів, яких більше немає в даних, видаляємо
  const dir = path.join(ROOT, 'masterclasses');
  for (const name of fs.readdirSync(dir)) {
    if (name.endsWith('.html') && !expected.has(name)) {
      fs.unlinkSync(path.join(dir, name));
      changed.push(`masterclasses/${name} (видалено)`);
    }
  }
  return changed;
}

/* Карта сайту для Google — лише коли відома адреса сайту (SITE_URL) */
function writeSitemap(site) {
  if (!site.siteUrl) return [];
  const pages = ['', 'masterclasses.html', ...site.masterclasses.map((mc) => `masterclasses/${mc.slug}.html`)];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${new URL(p, site.siteUrl).href}</loc></url>`).join('\n')}
</urlset>
`;
  return writeIfChanged('sitemap.xml', xml) ? ['sitemap.xml'] : [];
}

/* Запуск
   ========================================================================== */

function main() {
  preparePhotos();
  const site = { ...loadData(), siteUrl: SITE_URL };

  const changed = [...updateHome(site)];
  if (writeIfChanged('masterclasses.html', catalogPage(site))) changed.push('masterclasses.html');
  changed.push(...writeDetailPages(site));
  changed.push(...writeSitemap(site));

  const withoutPhotos = site.masterclasses.filter((mc) => !mc.cover).map((mc) => mc.title);
  console.log(`\nГотово: ${site.masterclasses.length} майстер-класів.`);
  console.log(changed.length ? `Оновлено файли:\n  ${changed.join('\n  ')}` : 'Усі сторінки вже актуальні.');
  if (withoutPhotos.length) console.log(`Ще без фото (показуємо заглушку): ${withoutPhotos.join(', ')}.`);
}

try {
  main();
} catch (error) {
  console.error(`\n✖ ${error.message}`);
  process.exit(1);
}
