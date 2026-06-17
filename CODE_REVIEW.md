# Code Review — Doodler

A review of the Doodler CS50x final project, focused on **accuracy/correctness
and refactoring** rather than visual/UI polish (per the author's request). It is
written for a student revisiting their own project, so it favors concrete,
actionable notes over nitpicks.

Findings are grouped into **Strengths**, **Should Fix** (correctness/accuracy),
**Refactoring Opportunities**, and **Nice-to-haves**, with file references.

---

## ✅ Strengths

- **Clear separation of modes.** Basic, Multiple, and Customize each have their
  own template (`templates/`) and script (`static/`), which keeps each
  interaction model easy to follow.
- **Parameterized SQL.** `/suggest` uses CS50's named-parameter API
  (`db.execute("... WHERE name LIKE :q", q=q)` — `application.py:84`) rather than
  string-concatenating user input into SQL, so it avoids the classic injection
  pitfall.
- **Self-contained dataset.** Bundling a subset of *Quick, Draw!* under
  `files/json/` lets the app run without downloading the full multi-gigabyte
  dataset — a sensible scoping decision for a course project.
- **Reasonable rendering approach.** Using a D3 data-join to turn stroke
  coordinates into SVG `<path>` elements, plus exporting the live `<svg>` via a
  `Blob`, is a clean, dependency-light way to render and download collages.
- **Reproducible data prep.** `build-random.py` and `buildNouns.py` document how
  the bundled `random*.json` and `nouns` artifacts were generated.

---

## 🔧 Should Fix (correctness & accuracy)

### 1. `requirements.txt` does not match the code — app won't install/run as-is
`requirements.txt` lists `feedparser`, `Flask`, `Flask-JSGlue`, but:
- `feedparser` is **never imported** anywhere in the project (dead dependency).
- `cs50` (`application.py:12`) and `nltk` (`application.py:7-8`, `buildNouns.py:1`)
  **are** imported but are **missing** from the file.

A fresh `pip install -r requirements.txt` therefore produces an environment that
cannot import `application.py`. Fix: drop `feedparser`, add `cs50` and `nltk`
(and pin versions — see Nice-to-haves).

### 2. Dead CDN breaks autocomplete in the Basic view
`templates/basic.html:10` loads typeahead.js from
`https://cdn.rawgit.com/...`. **RawGit was shut down in October 2019**, so this
request fails today and `$('#theme').typeahead(...)` in `basicScript.js:175` has
no effect — the theme suggestions silently stop working. Switch to a maintained
host (e.g. cdnjs/jsDelivr) or vendor the library locally.

### 3. `/suggest` 500s when the query param is missing
```python
q = request.args.get('q') + '%'   # application.py:83
```
If the request arrives without `q`, `request.args.get('q')` is `None` and
`None + '%'` raises `TypeError`, returning a 500. Guard for the missing/empty
case (e.g. default to `''` and short-circuit).

### 4. Two sources of truth for the category list
The same 345 categories live in **both** the SQLite `categories` table **and**
`categories.txt`. `/suggest` reads the DB (`application.py:84`) while
`/categories` reads the text file (`application.py:53-67`). They can drift out of
sync, and there's no reason to maintain both. Pick one (the DB is the natural
choice) and derive everything from it.

### 5. Hand-rolled file parsing where the standard library suffices
`/categories` reads `categories.txt` character-by-character with an index loop:
```python
while i < len(data):
    if data[i] == '\n':
        all_categories.append(category)
        ...
```
(`application.py:54-67`, and the identical pattern in `build-random.py:11-24`).
This is equivalent to `data.splitlines()` (or `[line.strip() for line in file]`),
which is shorter, faster, and avoids dropping the final line when the file has no
trailing newline. The file is also opened without a `with` block, so it won't be
closed if an exception is thrown mid-parse.

### 6. Dead code and unused imports
- The synonym-suggestion logic in `/suggest` is entirely commented out
  (`application.py:85-113`) — roughly 30 lines of dead code. Either remove it or
  move it to a branch/issue; leaving it inline obscures what the route actually
  does.
- Because of that, several imports are unused: `os`, `re`, `url_for`,
  `nltk ... wordnet as wn`, and `word_tokenize` (`application.py:1-8`).
- `from random import *` (`application.py:6`) is a wildcard import used only for
  `randint`/`shuffle`. Prefer `from random import randint, shuffle` so the names
  in scope are explicit.

### 7. Committed editor artifact and empty asset
- `.~c9_invoke_uS4BDO.py` is a Cloud9 IDE autosave copy of an older
  `application.py`. It should not be in version control.
- `static/styles.css` is empty (all styling is inline in the templates) — either
  use it or remove it.

### 8. Sampling can repeat the same doodle
In `theme()`, doodles are drawn with `d[randint(0, len(d)-1)]`
(`application.py:77`), i.e. sampling **with replacement**, so the same doodle can
appear several times in one collage. If uniqueness is intended, use
`random.sample`. This is a correctness/intent question worth a comment either way.

> **Note on accuracy:** `theme()` computes
> `category_size = ceil(1200 / len(categories))` and appends `category_size` items
> per category, so the total is usually **slightly more than 1200**, not exactly
> 1200. Comments elsewhere (e.g. `customizeScript.js:14`, "we have 1200 elements")
> assume an exact count; the off-by-rounding gap is harmless today but worth
> documenting.

---

## ♻️ Refactoring Opportunities

These don't change behavior but would make the code easier to read and maintain.

### Backend (`application.py`)
- **Trim imports to what's used** and drop the wildcard import (see Should Fix 6).
- **Use `with open(...)`** for `categories.txt` and the per-category JSON files.
- **Drop the trailing semicolons** (`data = file.read();`, `i = 0;`, etc.) — they
  are non-idiomatic in Python.
- **The `@app.after_request` no-cache hook is dead in practice.** It is registered
  only inside `if app.config["DEBUG"]:` (`application.py:19`), but `DEBUG`
  defaults to `False`, so the headers are never applied. Decide whether you want
  the behavior, then register it unconditionally or drive it off the real debug flag.
- **Validate/escape `LIKE` input.** Even with parameterization, `%` and `_` typed
  by the user are treated as wildcards in the `LIKE` clause (`application.py:83-84`).
  Escaping them gives more predictable autocomplete.

### Frontend (`static/*.js`)
- **De-duplicate `getData()` stroke parsing.** The nested
  `temp1/temp2/temp3/temp4` loop that converts `[xs, ys]` pairs into `[x, y]`
  points is copy-pasted between `basicScript.js:32-54` and
  `customizeScript.js:30-50`. Extract a shared helper (e.g. `parseDoodles(data)`).
- **De-duplicate `downloader()`.** It is essentially identical in
  `basicScript.js:143-158` and `customizeScript.js:221-235`.
- **Fix the Promise anti-pattern.** Both `getData()` implementations call
  `resolve(...)` and then `reject(...)` on the next line
  (`basicScript.js:55-56`, `customizeScript.js:51-52`); the `reject` is
  unreachable and the real `$.getJSON` failure path isn't wired into the Promise.
  Either wrap the AJAX call properly (reject in `.fail`) or just return the
  jQuery promise.
- **Iterate arrays with index/`for...of`, not `for (i in array)`.** `for...in`
  over arrays (e.g. `basicScript.js:36`, `multipleScript.js:22`) iterates keys and
  is fragile if the array is ever extended; use `forEach`/`for...of`.
- **Name the magic numbers.** `track = 1199` (`customizeScript.js:14`), the
  `1200`/`viewBox` constants, and `1725` in `build-random.py:38` would be clearer
  as named constants tied to the actual data size.
- **Remove the no-op line** `var n = 5 + spacing;` in `customizeScript.js:79` — it
  is computed and never used.
- **Modernize syntax** (`const`/`let` over `var`) and consider consolidating the
  three scripts, which share a lot of structure.

---

## 💡 Nice-to-haves

- **Add a `.gitignore`** (e.g. `venv/`, `__pycache__/`, `*.pyc`, editor temp files
  like `.~c9_*`) so artifacts like the Cloud9 file don't get committed again.
- **Pin dependency versions** in `requirements.txt` for reproducible installs.
- **Add a run entry point / docs.** There's no `if __name__ == "__main__"` block;
  documenting `flask run` (now covered in the README) or adding one would help new
  users.
- **Host third-party JS on maintained CDNs over HTTPS**, and replace the
  hard-coded external image/loading-gif URLs in the templates (supercoloring.com,
  thinkfuture.com) with locally served assets so the app doesn't depend on
  third-party sites staying up.
- **Add a few tests** around the data routes (`/categories`, `/data`, `/suggest`)
  — even simple smoke tests would catch regressions like the `requirements.txt`
  and dead-CDN issues above.
- **Document the data schema** (what a doodle/stroke array looks like) near
  `theme()` so the frontend↔backend contract is explicit.

---

## Priority summary

| Priority | Item |
| --- | --- |
| 🔴 High | Fix `requirements.txt` (add `cs50`/`nltk`, drop `feedparser`) |
| 🔴 High | Replace dead RawGit CDN (autocomplete broken) |
| 🟠 Medium | Guard `/suggest` against missing `q` (500 error) |
| 🟠 Medium | Consolidate `categories.txt` vs DB; remove dead code/unused imports |
| 🟠 Medium | Remove `.~c9_invoke_uS4BDO.py`; add `.gitignore` |
| 🟡 Low | De-duplicate JS (`getData`/`downloader`), fix Promise anti-pattern |
| 🟡 Low | Idiomatic Python (`with`, explicit imports, `splitlines`), pin deps, tests |

*Scope note: this review intentionally skips visual/CSS/layout feedback and
focuses on correctness and structure.*
