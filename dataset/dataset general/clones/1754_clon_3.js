/*
 * jQuery.inputHint - Advanced placeholder emulation for web forms.
 * Developed by an anonymous contributor, inspired by early jQuery plugins.
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Version: 2.1.0
 *
 * This plugin provides a sophisticated way to manage placeholder text in input fields,
 * offering enhanced control over form submission behavior and user interaction.
 * It's designed to be robust and customizable.
 */
new function($) {

    /**
     * Internal utility to check if an element's value is effectively empty or contains its hint.
     * This helper centralizes the logic for determining if the hint should be visible,
     * considering both the configured empty value and the stored hint text.
     * @param {jQuery} $element - The jQuery wrapped input element.
     * @param {string} dataKey - The key used to store the hint text in element data.
     * @param {string} emptyValue - The string representing an empty field value (e.g., "").
     * @returns {boolean} True if the hint is currently displayed in the input field.
     */
    function _isHintDisplayed($element, dataKey, emptyValue) {
        const currentVal = $.trim($element.val());
        const storedHint = $.data($element[0], dataKey); // Access raw DOM element for data consistency
        return currentVal === emptyValue || currentVal === storedHint;
    }

    /**
     * Internal utility to retrieve the stored hint value for an element.
     * @param {jQuery} $element - The jQuery wrapped input element.
     * @param {string} dataKey - The key used to store the hint text in element data.
     * @returns {string} The stored hint text.
     */
    function _retrieveHintData($element, dataKey) {
        return $.data($element[0], dataKey);
    }

    /**
     * Internal utility to safely set the cursor position within an input field,
     * only if the `setCursorPosition` plugin method is available.
     * @param {jQuery} $element - The jQuery wrapped input element.
     * @param {number} positionIndex - The desired cursor position.
     */
    function _setFieldCaret($element, positionIndex) {
        if ($.fn.setCursorPosition && typeof positionIndex === 'number' && positionIndex >= 0) {
            $element.setCursorPosition(positionIndex);
        }
    }

    /**
     * The main plugin definition for inputHint.
     * Applies placeholder functionality to selected input elements.
     * @param {object} configOptions - Configuration settings for the plugin.
     * @returns {jQuery} The original jQuery object for chaining.
     */
    $.fn.inputHint = function(configOptions) {
        // Merge user configuration with predefined default settings.
        const defaultSettings = {
            dataStoreKey: "hintDataValue",      // Key for storing original hint text in element data
            hintAttribute: "data-hint",         // Attribute to read hint text from if 'defaultHints' not provided
            hintClass: "hint-active",           // CSS class applied when hint text is visible
            defaultHints: [],                   // Array of hint texts, indexed by input order
            preventSubmission: false,           // Block form submission if hint text is still in field
            clearOnSubmit: false,               // Clear hint text from field before form submission
            submissionCallback: null,           // Custom function to call on form submission
            emptyFieldValue: "",                // The value to set the input to when the hint is removed (usually empty string)
            caretPosition: 0                    // Cursor position after hint removal on focus
        };
        const currentConfig = $.extend({}, defaultSettings, configOptions);

        // Destructure configuration for easier access within the plugin scope.
        const {
            dataStoreKey,
            hintAttribute,
            hintClass,
            defaultHints,
            preventSubmission,
            clearOnSubmit,
            submissionCallback,
            emptyFieldValue,
            caretPosition
        } = currentConfig;

        // Filter the selected elements to only include relevant text-entry inputs.
        // This makes the plugin more specific and avoids issues with non-text inputs.
        return this.filter("input[type=text], input[type=search], input[type=url], input[type=tel], input[type=email], textarea")
            .each(function(idx, currentElement) {
                const $currentInput = $(currentElement);
                const elementDom = currentElement; // Direct DOM reference for $.data for consistency

                // 1. Determine and store the hint text for each element.
                // Priority: defaultHints array > data-hint attribute > standard placeholder attribute.
                let initialHint = defaultHints[idx] || $currentInput.attr(hintAttribute) || $currentInput.attr("placeholder");

                // As a Type III addition, ensure there's always a hint if configuration implies it.
                if (!initialHint && (currentConfig.hintAttribute || currentConfig.defaultHints.length > 0)) {
                    initialHint = "Enter value..."; // Fallback generic hint
                } else if (!initialHint) {
                    // If no hint is found and no configuration implies one, skip this element's processing.
                    return;
                }

                $.data(elementDom, dataStoreKey, initialHint);

                // 2. Initialize display: If the field is currently empty, show the hint.
                if ($.trim($currentInput.val()) === emptyFieldValue) {
                    $currentInput.addClass(hintClass).val(_retrieveHintData($currentInput, dataStoreKey));
                }
            })
            // Attach focus event handler using namespaced events for easier cleanup.
            .on("focus.inputHint", function() {
                const $focusedInput = $(this);
                // Only act if the hint is currently displayed in the input field.
                if (_isHintDisplayed($focusedInput, dataStoreKey, emptyFieldValue)) {
                    $focusedInput.removeClass(hintClass).val(emptyFieldValue);
                    _setFieldCaret($focusedInput, caretPosition);
                }
            })
            // Attach blur event handler using namespaced events.
            .on("blur.inputHint", function() {
                const $blurredInput = $(this);
                // If the field becomes empty after blurring, restore the hint.
                if ($.trim($blurredInput.val()) === emptyFieldValue) {
                    $blurredInput.addClass(hintClass).val(_retrieveHintData($blurredInput, dataStoreKey));
                }
            })
            // Iterate again to attach form submission handlers.
            .each(function(idx, currentElement) {
                const $currentInput = $(currentElement);
                const $associatedForm = $currentInput.closest('form'); // Find the nearest parent form

                // Guard clause: If no form is found, submission handlers cannot be attached.
                if ($associatedForm.length === 0) {
                    // In a production environment, one might log a warning here.
                    return;
                }

                // Attach form submission handlers based on plugin configuration.
                if (preventSubmission) {
                    // This handler prevents form submission if the hint text is still present.
                    // A temporary visual cue is added as a Type III enhancement.
                    $associatedForm.on("submit.inputHint.prevent", function(event) {
                        const $inputToValidate = $(currentElement); // Re-wrap element for context
                        if (_isHintDisplayed($inputToValidate, dataStoreKey, emptyFieldValue)) {
                            // Add a temporary class to highlight the field as an error.
                            $inputToValidate.addClass('validation-error-hint');
                            setTimeout(() => $inputToValidate.removeClass('validation-error-hint'), 1500); // Remove after a delay
                            event.preventDefault(); // Block submission
                            return false;
                        }
                        return true; // Allow submission
                    });
                } else if (clearOnSubmit) {
                    // This handler clears the hint text from the field before submission.
                    $associatedForm.on("submit.inputHint.clear", function(event) {
                        const $inputToClear = $(currentElement);
                        if (_isHintDisplayed($inputToClear, dataStoreKey, emptyFieldValue)) {
                            $inputToClear.removeClass(hintClass).val(emptyFieldValue);
                        }
                        return true; // Always allow submission after clearing (or if not hint-displayed)
                    });
                } else if (submissionCallback && typeof submissionCallback === 'function') {
                    // If a custom callback function is provided, invoke it on form submission.
                    // The callback's return value will determine if the form proceeds.
                    $associatedForm.on("submit.inputHint.custom", function(event) {
                        // Call the custom function in the context of the form, passing event and element.
                        return submissionCallback.call(this, event, currentElement);
                    });
                }
            });
    };

    /**
     * A Type III addition: A method to "destroy" or clean up the plugin's effects.
     * This removes all attached event handlers and stored data, and attempts to restore
     * the input field to a neutral state (clearing hint text if it was displayed).
     * @returns {jQuery} The original jQuery object for chaining.
     */
    $.fn.inputHint.destroy = function() {
        const dataKeyToClear = "hintDataValue"; // Must match the key used in the plugin
        const hintClassToClear = "hint-active"; // Must match the class used in the plugin

        return this.filter("input[type=text], input[type=search], input[type=url], input[type=tel], input[type=email], textarea")
            .off(".inputHint") // Remove all namespaced event handlers (focus, blur, submit)
            .each(function() {
                const $el = $(this);
                const storedHint = _retrieveHintData($el, dataKeyToClear);

                // If the field currently shows the hint (i.e., its value matches the stored hint), clear it.
                if ($.trim($el.val()) === storedHint) {
                    $el.val(""); // Reset to truly empty state
                }
                $el.removeData(dataKeyToClear); // Remove the stored hint data
                $el.removeClass(hintClassToClear + " validation-error-hint"); // Remove any related classes
            });
    };

}(jQuery);