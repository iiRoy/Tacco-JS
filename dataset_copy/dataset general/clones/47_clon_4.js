class SuggestionOverlay {
    #isDisplayed = false;
    #visibilitySubscribers = [];
    #itemSelectedSubscribers = [];
    #currentFilter = '';
    #suggestionItems = [];

    setDisplayed(displayStatus) {
        if (this.#isDisplayed !== displayStatus) {
            this.#isDisplayed = displayStatus;
            this.#visibilitySubscribers.forEach(cb => cb(displayStatus));
        }
    }
    isDisplayed() { return this.#isDisplayed; }
    adjustFilter(text) { this.#currentFilter = text; /* Internal logic to re-filter suggestionItems */ }
    processKeyInput(keyboardEvent) { /* Internal logic for navigating suggestions (e.g., arrow keys, Enter, Esc) */ }
    reposition(xCoord, yCoord) { /* Internal logic to update the UI element's position */ }
    onDisplayStatusChange(callback) { this.#visibilitySubscribers.push(callback); }
    onItemSelected(callback) { this.#itemSelectedSubscribers.push(callback); }
    updateSuggestionList(data) { this.#suggestionItems = data; /* Internal logic to render new items */ }
}

class SignaturePopup {
    #isDisplayed = false;
    #visibilitySubscribers = [];
    #currentSignatures = [];

    setDisplayed(displayStatus) {
        if (this.#isDisplayed !== displayStatus) {
            this.#isDisplayed = displayStatus;
            this.#visibilitySubscribers.forEach(cb => cb(displayStatus));
        }
    }
    isDisplayed() { return this.#isDisplayed; }
    processKeyInput(keyboardEvent) { /* Internal logic for navigating signatures */ }
    reposition(xCoord, yCoord) { /* Internal logic to update the UI element's position */ }
    onDisplayStatusChange(callback) { this.#visibilitySubscribers.push(callback); }
    updateSignatureList(data) { this.#currentSignatures = data; /* Internal logic to render new signatures */ }
}

class InputCompletionController {
    #suggestionPanelInstance;
    #signatureDisplayInstance;
    #textInputAdapter;
    #keyActionRegistry = {
        keyUp: { suggestions: new Map(), signatures: new Map() },
        keyDown: { suggestions: new Map(), signatures: new Map() }
    };
    #suggestionInvocationHandler = null;
    #signatureInvocationHandler = null;
    #triggerActivationPoint = { columnIdx: 0, lineIdx: 0 };

    constructor(editorElement) {
        this.#suggestionPanelInstance = new SuggestionOverlay();
        this.#signatureDisplayInstance = new SignaturePopup();

        this.#bindPanelEvents();
        this.attachToInputSource(editorElement);
    }

    #bindPanelEvents() {
        this.#suggestionPanelInstance.onDisplayStatusChange(isVisible => {
            if (isVisible && this.#textInputAdapter) {
                const coords = this.#textInputAdapter.getCursorScreenCoordinates(true, 'page');
                this.#suggestionPanelInstance.reposition(coords.left, coords.bottom);
            }
        });

        this.#signatureDisplayInstance.onDisplayStatusChange(isVisible => {
            if (isVisible && this.#textInputAdapter) {
                const coords = this.#textInputAdapter.getCursorScreenCoordinates(true, 'page');
                this.#signatureDisplayInstance.reposition(coords.left, coords.bottom);
            }
        });

        this.#suggestionPanelInstance.onItemSelected(selectedItem => {
            if (!this.#textInputAdapter) return;

            const chosenValue = selectedItem.value || selectedItem.name;
            const currentCursorPos = this.#textInputAdapter.getCursorPosition();
            const replacementStart = { line: currentCursorPos.line, ch: this.#triggerActivationPoint.columnIdx };
            const replacementEnd = { line: currentCursorPos.line, ch: currentCursorPos.ch };

            this.#textInputAdapter.replaceTextRange(chosenValue, replacementStart, replacementEnd);
            this.#textInputAdapter.setCursorLocation({ line: currentCursorPos.line, ch: replacementStart.ch + chosenValue.length });
            this.#suggestionPanelInstance.setDisplayed(false);
            this.#textInputAdapter.focusElement();
        });
    }

    #createEditorAdapter(element) {
        let editorInstance;
        if (typeof element === 'string') {
            editorInstance = document.getElementById(element);
        } else {
            editorInstance = element;
        }

        if (!editorInstance || typeof editorInstance.on !== 'function' || typeof editorInstance.getCursor !== 'function') {
            console.warn("Provided element does not appear to be a CodeMirror instance or compatible. Using a dummy adapter.");
            return {
                subscribe: (eventName, handler) => {},
                getCursorPosition: () => ({ line: 0, ch: 0 }),
                getLineContent: (lineIndex) => '',
                replaceTextRange: (text, start, end) => {},
                setCursorLocation: (pos) => {},
                focusElement: () => {},
                getCursorScreenCoordinates: (arg1, arg2) => ({ left: 0, bottom: 0 })
            };
        }

        return {
            subscribe: (eventName, handler) => editorInstance.on(eventName, handler),
            getCursorPosition: () => {
                const cursor = editorInstance.getCursor();
                return { line: cursor.line, ch: cursor.ch };
            },
            getLineContent: (lineIndex) => editorInstance.getLine(lineIndex),
            replaceTextRange: (text, start, end) => editorInstance.replaceRange(text, start, end),
            setCursorLocation: (pos) => editorInstance.setSelection({ line: pos.line, ch: pos.ch }),
            focusElement: () => editorInstance.focus(),
            getCursorScreenCoordinates: (arg1, arg2) => editorInstance.cursorCoords(arg1, arg2)
        };
    }

    attachToInputSource(targetElement) {
        this.#textInputAdapter = this.#createEditorAdapter(targetElement);

        this.#textInputAdapter.subscribe('keyup', (cm, event) => {
            if (this.#suggestionPanelInstance.isDisplayed()) {
                this.#suggestionPanelInstance.adjustFilter(this.retrieveCurrentSegment());
            }
            this.#processKeyEvent(event, 'keyUp');
        });

        this.#textInputAdapter.subscribe('keydown', (cm, event) => {
            if (this.#suggestionPanelInstance.isDisplayed()) {
                if (event.keyCode === 8) {
                    this.#suggestionPanelInstance.adjustFilter(this.retrieveCurrentSegment());
                } else {
                    this.#suggestionPanelInstance.processKeyInput(event);
                }
            }
            if (this.#signatureDisplayInstance.isDisplayed()) {
                this.#signatureDisplayInstance.processKeyInput(event);
            }
            this.#processKeyEvent(event, 'keyDown');
        });
    }

    #createKeySignature(event) {
        return `${event.keyCode}-${event.shiftKey ? 'S' : ''}-${event.ctrlKey ? 'C' : ''}`;
    }

    #processKeyEvent(event, eventType) {
        if (!this.#textInputAdapter) return;

        const keySignature = this.#createKeySignature(event);
        const registry = this.#keyActionRegistry[eventType];
        let actionProcessed = false;

        let actionConfig = registry.suggestions.get(keySignature);
        if (actionConfig) {
            this.#triggerActivationPoint.columnIdx = this.#textInputAdapter.getCursorPosition().ch;
            this.#triggerActivationPoint.lineIdx = this.#textInputAdapter.getCursorPosition().line;
            if (this.#suggestionInvocationHandler) {
                this.#suggestionInvocationHandler(actionConfig.payload);
            }
            if (actionConfig.preventBehavior) {
                event.preventDefault();
                event.stopPropagation();
            }
            actionProcessed = true;
        }

        if (!actionProcessed) {
            actionConfig = registry.signatures.get(keySignature);
            if (actionConfig) {
                if (this.#signatureInvocationHandler) {
                    this.#signatureInvocationHandler(actionConfig.payload);
                }
                if (actionConfig.preventBehavior) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                actionProcessed = true;
            }
        }
    }

    #internalRegisterActivator(triggerConfiguration, category) {
        const eventType = triggerConfiguration.type === 'down' ? 'keyDown' : 'keyUp';
        const key = this.#createKeySignature(triggerConfiguration);
        this.#keyActionRegistry[eventType][category].set(key, {
            payload: triggerConfiguration.payload || null,
            preventBehavior: triggerConfiguration.preventDefault || false
        });
    }

    registerSuggestionActivator(triggerConfiguration) {
        this.#internalRegisterActivator(triggerConfiguration, 'suggestions');
    }

    registerSignatureActivator(triggerConfiguration) {
        this.#internalRegisterActivator(triggerConfiguration, 'signatures');
    }

    setSuggestionCallback(callbackFunction) {
        this.#suggestionInvocationHandler = callbackFunction;
    }

    setSignatureCallback(callbackFunction) {
        this.#signatureInvocationHandler = callbackFunction;
    }

    updateSuggestionData(dataCollection) {
        this.#suggestionPanelInstance.updateSuggestionList(dataCollection);
    }

    updateSignatureData(dataCollection) {
        this.#signatureDisplayInstance.updateSignatureList(dataCollection);
    }

    markTriggerColumn(columnIndex) {
        this.#triggerActivationPoint.columnIdx = columnIndex;
    }

    retrieveCurrentSegment() {
        if (!this.#textInputAdapter) return '';
        const currentCursor = this.#textInputAdapter.getCursorPosition();
        const lineContent = this.#textInputAdapter.getLineContent(this.#triggerActivationPoint.lineIdx);
        return lineContent.substring(this.#triggerActivationPoint.columnIdx, currentCursor.ch);
    }

    getSuggestionInterface() { return this.#suggestionPanelInstance; }
    getSignatureInterface() { return this.#signatureDisplayInstance; }
}

function createEditorEnhancer(targetEditorElement) {
    const enhancerSystem = new InputCompletionController(targetEditorElement);

    return {
        getSuggestionInterface: () => enhancerSystem.getSuggestionInterface(),
        getSignatureInterface: () => enhancerSystem.getSignatureInterface(),
        registerSuggestionActivator: (config) => enhancerSystem.registerSuggestionActivator(config),
        registerSignatureActivator: (config) => enhancerSystem.registerSignatureActivator(config),
        setSuggestionCallback: (callback) => enhancerSystem.setSuggestionCallback(callback),
        setSignatureCallback: (callback) => enhancerSystem.setSignatureCallback(callback),
        updateSignatures: (data) => enhancerSystem.updateSignatureData(data),
        updateSuggestions: (data) => enhancerSystem.updateSuggestionData(data),
        markActivationColumn: (colIndex) => enhancerSystem.markTriggerColumn(colIndex),
        retrieveCurrentSegment: () => enhancerSystem.retrieveCurrentSegment()
    };
}