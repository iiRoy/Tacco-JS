const textEditorUtilities = {
    // Updated module version, changed name from 'version'
    moduleVersion: '1.0.0-beta',

    // Renamed 'config' to 'settings'
    settings: {
        // Renamed 'tab' to 'indentUnit'
        indentUnit: '\t', // Default to a single tab character
        // Added a new configuration option for visual feedback (Type III addition)
        enableVisualFeedback: true
    },

    // Renamed 'events' to 'eventHandlers'
    eventHandlers: {
        // Renamed 'keydown' to 'handleKeyPress' and 'e' to 'keyboardEvent'
        handleKeyPress: function(keyboardEvent) {
            const indentCharacter = textEditorUtilities.settings.indentUnit;
            const indentCharLength = indentCharacter.length;

            // Using keyboardEvent.key for better semantics instead of keyCode (Type II/III update)
            if (keyboardEvent.key === 'Tab') {
                keyboardEvent.preventDefault(); // Prevent default tab behavior in textarea

                const originalSelectionStart = this.selectionStart;
                const originalSelectionEnd = this.selectionEnd;
                let newSelectionStart = originalSelectionStart;
                let newSelectionEnd = originalSelectionEnd;

                if (!keyboardEvent.shiftKey) {
                    // Normal Tab (indent) behavior
                    if (!textEditorUtilities.selectionHelpers.hasMultiLineSelection(this)) {
                        // Single-line indentation: Insert indentChar at selection start
                        this.value = this.value.substring(0, originalSelectionStart) + indentCharacter + this.value.substring(originalSelectionStart);
                        newSelectionStart = originalSelectionStart + indentCharLength;
                        newSelectionEnd = originalSelectionEnd + indentCharLength;
                    } else {
                        // Multi-line indentation
                        const lineStartOffsets = textEditorUtilities.selectionHelpers.getLineStartOffsets(this);
                        let documentParts = []; // Array to build the new document string (Type III rewrite)
                        let currentProcessedOffset = 0;

                        // Iterate through each line to apply indentation
                        for (let i = 0; i < lineStartOffsets.length; i++) {
                            const lineStart = lineStartOffsets[i];
                            const nextLineStart = lineStartOffsets[i + 1];
                            const lineEnd = nextLineStart !== undefined ? nextLineStart - 1 : this.value.length; // End of the current line (exclusive of next line's start)

                            // Check for overlap: current line must start before selection ends AND end after selection starts
                            if (lineStart < originalSelectionEnd && lineEnd >= originalSelectionStart) {
                                // This line is part of the selection, apply indent
                                documentParts.push(this.value.substring(currentProcessedOffset, lineStart)); // Content before this line
                                documentParts.push(indentCharacter); // The indentation itself
                                documentParts.push(this.value.substring(lineStart, lineEnd + 1)); // The line content including its newline

                                // Adjust selection start/end based on this line's modification
                                if (lineStart <= originalSelectionStart) {
                                    newSelectionStart += indentCharLength;
                                }
                                if (lineStart <= originalSelectionEnd) {
                                    newSelectionEnd += indentCharLength;
                                }
                            } else {
                                // Line is not affected, simply append its content
                                documentParts.push(this.value.substring(currentProcessedOffset, lineEnd + 1));
                            }
                            currentProcessedOffset = lineEnd + 1; // Move past this line's content
                        }
                        // Append any remaining text after the last line in the offsets array
                        if (currentProcessedOffset < this.value.length) {
                             documentParts.push(this.value.substring(currentProcessedOffset));
                        }
                        this.value = documentParts.join(''); // Update the textarea value once
                    }
                } else {
                    // Shift-Tab (dedent) behavior
                    if (!textEditorUtilities.selectionHelpers.hasMultiLineSelection(this)) {
                        // Single-line dedent
                        const textBeforeSelection = this.value.slice(originalSelectionStart - indentCharLength, originalSelectionStart);
                        const textAtSelectionStart = this.value.slice(originalSelectionStart, originalSelectionStart + indentCharLength);

                        if (textBeforeSelection === indentCharacter) {
                            // Remove indent directly before selection
                            this.value = this.value.slice(0, originalSelectionStart - indentCharLength) + this.value.slice(originalSelectionStart);
                            newSelectionStart = originalSelectionStart - indentCharLength;
                            newSelectionEnd = originalSelectionEnd - indentCharLength;
                        } else if (this.value.slice(originalSelectionStart - 1, originalSelectionStart) === "\n" && textAtSelectionStart === indentCharacter) {
                            // If at start of line and first char is indent, remove it
                            this.value = this.value.slice(0, originalSelectionStart) + this.value.slice(originalSelectionStart + indentCharLength);
                            newSelectionStart = originalSelectionStart;
                            newSelectionEnd = originalSelectionEnd - indentCharLength;
                        }
                    } else {
                        // Multi-line dedent
                        const lineStartOffsets = textEditorUtilities.selectionHelpers.getLineStartOffsets(this);
                        let documentParts = [];
                        let currentProcessedOffset = 0;

                        for (let i = 0; i < lineStartOffsets.length; i++) {
                            const lineStart = lineStartOffsets[i];
                            const nextLineStart = lineStartOffsets[i + 1];
                            const lineEnd = nextLineStart !== undefined ? nextLineStart - 1 : this.value.length;

                            // Check for overlap with selection
                            if (lineStart < originalSelectionEnd && lineEnd >= originalSelectionStart) {
                                // Check if the line actually starts with the indent unit
                                if (this.value.slice(lineStart, lineStart + indentCharLength) === indentCharacter) {
                                    documentParts.push(this.value.substring(currentProcessedOffset, lineStart)); // Content before this line
                                    documentParts.push(this.value.substring(lineStart + indentCharLength, lineEnd + 1)); // Line content without indent + newline

                                    // Adjust selection start/end
                                    if (lineStart <= originalSelectionStart) {
                                        newSelectionStart -= indentCharLength;
                                    }
                                    if (lineStart <= originalSelectionEnd) {
                                        newSelectionEnd -= indentCharLength;
                                    }
                                } else {
                                    // No indent to remove, just add the line as is
                                    documentParts.push(this.value.substring(currentProcessedOffset, lineEnd + 1));
                                }
                            } else {
                                documentParts.push(this.value.substring(currentProcessedOffset, lineEnd + 1));
                            }
                            currentProcessedOffset = lineEnd + 1;
                        }
                        if (currentProcessedOffset < this.value.length) {
                             documentParts.push(this.value.substring(currentProcessedOffset));
                        }
                        this.value = documentParts.join('');
                    }
                }
                this.selectionStart = newSelectionStart;
                this.selectionEnd = newSelectionEnd;

            } else if (keyboardEvent.key === 'Escape') { // Esc key
                textEditorUtilities.eventHandlers.deactivateElement(keyboardEvent);
            } else if (keyboardEvent.key === 'Enter' && !keyboardEvent.shiftKey) { // Enter key for auto-indent
                const editorElement = this;
                const currentCaretPosition = editorElement.selectionStart;
                const allLineStartOffsets = textEditorUtilities.selectionHelpers.getLineStartOffsets(editorElement);

                let startOfCurrentLine = 0;
                let endOfCurrentLine = editorElement.value.length;

                // Determine the start and end indices of the line where the caret is positioned
                for (let i = 0; i < allLineStartOffsets.length; i++) {
                    const lineOffset = allLineStartOffsets[i];
                    const nextLineOffset = allLineStartOffsets[i + 1];

                    if (currentCaretPosition >= lineOffset && (nextLineOffset === undefined || currentCaretPosition < nextLineOffset)) {
                        startOfCurrentLine = lineOffset;
                        endOfCurrentLine = nextLineOffset !== undefined ? nextLineOffset - 1 : editorElement.value.length;
                        break;
                    }
                }

                const lineContent = editorElement.value.slice(startOfCurrentLine, endOfCurrentLine);
                // Dynamically build a more robust regex for indent detection (Type III rewrite)
                const indentDetectionPattern = new RegExp(`^(${indentCharacter.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})+`);
                const detectedIndentation = lineContent.match(indentDetectionPattern);

                if (detectedIndentation) {
                    keyboardEvent.preventDefault();
                    let autoIndentString = detectedIndentation[0];
                    let autoIndentLength = autoIndentString.length;

                    // Ensure auto-indent doesn't exceed the caret's position within the line
                    const caretOffsetInLine = currentCaretPosition - startOfCurrentLine;
                    if (autoIndentLength > caretOffsetInLine) {
                        autoIndentLength = caretOffsetInLine;
                        autoIndentString = autoIndentString.slice(0, caretOffsetInLine);
                    }
                    
                    // Insert newline followed by the determined auto-indentation
                    editorElement.value = editorElement.value.slice(0, currentCaretPosition) + "\n" + autoIndentString + editorElement.value.slice(currentCaretPosition);
                    editorElement.selectionStart = currentCaretPosition + autoIndentLength + 1;
                    editorElement.selectionEnd = editorElement.selectionStart;
                }
            }
        },

        // Renamed 'disable' to 'deactivateElement'
        deactivateElement: function(eventObject) {
            // Added a guard clause for null/undefined target (Type III addition)
            if (!eventObject || !eventObject.target) return;
            textEditorUtilities.cleanupElement(eventObject.target);
        },

        // Renamed 'focus' to 'setupFocusHandler'
        setupFocusHandler: function() {
            const moduleReference = textEditorUtilities;
            const targetElement = this; // The textarea element

            // Guard clause for non-TEXTAREA elements (Type III addition)
            if (targetElement.nodeName !== 'TEXTAREA') return;

            // Delayed execution to allow browser focus events to settle
            const focusTimeoutId = setTimeout(() => {
                let elementClasses = (targetElement.getAttribute('class') || '').split(' ');
                // Using a new class name for active state (Type II update)
                const isIndenterActive = elementClasses.includes('indenter-active');

                // Only set up event listeners if not already active
                if (!isIndenterActive) {
                    targetElement.addEventListener('keydown', moduleReference.eventHandlers.handleKeyPress);

                    // Apply visual feedback based on settings (Type III addition)
                    if (moduleReference.settings.enableVisualFeedback) {
                        // Slightly modified base64 string for visual change (Type III update)
                        targetElement.style.backgroundImage = "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzr/q1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAAEgAAABIAEbJaz4AAAKASURBVFhH7ZddSAJhGe/5/3+3E3aNqX5k5mwwkRgUBAUJlIhWlEQEjN8yQcfolKJxJAefOjRCnT0IPYQ9iRa9FAYJiaUVP4twf7gzJzpnDbdzHt3z+3Fua3dO4Ne/f5ezjmc8+F7zvmeA2zrv0VFGlexAssFw1mG1pqqUL8npGY60Bw3ykYaOVjlrFXmEyw0AQj6g53UONQBO8DBzuiT2tUx+gR/mwACBQpIUoACBZoAZaOSiWwFIFs4oMMS9/boZVF8T8vtkbEofatiRKF9mXK6M7tTyyxRaPwWtJezIu9+9cNzxHk/n9938rz6IWpvgRdZd5/HcsvC9jadqk6Z0qkBiCaAF3UtX8cy6h1mwlnLhsuZuRvqABlyNJqb0q0ZWsb7uUVHlXAahWl1y3M2tVuQVR1Q0Pl0dwZ67KbZtGnX/ma++/FsCCY1ANlAxIuT2NZP3XB/GRKc9qKhKTYnd4auJbIqINEBDa5zoWWByoS1jocR+loKpKGJKqBLybN/OQN2Tmodv4jCtYIMYurnP5sLf+V5XK4DbFv4haaDCEABA/J88GdegD1I2+heY0Xj7M1itiMjP8srzutjXMbkIDZKCrAcfGOt8LwODimYnzzjLcHIx5VFwPekZrhVPYmxyVNAvZP8KV28SykClo6XF4/t9LpC2TTIteulJepJjD5nCjL8E56sBHt40NYYqE51ZnZIfmGXYBC68p/6v6UkApSI8Y2ejPVKhyE0PdLDPcg+Z003G0W7YUmmvo/WtjXgbiKAAQNGpjYRDOwWILx3dV16ZBsx3QsdYi4JNUw6uCvMbrUcWFAvPWznfH9/GQHR5xAbPuTumRFWvS+ZwDGyJFfidkxWk2oaIfTRk8RI0YqMAQBAL7YVrz/iUDx4QII4/QAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxMi0xMi0wMVQwMDowNjo0My0wNTowMLKpTWYAAAAldEVXh0ZGF0ZTptb2RpZnkAMjAxMi0xMi0wMVQwMDowNjo0My0wNTowMLDD9PXaAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5cll5PAAAAABJRU5ErkJggg==)";
                        targetElement.style.backgroundPosition = 'top right';
                        targetElement.style.backgroundRepeat = 'no-repeat';
                    }

                    // Update class list: remove original class and add the new active class
                    elementClasses = elementClasses.filter(cls => cls !== 'tabIndent'); // Using filter for removal (Type II update)
                    elementClasses.push('indenter-active');
                    targetElement.setAttribute('class', elementClasses.join(' '));
                }
                // Remove the focus listener itself after it has done its setup job
                targetElement.removeEventListener('focus', moduleReference.eventHandlers.setupFocusHandler);
            }, 500); // Delay for better user experience, e.g., if tabbing quickly

            // If user tabs away before timeout, clear the pending setup
            targetElement.addEventListener('blur', function blurCancellationHandler() { // Named function for easier removal (Type II update)
                clearTimeout(focusTimeoutId);
                targetElement.removeEventListener('blur', blurCancellationHandler);
            });
        }
    },

    // Renamed 'render' to 'activateIndenterForElement'
    activateIndenterForElement: function(element) {
        // Guard clause for invalid elements (Type III addition)
        if (!element || element.nodeName !== 'TEXTAREA') {
            // console.warn("Attempted to activate indenter on a non-TEXTAREA element or null element."); // Optional: for debugging
            return;
        }

        // Add focus listener which handles the actual setup of keydown listener
        element.addEventListener('focus', this.eventHandlers.setupFocusHandler);

        // Add a blur listener to deactivate when the element loses focus
        const blurDeactivationHandler = (event) => { // Named function for easier removal (Type II update)
            this.eventHandlers.deactivateElement(event);
            element.removeEventListener('blur', blurDeactivationHandler); // Remove itself after deactivation
        };
        element.addEventListener('blur', blurDeactivationHandler);
    },

    // Renamed 'renderAll' to 'activateIndenterForAllMatchingElements'
    activateIndenterForAllMatchingElements: function() {
        // Using modern Array.from and for...of for iteration (Type II/III update)
        const allTextAreas = Array.from(document.getElementsByTagName('textarea'));

        for (const element of allTextAreas) {
            const elementClasses = (element.getAttribute('class') || '').split(' ');
            // Check for the original class name to identify elements for activation
            if (elementClasses.includes('tabIndent')) {
                this.activateIndenterForElement(element);
            }
        }
    },

    // Renamed 'remove' to 'cleanupElement'
    cleanupElement: function(element) {
        // Guard clause for invalid elements (Type III addition)
        if (!element || element.nodeName !== 'TEXTAREA') {
            return;
        }

        let elementClasses = (element.getAttribute('class') || '').split(' ');
        const isCurrentlyActive = elementClasses.includes('indenter-active');

        if (isCurrentlyActive) {
            element.removeEventListener('keydown', this.eventHandlers.handleKeyPress);
            element.style.backgroundImage = ''; // Remove visual cue

            // Update class list: remove active class and add original class back
            elementClasses = elementClasses.filter(cls => cls !== 'indenter-active');
            if (!elementClasses.includes('tabIndent')) { // Ensure original class is present, but not duplicated
                elementClasses.push('tabIndent');
            }
            element.setAttribute('class', elementClasses.join(' '));

            // Also remove the focus setup handler if it was still pending or active
            element.removeEventListener('focus', this.eventHandlers.setupFocusHandler);
        }
    },

    // Renamed 'removeAll' to 'cleanupAllElements'
    cleanupAllElements: function() {
        const allTextAreas = Array.from(document.getElementsByTagName('textarea'));

        for (const element of allTextAreas) {
            const elementClasses = (element.getAttribute('class') || '').split(' ');
            // Check for the new active class name for cleanup
            if (elementClasses.includes('indenter-active')) {
                this.cleanupElement(element);
            }
        }
    },

    // Introduced a nested utility object for selection-related functions (Type III addition)
    selectionHelpers: {
        // Renamed 'isMultiLine' to 'hasMultiLineSelection'
        hasMultiLineSelection: function(textAreaElement) {
            // Using String.prototype.includes for simplicity (Type II update)
            const selectedFragment = textAreaElement.value.slice(textAreaElement.selectionStart, textAreaElement.selectionEnd);
            return selectedFragment.includes('\n');
        },

        // Renamed 'findStartIndices' to 'getLineStartOffsets' and completely rewrote logic (Type III rewrite)
        getLineStartOffsets: function(textAreaElement) {
            const editorContent = textAreaElement.value;
            const offsets = [0]; // The first line always starts at index 0
            let currentNewlineIndex = -1;

            // Efficiently find all newline characters and store the index of the character immediately following them
            while ((currentNewlineIndex = editorContent.indexOf('\n', currentNewlineIndex + 1)) !== -1) {
                offsets.push(currentNewlineIndex + 1);
            }
            return offsets;
        }
    }
};