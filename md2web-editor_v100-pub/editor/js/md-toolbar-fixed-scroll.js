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
 * @file md-toolbar-fixed-scroll.js
 * @description Markdown Editor Environment component. Manages sticky positioning for the Markdown toolbar during long document scrolling.
 */
document.addEventListener('DOMContentLoaded', () => {
    
    setTimeout(() => {
        const toolbar = document.getElementById("md-toolbar");
        if (!toolbar) return;

        
        const placeholder = document.createElement("div");
        placeholder.style.display = "none";
        toolbar.parentNode.insertBefore(placeholder, toolbar);

        let isFixed = false;

        function handleScroll() {
            
            if (window.innerWidth <= 768) {
                if (isFixed) resetToolbar();
                return;
            }


            const referenceElement = isFixed ? placeholder : toolbar;
            const rect = referenceElement.getBoundingClientRect();


            if (rect.bottom < 0 && rect.bottom > -500) {
                if (!isFixed) {
                    fixToolbar();
                }
                
                toolbar.style.width = placeholder.offsetWidth + "px";
                toolbar.style.left = placeholder.getBoundingClientRect().left + "px";
            } else {
                if (isFixed) {
                    resetToolbar();
                }
            }
        }

        function fixToolbar() {
            isFixed = true;

            
            placeholder.style.display = "block";
            placeholder.style.height = toolbar.offsetHeight + "px";
            placeholder.style.margin = window.getComputedStyle(toolbar).margin;
            placeholder.style.width = "65vw";


            document.body.appendChild(toolbar);

            toolbar.style.position = "fixed";
            toolbar.style.top = "0";
            toolbar.style.zIndex = "1000";
            toolbar.style.background = "var(--bg-deep)";
            toolbar.style.padding = "10px";
            toolbar.style.borderRadius = "0 0 10px 10px";
            toolbar.style.boxShadow = "var(--shadow-lg)";
            toolbar.style.border = "1px solid var(--border)";

            
            toolbar.style.transform = "translateY(-100%)";
            toolbar.style.transition = "transform 0.2s ease-out";

            
            void toolbar.offsetWidth;

            toolbar.style.transform = "translateY(0)";
        }

        function resetToolbar() {
            isFixed = false;

            
            placeholder.parentNode.insertBefore(toolbar, placeholder);
            placeholder.style.display = "none";

            
            toolbar.style.position = "";
            toolbar.style.top = "";
            toolbar.style.left = "";
            toolbar.style.zIndex = "";
            toolbar.style.background = "";
            toolbar.style.padding = "";
            toolbar.style.borderRadius = "";
            toolbar.style.boxShadow = "";
            toolbar.style.border = "";
            toolbar.style.transform = "";
            toolbar.style.transition = "";
            toolbar.style.width = "";
        }

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll, { passive: true });

        
        handleScroll();
    }, 150);
});
