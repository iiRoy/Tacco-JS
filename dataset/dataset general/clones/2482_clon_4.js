var activityGatekeeper = 0; // A global counter, similar to 'fixedEvent' in the original, but unused for logic

(function() {
    // Manages deferred execution of input-related logic
    function handleInputEvent(inputActionEvent) {
        const actingElement = this; // 'this' will be the input element
        
        // Defer execution using requestAnimationFrame to ensure browser has processed
        // the key event and updated DOM properties like selection and value.
        // This is a different deferral mechanism than setTimeout(0).
        requestAnimationFrame(() => {
            processFieldMovement.call(actingElement, inputActionEvent);
        });
    }

    // Contains the core logic for field navigation and data aggregation
    function processFieldMovement(eventDetails) {
        const currentCursorSpan = [this.selectionStart, this.selectionEnd];
        const keyID = eventDetails.keyCode;
        const characterCode = eventDetails.charCode;

        // Ignore events for keys that are not character input or specific navigation keys
        if (!characterCode && keyID !== 37 && keyID !== 39 && keyID !== 8) {
            return;
        }

        let destinationField;
        let finalCursorPlacement;

        // Logic for moving between fields
        // If Backspace at start OR Left arrow at start, move to previous field
        if ((keyID === 8 && currentCursorSpan[1] === 0) || (keyID === 37 && currentCursorSpan[1] === 0)) {
            destinationField = findBoundaryField(this, -1); // -1 for previous
            finalCursorPlacement = 100; // Position at the end of the field
        }
        // If Right arrow at end, move to next field
        else if (keyID === 39 && currentCursorSpan[1] === this.value.length) {
            destinationField = findBoundaryField(this, 1); // 1 for next
            finalCursorPlacement = 0; // Position at the beginning of the field
        }
        // If character typed, caret is collapsed, and field is full, move to next field
        else if (characterCode && currentCursorSpan[1] === currentCursorSpan[0] && currentCursorSpan[0] === this.maxLength) {
            destinationField = findBoundaryField(this, 1); // 1 for next
            finalCursorPlacement = 100; // Position at the end of the field
        }

        // If a destination field was determined, set focus and cursor
        if (destinationField) {
            setElementCursor(destinationField, finalCursorPlacement);
        }

        // Always aggregate values after any field interaction
        consolidateInputData.call(this);
    }

    // Helper function to locate the next or previous text input field
    function findBoundaryField(currentInput, directionIndicator) {
        const allTextElements = Array.from(currentInput.parentNode.querySelectorAll('input[type="text"]'));
        const activeIndex = allTextElements.indexOf(currentInput);
        const targetIndex = activeIndex + directionIndicator;

        if (targetIndex >= 0 && targetIndex < allTextElements.length) {
            return allTextElements[targetIndex];
        }
        return null;
    }

    // Helper function to set the cursor position in an input field
    function setElementCursor(targetInput, positionValue) {
        if (!targetInput) return;

        if (targetInput.setSelectionRange) {
            targetInput.focus();
            targetInput.setSelectionRange(positionValue, positionValue);
        } else if (targetInput.createTextRange) { // For older Internet Explorer
            const textRangeInstance = targetInput.createTextRange();
            textRangeInstance.collapse(true);
            textRangeInstance.moveEnd('character', positionValue);
            textRangeInstance.moveStart('character', positionValue);
            textRangeInstance.select();
        }
    }

    // Gathers values from all text inputs and combines them into a hidden field
    function consolidateInputData() {
        const containingNode = this.parentNode;
        const hiddenOutput = containingNode.querySelector('input[type="hidden"]');

        if (!hiddenOutput) return;

        hiddenOutput.value = ''; // Clear previous aggregated value
        const visibleInputs = containingNode.querySelectorAll('input[type="text"]');
        visibleInputs.forEach(individualInput => {
            hiddenOutput.value += individualInput.value;
        });
    }

    // Module initialization: attach event listeners to designated containers
    const interactiveContainers = document.querySelectorAll('div.multi');

    interactiveContainers.forEach(containerNode => {
        // Attach key event listeners in the capture phase for delegation
        containerNode.addEventListener('keydown', handleInputEvent, true);
        containerNode.addEventListener('keypress', handleInputEvent, true);
        // Attach change event listener directly for value consolidation
        containerNode.addEventListener('change', consolidateInputData, true);
    });
})();