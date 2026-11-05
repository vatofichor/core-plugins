# ScratchBoard

> A lightweight, zero-dependency, line-by-line persistent notes scratchpad and canvas for web applications.

Extracted and decoupled from the ContactFlow platform into a standalone drop-in component. ScratchBoard stores snippets and quick notes in browser `localStorage`, pairing a live line-by-line rendering surface (**The Board Canvas**) with a collapsible staging drawer (**The Editor**) powered by a standardized 4-button control container.

---

## Architecture: The Dual-Entity System

ScratchBoard is engineered as a unified two-part component housed within the standard `.scratchboard-container`:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ .scratchboard-container                                                │
│                                                                        │
│  <h2>ScratchBoard</h2>                                                  │
│  <div id="notifications-scratchboard">...</div>                        │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ [PART 1] THE BOARD CANVAS (#scratchboard-list)                   │  │
│  │                                                                  │  │
│  │  Line 1: Note item rendered into individual div                  │  │
│  │  Line 2: Another persistent snippet                              │  │
│  │  Line 3: Clean data without weird email formatting               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  [Editor Toggle Button]                                                │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ [PART 2] THE STAGING EDITOR (#editor-scratchboard)               │  │
│  │                                                                  │  │
│  │  <textarea id="text-input-scratchboard">                         │  │
│  │  Raw text lines loaded for modification...                       │  │
│  │  </textarea>                                                     │  │
│  │                                                                  │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │ 4-BUTTON CONTROLS CONTAINER (.scratchboard-controls)       │  │  │
│  │  │  [ 1. Save ]  [ 2. Choose File ]  [ 3. Import ]  [ 4. Export ]  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Part 1: The Board Canvas (`#scratchboard-list`)
- **Visual Surface**: The primary viewing area where stored notes are rendered line-by-line as discrete `div.scratchboard-item` nodes.
- **Instant Hydration**: Automatically parses and renders notes cached in `localStorage['scratchboard_cache']` on load.
- **Reactive Updates**: Immediately re-paints whenever notes are modified via the editor, ingested through file import, or cleared via API hooks.
- **Empty State**: Displays `<p class="scratchboard-empty">No notes available.</p>` when the cache is empty.

### Part 2: The Staging Editor (`#editor-scratchboard`)
- **Collapsible Drawer**: Operated via a CSS-driven toggle (`#editor-scratchboard-toggle`). Keeps the UI clean and unobtrusive until activated.
- **Multi-line Textarea (`#text-input-scratchboard`)**: Populated with current canvas notes joined by newline characters (`\n`) upon opening.
- **Controls Container (`.scratchboard-controls`)**: Houses the standardized 4 functional buttons.

---

## The 4 Functional Buttons

The control toolbar inside `#editor-scratchboard` strictly adheres to a standard 4-button specification:

| # | Button Label | Selector / Hook | Type | Operational Specification |
| :---: | :--- | :--- | :---: | :--- |
| **1** | **Save** | `#save-btn-scratchboard` | `<button>` | Reads the textarea, splits lines, executes regex sanitization (strips formatting tokens such as `/:[a-zA-Z0-9_-]+:/g`), writes the sanitized array to `localStorage['scratchboard_cache']`, re-paints the Board Canvas, collapses the editor drawer, and clears the input. |
| **2** | **Choose File** | `<label for="scratchboardImport">` | `<label>` + `<input type="file" id="scratchboardImport" hidden accept=".txt">` | Triggers the native system file selector for `.txt` files. Automatically resets its value on click so re-selecting the same file reliably fires the change event without accidental state loss. |
| **3** | **Import** | `#scratchboardImportBtn` | `<button>` | Reads the selected file using `FileReader`, validates MIME and size limits (max 1MB), extracts non-empty lines, overwrites the active cache in `localStorage`, and immediately updates the Board Canvas. |
| **4** | **Export** | `onclick="exportScratchBoard()"` | `<button>` | Bundles all active canvas notes into a plain text Blob (`text/plain`), dynamically generates a download anchor, and triggers an instant download of `scratchboard_YYYYMMDD_HHMM.txt`. |

---

## File Structure

```text
scratch-board/
├── css/
│   └── scratchboard.css          # Scoped component tokens, canvas, and editor styles
├── js/
│   └── scratchboard.js           # Decoupled component engine, storage, and API hooks
├── index.html                    # Standalone preview testbench and diagnostic harness
├── scratchboard.html             # Drop-in HTML component snippet
├── LICENSE                       # MIT License
└── README.md                     # Comprehensive technical documentation
```

---

## Quick Start Integration

### 1. Link the Stylesheet
Place `css/scratchboard.css` in your document's `<head>`:

```html
<link rel="stylesheet" href="css/scratchboard.css">
```

### 2. Embed the Component Markup
Paste the component markup from `scratchboard.html` into your desired page layout or drawer:

```html
<!-- ScratchBoard Complete Component Container -->
<div class="scratchboard-container">
    <h2>ScratchBoard</h2>

    <!-- Operational Notifications Bar -->
    <div id="notifications-scratchboard"></div>

    <span class="scratchboard-explainer">
        ⚠️ Backup your board regularly. Clearing browser data will erase it.<br>
        <i>Explainer: Use the ScratchBoard to save snippets. Quick notes persist line-by-line in browser storage.</i>
    </span>

    <!-- [Part 1] The Board Canvas: Live Line-by-Line Persistent Rendering Surface -->
    <div id="scratchboard-list" class="roundit"></div>

    <!-- [Part 2] The Staging Editor Toggle & Container -->
    <label for="editor-scratchboard-toggle" class="btn-scratchboard roundit">Editor</label>
    <input type="checkbox" id="editor-scratchboard-toggle" hidden>

    <div id="editor-scratchboard">
        <textarea rows="15" id="text-input-scratchboard" class="padding-small" placeholder="Enter notes here, one per line..."></textarea>

        <!-- Standard 4-Button Controls Container -->
        <div class="scratchboard-controls" style="margin-top: 8px;">
            <button id="save-btn-scratchboard" class="btn-scratchboard roundit">Save</button>
            <label for="scratchboardImport" class="btn-scratchboard roundit" style="cursor: pointer; display: inline-flex;">Choose File</label>
            <input type="file" id="scratchboardImport" hidden accept=".txt">
            <button id="scratchboardImportBtn" class="btn-scratchboard roundit" style="border: none;">Import</button>
            <button onclick="exportScratchBoard()" class="btn-scratchboard roundit" style="border: none;">Export</button>
        </div>
    </div>
</div>
```

### 3. Load the Component Script
Include `js/scratchboard.js` at the bottom of `<body>` or with `defer`:

```html
<script src="js/scratchboard.js"></script>
```

---

## Developer API & Global Hooks

`js/scratchboard.js` executes defensive initialization automatically on `DOMContentLoaded` (or immediately if injected asynchronously). It exposes three global functions on `window` for deep host application integration:

### 1. `window.init_scratchboard()`
Re-queries all DOM elements, re-attaches event listeners, loads current `localStorage` cache, and re-renders the Canvas.
- **When to use**: Call this whenever the component HTML is dynamically injected into the DOM after page load (e.g., AJAX navigation, SPA route mounting, HTMX swaps, modal drawers, or Web Component lifecycle callbacks).

```javascript
// Example: Re-initializing after an asynchronous view swap
fetch('/views/scratchboard.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById('tool-drawer').innerHTML = html;
        window.init_scratchboard(); // Binds listeners and hydrates canvas
    });
```

### 2. `window.exportScratchBoard()`
Programmatically triggers the export and download of all current board notes as a timestamped text file without requiring the user to open the editor drawer.
- **When to use**: Bind this to application-wide menus, backup routines, or header export icons.

```javascript
// Example: Attaching export to an external navigation button
document.getElementById('global-export-notes').addEventListener('click', () => {
    window.exportScratchBoard();
});
```

### 3. `window.clearScratchboardCache()`
Clears the `scratchboard_cache` key from `localStorage`, empties the in-memory array, repaints the Board Canvas to its empty state (`"No notes available."`), and posts a notification.
- **When to use**: Call during user logout, profile reset, or from dedicated administration settings.

```javascript
// Example: Programmatic board reset with confirmation
function handleBoardReset() {
    if (confirm("Are you sure you want to erase all scratchboard notes?")) {
        window.clearScratchboardCache();
    }
}
```

---

## Integration Recipes

### Recipe A: Keyboard Shortcut / Command Palette Trigger
Bind hotkeys (e.g. `Alt + /` or `Ctrl + Shift + S`) to toggle the ScratchBoard editor from anywhere in your web app:

```javascript
document.addEventListener('keydown', (e) => {
    // Check for Alt + /
    if (e.altKey && e.key === '/') {
        e.preventDefault();
        const toggle = document.getElementById('editor-scratchboard-toggle');
        if (toggle) {
            toggle.checked = !toggle.checked;
            toggle.dispatchEvent(new Event('change'));
            if (toggle.checked) {
                document.getElementById('text-input-scratchboard')?.focus();
            }
        }
    }
});
```

### Recipe B: Programmatic Note Injection
Inject snippets from incoming emails, chat feeds, or ticket payloads directly into the ScratchBoard:

```javascript
function addSnippetToScratchBoard(snippetText) {
    try {
        const cache = JSON.parse(localStorage.getItem('scratchboard_cache')) || [];
        const cleanSnippet = snippetText.replace(/:[a-zA-Z0-9_-]+:/g, '').trim();
        if (cleanSnippet) {
            cache.push(cleanSnippet);
            localStorage.setItem('scratchboard_cache', JSON.stringify(cache));
            window.init_scratchboard(); // Re-render live canvas
        }
    } catch (err) {
        console.error('Failed to append snippet:', err);
    }
}
```

---

## Theming & CSS Custom Properties

ScratchBoard utilizes isolated CSS custom properties prefixed with `--sb-*`. These default to an aurora dark palette, but seamlessly inherit host variables if defined:

```css
:root {
  /* Surface Tokens */
  --sb-bg-deep: var(--bg-deep, #0f172a);        /* Canvas & container background */
  --sb-bg-surface: var(--bg-surface, #1e293b);  /* Textarea editor background */
  --sb-bg-elevated: var(--bg-elevated, #334155);/* Control button backgrounds */

  /* Accent & Highlight Tokens */
  --sb-primary: var(--primary, #38bdf8);        /* Button hover & focus highlight */
  --sb-primary-glow: var(--primary-glow, rgba(56, 189, 248, 0.4));
  --sb-success: var(--success, #4ade80);        /* Save button & success notices */
  --sb-error: var(--error, #f87171);            /* Error notices */

  /* Typography & Borders */
  --sb-text-primary: var(--text-primary, #f8fafc);
  --sb-text-secondary: var(--text-secondary, #94a3b8);
  --sb-text-muted: var(--text-muted, #64748b);
  --sb-border: var(--border, rgba(148, 163, 184, 0.1));
  --sb-glass-border: var(--glass-border, rgba(255, 255, 255, 0.1));
}
```

To adapt ScratchBoard to a light mode or branded theme, simply override these variables in your parent stylesheet:

```css
/* Example: Light Theme Override */
.my-light-app .scratchboard-container {
  --sb-bg-deep: #f8fafc;
  --sb-bg-surface: #ffffff;
  --sb-bg-elevated: #e2e8f0;
  --sb-text-primary: #0f172a;
  --sb-text-secondary: #475569;
  --sb-text-muted: #94a3b8;
  --sb-border: rgba(15, 23, 42, 0.1);
}
```

---

## License

This project is licensed under the **MIT License**.

### Attribution
* **Author:** vatofichor
* **GitHub:** [vatofichor](https://github.com/vatofichor)
* **Requirement:** The copyright notice and license must remain with the software in its parts or whole. This is a non-viral license; it does not apply to your entire product, only to the code sourced from this repository.

```text
MIT License

Copyright (c) 2026:
vatofichor     [>_<]
& Assisted By Gemini Antigravity /|\  

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
