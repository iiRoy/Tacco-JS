(function () {
    const isThemeLight = true;
    const visualStyleClass = "thematic-scheme-ember";
    const styleDefinition = `
.custom-text-editor {
    color: rgb(68, 68, 68);
    font-family: Menlo, monospace;
    font-size: 12px;
    line-height: 16px;
}
.thematic-scheme-ember .line-number-channel {
    border-right: 1px solid rgb(209, 209, 209);
    background: rgb(246, 246, 246);
    color: rgb(180, 180, 180);
    overflow : hidden;
}
.thematic-scheme-ember .page-break-indicator {
    width: 1px;
    background: #e8e8e8;
}
.thematic-scheme-ember {
    background: url("data:image/gif;base64,R0lGODlhBAAEAIAAAP////f39yH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSJvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4wLWMwNjEgNjQuMTQwOTQ5LCAyMDEwLzEyLzA3LTEwOjU3OjAxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcDEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcDEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIE1hY2ludG9zaCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoyOEYyOTc5MjVDQjQxMUUxOTlDODk4N0YxNDlFOTY1RiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoyOEYyOTc5MzVDQjQxMUUxOTlDODk4N0YxNDlFOTY1RiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjI4RjI5NzkzNUNCMDExRTE5OUM4OTg3RjE0OUU5NjVGIiBzdFJlZjpleHRlbmQ9IiI+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+BQ4AAAAAOw==");
}
.thematic-scheme-ember .input-caret {
    border-left: 2px solid black;
}
.thematic-scheme-ember .overwrite-caret-mode .input-caret {
    border-left: 0px;
    border-bottom: 1px solid black;
}
.thematic-scheme-ember .hidden-whitespace {
    color: rgb(191, 191, 191);
}
.thematic-scheme-ember .literal-value.system-defined {
    color: rgb(88, 72, 246);
}
.thematic-scheme-ember .literal-value.language-construct {
    color: rgb(88, 92, 246);
}
.thematic-scheme-ember .literal-value.library-component {
    color: rgb(6, 150, 14);
}
.thematic-scheme-ember .invalid-syntax-highlight {
    background-color: rgb(153, 0, 0);
    color: white;
}
.thematic-scheme-ember .code-folding-marker {
}
.thematic-scheme-ember .helper-utility.function-call {
    color: rgb(206, 121, 31);
}
.thematic-scheme-ember .helper-utility.literal-constant {
    color: rgb(6, 150, 14);
}
.thematic-scheme-ember .helper-utility.data-type,
.thematic-scheme-ember .helper-utility.class-name
.thematic-scheme-ember .helper-utility.miscellaneous {
    color: rgb(206, 121, 31);
}
.thematic-scheme-ember .local-symbol.function-argument {
    font-style:italic;
    color:#FD971F;
}
.thematic-scheme-ember .reserved-term.operator-symbol {
    color: rgb(104, 118, 135);
}
.thematic-scheme-ember .code-comment-block,
.thematic-scheme-ember .code-comment-block.documentation,
.thematic-scheme-ember .code-comment-block.documentation.tag {
    color: rgb(180, 180, 180);
}
.thematic-scheme-ember .literal-value.numerical-data {
    color: rgb(0, 0, 205);
}
.thematic-scheme-ember .local-symbol {
    color: rgb(31, 88, 206);
}
.thematic-scheme-ember .xml-processing-instruction {
    color: rgb(104, 104, 91);
}
.thematic-scheme-ember .named-entity.function-declaration {
    color: rgb(206, 121, 31);
}
.thematic-scheme-ember .markup-structure.heading-level {
    color: rgb(12, 7, 255);
}
.thematic-scheme-ember .markup-structure.list-item {
    color:rgb(185, 6, 144);
}
.thematic-scheme-ember .highlight-overlay .selection-area {
    background: rgb(181, 213, 255);
}
.thematic-scheme-ember .highlight-overlay .execution-step {
    background: rgb(252, 255, 0);
}
.thematic-scheme-ember .highlight-overlay .call-stack-frame {
    background: rgb(164, 229, 101);
}
.thematic-scheme-ember .highlight-overlay .matching-delimiter {
    margin: -1px 0 0 -1px;
    border: 1px solid rgb(192, 192, 192);
}
.thematic-scheme-ember .highlight-overlay .current-code-line {
    background: rgba(0, 0, 0, 0.07);
}
.thematic-scheme-ember .line-number-channel-active-line {
    background-color : #dcdcdc;
}
.thematic-scheme-ember .highlight-overlay .selected-token {
    background: rgb(250, 250, 255);
    border: 1px solid rgb(200, 200, 250);
}
.thematic-scheme-ember .storage-designator,
.thematic-scheme-ember .reserved-term,
.thematic-scheme-ember .metadata-attribute.html-tag {
    color: rgb(206, 121, 31);
}
.thematic-scheme-ember .string-literal.regular-expression-pattern {
    color: rgb(255, 0, 0)
}
.thematic-scheme-ember .string-literal {
    color: rgb(21, 60, 140);
}
.thematic-scheme-ember .named-entity.other-attribute.attribute-name {
    color: #994409;
}
.thematic-scheme-ember .indentation-visualizer {
    background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAE0lEQVQImWP4////f4bLly//BwAmVgd1/w11/gAAAABJRU5ErkJggg==") right repeat-y;
}
    `;

    const styleInjector = {
        insertStyleRules: function(cssContent, identificationClass) {
            const styleElement = document.createElement("style");
            styleElement.type = "text/css";
            styleElement.setAttribute("data-visual-theme-id", identificationClass);
            styleElement.textContent = cssContent;

            const targetHead = document.head || document.getElementsByTagName("head")[0];
            if (targetHead) {
                targetHead.appendChild(styleElement);
            } else {
                document.documentElement.appendChild(styleElement);
            }
        }
    };

    styleInjector.insertStyleRules(styleDefinition, visualStyleClass);

    if (typeof window !== 'undefined') {
        if (!window.__customThemeRegistry__) {
            window.__customThemeRegistry__ = {};
        }

        window.__customThemeRegistry__['editor-style/ember-variant'] = {
            isLightScheme: isThemeLight,
            mainCssClass: visualStyleClass,
            fullCssText: styleDefinition
        };
    }
})();