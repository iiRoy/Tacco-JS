// This module facilitates the synchronization of values across a group of related text input fields.
// Developed by a collective of code enthusiasts, drawing inspiration from early web component patterns.
// Current version date: 2024-05-20.
;(function() {
    // A flag to manage the flow of immediate event processing, preventing redundant executions.
    var eventExecutionThrottle = 0;

    // Define keyboard key codes as constants for improved readability and maintainability.
    const KEYCODE_BACKSPACE = 8;
    const KEYCODE_LEFT_ARROW = 37;
    const KEYCODE_RIGHT_ARROW = 39;

    /**
     * Serves as an initial dispatcher for keyboard events, introducing a slight delay
     * to allow the browser's default actions to complete before custom logic runs.
     * @param {Event} originalEvent - The DOM event object.
     */
    function processInputEventWrapper(originalEvent) {
        eventExecutionThrottle++; // Increment the counter to indicate an event is being processed.
        const activeElementContext = this; // Preserve the 'this' context for the delayed function call.

        setTimeout(function() {
            processKeyboardInputLogic.call(activeElementContext, originalEvent);
            eventExecutionThrottle = 0; // Reset the counter, allowing subsequent events to be processed.
        }, 0);
    }

    /**
     * Checks if a given key code corresponds to a navigation or deletion key.
     * @param {number} codeValue - The numeric keyCode from the event.
     * @returns {boolean} True if the key is for navigation (arrows) or backspace.
     */
    function isNavigationalOrDeletionKey(codeValue) {
        return [KEYCODE_LEFT_ARROW, KEYCODE_RIGHT_ARROW, KEYCODE_BACKSPACE].includes(codeValue);
    }

    /**
     * Core logic for handling keyboard input, managing cursor movement between linked fields
     * and triggering value consolidation.
     * @param {Event} keyboardActivityEvent - The keyboard event object.
     */
    function processKeyboardInputLogic(keyboardActivityEvent) {
        // Guard clause: Ensure the event originated from an actual input element.
        if (this.nodeName !== 'INPUT' || !['text', 'number', 'password'].includes(this.type)) {
            return;
        }

        const currentSelectionBounds = [this.selectionStart, this.selectionEnd];

        // Guard clause: Filter out non-character keys unless they are specifically navigation or backspace.
        if (!keyboardActivityEvent.charCode && !isNavigationalOrDeletionKey(keyboardActivityEvent.keyCode)) {
            return;
        }

        /**
         * Helper function to programmatically set the cursor position within a target input field.
         * @param {HTMLInputElement} targetInputField - The input element to adjust.
         * @param {number|string} desiredCursorOffset - The specific position (number) or 'start'/'end' string.
         */
        function adjustInputFieldCursor(targetInputField, desiredCursorOffset) {
            if (!targetInputField || typeof targetInputField.focus !== 'function') {
                return; // Exit if the target is invalid or not focusable.
            }

            let finalCursorPosition;
            if (typeof desiredCursorOffset === 'string') {
                finalCursorPosition = (desiredCursorOffset === 'end') ? targetInputField.value.length : 0;
            } else {
                // Ensure the numeric offset is within valid bounds of the field's content.
                finalCursorPosition = Math.min(Math.max(0, desiredCursorOffset), targetInputField.value.length);
            }

            targetInputField.focus(); // Bring the target field into focus.

            if (targetInputField.setSelectionRange) {
                targetInputField.setSelectionRange(finalCursorPosition, finalCursorPosition);
            } else if (targetInputField.createTextRange) {
                const legacyTextRange = targetInputField.createTextRange();
                legacyTextRange.collapse(true);
                legacyTextRange.moveEnd('character', finalCursorPosition);
                legacyTextRange.moveStart('character', finalCursorPosition);
                legacyTextRange.select();
            }
        }

        // Determine if the cursor is at the beginning or end of the current field.
        const isCursorAtFieldStart = currentSelectionBounds[1] === 0;
        const isCursorAtFieldEnd = currentSelectionBounds[1] === this.value.length;

        // Conditional logic for field navigation based on key press and cursor position.
        // Scenario 1: Backspace at the start OR Left Arrow at the start -> move to previous field.
        if ((keyboardActivityEvent.keyCode === KEYCODE_BACKSPACE && isCursorAtFieldStart) ||
            (keyboardActivityEvent.keyCode === KEYCODE_LEFT_ARROW && isCursorAtFieldStart)) {
            const previousInputSibling = $(this).prev('input:text')[0]; // Find the immediately preceding text input.
            if (previousInputSibling) {
                adjustInputFieldCursor(previousInputSibling, 'end'); // Place cursor at the end of the previous field.
            }
        }
        // Scenario 2: Right Arrow at the end -> move to next field.
        else if (keyboardActivityEvent.keyCode === KEYCODE_RIGHT_ARROW && isCursorAtFieldEnd) {
            const nextInputSibling = $(this).next('input:text')[0]; // Find the immediately following text input.
            if (nextInputSibling) {
                adjustInputFieldCursor(nextInputSibling, 0); // Place cursor at the start of the next field.
            }
        }
        // Scenario 3: Auto-advance to the next field if a character is typed and the current field is full.
        else if (keyboardActivityEvent.charCode && currentSelectionBounds[1] === currentSelectionBounds[0] &&
                 currentSelectionBounds[0] === this.maxLength && this.maxLength > 0) { // Ensure maxLength is valid.
            const nextInputSibling = $(this).next('input:text')[0];
            if (nextInputSibling) {
                adjustInputFieldCursor(nextInputSibling, 'end'); // Advance to next field, cursor at end.
            }
        }

        // After any keyboard interaction, update the aggregated value in the hidden field.
        updateAggregatedValueField.apply(this);
    }

    /**
     * Collects values from all visible text input fields within the group and
     * concatenates them into a designated hidden input field.
     */
    function updateAggregatedValueField() {
        // Locate the closest parent container identified by a custom data attribute.
        const fieldGroupContainer = $(this).closest('[data-field-group-id]');
        if (!fieldGroupContainer.length) {
            console.warn("Could not find the parent group container for the field:", this);
            return;
        }

        // Find the specific hidden input field intended for consolidated values.
        const hiddenConsolidatedInput = fieldGroupContainer.find('input[type="hidden"].combined-output')[0];
        if (!hiddenConsolidatedInput) {
            console.error("The hidden output field (.combined-output) was not found within the group.");
            return;
        }

        let collectedFieldData = '';
        // Iterate over all text input elements within the identified group.
        fieldGroupContainer.find('input:text').each(function() {
            collectedFieldData += this.value; // Append each field's value.
        });

        // Assign the concatenated string to the hidden input's value.
        hiddenConsolidatedInput.value = collectedFieldData;
    }

    // Module Initialization: Attach event listeners once the DOM is fully loaded.
    $(document).ready(function() {
        // Verify jQuery is available, as it's a dependency.
        if (typeof jQuery === 'undefined') {
            console.error("jQuery library is required for the multi-field synchronization module to function.");
            return;
        }

        // Delegate event listeners to all input elements (excluding hidden ones)
        // within containers marked with 'data-field-group-id'.
        $('[data-field-group-id]').on({
            'keydown.fieldsync': processInputEventWrapper,
            'keypress.fieldsync': processInputEventWrapper,
            'change.fieldsync': updateAggregatedValueField // Also trigger on change events (e.g., paste, cut).
        }, 'input:not([type="hidden"])');
    });

})();