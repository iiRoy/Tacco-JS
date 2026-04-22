/**
 * jQuery extension to transform text input areas into Markdown compositors.
 */

(function(jqObject) {

    jqObject.fn.markdownComposer = function() {

        let configurationOptions = arguments[1] || {};
        const defaultSettings = {};

        const currentSettings = jqObject.extend({}, defaultSettings, configurationOptions);
        const inputAreaElement = jqObject(this);
        const parentContainer = inputAreaElement.parent();

        /**
         * Inserts a string at the current cursor position in the textarea.
         * @param {string} newText The string to insert.
         */
        const injectString = function(newText) {
            const domElement = inputAreaElement[0];
            const currentSelectionStart = domElement.selectionStart;
            const fullContent = domElement.value;

            domElement.value = fullContent.substring(0, currentSelectionStart) + newText + fullContent.substring(currentSelectionStart);
            domElement.selectionStart = domElement.selectionEnd = currentSelectionStart + newText.length;
        };

        /**
         * Wraps the current selection or cursor with left and right strings.
         * @param {string} leftDelimiter The string to prepend.
         * @param {string} rightDelimiter The string to append.
         */
        const encloseSelection = function(leftDelimiter, rightDelimiter) {
            const domElement = inputAreaElement[0];
            const selectionBegin = domElement.selectionStart;
            const selectionEnd = domElement.selectionEnd;
            const fullContent = domElement.value;

            domElement.value = fullContent.substring(0, selectionBegin) + leftDelimiter + fullContent.substring(selectionBegin, selectionEnd) + rightDelimiter + fullContent.substring(selectionEnd);
            domElement.selectionStart = selectionEnd + leftDelimiter.length + rightDelimiter.length;
        };

        /**
         * Indents the current line or selected lines with a tab character.
         * @param {Event} keyEvent The keyboard event object.
         */
        const applyTabIndentation = function(keyEvent) {
            const domElement = inputAreaElement[0];
            const selectionBegin = domElement.selectionStart;
            const selectionEnd = domElement.selectionEnd;
            const fullContent = domElement.value;

            const selectedLines = fullContent.substring(selectionBegin, selectionEnd).split("\n");

            for (let lineIndex = 0; lineIndex < selectedLines.length; lineIndex++) {
                selectedLines[lineIndex] = "\t" + selectedLines[lineIndex];
            }

            domElement.value = fullContent.substring(0, selectionBegin) + selectedLines.join("\n") + fullContent.substring(selectionEnd);

            if (selectionEnd > selectionBegin) {
                domElement.selectionStart = selectionBegin;
                domElement.selectionEnd = selectionEnd + selectedLines.length;
            } else {
                domElement.selectionStart = domElement.selectionEnd = selectionBegin + 1;
            }
        };

        /**
         * Removes a tab character from the beginning of the current line or selected lines.
         * @param {Event} keyEvent The keyboard event object.
         */
        const removeTabIndentation = function(keyEvent) {
            const domElement = inputAreaElement[0];

            let selectionBegin = domElement.selectionStart;
            let selectionEnd = domElement.selectionEnd;
            const fullContent = domElement.value;
            const tabPattern = new RegExp(/^[\t]{1}/);
            let totalAdjustments = 0;

            // Handle single line
            if (selectionBegin === selectionEnd) {
                // Move to the start of the current line
                while (selectionBegin > 0) {
                    if (fullContent.charAt(selectionBegin - 1) === "\n") {
                        break;
                    }
                    selectionBegin--;
                }

                const linePortion = fullContent.substring(selectionBegin, selectionEnd);
                const matchedTab = linePortion.match(tabPattern);

                if (matchedTab) {
                    domElement.value = fullContent.substring(0, selectionBegin) + linePortion.replace(tabPattern, '') + fullContent.substring(selectionEnd);
                    selectionEnd--;
                }

                domElement.selectionStart = domElement.selectionEnd = selectionEnd;
            }
            // Handle multiline
            else {
                const selectedLines = fullContent.substring(selectionBegin, selectionEnd).split("\n");

                for (let lineIndex = 0; lineIndex < selectedLines.length; lineIndex++) {
                    if (selectedLines[lineIndex].match(tabPattern)) {
                        totalAdjustments++;
                        selectedLines[lineIndex] = selectedLines[lineIndex].replace(tabPattern, '');
                    }
                }

                domElement.value = fullContent.substring(0, selectionBegin) + selectedLines.join("\n") + fullContent.substring(selectionEnd);

                domElement.selectionStart = selectionBegin;
                domElement.selectionEnd = selectionEnd - totalAdjustments;
            }
        };

        const formattingActions = {
            makeBold: function() {
                encloseSelection('**', '**');
            },
            makeItalic: function() {
                encloseSelection('*', '*');
            },
            makeStrikethrough: function() {
                encloseSelection('~~', '~~');
            },
            insertCodeBlock: function() {
                encloseSelection('`', '`');
            },
            createLink: function() {
                const domElement = inputAreaElement[0];
                const selectionBegin = domElement.selectionStart;
                const selectionEnd = domElement.selectionEnd;
                const fullContent = domElement.value;

                const currentSelection = fullContent.substring(selectionBegin, selectionEnd);
                const markdownLink = '[' + currentSelection + '](' + currentSelection + ')';

                domElement.value = fullContent.substring(0, selectionBegin) + markdownLink + fullContent.substring(selectionEnd);
                domElement.selectionStart = domElement.selectionEnd = selectionEnd + markdownLink.length;
            },
            insertImage: function() {
                const domElement = inputAreaElement[0];
                const selectionBegin = domElement.selectionStart;
                const selectionEnd = domElement.selectionEnd;
                const fullContent = domElement.value;

                const currentSelection = fullContent.substring(selectionBegin, selectionEnd);
                const markdownImage = '![' + currentSelection + '](' + currentSelection + ')';

                domElement.value = fullContent.substring(0, selectionBegin) + markdownImage + fullContent.substring(selectionEnd);
                domElement.selectionStart = domElement.selectionEnd = selectionEnd + markdownImage.length;
            },
            createList: function() {
                const domElement = inputAreaElement[0];
                const selectionBegin = domElement.selectionStart;
                const selectionEnd = domElement.selectionEnd;
                const fullContent = domElement.value;

                const selectedLines = fullContent.substring(selectionBegin, selectionEnd).split("\n");

                for (let lineIndex = 0; lineIndex < selectedLines.length; lineIndex++) {
                    selectedLines[lineIndex] = '* ' + selectedLines[lineIndex];
                }

                domElement.value = fullContent.substring(0, selectionBegin) + "\n" + selectedLines.join("\n") + "\n" + fullContent.substring(selectionEnd);
            },
            createQuote: function() {
                const domElement = inputAreaElement[0];
                const selectionBegin = domElement.selectionStart;
                const selectionEnd = domElement.selectionEnd;
                const fullContent = domElement.value;

                const selectedLines = fullContent.substring(selectionBegin, selectionEnd).split("\n");

                for (let lineIndex = 0; lineIndex < selectedLines.length; lineIndex++) {
                    selectedLines[lineIndex] = '> ' + selectedLines[lineIndex];
                }

                domElement.value = fullContent.substring(0, selectionBegin) + selectedLines.join("\n") + fullContent.substring(selectionEnd);
            },
            addHeading1: function() {
                encloseSelection('#', '');
            },
            addHeading2: function() {
                encloseSelection('##', '');
            },
            addHeading3: function() {
                encloseSelection('###', '');
            },
            addHeading4: function() {
                encloseSelection('####', '');
            },
            addHeading5: function() {
                encloseSelection('#####', '');
            },
            addHeading6: function() {
                encloseSelection('######', '');
            }
        };

        inputAreaElement.on('keydown', function(keyboardEvt) {
            if (keyboardEvt.keyCode === 9) { // Tab key
                keyboardEvt.preventDefault();
                keyboardEvt.stopPropagation();

                if (keyboardEvt.shiftKey) {
                    removeTabIndentation(keyboardEvt);
                } else {
                    applyTabIndentation(keyboardEvt);
                }
            }
        });

        parentContainer.on('click', 'nav a', function(mouseEvt) {
            const clickedAnchor = jqObject(mouseEvt.target);
            const actionKey = clickedAnchor.attr('href').split('#').pop();

            if (formattingActions[actionKey]) {
                formattingActions[actionKey]();
            }

            return false;
        });
    };

}(Zepto));