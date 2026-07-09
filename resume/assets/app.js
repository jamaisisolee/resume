// ---------------------------------------------------------------------------
// To add a new language:
//   1. Copy data/en.json to data/<code>.json and translate it.
//   2. Add the code to AVAILABLE_LANGS below (order = order in the dropdown).
// Everything else is automatic.
// ---------------------------------------------------------------------------
const AVAILABLE_LANGS = ["en", "ru", "it", "fr"];
const DEFAULT_LANG = "en";
const STORAGE_KEY = "resume-lang";

function pickInitialLang() {
  const fromUrl = new URLSearchParams(location.search).get("lang");
  if (fromUrl && AVAILABLE_LANGS.includes(fromUrl)) return fromUrl;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && AVAILABLE_LANGS.includes(stored)) return stored;

  const browser = (navigator.language || "").slice(0, 2).toLowerCase();
  if (AVAILABLE_LANGS.includes(browser)) return browser;

  return DEFAULT_LANG;
}

function el(tag, opts = {}) {
  const node = document.createElement(tag);
  if (opts.text != null) node.textContent = opts.text;
  if (opts.className) node.className = opts.className;
  if (opts.href) node.href = opts.href;
  if (opts.attrs) {
    for (const [k, v] of Object.entries(opts.attrs)) node.setAttribute(k, v);
  }
  return node;
}

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = value || "";
}

function toggleSection(sectionId, hasContent) {
  const node = document.getElementById(sectionId);
  if (node) node.hidden = !hasContent;
}

function isExternal(url) {
  return /^https?:\/\//i.test(url);
}

function renderLinks(links) {
  const list = document.getElementById("links");
  list.innerHTML = "";
  (links || []).forEach((link) => {
    if (!link.url) return;
    const li = el("li");
    const a = el("a", {
      text: link.label,
      href: link.url,
    });
    if (isExternal(link.url)) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    li.appendChild(a);
    list.appendChild(li);
  });
}

function renderList(containerId, items) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  (items || []).forEach((item) => {
    container.appendChild(el("li", { text: item }));
  });
}

function formatRange(entry, presentLabel) {
  const end = entry.current || !entry.end ? presentLabel : entry.end;
  return [entry.start, end].filter(Boolean).join(" — ");
}

function renderExperience(items, ui) {
  const container = document.getElementById("experience");
  container.innerHTML = "";
  (items || []).forEach((job) => {
    const entry = el("div", { className: "entry" });

    const head = el("div", { className: "entry-head" });
    const left = el("div");
    left.appendChild(el("p", { className: "entry-role", text: job.role }));

    const company = el("span", { className: "entry-company" });
    if (job.url) {
      const a = el("a", { text: job.company, href: job.url });
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      company.appendChild(a);
    } else {
      company.textContent = job.company;
    }
    if (job.location) {
      company.appendChild(document.createTextNode(" · " + job.location));
    }
    left.appendChild(company);

    head.appendChild(left);
    head.appendChild(
      el("span", { className: "entry-meta", text: formatRange(job, ui.present) })
    );
    entry.appendChild(head);

    if (job.highlights && job.highlights.length) {
      const ul = el("ul", { className: "entry-highlights" });
      job.highlights.forEach((h) => ul.appendChild(el("li", { text: h })));
      entry.appendChild(ul);
    }

    container.appendChild(entry);
  });
}

function renderProjects(items, ui) {
  const container = document.getElementById("projects");
  container.innerHTML = "";
  (items || []).forEach((project) => {
    const card = el("div", { className: "card" });

    const title = el("div", { className: "card-title" });
    title.appendChild(el("span", { text: project.name }));
    if (project.url) {
      const a = el("a", { text: ui.viewProject, href: project.url });
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      title.appendChild(a);
    }
    card.appendChild(title);

    if (project.description) {
      card.appendChild(el("p", { className: "card-desc", text: project.description }));
    }

    if (project.tech && project.tech.length) {
      const tags = el("div", { className: "tags" });
      project.tech.forEach((t) => tags.appendChild(el("span", { className: "tag", text: t })));
      card.appendChild(tags);
    }

    container.appendChild(card);
  });
}

function renderSkills(groups) {
  const container = document.getElementById("skills");
  container.innerHTML = "";
  (groups || []).forEach((group) => {
    const row = el("div", { className: "skill-row" });
    row.appendChild(el("div", { className: "skill-cat", text: group.category }));
    const tags = el("div", { className: "tags" });
    (group.items || []).forEach((item) =>
      tags.appendChild(el("span", { className: "tag", text: item }))
    );
    row.appendChild(tags);
    container.appendChild(row);
  });
}

function renderEducation(items) {
  const container = document.getElementById("education");
  container.innerHTML = "";
  (items || []).forEach((edu) => {
    const entry = el("div", { className: "entry" });
    const head = el("div", { className: "entry-head" });
    const left = el("div");
    left.appendChild(el("p", { className: "entry-role", text: edu.degree }));
    const school = el("span", { className: "entry-company" });
    school.textContent = [edu.school, edu.location].filter(Boolean).join(" · ");
    left.appendChild(school);
    head.appendChild(left);
    head.appendChild(
      el("span", {
        className: "entry-meta",
        text: [edu.start, edu.end].filter(Boolean).join(" — "),
      })
    );
    entry.appendChild(head);
    container.appendChild(entry);
  });
}

function applyUiLabels(ui) {
  document.querySelectorAll("[data-ui]").forEach((node) => {
    const key = node.getAttribute("data-ui");
    if (ui[key]) node.textContent = ui[key];
  });
  document.getElementById("lang-label").textContent = ui.language;
  document.getElementById("print-btn").textContent = ui.print;
}

function render(data) {
  const { profile, ui, meta } = data;

  document.documentElement.lang = meta.lang;
  document.documentElement.dir = meta.dir || "ltr";
  document.title = [profile.name, profile.title].filter(Boolean).join(" — ") || "Resume";

  applyUiLabels(ui);

  setText("name", profile.name);
  setText("title", profile.title);
  setText("tagline", profile.tagline);
  setText("location", profile.location);
  setText("summary", profile.summary);

  const avatar = document.getElementById("avatar");
  if (profile.avatar) {
    avatar.src = profile.avatar;
    avatar.alt = profile.name || "";
    avatar.hidden = false;
  } else {
    avatar.hidden = true;
  }

  renderLinks(profile.links);

  renderList("achievements", data.achievements);
  toggleSection("achievements-section", (data.achievements || []).length);

  renderExperience(data.experience, ui);
  toggleSection("experience-section", (data.experience || []).length);

  renderProjects(data.projects, ui);
  toggleSection("projects-section", (data.projects || []).length);

  renderSkills(data.skills);
  toggleSection("skills-section", (data.skills || []).length);

  renderEducation(data.education);
  toggleSection("education-section", (data.education || []).length);

  toggleSection("summary-section", !!profile.summary);

  const year = new Date().getFullYear();
  setText("footer-text", `${profile.name} · ${year}`);
}

async function loadLang(lang) {
  const res = await fetch(`data/${lang}.json`, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Could not load data/${lang}.json (${res.status})`);
  return res.json();
}

function buildLangSelect(current) {
  const select = document.getElementById("lang-select");
  select.innerHTML = "";
  AVAILABLE_LANGS.forEach((code) => {
    const option = el("option", { attrs: { value: code } });
    // Label is filled after each file loads; fall back to the code meanwhile.
    option.textContent = code.toUpperCase();
    if (code === current) option.selected = true;
    select.appendChild(option);
  });
}

async function setLang(lang, { updateHistory = true } = {}) {
  let data;
  try {
    data = await loadLang(lang);
  } catch (err) {
    console.error(err);
    if (lang !== DEFAULT_LANG) return setLang(DEFAULT_LANG, { updateHistory });
    document.getElementById("name").textContent = "Failed to load resume data.";
    return;
  }

  render(data);
  localStorage.setItem(STORAGE_KEY, lang);

  // Update the dropdown option label with the language's native name.
  const option = document.querySelector(`#lang-select option[value="${lang}"]`);
  if (option && data.meta && data.meta.langName) option.textContent = data.meta.langName;
  document.getElementById("lang-select").value = lang;

  if (updateHistory) {
    const url = new URL(location.href);
    url.searchParams.set("lang", lang);
    history.replaceState({}, "", url);
  }
}

// Preload native language names for the dropdown labels.
async function labelLangSelect() {
  await Promise.all(
    AVAILABLE_LANGS.map(async (code) => {
      try {
        const data = await loadLang(code);
        const option = document.querySelector(`#lang-select option[value="${code}"]`);
        if (option && data.meta && data.meta.langName) option.textContent = data.meta.langName;
      } catch (_) {
        /* leave the fallback label */
      }
    })
  );
}

function init() {
  const initial = pickInitialLang();
  buildLangSelect(initial);

  document.getElementById("lang-select").addEventListener("change", (e) => {
    setLang(e.target.value);
  });
  document.getElementById("print-btn").addEventListener("click", () => window.print());

  setLang(initial, { updateHistory: false });
  labelLangSelect();
}

document.addEventListener("DOMContentLoaded", init);
