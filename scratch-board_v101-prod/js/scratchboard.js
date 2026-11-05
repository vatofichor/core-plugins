/*
 * MIT License
 *
 * Copyright (c) 2026:
 * vatofichor     [>_<]
 * & Assisted By Gemini Antigravity /|\  
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/**
 * @file scratchboard.js
 * @description Standalone ScratchBoard Plugin. Handles line-by-line persistent notes via LocalStorage.
 */

// Idempotent Guard: Prevent duplicate script definitions if lazy-loaded or included multiple times
if (window.__scratchboard_installed) {
	// If already installed but DOM elements were re-injected (e.g. lazy-loaded partfile), re-bind
	if (typeof window.init_scratchboard === 'function') {
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', window.init_scratchboard);
		} else {
			window.init_scratchboard();
		}
	}
} else {
	window.__scratchboard_installed = true;

	let scratchboard_raw = [];
	let scratchboard_file = null;
	let scratchboard_cleaned = loadScratchboardCache();
	let import_status = false;

	function loadScratchboardCache() {
		try {
			const raw = localStorage.getItem('scratchboard_cache');
			return raw ? JSON.parse(raw) : [];
		} catch (err) {
			console.warn('ScratchBoard: LocalStorage read error:', err);
			return [];
		}
	}

	function setScratchboardCache() {
		try {
			localStorage.setItem('scratchboard_cache', JSON.stringify(scratchboard_cleaned));
		} catch (err) {
			console.warn('ScratchBoard: LocalStorage write error:', err);
		}
	}

	function clearCache() {
		try {
			localStorage.removeItem('scratchboard_cache');
		} catch (err) {
			console.warn('ScratchBoard: LocalStorage clear error:', err);
		}
		scratchboard_cleaned = [];
		run_DOM_updater();
		notify("Cache cleared, ready to import new notes.", 0);
	}

	function is_textfile(path) {
		return typeof path === 'string' && path.toLowerCase().endsWith(".txt");
	}

	function import_sanitize_line(line) {
		return line ? line.replace(/:[a-zA-Z0-9_-]+:/g, '').trim() || null : null;
	}

	function importScratchboard(file) {
		if (!file) return notify("No file selected.", 0);
		if (file.size > 1e6) return notify("File is too large (max 1MB).", 0);

		const reader = new FileReader();
		reader.onload = e => {
			const text = e.target.result;
			if (!text) return notify("File is empty.", 0);
			let lines = text.split(/\r?\n/).map(line => line.trim());
			scratchboard_raw = lines;
			if (lines.length < 1) return notify("File too short.", 0);

			let imported = [];
			for (let i = 0; i < lines.length; i++) {
				const line = lines[i];
				if (!line) continue;
				let cleanedLine = import_sanitize_line(line);
				if (cleanedLine) imported.push(cleanedLine);
			}
			scratchboard_cleaned = imported;
			import_status = true;
			setScratchboardCache();
			run_DOM_updater();
			notify("List has been loaded from file.", 1);
		};
		reader.onerror = () => notify("Failed to read file.", 0);
		reader.readAsText(file);
	}

	function importNotesLauncher() {
		const import_input = document.getElementById('scratchboardImport');
		if (!import_input || !import_input.value) return notify("Please select your notes text file.", 0);
		if (!is_textfile(import_input.value)) return notify("You must select a .txt file.", 0);

		if (import_input.files && import_input.files[0]) {
			scratchboard_file = import_input.files[0];
			importScratchboard(scratchboard_file);
		}
	}

	function update_DOM() {
		const scratchboard_list = document.getElementById('scratchboard-list');
		if (!scratchboard_list) return false;
		scratchboard_list.innerHTML = '';
		if (!scratchboard_cleaned || scratchboard_cleaned.length === 0) {
			scratchboard_list.innerHTML = '<p class="scratchboard-empty">No notes available.</p>';
			return false;
		}
		scratchboard_cleaned.forEach(code => {
			const div = document.createElement('div');
			div.className = 'scratchboard-item';
			div.innerHTML = code;
			scratchboard_list.appendChild(div);
		});
		return true;
	}

	function run_DOM_updater() {
		if (update_DOM()) {
			notify("List has been loaded.", 1);
			return 1;
		}
		return 0;
	}

	function saveEditor() {
		const editor_input = document.getElementById('text-input-scratchboard');
		const editor_toggle = document.getElementById('editor-scratchboard-toggle');
		if (!editor_input) return;

		const text = editor_input.value;
		scratchboard_raw = text.split('\n').map(line => line.trim()).filter(line => line);
		scratchboard_cleaned = scratchboard_raw.map(line => import_sanitize_line(line)).filter(line => line);
		import_status = scratchboard_cleaned.length > 0;
		run_DOM_updater();
		setScratchboardCache();
		notify(scratchboard_cleaned.length > 0 ? "Changes saved." : "No valid notes found.", 1);

		if (editor_toggle && editor_toggle.checked) {
			editor_toggle.checked = false;
		}
		editor_input.value = "";
	}

	function notify(msg, test) {
		const notifications = document.getElementById('notifications-scratchboard');
		if (!notifications) return;
		notifications.textContent = msg || "Something went wrong.";
		if (test === 0) {
			notifications.style.color = 'var(--sb-text-secondary, var(--text-secondary, #94a3b8))';
		} else if (test === 1) {
			notifications.style.color = 'var(--sb-success, var(--success, #22c55e))';
		} else {
			notifications.style.color = 'var(--sb-error, var(--error, #ef4444))';
		}
		return test ? 1 : 0;
	}

	function exportScratchBoard() {
		if (!scratchboard_cleaned || scratchboard_cleaned.length === 0) return notify("No notes to export.", 0);
		const content = scratchboard_cleaned.join('\n');
		const blob = new Blob([content], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		const now = new Date();
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const day = String(now.getDate()).padStart(2, '0');
		const hours = String(now.getHours()).padStart(2, '0');
		const mins = String(now.getMinutes()).padStart(2, '0');
		const tstamp = `${now.getFullYear()}${month}${day}_${hours}${mins}`;
		a.download = `scratchboard_${tstamp}.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	function init_scratchboard() {
		const import_btn = document.getElementById('scratchboardImportBtn');
		const import_input = document.getElementById('scratchboardImport');
		const editor_toggle = document.getElementById('editor-scratchboard-toggle');
		const editor_input = document.getElementById('text-input-scratchboard');
		const save_editor = document.getElementById('save-btn-scratchboard');

		if (import_btn) {
			import_btn.removeEventListener("click", importNotesLauncher);
			import_btn.addEventListener("click", importNotesLauncher);
		}

		if (import_input) {
			// Reset input value on click so selecting the same file re-triggers change event
			import_input.addEventListener("click", () => {
				import_input.value = "";
			});

			import_input.addEventListener("change", (event) => {
				if (event.target.files && event.target.files.length > 0) {
					notify("File selected: " + event.target.files[0].name, 1);
				}
			});
		}

		if (save_editor) {
			save_editor.removeEventListener("click", saveEditor);
			save_editor.addEventListener("click", saveEditor);
		}

		if (editor_toggle && editor_input) {
			editor_toggle.addEventListener("change", function () {
				if (this.checked) {
					editor_input.value = scratchboard_cleaned.join('\n');
				} else {
					editor_input.value = "";
				}
			});
		}

		scratchboard_cleaned = loadScratchboardCache();

		if (scratchboard_cleaned && scratchboard_cleaned.length > 0) {
			run_DOM_updater();
			notify("Loaded notes. Each line is an individual note, empty lines are stripped.", 1);
		} else {
			update_DOM();
			notify("Each line is an individual note, empty lines are stripped.", 0);
		}
	}

	// Global hook exposures
	window.init_scratchboard = init_scratchboard;
	window.exportScratchBoard = exportScratchBoard;
	window.clearScratchboardCache = clearCache;

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init_scratchboard);
	} else {
		init_scratchboard();
	}
}
