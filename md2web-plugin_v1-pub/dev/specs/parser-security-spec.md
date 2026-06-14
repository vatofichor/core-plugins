# Specification: Parser Integration & Security Guidelines

This document specifies the security requirements, limits, and configuration guidance for deploying the `md2web-plugin` parser in standard web server environments.

---

## 1. SQL Injection (SQLi) Prevention
The parser operates strictly in-memory on strings and performs no database operations. 

### Guidelines for Integrators
- When storing raw Markdown or compiled HTML in a database (such as MySQL/PostgreSQL in a PHP/Node server environment), **never concatenate input into query strings**.
- **Always use prepared statements / parameter binding**:
  ```php
  // Example PDO Binding in PHP
  $stmt = $pdo->prepare("INSERT INTO lessons (title, html_content) VALUES (:title, :content)");
  $stmt->execute([
      'title' => $lessonTitle,
      'content' => $compiledHtml // Output from md2web
  ]);
  ```

---

## 2. CORS (Cross-Origin Resource Sharing) Configuration
CORS headers dictate browser permission scopes for loading content across different domains. The compiler has no script access to write headers.

### Guidelines for Integrators
To make compiled HTML assets or manifests available to external platforms, configure CORS headers on the web server (e.g. Apache `.htaccess` or Nginx configuration):

#### Apache Configuration
```apache
<IfModule mod_headers.c>
    # Restrict to trusted frontends, or use * for public CDN delivery
    Header set Access-Control-Allow-Origin "https://trusted-app.com"
    Header set Access-Control-Allow-Methods "GET"
</IfModule>
```

---

## 3. Cross-Site Scripting (XSS) Mitigation
To guarantee browser rendering safety, the parser enforces three structural constraints during markdown translation:

### 3.1. Basic HTML Tag Escaping
All raw input characters `&`, `<`, and `>` are replaced with safe HTML entities (`&amp;`, `&lt;`, `&gt;`) before any rendering regex triggers. This prevents users from inputting arbitrary `<script>` tags, custom HTML elements, or iframes.

### 3.2. Attribute Escape Constraint
When generating attributes (`href`, `src`, `alt`) for links and images, double quotes `"` and single quotes `'` must be transformed into `&quot;` and `&#39;`. This stops malicious attribute breakouts (e.g. injecting `onclick="..."`).

#### Implementation
```javascript
function escapeAttribute(str) {
    if (!str) return '';
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
```

### 3.3. URL Scheme Whitelist Filter
The parser validates link destinations and image sources against a strict protocol whitelist:
- **Allowed**: 
  - Relative URLs (e.g. `/path/to/resource`, `../images/pic.png`, `file.html`).
  - Explicit secure web protocols: `https://`.
  - Standard web protocols: `http://`.
- **Blocked**:
  - Scripting URIs: `javascript:`, `data:`, `vbscript:`.
  - Blocked links are automatically resolved to a safe anchor fallback (`#`) or stripped.

#### Implementation
```javascript
function sanitizeUrl(url) {
    if (!url) return '#';
    // Strip control characters and whitespaces to prevent scheme bypasses like "java\nscript:"
    var cleaned = url.replace(/[\x00-\x20\s]/g, '');
    var protoMatch = cleaned.match(/^([a-z0-9+.\-]+):/i);
    if (protoMatch) {
        var proto = protoMatch[1].toLowerCase();
        if (proto !== 'http' && proto !== 'https') {
            return '#';
            }
        }
    return url.replace(/^\s+|\s+$/g, '');
}
```

---

## 4. RAM & Session Safety
The parser is a stateless functional utility:
- It maintains **no persistent session data** in local memory.
- It does **not read or write browser cookies**, local storage, or session storage.
- It does **not cache state variables** across calls.
- There are no runtime sessions in RAM to intercept.

# Copyright (c) 2026:
# vatofichor - Sebastian Mass     [>_<]
# & Assisted By Gemini Antigravity \|\
