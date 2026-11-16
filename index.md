---
layout: default
title: Beranda
---

<section class="intro">
  <h1>Halo, saya Zidan 👋</h1>
  <p>Ini adalah blog pribadi saya — tempat menulis catatan, tulisan, dan eksperimen seputar pengembangan web, keamanan siber, dan teknologi.</p>
</section>

<section class="posts">
  <h2>Tulisan terbaru</h2>
  <ul class="post-list">
    {% for post in site.posts %}
      <li>
        <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
        <span class="post-date">{{ post.date | date: "%d %b %Y" }}</span>
        <p>{{ post.excerpt | strip_html | truncate: 160 }}</p>
      </li>
    {% endfor %}
  </ul>
</section>
