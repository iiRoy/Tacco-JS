(function(jq) {

    /*
     * This module provides a robust fallback mechanism for HTML5 placeholder attributes
     * in older web browsers that do not natively support them. It effectively simulates
     * the placeholder behavior for various input fields, including password types,
     * ensuring a consistent user experience across different browser environments.
     *
     * Original concept by Dan Bentley.
     * Licensed under the Apache License 2.0 (retained for this derivative work).
     *
     * This extensively modified version includes renamed identifiers, structural
     * refactorings, additional helper variables, and enhanced logic to demonstrate
     * Type III code cloning while preserving the core functionality.
     */

    /**
     * Constant for the data attribute key used to track user input.
     * This prevents magic strings and improves maintainability.
     * @type {string}
     */
    const USER_CONTENT_FLAG = 'user_input_detected';

    /**
     * Constant for the HTML5 placeholder attribute name.
     * @type {string}
     */
    const HINT_ATTRIBUTE_NAME = 'placeholder';

    // Perform a quick feature detection for native placeholder support.
    // If supported, there's no need for this polyfill, so we exit early.
    if (HINT_ATTRIBUTE_NAME in document.createElement('input')) {
        return; // Browser has native support; terminate script execution.
    }

    // Crucial check: ensure the jQuery object is available before attempting DOM manipulation.
    // Without jQuery, this script cannot function correctly.
    if (typeof jq === 'undefined' || !jq.fn || !jq.fn.jquery) {
        console.error('Placeholder polyfill requires jQuery to be loaded. Aborting initialization.');
        return;
    }

    // Execute the placeholder initialization logic once the entire DOM is ready for interaction.
    jq(document).ready(function() {
        // First, process all standard text input fields and textareas that possess a placeholder attribute.
        // We specifically exclude password fields here, as they require a different handling strategy.
        jq('input:text[' + HINT_ATTRIBUTE_NAME + '], textarea[' + HINT_ATTRIBUTE_NAME + ']').each(function() {
            initializeRegularHintField(jq(this));
        });

        // Next, address password input fields that have a placeholder.
        // These fields need a visual proxy due to security reasons preventing direct value manipulation.
        jq('input:password[' + HINT_ATTRIBUTE_NAME + ']').each(function() {
            orchestratePasswordHintDisplay(jq(this));
        });

        // Attach a global submit handler to all forms. This ensures that placeholder text
        // is removed from fields before submission, preventing it from being sent to the server.
        jq('form').on('submit.hintPolyfill', function(eventData) { // Use .on() for better practice and namespacing
            scrubPlaceholderContentOnSubmit(jq(this));
        });
    });

    /**
     * Initializes and manages the placeholder behavior for standard text and textarea elements.
     * This involves setting initial states and attaching event listeners for dynamic interaction.
     *
     * @param {jQuery} currentElement - The jQuery object representing the input or textarea element.
     */
    function initializeRegularHintField(currentElement) {
        const hintContent = currentElement.attr(HINT_ATTRIBUTE_NAME); // Retrieve the placeholder text.

        // If no placeholder attribute is present, there's nothing for this function to do.
        if (!hintContent) {
            return;
        }

        // Apply the initial visual state: show hint if empty, or mark as user-modified if pre-filled.
        setInitialElementState(currentElement, hintContent);

        // Bind event handlers to manage the hint's visibility based on user interaction.
        currentElement
            .on('focus.hintPolyfill', function() {
                // If the user has already entered content, do not interfere.
                if (currentElement.data(USER_CONTENT_FLAG) === true) {
                    return;
                }
                // If the current value is the placeholder, clear it on focus.
                if (currentElement.val() === hintContent) {
                    currentElement.val('');
                }
            })
            .on('blur.hintPolyfill', function() {
                // If the field is empty when losing focus, restore the placeholder text.
                if (currentElement.val() === '') {
                    currentElement.val(hintContent);
                }
            })
            .on('input.hintPolyfill propertychange.hintPolyfill', function() { // Handle dynamic input changes
                // Update the user content flag based on whether the input's value differs from the hint.
                const hasUserProvidedInput = (currentElement.val() !== '' && currentElement.val() !== hintContent);
                currentElement.data(USER_CONTENT_FLAG, hasUserProvidedInput);
            });
    }

    /**
     * Sets the initial value and user content flag for an input field.
     * If the input is empty, it displays the placeholder text. Otherwise, it marks the field as having user content.
     *
     * @param {jQuery} elementToConfigure - The jQuery input element.
     * @param {string} displayHintText - The placeholder text to potentially display.
     */
    function setInitialElementState(elementToConfigure, displayHintText) {
        const currentFieldValue = elementToConfigure.val();
        if (currentFieldValue === '') {
            elementToConfigure.val(displayHintText);
            elementToConfigure.data(USER_CONTENT_FLAG, false); // No user input yet.
        } else {
            // Field is pre-filled, so assume it contains valid user content.
            elementToConfigure.data(USER_CONTENT_FLAG, true);
        }
    }

    /**
     * Manages the visual display of placeholder text for password input fields.
     * This involves creating a separate, visible text input that acts as a proxy for the placeholder.
     *
     * @param {jQuery} originalPasswordField - The jQuery object for the actual password input.
     */
    function orchestratePasswordHintDisplay(originalPasswordField) {
        const passwordHintValue = originalPasswordField.attr(HINT_ATTRIBUTE_NAME);

        // If no placeholder text is defined for this password field, nothing to do.
        if (!passwordHintValue) {
            return;
        }

        // Generate a read-only text input element that will display the placeholder text.
        const hintProxyInput = createPasswordHintProxyElement(originalPasswordField, passwordHintValue);
        originalPasswordField.after(hintProxyInput); // Insert the proxy immediately after the real password field.

        // Determine initial visibility: if the password field has content, hide the proxy; otherwise, hide the password field.
        const isPasswordPreFilled = originalPasswordField.val() !== '';
        if (isPasswordPreFilled) {
            hintProxyInput.hide(); // Hide the proxy if there's actual password data.
        } else {
            originalPasswordField.hide(); // Hide the real password field, showing the proxy instead.
        }

        // Attach event handlers to toggle visibility between the real password field and its proxy.
        originalPasswordField.on('blur.hintPolyfill', function() {
            if (originalPasswordField.val() === '') {
                originalPasswordField.hide();
                hintProxyInput.show();
            }
        });

        hintProxyInput.on('focus.hintPolyfill', function() {
            originalPasswordField.show().focus(); // Reveal and focus the actual password input.
            hintProxyInput.hide();
        });
    }

    /**
     * Constructs a read-only text input element that serves as a visual placeholder
     * for a sensitive password field. It copies relevant attributes for styling and accessibility.
     *
     * @param {jQuery} sourcePasswordInput - The original password input element.
     * @param {string} hintTextContent - The placeholder text to be displayed in the proxy.
     * @returns {jQuery} A new jQuery object representing the generated proxy input.
     */
    function createPasswordHintProxyElement(sourcePasswordInput, hintTextContent) {
        // Generate a unique ID for the proxy by appending '-hint' to the original ID, if available.
        const proxyElementId = sourcePasswordInput.attr('id') ? sourcePasswordInput.attr('id') + '-hint-proxy' : null;
        // Copy existing classes to maintain consistent styling.
        const inheritedClasses = sourcePasswordInput.attr('class');

        // Create the new input element and set its essential attributes.
        const generatedProxy = jq('<input>')
            .attr({
                type: 'text', // Crucial: make it a text field so the hint is visible.
                value: hintTextContent,
                readonly: 'readonly', // Prevent direct user input into the proxy.
                tabindex: sourcePasswordInput.attr('tabindex') || '0' // Copy tabindex for accessibility.
            })
            .addClass('placeholder-proxy-element'); // Add a unique class for specific styling.

        // Conditionally apply ID and additional classes if they exist on the source element.
        if (proxyElementId) {
            generatedProxy.attr('id', proxyElementId);
        }
        if (inheritedClasses) {
            generatedProxy.addClass(inheritedClasses);
        }

        // Copy other useful attributes for better form integration and accessibility.
        // This ensures the proxy behaves more like the original in terms of layout/description.
        ['name', 'aria-describedby', 'aria-labelledby'].forEach(function(attrName) {
            const attrValue = sourcePasswordInput.attr(attrName);
            if (attrValue) {
                generatedProxy.attr(attrName, attrValue);
            }
        });

        // Add a custom data attribute to easily identify this element as a generated proxy.
        generatedProxy.data('is-placeholder-proxy', true);

        return generatedProxy;
    }

    /**
     * Iterates through all relevant input fields within a form just before submission
     * and clears any placeholder text that might be present, preventing it from being
     * submitted as actual form data.
     *
     * @param {jQuery} targetFormElement - The jQuery object representing the form being submitted.
     */
    function scrubPlaceholderContentOnSubmit(targetFormElement) {
        // Select all text-like inputs and textareas that have a placeholder attribute.
        targetFormElement.find('input:text[' + HINT_ATTRIBUTE_NAME + '], textarea[' + HINT_ATTRIBUTE_NAME + ']').each(function() {
            const currentProcessedField = jq(this);
            const currentHintText = currentProcessedField.attr(HINT_ATTRIBUTE_NAME);

            // Only clear the value if the field has NOT been modified by the user
            // AND its current value is exactly the placeholder text.
            if (currentProcessedField.data(USER_CONTENT_FLAG) !== true && currentProcessedField.val() === currentHintText) {
                currentProcessedField.val(''); // Clear the placeholder value.
            }
        });

        // Password fields handled by `orchestratePasswordHintDisplay` don't need special clearing here.
        // The actual password field is either empty or contains user input; the proxy is hidden.
    }

})(window.jQuery); // Explicitly pass the global jQuery object to the IIFE.