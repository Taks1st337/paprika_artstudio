/**
 * Paprika Artstudio — скрипти сторінки
 *
 * 1. Мобільне меню
 * 2. Тінь шапки під час прокручування
 * 3. Підсвічування активного пункту меню
 * 4. Плавна поява блоків
 * 5. Лайтбокс для галереї
 * 6. Історії майстрів
 * 7. Форма запису
 * 8. Поточний рік у підвалі
 * 9. Фільтри каталогу майстер-класів
 * 10. Кнопка «Поділитися»
 * 11. Відео з YouTube — лише після натискання
 * 12. Крапки під фото на телефоні
 * 13. Нижня панель запису на телефоні
 */

document.documentElement.classList.add('js');

/* 1. Мобільне меню
   ========================================================================== */

function initMobileMenu() {
  const burger = document.querySelector('.burger');
  const nav = document.getElementById('site-nav');
  if (!burger || !nav) return;

  const setOpen = (isOpen) => {
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', isOpen ? 'Закрити меню' : 'Відкрити меню');
    nav.classList.toggle('is-open', isOpen);
    document.body.classList.toggle('is-locked', isOpen);
  };

  burger.addEventListener('click', () => {
    setOpen(burger.getAttribute('aria-expanded') !== 'true');
  });

  // Закриваємо меню після переходу за посиланням
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });

  // Якщо вікно розширили до десктопа — скидаємо стан меню
  window.matchMedia('(min-width: 761px)').addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });
}

/* 2. Тінь шапки під час прокручування
   ========================================================================== */

function initHeaderShadow() {
  const header = document.querySelector('.header');
  if (!header) return;

  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

/* 3. Підсвічування активного пункту меню
   ========================================================================== */

function initActiveNav() {
  // Лише посилання на розділи цієї ж сторінки (#about тощо), без інших сторінок
  const links = document.querySelectorAll('.nav__link[href^="#"]');
  if (!links.length || !('IntersectionObserver' in window)) return;

  const linkById = new Map(
    [...links].map((link) => [link.getAttribute('href').slice(1), link])
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => link.classList.remove('is-active'));
        linkById.get(entry.target.id)?.classList.add('is-active');
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );

  linkById.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });
}

/* 4. Плавна поява блоків
   ========================================================================== */

function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  items.forEach((item) => observer.observe(item));
}

/* 5. Лайтбокс для галереї
   ========================================================================== */

function initLightbox() {
  const dialog = document.getElementById('lightbox');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  const image = dialog.querySelector('img');
  const caption = dialog.querySelector('.lightbox__caption');
  const prev = dialog.querySelector('.lightbox__nav--prev');
  const next = dialog.querySelector('.lightbox__nav--next');
  let items = [];
  let current = 0;

  // Фото однієї галереї гортаються стрілками; у групу входять і приховані
  // фото (вони відкриваються кнопкою «+ ще N фото»)
  const groupOf = (element) =>
    [...(element.closest('[data-lightbox-group]') || document).querySelectorAll('[data-lightbox]')];

  const show = (index) => {
    current = (index + items.length) % items.length;
    const button = items[current];
    const preview = button.querySelector('img');
    image.src = button.dataset.full || preview.src;
    image.alt = preview.alt;
    caption.textContent = items.length > 1
      ? `${preview.alt} (${current + 1} з ${items.length})`
      : preview.alt;
  };

  const open = (element, index) => {
    items = groupOf(element);
    if (!items.length) return;
    [prev, next].forEach((button) => { if (button) button.hidden = items.length < 2; });
    show(index);
    dialog.showModal();
  };

  document.querySelectorAll('[data-lightbox]').forEach((button) => {
    button.addEventListener('click', () => open(button, groupOf(button).indexOf(button)));
  });

  // Кнопки «+ ще N фото» і «Відкрити всі фото» відкривають галерею з потрібного фото
  document.querySelectorAll('[data-lightbox-open]').forEach((button) => {
    const group = document.querySelector('[data-lightbox-group]');
    if (!group) return;
    button.addEventListener('click', () => open(group, Number(button.dataset.lightboxOpen)));
  });

  prev?.addEventListener('click', () => show(current - 1));
  next?.addEventListener('click', () => show(current + 1));

  dialog.addEventListener('keydown', (event) => {
    if (items.length < 2) return;
    if (event.key === 'ArrowLeft') show(current - 1);
    if (event.key === 'ArrowRight') show(current + 1);
  });

  // Закриття кліком по затемненому фону
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
}

/* 6. Історії майстрів
   ========================================================================== */

function initBios() {
  document.querySelectorAll('[data-bio]').forEach((button) => {
    const dialog = document.getElementById(button.dataset.bio);
    if (!dialog || typeof dialog.showModal !== 'function') return;

    button.addEventListener('click', () => {
      dialog.showModal();
      dialog.scrollTop = 0;
      document.body.classList.add('is-locked');
    });

    dialog.addEventListener('close', () => {
      document.body.classList.remove('is-locked');
    });

    // Закриття кліком по затемненому фону
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });

    // «Читати історію» зі сторінки майстер-класу веде на index.html#bio-… —
    // одразу відкриваємо потрібну історію
    if (window.location.hash === `#${dialog.id}`) {
      document.getElementById('team')?.scrollIntoView();
      button.click();
    }
  });
}

/* 7. Форма запису
   ========================================================================== */

const VALIDATORS = {
  name: (value) => (value.length >= 2 ? '' : "Введіть ім'я"),
  phone: (value) =>
    value.replace(/\D/g, '').length >= 10 ? '' : 'Введіть номер телефону повністю',
  email: (value) =>
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)
      ? ''
      : 'Введіть пошту у форматі name@example.com',
};

function initBookingForm() {
  const form = document.getElementById('booking-form');
  if (!form) return;

  const success = document.getElementById('booking-success');
  const submitButton = form.querySelector('[type="submit"]');

  // На сторінках майстер-класів у формі немає пошти — перевіряємо лише наявні поля
  const fields = Object.keys(VALIDATORS).filter((field) => form.elements[field]);

  const showError = (field, message) => {
    const input = form.elements[field];
    const error = form.querySelector(`[data-error-for="${field}"]`);
    error.textContent = message;
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
  };

  const validateField = (field) => {
    const message = VALIDATORS[field](form.elements[field].value.trim());
    showError(field, message);
    return !message;
  };

  // Повторна перевірка поля, щойно користувач виправляє помилку
  fields.forEach((field) => {
    form.elements[field].addEventListener('input', () => {
      if (form.elements[field].getAttribute('aria-invalid') === 'true') {
        validateField(field);
      }
    });
  });

  // Дозволяємо вводити в поле телефону лише цифри, пробіли, дужки, дефіс і «+»
  form.elements.phone.addEventListener('input', (event) => {
    event.target.value = event.target.value.replace(/[^\d\s()+-]/g, '');
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    success.hidden = true;

    const results = fields.map(validateField);
    if (results.includes(false)) {
      form.querySelector('[aria-invalid="true"]').focus();
      return;
    }

    // TODO: ТУТ ПІДКЛЮЧИТИ РЕАЛЬНУ ВІДПРАВКУ ЗАЯВКИ.
    // Ця форма працює на головній і на всіх сторінках майстер-класів.
    // Дані форми: new FormData(form) — name, phone, kind (майстер-клас),
    // а також email (головна) або comment (сторінка майстер-класу).
    // Замініть setTimeout нижче на fetch(...) до обраного сервісу
    // (наприклад Formspree, Google Forms або Telegram-бот через свій сервер)
    // і показуйте success лише після успішної відповіді.
    // Поки що імітуємо коротку затримку відправлення — заявка нікуди не надходить.
    submitButton.disabled = true;
    submitButton.textContent = 'Надсилаємо…';

    setTimeout(() => {
      form.reset();
      fields.forEach((field) => showError(field, ''));
      submitButton.disabled = false;
      submitButton.textContent = 'Надіслати заявку';
      success.hidden = false;
    }, 600);
  });
}

/* 8. Поточний рік у підвалі
   ========================================================================== */

function initYear() {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
}

/* 9. Фільтри каталогу майстер-класів
   ========================================================================== */

function initCatalogFilters() {
  const group = document.querySelector('.filters');
  if (!group) return;

  const buttons = group.querySelectorAll('[data-filter]');
  const items = document.querySelectorAll('.mc-grid--catalog > li');
  const shownCount = document.querySelector('[data-shown-count]');
  const ids = [...buttons].map((button) => button.dataset.filter);

  const apply = (id) => {
    buttons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.filter === id));
    });

    let shown = 0;
    items.forEach((item) => {
      const visible = id === 'all' || item.dataset.category === id;
      item.hidden = !visible;
      if (visible) shown += 1;
    });
    shownCount.textContent = shown;

    // Напрям зберігається в адресі: таким посиланням можна поділитися,
    // а плитки на головній відкривають каталог одразу з фільтром
    const url = new URL(window.location.href);
    if (id === 'all') url.searchParams.delete('napriam');
    else url.searchParams.set('napriam', id);
    window.history.replaceState(null, '', url);
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => apply(button.dataset.filter));
  });

  const fromUrl = new URLSearchParams(window.location.search).get('napriam');
  if (ids.includes(fromUrl)) {
    apply(fromUrl);
    // На телефоні прокручуємо рядок фільтрів так, щоб вибрана кнопка була видна
    const button = group.querySelector(`[data-filter="${fromUrl}"]`).getBoundingClientRect();
    const box = group.getBoundingClientRect();
    group.scrollLeft += button.left - box.left - (box.width - button.width) / 2;
  }
}

/* 10. Кнопка «Поділитися»
   ========================================================================== */

function showToast(message) {
  const toast = document.querySelector('.toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('is-visible'), 2500);
}

// Запасний спосіб скопіювати текст, коли navigator.clipboard недоступний
// (наприклад, сторінку відкрито просто як файл з комп'ютера)
function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.append(field);
  field.select();
  const ok = document.execCommand('copy');
  field.remove();
  return ok ? Promise.resolve() : Promise.reject(new Error('copy failed'));
}

function initShare() {
  document.querySelectorAll('[data-share]').forEach((button) => {
    button.addEventListener('click', async () => {
      const data = {
        title: document.title,
        text: document.querySelector('meta[name="description"]')?.content || '',
        url: window.location.href.split('#')[0],
      };

      // Системне меню «Поділитися» (телефони, частина браузерів)
      if (navigator.share) {
        try {
          await navigator.share(data);
          return;
        } catch (error) {
          if (error.name === 'AbortError') return; // людина просто закрила меню
        }
      }

      try {
        await copyText(data.url);
        showToast('Посилання скопійовано');
      } catch {
        showToast('Не вдалося скопіювати — скопіюйте адресу з рядка браузера');
      }
    });
  });
}

/* 11. Відео з YouTube — лише після натискання
   ========================================================================== */

// До натискання показуємо лише обкладинку: сторінка вантажиться швидше,
// а YouTube нічого не знає про відвідувача, поки той не захоче дивитися
function initVideos() {
  document.querySelectorAll('[data-youtube]').forEach((button) => {
    button.addEventListener('click', () => {
      const frame = document.createElement('iframe');
      frame.src = `https://www.youtube-nocookie.com/embed/${button.dataset.youtube}?autoplay=1&rel=0`;
      frame.title = button.dataset.title;
      frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';

      const wrapper = document.createElement('div');
      wrapper.className = button.className;
      wrapper.append(frame);
      button.replaceWith(wrapper);
      frame.focus();
    });
  });
}

/* 12. Крапки під фото на телефоні
   ========================================================================== */

function initSliderDots() {
  document.querySelectorAll('.mc-slider').forEach((slider) => {
    const track = slider.querySelector('.mc-slider__track');
    const dots = slider.querySelectorAll('.mc-slider__dots span');
    if (!track || dots.length < 2) return;

    const update = () => {
      const slide = track.firstElementChild;
      const step = slide.offsetWidth + parseFloat(getComputedStyle(track).columnGap || 0);
      const index = Math.min(dots.length - 1, Math.round(track.scrollLeft / step));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    };

    track.addEventListener('scroll', update, { passive: true });
  });
}

/* 13. Нижня панель запису на телефоні
   ========================================================================== */

// Коли форма запису вже на екрані, панель ховається, щоб не закривати поля
function initMobileBar() {
  const bar = document.querySelector('.mobile-bar');
  const booking = document.getElementById('book');
  if (!bar || !booking || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(([entry]) => {
    bar.classList.toggle('is-hidden', entry.isIntersecting);
  });
  observer.observe(booking);
}

/* Запуск
   ========================================================================== */

initMobileMenu();
initHeaderShadow();
initActiveNav();
initReveal();
initLightbox();
initBios();
initBookingForm();
initYear();
initCatalogFilters();
initShare();
initVideos();
initSliderDots();
initMobileBar();
