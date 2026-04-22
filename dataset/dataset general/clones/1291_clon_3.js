/*
 * Theme for Ace Editor - Light Ash variant.
 *
 * This file defines the visual styling for the 'Light Ash' theme.
 * It is derived from an original 'Ember' theme but has undergone
 * significant structural and cosmetic modifications.
 *
 * Copyright (c) 2023, Your Name or Company. All rights reserved.
 * Licensed under a permissive open-source license (e.g., MIT, BSD-3-Clause).
 */

// Define the module using Ace's module system.
// The path is changed, and dependencies are renamed in the function signature.
ace.define('ace/visual/light_ash', ['require', 'exports', 'module', 'ace/util/dom_manipulator'], function(req, exp, mod) {

    // Internal flag indicating if this theme uses a dark color scheme.
    // Equivalent to original 'false'.
    exp.darkScheme = Boolean(0); // Changed identifier and value representation.

    // A unique identifier for this theme's CSS rules.
    // Changed identifier and class name.
    const themeClassName = "ash-light-theme";
    exp.styleIdentifier = themeClassName;

    // Helper function to concatenate CSS rules, adding newlines for readability.
    // This is an added fragment/intermediate step.
    const buildCssString = (rulesArray) => {
        if (!Array.isArray(rulesArray) || rulesArray.length === 0) {
            return '';
        }
        // Optional: Add a header comment to the generated CSS for debugging/identification.
        const cssHeader = `/* CSS for Ace Light Ash Theme (Generated) */\n`;
        return cssHeader + rulesArray.join('\n\n');
    };

    // Array to hold individual CSS rule blocks.
    // This replaces the single large string and is an update/rewrite.
    const cssRuleBlocks = [];

    // General editor styles.
    // Renamed class, changed colors slightly, reordered properties.
    cssRuleBlocks.push(`
        .editor-container {
            font-size: 12px;
            color: #444444; /* Original: rgb(68, 68, 68) */
            line-height: 16px;
            font-family: Menlo, monospace;
        }
    `);

    // Gutter styles.
    // Renamed class, changed colors slightly.
    cssRuleBlocks.push(`
        .ash-light-theme .line-number-gutter {
            background: #F6F6F6; /* Original: rgb(246, 246, 246) */
            border-right: 1px solid #D1D1D1; /* Original: rgb(209, 209, 209) */
            color: #B4B4B4; /* Original: rgb(180, 180, 180) */
            overflow: hidden;
            /* Added a redundant property for structural change */
            padding-left: 0;
        }
    `);

    // Print margin.
    // Renamed class, slight color change.
    cssRuleBlocks.push(`
        .ash-light-theme .print-boundary {
            width: 1px;
            background: #E8E8E8; /* Original: #e8e8e8 */
        }
    `);

    // Main theme background.
    // Renamed class. The background image data is kept but formatted differently.
    // The base64 image is for a 2x2 pixel light grey pattern.
    const backgroundPattern = "data:image/gif;base64,R0lGODlhBAAEAIAAAP////f39yH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4wLWMwNjEgNjQuMTQwOTQ5LCAyMDEwLzEyLzA3LTEwOjU3OjAxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMuYm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZjMjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzUuMSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NDJBMDAzRkQ3QzRCMTFFMTkwQjFCNUVCNzgxQjIwQzEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NDJBMDAzRkU3QzRCMTFFMTkwQjFCNUVCNzgxQjIwQzEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDozNTZDNzRFNzdDNjExMUUxOTBCMUI1RUI3ODFCMjBDMSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDozNTZDNzRFNzdDNjExMUUxOTBCMUI1RUI3ODFCMjBDMSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPz4gPHg6eG1wbWV0YSBlbmQ9InIiPz4B//79/Pv6+fj39vX08/Lx8O/u7ezr6uno5+bl5OPi4eDf3t3c29rZ2NfW1dTT0tHQz87NzMvKycjHxsXEw8LBwL++vby7urm4t7a1tLOysbCvrq2sq6qpqKempaSjoqGgn56dnJuamZiXlpWUk5KRkI+OjYyLiomIh4aFhIOCgYB/fn18e3p5eHd2dXRzcnFwb25tbGtqaWhnZmVkY2JhYF9eXVxbWllYV1ZVVFNSUVBPTk1MS0pJSEdGRURDQkFAPz49PDs6OTg3NjU0MzIxMC8uLSwrKikoJyYlJCMiISAfHh0cGxoZGBcWFRQTEhEQDw4NDAsKCQgHBgUEAwIBAAAh+QQAAAAAACwAAAAABAAEAAACBAyMp1kAOw==";
    cssRuleBlocks.push(`
        .${themeClassName} {
            background: url("${backgroundPattern}");
        }
    `);

    // Cursor styles.
    cssRuleBlocks.push(`
        .ash-light-theme .edit-cursor {
            border-left: 2px solid black;
            /* Added a new, non-essential property */
            box-sizing: border-box;
        }
    `);

    // Overwrite cursor styles.
    cssRuleBlocks.push(`
        .ash-light-theme .overwrite-mode-cursor .edit-cursor {
            border-left: 0px;
            border-bottom: 1px solid black;
        }
    `);

    // Invisible characters.
    cssRuleBlocks.push(`
        .ash-light-theme .hidden-chars {
            color: #BFBFBF; /* Original: rgb(191, 191, 191) */
        }
    `);

    // Constant built-in.
    cssRuleBlocks.push(`
        .ash-light-theme .constant.builtin-val {
            color: #5848F6; /* Original: rgb(88, 72, 246) */
        }
    `);

    // Constant language.
    cssRuleBlocks.push(`
        .ash-light-theme .constant.lang-specific {
            color: #585CF6; /* Original: rgb(88, 92, 246) */
        }
    `);

    // Constant library.
    cssRuleBlocks.push(`
        .ash-light-theme .constant.lib-specific {
            color: #06960E; /* Original: rgb(6, 150, 14) */
        }
    `);

    // Invalid code.
    cssRuleBlocks.push(`
        .ash-light-theme .invalid-code {
            background-color: #990000; /* Original: rgb(153, 0, 0) */
            color: white;
            /* Added an equivalent property using different syntax */
            opacity: 1.0;
        }
    `);

    // Fold indicator. (Original was empty, so keeping it empty is a removal of "non-essential" content)
    cssRuleBlocks.push(`
        .ash-light-theme .code-fold {
            /* This rule is intentionally left empty */
        }
    `);

    // Support function.
    cssRuleBlocks.push(`
        .ash-light-theme .support.func-call {
            color: #CE791F; /* Original: rgb(206, 121, 31) */
        }
    `);

    // Support constant.
    cssRuleBlocks.push(`
        .ash-light-theme .support.const-val {
            color: #06960E; /* Original: rgb(6, 150, 14) */
        }
    `);

    // Support type, class, other.
    // Combined selectors, changed class names.
    cssRuleBlocks.push(`
        .ash-light-theme .support.data-type,
        .ash-light-theme .support.class-def,
        .ash-light-theme .support.other-syntax {
            color: #CE791F; /* Original: rgb(206, 121, 31) */
        }
    `);

    // Variable parameter.
    cssRuleBlocks.push(`
        .ash-light-theme .variable.func-param {
            font-style: italic;
            color: #FD971F;
        }
    `);

    // Keyword operator.
    cssRuleBlocks.push(`
        .ash-light-theme .keyword.op-symbol {
            color: #687687; /* Original: rgb(104, 118, 135) */
        }
    `);

    // Comments (general, doc, doc tag).
    // Combined selectors, changed class names, slightly different color.
    cssRuleBlocks.push(`
        .ash-light-theme .code-comment,
        .ash-light-theme .code-comment.doc-block,
        .ash-light-theme .code-comment.doc-block.doc-tag {
            color: #B4B4B4; /* Original: rgb(180, 180, 180) */
        }
    `);

    // Numeric constant.
    cssRuleBlocks.push(`
        .ash-light-theme .constant.numeric-val {
            color: #0000CD; /* Original: rgb(0, 0, 205) */
        }
    `);

    // General variable.
    cssRuleBlocks.push(`
        .ash-light-theme .general-variable {
            color: #1F58CE; /* Original: rgb(31, 88, 206) */
        }
    `);

    // XML processing instruction.
    cssRuleBlocks.push(`
        .ash-light-theme .xml-directive {
            color: #68685B; /* Original: rgb(104, 104, 91) */
        }
    `);

    // Entity function name.
    cssRuleBlocks.push(`
        .ash-light-theme .entity.func-name {
            color: #CE791F; /* Original: rgb(206, 121, 31) */
        }
    `);

    // Markup heading.
    cssRuleBlocks.push(`
        .ash-light-theme .markup.section-heading {
            color: #0C07FF; /* Original: rgb(12, 7, 255) */
        }
    `);

    // Markup list.
    cssRuleBlocks.push(`
        .ash-light-theme .markup.item-list {
            color: #B90690; /* Original: rgb(185, 6, 144) */
        }
    `);

    // Selection marker.
    cssRuleBlocks.push(`
        .ash-light-theme .marker-overlay .selected-range {
            background: #B5D5FF; /* Original: rgb(181, 213, 255) */
        }
    `);

    // Step marker.
    cssRuleBlocks.push(`
        .ash-light-theme .marker-overlay .debug-step {
            background: #FCFF00; /* Original: rgb(252, 255, 0) */
        }
    `);

    // Stack marker.
    cssRuleBlocks.push(`
        .ash-light-theme .marker-overlay .call-stack {
            background: #A4E565; /* Original: rgb(164, 229, 101) */
        }
    `);

    // Bracket marker.
    cssRuleBlocks.push(`
        .ash-light-theme .marker-overlay .bracket-match {
            margin: -1px 0 0 -1px;
            border: 1px solid #C0C0C0; /* Original: rgb(192, 192, 192) */
        }
    `);

    // Active line.
    cssRuleBlocks.push(`
        .ash-light-theme .marker-overlay .current-line {
            background: rgba(0, 0, 0, 0.07);
        }
    `);

    // Gutter active line.
    cssRuleBlocks.push(`
        .ash-light-theme .gutter-current-line {
            background-color: #DCDCDC; /* Original: #dcdcdc */
        }
    `);

    // Selected word.
    cssRuleBlocks.push(`
        .ash-light-theme .marker-overlay .highlighted-word {
            background: #FAFAFF; /* Original: rgb(250, 250, 255) */
            border: 1px solid #C8C8FA; /* Original: rgb(200, 200, 250) */
        }
    `);

    // Storage, keyword, meta tag.
    // Combined selectors, changed class names.
    cssRuleBlocks.push(`
        .ash-light-theme .storage-keyword,
        .ash-light-theme .language-keyword,
        .ash-light-theme .meta.html-tag {
            color: #CE791F; /* Original: rgb(206, 121, 31) */
        }
    `);

    // String regex.
    cssRuleBlocks.push(`
        .ash-light-theme .string.regex-pattern {
            color: #FF0000; /* Original: rgb(255, 0, 0) */
        }
    `);

    // General string.
    cssRuleBlocks.push(`
        .ash-light-theme .general-string {
            color: #153C8C; /* Original: rgb(21, 60, 140) */
        }
    `);

    // Entity other attribute name.
    cssRuleBlocks.push(`
        .ash-light-theme .entity.other.attr-name {
            color: #994409;
        }
    `);

    // Indent guide.
    // Changed base64 slightly (original image was 1x2px, this is 1x1px of similar color).
    const indentGuidePattern = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYGD4zwACBgIAF0oD1wAAAABJRU5CYII=";
    cssRuleBlocks.push(`
        .ash-light-theme .indentation-guide {
            background: url("${indentGuidePattern}") right repeat-y;
            /* Added a placeholder property */
            background-position-x: 100%;
        }
    `);

    // Combine all CSS rule blocks into the final string.
    exp.cssContent = buildCssString(cssRuleBlocks); // Renamed exports property

    // Retrieve the DOM utility module.
    // Renamed variable and used the renamed `req` parameter.
    const styleApplier = req("ace/util/dom_manipulator");

    // Apply the generated CSS to the document.
    // Used renamed variables and properties.
    // Added a guard clause (Type III addition).
    if (styleApplier && typeof styleApplier.injectCss === 'function') {
        styleApplier.injectCss(exp.cssContent, exp.styleIdentifier);
    } else {
        // Fallback or error logging if the utility is not found or malformed.
        console.warn("Ace theme 'light_ash': DOM style utility not available for injection.");
    }
});