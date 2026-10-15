# OOP Learning Website — Project Plan

A static, beginner-friendly site that teaches Object-Oriented Programming in JavaScript
through explanations, editable code, visual diagrams, quizzes, and small working apps.

**Stack:** HTML5, CSS3, vanilla JavaScript (ES2020+ modules). No frameworks, no build step,
no npm dependencies, no backend.

**Status:** Phase 1 (planning and architecture) complete. Phases 2–6 not started.

---

## 1. Requirements analysis

### What the site must do

| Area | Requirement | Where it lives |
|---|---|---|
| Curriculum | 6 modules, beginner → advanced, 33 lessons | `js/curriculum.js` + `js/lessons/*` |
| Lesson page | Title, objectives, explanation, diagram, editable code, console, exercise, Prev/Next | `js/ui/lesson-view.js` |
| Playground | Edit, Run, Reset, Copy; console output and errors; code runs in a sandboxed iframe | `js/playground/` |
| Visualizer | Class → object, constructor run, inheritance, private fields, overriding, polymorphism; clickable methods | `js/visualizer.js` |
| Quizzes | Multiple choice, instant feedback, explanations, score, retry, saved result | `js/quiz.js` |
| Progress | Completed lessons, module %, resume last lesson, reset | `js/storage.js` + `js/progress.js` |
| Projects | 4 mini projects + Library final project (Library persists data) | `projects/*` |
| UI | Sidebar + top bar + content; responsive; light/dark theme; accessible | `index.html`, `css/*` |

### Constraints and what they force

1. **ES modules need HTTP.** Browsers refuse to load `<script type="module">` from a
   `file://` URL. So the site must be opened through any static server
   (`python3 -m http.server`, VS Code Live Server, GitHub Pages). This is not a backend —
   the server only hands out files. The README will make this the first instruction, and
   `index.html` will show a visible message if modules fail to load.
2. **No libraries means we write our own** syntax highlighter (small regex tokenizer) and
   code editor (a `<textarea>` layered over a highlighted `<pre>`). Both are kept small and
   readable on purpose — they are part of what a learner can study.
3. **Static hosting means hash routing.** Routes look like `#/lesson/encapsulation` so any
   static host works without server rewrite rules, and the browser Back button works.
4. **"No placeholder features."** A lesson or project is only added to the sidebar once its
   content exists. Until then the sidebar shows it as *Coming soon* (disabled, not a fake page).

### The existing prototype

The repo already contains a working one-page prototype (`index.html`, `script.js`,
`style.css`): concept tabs, a `BankAccount` class with private fields, and a 5-question quiz.
It will not be thrown away:

- Its `BankAccount` class becomes the starting point for Project 2.
- Its five concept examples become starter code for the Module 3 lessons.
- Its quiz questions move into the pillar quizzes.
- The three files are replaced in Phase 2, once the new shell runs the same content.

---

## 2. Architecture

### Beginner-friendly overview

Think of the site as a small restaurant:

- **`curriculum.js` is the menu.** It lists every module and lesson, in order. It contains
  no explanations, only names and ids.
- **`js/lessons/*.js` are the recipes.** Each file holds the actual teaching content for one
  module, stored as plain JavaScript objects.
- **The router is the waiter.** It reads the address bar (`#/lesson/inheritance`), looks the
  lesson up on the menu, fetches the recipe, and hands it to the kitchen.
- **The views are the kitchen.** They turn lesson data into HTML on the page.
- **`storage.js` is the notebook** where the restaurant remembers what you've already eaten
  (your progress), kept in the browser's `localStorage`.

The important rule: **data, logic, and display are kept in separate files.** A `Student`
class in a project knows nothing about HTML; a view knows nothing about how the data is
saved. This is the same separation the course teaches, applied to the site itself.

### Folder structure

```text
oop-learning/
├── index.html                 App shell: sidebar, top bar, <main> outlet
├── css/
│   ├── style.css              Design tokens (colors, spacing, fonts), light/dark themes, base elements
│   ├── layout.css             Sidebar / top bar / content grid
│   ├── components.css         Buttons, cards, callouts, editor, console, quiz, diagrams
│   └── responsive.css         Tablet and phone breakpoints, collapsible sidebar
├── js/
│   ├── app.js                 Entry point: wires everything together on load
│   ├── curriculum.js          ✅ Module/lesson list and navigation helpers (Phase 1)
│   ├── router.js              Hash routes → view functions
│   ├── storage.js             Versioned, failure-safe localStorage wrapper
│   ├── progress.js            Completion %, resume, reset (built on storage.js)
│   ├── theme.js               Light/dark toggle, respects OS preference
│   ├── dom.js                 Tiny helpers: el(), clear(), safe inline-text formatting
│   ├── ui/
│   │   ├── sidebar.js
│   │   ├── topbar.js
│   │   ├── dashboard-view.js
│   │   ├── roadmap-view.js
│   │   ├── lesson-view.js     Renders a lesson's content blocks in order
│   │   └── progress-view.js
│   ├── playground/
│   │   ├── playground.js      Editor + buttons + console component
│   │   ├── highlighter.js     Regex-based JS syntax highlighter
│   │   └── sandbox.html       Page loaded into the sandboxed iframe
│   ├── visualizer.js          Diagram scenes (class/object, inheritance, …)
│   ├── quiz.js                Quiz component
│   └── lessons/
│       ├── index.js           Maps lesson id → content (lazy imports per module)
│       ├── fundamentals.js
│       ├── oop-basics.js
│       ├── encapsulation.js
│       ├── abstraction.js
│       ├── inheritance.js
│       ├── polymorphism.js
│       └── advanced.js
├── projects/
│   ├── student/        model.js (classes, no DOM) + view.js (DOM) + guide.js (explanation)
│   ├── bank-account/   same split
│   ├── employee/
│   ├── shopping-cart/
│   └── library/
├── tests/                     node --test 'tests/**/*.test.js'  (Node built-in, no installs)
├── docs/PLAN.md               This file
└── README.md
```

Changes from the suggested structure, and why:

- **`advanced.js` added** to `lessons/` — Module 4 needed a home.
- **`curriculum.js` and `lessons/index.js` added** — one list drives the sidebar, router, and
  progress, so they can never disagree.
- **`ui/` and `playground/` subfolders** — keeps `js/` from becoming a flat list of 20 files.
- **`tests/`** — model classes (BankAccount, Library, …) have no DOM, so Node can test them
  directly with its built-in runner. This is a developer tool only; learners don't need Node.

### Data models

**Lesson content** (in `js/lessons/*.js`) — an ordered list of typed blocks, so the renderer
stays generic and a lesson can mix blocks freely:

```js
export const encapsulation = {
  id: 'encapsulation',
  objectives: ['Explain why objects hide their data', 'Use #private fields', '…'],
  blocks: [
    { type: 'text', body: 'Encapsulation means **bundling** data with the methods that…' },
    { type: 'analogy', title: 'Real world', body: 'An ATM lets you withdraw, but not open the vault.' },
    { type: 'visualizer', scene: 'encapsulation' },
    { type: 'playground', code: 'class Wallet {\n  #balance = 0;\n  …' },
    { type: 'mistakes', items: [{ wrong: '…', why: '…', fix: '…' }] },
    { type: 'exercise', prompt: '…', starter: '…', check: 'expected console output', hint: '…', solution: '…' },
    { type: 'quiz', id: 'encapsulation-quiz', questions: [
      { q: '…', options: ['…', '…', '…'], answer: 1, explain: '…' },
    ]},
  ],
};
```

Text bodies support only `` `code` `` and `**bold**`. The renderer escapes everything else
and builds elements with DOM methods — no `innerHTML` with lesson strings.

**Exercises are checked by output.** The learner's code runs in the sandbox; if its console
output matches `check` (trimmed, line by line), the exercise is marked solved. Simple,
honest, and explainable to a beginner.

**Saved state** (one `localStorage` key, `oopLearning:v1`):

```js
{
  version: 1,
  theme: 'light' | 'dark' | null,          // null = follow the OS
  lastLessonId: 'inheritance',
  completed: { 'encapsulation': 1760000000000 },   // lesson id → timestamp
  exercises: { 'encapsulation': true },
  quizzes:   { 'encapsulation-quiz': { best: 4, total: 5, attempts: 2 } },
  drafts:    { 'encapsulation#0': 'class Wallet { … }' }  // unsaved editor code per playground
}
```

The Library final project keeps its own key (`oopLearning:library:v1`) so resetting course
progress does not delete a learner's books.

`storage.js` wraps every read and write in `try/catch` and falls back to in-memory state
when storage is blocked (private browsing), so the site always works — it just won't remember.

**When is a lesson "complete"?** When the learner clicks *Mark complete*, which unlocks
once the lesson's quiz (if any) is passed at ≥ 70%. Projects complete when their guided
checklist is done.

### Navigation

| Route | View |
|---|---|
| `#/` | Dashboard: progress overview, *Resume* button, module cards |
| `#/roadmap` | All modules and lessons with completion ticks |
| `#/module/<moduleId>` | Module overview |
| `#/lesson/<lessonId>` | Lesson or project page |
| `#/quizzes` | Every quiz with best score; links to its lesson |
| `#/progress` | Per-module percentages, reset button |
| anything else | "Page not found" with a link home |

The sidebar's module groups (Fundamentals, OOP Fundamentals, Four Pillars, Advanced,
Mini Projects + Final) expand to show their lessons. On screens under 900px the sidebar
becomes a slide-in drawer opened from a menu button in the top bar.

### Playground: how learner code is isolated

```text
 main page                                  sandboxed <iframe sandbox="allow-scripts">
 ─────────                                  ──────────────────────────────────────────
 [Run] ──postMessage({ code, runId })──▶   sandbox.html receives the code
                                            replaces console.log/error/warn
                                            runs the code
 console panel ◀──postMessage(logs, errors)── sends each log line back with runId
 timer: no "done" message in 3s → remove the iframe, show "Stopped: code took too long"
```

- `sandbox="allow-scripts"` **without** `allow-same-origin` gives the iframe a unique
  origin: learner code cannot read the site's `localStorage`, cookies, or DOM.
- A fresh iframe per run means no leftover variables between runs.
- **Known risk — infinite loops.** A sandboxed iframe can share the page's thread, so
  `while(true){}` could freeze the whole tab before the 3-second timer fires. Phase 4 will
  run the code inside a Web Worker started from the iframe, which can be terminated, and
  verify this in Chrome, Firefox, and Safari. If a browser blocks that, we fall back to the
  plain iframe and say so in the playground's help text.

### Visualizer

Each scene is a small class with `render(container)` and step controls (*Step*, *Play*,
*Reset*). Diagrams are built from HTML boxes and an SVG layer for arrows, styled with the
theme's CSS variables so they work in dark mode. Clicking a method on an object box animates
the lookup: it highlights the object, then walks up to the class, then the parent class,
until the method is found — the same path the JavaScript engine takes.

Planned scenes: `class-to-object`, `constructor`, `encapsulation`, `inheritance`,
`overriding`, `polymorphism`, `prototype-chain`.

### Dependencies between features

```text
curriculum.js ─┬─▶ router ─▶ app shell (sidebar, top bar, theme)
               │                  │
storage.js ────┴─▶ progress.js ───┤
                                  ▼
                            lesson-view ──▶ text/analogy/mistakes blocks
                              │   │   │
         highlighter ─▶ playground │   └──▶ quiz (needs storage)
                       (exercises) └──────▶ visualizer
                                  ▼
                       lesson content (needs all block types)
                                  ▼
                       projects (need shell + storage; library needs storage)
```

So the build order is: shell and storage → lesson renderer → interactive components →
content → projects. Content in Phase 3 starts with text blocks only and gains playgrounds,
diagrams, and quizzes as Phase 4 lands them.

---

## 3. Phases and acceptance criteria

Each phase ends with a working site. Nothing from an earlier phase may break, and
`node --test 'tests/**/*.test.js'` must pass before moving on.

### Phase 1 — Planning and architecture ✅

Built: this plan, `js/curriculum.js` (the real lesson list and Prev/Next logic), and
`tests/curriculum.test.js`.

- [x] All 33 lessons across 6 modules defined with unique, URL-safe ids
- [x] Previous/Next works across module boundaries and stops at both ends
- [x] Data models for lesson content and saved progress specified
- [x] Routes, folder structure, and feature dependencies specified
- [x] Tests pass (6/6)

### Phase 2 — UI foundation

Build: new `index.html` shell, all four CSS files, `router.js`, `storage.js`,
`progress.js`, `theme.js`, sidebar, top bar, dashboard, roadmap, progress page, 404,
and `lesson-view.js` rendering **text** and **analogy** blocks. Migrate the prototype's
content into one sample lesson, then remove `script.js` and `style.css`.

- Every route in the table above renders; unknown routes show the 404 view
- Sidebar lists all modules; lessons without content show *Coming soon* and aren't clickable
- Theme toggle switches instantly, persists across reload, defaults to the OS setting
- Layout works at 1280px, 768px, and 375px with no horizontal scroll; sidebar becomes a drawer
- Keyboard: everything reachable by Tab, visible focus ring, drawer closes with Esc
- Storage blocked (private window) → site still works, nothing throws
- Tests for `storage.js` (versioning, corrupted JSON, blocked storage) and `progress.js`

### Phase 3 — Learning content

Build: Modules 1–3 lesson content (19 lessons): objectives, explanations, analogies,
code examples, common mistakes. Module 4 (9 lessons) follows the same shape.

- Every lesson in Modules 1–4 has objectives, at least one explanation, and one code example
- Each pillar lesson has: explanation, analogy, implementation, mistakes, exercise, quiz
  (exercises/quizzes render once Phase 4 components exist)
- Every code example runs without errors and prints the output the text claims
  (checked by a test that executes each example in Node)
- Sidebar *Coming soon* tags disappear for completed lessons

### Phase 4 — Interactive features

Build: playground (editor, highlighter, sandbox, Run/Reset/Copy, console, timeout),
exercises, visualizer scenes, quiz component, *Mark complete*, resume-last-lesson.

- Run shows `console.log` output and readable errors with line numbers
- Learner code cannot access `window.parent`'s storage or DOM (verified manually)
- `while (true) {}` does not freeze the page in Chrome, Firefox, or Safari — or the
  limitation is documented if a browser can't be protected
- Reset restores the original code; Copy puts code on the clipboard and confirms
- Quiz: instant per-question feedback with explanation, score, retry, best score saved
- Visualizer: each scene steps forward/back; clicking a method animates the lookup path
- Progress percentages update immediately after completing a lesson; *Resume* opens the
  last visited lesson

### Phase 5 — Practical projects

Build: the four mini projects, then the Library final project. Each has a `model.js`
(pure classes), `view.js` (DOM), and a guide explaining which OOP ideas appear where.

- Student: add, edit, remove, list students; invalid input rejected with a message
- Bank: create accounts, deposit, withdraw, balance via `#private` fields;
  `SavingsAccount`/`CheckingAccount` subclasses override `withdraw()` (polymorphism)
- Employee: `Employee` → `Developer`, `Manager`; overridden `calculateSalary()`
- Shopping cart: `ShoppingCart` *has* `Product`s (composition); totals, quantities, removal
- Library: books, members, borrow/return, availability, search/filter, data survives reload;
  guide maps each of the four pillars to specific classes and lines
- Every `model.js` has Node tests for its rules (e.g. can't withdraw more than the balance,
  can't borrow a book that's already out)

### Phase 6 — Testing and polish

- Manual pass through all 33 lessons on desktop, tablet, phone widths
- Accessibility review: headings order, labels, contrast (WCAG AA), `aria-live` for
  console/quiz feedback, reduced-motion support for animations
- Errors anywhere show a friendly message instead of a blank page
- README: what the site is, how to run it (static server), folder tour, how to add a lesson,
  how to run tests
- Downloadable ZIP of the source (`git archive --format=zip -o oop-learning.zip HEAD`)

---

## 4. Coding conventions

- ES modules, one responsibility per file; `export` only what other files use
- Model classes never touch the DOM; views never touch `localStorage` directly
- Build DOM with `document.createElement` / `textContent`; no `innerHTML` with dynamic text
- Names: `camelCase` for functions and variables, `PascalCase` for classes,
  `kebab-case` for files, CSS classes, and ids
- Comments explain *why* (and teach, where a learner will read the file), not *what*
- Validate input at the edges (forms, storage reads); show the learner a clear message
