/*
 *  Modern Input Text Guidance Module for Legacy Browsers.
 *
 *  Enables HTML5-like placeholder behavior for web forms in older browsers.
 *
 *  Authored by:
 *      A. Developer
 *      September 2023
 *
 */
(function(_jQ) {
    // Determine if the client's browser natively supports the 'placeholder' attribute for input elements.
    var hasNativeHintSupport = ('placeholder' in document.createElement('input'));

    // Extend jQuery's functionality with our custom input hint method.
    _jQ.fn.inputHint = function(directive) {

        // Proceed only if the browser does not offer built-in placeholder functionality.
        if (!hasNativeHintSupport) {

            // Check if a specific operational directive has been provided.
            if (directive) {
                // Evaluate the given instruction.
                switch (directive) {
                    // Case for explicitly clearing the hint text from fields.
                    case 'removeHint':
                        // Iterate through each selected form element.
                        this.each(function() {
                            var targetField = _jQ(this); // Obtain the current input element wrapped in jQuery.
                            // If the field currently displays the hint (i.e., it's "empty" from user's perspective)
                            // or its current value matches the placeholder attribute's text, clear it.
                            if (targetField.data('isHintVisible') || targetField.val() === targetField.attr('placeholder')) {
                                targetField.val(''); // Set the input's value to an empty string.
                            }
                        });
                        break; // Exit the switch statement.
                }
                return this; // Allow for chaining jQuery methods.
            }

            // If no specific directive, apply the default hint logic to all matched elements.
            this.each(function() {
                var currentElement = _jQ(this); // Cache the current element.
                // Ensure this element hasn't already had its hint logic initialized.
                if (!currentElement.data('hintLogicApplied')) {

                    // Attach event handlers for focus, blur, and keyup actions.
                    currentElement
                        .focus(function() { // When an element gains focus.
                            var activeField = _jQ(this); // Reference to the focused element.
                            // If the hint text is currently displayed (meaning the field is logically empty).
                            if (activeField.data('isHintVisible')) {
                                activeField.val('') // Clear the hint text.
                                    .removeClass('fieldHintText'); // Remove the styling class for hint text.
                            }
                        })
                        .blur(function() { // When an element loses focus.
                            var activeField = _jQ(this); // Reference to the blurred element.
                            // If the field is logically empty (hint is visible) or its actual content length is zero.
                            if (activeField.data('isHintVisible') || !activeField.val().length) {
                                activeField.val(activeField.attr('placeholder')) // Populate with the placeholder text.
                                    .addClass('fieldHintText'); // Apply the styling class for hint text.
                            }
                        })
                        .keyup(function() { // On each key press release within the field.
                            var activeField = _jQ(this); // Reference to the element where key was released.
                            // Update the 'isHintVisible' flag based on whether the field's value is empty.
                            activeField.data('isHintVisible', (activeField.val().length === 0));
                        })
                        .data('hintLogicApplied', true); // Mark this element as having its hint logic set up.

                    // Perform an initial check and setup when the page loads or plugin is applied.
                    // If the field is initially empty or contains its own placeholder text, set it up.
                    if (!currentElement.val().length || currentElement.val() === currentElement.attr('placeholder')) {
                        currentElement.val(currentElement.attr('placeholder')) // Insert the placeholder text.
                            .addClass('fieldHintText') // Add the hint styling class.
                            .data('isHintVisible', true); // Indicate that the hint is currently displayed.
                    }
                }
            });
        }

        return this; // Maintain chainability for jQuery methods.

    }; // End of inputHint plugin definition.

})(jQuery); // Pass the global jQuery object into the self-executing function.