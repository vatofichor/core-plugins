/*
  Copyright (c) 2026:
  vatofichor - Sebastian Mass     [>_<]
  & Assisted By Gemini Antigravity /|\
*/

(function(root) {
    'use strict';

    let isVisible = false;

    function escapeHtmlAttr(str) {
        if (!str) return '';
        return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function toggle() {
        const container = document.getElementById('md-preview-container');
        const btn = document.getElementById('btn-preview');
        if (!container) return;

        isVisible = !isVisible;
        
        if (isVisible) {
            container.style.display = 'flex';
            if (btn) btn.classList.add('active');
            update();
            // Smoothly scroll container into view
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            container.style.display = 'none';
            if (btn) btn.classList.remove('active');
        }
    }

    function update() {
        if (!isVisible) return;

        const textarea = document.getElementById('resolution');
        const container = document.getElementById('md-preview-container');
        if (!textarea || !container) return;

        const mdContent = textarea.value;

        // 1. Extract metadata comments using regex matching the compiler pipeline spec
        const readyMatch = mdContent.match(/<!--\s*ready:\s*(.+?)\s*-->/i);
        const contributorsMatch = mdContent.match(/<!--\s*contributors:\s*(.+?)\s*-->/i);
        const aiGeneratedMatch = mdContent.match(/<!--\s*ai-generated:\s*(.+?)\s*-->/i);

        // 2. Strip comments (exactly as specified in compiler-pipeline-spec.md)
        const cleanMd = mdContent.replace(/<!--\s*(ready|contributors|ai-generated):\s*(.+?)\s*-->\s*/gi, '');

        // 3. Compile markdown using UMD plugin
        let parsedHtml = '';
        if (root.md2web && typeof root.md2web.parseMarkdown === 'function') {
            parsedHtml = root.md2web.parseMarkdown(cleanMd);
        } else {
            parsedHtml = '<p style="color: var(--error);">Error: md2web plugin compiler is not loaded.</p>';
        }

        // 4. Build output HTML with article wrapper as per spec 3F
        const contributors = contributorsMatch ? contributorsMatch[1].trim() : '';
        const aiGenerated = aiGeneratedMatch ? aiGeneratedMatch[1].trim() : '';
        const readyStatus = readyMatch ? readyMatch[1].trim() : '';

        let articleAttrs = '';
        if (aiGenerated) {
            articleAttrs += ` data-generated="${escapeHtmlAttr(aiGenerated)}"`;
        }
        if (contributors) {
            articleAttrs += ` data-modified="${escapeHtmlAttr(contributors)}"`;
        }

        let metadataHeaderHtml = '';
        if (contributors || aiGenerated || readyStatus) {
            metadataHeaderHtml = `<div class="md-preview-metadata">`;
            if (readyStatus) {
                metadataHeaderHtml += `<span>Status: <strong>${readyStatus}</strong></span>`;
            }
            if (contributors) {
                metadataHeaderHtml += `<span>Modified by: <strong>${contributors}</strong></span>`;
            }
            if (aiGenerated) {
                metadataHeaderHtml += `<span>AI Generated: <strong>${aiGenerated}</strong></span>`;
            }
            metadataHeaderHtml += `</div>`;
        }

        const previewBody = container.querySelector('.md-preview-body');
        if (previewBody) {
            previewBody.innerHTML = metadataHeaderHtml + `<article${articleAttrs}>${parsedHtml}</article>`;
        }
    }

    // Initialize event listeners when DOM content is loaded
    document.addEventListener('DOMContentLoaded', () => {
        const textarea = document.getElementById('resolution');
        if (textarea) {
            textarea.addEventListener('input', () => {
                if (isVisible) {
                    update();
                }
            });
        }
    });

    // Expose public API
    root.MDPreview = {
        toggle: toggle,
        update: update,
        isOpen: () => isVisible
    };

})(typeof window !== 'undefined' ? window : this);
