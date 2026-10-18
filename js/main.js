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
  const links = document.querySelectorAll('.nav__link');
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

  document.querySelectorAll('[data-lightbox]').forEach((button) => {
    button.addEventListener('click', () => {
      const preview = button.querySelector('img');
      image.src = preview.src;
      image.alt = preview.alt;
      caption.textContent = preview.alt;
      dialog.showModal();
    });
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
  Object.keys(VALIDATORS).forEach((field) => {
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

  // Майстер-клас із картки одразу підставляється у форму
  document.querySelectorAll('[data-class]').forEach((link) => {
    link.addEventListener('click', () => {
      form.elements.kind.value = link.dataset.class;
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    success.hidden = true;

    const results = Object.keys(VALIDATORS).map(validateField);
    if (results.includes(false)) {
      form.querySelector('[aria-invalid="true"]').focus();
      return;
    }

    // TODO: підключити реальну відправку заявки (email-сервіс, Telegram-бот тощо).
    // Поки що імітуємо коротку затримку відправлення.
    submitButton.disabled = true;
    submitButton.textContent = 'Надсилаємо…';

    setTimeout(() => {
      form.reset();
      Object.keys(VALIDATORS).forEach((field) => showError(field, ''));
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
