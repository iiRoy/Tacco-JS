// A core component for rich text editing, built upon a Markdown converter.

((globalScope) => {
    "use strict";

    const Toolkit = {};
    const DisplayMetrics = {};
    const UserInterfaceElements = {}; // Placeholder, could be expanded or removed if unused
    const pageDoc = globalScope.document;
    const regexUtil = globalScope.RegExp;
    const browserAgent = globalScope.navigator;

    const EditorConfigs = { contentWidth: 72 };

    // Simplified browser sniffing for demonstration.
    const browserInfo = {
        isLegacyIE: /msie\s(5|6)/.test(browserAgent.userAgent.toLowerCase()),
        isOperaBrowser: /opera/.test(browserAgent.userAgent.toLowerCase())
    };

    // --- Configuration for User Prompts ---
    const linkInsertionPrompt = `<section><h3>Insert Web Link</h3><p>Example: <code>https://example.com/ "Optional Tooltip"</code></p></section>`;
    const imageInsertionPrompt = `<section><h3>Embed Image</h3><p>Example: <code>https://example.com/assets/graphic.jpg "Description"</code></p><p>Seeking <a href='https://www.google.com/search?q=free+image+hosting' target='_blank' rel='noopener noreferrer'>image hosting solutions</a>?</p></section>`;

    const defaultImagePlaceholder = "https://";
    const defaultLinkPlaceholder = "https://";

    const helpButtonTooltip = "Information on Markup Syntax";
    // --- End of User Prompt Configurations ---

    // The constructed editor object has the methods:
    // - getConverterInstance() returns the markup converter object.
    // - activate() starts the editor; multiple calls are ignored.
    // - updatePreview() forces the preview to be refreshed.
    globalScope.MarkupToolkit = globalScope.MarkupToolkit || {};
    globalScope.MarkupToolkit.ContentComposer = function (markupConverterInstance, elementIdSuffix = "", helpOptions) {

        const eventHooks = this.eventHooks = new globalScope.Markdown.HookCollection();
        eventHooks.addNoop("onPreviewUpdated");
        eventHooks.addNoop("onBlockQuoteProcessed");
        eventHooks.addFalse("onImageDialogRequest");

        this.getConverterInstance = () => markupConverterInstance;

        let currentComposer = this;
        let domPanels;

        this.activate = () => {
            if (domPanels) {
                console.info("Editor already initialized.");
                return;
            }

            domPanels = new DOMRegions(elementIdSuffix);
            const actionProcessor = new ActionProcessor(eventHooks);
            const renderEngine = new RenderEngine(markupConverterInstance, domPanels, () => { eventHooks.onPreviewUpdated(); });
            let historyManager, interfaceManager;

            // Conditional history tracking based on URL parameter
            if (!/disable-history/.test(pageDoc.location.search)) {
                historyManager = new HistoryTracker(() => {
                    renderEngine.refreshOutput();
                    if (interfaceManager) {
                        interfaceManager.updateHistoryControls();
                    }
                }, domPanels);
                this.executeTextOperation = (operationFn) => {
                    historyManager.setCommandState();
                    operationFn();
                    currentComposer.updatePreview();
                };
            }

            interfaceManager = new InterfaceController(elementIdSuffix, domPanels, historyManager, renderEngine, actionProcessor, helpOptions);
            interfaceManager.updateHistoryControls();

            const forceOutputUpdate = currentComposer.updatePreview = () => { renderEngine.refreshOutput(true); };

            forceOutputUpdate();
        };
    };

    // Manages chunks of text around a selection for modification.
    function TextSelectionModifier() {
        this.prefixContent = "";
        this.suffixContent = "";
        this.currentSelection = "";
        this.openingTag = "";
        this.closingTag = "";
    }

    // Identifies and extracts opening/closing tags from the selection boundaries.
    TextSelectionModifier.prototype.extractBoundaryTags = function (startPattern, endPattern) {
        const modifier = this;
        let currentRegex;

        if (startPattern) {
            currentRegex = Toolkit.augmentRegex(startPattern, "", "$");
            this.prefixContent = this.prefixContent.replace(currentRegex, (match) => {
                modifier.openingTag += match;
                return "";
            });

            currentRegex = Toolkit.augmentRegex(startPattern, "^", "");
            this.currentSelection = this.currentSelection.replace(currentRegex, (match) => {
                modifier.openingTag += match;
                return "";
            });
        }

        if (endPattern) {
            currentRegex = Toolkit.augmentRegex(endPattern, "", "$");
            this.currentSelection = this.currentSelection.replace(currentRegex, (match) => {
                modifier.closingTag = match + modifier.closingTag;
                return "";
            });

            currentRegex = Toolkit.augmentRegex(endPattern, "^", "");
            this.suffixContent = this.suffixContent.replace(currentRegex, (match) => {
                modifier.closingTag = match + modifier.closingTag;
                return "";
            });
        }
    };

    // Trims leading/trailing whitespace from the current selection.
    // If 'transfer' is true, whitespace is moved to prefix/suffix content.
    TextSelectionModifier.prototype.adjustWhitespace = function (transfer) {
        const self = this;
        const leadingWhitespaceReplacer = (match) => {
            if (transfer) {
                self.prefixContent += match;
            }
            return "";
        };
        const trailingWhitespaceReplacer = (match) => {
            if (transfer) {
                self.suffixContent = match + self.suffixContent;
            }
            return "";
        };

        this.currentSelection = this.currentSelection
            .replace(/^(\s*)/, leadingWhitespaceReplacer)
            .replace(/(\s*)$/, trailingWhitespaceReplacer);
    };

    // Skips a specified number of lines before and after the selection.
    TextSelectionModifier.prototype.insertLineBreaks = function (leadingLines = 1, trailingLines = 1, detectExtraBreaks = false) {
        leadingLines++;
        trailingLines++;

        let linePattern;
        let lineReplacement;

        // Extract leading newlines from selection and append to openingTag
        const leadingNewlineMatch = this.currentSelection.match(/^(\n*)/);
        if (leadingNewlineMatch && leadingNewlineMatch[1]) {
            this.openingTag += leadingNewlineMatch[1];
            this.currentSelection = this.currentSelection.substring(leadingNewlineMatch[1].length);
        }

        // Extract trailing newlines from selection and prepend to closingTag
        const trailingNewlineMatch = this.currentSelection.match(/(\n*)$/);
        if (trailingNewlineMatch && trailingNewlineMatch[1]) {
            this.closingTag = trailingNewlineMatch[1] + this.closingTag;
            this.currentSelection = this.currentSelection.substring(0, this.currentSelection.length - trailingNewlineMatch[1].length);
        }

        // Extract leading newlines from openingTag and append to prefixContent
        const startTagLeadingNewlineMatch = this.openingTag.match(/^(\n*)/);
        if (startTagLeadingNewlineMatch && startTagLeadingNewlineMatch[1]) {
            this.prefixContent += startTagLeadingNewlineMatch[1];
            this.openingTag = this.openingTag.substring(startTagLeadingNewlineMatch[1].length);
        }

        // Extract trailing newlines from closingTag and prepend to suffixContent
        const endTagTrailingNewlineMatch = this.closingTag.match(/(\n*)$/);
        if (endTagTrailingNewlineMatch && endTagTrailingNewlineMatch[1]) {
            this.suffixContent = endTagTrailingNewlineMatch[1] + this.suffixContent;
            this.closingTag = this.closingTag.substring(0, this.closingTag.length - endTagTrailingNewlineMatch[1].length);
        }

        // Adjust prefix content with required newlines
        if (this.prefixContent) {
            linePattern = "";
            lineReplacement = "";
            for (let i = 0; i < leadingLines; i++) {
                linePattern += "\\n?";
                lineReplacement += "\n";
            }
            if (detectExtraBreaks) {
                linePattern = "\\n*";
            }
            this.prefixContent = this.prefixContent.replace(new regexUtil(linePattern + "$", ""), lineReplacement);
        }

        // Adjust suffix content with required newlines
        if (this.suffixContent) {
            linePattern = "";
            lineReplacement = "";
            for (let i = 0; i < trailingLines; i++) {
                linePattern += "\\n?";
                lineReplacement += "\n";
            }
            if (detectExtraBreaks) {
                linePattern = "\\n*";
            }
            this.suffixContent = this.suffixContent.replace(new regexUtil(linePattern, ""), lineReplacement);
        }
    };
    // End of TextSelectionModifier

    // A mapping of key DOM elements by their IDs with an optional suffix.
    function DOMRegions(suffixIdentifier) {
        this.controlPanel = pageDoc.getElementById(`wmd-button-bar${suffixIdentifier}`);
        this.outputDisplay = pageDoc.getElementById(`wmd-preview${suffixIdentifier}`);
        this.inputArea = pageDoc.getElementById(`wmd-input${suffixIdentifier}`);
    }

    // Toolkit for common utility operations.

    // Checks if a DOM element is currently visible.
    Toolkit.isElementVisible = (elementNode) => {
        if (!elementNode || typeof globalScope.getComputedStyle !== 'function') return false; // Added guard clause and check for getComputedStyle
        const computedStyle = globalScope.getComputedStyle(elementNode, null);
        return computedStyle.getPropertyValue("display") !== "none" && computedStyle.getPropertyValue("visibility") !== "hidden";
    };

    // Attaches an event listener to a DOM element.
    Toolkit.attachEventHandler = (targetElement, eventType, handlerFunction) => {
        if (!targetElement || !eventType || typeof handlerFunction !== 'function') {
            console.warn("Invalid arguments for attachEventHandler.");
            return;
        }
        targetElement.addEventListener(eventType, handlerFunction, false);
    };

    // Removes an event listener from a DOM element.
    Toolkit.detachEventHandler = (targetElement, eventType, handlerFunction) => {
        if (!targetElement || !eventType || typeof handlerFunction !== 'function') {
            console.warn("Invalid arguments for detachEventHandler.");
            return;
        }
        targetElement.removeEventListener(eventType, handlerFunction, false);
    };

    // Standardizes end-of-line characters to '\n'.
    Toolkit.normalizeLineEndings = (inputText) => {
        return (inputText || "").replace(/\r\n|\r/g, "\n"); // Added nullish coalescing
    };

    // Creates a new RegExp object by augmenting an existing one with prefix/suffix strings.
    Toolkit.augmentRegex = (baseRegex, prefix = "", suffix = "") => {
        if (!(baseRegex instanceof regexUtil)) {
            throw new Error("Base regex must be a RegExp object.");
        }

        const pattern = baseRegex.source;
        const flags = baseRegex.flags;

        return new regexUtil(prefix + pattern + suffix, flags);
    };

    // DisplayMetrics for calculating element positions and dimensions.

    // Computes the total top offset of an element relative to the document.
    DisplayMetrics.getAbsoluteTop = (targetElement, isInnerOffset = false) => {
        let totalOffset = targetElement.offsetTop;
        if (!isInnerOffset) {
            let currentElement = targetElement.offsetParent;
            while (currentElement) {
                totalOffset += currentElement.offsetTop;
                currentElement = currentElement.offsetParent;
            }
        }
        return totalOffset;
    };

    // Retrieves the height of an element.
    DisplayMetrics.getElementHeight = (targetElement) => {
        return targetElement.offsetHeight || targetElement.scrollHeight || 0;
    };

    // Retrieves the width of an element.
    DisplayMetrics.getElementWidth = (targetElement) => {
        return targetElement.offsetWidth || targetElement.scrollWidth || 0;
    };

    // Determines the overall page dimensions (scroll width/height, inner width/height).
    DisplayMetrics.fetchPageDimensions = () => {

        let scrollW = 0, scrollH = 0;
        let viewW = 0, viewH = 0;

        // Prioritize modern window dimensions
        if (globalScope.innerWidth) {
            viewW = globalScope.innerWidth;
            viewH = globalScope.innerHeight;
        } else if (pageDoc.documentElement && pageDoc.documentElement.clientWidth) {
            viewW = pageDoc.documentElement.clientWidth;
            viewH = pageDoc.documentElement.clientHeight;
        } else if (pageDoc.body && pageDoc.body.clientWidth) {
            viewW = pageDoc.body.clientWidth;
            viewH = pageDoc.body.clientHeight;
        }

        // Calculate scroll dimensions, ensuring we get the largest possible
        scrollW = Math.max(pageDoc.body.scrollWidth, pageDoc.documentElement ? pageDoc.documentElement.scrollWidth : 0);
        scrollH = Math.max(pageDoc.body.scrollHeight, pageDoc.documentElement ? pageDoc.documentElement.scrollHeight : 0);

        const totalWidth = Math.max(scrollW, viewW);
        const totalHeight = Math.max(scrollH, viewH);

        return [totalWidth, totalHeight, viewW, viewH];
    };

    // Manages the state of the input area for undo/redo functionality.
    function HistoryTracker(stateChangeCallback, panelReferences) {

        const historyObj = this;
        const stateStack = [];
        let currentStackIndex = -1; // Start at -1, first push makes it 0
        let operationMode = "idle";
        let previousSnapshot = null;
        let refreshTimerId;
        let currentInputSnapshot;

        // Sets the current operational mode and optionally captures the state.
        const updateOperationMode = (newMode, bypassCapture = false) => {
            if (operationMode !== newMode) {
                operationMode = newMode;
                if (!bypassCapture) {
                    captureCurrentState();
                }
            }

            clearTimeout(refreshTimerId);
            refreshTimerId = setTimeout(refreshInputState, 1);
        };

        const refreshInputState = (isInitial = false) => {
            currentInputSnapshot = new InputAreaSnapshot(panelReferences, isInitial);
            if (isInitial && currentStackIndex === -1) { // Only push initial state once
                stateStack.push(currentInputSnapshot);
                currentStackIndex = 0;
            }
            refreshTimerId = undefined;
        };

        this.setCommandState = () => {
            operationMode = "command";
            captureCurrentState();
            clearTimeout(refreshTimerId);
            refreshTimerId = setTimeout(refreshInputState, 0);
        };

        this.canPerformUndo = () => {
            return currentStackIndex > 0; // Can undo if there's at least one state before the current one (initial state at index 0)
        };

        this.canPerformRedo = () => {
            return stateStack[currentStackIndex + 1] !== undefined;
        };

        // Reverts to the previous state in the history.
        this.undoLastAction = () => {
            if (!historyObj.canPerformUndo()) {
                return;
            }

            // If a 'previousSnapshot' exists, it means we're in a 'moving' state and should restore that specific pre-move state
            if (previousSnapshot) {
                previousSnapshot.restoreState();
                previousSnapshot = null;
                // Don't change currentStackIndex, as this was a temporary state capture
            } else {
                // Save the current state before undoing, so we can redo back to it
                stateStack[currentStackIndex] = new InputAreaSnapshot(panelReferences);
                currentStackIndex--;
                stateStack[currentStackIndex].restoreState();

                if (stateChangeCallback) {
                    stateChangeCallback();
                }
            }

            operationMode = "idle";
            panelReferences.inputArea.focus();
            refreshInputState();
        };

        // Advances to the next state in the history.
        this.redoNextAction = () => {
            if (!historyObj.canPerformRedo()) {
                return;
            }

            currentStackIndex++;
            stateStack[currentStackIndex].restoreState();

            if (stateChangeCallback) {
                stateChangeCallback();
            }

            operationMode = "idle";
            panelReferences.inputArea.focus();
            refreshInputState();
        };

        // Pushes the current input area state onto the stack.
        const captureCurrentState = () => {
            const snapshotToSave = currentInputSnapshot || new InputAreaSnapshot(panelReferences);

            if (!snapshotToSave) {
                return false;
            }

            if (operationMode === "moving") {
                if (!previousSnapshot) {
                    previousSnapshot = snapshotToSave;
                }
                return;
            }

            // If current index is not at the end, truncate future states
            if (currentStackIndex < stateStack.length - 1) {
                stateStack.splice(currentStackIndex + 1);
            }

            stateStack.push(snapshotToSave);
            currentStackIndex = stateStack.length - 1;

            previousSnapshot = null; // Clear temporary snapshot after a definitive save
            return true;
        };

        // Initialize with the first state
        updateOperationMode("initial", true);
        refreshInputState(true);
    }

})(window);