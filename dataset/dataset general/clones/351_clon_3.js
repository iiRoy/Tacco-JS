define("ace/theme/shadow_hands_dark", ["fetchModule", "exportBundle", "moduleRef", "ace/utils/style_injector"], function(fetchModule, exportBundle, moduleRef, styleInjectorUtility) {
    // This JavaScript module is responsible for defining a dark color scheme for the Ace editor.
    // It configures various visual aspects, from background colors to syntax highlighting.

    // Indicate that this theme is designed for a dark environment.
    exportBundle.isDarkTheme = true;

    // Define the primary CSS class identifier for this specific theme.
    // This helps in scoping the styles to prevent conflicts.
    const themeBaseClass = "ace-shadow-hands";
    exportBundle.styleClassIdentifier = themeBaseClass;

    // --- Dynamic CSS Style Generation ---
    // We'll build the entire CSS stylesheet content programmatically.
    let generatedCssContent = ``;

    /**
     * Appends a new CSS rule to the theme's stylesheet.
     * @param {string} selector - The CSS selector (e.g., ".ace_gutter", ".ace_keyword").
     *                             It will be prefixed with the base theme class.
     * @param {string} properties - The CSS properties for the rule (e.g., "background: #333; color: #fff;").
     */
    const appendCssRule = (selector, properties) => {
        // Ensures all rules are scoped under the main theme class.
        // Special handling for the root selector (empty string) to avoid double class.
        const fullSelector = selector ? `.${themeBaseClass} ${selector}` : `.${themeBaseClass}`;
        generatedCssContent += `${fullSelector} {\n${properties}\n}\n`;
    };

    // Main editor container styles
    appendCssRule(``, `background-color: #2c2c2c;\ncolor: #f0f0f0;`);

    // Gutter (line numbers) styling
    appendCssRule(`.ace_gutter`, `background: #3a3a3a;\ncolor: rgb(160,160,160);`);

    // Print margin indicator
    appendCssRule(`.ace_print-margin`, `width: 1px;\nbackground: #3a3a3a;`);

    // Cursor appearance
    appendCssRule(`.ace_cursor`, `color: #9aff00;`);

    // Text selection styling
    appendCssRule(`.ace_marker-layer .ace_selection`, `background: rgba(85, 105, 130, 0.9);`);

    // Step marker (e.g., used by debuggers to highlight current execution step)
    appendCssRule(`.ace_marker-layer .ace_step`, `background: rgb(110, 85, 0);`);

    // Matching bracket highlighting
    appendCssRule(`.ace_marker-layer .ace_bracket`, `margin: -1px 0 0 -1px;\nborder: 1px solid #454545;`);

    // Active line highlighting (background)
    appendCssRule(`.ace_marker-layer .ace_active-line`, `background: #38393a;`);
    appendCssRule(`.ace_gutter-active-line`, `background-color: #38393a;`);

    // Highlighting for the currently selected word
    appendCssRule(`.ace_marker-layer .ace_selected-word`, `border: 1px solid rgba(85, 105, 130, 0.9);`);

    // Styling for invisible characters (spaces, tabs, etc.)
    appendCssRule(`.ace_invisible`, `color: #484848;`);

    // Keywords and meta information
    appendCssRule(`.ace_keyword,\n.${themeBaseClass} .ace_meta`, `color: #d17c37;`);

    // Various types of constants (numbers, strings, characters, escape sequences)
    appendCssRule(`.ace_constant,\n.${themeBaseClass} .ace_constant.ace_character,\n.${themeBaseClass} .ace_constant.ace_character.ace_escape,\n.${themeBaseClass} .ace_constant.ace_other,\n.${themeBaseClass} .ace_support.ace_constant`, `color: #72a0c0;`);

    // Styling for invalid or erroneous code segments
    appendCssRule(`.ace_invalid`, `color: #ffffff;\nbackground-color: #ff3333;`);

    // Code folding indicators
    appendCssRule(`.ace_fold`, `background-color: #d17c37;\nborder-color: #f0f0f0;`);

    // Support functions (e.g., built-in functions)
    appendCssRule(`.ace_support.ace_function`, `color: #b03020;`);

    // Function parameters
    appendCssRule(`.ace_variable.ace_parameter`, `font-style: italic;`);

    // String literals
    appendCssRule(`.ace_string`, `color: #a0c060;`);

    // Regular expressions
    appendCssRule(`.ace_string.ace_regexp`, `color: #d0d030;`);

    // Comments in code
    appendCssRule(`.ace_comment`, `font-style: italic;\ncolor: #c09860;`);

    // Meta tags (often used in HTML/XML)
    appendCssRule(`.ace_meta.ace_tag`, `color: #ffebb0;`);

    // Entity names (e.g., HTML tags, XML elements)
    appendCssRule(`.ace_entity.ace_name`, `color: #ffd070;`);

    // Collaborative editing user 1 indicator
    appendCssRule(`.ace_collab.ace_user1`, `color: #2c2c2c;\nbackground-color: #fff888;`);

    // Indent guides (vertical dotted lines for indentation levels)
    // This is a 1x2 pixel image, with the bottom pixel being a dark gray (#505050).
    const indentGuideImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAFklEQVQImWNkZGT8z0ABYQMQYgIHBgDDAwAEkQYEoO0JkwAAAABJRU5ErkJggg==";
    appendCssRule(`.ace_indent-guide`, `background: url(data:image/png;base64,${indentGuideImageBase64}) right repeat-y;`);

    // Add a new, non-essential rule for search markers, enhancing Type III changes.
    appendCssRule(`.ace_marker-layer .ace_search_marker`, `background-color: rgba(255, 255, 0, 0.2);\nborder: 1px solid rgba(255, 255, 0, 0.8);`);

    // Assign the complete generated CSS string to the export bundle.
    exportBundle.styleSheetContent = generatedCssContent;

    // Fetch the utility module responsible for injecting styles into the DOM.
    const styleInjectionHelper = fetchModule("ace/utils/style_injector");

    // Before attempting to inject styles, perform a validation check.
    // This ensures that the CSS content exists and the injection utility is available and callable.
    if (exportBundle.styleSheetContent && styleInjectionHelper && typeof styleInjectionHelper.injectStyleContent === 'function') {
        // Apply the generated CSS rules to the document.
        styleInjectionHelper.injectStyleContent(exportBundle.styleSheetContent, exportBundle.styleClassIdentifier);
    } else {
        // Log a warning if the style injection process could not be completed,
        // which might indicate a missing dependency or an issue with the CSS content.
        console.warn("Theme 'shadow_hands_dark': Failed to inject styles. Content or injector utility is missing or invalid.");
        // Set a flag to indicate that the theme's styles might not be active.
        exportBundle.injectionFailed = true;
    }
});