// ---------------------------------------------------------------------------
// Resume renderer
// Add a new language by adding its data/<code>.json file and adding the code
// to AVAILABLE_LANGS below.
// ---------------------------------------------------------------------------
const AVAILABLE_LANGS = ["en"];
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

function getNode(id) {
  return document.getElementById(id);
}

function setText(id, value) {
  const node = getNode(id);
  if (node) node.textContent = value || "";
}

function clearNode(id) {
  const node = getNode(id);
  if (node) node.innerHTML = "";
  return node;
}

function toggleSection(sectionId, hasContent) {
  const node = getNode(sectionId);
  if (node) node.hidden = !Boolean(hasContent);
}

function isExternal(url) {
  return /^https?:\/\//i.test(url);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function toTitleCaseFromKey(key) {
  const labels = {
    programmingData: "Programming & Data",
    machineLearningStatistics: "Machine Learning & Statistics",
    analyticsBI: "Analytics & BI",
    workflow: "Workflow",
    modellingSimulation: "Modelling & Simulation",
  };
  if (labels[key]) return labels[key];
  return String(key)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function normalizeSkills(skills) {
  if (Array.isArray(skills)) {
    return skills
      .map((group) => ({
        category: group.category || group.name || "Skills",
        items: asArray(group.items),
      }))
      .filter((group) => group.items.length);
  }

  if (skills && typeof skills === "object") {
    return Object.entries(skills)
      .map(([key, items]) => ({
        category: toTitleCaseFromKey(key),
        items: asArray(items),
      }))
      .filter((group) => group.items.length);
  }

  return [];
}

function normalizeTechList(tech) {
  if (!Array.isArray(tech)) return [];
  return tech.flatMap((item) =>
    String(item)
      .replace(/\.$/, "")
      .split(" · ")
      .map((part) => part.trim())
      .filter(Boolean)
  );
}

function formatRange(entry, presentLabel) {
  const end = entry.current || !entry.end ? presentLabel : entry.end;
  return [entry.start, end].filter(Boolean).join(" - ");
}

function renderLinks(links) {
  const list = clearNode("links");
  if (!list) return;

  asArray(links).forEach((link) => {
    if (!link.url) return;
    const li = el("li");
    const a = el("a", { text: link.label || link.url, href: link.url });
    if (isExternal(link.url)) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    li.appendChild(a);
    list.appendChild(li);
  });
}

function renderList(containerId, items) {
  const container = clearNode(containerId);
  if (!container) return;

  asArray(items).forEach((item) => {
    container.appendChild(el("li", { text: item }));
  });
}

function renderExperience(items, ui) {
  const container = clearNode("experience");
  if (!container) return;

  asArray(items).forEach((job) => {
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
      company.textContent = job.company || "";
    }

    if (job.location) company.appendChild(document.createTextNode(" · " + job.location));
    left.appendChild(company);

    head.appendChild(left);
    head.appendChild(el("span", { className: "entry-meta", text: formatRange(job, ui.present || "Present") }));
    entry.appendChild(head);

    if (asArray(job.highlights).length) {
      const ul = el("ul", { className: "entry-highlights" });
      job.highlights.forEach((h) => ul.appendChild(el("li", { text: h })));
      entry.appendChild(ul);
    }

    container.appendChild(entry);
  });
}

function renderProjects(items, ui) {
  const container = clearNode("projects");
  if (!container) return;

  asArray(items).forEach((project) => {
    const card = el("div", { className: "card" });
    const title = el("div", { className: "card-title" });

    title.appendChild(el("span", { text: project.name }));
    if (project.url) {
      const a = el("a", { text: ui.viewProject || "View", href: project.url });
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      title.appendChild(a);
    }
    card.appendChild(title);

    if (project.description) {
      card.appendChild(el("p", { className: "card-desc", text: project.description }));
    }

    const techItems = normalizeTechList(project.tech);
    if (techItems.length) {
      const tags = el("div", { className: "tags" });
      techItems.forEach((t) => tags.appendChild(el("span", { className: "tag", text: t })));
      card.appendChild(tags);
    }

    container.appendChild(card);
  });
}

function renderSkills(skills) {
  const container = clearNode("skills");
  if (!container) return;

  normalizeSkills(skills).forEach((group) => {
    const row = el("div", { className: "skill-row" });
    row.appendChild(el("div", { className: "skill-cat", text: group.category }));

    const tags = el("div", { className: "tags" });
    group.items.forEach((item) => tags.appendChild(el("span", { className: "tag", text: item })));

    row.appendChild(tags);
    container.appendChild(row);
  });
}

function renderEducation(items) {
  const container = clearNode("education");
  if (!container) return;

  asArray(items).forEach((edu) => {
    const entry = el("div", { className: "entry" });
    const head = el("div", { className: "entry-head" });
    const left = el("div");

    left.appendChild(el("p", { className: "entry-role", text: edu.degree }));

    const school = el("span", { className: "entry-company" });
    school.textContent = [edu.school, edu.location].filter(Boolean).join(" · ");
    left.appendChild(school);

    head.appendChild(left);
    head.appendChild(el("span", { className: "entry-meta", text: [edu.start, edu.end].filter(Boolean).join(" - ") }));
    entry.appendChild(head);

    const details = [];
    if (edu.achievements) details.push(edu.achievements);
    if (edu.relevantCourses || edu["relevant courses"]) {
      details.push("Relevant courses: " + (edu.relevantCourses || edu["relevant courses"]));
    }

    if (details.length) {
      const ul = el("ul", { className: "entry-highlights entry-details" });
      details.forEach((detail) => ul.appendChild(el("li", { text: detail })));
      entry.appendChild(ul);
    }

    container.appendChild(entry);
  });
}

function applyUiLabels(ui = {}) {
  document.querySelectorAll("[data-ui]").forEach((node) => {
    const key = node.getAttribute("data-ui");
    node.textContent = ui[key] || "";
  });
  setText("lang-label", ui.language || "Language");
  setText("print-btn", ui.print || "Download / Print");
}

function render(data) {
  const profile = data.profile || {};
  const ui = data.ui || {};
  const meta = data.meta || { lang: DEFAULT_LANG, dir: "ltr" };

  document.documentElement.lang = meta.lang || DEFAULT_LANG;
  document.documentElement.dir = meta.dir || "ltr";
  document.title = [profile.name, profile.title].filter(Boolean).join(" - ") || "Resume";

  applyUiLabels(ui);

  setText("name", profile.name);
  setText("title", profile.title);
  setText("tagline", profile.tagline);
  setText("location", profile.location);
  setText("summary", profile.summary);

  const avatar = getNode("avatar");
  if (avatar) {
    if (profile.avatar) {
      avatar.src = profile.avatar;
      avatar.alt = profile.name || "";
      avatar.hidden = false;
    } else {
      avatar.hidden = true;
    }
  }

  renderLinks(profile.links);

  renderList("achievements", data.achievements);
  toggleSection("achievements-section", asArray(data.achievements).length);

  renderExperience(data.experience, ui);
  toggleSection("experience-section", asArray(data.experience).length);

  renderProjects(data.projects, ui);
  toggleSection("projects-section", asArray(data.projects).length);

  renderEducation(data.education);
  toggleSection("education-section", asArray(data.education).length);

  const skillGroups = normalizeSkills(data.skills);
  renderSkills(skillGroups);
  toggleSection("skills-section", skillGroups.length);

  toggleSection("summary-section", Boolean(profile.summary));

  const year = new Date().getFullYear();
  setText("footer-text", profile.name ? `${profile.name} · ${year}` : "");
}

async function loadLang(lang) {
  const res = await fetch(`data/${lang}.json`, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Could not load data/${lang}.json (${res.status})`);
  return res.json();
}

function buildLangSelect(current) {
  const select = getNode("lang-select");
  if (!select) return;

  select.innerHTML = "";
  AVAILABLE_LANGS.forEach((code) => {
    const option = el("option", { attrs: { value: code } });
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
    setText("name", "Failed to load resume data.");
    return;
  }

  render(data);
  localStorage.setItem(STORAGE_KEY, lang);

  const option = document.querySelector(`#lang-select option[value="${lang}"]`);
  if (option && data.meta && data.meta.langName) option.textContent = data.meta.langName;

  const select = getNode("lang-select");
  if (select) select.value = lang;

  if (updateHistory) {
    const url = new URL(location.href);
    url.searchParams.set("lang", lang);
    history.replaceState({}, "", url);
  }
}

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

  const select = getNode("lang-select");
  if (select) select.addEventListener("change", (e) => setLang(e.target.value));

  const printButton = getNode("print-btn");
  if (printButton) printButton.addEventListener("click", () => window.print());

  setLang(initial, { updateHistory: false });
  labelLangSelect();
}

document.addEventListener("DOMContentLoaded", init);
