/*
 * Input Hinting Utility for Legacy Browsers
 *
 * Provides cross-browser emulation for the HTML5 'placeholder' attribute.
 * This script is designed to run within an environment where jQuery is available.
 *
 * LICENSE: This software is provided under the MIT License.
 *
 * Copyright (c) 2023 Placeholder Emulation Team
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(function(jQ) {
    // Ensure jQuery is loaded before proceeding with any functionality.
    // This acts as a crucial guard clause for the utility's operation.
    if (typeof jQ === 'undefined' || !jQ.fn) {
        console.error('jQuery library is not detected. Input Hinting Utility cannot initialize.');
        return; // Abort execution if jQuery is unavailable.
    }

    /**
     * Initializes placeholder emulation for input fields lacking native support.
     * This method searches for elements with a specified attribute and applies
     * interactive hint behavior.
     *
     * @param {object} userOptions - Configuration settings to customize behavior.
     * @param {string} [userOptions.visualHintClass='input-hint'] - The CSS class
     *   applied to form elements when they are displaying the hint text.
     * @param {string} [userOptions.hintAttributeName='data-hint-text'] - The name
     *   of the HTML attribute from which to retrieve the hint text for an element.
     */
    jQ.configureInputHinting = function(userOptions) {
        // Define the default operational settings for the hinting utility.
        const defaultSettings = {
            visualHintClass: 'input-hint', // Default class for placeholder styling
            hintAttributeName: 'data-hint-text' // Default attribute to fetch hint text
        };

        // Merge user-provided options with the defaults to create the final configuration.
        // An empty object `{}` is used as the first argument to ensure a non-destructive merge.
        const computedConfig = jQ.extend({}, defaultSettings, userOptions);

        // Perform a preliminary check for native browser placeholder support.
        // This check is only relevant if the configured attribute name is the standard 'placeholder'.
        if (computedConfig.hintAttributeName === 'placeholder') {
            try {
                // Attempt to create a temporary input element to test for 'placeholder' property.
                const tempInputProbe = document.createElement('input');
                if ('placeholder' in tempInputProbe) {
                    // If the 'placeholder' property exists, the browser supports it natively.
                    // In this scenario, the polyfill is not required, so we exit early.
                    return;
                }
            } catch (creationError) {
                // Log a warning if document.createElement fails (highly unlikely in a browser context),
                // but proceed with polyfill as native support couldn't be confirmed.
                console.warn('Could not reliably check for native placeholder support due to a DOM error:', creationError);
            }
        }

        // Construct the jQuery selector to find all target elements that possess the
        // configured hint attribute.
        const targetElementsSelector = '[' + computedConfig.hintAttributeName + ']';

        // Iterate over each selected element to apply the hinting logic.
        jQ(targetElementsSelector).each(function() {
            const targetFieldElement = jQ(this); // Wrap the current DOM element in a jQuery object.
            const associatedForm = targetFieldElement.closest('form'); // Find the nearest parent form.
            const displayedHintContent = targetFieldElement.attr(computedConfig.hintAttributeName);

            // Skip processing for elements that do not have hint content or are not
            // typical input/textarea fields. This is a crucial validation step.
            if (!displayedHintContent || !targetFieldElement.is('input, textarea')) {
                return true; // Continue to the next element in the jQuery .each loop.
            }

            // Initialize a custom data flag on the element to track user interaction.
            // 'hasUserEdited' will be set to true if the user has typed actual content,
            // and false if the field is empty or displaying the hint.
            targetFieldElement.data('hasUserEdited', false);

            // Bind event handlers for focus, blur, and keyup events to manage the hint display.
            // Events are namespaced with '.inputHint' to prevent conflicts with other scripts.
            targetFieldElement
                .on('focus.inputHint', function() {
                    const currentFieldValue = targetFieldElement.val();
                    const hasBeenEdited = targetFieldElement.data('hasUserEdited');

                    // If the field currently displays the hint and the user hasn't explicitly
                    // typed content (i.e., it's still the placeholder state), clear the field.
                    if (currentFieldValue === displayedHintContent && !hasBeenEdited) {
                        targetFieldElement.removeClass(computedConfig.visualHintClass);
                        targetFieldElement.val('');
                    }
                })
                .on('blur.inputHint', function() {
                    const currentFieldValue = targetFieldElement.val();

                    // If the field is currently empty, restore the hint text and mark it
                    // as not having user-edited content.
                    if (currentFieldValue === '') {
                        targetFieldElement.data('hasUserEdited', false);
                        targetFieldElement.val(displayedHintContent);
                        targetFieldElement.addClass(computedConfig.visualHintClass);
                    } else {
                        // If the field contains non-empty text, it means the user has
                        // provided input, so mark it as edited and ensure the hint class is removed.
                        targetFieldElement.data('hasUserEdited', true);
                        targetFieldElement.removeClass(computedConfig.visualHintClass);
                    }
                })
                .on('keyup.inputHint', function(keyboardEvent) {
                    const currentFieldValue = targetFieldElement.val();

                    // Special handling for the Enter key: if pressed on an empty field,
                    // restore the hint state.
                    if (keyboardEvent.keyCode === 13 && currentFieldValue === '') {
                        targetFieldElement.data('hasUserEdited', false);
                        targetFieldElement.val(displayedHintContent);
                        targetFieldElement.addClass(computedConfig.visualHintClass);
                    }
                    // If the current value is not the hint text, assume user has typed.
                    else if (currentFieldValue !== displayedHintContent) {
                        targetFieldElement.data('hasUserEdited', true);
                        targetFieldElement.removeClass(computedConfig.visualHintClass);
                    }
                });

            // Trigger the blur event immediately upon initialization to set the correct
            // initial state (i.e., display the placeholder if the field is initially empty).
            targetFieldElement.trigger('blur.inputHint');

            // Attach a handler to the associated form's submit event.
            // This prevents the placeholder text from being submitted with the form.
            if (associatedForm.length > 0) { // Ensure a form element was successfully found.
                associatedForm.on('submit.inputHint', function() {
                    // If the field still displays the hint text (meaning the user hasn't
                    // edited it), temporarily clear its value before form submission.
                    if (!targetFieldElement.data('hasUserEdited') && targetFieldElement.val() === displayedHintContent) {
                        targetFieldElement.val(''); // Clear the value to submit an empty string.

                        // Use a short asynchronous delay to restore the hint text AFTER
                        // the browser has processed the form submission. This ensures
                        // the UI state is correctly maintained if the submission is
                        // interrupted or if the page doesn't fully reload.
                        setTimeout(function() {
                            if (!targetFieldElement.data('hasUserEdited')) {
                                targetFieldElement.val(displayedHintContent);
                                targetFieldElement.addClass(computedConfig.visualHintClass);
                            }
                        }, 50); // A small delay (e.g., 50ms) is typically sufficient.
                    }
                });
            }
        });
    };
})(window.jQuery);