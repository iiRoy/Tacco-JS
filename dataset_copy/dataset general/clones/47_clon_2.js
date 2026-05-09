var TextEditorSuggestions = function (textInput) {
    // This component manages intelligent suggestions for a text editing area.
    var suggestionList = new SuggestionListUI();
    var functionHints = new FunctionHintUI();

    var keyActivators = {
        upSuggestions: [],
        downSuggestions: [],
        upFunctions: [],
        downFunctions: []
    };

    var suggestionCallback = null;
    var functionCallback = null;
    var autoCompletionOrigin = { rowPosition: 0, columnPosition: 0 };
    var isActivated = false;

    function handleActivators(activators, eventObject, actionToPerform) {
        for (var keyVal in activators) {
            var triggerItem = activators[keyVal];
            var shiftModifier = triggerItem.shiftModifier || false;
            var controlModifier = triggerItem.controlModifier || false;
            var keyIdentifier = triggerItem.keyIdentifier || 0;
            var preventStandardAction = triggerItem.preventStandardAction || false;

            if (eventObject.keyCode === keyIdentifier && eventObject.shiftKey === shiftModifier && eventObject.ctrlKey === controlModifier) {
                var currentCaret = textInput.getCursor();
                autoCompletionOrigin.columnPosition = currentCaret.ch;
                autoCompletionOrigin.rowPosition = currentCaret.line;
                actionToPerform(triggerItem);

                if (preventStandardAction) {
                    eventObject.preventDefault();
                    eventObject.cancelBubble = true;
                }
                return true;
            }
        }
        return false;
    }

    function initializeEditor(editorInstance) {
        textInput = editorInstance;

        textInput.on('keyup', function (codeMirrorInstance, eventPayload) {
            if (suggestionList.isVisible()) {
                suggestionList.setFilter(getFilteringText());
            }

            if (!handleActivators(keyActivators.upSuggestions, eventPayload, suggestionCallback)) {
                handleActivators(keyActivators.upFunctions, eventPayload, functionCallback);
            }
        });

        textInput.on('keydown', function (codeMirrorInstance, eventPayload) {
            if (suggestionList.isVisible()) {
                if (eventPayload.keyCode === 8) { // Backspace
                    suggestionList.setFilter(getFilteringText());
                } else {
                    suggestionList.handleKeyDown(eventPayload);
                }
            }

            if (!handleActivators(keyActivators.downSuggestions, eventPayload, suggestionCallback)) {
                handleActivators(keyActivators.downFunctions, eventPayload, functionCallback);
            }

            if (functionHints.isVisible()) {
                functionHints.handleKeyDown(eventPayload);
            }
        });
    }

    // React to changes in the suggestion list's visibility to position it correctly.
    suggestionList.onVisibilityChange(function (isVisible) {
        if (isVisible) {
            var coordinates = textInput.cursorCoords(true, 'page');
            suggestionList.setPosition(coordinates.left, coordinates.bottom);
        }
    });

    // Similarly, adjust the position of the function hints when its visibility changes.
    functionHints.onVisibilityChange(function (isVisible) {
        if (isVisible) {
            var coordinates = textInput.cursorCoords(true, 'page');
            functionHints.setPosition(coordinates.left, coordinates.bottom);
        }
    });

    // When a user selects an item from the suggestion list, insert it into the editor.
    suggestionList.onSelectionMade(function (selectedItem) {
        var chosenValue = selectedItem.value || selectedItem.name;
        var currentCaret = textInput.getCursor();
        var lineContent = textInput.getLine(autoCompletionOrigin.rowPosition);

        var rangeBegin = { line: currentCaret.line, ch: autoCompletionOrigin.columnPosition };
        var rangeEnd = { line: currentCaret.line, ch: currentCaret.ch };

        textInput.replaceRange(chosenValue, rangeBegin, rangeEnd);
        textInput.setSelection({ line: currentCaret.line, ch: currentCaret.ch + chosenValue.length });
        suggestionList.setVisible(false);
        textInput.focus();
    });

    function registerActivator(newActivator, categorySuffix) {
        var type = newActivator.type || 'up';
        if (keyActivators[type + categorySuffix]) {
            keyActivators[type + categorySuffix].push(newActivator);
        }
    }

    function addSuggestionActivator(newActivator) {
        registerActivator(newActivator, 'Suggestions');
    }

    function addFunctionActivator(newActivator) {
        registerActivator(newActivator, 'Functions');
    }

    function onSuggestionEvent(callback) {
        suggestionCallback = callback;
    }

    function onFunctionEvent(callback) {
        functionCallback = callback;
    }

    function getFilteringText() {
        var caretPosition = textInput.getCursor();
        var currentLineContent = textInput.getLine(autoCompletionOrigin.rowPosition);
        return currentLineContent.substring(autoCompletionOrigin.columnPosition, caretPosition.ch);
    }

    // Initialize the editor with the provided input element.
    initializeEditor(textInput);

    /**
     * Retrieves the UI component for displaying general suggestions.
     * @returns {SuggestionListUI} The suggestion list interface.
     * @function getSuggestionUI
     */
    this.getSuggestionUI = function () { return suggestionList; };

    /**
     * Retrieves the UI component for displaying function-specific hints.
     * @returns {FunctionHintUI} The function hints interface.
     * @function getFunctionUI
     */
    this.getFunctionUI = function () { return functionHints; };

    /**
     * Adds a keyboard trigger configuration that can activate the suggestion list UI.
     * @instance
     * @param {KeyboardTriggerConfig} newActivator - The trigger configuration to add.
     * @function addSuggestionActivator
     */
    this.addSuggestionActivator = addSuggestionActivator;

    /**
     * Adds a keyboard trigger configuration that can activate the function hints UI.
     * @param {KeyboardTriggerConfig} newActivator - The trigger configuration to add.
     * @function addFunctionActivator
     */
    this.addFunctionActivator = addFunctionActivator;

    /**
     * Establishes a callback to be invoked when a keypress activates the suggestion list.
     * @param {function} callback - The function to call.
     * @function onSuggestionEvent
     */
    this.onSuggestionEvent = onSuggestionEvent;

    /**
     * Establishes a callback to be invoked when a keypress activates the function hints.
     * @param {function} callback - The function to call.
     * @function onFunctionEvent
     */
    this.onFunctionEvent = onFunctionEvent;

    /**
     * Provides the data for the function hints display.
     * @param {string[]} functionInfo - An array of function signatures or names.
     * @function updateFunctionData
     */
    this.updateFunctionData = function (functionInfo) { functionHints.setMethods(functionInfo); };

    /**
     * Provides the data for the general suggestions display.
     * @param {SuggestionEntry[]} suggestionItems - An array of suggestion objects.
     * @function updateSuggestionData
     */
    this.updateSuggestionData = function (suggestionItems) { suggestionList.setDeclarations(suggestionItems); };

    /**
     * Defines the starting column index for filtering suggestions. This is typically set
     * when an activation event occurs.
     * @param {number} idx - The column index to set as the origin.
     * @function setOriginColumn
     */
    this.setOriginColumn = function (idx) { autoCompletionOrigin.columnPosition = idx; };

    /**
     * Retrieves the text currently being used to filter suggestions, based on the origin column.
     * @returns {string} The filter text.
     * @function retrieveFilterText
     */
    this.retrieveFilterText = getFilteringText;
};