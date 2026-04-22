/**
 * Manages contextual completion and signature help for a text editor.
 * This module facilitates dynamic suggestions and method signature displays
 * based on user input and configurable key triggers.
 *
 * @param {object} editorInstance - The CodeMirror editor instance to attach to.
 *                                  Must expose methods like `getCursor`, `on`, `getLine`, `replaceRange`, `setSelection`, `cursorCoords`.
 * @class EditorCompletionManager
 */
const EditorCompletionManager = function (editorInstance) {
    // Enable/disable debug logging
    const DEBUG_MODE = false;
    const _log = (...args) => {
        if (DEBUG_MODE) {
            console.log("[ECM Debug]", ...args);
        }
    };

    // Self-reference for public methods
    const self = this;

    // Core UI components for suggestions and signature help
    const suggestionProvider = new DeclarationsIntellisense();
    const signatureHelper = new MethodsIntellisense();

    // Storage for key-based activation triggers
    const eventActivators = {
        suggestionKeyup: [],   // Triggers for suggestions on key release
        suggestionKeydown: [], // Triggers for suggestions on key press
        signatureKeyup: [],    // Triggers for signature help on key release
        signatureKeydown: []   // Triggers for signature help on key press
    };

    // Callback functions to be invoked when triggers are activated
    let suggestionActivationHandler = null;
    let signatureActivationHandler = null;

    // Stores the starting point for the current completion session
    let completionContext = {
        line: -1,
        column: -1
    };

    // Internal flag to track if the module is properly initialized with an editor
    let moduleReady = false;

    /**
     * Evaluates if a keyboard event matches any registered activation triggers.
     * If a match is found, the corresponding callback is executed.
     *
     * @param {Array<object>} activatorList - A list of trigger configurations.
     * @param {KeyboardEvent} keyboardEvent - The DOM keyboard event object.
     * @param {function} activationCallback - The function to call if a trigger matches.
     * @returns {boolean} - True if a trigger was successfully processed, false otherwise.
     */
    const evaluateEventActivators = (activatorList, keyboardEvent, activationCallback) => {
        if (!keyboardEvent || typeof activationCallback !== 'function' || !Array.isArray(activatorList)) {
            _log("Invalid input to evaluateEventActivators.");
            return false;
        }

        for (const triggerConfig of activatorList) {
            const requiresShift = triggerConfig.shiftKey || false;
            const requiresCtrl = triggerConfig.ctrlKey || false;
            const targetKeyCode = triggerConfig.keyCode || 0;
            const preventEventDefault = triggerConfig.preventDefault || false;

            if (keyboardEvent.keyCode === targetKeyCode &&
                keyboardEvent.shiftKey === requiresShift &&
                keyboardEvent.ctrlKey === requiresCtrl)
            {
                _log(`Trigger matched: KeyCode=${targetKeyCode}, Shift=${requiresShift}, Ctrl=${requiresCtrl}`);
                const currentCursor = editorInstance.getCursor();
                completionContext.column = currentCursor.ch;
                completionContext.line = currentCursor.line;

                activationCallback(triggerConfig); // Invoke the registered handler

                if (preventEventDefault) {
                    keyboardEvent.preventDefault();
                    // evt.cancelBubble is largely obsolete; preventDefault is usually enough.
                }
                return true;
            }
        }
        return false;
    };

    /**
     * Handles keyup events within the editor.
     * Manages filtering suggestions and activating triggers.
     * @param {object} cmInstance - The CodeMirror instance (unused directly, but passed by CM).
     * @param {KeyboardEvent} eventObject - The keyup event.
     */
    const handleEditorKeyup = (cmInstance, eventObject) => {
        if (suggestionProvider.isVisible()) {
            suggestionProvider.setFilter(extractCurrentFilterTerm());
        }

        // Attempt to activate suggestion triggers first
        const suggestionTriggered = evaluateEventActivators(
            eventActivators.suggestionKeyup,
            eventObject,
            suggestionActivationHandler
        );

        // If no suggestion trigger fired, try signature help triggers
        if (!suggestionTriggered) {
            evaluateEventActivators(
                eventActivators.signatureKeyup,
                eventObject,
                signatureActivationHandler
            );
        }
    };

    /**
     * Handles keydown events within the editor.
     * Manages suggestion UI interaction and activating triggers.
     * @param {object} cmInstance - The CodeMirror instance (unused directly, but passed by CM).
     * @param {KeyboardEvent} eventObject - The keydown event.
     */
    const handleEditorKeydown = (cmInstance, eventObject) => {
        if (suggestionProvider.isVisible()) {
            // If backspace, update filter; otherwise, let the suggestion UI handle the key
            if (eventObject.keyCode === 8) { // Backspace key
                suggestionProvider.setFilter(extractCurrentFilterTerm());
            } else {
                suggestionProvider.handleKeyDown(eventObject);
            }
        }

        // Attempt to activate suggestion triggers first
        const suggestionTriggered = evaluateEventActivators(
            eventActivators.suggestionKeydown,
            eventObject,
            suggestionActivationHandler
        );

        // If no suggestion trigger fired, try signature help triggers
        if (!suggestionTriggered) {
            evaluateEventActivators(
                eventActivators.signatureKeydown,
                eventObject,
                signatureActivationHandler
            );
        }

        // Allow signature helper to process keydown events if visible
        if (signatureHelper.isVisible()) {
            signatureHelper.handleKeyDown(eventObject);
        }
    };

    /**
     * Sets up event listeners on the provided CodeMirror editor instance.
     *
     * @param {object} targetEditor - The CodeMirror editor object.
     */
    const initializeEditorListeners = (targetEditor) => {
        if (!targetEditor || typeof targetEditor.on !== 'function' || typeof targetEditor.getCursor !== 'function') {
            console.error("EditorCompletionManager: Invalid CodeMirror editor instance provided for initialization.");
            moduleReady = false;
            return;
        }
        editorInstance = targetEditor; // Ensure our internal reference is correct

        editorInstance.on('keyup', handleEditorKeyup);
        editorInstance.on('keydown', handleEditorKeydown);

        moduleReady = true;
        _log("EditorCompletionManager initialized and listeners attached.");
    };

    // --- UI Component Event Handlers ---

    // When the suggestion UI's visibility changes, position it correctly.
    suggestionProvider.onVisibleChanged((isVisible) => {
        if (!moduleReady || !editorInstance) return;

        if (isVisible) {
            const cursorCoordinates = editorInstance.cursorCoords(true, 'page');
            const { left, bottom } = cursorCoordinates;
            suggestionProvider.setPosition(left, bottom);
            _log(`Suggestion UI made visible at L:${left}, B:${bottom}`);
        } else {
            _log("Suggestion UI hidden.");
        }
    });

    // When the signature helper UI's visibility changes, position it correctly.
    signatureHelper.onVisibleChanged((isVisible) => {
        if (!moduleReady || !editorInstance) return;

        if (isVisible) {
            const cursorCoordinates = editorInstance.cursorCoords(true, 'page');
            const { left, bottom } = cursorCoordinates;
            signatureHelper.setPosition(left, bottom);
            _log(`Signature UI made visible at L:${left}, B:${bottom}`);
        } else {
            _log("Signature UI hidden.");
        }
    });

    // When an item is selected from the suggestion UI, insert it into the editor.
    suggestionProvider.onItemChosen((selectedItem) => {
        if (!moduleReady || !editorInstance) return;

        const insertedValue = selectedItem.value || selectedItem.name;
        const currentCursor = editorInstance.getCursor();

        // Define the range to replace: from the completion anchor to the current cursor position
        const replacementStart = { line: completionContext.line, ch: completionContext.column };
        const replacementEnd = { line: currentCursor.line, ch: currentCursor.ch };

        editorInstance.replaceRange(insertedValue, replacementStart, replacementEnd);
        editorInstance.setCursor({ line: currentCursor.line, ch: completionContext.column + insertedValue.length });
        suggestionProvider.setVisible(false);
        _log(`Item chosen: "${insertedValue}". Editor updated and suggestion UI hidden.`);
    });

    /**
     * Registers a new key trigger for either suggestion or signature help.
     *
     * @param {object} triggerConfiguration - Object defining the trigger (e.g., { keyCode: 32, ctrlKey: true, type: 'up' }).
     * @param {string} targetTypeIdentifier - 'suggestion' or 'signature'.
     * @param {string} eventPhase - 'keyup' or 'keydown'.
     */
    const registerActivationTrigger = (triggerConfiguration, targetTypeIdentifier, eventPhase) => {
        if (!triggerConfiguration || typeof triggerConfiguration.keyCode === 'undefined') {
            console.warn("EditorCompletionManager: Attempted to add an invalid trigger configuration (missing keyCode).");
            return;
        }
        if (!['suggestion', 'signature'].includes(targetTypeIdentifier)) {
            console.warn(`EditorCompletionManager: Invalid target type identifier "${targetTypeIdentifier}". Must be 'suggestion' or 'signature'.`);
            return;
        }
        if (!['keyup', 'keydown'].includes(eventPhase)) {
            console.warn(`EditorCompletionManager: Invalid event phase "${eventPhase}". Must be 'keyup' or 'keydown'.`);
            return;
        }

        const listName = `${targetTypeIdentifier}${eventPhase}`;
        if (eventActivators[listName]) {
            eventActivators[listName].push(triggerConfiguration);
            _log(`Registered new trigger for ${listName}:`, triggerConfiguration);
        } else {
            console.error(`EditorCompletionManager: Internal error - activator list "${listName}" not found.`);
        }
    };

    /**
     * Extracts the text typed by the user since the last completion anchor point.
     * This text is used to filter the suggestions.
     *
     * @returns {string} The current filter term.
     */
    const extractCurrentFilterTerm = () => {
        if (!moduleReady || !editorInstance) return '';
        if (completionContext.line === -1 || completionContext.column === -1) {
            _log("Completion context not set, returning empty filter.");
            return ''; // No active completion session
        }

        const currentCursor = editorInstance.getCursor();
        // Ensure we are on the same line as the completion anchor, otherwise reset filter
        if (currentCursor.line !== completionContext.line) {
            _log("Cursor moved to a different line, resetting completion context.");
            completionContext = { line: -1, column: -1 }; // Reset if line changed
            return '';
        }

        const currentLineContent = editorInstance.getLine(completionContext.line);
        // Ensure cursor hasn't moved before the anchor
        if (currentCursor.ch < completionContext.column) {
            _log("Cursor moved before completion anchor, resetting completion context.");
            completionContext = { line: -1, column: -1 }; // Reset if cursor moved back
            return '';
        }

        return currentLineContent.substring(completionContext.column, currentCursor.ch);
    };

    // --- Module Initialization ---
    initializeEditorListeners(editorInstance);

    // --- Public API ---

    /**
     * Retrieves the underlying suggestion provider UI component.
     * @returns {DeclarationsIntellisense} The suggestion provider instance.
     */
    self.getSuggestionProvider = () => suggestionProvider;

    /**
     * Retrieves the underlying signature helper UI component.
     * @returns {MethodsIntellisense} The signature helper instance.
     */
    self.getSignatureHelper = () => signatureHelper;

    /**
     * Adds a key trigger that will activate the suggestion UI.
     * @param {object} triggerConfig - Configuration object for the key trigger.
     *                                 Example: `{ keyCode: 13, shiftKey: true, type: 'keydown', preventDefault: true }`
     *                                 `type`: 'keyup' or 'keydown' (defaults to 'keyup').
     */
    self.addCompletionTrigger = (triggerConfig) => {
        const eventPhase = triggerConfig.type || 'keyup';
        registerActivationTrigger(triggerConfig, 'suggestion', eventPhase);
    };

    /**
     * Adds a key trigger that will activate the signature help UI.
     * @param {object} triggerConfig - Configuration object for the key trigger.
     *                                 Example: `{ keyCode: 57, shiftKey: true, type: 'keydown' }` (for `(`)
     *                                 `type`: 'keyup' or 'keydown' (defaults to 'keyup').
     */
    self.addSignatureHelpTrigger = (triggerConfig) => {
        const eventPhase = triggerConfig.type || 'keyup';
        registerActivationTrigger(triggerConfig, 'signature', eventPhase);
    };

    /**
     * Sets the callback function to be invoked when a completion trigger is activated.
     * This function should provide the data for the suggestion list.
     * @param {function} handlerFunction - The function to call. It receives the trigger config as an argument.
     */
    self.setSuggestionRequestHandler = (handlerFunction) => {
        if (typeof handlerFunction === 'function') {
            suggestionActivationHandler = handlerFunction;
            _log("Suggestion request handler set.");
        } else {
            console.warn("EditorCompletionManager: Attempted to set a non-function as suggestion request handler.");
        }
    };

    /**
     * Sets the callback function to be invoked when a signature help trigger is activated.
     * This function should provide the data for the signature help display.
     * @param {function} handlerFunction - The function to call. It receives the trigger config as an argument.
     */
    self.setSignatureHelpRequestHandler = (handlerFunction) => {
        if (typeof handlerFunction === 'function') {
            signatureActivationHandler = handlerFunction;
            _log("Signature help request handler set.");
        } else {
            console.warn("EditorCompletionManager: Attempted to set a non-function as signature help request handler.");
        }
    };

    /**
     * Updates the data displayed by the signature helper UI.
     * @param {string[]} signatureData - An array of strings representing method signatures.
     */
    self.updateSignatureHelpData = (signatureData) => {
        if (!moduleReady) return;
        signatureHelper.setMethods(signatureData);
        _log("Signature help data updated.");
    };

    /**
     * Updates the data displayed by the suggestion provider UI.
     * @param {Array<object>} completionData - An array of declaration items.
     */
    self.updateCompletionSuggestions = (completionData) => {
        if (!moduleReady) return;
        suggestionProvider.setDeclarations(completionData);
        _log("Completion suggestions data updated.");
    };

    /**
     * Sets the starting column index for the current completion session.
     * This is typically called when a trigger activates the suggestion list.
     * The line index is automatically determined from the current cursor position.
     * @param {number} newColumnIndex - The column index to set as the completion anchor.
     */
    self.setCompletionAnchorColumn = (newColumnIndex) => {
        if (!moduleReady || !editorInstance) return;
        const currentCursor = editorInstance.getCursor();
        completionContext.column = newColumnIndex;
        completionContext.line = currentCursor.line; // Always anchor to the current line
        _log(`Completion anchor set to Line: ${completionContext.line}, Column: ${completionContext.column}`);
    };

    /**
     * Retrieves the current filter text from the editor, based on the completion anchor.
     * @returns {string} The text used for filtering suggestions.
     */
    self.getCurrentFilterText = extractCurrentFilterTerm;
};