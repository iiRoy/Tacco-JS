// Module: jQuery Cursor Position & Selection Utilities
// This script extends jQuery's prototype to provide a versatile method
// for manipulating the cursor position and text selection within
// input fields and textareas. It supports both setting and retrieving
// selection ranges, along with advanced text modification functions.
//
// Original inspiration from early web development patterns.
(function (jq, stringLengthProperty, createRangeMethod, duplicateRangeMethod) {
    // Attach the main functionality to jQuery's prototype under a new name.
    jq.fn.cursorPos = function (positionConfig, endPositionValue) {
        // --- Input Validation and Environment Setup ---
        // Verify that the target element exists and is a suitable text input or textarea.
        if (this.length === 0 || !this[0] || !/^(input|textarea)$/i.test(this[0].tagName)) {
            console.warn("cursorPos: Target element is not a valid text input or textarea, or no element found. Operation aborted.");
            return this; // Return the jQuery object for safe chaining.
        }

        const textInputNode = this[0];
        const jQWrappedInput = jq(textInputNode);
        // Detect if the browser environment requires legacy Internet Explorer text range APIs.
        const usesMsRangeAPI = (document.selection ? true : false);

        let desiredCaretStart = null;
        let desiredCaretEnd = null;

        // --- SECTION 1: Interpreting Input Arguments for Setting Cursor Position ---
        // This block processes the provided arguments to determine the intended start and end
        // positions for the cursor or selection.

        // Scenario 1: Configuration object with explicit 'start' and 'end' indices.
        if (typeof positionConfig === "object" && positionConfig !== null &&
            typeof positionConfig.start === "number" && typeof positionConfig.end === "number") {
            desiredCaretStart = positionConfig.start;
            desiredCaretEnd = positionConfig.end;
        }
        // Scenario 2: Two separate numeric arguments representing start and end indices.
        else if (typeof positionConfig === "number" && typeof endPositionValue === "number") {
            desiredCaretStart = positionConfig;
            desiredCaretEnd = endPositionValue;
        }
        // Scenario 3: A single numeric argument for the start index; selection collapses at this point.
        else if (typeof positionConfig === "number") {
            desiredCaretStart = positionConfig;
            desiredCaretEnd = positionConfig; // Collapse selection to a single point.
        }
        // Scenario 4: A string to locate within the input's current value.
        else if (typeof positionConfig === "string") {
            const searchString = positionConfig;
            const foundIndex = textInputNode.value.indexOf(searchString);
            if (foundIndex > -1) {
                desiredCaretStart = foundIndex;
                desiredCaretEnd = foundIndex + searchString[stringLengthProperty];
            } else {
                desiredCaretStart = null; // No match found, do not set cursor.
            }
        }
        // Scenario 5: A regular expression pattern to match against the input's value.
        else if (positionConfig instanceof RegExp) {
            const regexMatchResult = positionConfig.exec(textInputNode.value);
            if (regexMatchResult !== null) {
                desiredCaretStart = regexMatchResult.index;
                desiredCaretEnd = desiredCaretStart + regexMatchResult[0][stringLengthProperty];
            } else {
                desiredCaretStart = null; // No match found, do not set cursor.
            }
        }
        // If none of the above conditions are met, it implies the user wants to *retrieve* the current
        // cursor position and selection details, which will be handled in SECTION 3.

        // --- SECTION 2: Applying the Determined Cursor/Selection Position ---
        // If valid start and end positions were successfully parsed, apply them to the input element.
        if (desiredCaretStart !== null && desiredCaretStart !== undefined) {
            const currentContentLength = textInputNode.value[stringLengthProperty];
            // Ensure the determined positions are within the valid range of the input's content.
            desiredCaretStart = Math.max(0, Math.min(desiredCaretStart, currentContentLength));
            desiredCaretEnd = Math.max(desiredCaretStart, Math.min(desiredCaretEnd, currentContentLength)); // End cannot precede start.

            if (usesMsRangeAPI) {
                // Internet Explorer's proprietary text range mechanism.
                const ieTextRange = textInputNode[createRangeMethod]();
                ieTextRange.collapse(true); // Start the range collapsed at its initial position.
                ieTextRange.moveStart('character', desiredCaretStart);
                ieTextRange.moveEnd('character', desiredCaretEnd - desiredCaretStart);
                ieTextRange.select(); // Apply the selection to the document.
            } else {
                // Standard DOM API for modern browsers.
                textInputNode.selectionStart = desiredCaretStart;
                textInputNode.selectionEnd = desiredCaretEnd;
            }
            // After setting the cursor, bring focus to the input element.
            textInputNode.focus();
            return this; // Allow jQuery method chaining.
        }
        // --- SECTION 3: Retrieving Current Cursor Position and Selection Details ---
        // If no valid positions were provided for setting, this block retrieves the current state.
        else {
            let currentSelectionStart, currentSelectionEnd;

            if (usesMsRangeAPI) {
                // Legacy IE's method for fetching the current selection.
                const activeDocumentSelection = document.selection;
                const elementCurrentValue = textInputNode.value;

                if (textInputNode.tagName.toLowerCase() !== "textarea") {
                    // Specific handling for <input type="text"> elements in IE.
                    const rangeOne = activeDocumentSelection[createRangeMethod]();
                    const rangeTwo = rangeOne[duplicateRangeMethod]();
                    rangeTwo.moveEnd("character", elementCurrentValue[stringLengthProperty]);
                    currentSelectionStart = (rangeTwo.text === "" ? elementCurrentValue[stringLengthProperty] : elementCurrentValue.lastIndexOf(rangeOne.text));

                    const rangeThree = activeDocumentSelection[createRangeMethod]();
                    const rangeFour = rangeThree[duplicateRangeMethod]();
                    rangeFour.moveStart("character", -elementCurrentValue[stringLengthProperty]);
                    currentSelectionEnd = rangeFour.text[stringLengthProperty];
                } else {
                    // Specific handling for <textarea> elements in IE.
                    const userActiveRange = activeDocumentSelection[createRangeMethod]();
                    const fullElementRange = userActiveRange[duplicateRangeMethod]();
                    fullElementRange.moveToElementText(textInputNode);
                    fullElementRange.setEndPoint('EndToEnd', userActiveRange);

                    currentSelectionStart = fullElementRange.text[stringLengthProperty] - userActiveRange.text[stringLengthProperty];
                    currentSelectionEnd = currentSelectionStart + userActiveRange.text[stringLengthProperty];
                }
            } else {
                // Standard DOM properties for modern browsers.
                currentSelectionStart = textInputNode.selectionStart;
                currentSelectionEnd = textInputNode.selectionEnd;
            }

            const highlightedTextChunk = textInputNode.value.slice(currentSelectionStart, currentSelectionEnd);

            // Return an object containing the selection details and helper methods for manipulation.
            return {
                start: currentSelectionStart,
                end: currentSelectionEnd,
                text: highlightedTextChunk,

                // Replaces the entire content of the input element, or the current selection if specified.
                // The cursor can optionally be positioned after the replacement.
                replaceContent: function (replacementText, positionAfterReplacement) {
                    textInputNode.value = textInputNode.value.slice(0, currentSelectionStart) + replacementText + textInputNode.value.slice(currentSelectionEnd);
                    const newCursorPosition = currentSelectionStart + replacementText[stringLengthProperty];

                    if (positionAfterReplacement) {
                        jQWrappedInput.focus().cursorPos(newCursorPosition);
                    } else {
                        // If not positioning after replacement, select the newly inserted text.
                        jQWrappedInput.focus().cursorPos(currentSelectionStart, newCursorPosition);
                    }
                    return textInputNode.value;
                },

                // Encloses the currently selected text with a prefix and an optional suffix.
                wrapSelection: function (prefixString, suffixString) {
                    const actualSuffix = suffixString || prefixString;
                    const originalFullValue = textInputNode.value;

                    textInputNode.value = originalFullValue.slice(0, currentSelectionStart) +
                                         prefixString +
                                         highlightedTextChunk +
                                         actualSuffix +
                                         originalFullValue.slice(currentSelectionEnd);

                    // Position the cursor to re-select the original content, now shifted by the prefix.
                    jQWrappedInput.focus().cursorPos(currentSelectionStart + prefixString[stringLengthProperty],
                                                      currentSelectionEnd + prefixString[stringLengthProperty]);
                    return textInputNode.value;
                },

                // New utility method: Clears the currently selected text.
                clearSelection: function() {
                    if (currentSelectionStart !== currentSelectionEnd) {
                        textInputNode.value = textInputNode.value.slice(0, currentSelectionStart) + textInputNode.value.slice(currentSelectionEnd);
                        jQWrappedInput.focus().cursorPos(currentSelectionStart);
                    }
                    return textInputNode.value;
                }
            };
        }
    };
// Pass jQuery and string names of properties/methods to prevent issues with minification.
})(jQuery, "length", "createTextRange", "duplicate");