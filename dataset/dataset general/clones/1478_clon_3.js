/*
 * TextEditorUtilities.js
 * Authored by A. Coder, 2023
 * This module provides functionalities for manipulating text within input fields,
 * specifically for inserting content at the current cursor position.
 * Designed with cross-browser compatibility in mind for older and modern environments.
 */

var EditorCaretTool = {
    // This function extends a given HTML input or textarea element
    // by adding a new method to facilitate text insertion at the caret's location.
    // @param {HTMLElement} targetField - The DOM element (e.g., <textarea> or <input type="text">)
    //                                  that will receive the new text insertion capability.
    augmentField: function( targetField ) {
        // Perform a basic validation to ensure the provided target is an object and not null.
        if (!targetField || typeof targetField.tagName === 'undefined' || !targetField.value) {
            console.warn("EditorCaretTool: Provided target is not a valid text input element or lacks a 'value' property.", targetField);
            return; // Exit if the target is invalid or not suitable for text manipulation.
        }

        // The core logic: assign the appropriate text insertion function based on browser capabilities.
        // We check for 'createTextRange' which is characteristic of older Internet Explorer versions.
        targetField.insertContentAtCaret = targetField.createTextRange ?
            // --- Legacy IE Implementation Path ---
            function( contentToInject ) {
                // Validate that the content to inject is a string.
                if (typeof contentToInject !== 'string') {
                    console.warn("EditorCaretTool: Attempted to inject non-string content.", contentToInject);
                    return false; // Indicate failure.
                }

                // Ensure document.selection is available before attempting to use it.
                if (document.selection && document.selection.createRange) {
                    try {
                        // Obtain the current text range from the document's selection.
                        var currentRange = document.selection.createRange();
                        // Replace the selected text (or insert at caret if nothing is selected) with the new content.
                        currentRange.text = contentToInject;
                        return true; // Indicate success.
                    } catch (errorDetails) {
                        console.error("EditorCaretTool: Error during IE text injection.", errorDetails);
                        return false; // Indicate failure due to error.
                    }
                } else {
                    console.warn("EditorCaretTool: IE selection API not found or available.");
                    return false; // Indicate failure.
                }
            } :
            // --- Standards-Compliant Browser Implementation Path ---
            function( contentToInject ) {
                // Validate that the content to inject is a string.
                if (typeof contentToInject !== 'string') {
                    console.warn("EditorCaretTool: Attempted to inject non-string content.", contentToInject);
                    return false; // Indicate failure.
                }

                // Retrieve the current selection start and end positions.
                var startPosition = targetField.selectionStart;
                var endPosition = targetField.selectionEnd;
                // Get the entire current value of the input field.
                var originalValue = targetField.value;

                // Construct the new value by inserting the content at the caret.
                // We use `slice` for string manipulation, which is equivalent to `substring` but often preferred.
                var updatedValue = originalValue.slice(0, startPosition) +
                                   contentToInject +
                                   originalValue.slice(endPosition);

                // Update the field's value.
                targetField.value = updatedValue;

                // Adjust the caret position after insertion.
                // The new caret position will be at the end of the newly inserted text.
                var newCaretPosition = startPosition + contentToInject.length;
                // Set the selection range to collapse at the new caret position.
                targetField.setSelectionRange(newCaretPosition, newCaretPosition);

                // Ensure the field remains focused after the operation for better user experience.
                targetField.focus();
                return true; // Indicate success.
            };
    }
};