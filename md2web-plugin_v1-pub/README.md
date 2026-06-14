# md2web-plugin

A lightweight, zero-dependency, universally importable Markdown to HTML parser and compiler. Designed for premium styling systems, stateless execution, and cross-platform compatibility across web browsers, Node.js modules, and native Windows Script Host environments.

---

## Features

### 1. Multi-Environment Execution (UMD)
The library is wrapped in a Universal Module Definition (UMD) container, allowing it to adapt dynamically to its environment:
- **Web Browsers**: Load as a traditional global script (attaches to `window.md2web`) or import as an ES module.
- **Node.js**: Require natively as a CommonJS module (`const md2web = require('./md2web')`).
- **Windows Script Host (`cscript.exe`)**: Executes JScript (ES3) directly from the Windows command line, requiring zero setup or external runtimes.

### 2. Supported Markdown Syntax
The parsing engine translates standard Markdown constructs into cleanly structured HTML tags:
- **Headings**: `# H1` through `###### H6` with accent line support.
- **Typography**: Bold (`**text**`), Italics (`*text*` / `_text_`), and Monospace code (`` `code` ``).
- **Bullet Lists**: Asterisk `*` or hyphen `-` item entries.
- **Blockquotes**: Nesting callouts via `>` characters.
- **Tables**: Strict table structure validation supporting cell alignments (`:---`, `:---:`, `---:`).
- **LaTeX Math & Greek Character Injection**: Inline formulas wrapped in single dollar signs (`$x = y + z$`) and automatic Greek character macro expansions (e.g., `\alpha` -> `&alpha;`).
- **Relative Path Resolvers**: Translates relative sub-folder assets and images dynamically based on document context.

### 3. Integrated Security & Hardening
Designed for public environments with robust client-side sanitisation:
- **Tag Escaping**: Escapes raw `<` and `>` tags to neutralize raw input markup insertion.
- **Attribute Escaping**: Automatically escapes double and single quotes inside generated attributes (`href`, `src`, `alt`) to block quote breakout and inline script injection (`onclick`, `onerror`).
- **Protocol Whitelisting**: Limits link and image schemes to relative paths and explicit secure web protocols (`http://` and `https://`). Scripting protocols (such as `javascript:`, `data:`, `vbscript:`) are automatically blocked and mapped to safe anchor fallbacks (`#`).

---

## Quick Start

### Web Browser
Include the script in your page and invoke the parser on any markdown string:
```html
<script src="src/md2web.js"></script>
<script>
    var markdown = "# Hello World\nThis is **bold**.";
    var html = md2web.parseMarkdown(markdown);
    document.getElementById('content').innerHTML = html;
</script>
```

### Node.js
Import as a CommonJS library:
```javascript
const md2web = require('./src/md2web.js');
const html = md2web.parseMarkdown("# Title\nContent here");
```

### Windows Script Host Command Line
Compile markdown documents to HTML locally on Windows without installing Node.js or Python:
```cmd
cscript.exe /Nologo src\md2web.js input.md output.html
```

---

## Project Structure
- [src/md2web.js](file:///d:/Dev/_PLUGIN-DEV/md2web-plugin/src/md2web.js): Core UMD compiler module.
- [dev/specs/markdown-spec.md](file:///d:/Dev/_PLUGIN-DEV/md2web-plugin/dev/specs/markdown-spec.md): Markdown formatting reference guide.
- [dev/specs/parser-security-spec.md](file:///d:/Dev/_PLUGIN-DEV/md2web-plugin/dev/specs/parser-security-spec.md): Integration guidelines, database query safety, and CORS configurations.
- [dev/specs/wsh-jscript-spec.md](file:///d:/Dev/_PLUGIN-DEV/md2web-plugin/dev/specs/wsh-jscript-spec.md): Technical spec for JScript engine compatibility.

---

## License
This project is licensed under the **MIT License**.

### Attribution
* **Author:** Sebastian Mass
* **GitHub:** [vatofichor](https://github.com/vatofichor)
* **Requirement:** The copyright notice and license must remain with the software in its parts or whole. This is a non-viral license; it does not apply to your entire product, only to the code sourced from this repository.

# Copyright (c) 2026:
# vatofichor - Sebastian Mass     [>_<]
# & Assisted By Gemini Antigravity \|\
