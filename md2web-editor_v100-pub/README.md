# md2web-editor

A lightweight, high-density, vanilla JS/CSS Markdown editor component. Features a dynamic formatting toolbar, automatic list indentation and bullet continuation, tab indent/dedent bindings, and an integrated regex-powered Find & Replace dialog.

Dependencies:
Extracted from the origin project: [ContactFlow](https://github.com/vatofichor/ContactFlow).

[View Core Framework: md2web-plugin_v1-pub](https://github.com/vatofichor/core-plugins/tree/main/md2web-plugin_v1-pub)

[View Plugin: reflexive-dom-framework](https://github.com/vatofichor/reflexive-dom-framework)
---

## Part 1: For End Users (Quick Start & Usage)

You do **not** need a local web server, Node.js, databases, PHP, or Python to run this editor. It is entirely serverless and runs directly in your web browser.

### How to Run Locally
1. Download or clone this repository folder to your computer.
2. Locate the `index.html` file in the root of the folder.
3. Double-click `index.html` to open it immediately in any standard web browser (Chrome, Firefox, Edge, Safari, etc.).
4. Start typing!

### Editor Controls & Shortcuts
- **Formatting Toolbar**: Use the buttons above the text area to easily format text (Bold, Italic, Strikethrough, insert code blocks, links, lists, or horizontal dividers).
- **Tab Indentation**: Press <kbd>Tab</kbd> to indent a line, and <kbd>Shift</kbd> + <kbd>Tab</kbd> to remove indentation.
- **Auto-List Continuation**: Press <kbd>Enter</kbd> while typing in a bullet list, numbered list, or task list. The editor will automatically generate the next list prefix (e.g., `- [ ]` or `2.`) for you on the new line.
- **Find & Replace**: Click the **Find & Replace** button or press <kbd>Alt</kbd> + <kbd>H</kbd> to open the search modal. 
- **Focus Editor**: Press <kbd>Alt</kbd> + <kbd>N</kbd> to jump straight to the text editing area.
- **Ctrl+S Safe Block**: Pressing <kbd>Ctrl</kbd> + <kbd>S</kbd> inside the editor is intercepted to prevent accidental browser webpage save prompts.

---

## Part 2: For Techies (Developer Integration Guide)

### 1. File Structure
To use this component in your project, copy the `editor` directory to your workspace:
```text
your-project/
├── editor/
│   ├── css/
│   │   ├── main.css
│   │   ├── elements.css
│   │   └── modifiers.css
│   └── js/
│       ├── clipboard_actions.js
│       ├── meta_copy_fields.js
│       ├── find_replace.js
│       ├── md_editor.js
│       ├── md-toolbar-tool-generator.js
│       ├── md-toolbar-fixed-scroll.js
│       └── editor_init.js
└── index.php (or index.html)
```

### 2. Static HTML / JavaScript Perspective
To integrate, declare the markup container and load the required styles and scripts in order.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My App</title>
    <!-- 1. Stylesheets -->
    <link rel="stylesheet" href="editor/css/main.css" type="text/css">
    <link rel="stylesheet" href="editor/css/elements.css" type="text/css">
    <link rel="stylesheet" href="editor/css/modifiers.css" type="text/css">
</head>
<body>

    <!-- 2. Required DOM Layout -->
    <form id="notesform">
        <!-- Optional Find & Replace trigger button -->
        <button type="button" onclick="FindReplace.toggle()">Find & Replace (Alt+H)</button>
        
        <!-- Toolbar is populated dynamically here -->
        <div id="md-toolbar"></div>
        
        <!-- Textarea must match the ID 'resolution' -->
        <textarea id="resolution" class="case-notes-input" name="notesform" rows="20"></textarea>
    </form>

    <!-- 3. Editor Scripts (Load in this sequence) -->
    <script src="editor/js/clipboard_actions.js" type="text/javascript"></script>
    <script src="editor/js/meta_copy_fields.js" type="text/javascript"></script>
    <script src="editor/js/find_replace.js" type="text/javascript"></script>
    <script src="editor/js/md_editor.js" type="text/javascript"></script>
    <script src="editor/js/md-toolbar-tool-generator.js" type="text/javascript"></script>
    <script src="editor/js/md-toolbar-fixed-scroll.js" type="text/javascript"></script>
    <script src="editor/js/editor_init.js" type="text/javascript"></script>
    
    <!-- 4. Prevent Default Browser Save (Optional) -->
    <script>
        document.addEventListener('keydown', function (event) {
            if (event.ctrlKey && event.key === 's') {
                event.preventDefault();
            }
        });
    </script>
</body>
</html>
```

### 3. PHP Project Integration
In PHP MVC or templated frameworks, render the component by referencing the relative module paths:

```php
<!-- View Template: editor-section.php -->
<link rel="stylesheet" href="<?php echo BASE_URL; ?>/editor/css/main.css">
<link rel="stylesheet" href="<?php echo BASE_URL; ?>/editor/css/elements.css">
<link rel="stylesheet" href="<?php echo BASE_URL; ?>/editor/css/modifiers.css">

<form id="notesform">
    <button type="button" class="tool-button" onclick="FindReplace.toggle()">🔍 Find & Replace (Alt+H)</button>
    <div id="md-toolbar"></div>
    <textarea id="resolution" class="case-notes-input" name="notesform" rows="24"></textarea>
</form>

<script src="<?php echo BASE_URL; ?>/editor/js/clipboard_actions.js"></script>
<script src="<?php echo BASE_URL; ?>/editor/js/meta_copy_fields.js"></script>
<script src="<?php echo BASE_URL; ?>/editor/js/find_replace.js"></script>
<script src="<?php echo BASE_URL; ?>/editor/js/md_editor.js"></script>
<script src="<?php echo BASE_URL; ?>/editor/js/md-toolbar-tool-generator.js"></script>
<script src="<?php echo BASE_URL; ?>/editor/js/md-toolbar-fixed-scroll.js"></script>
<script src="<?php echo BASE_URL; ?>/editor/js/editor_init.js"></script>
```

---

## Customization Binds
The scripts expect specific ID selectors to bind listeners and generate markup:
- `#notesform` – Form wrapper block.
- `#md-toolbar` – Flex layout block that receives generated buttons.
- `#resolution` – Textarea element receiving input.

To copy content programmatically, invoke `copy_starNotes_fields()` or access the raw text directly from the `textarea` DOM reference.

---

## License
Distributed under the MIT License. See individual files for licensing notices.

---
# Copyright (c) 2026:
# vatofichor - Sebastian Mass     [>_<]
# & Assisted By Gemini Antigravity /|\  
