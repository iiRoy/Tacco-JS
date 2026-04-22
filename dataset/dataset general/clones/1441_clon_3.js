// Console Widget for Web Applications
// Version 2.0 - Reimagined for modern JS
//
// Copyright 2024, [Your Name/Company]. All rights reserved.
//
// Licensed under the MIT License.

(function(jq) {
    // Determine if the user agent is an Apple-based rendering engine.
    const isAppleEngine = !!~navigator.userAgent.indexOf(' AppleWebKit/');

    jq.fn.terminalWidget = function(opts) {
        // Default configuration options, merged with user-provided options.
        const defaultOptions = {
            promptLabel: "> ",
            continuedPromptLabel: ">> ",
            welcomeMessage: null,
            autofocus: true,
            historyPreserveColumn: false,
            commandValidate: null,
            commandHandle: null,
            cancelHandle: null,
            charInsertTrigger: null,
            completionHandler: null // New option for tab completion
        };
        const widgetOptions = jq.extend({}, defaultOptions, opts);

        ////////////////////////////////////////////////////////////////////////
        // Keyboard Input Mappings
        // These maps define actions for various key combinations.
        const actionKeyMap = Object.freeze({
            // Arrow Keys
            37: moveCaretBackward, // Left
            39: moveCaretForward,  // Right
            38: recallPreviousCommand, // Up
            40: recallNextCommand, // Down

            // Editing Keys
            8:  deleteBackward, // Backspace
            46: deleteForward,  // Delete
            35: jumpCaretToEnd, // End
            36: jumpCaretToStart, // Home

            // Execution Keys
            13: triggerCommandExecution, // Enter/Return
            9:  initiateCompletion // Tab
        });

        const controlKeyMap = Object.freeze({
            // Ctrl + Alphabet
            65: jumpCaretToStart, // C-a
            69: jumpCaretToEnd,   // C-e
            68: deleteForward,    // C-d
            78: recallNextCommand, // C-n
            80: recallPreviousCommand, // C-p
            66: moveCaretBackward, // C-b
            70: moveCaretForward,  // C-f
            75: deleteUntilEnd    // C-k
        });

        const metaKeyMap = Object.freeze({
            // Alt + Alphabet (Meta-key combinations)
            70: jumpCaretToNextWord,     // M-f
            66: jumpCaretToPreviousWord, // M-b
            68: deleteNextWord           // M-d
        });

        const caretMarkerHtml = '<span class="terminal-caret-indicator">&nbsp;</span>';

        ////////////////////////////////////////////////////////////////////////
        // Internal State Variables
        // These variables manage the current state of the terminal widget.
        const hostElement = jq(this);
        const contentWrapper = jq('<div class="terminal-content-wrapper"></div>');
        // Using a textarea for better paste handling and multiline input.
        const inputBuffer = jq('<textarea class="terminal-input-buffer"></textarea>');

        let currentPromptContainer;
        let editablePromptSpan;
        let cursorPosition = 0; // Current column of the caret
        let currentInputBuffer = ''; // The text currently being edited
        let tempHistoryBuffer = ''; // Stores current input when browsing history
        let accumulatedInput = ''; // For multi-line commands

        const commandHistoryStack = [];
        let historyIndex = 0; // Position in history stack (0 = current input)

        let suppressNextKey = 0; // Flag to prevent keypress event after keydown
        let inputEnabledFlag = true; // Controls if input is accepted
        let commandAbortedFlag = false; // Indicates if the current command was cancelled

        // Public API exposure
        const exposedApi = {};

        ////////////////////////////////////////////////////////////////////////
        // Widget Initialization
        // Sets up the DOM and initial state.
        (function initializeWidget() {
            hostElement.append(contentWrapper);
            contentWrapper.append(inputBuffer);
            // Position the hidden textarea off-screen.
            inputBuffer.css({ position: 'absolute', top: 0, left: '-9999px' });

            if (widgetOptions.welcomeMessage) {
                displayMessage(widgetOptions.welcomeMessage, 'terminal-welcome-message');
            }

            createNewPromptLine();

            if (widgetOptions.autofocus) {
                contentWrapper.addClass('terminal-focused');
                inputBuffer.focus();
                // Safari/Webkit sometimes needs a slight delay for focus.
                setTimeout(() => {
                    contentWrapper.addClass('terminal-focused');
                    inputBuffer.focus();
                }, 100);
            }

            exposedApi.contentWrapper = contentWrapper;
            exposedApi.inputBuffer = inputBuffer;
            exposedApi.scrollDisplayToBottom = scrollDisplayToBottom;
        })();

        ////////////////////////////////////////////////////////////////////////
        // Public API Methods
        // These functions can be called from outside the widget.

        // Resets the terminal display, clearing all previous output.
        exposedApi.resetTerminal = () => {
            let hasWelcomeMsg = (widgetOptions.welcomeMessage !== null);
            contentWrapper.find('div').each((idx, divEl) => {
                const jqDiv = jq(divEl);
                // Preserve welcome message if it exists, and don't remove the current prompt box
                if (jqDiv.hasClass('terminal-welcome-message') && hasWelcomeMsg) {
                    hasWelcomeMsg = false;
                } else if (!jqDiv.hasClass('terminal-prompt-box')) {
                    jqDiv.remove();
                }
            });
            createNewPromptLine();
            contentWrapper.addClass('terminal-focused');
            inputBuffer.focus();
        };

        // Displays a temporary notification message to the user.
        exposedApi.showNotification = (displayMessage, notificationStyle) => {
            const notificationDiv = jq('<div class="notification-area"></div>')
                .append(jq('<div></div>').text(displayMessage))
                .css({ visibility: 'hidden' });
            hostElement.append(notificationDiv);

            // Determine if console should lose focus.
            let shouldBlurConsole = true;
            if (notificationStyle === 'fadeout') {
                setTimeout(() => {
                    notificationDiv.fadeOut(() => notificationDiv.remove());
                }, 4000);
            } else if (notificationStyle === 'action-prompt') {
                const actionLink = jq('<br/><div class="action-buttons"><a href="javascript:void(0);">OK</a></div>');
                notificationDiv.append(actionLink);
                shouldBlurConsole = false; // Keep console focused if an action is required
                actionLink.click(() => {
                    notificationDiv.fadeOut(() => {
                        notificationDiv.remove();
                        contentWrapper.css({ opacity: 1 }); // Restore console opacity
                    });
                });
            }

            const divHeight = notificationDiv.height();
            notificationDiv.css({ height: '0px', visibility: 'visible' })
                .animate({ height: divHeight + 'px' }, () => {
                    if (!shouldBlurConsole) {
                        contentWrapper.css({ opacity: 0.5 }); // Dim console if action is pending
                    }
                });
            notificationDiv.css('cursor', 'default');
            return notificationDiv;
        };

        ////////////////////////////////////////////////////////////////////////
        // Core UI Management Functions

        // Creates a new prompt line for user input.
        function createNewPromptLine() {
            cursorPosition = 0;
            currentInputBuffer = '';
            historyIndex = 0; // Reset history position
            enableInputHandling(); // Ensure input is active

            currentPromptContainer = jq('<div class="terminal-prompt-box"></div>');
            const promptLabelSpan = jq('<span class="terminal-prompt-label"></span>');
            const displayLabelText = exposedApi.isContinuedPrompt ? widgetOptions.continuedPromptLabel : widgetOptions.promptLabel;

            promptLabelSpan.text(displayLabelText);
            // Replace spaces with non-breaking spaces for consistent rendering.
            promptLabelSpan.html(promptLabelSpan.html().replace(/ /g, '&nbsp;')).show();

            currentPromptContainer.append(promptLabelSpan);
            editablePromptSpan = jq('<span class="terminal-editable-prompt"></span>');
            currentPromptContainer.append(editablePromptSpan);
            contentWrapper.append(currentPromptContainer);
            updatePromptDisplay(); // Render the new prompt
        }

        // Handles click events on the container, focusing the input.
        hostElement.on('click', () => {
            contentWrapper.addClass('terminal-focused');
            contentWrapper.removeClass('terminal-blurred');
            inputBuffer.focus(); // Standard focus, scrolling handled by scrollDisplayToBottom
            scrollDisplayToBottom();
            return false; // Prevent default click action
        });

        // Handles blur events on the input, indicating loss of focus.
        inputBuffer.on('blur', () => {
            contentWrapper.removeClass('terminal-focused');
            contentWrapper.addClass('terminal-blurred');
        });

        // Handles paste events for the input buffer.
        inputBuffer.on('paste', () => {
            inputBuffer.val(""); // Clear buffer to ensure only pasted text is processed
            // Timeout ensures the text is actually pasted into the textarea before reading.
            setTimeout(() => {
                insertTextIntoPrompt(inputBuffer.val());
                inputBuffer.val(""); // Clear again after processing
            }, 0);
        });

        ////////////////////////////////////////////////////////////////////////
        // Keyboard Event Handlers

        // Processes keydown events for special keys and control combinations.
        inputBuffer.on('keydown', (e) => {
            suppressNextKey = 0; // Reset suppression flag
            const eventCode = e.keyCode;

            // Ctrl+C: Cancel current execution
            if (e.ctrlKey && eventCode === 67) {
                suppressNextKey = eventCode;
                abortCurrentCommand();
                return false; // Prevent default action
            }

            if (inputEnabledFlag) {
                if (eventCode in actionKeyMap) {
                    suppressNextKey = eventCode;
                    actionKeyMap[eventCode]();
                    return false;
                } else if (e.ctrlKey && eventCode in controlKeyMap) {
                    suppressNextKey = eventCode;
                    controlKeyMap[eventCode]();
                    return false;
                } else if (e.altKey && eventCode in metaKeyMap) {
                    suppressNextKey = eventCode;
                    metaKeyMap[eventCode]();
                    return false;
                }
            }
            // Allow default action for other keys if not handled above
        });

        // Processes keypress events for character input.
        inputBuffer.on('keypress', (e) => {
            const eventCode = e.keyCode || e.which;

            if (isIgnorableKeyCombination(e)) {
                return false;
            }

            // Ctrl+V/Cmd+V: Allow paste event to proceed (handled by 'paste' event).
            if ((e.ctrlKey || e.metaKey) && String.fromCharCode(eventCode).toLowerCase() === 'v') {
                return true;
            }

            // If input is enabled and key wasn't suppressed by keydown, and is a printable char
            if (inputEnabledFlag && suppressNextKey !== eventCode && eventCode >= 32) {
                if (suppressNextKey) return false; // Double check if keydown handled it

                // Check for custom character insertion trigger if defined
                const triggerCustom = widgetOptions.charInsertTrigger;
                if (typeof triggerCustom === 'function') {
                    if (!triggerCustom(eventCode, currentInputBuffer)) {
                        return false; // Custom trigger prevented insertion
                    }
                }
                insertTextIntoPrompt(String.fromCharCode(eventCode));
            }
            // Prevent default for all keypress events in Webkit to avoid double input
            if (isAppleEngine) return false;
        });

        // Determines if a key combination should be ignored (e.g., Alt+Tab).
        function isIgnorableKeyCombination(e) {
            // Ignore Alt+Tab and Alt+` (tilde) which can occur when switching windows.
            const altKeyCodes = [9, 192]; // Tab, Backtick/Tilde
            return e.altKey && altKeyCodes.includes(e.keyCode);
        }

        ////////////////////////////////////////////////////////////////////////
        // Command History Management

        // Navigates through the command history.
        function rotateHistoryBuffer(direction) { // direction: -1 for previous, 1 for next
            if (commandHistoryStack.length === 0) return;

            // Save current input if not already saved as tempHistoryBuffer
            if (historyIndex === 0) {
                tempHistoryBuffer = currentInputBuffer;
            }

            historyIndex += direction;

            // Wrap around history stack
            if (historyIndex < 0) historyIndex = commandHistoryStack.length;
            else if (historyIndex > commandHistoryStack.length) historyIndex = 0;

            if (historyIndex === 0) {
                currentInputBuffer = tempHistoryBuffer; // Restore unsaved input
            } else {
                currentInputBuffer = commandHistoryStack[historyIndex - 1];
            }

            // Adjust cursor position based on options
            if (widgetOptions.historyPreserveColumn) {
                cursorPosition = Math.min(currentInputBuffer.length, cursorPosition);
                if (cursorPosition === 0) {
                    cursorPosition = currentInputBuffer.length;
                }
            } else {
                cursorPosition = currentInputBuffer.length; // Default to end of line
            }
            updatePromptDisplay();
        }

        function recallPreviousCommand() {
            rotateHistoryBuffer(-1);
        }

        function recallNextCommand() {
            rotateHistoryBuffer(1);
        }

        // Adds a command line to the history stack.
        function addCommandToHistory(commandLine) {
            if (commandLine.trim() !== '') { // Only add non-empty commands
                commandHistoryStack.push(commandLine);
            }
            tempHistoryBuffer = ''; // Clear temp buffer after adding to history
        }

        ////////////////////////////////////////////////////////////////////////
        // Text Editing Functions

        // Deletes the character at the current cursor position.
        function deleteCharUnderCaret() {
            if (cursorPosition < currentInputBuffer.length) {
                currentInputBuffer =
                    currentInputBuffer.substring(0, cursorPosition) +
                    currentInputBuffer.substring(cursorPosition + 1);
                tempHistoryBuffer = currentInputBuffer; // Update temp buffer
                return true;
            }
            return false;
        }

        // Deletes the character before the cursor.
        function deleteBackward() {
            if (moveCaret(-1)) { // Try to move caret back
                deleteCharUnderCaret(); // Then delete at new position
                updatePromptDisplay();
            }
        }

        // Deletes the character at the cursor.
        function deleteForward() {
            if (deleteCharUnderCaret()) {
                updatePromptDisplay();
            }
        }

        // Deletes all characters from the cursor to the end of the line.
        function deleteUntilEnd() {
            while (cursorPosition < currentInputBuffer.length) {
                deleteCharUnderCaret();
                updatePromptDisplay();
            }
        }

        // Deletes the next word.
        function deleteNextWord() {
            // Skip non-alphanumeric characters first
            while (cursorPosition < currentInputBuffer.length &&
                   !isAlphanumeric(currentInputBuffer[cursorPosition])) {
                deleteCharUnderCaret();
                updatePromptDisplay();
            }
            // Delete alphanumeric characters until a non-alphanumeric is found
            while (cursorPosition < currentInputBuffer.length &&
                   isAlphanumeric(currentInputBuffer[cursorPosition])) {
                deleteCharUnderCaret();
                updatePromptDisplay();
            }
        }

        ////////////////////////////////////////////////////////////////////////
        // Command Execution Lifecycle

        // Validates and initiates command execution.
        function triggerCommandExecution() {
            const commandLine = currentInputBuffer;
            const validator = widgetOptions.commandValidate;

            if (typeof validator === 'function') {
                const validationResult = validator(commandLine);
                if (validationResult === true) {
                    executeCommand();
                } else if (validationResult === false) {
                    // Validation failed without a specific message
                    displayMessage('Command validation failed.', 'terminal-message-error');
                    createNewPromptLine(); // Start a new prompt
                } else {
                    // Validation returned a custom error message
                    displayMessage(validationResult, 'terminal-message-error');
                    createNewPromptLine(); // Start a new prompt
                }
            } else {
                executeCommand(); // No custom validation, proceed
            }
        }

        // Scrolls the terminal display to show the latest output.
        function scrollDisplayToBottom() {
            contentWrapper.prop({ scrollTop: contentWrapper.prop("scrollHeight") });
        }

        // Handles user cancellation (e.g., Ctrl+C).
        function abortCurrentCommand() {
            commandAbortedFlag = true; // Set flag
            if (typeof widgetOptions.cancelHandle === 'function') {
                widgetOptions.cancelHandle(); // Call custom cancellation handler
            }
            // Display cancellation message and create new prompt.
            displayMessage('^C', 'terminal-message-cancel');
            createNewPromptLine();
        }

        // Executes the command using the provided handler.
        function executeCommand() {
            const commandHandler = widgetOptions.commandHandle;
            if (typeof commandHandler === 'function') {
                disableInputHandling(); // Disable input while command is running
                addCommandToHistory(currentInputBuffer);

                let textToProcess = currentInputBuffer;
                if (exposedApi.isContinuedPrompt) {
                    accumulatedInput = accumulatedInput ? `${accumulatedInput}\n${currentInputBuffer}` : currentInputBuffer;
                } else {
                    accumulatedInput = undefined; // Clear accumulated input for single-line commands
                }

                if (accumulatedInput) {
                    textToProcess = accumulatedInput;
                }

                // Call the external command handler, providing a callback for results.
                const handlerResult = commandHandler(textToProcess, (messages) => {
                    processCommandResult(messages);
                });

                // Handle immediate returns from the command handler.
                if (exposedApi.isContinuedPrompt && !accumulatedInput) {
                    // This scenario is tricky; if isContinuedPrompt is true but no accumulatedInput,
                    // it implies the handler needs more input. We'll let processCommandResult handle it.
                }

                if (typeof handlerResult === 'boolean') {
                    if (handlerResult) {
                        processCommandResult(); // Command succeeded without explicit output
                    } else {
                        processCommandResult('Command failed.', 'terminal-message-error');
                    }
                } else if (typeof handlerResult === 'string') {
                    processCommandResult(handlerResult, 'terminal-message-success');
                } else if (Array.isArray(handlerResult)) {
                    processCommandResult(handlerResult);
                } else if (exposedApi.isContinuedPrompt) {
                    processCommandResult(); // For continued prompts, just move to next line
                }
            } else {
                // No command handler defined, treat as empty command.
                processCommandResult();
            }
        }

        ////////////////////////////////////////////////////////////////////////
        // Input State Control

        // Disables user input.
        function disableInputHandling() {
            inputEnabledFlag = false;
        }

        // Enables user input.
        function enableInputHandling() {
            inputEnabledFlag = true;
            commandAbortedFlag = false; // Reset cancellation flag
        }

        ////////////////////////////////////////////////////////////////////////
        // Command Result Processing

        // Displays command output and prepares for the next command.
        function processCommandResult(displayMessage, messageStyle) {
            cursorPosition = -1; // Invalidate cursor position to force full redraw (removes caret from previous line)
            updatePromptDisplay(); // Update display (removes cursor from old prompt)

            if (typeof displayMessage === 'string') {
                displayMessage(displayMessage, messageStyle);
            } else if (Array.isArray(displayMessage)) {
                displayMessage.forEach(msgItem => {
                    if (typeof msgItem === 'string') {
                        displayMessage(msgItem);
                    } else if (msgItem && typeof msgItem === 'object' && msgItem.message) {
                        displayMessage(msgItem.message, msgItem.className);
                    }
                });
            }
            // Ensure a new prompt line is created unless explicitly continuing
            if (!exposedApi.isContinuedPrompt) {
                createNewPromptLine();
            } else {
                // If continued, just update the prompt for the next line
                createNewPromptLine(); // This will create a new prompt with the continued label
            }
            scrollDisplayToBottom();
        }

        // Appends a message to the terminal output.
        function displayMessage(messageText, messageCssClass) {
            const messageDiv = jq('<div class="terminal-message"></div>');
            if (messageCssClass) {
                messageDiv.addClass(messageCssClass);
            }
            messageDiv.text(messageText); // Use .text() for safety against XSS
            contentWrapper.append(messageDiv);
            scrollDisplayToBottom();
        }

        ////////////////////////////////////////////////////////////////////////
        // Prompt Rendering and Cursor Management

        // Updates the visual representation of the prompt line.
        function updatePromptDisplay() {
            let promptContent = currentInputBuffer;
            let preCaret = promptContent.substring(0, cursorPosition);
            let postCaret = promptContent.substring(cursorPosition);

            // Rebuild the editable prompt span with the caret.
            editablePromptSpan.html(
                jq('<span></span>').text(preCaret).html() +
                caretMarkerHtml +
                jq('<span></span>').text(postCaret).html()
            );

            // Scroll to the right if the prompt text is too long and cursor is off-screen.
            const promptWidth = editablePromptSpan.width();
            const wrapperWidth = contentWrapper.width();
            const labelWidth = currentPromptContainer.find('.terminal-prompt-label').width();
            const totalPromptWidth = promptWidth + labelWidth;

            if (totalPromptWidth > wrapperWidth) {
                // Calculate scroll amount to keep cursor in view
                const cursorLeft = editablePromptSpan.find('.terminal-caret-indicator').position().left + labelWidth;
                if (cursorLeft > wrapperWidth - 50) { // Keep 50px buffer
                    contentWrapper.scrollLeft(contentWrapper.scrollLeft() + (cursorLeft - (wrapperWidth - 50)));
                } else if (cursorLeft < 50) { // If cursor is too far left
                    contentWrapper.scrollLeft(Math.max(0, contentWrapper.scrollLeft() - (50 - cursorLeft)));
                }
            } else {
                contentWrapper.scrollLeft(0); // Reset horizontal scroll
            }
            scrollDisplayToBottom(); // Always ensure vertical scroll is at bottom
        }

        // Moves the caret by a specified number of characters.
        function moveCaret(delta) {
            const newPosition = cursorPosition + delta;
            // Clamp new position within valid bounds (0 to length of buffer).
            const clampedPosition = Math.max(0, Math.min(currentInputBuffer.length, newPosition));
            if (clampedPosition !== cursorPosition) {
                cursorPosition = clampedPosition;
                updatePromptDisplay();
                return true;
            }
            return false; // Caret did not move
        }

        function moveCaretBackward() {
            moveCaret(-1);
        }

        function moveCaretForward() {
            moveCaret(1);
        }

        function jumpCaretToStart() {
            cursorPosition = 0;
            updatePromptDisplay();
        }

        function jumpCaretToEnd() {
            cursorPosition = currentInputBuffer.length;
            updatePromptDisplay();
        }

        // Moves caret to the start of the next word.
        function jumpCaretToNextWord() {
            let originalPos = cursorPosition;
            // Skip non-alphanumeric characters
            while (cursorPosition < currentInputBuffer.length &&
                   !isAlphanumeric(currentInputBuffer[cursorPosition])) {
                cursorPosition++;
            }
            // Move past alphanumeric characters
            while (cursorPosition < currentInputBuffer.length &&
                   isAlphanumeric(currentInputBuffer[cursorPosition])) {
                cursorPosition++;
            }
            if (cursorPosition !== originalPos) {
                updatePromptDisplay();
            }
        }

        // Moves caret to the start of the previous word.
        function jumpCaretToPreviousWord() {
            let originalPos = cursorPosition;
            // Move backward, skipping non-alphanumeric characters
            while (cursorPosition > 0 && !isAlphanumeric(currentInputBuffer[cursorPosition - 1])) {
                cursorPosition--;
            }
            // Move backward, skipping alphanumeric characters (end of previous word)
            while (cursorPosition > 0 && isAlphanumeric(currentInputBuffer[cursorPosition - 1])) {
                cursorPosition--;
            }
            if (cursorPosition !== originalPos) {
                updatePromptDisplay();
            }
        }

        // Inserts text at the current cursor position.
        function insertTextIntoPrompt(textToInsert) {
            if (textToInsert.length === 0) return;

            const preCaret = currentInputBuffer.substring(0, cursorPosition);
            const postCaret = currentInputBuffer.substring(cursorPosition);
            currentInputBuffer = preCaret + textToInsert + postCaret;
            cursorPosition += textToInsert.length;
            tempHistoryBuffer = currentInputBuffer; // Update temp buffer
            updatePromptDisplay();
        }

        // Utility: Checks if a character is alphanumeric.
        function isAlphanumeric(char) {
            const code = char.charCodeAt(0);
            return (code >= 48 && code <= 57) || // numeric (0-9)
                   (code >= 65 && code <= 90) || // upper alpha (A-Z)
                   (code >= 97 && code <= 122);  // lower alpha (a-z)
        }

        // Placeholder for command completion logic (e.g., auto-suggest).
        function initiateCompletion() {
            // This function would typically trigger an external completion handler.
            // A more advanced implementation might pass currentInputBuffer and cursorPosition
            // to a completion function defined in widgetOptions.
            if (typeof widgetOptions.completionHandler === 'function') {
                widgetOptions.completionHandler(currentInputBuffer, cursorPosition, (completedText) => {
                    if (completedText) {
                        const preCaret = currentInputBuffer.substring(0, cursorPosition);
                        // Only insert the part that completes the current input
                        const newPostCaret = completedText.substring(preCaret.length);
                        insertTextIntoPrompt(newPostCaret);
                    }
                });
            }
            return false; // Prevent default tab behavior (e.g., focus change)
        }

        return exposedApi; // Return the public API for this widget instance.
    };

})(jQuery);