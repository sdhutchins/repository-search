---
layout: default
title: Repository Search
permalink: /
excluded_in_search: true
---

{% assign repositories = site.github.public_repositories %}
{% assign languages = repositories | map: "language" | join: "," | split: "," | uniq | sort %}
{% assign licenses = repositories | map: "license" | map: "spdx_id" | join: "," | split: "," | uniq | sort %}

<section class="dashboard-heading" aria-labelledby="repositories-heading">
  <h1 id="repositories-heading">Repositories</h1>
  <p>Search and explore public repositories by language, license, and activity.</p>
</section>

<form class="repository-controls" id="repository-controls" role="search">
  <label class="search-field" for="repository-search">
    <span class="visually-hidden">Search repositories</span>
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
      <circle cx="11" cy="11" r="7"></circle>
      <path d="m16 16 4 4"></path>
    </svg>
    <input
      id="repository-search"
      type="search"
      placeholder="Search repositories"
      autocomplete="off"
      autocapitalize="off"
      spellcheck="false"
    >
  </label>

  <label class="select-control">
    <span class="visually-hidden">Filter by language</span>
    <select id="language-filter">
      <option value="">All languages</option>
      {% for language in languages %}
        {% if language != empty %}<option value="{{ language | escape }}">{{ language }}</option>{% endif %}
      {% endfor %}
    </select>
  </label>

  <label class="select-control">
    <span class="visually-hidden">Filter by license</span>
    <select id="license-filter">
      <option value="">All licenses</option>
      {% for license in licenses %}
        {% if license != empty %}<option value="{{ license | escape }}">{{ license }}</option>{% endif %}
      {% endfor %}
    </select>
  </label>

  <label class="select-control">
    <span class="visually-hidden">Sort repositories</span>
    <select id="sort-select">
      <option value="updated-desc">Updated</option>
      <option value="name-asc">Name</option>
      <option value="stars-desc">Most stars</option>
      <option value="forks-desc">Most forks</option>
      <option value="issues-desc">Most issues</option>
    </select>
  </label>

  <div class="view-switcher" role="group" aria-label="Repository view">
    <button type="button" data-view="cards" aria-pressed="true">Cards</button>
    <button type="button" data-view="table" aria-pressed="false">Table</button>
  </div>
</form>

<p class="results-summary" aria-live="polite">
  <span id="result-count">{{ repositories | size }}</span>
  <span id="result-label">repositories</span>
</p>

<section id="card-view" aria-label="Repository cards">
  <div class="repository-grid" id="repository-grid">
    {% for repo in repositories %}
      <article
        class="repository-card"
        data-repository-id="{{ repo.id }}"
        data-search="{{ repo.name | escape }} {{ repo.description | escape }} {{ repo.language | escape }} {{ repo.license.spdx_id | escape }}"
        data-name="{{ repo.name | downcase | escape }}"
        data-language="{{ repo.language | escape }}"
        data-license="{{ repo.license.spdx_id | escape }}"
        data-updated="{{ repo.updated_at }}"
        data-stars="{{ repo.stargazers_count }}"
        data-forks="{{ repo.forks_count }}"
        data-issues="{{ repo.open_issues_count }}"
      >
        <div>
          <div class="repository-card__heading">
            <h2>
              <a href="{{ repo.html_url }}" target="_blank" rel="noopener noreferrer">{{ repo.name }}</a>
            </h2>
          </div>
          <p class="repository-description">
            {% if repo.description %}{{ repo.description }}{% else %}No description provided.{% endif %}
          </p>
        </div>

        <dl class="repository-metadata">
          {% if repo.language %}
            <div class="repository-language">
              <dt>Language</dt>
              <dd>{{ repo.language }}</dd>
            </div>
          {% endif %}
          {% if repo.license %}
            <div><dt>License</dt><dd>{{ repo.license.spdx_id }}</dd></div>
          {% endif %}
          <div>
            <dt>Updated</dt>
            <dd>Updated <time datetime="{{ repo.updated_at }}">{{ repo.updated_at | date: "%b %-d, %Y" }}</time></dd>
          </div>
          <div><dt>Stars</dt><dd>{{ repo.stargazers_count }} stars</dd></div>
          <div><dt>Forks</dt><dd>{{ repo.forks_count }} forks</dd></div>
        </dl>
      </article>
    {% endfor %}
  </div>
</section>

<section id="table-view" aria-label="Repository table" hidden>
  <div class="repository-table-frame">
    <div class="repository-table-scroll" tabindex="0" aria-label="Scrollable repository table">
      <table class="repository-table">
        <caption class="visually-hidden">Repository search results</caption>
        <thead>
          <tr>
            {% assign table_columns = "name:Repository,language:Language,license:License,updated:Updated,stars:Stars,forks:Forks,issues:Issues" | split: "," %}
            {% for column in table_columns %}
              {% assign column_parts = column | split: ":" %}
              {% assign column_key = column_parts[0] %}
              <th scope="col" data-column="{{ column_key }}">
                <button type="button" class="table-sort" data-sort="{{ column_key }}">
                  <span>{{ column_parts[1] }}</span>
                  <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14">
                    <path class="sort-arrow-up" d="m5 6 3-3 3 3"></path>
                    <path class="sort-arrow-down" d="m5 10 3 3 3-3"></path>
                  </svg>
                </button>
              </th>
            {% endfor %}
          </tr>
        </thead>
        <tbody id="repository-table-body">
          {% for repo in repositories %}
            <tr
              class="repository-row"
              data-repository-id="{{ repo.id }}"
              data-search="{{ repo.name | escape }} {{ repo.description | escape }} {{ repo.language | escape }} {{ repo.license.spdx_id | escape }}"
              data-name="{{ repo.name | downcase | escape }}"
              data-language="{{ repo.language | escape }}"
              data-license="{{ repo.license.spdx_id | escape }}"
              data-updated="{{ repo.updated_at }}"
              data-stars="{{ repo.stargazers_count }}"
              data-forks="{{ repo.forks_count }}"
              data-issues="{{ repo.open_issues_count }}"
            >
              <th scope="row">
                <a href="{{ repo.html_url }}" target="_blank" rel="noopener noreferrer">{{ repo.name }}</a>
                <span class="repository-table-description">{% if repo.description %}{{ repo.description }}{% else %}No description provided.{% endif %}</span>
              </th>
              <td>{{ repo.language | default: "—" }}</td>
              <td><code>{{ repo.license.spdx_id | default: "—" }}</code></td>
              <td><time datetime="{{ repo.updated_at }}">{{ repo.updated_at | date: "%b %-d, %Y" }}</time></td>
              <td class="numeric">{{ repo.stargazers_count }}</td>
              <td class="numeric">{{ repo.forks_count }}</td>
              <td class="numeric">{{ repo.open_issues_count }}</td>
            </tr>
          {% endfor %}
        </tbody>
      </table>
    </div>
  </div>
</section>

<p class="empty-state" id="empty-state" hidden>No repositories match these filters.</p>
