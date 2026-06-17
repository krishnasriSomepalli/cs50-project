# \~Doodler\~

> Final project for [CS50x](https://cs50.harvard.edu/x/) (HarvardX / edX).

**Doodler** is a Flask web application that generates collages of hand-drawn
doodles from a saved subset of Google's
[*Quick, Draw!*](https://quickdraw.withgoogle.com/) dataset. Pick one or more
categories (a "theme"), and the app stitches together randomly chosen doodles
into a single canvas that you can rearrange, resize, and download as an SVG.

🎥 **Demo:** https://youtu.be/SyYHaSrfbME

---

## Features

Doodler exposes four ways to build a collage:

| Mode | Route | What it does |
| --- | --- | --- |
| **Basic** | `/basic` | Type a single theme (e.g. `cat`) with autocomplete and render a collage of matching doodles. |
| **Multiple** | `/multiple` | Browse all categories and select several at once, then build a mixed collage. |
| **Customize** | `/customize` | Drag individual doodles around, adjust spacing/overall size, and copy, delete, or swap out elements. |
| **Randomize** | (button on `/basic`) | Build a collage from one of five pre-generated random mixes (`random1..5.json`). |

Every mode supports **downloading the result as an SVG** file named after the
chosen categories.

---

## How it works

```
Browser (jQuery + D3 v4)                Flask (application.py)            Data
─────────────────────────               ──────────────────────           ──────────────────────
type a theme  ───────────►  GET /suggest?q=...  ──► SQLite "categories" table  ──► suggestions
choose categories ───────►  GET /categories     ──► categories.txt             ──► category list
build a collage ─────────►  GET /data?categories=[...] ──► files/json/<cat>.json ──► stroke data
render strokes with D3   ◄──────────────────────  JSON array of doodles
```

1. The frontend asks the server for doodle data for the selected categories
   (`/data`). The `theme()` helper opens the matching
   `files/json/<category>.json` files and returns a shuffled sample of doodles.
2. Each doodle is a list of strokes; each stroke is a pair of `x`/`y` coordinate
   arrays captured from *Quick, Draw!*.
3. D3 turns those coordinates into SVG `<path>` elements using a
   Catmull–Rom curve, laying the doodles out on a grid.
4. The Customize view adds drag/copy/delete/replace interactions and exports the
   live `<svg>` as a downloadable file.

---

## Tech stack

- **Backend:** Python 3, [Flask](https://flask.palletsprojects.com/),
  [Flask-JSGlue](https://github.com/stewartpark/Flask-JSGlue),
  the [CS50 `SQL`](https://pypi.org/project/cs50/) helper, SQLite.
- **Frontend:** jQuery, Bootstrap 3, [D3.js v4](https://d3js.org/),
  [typeahead.js](https://twitter.github.io/typeahead.js/) + Handlebars
  (loaded via CDN).
- **Data tooling:** [NLTK](https://www.nltk.org/) (used by `buildNouns.py`).
- **Dataset:** a saved subset of Google *Quick, Draw!* stroke data.

---

## Project structure

```
.
├── application.py        # Flask app and all routes
├── doodles.db            # SQLite DB with a single "categories" table (345 rows)
├── categories.txt        # Plain-text list of the same 345 categories
├── build-random.py       # Generates files/json/random1..5.json from the category files
├── buildNouns.py         # NLTK script: extracts nouns from "large" into "nouns"
├── requirements.txt      # Python dependencies
├── files/
│   └── json/             # 345 per-category doodle files + 5 random*.json mixes
├── templates/            # index, basic, customize, multiple (Jinja/HTML)
├── static/               # basicScript.js, customizeScript.js, multipleScript.js, styles.css
├── large / nouns         # NLP corpus input/output for buildNouns.py
└── LICENSE
```

---

## Getting started

> ⚠️ The dependency list shipped with the original project is incomplete — see
> [`CODE_REVIEW.md`](CODE_REVIEW.md). The code imports `cs50` and `nltk`, which
> are **not** currently listed in `requirements.txt`. Install them explicitly
> until that file is corrected.

```bash
# 1. (recommended) create a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. install dependencies
pip install -r requirements.txt
pip install cs50 nltk           # not yet captured in requirements.txt

# 3. run the app (CS50 / Flask style)
export FLASK_APP=application.py  # Windows (PowerShell): $env:FLASK_APP="application.py"
flask run
```

Then open the URL Flask prints (typically <http://127.0.0.1:5000/>).

---

## Data & build scripts

These scripts were used to prepare the bundled data and are **not** needed to
run the app — they're included for reference/reproducibility.

- **`build-random.py`** — samples doodles across every category, shuffles them,
  and writes five `files/json/random1..5.json` files used by the Randomize mode.
- **`buildNouns.py`** — runs NLTK part-of-speech tagging over the `large` corpus
  and writes the extracted nouns to `nouns`. (This supported an experimental
  synonym-based suggestion feature that is currently disabled in `application.py`.)

---

## Attribution

Doodle stroke data comes from Google's
[*Quick, Draw!* dataset](https://github.com/googlecreativelab/quickdraw-dataset),
released by Google Creative Lab under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Only a small subset is
bundled here to keep the project self-contained.

## License

See [`LICENSE`](LICENSE).

