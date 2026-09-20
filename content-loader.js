(() => {
  'use strict';

  const text = (selector, value, root = document) => {
    const node = root.querySelector(selector);
    if (node && typeof value === 'string') node.textContent = value;
  };

  const multiline = (node, value) => {
    if (!node || typeof value !== 'string') return;
    node.replaceChildren();
    value.split(/\n+/).forEach((line, index) => {
      if (index) node.append(document.createElement('br'));
      node.append(document.createTextNode(line));
    });
  };

  const safeAsset = (value) => typeof value === 'string' && /^assets\/[a-z0-9._/?=-]+$/i.test(value);
  const safeExternal = (value) => {
    try {
      const url = new URL(value, location.href);
      return ['https:', 'tel:'].includes(url.protocol);
    } catch {
      return false;
    }
  };

  const setImage = (image, path, alt) => {
    if (!image || !safeAsset(path)) return;
    image.src = path;
    image.removeAttribute('srcset');
    if (typeof alt === 'string') image.alt = alt;
  };

  const setLinks = (selector, value) => {
    if (!safeExternal(value)) return;
    document.querySelectorAll(selector).forEach((link) => { link.href = value; });
  };

  const applyContent = (content) => {
    if (!content || typeof content !== 'object') return;

    if (content.seo) {
      if (typeof content.seo.title === 'string') document.title = content.seo.title;
      const description = document.querySelector('meta[name="description"]');
      if (description && typeof content.seo.description === 'string') description.content = content.seo.description;
    }

    if (content.hero) {
      const hero = document.querySelector('.hero');
      text('.eyebrow', content.hero.eyebrow, hero);
      const heading = hero?.querySelector('h1');
      if (heading) {
        heading.replaceChildren(document.createTextNode(content.hero.title || ''));
        heading.append(document.createElement('br'));
        const accent = document.createElement('span');
        multiline(accent, content.hero.titleAccent || '');
        heading.append(accent);
      }
      multiline(hero?.querySelector('.hero-copy > p'), content.hero.description);
      const note = hero?.querySelector('.hero-note');
      if (note) {
        note.replaceChildren(document.createTextNode(content.hero.address || ''));
        const detail = document.createElement('span');
        detail.textContent = content.hero.note || '';
        note.append(detail);
      }
      setImage(hero?.querySelector('.hero-img'), content.hero.image, content.hero.imageAlt);
    }

    if (Array.isArray(content.services)) {
      content.services.forEach((service) => {
        if (!service || !/^[a-z-]+$/.test(service.id || '')) return;
        const card = document.querySelector(`[aria-labelledby="service-${service.id}-title"]`);
        if (!card) return;
        text('.card-top > *', service.category, card);
        multiline(card.querySelector('h3'), service.title);
        text('.service-bottom div > span', service.duration, card);
        text('.service-bottom strong', service.price, card);
        const paragraphs = card.querySelectorAll('.service-detail p');
        if (paragraphs[0]) paragraphs[0].textContent = service.description1 || '';
        if (paragraphs[1]) paragraphs[1].textContent = service.description2 || '';
        setImage(card.querySelector('.service-media img'), service.image, service.imageAlt);
      });
    }

    if (content.about) {
      const about = document.querySelector('#master');
      text('.master-copy .lead', content.about.lead, about);
      const paragraphs = about?.querySelectorAll('.master-copy > p:not(.lead):not(.master-proof)');
      if (paragraphs?.[0]) paragraphs[0].textContent = content.about.paragraph1 || '';
      if (paragraphs?.[1]) paragraphs[1].textContent = content.about.paragraph2 || '';
      text('.master-proof strong', content.about.practice, about);
      text('.master-proof span', content.about.practiceLabel, about);
      text('.intro-film-copy > p', content.about.videoText, about);
      setImage(about?.querySelector('.master-photo img'), content.about.image, content.about.imageAlt);
    }

    if (content.studio) {
      const studio = document.querySelector('#studio');
      const heading = studio?.querySelector('h2');
      if (heading) {
        heading.replaceChildren(document.createTextNode(content.studio.title || ''));
        heading.append(document.createElement('br'));
        const accent = document.createElement('span');
        accent.textContent = content.studio.titleAccent || '';
        heading.append(accent);
      }
      multiline(studio?.querySelector('.section-top > p'), content.studio.description);
      if (Array.isArray(content.studio.images)) {
        content.studio.images.forEach((item) => {
          if (!item || !/^[a-z-]+$/.test(item.slot || '') || !safeAsset(item.path)) return;
          const link = studio?.querySelector(`.studio-shot-${item.slot}`);
          const image = link?.querySelector('img');
          setImage(image, item.path, item.alt);
          if (link) {
            link.href = item.path;
            link.dataset.lightbox = item.alt || '';
            link.setAttribute('aria-label', `Увеличить фотографию: ${item.alt || 'студия'}`);
          }
        });
      }
    }

    if (content.contacts) {
      const contact = content.contacts;
      text('.address-card h3', contact.city);
      const address = document.querySelector('.address-card > div > p');
      if (address) multiline(address, `${contact.address || ''}\n${contact.addressDetails || ''}`);
      const addressNote = document.querySelector('.address-note');
      if (addressNote) multiline(addressNote, `Часы работы: ${contact.hours || ''}.\nПавел Агеев · самозанятый.`);
      if (typeof contact.phoneDisplay === 'string') {
        document.querySelectorAll('.phone').forEach((link) => {
          const icon = link.querySelector('svg');
          link.replaceChildren();
          if (icon) link.append(icon);
          link.append(document.createTextNode(contact.phoneDisplay));
        });
      }
      if (typeof contact.phoneHref === 'string' && /^\+?[0-9]{10,15}$/.test(contact.phoneHref)) {
        setLinks('a[href^="tel:"]', `tel:${contact.phoneHref}`);
      }
      setLinks('a[href*="dikidi.net"]', contact.bookingUrl);
      setLinks('a[href*="t.me/"]', contact.telegramUrl);
      setLinks('#directions a[href*="yandex.ru/maps"], #contacts a[href*="yandex.ru/maps"]', contact.mapsUrl);
    }

    document.documentElement.dataset.contentReady = 'true';
  };

  fetch('content/content.json', { cache: 'no-store', credentials: 'same-origin' })
    .then((response) => {
      if (!response.ok) throw new Error(`Content request failed: ${response.status}`);
      return response.json();
    })
    .then(applyContent)
    .catch(() => { document.documentElement.dataset.contentReady = 'fallback'; });
})();
