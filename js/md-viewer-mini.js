/*
  md-viewer-mini.js - Simplex SPA Markdown Viewer Engine & Minimal API
  Integrates md2web Markdown converter with programmatic on-page MdViewer API.

  Copyright (c) 2026:
  vatofichor - Sebastian Mass     [>_<]
  & Assisted By Gemini Antigravity \|\
*/

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.MdViewer = factory();
    }
}(typeof self !== 'undefined' ? self : (typeof window !== 'undefined' ? window : this), function() {
    'use strict';

    /* ==========================================================================
       1. Core md2web Parsing Engine
       ========================================================================== */

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"']/g, function(c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function escapeAttribute(str) {
        if (!str) return '';
        return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function sanitizeUrl(url) {
        if (!url) return '#';
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

    function resolveUrl(url, articlePath) {
        if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0 || url.indexOf('/') === 0) {
            return url;
        }
        if (!articlePath) return url;
        var parts = articlePath.split('/');
        parts.pop(); // remove file name

        var urlParts = url.split('/');
        while (urlParts[0] === '..') {
            urlParts.shift();
            if (parts.length > 0) {
                parts.pop();
            }
        }
        if (parts.length > 0) {
            return parts.join('/') + '/' + urlParts.join('/');
        } else {
            return urlParts.join('/');
        }
    }

    function buildTable(rows) {
        var html = '<table>';
        var alignments = [];
        var hasHeader = false;

        if (rows.length > 1) {
            hasHeader = true;
            var dividerCells = rows[1].replace(/^\||\|$/g, '').split('|');
            for (var k = 0; k < dividerCells.length; k++) {
                var cell = dividerCells[k].trim();
                if (cell.indexOf(':') === 0 && cell.lastIndexOf(':') === cell.length - 1) {
                    alignments.push('center');
                } else if (cell.lastIndexOf(':') === cell.length - 1) {
                    alignments.push('right');
                } else {
                    alignments.push('left');
                }
            }
        }

        for (var i = 0; i < rows.length; i++) {
            if (i === 1 && hasHeader) continue;

            var row = rows[i];
            var cells = row.replace(/^\||\|$/g, '').split('|');

            html += '<tr>';
            for (var j = 0; j < cells.length; j++) {
                var cellInlineCodes = [];
                var cellHtml = cells[j].trim();
                cellHtml = cellHtml.replace(/``([\s\S]*?)``|`([^`\n]+)`/g, function(match, codeDouble, codeSingle) {
                    var code = (codeDouble !== undefined && codeDouble !== "") ? codeDouble : codeSingle;
                    cellInlineCodes.push('<code>' + code + '</code>');
                    return '<!--CELLCODE-' + (cellInlineCodes.length - 1) + '-->';
                });
                cellHtml = cellHtml
                    .replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*([^\*]+)\*/g, '<em>$1</em>')
                    .replace(/\$([^\$]+)\$/g, '<span class="math">$1</span>')
                    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, function(match, text, href) {
                        var rawHref = href.trim();
                        var isAnchor = rawHref.indexOf('#') !== -1 || rawHref.indexOf('%#') === 0;
                        var cleanedHref = rawHref.replace(/^%#/, '#');
                        var safeHref = escapeAttribute(sanitizeUrl(cleanedHref));
                        var targetAttr = isAnchor ? '' : ' target="_blank" rel="noopener noreferrer"';
                        return '<a href="' + safeHref + '"' + targetAttr + '>' + text + '</a>';
                    });
                for (var c = 0; c < cellInlineCodes.length; c++) {
                    cellHtml = cellHtml.replace('<!--CELLCODE-' + c + '-->', cellInlineCodes[c]);
                }

                var align = alignments[j] || 'left';
                var styleAttr = ' style="text-align: ' + align + ';"';

                if (i === 0 && hasHeader) {
                    html += '<th' + styleAttr + '>' + cellHtml + '</th>';
                } else {
                    html += '<td' + styleAttr + '>' + cellHtml + '</td>';
                }
            }
            html += '</tr>';
        }
        html += '</table>';
        return html;
    }

    function parseMarkdown(md, relativePath) {
        if (!md) return '';

        var html = md.replace(/\r\n/g, '\n');

        // Escape raw HTML characters
        html = html
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // 1. Protect code blocks from parsing
        var codeBlocks = [];
        html = html.replace(/```(\w*)\n([\s\S]*?)```/g, function(match, lang, code) {
            var placeholder = '<!--CODEBLOCK-' + codeBlocks.length + '-->';
            var cleanCode = code
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>');
            var langClass = lang ? ' class="language-' + escapeAttribute(lang) + '"' : '';
            codeBlocks.push('<pre><code' + langClass + '>' + cleanCode.trim() + '</code></pre>');
            return placeholder;
        });

        // 1b. Protect inline code
        var inlineCodePlaceholders = [];
        html = html.replace(/``([\s\S]*?)``|`([^`\n]+)`/g, function(match, codeDouble, codeSingle) {
            var code = (codeDouble !== undefined && codeDouble !== "") ? codeDouble : codeSingle;
            var placeholder = '<!--INLINECODE-' + inlineCodePlaceholders.length + '-->';
            var cleanCode = code
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>');
            inlineCodePlaceholders.push('<code>' + cleanCode + '</code>');
            return placeholder;
        });

        // 2. Parse Markdown Tables
        var tableBlocks = [];
        var lines = html.split('\n');
        var newLines = [];
        var i = 0;
        while (i < lines.length) {
            var line = lines[i];
            var trimmed = line.trim();
            
            if (trimmed.indexOf('|') === 0 && i + 1 < lines.length) {
                var nextLine = lines[i + 1].trim();
                var isDivider = nextLine.indexOf('|') === 0 && /^\|[ \t|:\-]+$/.test(nextLine) && nextLine.indexOf('-') !== -1;
                
                if (isDivider) {
                    var tableRows = [];
                    tableRows.push(trimmed);
                    tableRows.push(nextLine);
                    var j = i + 2;
                    while (j < lines.length) {
                        var consecutiveLine = lines[j].trim();
                        if (consecutiveLine.indexOf('|') === 0) {
                            tableRows.push(consecutiveLine);
                            j++;
                        } else {
                            break;
                        }
                    }
                    tableBlocks.push(buildTable(tableRows));
                    newLines.push('<!--TABLEBLOCK-' + (tableBlocks.length - 1) + '-->');
                    i = j;
                    continue;
                }
            }
            newLines.push(lines[i]);
            i++;
        }
        html = newLines.join('\n');

        // 3. Headings with auto-generated slugs
        html = html.replace(/^[ \t]*(#{1,6})[ \t]+(.*)$/gm, function(match, hashes, text) {
            var level = hashes.length;
            var cleanText = text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/[\*_`]/g, '').trim();
            var slug = cleanText.toLowerCase()
                .replace(/[^\w\s\-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');
            return '<h' + level + ' id="' + slug + '">' + text + '</h' + level + '>';
        });

        // 4. Blockquotes
        html = html.replace(/^[ \t]*&gt;[ \t]*(.*)$/gm, '<blockquote>$1</blockquote>');
        html = html.replace(/<\/blockquote>\n<blockquote>/g, '\n');

        // 5. Horizontal rules
        html = html.replace(/^[ \t]*(?:---|\*\*\*|___)[ \t]*$/gm, '<hr>');

        // 6. Lists
        html = html.replace(/^[ \t]*[\*\-][ \t]+(.*)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');
        html = html.replace(/<\/ul>\n<ul>/g, '');

        // 7. Math symbols inline
        html = html.replace(/\$([^\$]+)\$/g, '<span class="math">$1</span>');

        // 8. Bold & Italic
        html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
        html = html.replace(/_([^\s_][^\n_]*?[^\s_]|[^\s_])_/g, '<em>$1</em>');

        // 8b. Images with relative URL resolution
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, function(match, alt, src) {
            var sanitizedSrc = sanitizeUrl(src);
            var resolvedSrc = resolveUrl(sanitizedSrc, relativePath);
            return '<img src="' + escapeAttribute(resolvedSrc) + '" alt="' + escapeAttribute(alt) + '" class="doc-image">';
        });

        // 8c. Markdown Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function(match, text, href) {
            var rawHref = href.trim();
            var isAnchor = rawHref.indexOf('#') !== -1 || rawHref.indexOf('%#') === 0;
            var cleanedHref = rawHref.replace(/^%#/, '#');
            var safeHref = escapeAttribute(sanitizeUrl(cleanedHref));
            var targetAttr = isAnchor ? '' : ' target="_blank" rel="noopener noreferrer"';
            return '<a href="' + safeHref + '"' + targetAttr + '>' + text + '</a>';
        });

        // 9. Paragraph wrapping
        var paragraphs = html.split(/\n\n+/);
        for (var pIdx = 0; pIdx < paragraphs.length; pIdx++) {
            var p = paragraphs[pIdx].trim();
            if (p.indexOf('<h') === 0 || p.indexOf('<blockquote') === 0 || p.indexOf('<ul') === 0 || 
                p.indexOf('<hr') === 0 || p.indexOf('<!--') === 0 || p.indexOf('<table') === 0) {
                continue;
            }
            paragraphs[pIdx] = '<p>' + p.replace(/\n/g, '<br>') + '</p>';
        }
        html = paragraphs.join('\n\n');

        // 10. Restore code blocks, inline code, and tables
        for (var idx = 0; idx < codeBlocks.length; idx++) {
            html = html.replace('<!--CODEBLOCK-' + idx + '-->', codeBlocks[idx]);
        }
        for (var idxCode = 0; idxCode < inlineCodePlaceholders.length; idxCode++) {
            html = html.replace('<!--INLINECODE-' + idxCode + '-->', inlineCodePlaceholders[idxCode]);
        }
        for (var idxTable = 0; idxTable < tableBlocks.length; idxTable++) {
            html = html.replace('<!--TABLEBLOCK-' + idxTable + '-->', tableBlocks[idxTable]);
        }

        // 11. Task lists [ ] and [x]
        html = html.replace(/\[ \]/g, '<input type="checkbox" disabled class="task-checkbox">');
        html = html.replace(/\[x\]/gi, '<input type="checkbox" checked disabled class="task-checkbox">');

        // 12. Greek and math symbol entities
        html = html
            .replace(/&amp;(\w+);/g, '&$1;')
            .replace(/\\alpha/g, '&alpha;')
            .replace(/\\beta/g, '&beta;')
            .replace(/\\gamma/g, '&gamma;')
            .replace(/\\delta/g, '&delta;')
            .replace(/\\epsilon/g, '&epsilon;')
            .replace(/\\zeta/g, '&zeta;')
            .replace(/\\eta/g, '&eta;')
            .replace(/\\theta/g, '&theta;')
            .replace(/\\iota/g, '&iota;')
            .replace(/\\kappa/g, '&kappa;')
            .replace(/\\lambda/g, '&lambda;')
            .replace(/\\mu/g, '&mu;')
            .replace(/\\nu/g, '&nu;')
            .replace(/\\xi/g, '&xi;')
            .replace(/\\omicron/g, '&omicron;')
            .replace(/\\pi/g, '&pi;')
            .replace(/\\rho/g, '&rho;')
            .replace(/\\sigma/g, '&sigma;')
            .replace(/\\tau/g, '&tau;')
            .replace(/\\upsilon/g, '&upsilon;')
            .replace(/\\phi/g, '&phi;')
            .replace(/\\omega/g, '&omega;')
            .replace(/\\text\{([^\}]+)\}/g, '$1');

        // 13. Restore explicit anchor tags
        html = html.replace(/&lt;a\s+(id|name)="([^"]+)"&gt;&lt;\/a&gt;/g, '<a id="$2" name="$2"></a>');

        return html;
    }

    var md2webEngine = {
        parseMarkdown: parseMarkdown,
        escapeHtml: escapeHtml,
        escapeAttribute: escapeAttribute,
        sanitizeUrl: sanitizeUrl,
        resolveUrl: resolveUrl
    };

    /* ==========================================================================
       2. MdViewer API & State Manager
       ========================================================================== */

    var state = {
        initialized: false,
        containerEl: null,
        titleEl: null,
        currentPath: '',
        currentTheme: 'dark',
        options: {
            container: '#viewer-container',
            titleElement: '#doc-title',
            autoLoadQuery: true,
            queryParam: 'file',
            defaultTitle: 'Markdown Viewer'
        }
    };

    function resolveElement(target) {
        if (!target) return null;
        if (typeof target === 'string') return document.querySelector(target);
        if (target.nodeType) return target;
        return null;
    }

    function init(userOptions) {
        if (userOptions) {
            for (var key in userOptions) {
                if (userOptions.hasOwnProperty(key)) {
                    state.options[key] = userOptions[key];
                }
            }
        }

        state.containerEl = resolveElement(state.options.container);
        state.titleEl = resolveElement(state.options.titleElement);

        // Theme initialization
        var savedTheme = 'dark';
        try {
            savedTheme = localStorage.getItem('theme') || 'dark';
        } catch (_) {}
        setTheme(savedTheme);

        // Smooth scroll for anchor clicks within viewer container
        if (state.containerEl && !state.containerEl.__mdAnchorBound) {
            state.containerEl.__mdAnchorBound = true;
            state.containerEl.addEventListener('click', function(e) {
                var link = e.target.closest('a[href*="#"]');
                if (!link) return;
                var rawHref = link.getAttribute('href') || '';
                var hashIdx = rawHref.indexOf('#');
                if (hashIdx === -1 || hashIdx === rawHref.length - 1) return;

                var targetId = decodeURIComponent(rawHref.substring(hashIdx + 1)).trim();
                var normalizedId = targetId.replace(/-+/g, '-');
                var targetEl = document.getElementById(targetId) ||
                               document.getElementById(normalizedId) ||
                               document.getElementsByName(targetId)[0] ||
                               document.getElementsByName(normalizedId)[0];

                if (!targetEl && state.containerEl) {
                    var headings = state.containerEl.querySelectorAll('h1, h2, h3, h4, h5, h6');
                    for (var hIdx = 0; hIdx < headings.length; hIdx++) {
                        var h = headings[hIdx];
                        var hSlug = h.textContent.replace(/[\*_`]/g, '').trim().toLowerCase()
                                      .replace(/[^\w\s\-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
                        if (hSlug === normalizedId || hSlug.indexOf(normalizedId) !== -1 || normalizedId.indexOf(hSlug) !== -1) {
                            targetEl = h;
                            break;
                        }
                    }
                }

                if (targetEl) {
                    e.preventDefault();
                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    if (window.history && window.history.pushState) {
                        window.history.pushState(null, null, '#' + (targetEl.id || normalizedId));
                    }
                }
            });
        }

        state.initialized = true;

        // Auto-load query parameter if enabled
        if (state.options.autoLoadQuery && typeof window !== 'undefined' && window.location) {
            var urlParams = new URLSearchParams(window.location.search);
            var filePath = urlParams.get(state.options.queryParam);
            if (filePath) {
                load(filePath);
            }
        }

        return MdViewer;
    }

    function setTheme(theme) {
        state.currentTheme = (theme === 'light') ? 'light' : 'dark';
        if (typeof document !== 'undefined' && document.documentElement) {
            document.documentElement.setAttribute('data-theme', state.currentTheme);
        }
        try {
            localStorage.setItem('theme', state.currentTheme);
        } catch (_) {}

        var event = new CustomEvent('mdviewer:themechange', { detail: { theme: state.currentTheme } });
        if (typeof window !== 'undefined') window.dispatchEvent(event);
    }

    function toggleTheme() {
        setTheme(state.currentTheme === 'dark' ? 'light' : 'dark');
        return state.currentTheme;
    }

    function getTheme() {
        return state.currentTheme;
    }

    function updateTitle(titleText) {
        var cleanTitle = titleText || state.options.defaultTitle;
        if (state.titleEl) {
            state.titleEl.textContent = cleanTitle;
        }
        if (typeof document !== 'undefined') {
            document.title = cleanTitle + ' | ' + state.options.defaultTitle;
        }
    }

    function render(markdownText, pathOrName) {
        if (!state.containerEl) {
            state.containerEl = resolveElement(state.options.container);
        }
        if (!state.containerEl) {
            console.error('[MdViewer] Container element not found:', state.options.container);
            return;
        }

        var sourcePath = pathOrName || state.currentPath || '';
        if (sourcePath) {
            var displayName = sourcePath.substring(sourcePath.lastIndexOf('/') + 1)
                                      .substring(sourcePath.lastIndexOf('\\') + 1);
            updateTitle(displayName);
        }

        var html = parseMarkdown(markdownText, sourcePath);
        state.containerEl.innerHTML = '<article class="markdown-body">' + html + '</article>';

        // If URL has a hash anchor on render, scroll to it
        if (typeof window !== 'undefined' && window.location.hash) {
            var targetId = window.location.hash.substring(1);
            var targetEl = document.getElementById(targetId) || document.getElementsByName(targetId)[0];
            if (targetEl) {
                setTimeout(function() {
                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 50);
            }
        }
    }

    function showLoading(message) {
        if (!state.containerEl) state.containerEl = resolveElement(state.options.container);
        if (!state.containerEl) return;
        state.containerEl.innerHTML = 
            '<div class="viewer-loader">' +
                '<div class="viewer-spinner"></div>' +
                '<p>' + escapeHtml(message || 'Loading document...') + '</p>' +
            '</div>';
    }

    function renderError(title, body) {
        if (!state.containerEl) state.containerEl = resolveElement(state.options.container);
        updateTitle('Error');
        if (!state.containerEl) return;
        state.containerEl.innerHTML = 
            '<div class="viewer-alert viewer-alert-error">' +
                '<div class="viewer-alert-title">' +
                    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                        '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>' +
                    '</svg> ' +
                    escapeHtml(title) +
                '</div>' +
                '<div class="viewer-alert-body">' + body + '</div>' +
            '</div>';
    }

    function renderCORSError(rawPath) {
        if (!state.containerEl) state.containerEl = resolveElement(state.options.container);
        updateTitle('CORS / Access Notice');
        if (!state.containerEl) return;

        var path = escapeHtml(rawPath);
        state.containerEl.innerHTML = 
            '<div class="viewer-alert viewer-alert-warning">' +
                '<div class="viewer-alert-title">' +
                    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                        '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>' +
                        '<line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>' +
                    '</svg> ' +
                    'Local File Access Blocked (CORS Policy)' +
                '</div>' +
                '<div class="viewer-alert-body">' +
                    '<p><strong>Reason:</strong> Your browser blocked an asynchronous <code>fetch()</code> under the <code>file://</code> protocol or cross-origin security rules.</p>' +
                    '<p>You can bypass CORS completely by using the local file picker below (uses in-memory <code>FileReader</code>), opening the raw file, or running a local lightweight web server.</p>' +
                    '<div class="viewer-actions" style="margin: 14px 0; display: flex; gap: 10px; flex-wrap: wrap;">' +
                        '<button type="button" class="btn btn-primary" onclick="MdViewer.openFilePicker()">' +
                            'Open via File Picker (No CORS)' +
                        '</button>' +
                        '<a href="' + path + '" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">' +
                            'Open Raw File' +
                        '</a>' +
                    '</div>' +
                    '<div class="server-help" style="margin-top: 16px; border-top: 1px solid var(--border-color, #444); padding-top: 12px;">' +
                        '<p style="font-weight: 600; margin-bottom: 6px;">Local Server Workaround:</p>' +
                        '<pre style="padding: 8px 12px; background: var(--pre-bg, #111); border: 1px solid var(--border-color, #444); font-family: monospace; font-size: 13px;">php -S localhost:8000</pre>' +
                        '<p style="font-size: 12px; margin-top: 6px;">Then browse to: <code>http://localhost:8000/index.html?file=' + path + '</code></p>' +
                    '</div>' +
                '</div>' +
            '</div>';
    }

    function openFilePicker() {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = '.md,.markdown,.mdown,.txt,text/plain,text/markdown';
        input.style.display = 'none';
        document.body.appendChild(input);

        input.onchange = function(e) {
            var file = e.target.files && e.target.files[0];
            if (file) {
                load(file);
            }
            document.body.removeChild(input);
        };

        input.click();
    }

    function load(source) {
        if (!state.initialized) {
            init();
        }

        // Case 1: File or Blob object (from drag-drop or file picker)
        if (typeof Blob !== 'undefined' && source instanceof Blob) {
            var fileName = source.name || 'uploaded.md';
            state.currentPath = fileName;
            showLoading('Reading local file: ' + fileName);

            var reader = new FileReader();
            reader.onload = function(e) {
                var markdown = e.target.result;
                render(markdown, fileName);
            };
            reader.onerror = function() {
                renderError('Read Error', 'Failed to read local file: <code>' + escapeHtml(fileName) + '</code>');
            };
            reader.readAsText(source);
            return;
        }

        // Case 2: String source
        if (typeof source === 'string') {
            var trimmed = source.trim();

            // Direct markdown detection (if contains multiple lines, headers, or doesn't end with .md/.txt and contains spaces)
            var looksLikeRawMarkdown = trimmed.indexOf('\n') !== -1 || trimmed.indexOf('# ') === 0 || trimmed.length > 200;

            if (!looksLikeRawMarkdown && (trimmed.endsWith('.md') || trimmed.endsWith('.markdown') || trimmed.endsWith('.txt') || trimmed.indexOf('/') !== -1 || trimmed.indexOf('\\') !== -1 || trimmed.indexOf('?') !== -1)) {
                // Sideload via fetch
                var filePath = trimmed;
                state.currentPath = filePath;

                // Validate relative same-origin safety
                if (/^[a-z][a-z0-9+.\-]*:/i.test(filePath) && !filePath.startsWith('http://') && !filePath.startsWith('https://')) {
                    renderError('Invalid Path Protocol', 'Forbidden URI protocol. Allowed: relative paths, http, or https. Got: <code>' + escapeHtml(filePath) + '</code>');
                    return;
                }

                showLoading('Fetching ' + filePath + '...');

                fetch(filePath)
                    .then(function(res) {
                        if (!res.ok) {
                            var httpErr = new Error('HTTP ' + res.status + ': ' + res.statusText);
                            httpErr.httpStatus = res.status;
                            throw httpErr;
                        }
                        return res.text();
                    })
                    .then(function(markdown) {
                        render(markdown, filePath);
                    })['catch'](function(err) {
                        if (err && err.httpStatus) {
                            renderError('Document Not Found (HTTP ' + err.httpStatus + ')', 'Could not locate document at <code>' + escapeHtml(filePath) + '</code>. Check relative path or file name.');
                        } else {
                            renderCORSError(filePath);
                        }
                    });
                return;
            }

            // Raw markdown string
            render(trimmed, 'Document');
            return;
        }

        renderError('Unsupported Source', 'Expected a file path string, raw Markdown string, or File/Blob object.');
    }

    var MdViewer = {
        init: init,
        load: load,
        render: render,
        openFilePicker: openFilePicker,
        setTheme: setTheme,
        getTheme: getTheme,
        toggleTheme: toggleTheme,
        updateTitle: updateTitle,
        renderError: renderError,
        renderCORSError: renderCORSError,
        parseMarkdown: parseMarkdown,
        md2web: md2webEngine
    };

    return MdViewer;
}));
