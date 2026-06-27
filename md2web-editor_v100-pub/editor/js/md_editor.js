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
 * @file md_editor.js
 * @description Markdown Editor Environment component. Core logic handling Markdown manipulation, selection, and rendering in the editor.
 */
function insertTextAtCursor(text) {
    const editor = document.getElementById('resolution');
    if (!editor) return;

    const startPos = editor.selectionStart;
    const endPos = editor.selectionEnd;
    const value = editor.value;

    editor.value = value.substring(0, startPos) + text + value.substring(endPos, value.length);
    editor.selectionStart = editor.selectionEnd = startPos + text.length;
    editor.focus();
}


function wrapSelection(prefix, suffix, defaultText = 'text') {
    const editor = document.getElementById('resolution');
    if (!editor) return;

    const startPos = editor.selectionStart;
    const endPos = editor.selectionEnd;
    const value = editor.value;

    
    const selectedText = startPos !== endPos ? value.substring(startPos, endPos) : defaultText;
    const insertion = prefix + selectedText + suffix;

    editor.value = value.substring(0, startPos) + insertion + value.substring(endPos, value.length);

    
    if (startPos === endPos) {
        editor.selectionStart = startPos + prefix.length;
        editor.selectionEnd = editor.selectionStart + defaultText.length;
    } else {
        editor.selectionStart = startPos;
        editor.selectionEnd = startPos + insertion.length;
    }
    editor.focus();
}

function toggleLinePrefix(prefix) {
    const editor = document.getElementById('resolution');
    if (!editor) return;

    const startPos = editor.selectionStart;
    const endPos = editor.selectionEnd;
    const value = editor.value;

    let searchStart = startPos;
    if (startPos > 0 && startPos === endPos && value[startPos - 1] === '\n') {
        searchStart = startPos;
    } else if (startPos > 0) {
        searchStart = startPos - 1;
    }

    const lastNewlineStart = value.lastIndexOf('\n', searchStart);
    const lineStart = lastNewlineStart === -1 ? 0 : lastNewlineStart + 1;

    let nextNewlineEnd = value.indexOf('\n', endPos);
    if (nextNewlineEnd === -1) nextNewlineEnd = value.length;

    if (endPos > startPos && value[endPos - 1] === '\n') {
        nextNewlineEnd = endPos - 1;
    } else if (startPos === endPos && value[endPos] === '\n') {
        nextNewlineEnd = endPos;
    }

    const linesText = value.substring(lineStart, nextNewlineEnd);
    const lines = linesText.split('\n');

    const isOrderedList = prefix === '1. ';

    const allHavePrefix = lines.every(line => {
        if (line.trim() === '') return true;
        return isOrderedList ? /^\d+\.\s/.test(line) : line.startsWith(prefix);
    });

    let listCounter = 1;

    const newLines = lines.map(line => {
        if (allHavePrefix) {
            if (isOrderedList) {
                return line.replace(/^\d+\.\s/, '');
            }
            return line.startsWith(prefix) ? line.substring(prefix.length) : line;
        } else {
            if (isOrderedList) {
                return `${listCounter++}. ` + line;
            }
            return prefix + line;
        }
    });

    const newText = newLines.join('\n');
    editor.setRangeText(newText, lineStart, nextNewlineEnd, 'select');
    editor.focus();
}


const MDF = {
    bold: () => wrapSelection('**', '**', 'bold'),
    italic: () => wrapSelection('*', '*', 'italic'),
    strikethrough: () => wrapSelection('~~', '~~', 'strikethrough'),
    inlineCode: () => wrapSelection('`', '`', 'code'),
    codeBlock: () => wrapSelection('\n```\n', '\n```\n', ''),
    link: () => wrapSelection('[', '](url)', 'title'),
    quote: () => toggleLinePrefix('> '),
    listBullet: () => toggleLinePrefix('* '),
    listTask: () => toggleLinePrefix('- [ ] '),
    listTaskDone: () => toggleLinePrefix('- [x] '),
    listOrdered: () => toggleLinePrefix('1. '),
    rule: () => insertTextAtCursor('\n---\n')
};

function insertSupportTemplate() {
    insertTextAtCursor(`### Issue Summary:\n\n### Troubleshooting:\n- \n\n### Next Steps:\n- \n`);
}


document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('resolution');
    if (!editor) return;

    editor.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            const start = this.selectionStart;
            const value = this.value;
            const lastNewline = value.lastIndexOf('\n', start - 1);
            const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
            const currentLine = value.substring(lineStart, start);

            
            const taskMatch = currentLine.match(/^(\s*)([-*]\s\[[xX ]\]\s?)(.*)$/);
            if (taskMatch) {
                e.preventDefault();
                const textAfter = taskMatch[3].trim();
                if (!textAfter) {
                    
                    this.setRangeText('', lineStart, this.selectionEnd, 'end');
                } else {
                    this.setRangeText('\n' + taskMatch[1] + '- [ ] ', this.selectionStart, this.selectionEnd, 'end');
                }
                return;
            }

            
            const numMatch = currentLine.match(/^(\s*)(\d+)\.\s(.*)$/);
            if (numMatch) {
                e.preventDefault();
                const textAfter = numMatch[3].trim();
                if (!textAfter) {
                    
                    this.setRangeText('', lineStart, this.selectionEnd, 'end');
                } else {
                    const nextNum = parseInt(numMatch[2], 10) + 1;
                    this.setRangeText('\n' + numMatch[1] + nextNum + '. ', this.selectionStart, this.selectionEnd, 'end');
                }
                return;
            }

            
            const quoteMatch = currentLine.match(/^(\s*)>\s(.*)$/);
            if (quoteMatch) {
                e.preventDefault();
                const textAfter = quoteMatch[2].trim();
                if (!textAfter) {
                    
                    this.setRangeText('', lineStart, this.selectionEnd, 'end');
                } else {
                    this.setRangeText('\n' + quoteMatch[1] + '> ', this.selectionStart, this.selectionEnd, 'end');
                }
                return;
            }

            
            const listMatch = currentLine.match(/^(\s*)([-*])\s(.*)$/);
            if (listMatch) {
                e.preventDefault();
                const textAfter = listMatch[3].trim();
                if (!textAfter) {
                    
                    this.setRangeText('', lineStart, this.selectionEnd, 'end');
                } else {
                    this.setRangeText('\n' + listMatch[1] + listMatch[2] + ' ', this.selectionStart, this.selectionEnd, 'end');
                }
                return;
            }
        }

        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.selectionStart;
            const end = this.selectionEnd;
            const value = this.value;

            if (e.shiftKey) {
                
                const lastNewline = value.lastIndexOf('\n', start - 1);
                const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;

                
                let removeCount = 0;
                if (value.substring(lineStart, lineStart + 1) === '\t') {
                    removeCount = 1;
                } else {
                    for (let i = 0; i < 4; i++) {
                        if (value[lineStart + i] === ' ') removeCount++;
                        else break;
                    }
                }

                if (removeCount > 0) {
                    this.value = value.substring(0, lineStart) + value.substring(lineStart + removeCount);
                    this.selectionStart = Math.max(lineStart, start - removeCount);
                    this.selectionEnd = Math.max(lineStart, end - removeCount);
                }
            } else {
                
                if (start === end) {
                    this.value = value.substring(0, start) + '    ' + value.substring(end);
                    this.selectionStart = this.selectionEnd = start + 4;
                } else {
                    
                    this.value = value.substring(0, start) + '    ' + value.substring(start, end) + value.substring(end);
                    this.selectionStart = start + 4;
                    this.selectionEnd = end + 4;
                }
            }
        }
    });

    
    window.insertTextAtCursor = insertTextAtCursor;
    window.MDF = MDF;
    window.insertSupportTemplate = insertSupportTemplate;
});
