/*
 * MIT License
 *
 * Copyright (c) 2026:
 * vatofichor - Sebastian Mass     [>_<]
 * & Assisted By Gemini Antigravity /|\  
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/**
 * @file find_replace.js
 * @description Markdown Editor Environment component. Provides Find & Replace utility logic within the code editor.
 */
const FindReplace = {
  active: false,
  modal: null,
  textarea: null,
  inputs: {
    find: null,
    replace: null,
    caseSensitive: null,
    looseMatch: null
  },
  statusMsg: null,

  backupToClipboard: function () {
    const content = this.textarea.value;
    if (typeof write_to_clipboard === 'function') {
      write_to_clipboard(content, true);
    } else {
      navigator.clipboard.writeText(content);
    }
    
  },

  init: function () {
    this.textarea = document.getElementById('resolution');
    if (!this.textarea) {
      console.warn('FindReplace: Resolution textarea not found.');
      return;
    }

    this.createModal();
    this.attachEvents();
  },

  createModal: function () {
    if (document.getElementById('find-replace-modal')) return;

    const modalHTML = `
      <div id="find-replace-modal" class="find-replace-modal hide">
        <div class="find-replace-header">
          <span>Find & Replace</span>
          <span class="find-replace-close" onclick="FindReplace.toggle()">×</span>
        </div>
        
        <div class="find-replace-row">
          <label class="find-replace-label" for="fr-find">Find:</label>
          <input type="text" id="fr-find" class="find-replace-input" placeholder="Text to find...">
        </div>
        
        <div class="find-replace-row">
          <label class="find-replace-label" for="fr-replace">Replace with:</label>
          <input type="text" id="fr-replace" class="find-replace-input" placeholder="Replacement text...">
        </div>
        
        <div class="find-replace-options">
          <label><input type="checkbox" id="fr-case" class="find-replace-checkbox">Match Case</label>
          <label><input type="checkbox" id="fr-loose" class="find-replace-checkbox">Loose Match</label>
        </div>
        
        <div class="find-replace-actions">
           <button id="fr-btn-find" class="find-replace-btn" onclick="FindReplace.findNext()">Find Next</button>
           <button class="find-replace-btn" onclick="FindReplace.replace()">Replace</button>
           <button class="find-replace-btn" onclick="FindReplace.replaceAll()">Replace All</button>
        </div>

        <div id="fr-status" class="find-replace-status"></div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    this.modal = document.getElementById('find-replace-modal');
    this.inputs.find = document.getElementById('fr-find');
    this.inputs.replace = document.getElementById('fr-replace');
    this.inputs.caseSensitive = document.getElementById('fr-case');
    this.inputs.looseMatch = document.getElementById('fr-loose');
    this.statusMsg = document.getElementById('fr-status');
  },

  attachEvents: function () {
    
    const handleEnter = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        this.findNext();
      }
    };

    this.inputs.find.addEventListener('keydown', handleEnter);
    this.inputs.replace.addEventListener('keydown', handleEnter);

    
    this.modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.toggle();
    });

    
    this.textarea.addEventListener('keydown', (e) => {
      if (this.active && e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation(); 
        this.findNext();
      }
    });
  },

  toggle: function () {
    if (!this.modal) this.init();

    this.active = !this.active;
    if (this.active) {
      this.modal.classList.remove('hide');
      this.inputs.find.focus();
    } else {
      this.modal.classList.add('hide');
      this.textarea.focus(); 
    }
  },

  getRegex: function () {
    const query = this.inputs.find.value;
    if (!query) return null;

    const flags = this.inputs.caseSensitive.checked ? 'g' : 'gi';

    let pattern = query;
    if (!this.inputs.looseMatch.checked) {
      
      pattern = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    

    

    
    

    if (this.inputs.looseMatch.checked) {
      
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      pattern = `[\\s\\p{P}]*${escaped}[\\s\\p{P}]*`;

      pattern = `\\s*${escaped}\\s*`;
    }

    try {
      return new RegExp(pattern, flags);
    } catch (e) {
      this.setStatus('Invalid Regex/Pattern', true);
      return null;
    }
  },

  findNext: function () {
    const regex = this.getRegex();
    if (!regex) return;

    const text = this.textarea.value;
    
    const startPos = this.textarea.selectionEnd;

    
    const textAfter = text.substring(startPos);
    let match = regex.exec(textAfter);

    let absoluteIndex = -1;
    let matchLength = 0;

    if (match) {
      absoluteIndex = startPos + match.index;
      matchLength = match[0].length;
    } else {
      
      regex.lastIndex = 0; 
      match = regex.exec(text);
      if (match) {
        absoluteIndex = match.index;
        matchLength = match[0].length;
        this.setStatus('Wrapped to top');
      }
    }

    if (absoluteIndex !== -1) {
      this.textarea.focus();
      this.textarea.setSelectionRange(absoluteIndex, absoluteIndex + matchLength);


      this.textarea.blur();
      this.textarea.focus();

      this.setStatus('Found');
    } else {
      this.setStatus('Not found', true);
    }
  },

  replace: function () {
    const text = this.textarea.value;
    const selectionStart = this.textarea.selectionStart;
    const selectionEnd = this.textarea.selectionEnd;
    const selectedText = text.substring(selectionStart, selectionEnd);


    

    const regex = this.getRegex();
    if (!regex) return;


    
    



    if (selectionStart !== selectionEnd) {
      this.backupToClipboard(); 

      
      const replacement = this.inputs.replace.value;

      

      this.textarea.setRangeText(replacement, selectionStart, selectionEnd, 'select');
      this.setStatus('Replaced (Original copied to clipboard)');

      
      this.findNext();
    } else {
      this.findNext();
    }
  },

  replaceAll: function () {
    const regex = this.getRegex();
    if (!regex) return;

    this.backupToClipboard(); 

    const text = this.textarea.value;
    const replacement = this.inputs.replace.value;

    const newText = text.replace(regex, replacement);

    if (newText !== text) {
      this.textarea.value = newText;
      this.setStatus('Replaced All (Original copied to clipboard)');
    } else {
      this.setStatus('Nothing to replace');
    }
  },

  setStatus: function (msg, isError = false) {
    this.statusMsg.textContent = msg;
    this.statusMsg.style.color = isError ? '#ff6666' : '#aaa';
  },

  backupToClipboard: function () {
    const content = this.textarea.value;
    if (typeof write_to_clipboard === 'function') {
      write_to_clipboard(content, true);
    } else {
      navigator.clipboard.writeText(content);
    }
    
  }
};


window.FindReplace = FindReplace;
