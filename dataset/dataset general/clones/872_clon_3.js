// This module handles the dynamic setup and interaction for code demonstration sections.
// It allows users to view and edit HTML, CSS, and JavaScript snippets directly on the page.
jQuery(document).ready(function() {

    // Define some constants for better maintainability and clarity.
    const DISPLAY_CLASS_PREFIX = 'code-display-';
    const TOGGLE_LINK_CLASS = 'code-toggle-link';
    const INTERACTIVE_SECTION_SELECTOR = 'section.interactive-demo';
    const LIVE_PREVIEW_SELECTOR = '.live-output, .alternate-output';
    const MARKUP_SOURCE_CLASS = 'markup-source';
    const SCRIPT_SOURCE_CLASS = 'script-source';
    const STYLE_SOURCE_CLASS = 'style-source';
    const TOOLTIP_MESSAGE = 'This is an editable code snippet. Modify the code and click outside the editor to see changes. Reload the page to revert.';

    // Process each designated interactive demonstration section.
    jQuery(INTERACTIVE_SECTION_SELECTOR).each(function(index, sectionElement) {
        const $currentSection = jQuery(sectionElement);

        // Identify the elements where the live output will be displayed.
        const $previewElements = $currentSection.find(LIVE_PREVIEW_SELECTOR);

        // --- Handle HTML Source Display ---
        // Clone the live preview's HTML content for display.
        const originalMarkupContent = jQuery('<div />').append($previewElements.clone()).html();
        const $markupDisplayContainer = jQuery(`<div class="${MARKUP_SOURCE_CLASS}"></div>`)
            .append(sanitizeHtmlEntities(originalMarkupContent));

        // Create a toggle button for the HTML source.
        const $markupToggleButton = jQuery(`<div class="${TOGGLE_LINK_CLASS}"><a href="#" aria-label="Toggle HTML code visibility">HTML</a></div>`)
            .on('click', function(event) {
                event.preventDefault(); // Prevent default link behavior.
                $markupDisplayContainer.slideToggle(200); // Smooth toggle animation.
            });

        // --- Handle JavaScript Source Display ---
        // Locate the script content within the current section.
        const $scriptContentArea = $currentSection.find('.js');
        const hasScriptContent = $scriptContentArea.length > 0;

        // Create a toggle button for the JavaScript source.
        const $scriptToggleButton = jQuery(`<div class="${TOGGLE_LINK_CLASS}"><a href="#" aria-label="Toggle JavaScript code visibility">JavaScript</a></div>`)
            .on('click', function(event) {
                event.preventDefault();
                $scriptContentArea.slideToggle(200);
            });

        // --- Handle CSS Source Display ---
        // Check for inline style blocks in the current section.
        let $styleDisplayContainer;
        let $styleToggleButton;
        const $inlineStyleElements = $currentSection.find('style');
        const hasInlineStyles = $inlineStyleElements.length > 0;

        if (hasInlineStyles) {
            const cssContent = $inlineStyleElements.html();
            $styleDisplayContainer = jQuery(`<div class="${STYLE_SOURCE_CLASS}"></div>`)
                .append(cssContent); // CSS doesn't need HTML entity escaping for display.

            // Create a toggle button for the CSS source.
            $styleToggleButton = jQuery(`<div class="${TOGGLE_LINK_CLASS}"><a href="#" aria-label="Toggle CSS code visibility">CSS</a></div>`)
                .on('click', function(event) {
                    event.preventDefault();
                    $styleDisplayContainer.slideToggle(200);
                });
        }

        // --- Arrange and Initialize Elements ---

        // Append the toggle buttons and source displays before the script content.
        // This ensures a consistent order: HTML, CSS (if present), then JS.
        $scriptContentArea.before($markupToggleButton);
        $scriptContentArea.before($markupDisplayContainer);
        configureCodeEditor($markupDisplayContainer); // Convert div to textarea editor.
        $markupDisplayContainer.hide(); // Initially hide the HTML editor.

        // Setup HTML editor change handler.
        $markupDisplayContainer.find('textarea').data('targetElement', $previewElements.get(0))
            .on('input propertychange', debounce(function() { // Use 'input' for real-time updates.
                const newContent = jQuery(this).val();
                const targetEl = jQuery(this).data('targetElement');
                if (targetEl) {
                    const newDomElement = jQuery(newContent).get(0);
                    if (newDomElement) { // Ensure the new content is valid HTML.
                        jQuery(targetEl).replaceWith(newDomElement);
                        jQuery(this).data('targetElement', newDomElement); // Update reference.
                    } else {
                        console.warn('Invalid HTML entered:', newContent);
                    }
                }
            }, 500)); // Debounce to prevent excessive DOM manipulation.


        if (hasInlineStyles) {
            $scriptContentArea.before($styleToggleButton);
            $scriptContentArea.before($styleDisplayContainer);
            configureCodeEditor($styleDisplayContainer);
            $styleDisplayContainer.hide(); // Initially hide the CSS editor.

            // CSS editor change handler (optional, depends on how CSS is applied).
            // For simplicity, we'll just let it be editable for now, no live update for inline style tags.
            // A more complex solution would involve updating the actual style element or creating a new one.
        }

        // Place the JavaScript toggle button.
        $scriptContentArea.before($scriptToggleButton);

        // Execute the initial JavaScript code if available.
        if (hasScriptContent && $scriptContentArea.html().trim().length > 0) {
            try {
                // Wrap in a function to isolate scope and prevent global pollution.
                // This is a safer alternative to raw eval in some contexts.
                // For this clone, we'll stick closer to eval, but add a wrapper.
                const scriptText = $scriptContentArea.html();
                new Function(scriptText)(); // Execute the script.
            } catch (error) {
                console.error("Error executing initial script:", error);
                // Optionally display error message to user.
            }
        } else {
            // If no script content, perhaps hide the JS toggle button or disable it.
            $scriptToggleButton.hide();
        }

        // Convert JS div to textarea editor.
        configureCodeEditor($scriptContentArea, true);
        $scriptContentArea.hide(); // Initially hide the JS editor.

        // Setup JS editor change handler.
        $scriptContentArea.find('textarea').on('input propertychange', debounce(function() {
            const updatedScript = jQuery(this).val();
            if (updatedScript.trim().length > 0) {
                try {
                    // Re-execute the updated script. Consider resetting previous state if necessary.
                    new Function(updatedScript)();
                } catch (error) {
                    console.error("Error executing updated script:", error);
                    // Provide user feedback on script errors.
                }
            }
        }, 750)); // Debounce for JS execution.
    });

    // Apply a custom tooltip to all code editor textareas for guidance.
    jQuery(`.${MARKUP_SOURCE_CLASS} textarea, .${SCRIPT_SOURCE_CLASS} textarea, .${STYLE_SOURCE_CLASS} textarea`).bt(TOOLTIP_MESSAGE, {
        positions: 'right',
        trigger: ['focus', 'blur'],
        overlap: 10, // Slightly more overlap.
        width: 180, // Wider tooltip.
        cssStyles: {
            fontSize: '12px',
            lineHeight: '1.4'
        }
    });
});


/**
 * Converts a given HTML element's content into an editable textarea,
 * adjusting its size dynamically.
 * @param {jQuery} $containerElement - The jQuery object of the container to be converted.
 * @param {boolean} [shouldEscape=false] - Whether to HTML-escape the content before putting it into the textarea.
 */
function configureCodeEditor($containerElement, shouldEscape = false) {
    let rawContent = $containerElement.html();

    if (shouldEscape) {
        rawContent = sanitizeHtmlEntities(rawContent);
    }

    // Clear the container and append a new textarea with the content.
    $containerElement.html('').append(
        jQuery('<textarea></textarea>').val(rawContent)
    );

    const $editorTextarea = $containerElement.find('textarea');
    $editorTextarea.css('width', '100%');

    // Adjust textarea height based on scrollHeight for better fit.
    // Use a minimum height of 5 lines (approx 75px assuming 15px line-height).
    const minHeight = 75;
    const actualScrollHeight = $editorTextarea.get(0).scrollHeight;
    $editorTextarea.css('height', Math.max(actualScrollHeight, minHeight) + 'px');

    // Re-adjust height on window resize, for responsive behavior.
    jQuery(window).on('resize', debounce(() => {
        const currentScrollHeight = $editorTextarea.get(0).scrollHeight;
        $editorTextarea.css('height', Math.max(currentScrollHeight, minHeight) + 'px');
    }, 200)); // Debounce resize event.
}

/**
 * Escapes HTML entities in a string to prevent XSS and display HTML as text.
 * @param {string} rawString - The input string containing potential HTML.
 * @returns {string} The HTML-escaped string.
 */
function sanitizeHtmlEntities(rawString) {
    if (typeof rawString !== 'string') {
        return ''; // Handle non-string inputs gracefully.
    }
    const temporaryDiv = document.createElement('div');
    temporaryDiv.appendChild(document.createTextNode(rawString));
    return temporaryDiv.innerHTML;
}

/**
 * Debounce function to limit how often a function can run.
 * Useful for events like 'resize' or 'input'.
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {Function} The debounced function.
 */
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}