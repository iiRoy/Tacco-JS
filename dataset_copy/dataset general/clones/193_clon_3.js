/**
 * jQuery Accessibility Input Fallback Plugin.
 *
 * This utility enhances user experience for legacy browser environments
 * by simulating the HTML5 'placeholder' attribute behavior on input fields
 * and textareas, ensuring a consistent interface across various platforms.
 *
 * Developed by:
 *    [Pseudonym] - Core Logic Architect
 *    [Date]      - Initial Implementation Phase (circa 2024)
 *
 * Version: 1.1.0
 * License: MIT (or similar permissive license)
 */
(function (jqFactory) {
    "use strict"; // Enforce stricter parsing and error handling

    // --- Internal Configuration and Constants ---
    const FALLBACK_CSS_CLASS = 'placeholder-active-polyfill'; // Class applied when placeholder is visible
    const DATA_KEY_INITIALIZED = 'polyfillHandlersAttached'; // Data key to track if handlers are set
    const DATA_KEY_IS_EMPTY = 'contentHasNoValue'; // Data key to track if input is truly empty
    const NATIVE_PLACEHOLDER_SUPPORT_CHECK = (function () {
        // Evaluate native support for the placeholder attribute once
        const testInput = document.createElement('input');
        return 'placeholder' in testInput;
    })();

    // --- Helper Functions (Private to the module) ---

    /**
     * Retrieves the native placeholder attribute value from a jQuery-wrapped element.
     * @param {jQuery} jQElement - The jQuery-wrapped input or textarea element.
     * @returns {string|null} The placeholder text, or null if not found.
     */
    function retrievePlaceholderAttribute(jQElement) {
        const attributeValue = jQElement.attr('placeholder');
        return (typeof attributeValue === 'string' && attributeValue.length > 0) ? attributeValue : null;
    }

    /**
     * Determines if the input's current value is genuinely empty.
     * @param {jQuery} jQElement - The jQuery-wrapped input or textarea element.
     * @returns {boolean} True if the input has no value, false otherwise.
     */
    function isInputContentTrulyEmpty(jQElement) {
        return jQElement.val().length === 0;
    }

    /**
     * Checks if the input field is currently displaying the placeholder text.
     * This relies on the internal DATA_KEY_IS_EMPTY flag.
     * @param {jQuery} jQElement - The jQuery-wrapped input or textarea element.
     * @returns {boolean} True if the placeholder text is currently displayed.
     */
    function isPlaceholderCurrentlyDisplayed(jQElement) {
        return jQElement.data(DATA_KEY_IS_EMPTY) === true;
    }

    /**
     * Activates the placeholder display on an input field.
     * @param {jQuery} jQElement - The jQuery-wrapped input or textarea element.
     * @param {string} textToDisplay - The placeholder text to set.
     */
    function showPlaceholderText(jQElement, textToDisplay) {
        jQElement.val(textToDisplay).addClass(FALLBACK_CSS_CLASS);
        jQElement.data(DATA_KEY_IS_EMPTY, true);
    }

    /**
     * Deactivates the placeholder display on an input field.
     * @param {jQuery} jQElement - The jQuery-wrapped input or textarea element.
     */
    function hidePlaceholderText(jQElement) {
        jQElement.val('').removeClass(FALLBACK_CSS_CLASS);
        jQElement.data(DATA_KEY_IS_EMPTY, false);
    }

    // --- jQuery Plugin Definition ---

    /**
     * jQuery plugin to provide HTML5 placeholder fallback functionality.
     * @param {string} [actionIdentifier] - Optional command like 'clearFormInputs' or 'refreshState'.
     * @returns {jQuery} The jQuery object for chaining.
     */
    jqFactory.fn.fallbackPlaceholder = function (actionIdentifier) {
        // If the browser natively supports placeholder, exit early.
        if (NATIVE_PLACEHOLDER_SUPPORT_CHECK) {
            return this;
        }

        // Ensure we're working with a valid selection.
        if (!this.length) {
            return this;
        }

        // --- Handle specific actions/commands ---
        if (typeof actionIdentifier === 'string') {
            switch (actionIdentifier.toLowerCase()) {
                case 'clearforminputs':
                    // Iterates through selected elements and clears their value
                    // if they are currently displaying the placeholder text.
                    this.each(function () {
                        const targetField = jqFactory(this);
                        if (isPlaceholderCurrentlyDisplayed(targetField)) {
                            hidePlaceholderText(targetField);
                        }
                    });
                    break;
                case 'refreshstate':
                    // Forces a re-evaluation of the placeholder state for selected elements.
                    // This can be useful if the placeholder attribute or input value changes programmatically.
                    this.each(function () {
                        const targetField = jqFactory(this);
                        const currentPlaceholder = retrievePlaceholderAttribute(targetField);

                        // If no placeholder, nothing to do.
                        if (!currentPlaceholder) {
                            return;
                        }

                        // Remove existing handlers to re-bind cleanly
                        targetField.removeData(DATA_KEY_INITIALIZED);
                        targetField.off('.fallbackPlaceholder'); // Namespace events to remove only ours

                        // Re-initialize the field
                        initializeFieldForFallback(targetField);
                    });
                    break;
                default:
                    // Log a warning for unknown commands.
                    console.warn(`fallbackPlaceholder: Unknown command received - "${actionIdentifier}"`);
            }
            return this; // Return for chaining after command execution.
        }

        // --- Main Initialization Logic (no command provided) ---

        /**
         * Initializes an individual input field with placeholder fallback logic.
         * @param {jQuery} currentInputElement - The jQuery-wrapped input/textarea to initialize.
         */
        function initializeFieldForFallback(currentInputElement) {
            // Guard against re-initialization for the same element
            if (currentInputElement.data(DATA_KEY_INITIALIZED)) {
                return;
            }

            const currentElementPlaceholder = retrievePlaceholderAttribute(currentInputElement);

            // If an element doesn't have a placeholder attribute, skip it.
            if (!currentElementPlaceholder) {
                // console.log("fallbackPlaceholder: Element has no placeholder attribute, skipping.", currentInputElement[0]); // Optional debug
                return;
            }

            // Bind event handlers with a namespace to allow easy unbinding later.
            currentInputElement
                .on('focus.fallbackPlaceholder', function () {
                    const focusedElement = jqFactory(this);
                    // If the field is currently showing the placeholder, clear it.
                    if (isPlaceholderCurrentlyDisplayed(focusedElement)) {
                        hidePlaceholderText(focusedElement);
                    }
                })
                .on('blur.fallbackPlaceholder', function () {
                    const blurredElement = jqFactory(this);
                    // If the field is truly empty after blur, show the placeholder.
                    if (isInputContentTrulyEmpty(blurredElement)) {
                        showPlaceholderText(blurredElement, currentElementPlaceholder);
                    }
                })
                .on('keyup.fallbackPlaceholder', function () {
                    const typedElement = jqFactory(this);
                    // Update the internal 'isEmpty' flag based on actual content length.
                    typedElement.data(DATA_KEY_IS_EMPTY, isInputContentTrulyEmpty(typedElement));
                });

            // Set the initial state of the input field.
            // If the field is empty or already contains the placeholder text (e.g., from a page refresh),
            // display the placeholder and mark it as such.
            const initialValue = currentInputElement.val();
            const initialIsEmpty = isInputContentTrulyEmpty(currentInputElement);

            if (initialIsEmpty || initialValue === currentElementPlaceholder) {
                showPlaceholderText(currentInputElement, currentElementPlaceholder);
            } else {
                // If it has actual content, ensure the flag is set correctly.
                currentInputElement.data(DATA_KEY_IS_EMPTY, false);
            }

            // Mark this element as having its fallback handlers attached.
            currentInputElement.data(DATA_KEY_INITIALIZED, true);
        }

        // Apply initialization to all selected elements.
        this.each(function () {
            initializeFieldForFallback(jqFactory(this));
        });

        return this; // Maintain chainability.
    };

})(window.jQuery); // Pass window.jQuery explicitly for clarity and scope control