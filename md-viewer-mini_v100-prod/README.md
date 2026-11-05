# md-viewer-mini

A turnkey, zero-dependency, single-script Markdown reader and drop-in SPA utility. Powered by the [`md2web-plugin`](https://github.com/vatofichor/core-plugins/tree/main/md2web-plugin_v1-pub) compiler, `md-viewer-mini` converts Markdown files into high-density, plain-paper formatted web documents with live URL query sideloading, an on-page programmatic API, and actionable CORS diagnostics.

---

## Overview

`md-viewer-mini` is designed to be dropped directly into any folder, sub-route, or web project to provide an immediate documentation viewer with zero build steps, zero node dependencies, and zero configuration:

- **Universal Drop-In**: Works as a standalone single-page application (`index.html`) or as an embedded JavaScript module (`js/md-viewer-mini.js`).
- **Filesystem & URL Query Sideloading**: View any relative document instantly via `?file=path/to/file.md`.
- **Programmatic On-Page API**: Full global `MdViewer` object exposing `load()`, `render()`, `openFilePicker()`, and theme toggles for custom host applications.
- **Classic Plain-Paper Aesthetic**: High-contrast, distraction-free styling (crisp black-on-white and white-on-black dark mode) with system font stacks and zero external font requests.
- **Fail-Case & CORS Resilience**: Built-in detection for `file://` protocol restrictions with actionable local server instructions and an in-memory `FileReader` file picker that completely circumvents browser CORS errors.

---

## Installation & Deployment

### Method 1: Turnkey Route Drop-In (Recommended)
Copy the distribution files into any folder or route directory:

```
your-project/
├── docs/
│   ├── index.html
│   ├── css/
│   │   └── md-viewer-mini.css
│   └── js/
│       └── md-viewer-mini.js
├── README.md
└── guides/
    └── setup.md
```

Access the route directly in your browser or local server:
- Open `docs/index.html`
- Or pass a document query: `docs/index.html?file=../guides/setup.md`

### Method 2: Filesystem-Routed Module (PHP / LAMP Architecture)
In modular PHP environments, drop into your `modules` directory without leading slashes:

```php
// modules/docs/index.php
<?php
// Relative path to root assets
$assetBase = '../../';
?>
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documentation Viewer</title>
    <link rel="stylesheet" href="<?php echo $assetBase; ?>modules/docs/css/md-viewer-mini.css">
    <script src="<?php echo $assetBase; ?>modules/docs/js/md-viewer-mini.js"></script>
</head>
<body>
    <header class="viewer-header">
        <span id="doc-title" class="doc-title">Docs</span>
        <button type="button" class="btn" onclick="MdViewer.openFilePicker()">Open File</button>
        <button type="button" class="btn" onclick="MdViewer.toggleTheme()">Theme</button>
    </header>
    <main id="viewer-container" class="viewer-main"></main>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            MdViewer.init({
                container: '#viewer-container',
                titleElement: '#doc-title',
                autoLoadQuery: true,
                queryParam: 'file'
            });
        });
    </script>
</body>
</html>
```

### Method 3: Standalone Engine Ingestion (Headless)
Include `js/md-viewer-mini.js` in any custom web layout or webview:

```html
<script src="js/md-viewer-mini.js"></script>
<script>
    // Programmatic Markdown rendering
    MdViewer.render('# My Document\nRendered directly via JavaScript.');
</script>
```

---

## Programmatic API Reference (`window.MdViewer`)

The engine exports the `MdViewer` namespace globally (and supports CommonJS / AMD loaders):

| Method | Parameters | Description |
|---|---|---|
| `MdViewer.init(options)` | `options: Object` | Initializes container, title binding, theme listeners, and auto-query ingestion. |
| `MdViewer.load(source)` | `source: string \| File \| Blob` | Polymorphic loader. Accepts a relative path/URL, raw Markdown string, or File/Blob object. |
| `MdViewer.render(md, [path])` | `md: string`, `path: string` | Parses Markdown into HTML, injects into the container, and updates header/page title. |
| `MdViewer.openFilePicker()` | *none* | Programmatically launches native file dialog and reads file in-memory (bypassing CORS). |
| `MdViewer.setTheme(theme)` | `'dark' \| 'light'` | Sets and persists active theme in `localStorage` (`data-theme` attribute). |
| `MdViewer.toggleTheme()` | *none* | Toggles between `'dark'` and `'light'` mode. |
| `MdViewer.getTheme()` | *none* | Returns currently active theme string. |
| `MdViewer.parseMarkdown(md, [relPath])` | `md: string`, `relPath: string` | Direct access to underlying `md2web` parsing routine. |

### Configuration Options (`MdViewer.init`)
```javascript
MdViewer.init({
    container: '#viewer-container',     // Target container selector or DOM element
    titleElement: '#doc-title',         // Header title element selector or DOM element
    autoLoadQuery: true,                // Automatically check window.location.search
    queryParam: 'file',                 // Query string parameter key (e.g., ?file=doc.md)
    defaultTitle: 'Markdown Viewer'     // Default fallback title
});
```

---

## URL Parameters & Sideloading

`md-viewer-mini` supports deep-linking and dynamic document sideloading:

- **Single Document**: `index.html?file=README.md`
- **Subdirectory Document**: `index.html?file=specs/architecture.md`
- **Relative Parent Document**: `index.html?file=../notes/changelog.md`
- **Anchor Heading Navigation**: `index.html?file=README.md#features`

Heading slugs are automatically normalized into hyphenated lowercase anchor identifiers. Clicking an on-page anchor link smoothly scrolls the document without obscuring content behind sticky headers.

---

## CORS & Local `file://` Diagnostics

When viewing Markdown files locally via the `file://` protocol, modern web browsers enforce strict Same-Origin / CORS policies that block standard `fetch()` calls. 

`md-viewer-mini` detects this condition automatically and presents an actionable recovery interface:

1. **Local File Picker Button**: Clicking **"Open via File Picker"** loads the file directly into memory using the native HTML5 `FileReader` API. Because no network request is made, `FileReader` **never triggers CORS restrictions** under `file://`.
2. **Open Raw File**: Provides a direct target link to view the unparsed source in a new tab.
3. **Local Micro-Server Command**: Displays standard zero-install server commands to host the directory:
   ```bash
   php -S localhost:8000
   ```
   ```bash
   python -m http.server 8000
   ```

---

## Markdown Syntax Support

The underlying `md2web` compiler handles standard documentation structures:
- **Headings**: `# H1` through `###### H6` with automated anchor slugging.
- **Lists**: Bullet points (`*`, `-`) and numeric sequences.
- **Task Checklists**: `[ ]` (unchecked checkbox) and `[x]` (checked checkbox).
- **Tables**: GitHub-flavored markdown tables with column alignment (`:---`, `:---:`, `---:`).
- **Fenced Codeblocks & Inline Code**: `` `code` `` and fenced triple-backtick blocks.
- **Blockquotes & Horizontal Rules**: `>` callouts and `---` dividers.
- **LaTeX Math & Greek Entities**: Single dollar inline formulas (`$E = mc^2$`) and macros (`\alpha`, `\beta`, etc.).
- **Relative Asset Resolution**: Automatically resolves relative image paths against the loaded document path.

---

## Project Structure

- `js/md-viewer-mini.js`: Core UMD reader engine, `md2web` parser, and `MdViewer` API.
- `css/md-viewer-mini.css`: Plain-paper, high-density stylesheet (black/white high contrast).
- `index.html`: Turnkey single-page application wrapper.
- `README.md`: Installation and API specification guide.

---

## License
This project is licensed under the **MIT License**.

### Attribution
* **Author:** Sebastian Mass
* **GitHub:** [vatofichor](https://github.com/vatofichor)
* **Core Parser Engine:** [`md2web-plugin_v1-pub`](https://github.com/vatofichor/core-plugins/tree/main/md2web-plugin_v1-pub)
* **Requirement:** The copyright notice and license must remain with the software in its parts or whole. This is a non-viral license; it does not apply to your entire product, only to the code sourced from this repository.

# Copyright (c) 2026:
# vatofichor - Sebastian Mass     [>_<]
# & Assisted By Gemini Antigravity \|\

