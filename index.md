---
layout: default
title: Beranda
description: "Catatan, tulisan, dan eksperimen seputar web development, keamanan siber, dan teknologi."
---

{% assign per_page = 6 %}
{% assign total_posts = site.posts.size %}
{% assign total_pages = total_posts | divided_by: 6.0 | ceil %}
{% if total_pages < 1 %}{% assign total_pages = 1 %}{% endif %}

<h1 class="sr-only">Blog Zidan Herlangga – catatan keamanan siber, Linux, dan web</h1>

<section class="posts">
  <div class="section-heading">
    <h2>Semua tulisan</h2>
    <span class="post-date">{{ total_posts }} artikel</span>
  </div>

  {% if site.posts.size > 0 %}
  <div class="news-list" id="newsList">
    {% for post in site.posts %}
      {% assign page_num = forloop.index0 | divided_by: per_page | plus: 1 %}
      <article class="news-item" data-page="{{ page_num }}">
        <a class="news-item__link" href="{{ post.url | relative_url }}">
          <span class="news-item__media">
            <img
              src="{{ post.thumb | default: post.image | default: '/assets/images/og-default.png' | relative_url }}"
              alt="{{ post.image_alt | default: post.title }}"
              width="360"
              height="270"
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

  {% if total_pages > 1 %}
  <nav class="pagination" id="pagination" aria-label="Navigasi halaman" data-total="{{ total_pages }}" hidden>
    <button class="pagination__btn" type="button" data-prev>← Sebelumnya</button>
    <span class="pagination__pages">
      {% for p in (1..total_pages) %}
      <button class="pagination__num{% if p == 1 %} is-active{% endif %}" type="button" data-page="{{ p }}" aria-label="Halaman {{ p }}"{% if p == 1 %} aria-current="page"{% endif %}>{{ p }}</button>
      {% endfor %}
    </span>
    <button class="pagination__btn" type="button" data-next>Berikutnya →</button>
  </nav>
  {% endif %}
  {% else %}
  <p class="empty">Belum ada tulisan. Nantikan segera.</p>
  {% endif %}
</section>

<script>
(function () {
  const list = document.getElementById('newsList');
  const nav = document.getElementById('pagination');
  if (!list || !nav) return;
  const items = [...list.querySelectorAll('.news-item')];
  const total = Number(nav.dataset.total || 1);
  const nums = [...nav.querySelectorAll('[data-page]')];
  const prev = nav.querySelector('[data-prev]');
  const next = nav.querySelector('[data-next]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 1;

  const requested = Number(new URLSearchParams(location.search).get('halaman'));
  const initial = Number.isFinite(requested) && requested > 0 ? Math.min(total, requested) : 1;

  function show(page, scroll) {
    current = Math.max(1, Math.min(total, page));

    items.forEach((it) => {
      it.hidden = Number(it.dataset.page) !== current;
    });

    nums.forEach((n) => {
      const active = Number(n.dataset.page) === current;
      n.classList.toggle('is-active', active);
      if (active) n.setAttribute('aria-current', 'page');
      else n.removeAttribute('aria-current');
    });

    if (prev) prev.disabled = current === 1;
    if (next) next.disabled = current === total;

    if (scroll) {
      const top = list.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
    }

    try {
      const url = new URL(location.href);
      if (current === 1) url.searchParams.delete('halaman');
      else url.searchParams.set('halaman', String(current));
      history.replaceState(null, '', url);
    } catch (e) { /* abaikan */ }
  }

  nav.hidden = false;
  nums.forEach((n) => n.addEventListener('click', () => show(Number(n.dataset.page), true)));
  prev.addEventListener('click', () => show(current - 1, true));
  next.addEventListener('click', () => show(current + 1, true));

  show(initial, false);
})();
</script>
