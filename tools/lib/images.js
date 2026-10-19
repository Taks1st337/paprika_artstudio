/**
 * Фото майстер-класів: пошук у папці й визначення розмірів (для width/height)
 * без сторонніх бібліотек — читаємо заголовки JPG і PNG.
 */

const fs = require('fs');
const path = require('path');

const PHOTO_EXT = /\.(jpe?g|png)$/i;

/* Розміри JPG: шукаємо блок SOF, а також позначку повороту EXIF */
function jpegSize(buf) {
  let offset = 2;
  let orientation = 1;
  while (offset < buf.length) {
    if (buf[offset] !== 0xff) return null;
    const marker = buf[offset + 1];
    const length = buf.readUInt16BE(offset + 2);

    if (marker === 0xe1 && buf.toString('ascii', offset + 4, offset + 8) === 'Exif') {
      orientation = exifOrientation(buf, offset + 10) || 1;
    }
    const isSof = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
    if (isSof) {
      const height = buf.readUInt16BE(offset + 5);
      const width = buf.readUInt16BE(offset + 7);
      // 5–8: фото «лежить на боці», браузер його поверне — міняємо сторони
      return orientation >= 5 ? { width: height, height: width } : { width, height };
    }
    offset += 2 + length;
  }
  return null;
}

function exifOrientation(buf, tiff) {
  const little = buf.toString('ascii', tiff, tiff + 2) === 'II';
  const u16 = (o) => (little ? buf.readUInt16LE(o) : buf.readUInt16BE(o));
  const u32 = (o) => (little ? buf.readUInt32LE(o) : buf.readUInt32BE(o));
  const ifd = tiff + u32(tiff + 4);
  const count = u16(ifd);
  for (let i = 0; i < count; i++) {
    const entry = ifd + 2 + i * 12;
    if (u16(entry) === 0x0112) return u16(entry + 8);
  }
  return null;
}

function pngSize(buf) {
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function imageSize(file) {
  const buf = fs.readFileSync(file);
  const size = /\.png$/i.test(file) ? pngSize(buf) : jpegSize(buf);
  if (!size) throw new Error(`Не вдалося прочитати розміри фото: ${file}`);
  return size;
}

/**
 * Усі фото майстер-класу в порядку назв (1.jpg, 2.jpg, … 10.jpg).
 * Повертає шляхи відносно кореня сайту та розміри фото й мініатюри.
 */
function findPhotos(siteRoot, slug) {
  const dirRel = `images/masterclasses/${slug}`;
  const dir = path.join(siteRoot, dirRel);
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir)
    .filter((name) => PHOTO_EXT.test(name))
    .sort((a, b) => a.localeCompare(b, 'uk', { numeric: true }))
    .map((name) => {
      const thumbName = name.replace(PHOTO_EXT, '.jpg');
      const thumbRel = `${dirRel}/thumbs/${thumbName}`;
      const full = imageSize(path.join(dir, name));
      const hasThumb = fs.existsSync(path.join(siteRoot, thumbRel));
      const thumb = hasThumb ? imageSize(path.join(siteRoot, thumbRel)) : full;
      return {
        name,
        src: `${dirRel}/${name}`,
        width: full.width,
        height: full.height,
        thumb: hasThumb ? thumbRel : `${dirRel}/${name}`,
        thumbWidth: thumb.width,
        thumbHeight: thumb.height,
      };
    });
}

module.exports = { findPhotos, imageSize };
