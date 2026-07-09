# Multilingual GitHub Resume

A single-page, shareable resume hosted on **GitHub Pages**. Content lives in
plain JSON files (one per language) so you can update it or add a language
without touching any code. No build step, no dependencies.

- **One link to share:** `https://<username>.github.io/<repo>/`
- **Languages:** English, Russian, Italian, French (easy to add more)
- **Update = edit a JSON file and push.**
- **Print / export to PDF** with the button in the top-right.

---

## Folder structure

```
resume/
├── index.html          # page template (rarely needs editing)
├── .nojekyll           # tells GitHub Pages to serve files as-is
├── assets/
│   ├── styles.css      # all styling (light + dark + print)
│   └── app.js          # loads a language file and renders the page
├── data/
│   ├── en.json         # English content  ← edit these
│   ├── ru.json         # Russian content
│   ├── it.json         # Italian content
│   └── fr.json         # French content
└── README.md
```

---

## 1. Update your content

Open the JSON file for a language (e.g. `data/en.json`) and replace the
placeholder values. Each file has the same shape:

- `profile` — name, title, tagline, location, summary, and your `links`.
- `achievements` — a list of your top wins (put the strongest first).
- `experience` — positions held. Set `"current": true` (and leave `"end": ""`)
  for your present role. `highlights` is a list of bullet points.
- `projects` — projects you've worked on, each with a `url`, `description`, and
  a `tech` list.
- `skills` — grouped by `category`.
- `education` — degrees / institutions.
- `ui` — the section titles and button labels **in that language** (already
  translated; only change if you want different wording).

Tip: keep `en.json` as your "master". When you change structure there, mirror
it in the other language files.

---

## 2. Preview locally

Because the page fetches JSON files, you need a tiny local web server (opening
`index.html` directly with `file://` will be blocked by the browser).

From inside the `resume/` folder:

```bash
# Python (any OS with Python 3)
python -m http.server 8080
```

Then open <http://localhost:8080/>. Add `?lang=ru` to test a specific language.

---

## 3. Add a new language

1. Copy `data/en.json` to `data/<code>.json` (e.g. `data/de.json`) and translate
   the values — including the `ui` labels and `meta.langName`.
2. Open `assets/app.js` and add the code to the `AVAILABLE_LANGS` array:

   ```js
   const AVAILABLE_LANGS = ["en", "ru", "it", "fr", "de"];
   ```

That's it — the language dropdown updates automatically.

---

## 4. Publish on GitHub Pages

You can host this as its own repository (recommended for a clean URL) or from a
subfolder of an existing repo.

### Option A — dedicated repo (cleanest link)

1. Create a new GitHub repo, e.g. `resume`.
2. Copy the **contents** of this `resume/` folder into the repo root and push:

   ```bash
   git init
   git add .
   git commit -m "Add resume"
   git branch -M main
   git remote add origin https://github.com/<username>/resume.git
   git push -u origin main
   ```

3. On GitHub: **Settings → Pages → Build and deployment**.
   - **Source:** *Deploy from a branch*
   - **Branch:** `main` / `/ (root)` → **Save**
4. Wait ~1 minute. Your resume is live at:

   `https://<username>.github.io/resume/`

### Option B — user/organization site

Name the repo `<username>.github.io`, push the files to the root, and it will be
served at `https://<username>.github.io/`.

### Custom domain (optional)

In **Settings → Pages → Custom domain**, add your domain (e.g.
`cv.yourname.com`) and create a `CNAME` DNS record pointing to
`<username>.github.io`. GitHub will provision HTTPS automatically.

---

## 5. Share it

Share the base link, or point people straight to a language:

- English: `https://<username>.github.io/resume/`
- Russian: `https://<username>.github.io/resume/?lang=ru`
- Italian: `https://<username>.github.io/resume/?lang=it`
- French: `https://<username>.github.io/resume/?lang=fr`

The site also remembers the visitor's last choice and respects their browser
language on first visit.

---

## Exporting a PDF

Click **Download / Print** (top-right) → in the print dialog choose
*Save as PDF*. The layout is print-optimized (toolbar and footer are hidden,
colors simplified) so it makes a clean one-file resume too.
