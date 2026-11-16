---
layout: default
title: Beranda
description: "Catatan, tulisan, dan eksperimen seputar web development, keamanan siber, dan teknologi."
---

<section class="intro">
  <h1>Halo, saya Zidan 👋</h1>
  <p>Catatan, tulisan, dan eksperimen seputar pengembangan web, keamanan siber, serta arsitektur sistem. Ditulis santai, sesekali teknis.</p>
</section>

<section class="posts">
  <div class="section-heading">
    <h2>Tulisan terbaru</h2>
    <span class="post-date">{{ site.posts | size }} artikel</span>
  </div>

  {% if site.posts.size > 0 %}
  <ul class="post-list">
    {% for post in site.posts %}
      <li>
        <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
        <span class="post-date">
          <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%d %b %Y" }}</time>
          {% if post.categories.size > 0 %} · {{ post.categories | join: ", " }}{% endif %}
        </span>
        {% if post.description %}
          <p>{{ post.description }}</p>
        {% else %}
          <p>{{ post.excerpt | strip_html | truncate: 160 }}</p>
        {% endif %}
      </li>
    {% endfor %}
  </ul>
  {% else %}
  <p class="empty">Belum ada tulisan. Nantikan segera.</p>
  {% endif %}
</section>
