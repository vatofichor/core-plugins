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
 * @file md-toolbar-tool-generator.js
 * @description Markdown Editor Environment component. Dynamically generates the Markdown toolbar formatting buttons.
 */
const mdTools = [
    { label: "<b>B</b>", title: "Bold", onmousedown: "MDF.bold()" },
    { label: "<i>I</i>", title: "Italic", onmousedown: "MDF.italic()" },
    { label: "<s>S</s>", title: "Strikethrough", onmousedown: "MDF.strikethrough()" },
    { label: "&lt;&gt;", title: "Inline Code", onmousedown: "MDF.inlineCode()" },
    { label: "```", title: "Code Block", onmousedown: "MDF.codeBlock()" },
    { label: "Link", title: "Link", onmousedown: "MDF.link()" },
    { label: "HR", title: "Horizontal Rule", onmousedown: "MDF.rule()" },
    { label: "📋 Support Template", title: "Insert Support Template", onmousedown: "insertSupportTemplate()" },
    { label: "Preview", title: "Toggle Live Compilation Preview", onmousedown: "MDPreview.toggle()", id: "btn-preview" }
];

const mdLists = [
    { label: "•", title: "Bullet List", onmousedown: "MDF.listBullet()" },
    { label: "1.", title: "Ordered List", onmousedown: "MDF.listOrdered()" },
    { label: "- [ ]", title: "Task List", onmousedown: "MDF.listTask()" },
    { label: "- [x]", title: "Completed Task List", onmousedown: "MDF.listTaskDone()" },
    { label: "”", title: "Blockquote", onmousedown: "MDF.quote()" }
];

const mdSymbols = [
    { label: "→", onmousedown: "insertTextAtCursor('→ ')", id: "arrow" },
    { label: "—", onmousedown: "insertTextAtCursor('— ')", id: "info" },
    { label: "-", title: "Dash List", onmousedown: "insertTextAtCursor('- ')", id: "tick-dash" }
];

function generateToolbarButtons() {
    const toolbarContainer = document.getElementById("md-toolbar");
    if (!toolbarContainer) return;

    toolbarContainer.innerHTML = "";

    mdTools.forEach(tool => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "md-toolbar-tool";
        
        btn.onmousedown = function (e) {
            e.preventDefault();
            eval(tool.onmousedown);
        };
        if (tool.title) btn.title = tool.title;
        if (tool.id) btn.id = tool.id;
        btn.innerHTML = tool.label;
        toolbarContainer.appendChild(btn);
    });

    const divider = document.createElement("div");
    divider.style.width = "1px";
    divider.style.height = "20px";
    divider.style.backgroundColor = "var(--glass-border)";
    divider.style.margin = "0 8px";
    toolbarContainer.appendChild(divider);

    const list_tools = document.createElement("span");
    list_tools.style.fontSize = "16px";
    list_tools.style.margin = "0 8px";
    list_tools.style.opacity = "0.7";
    list_tools.innerHTML = "Lists:";
    toolbarContainer.appendChild(list_tools);

    mdLists.forEach(tool => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "md-toolbar-tool";
        btn.onmousedown = function (e) {
            e.preventDefault();
            eval(tool.onmousedown);
        };
        if (tool.title) btn.title = tool.title;
        if (tool.id) btn.id = tool.id;
        btn.innerHTML = tool.label;
        toolbarContainer.appendChild(btn);
    });

    const divider2 = document.createElement("div");
    divider2.style.width = "1px";
    divider2.style.height = "20px";
    divider2.style.backgroundColor = "var(--glass-border)";
    divider2.style.margin = "0 8px";
    toolbarContainer.appendChild(divider2);

    const inline_tools = document.createElement("span");
    inline_tools.style.fontSize = "16px";
    inline_tools.style.margin = "0 8px";
    inline_tools.style.opacity = "0.7";
    inline_tools.innerHTML = "Inline:";
    toolbarContainer.appendChild(inline_tools);

    mdSymbols.forEach(sym => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "md-toolbar-tool";
        btn.onmousedown = function (e) {
            e.preventDefault();
            eval(sym.onmousedown);
        };
        if (sym.title) btn.title = sym.title;
        if (sym.id) btn.id = sym.id;
        btn.innerHTML = sym.label;
        toolbarContainer.appendChild(btn);
    });

    
    const editor = document.getElementById("resolution");
    if (editor) {
        editor.style.borderTopLeftRadius = "0";
        editor.style.borderTopRightRadius = "0";
        editor.style.marginTop = "0";
    }
}

document.addEventListener("DOMContentLoaded", generateToolbarButtons);
