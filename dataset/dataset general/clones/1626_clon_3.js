// This module provides advanced text formatting capabilities for textarea elements.
// It transforms standard textareas into rich markdown-like input fields.

;(function(jQueryAlias) {

    // Main plugin function for initializing the text formatter on selected elements.
    jQueryAlias.fn.markupComposer = function(componentOptions) {

        // Establish default configuration settings for the formatter.
        const defaultSettings = {
            tabSize: 4, // Number of spaces for a tab operation
            // Future options could include custom button mappings, toolbar configuration, etc.
        };

        // Merge user-provided options with the defaults.
        // The original code used arguments[1], which is unusual. We'll assume standard practice:
        // componentOptions is the first argument, or an empty object if not provided.
        const currentSettings = Object.assign({}, defaultSettings, componentOptions || {});

        // Cache references to the target textarea and its immediate parent wrapper.
        const inputElement = jQueryAlias(this);
        const wrapperDiv = inputElement.parent();

        // Ensure the input element is a valid HTMLTextAreaElement before proceeding.
        if (!inputElement.is('textarea')) {
            console.warn('MarkupComposer can only be applied to textarea elements. Skipping initialization.');
            return this; // Return the jQuery object for chaining
        }

        /**
         * Retrieves the current selection details from a given DOM input element.
         * @param {HTMLTextAreaElement} targetDomElement - The textarea element.
         * @returns {{value: string, start: number, end: number, selectedText: string}} - Selection information.
         */
        const getCurrentSelectionDetails = (targetDomElement) => {
            if (!targetDomElement || typeof targetDomElement.selectionStart === 'undefined') {
                return { value: '', start: 0, end: 0, selectedText: '' };
            }
            const currentVal = targetDomElement.value;
            const selectionStartIdx = targetDomElement.selectionStart;
            const selectionEndIdx = targetDomElement.selectionEnd;
            const selectedContent = currentVal.substring(selectionStartIdx, selectionEndIdx);
            return {
                value: currentVal,
                start: selectionStartIdx,
                end: selectionEndIdx,
                selectedText: selectedContent
            };
        };

        /**
         * Updates the content of a textarea and sets the new selection.
         * @param {HTMLTextAreaElement} targetDomElement - The textarea element.
         * @param {string} newTextContent - The new full text content for the textarea.
         * @param {number} newCursorStart - The new starting position of the selection.
         * @param {number} newCursorEnd - The new ending position of the selection.
         */
        const updateTextareaContentAndSelection = (targetDomElement, newTextContent, newCursorStart, newCursorEnd) => {
            if (!targetDomElement) return;
            targetDomElement.value = newTextContent;
            targetDomElement.selectionStart = newCursorStart;
            targetDomElement.selectionEnd = newCursorEnd;
            targetDomElement.focus(); // Ensure the element remains focused
        };

        /**
         * Inserts a string at the current cursor position or replaces the selection.
         * @param {string} contentToInject - The string to insert.
         */
        const injectContent = (contentToInject) => {
            if (!contentToInject) return; // Guard clause for empty content
            const domInput = inputElement[0];
            const { value, start, end } = getCurrentSelectionDetails(domInput);

            const updatedValue = value.substring(0, start) + contentToInject + value.substring(end);
            const newCursorPosition = start + contentToInject.length;

            updateTextareaContentAndSelection(domInput, updatedValue, newCursorPosition, newCursorPosition);
        };

        /**
         * Encloses the currently selected text with a prefix and a suffix string.
         * If no text is selected, it inserts the prefix and suffix and places the cursor in between.
         * @param {string} prefixString - The string to prepend.
         * @param {string} suffixString - The string to append.
         */
        const surroundText = (prefixString, suffixString) => {
            const domInput = inputElement[0];
            const { value, start, end, selectedText } = getCurrentSelectionDetails(domInput);

            let newContent;
            let newSelectionStart, newSelectionEnd;

            if (selectedText.length > 0) {
                // If text is selected, wrap it.
                newContent = value.substring(0, start) + prefixString + selectedText + suffixString + value.substring(end);
                newSelectionStart = start + prefixString.length;
                newSelectionEnd = end + prefixString.length;
            } else {
                // If no text is selected, insert wrappers and place cursor in between.
                newContent = value.substring(0, start) + prefixString + suffixString + value.substring(end);
                newSelectionStart = start + prefixString.length;
                newSelectionEnd = newSelectionStart;
            }

            updateTextareaContentAndSelection(domInput, newContent, newSelectionStart, newSelectionEnd);
        };

        /**
         * Processes indentation for selected lines or inserts a tab character.
         * @param {KeyboardEvent} keyEvent - The keyboard event object.
         */
        const processIndentation = (keyEvent) => {
            const domInput = inputElement[0];
            const { value, start, end } = getCurrentSelectionDetails(domInput);
            const tabChar = ' '.repeat(currentSettings.tabSize); // Use spaces for tab

            // Determine the start of the current line(s) for multi-line selection.
            let lineStart = start;
            while (lineStart > 0 && value.charAt(lineStart - 1) !== '\n') {
                lineStart--;
            }

            // Extract the relevant portion of the text.
            const portionToIndent = value.substring(lineStart, end);
            const linesToProcess = portionToIndent.split('\n');

            // Add tab character to each line.
            const indentedLines = linesToProcess.map(line => tabChar + line);
            const newContent = value.substring(0, lineStart) + indentedLines.join('\n') + value.substring(end);

            let newSelectionStart = start + tabChar.length;
            let newSelectionEnd = end + (indentedLines.length * tabChar.length);

            // If it was a single line selection at cursor, adjust end for a single tab.
            if (start === end) {
                newSelectionEnd = newSelectionStart;
            }

            updateTextareaContentAndSelection(domInput, newContent, newSelectionStart, newSelectionEnd);
        };

        /**
         * Processes dedentation for selected lines or removes a tab character.
         * @param {KeyboardEvent} keyEvent - The keyboard event object.
         */
        const processDedentation = (keyEvent) => {
            const domInput = inputElement[0];
            const { value, start, end } = getCurrentSelectionDetails(domInput);
            const tabPattern = new RegExp(`^ {1,${currentSettings.tabSize}}`); // Match spaces or tabs for unindent

            // Find the start of the line(s)
            let lineStart = start;
            while (lineStart > 0 && value.charAt(lineStart - 1) !== '\n') {
                lineStart--;
            }

            const portionToDedent = value.substring(lineStart, end);
            const lines = portionToDedent.split('\n');
            let totalEdits = 0;

            const dedentedLines = lines.map(line => {
                const match = line.match(tabPattern);
                if (match) {
                    totalEdits += match[0].length;
                    return line.replace(tabPattern, '');
                }
                return line;
            });

            const newContent = value.substring(0, lineStart) + dedentedLines.join('\n') + value.substring(end);

            // Adjust selection based on changes
            let newSelectionStart = start - totalEdits;
            let newSelectionEnd = end - totalEdits;

            if (start === end) { // Single cursor position
                newSelectionStart = newSelectionEnd = Math.max(0, start - (dedentedLines[0].length < lines[0].length ? lines[0].length - dedentedLines[0].length : 0));
            } else { // Multi-line selection
                newSelectionStart = lineStart; // Keep selection anchored at the start of the first processed line
            }

            updateTextareaContentAndSelection(domInput, newContent, newSelectionStart, newSelectionEnd);
        };

        /**
         * Helper to generate markdown link or image syntax.
         * @param {string} selectedText - The text currently selected.
         * @param {boolean} isImage - True if generating an image link, false for a regular link.
         * @returns {string} The generated markdown string.
         */
        const createLinkMarkup = (selectedText, isImage) => {
            const linkText = selectedText || 'Link Text';
            const linkUrl = selectedText || 'https://example.com';
            return isImage ? `![${linkText}](${linkUrl})` : `[${linkText}](${linkUrl})`;
        };

        /**
         * Helper to prefix each selected line with a given string.
         * @param {string} prefix - The string to add to the start of each line.
         */
        const prefixSelectedLines = (prefix) => {
            const domInput = inputElement[0];
            const { value, start, end } = getCurrentSelectionDetails(domInput);

            // Determine the start of the current line(s)
            let lineStart = start;
            while (lineStart > 0 && value.charAt(lineStart - 1) !== '\n') {
                lineStart--;
            }

            const linesToProcess = value.substring(lineStart, end).split('\n');
            const prefixedLines = linesToProcess.map(line => prefix + line);

            const newContent = value.substring(0, lineStart) + prefixedLines.join('\n') + value.substring(end);

            // Adjust selection, maintaining the original selection range's length if possible
            const newSelectionStart = lineStart;
            const newSelectionEnd = end + (prefixedLines.length * prefix.length);

            updateTextareaContentAndSelection(domInput, newContent, newSelectionStart, newSelectionEnd);
        };

        // Collection of formatting functions accessible via toolbar buttons.
        const markupFormatters = {
            bold: () => surroundText('**', '**'),
            italic: () => surroundText('*', '*'),
            strike: () => surroundText('~~', '~~'),
            code: () => surroundText('`', '`'),
            codeBlock: () => { // New formatter for triple backticks
                const domInput = inputElement[0];
                const { selectedText } = getCurrentSelectionDetails(domInput);
                const blockPrefix = '\n```javascript\n'; // Example language
                const blockSuffix = '\n```\n';
                surroundText(blockPrefix + selectedText, blockSuffix); // Ensure selected text is inside
            },
            link: () => {
                const domInput = inputElement[0];
                const { selectedText } = getCurrentSelectionDetails(domInput);
                const markdownLink = createLinkMarkup(selectedText, false);
                injectContent(markdownLink); // Use injectContent which handles selection replacement
            },
            img: () => {
                const domInput = inputElement[0];
                const { selectedText } = getCurrentSelectionDetails(domInput);
                const markdownImage = createLinkMarkup(selectedText, true);
                injectContent(markdownImage); // Use injectContent
            },
            list: () => prefixSelectedLines('* '),
            quote: () => prefixSelectedLines('> '),
            // Headers
            h1: () => surroundText('# ', '\n'), // Headers are typically single line, so suffix with newline
            h2: () => surroundText('## ', '\n'),
            h3: () => surroundText('### ', '\n'),
            h4: () => surroundText('#### ', '\n'),
            h5: () => surroundText('##### ', '\n'),
            h6: () => surroundText('###### ', '\n')
        };

        // Attach event listener for keyboard actions on the input field.
        inputElement.on('keydown', function(keyPressEvent) {
            // Check for the Tab key press.
            if (keyPressEvent.key === 'Tab') {
                keyPressEvent.preventDefault(); // Prevent default browser tab behavior
                keyPressEvent.stopPropagation(); // Stop event bubbling

                if (keyPressEvent.shiftKey) {
                    processDedentation(keyPressEvent);
                } else {
                    processIndentation(keyPressEvent);
                }
            }
            // Additional keyboard shortcuts could be added here.
        });

        // Attach event listener for toolbar button clicks within the wrapper.
        // It delegates clicks to anchor tags inside a 'nav' element.
        wrapperDiv.on('click', 'nav a', function(clickEvent) {
            const clickedAnchor = jQueryAlias(clickEvent.currentTarget);
            // Retrieve the action from a data attribute or href. Using data-action is more robust.
            const actionIdentifier = clickedAnchor.attr('data-action') || clickedAnchor.attr('href').split('#').pop();

            if (actionIdentifier && markupFormatters[actionIdentifier]) {
                markupFormatters[actionIdentifier]();
            } else {
                console.warn(`Unknown or unhandled formatting action: ${actionIdentifier}`);
            }

            // Prevent default link behavior and bubbling.
            clickEvent.preventDefault();
            clickEvent.stopPropagation();
            return false; // For older browsers or specific jQuery behaviors.
        });

        // Return the jQuery object for method chaining.
        return this;
    };

})(Zepto); // The original code used Zepto, so we'll continue to pass it.