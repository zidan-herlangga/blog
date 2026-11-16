---
layout: default
title: Beranda
description: "Catatan, tulisan, dan eksperimen seputar web development, keamanan siber, dan teknologi."
---

<section class="posts">
  <div class="section-heading">
    <h2>Semua tulisan</h2>
    <span class="post-date">{{ site.posts | size }} artikel</span>
  </div>

  {% if site.posts.size > 0 %}
  <div class="news-list">
    {% for post in site.posts %}
    <article class="news-item">
      <a class="news-item__link" href="{{ post.url | relative_url }}">
        <span class="news-item__media">
          <img
            src="{{ post.image | default: '/assets/images/og-default.png' | relative_url }}"
            alt="{{ post.image_alt | default: post.title }}"
            loading="lazy"
            decoding="async">
        </span>
        <span class="news-item__body">
          <span class="news-item__meta">
            <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%d %b %Y" }}</time>
            {% if post.categories.size > 0 %} · {{ post.categories | join: ", " }}{% endif %}
          </span>
          <h3 class="news-item__title">{{ post.title }}</h3>
          {% if post.description %}
            <p class="news-item__excerpt">{{ post.description }}</p>
          {% else %}
            <p class="news-item__excerpt">{{ post.excerpt | strip_html | truncate: 140 }}</p>
          {% endif %}
        </span>
      </a>
    </article>
    {% endfor %}
  </div>
  {% else %}
  <p class="empty">Belum ada tulisan. Nantikan segera.</p>
  {% endif %}
</section>

<script>
(function () {
  const root = document.querySelector('[data-carousel]');
  if (!root) return;
  const viewport = root.querySelector('.carousel__viewport');
  const slides = [...root.querySelectorAll('.carousel__slide')];
  const prev = root.querySelector('.carousel__btn--prev');
  const next = root.querySelector('.carousel__btn--next');
  const dotsWrap = root.querySelector('.carousel__dots');
  if (!slides.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  slides.forEach((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', 'Ke slide ' + (i + 1));
    b.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(b);
  });
  const dots = [...dotsWrap.querySelectorAll('button')];

  let index = 0;
  const goTo = (i) => {
    index = Math.max(0, Math.min(slides.length - 1, i));
    const left = slides[index].offsetLeft - viewport.offsetLeft;
    viewport.scrollTo({ left, behavior: reduceMotion ? 'auto' : 'smooth' });
    updateDots();
  };
  const updateDots = () => {
    dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
  };

  prev.addEventListener('click', () => goTo(index - 1));
  next.addEventListener('click', () => goTo(index + 1));

  let scrollTimer;
  viewport.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const vLeft = viewport.scrollLeft;
      let best = 0, bestDist = Infinity;
      slides.forEach((s, i) => {
        const d = Math.abs(s.offsetLeft - viewport.offsetLeft - vLeft);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      index = best;
      updateDots();
    }, 120);
  }, { passive: true });

  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1); }
  });

  let timer = null;
  const startAuto = () => {
    if (reduceMotion) return;
    stopAuto();
    timer = setInterval(() => goTo((index + 1) % slides.length), 6000);
  };
  const stopAuto = () => { if (timer) { clearInterval(timer); timer = null; } };

  root.addEventListener('mouseenter', stopAuto);
  root.addEventListener('mouseleave', startAuto);
  root.addEventListener('focusin', stopAuto);
  root.addEventListener('focusout', startAuto);

  updateDots();
  startAuto();
})();
</script>