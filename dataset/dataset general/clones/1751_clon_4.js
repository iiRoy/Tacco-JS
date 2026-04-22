(function () {

    const auxiliary = {};
    const layout = {};
    const uiElements = {};

    const documentRef = window.document;
    const regexConstructor = window.RegExp;
    const browserNavigator = window.navigator;

    const GLOBAL_PARAMETERS = { contentWidth: 72, maxHistoryStates: 100 }; // Added maxHistoryStates for HistoryTracker

    const browserTraits = {
        isObsoleteIE: /msie/.test(browserNavigator.userAgent.toLowerCase()),
        isVeryOldIE: /msie [5-6]/.test(browserNavigator.userAgent.toLowerCase()),
        isOperaBrowser: /opera/.test(browserNavigator.userAgent.toLowerCase())
    };

    const hyperlinkPromptContent = "<p><b>Embed Hyperlink</b></p><p>http://sample.com/ \"optional description\"</p>";
    const imagePromptContent = "<p><b>Embed Image</b></p><p>http://sample.com/pictures/diagram.jpg \"optional description\"<br><br>Need <a href='http://www.google.com/search?q=free+image+hosting' target='_blank'>free image hosting?</a></p>";
    const defaultImageAddress = "http://";
    const defaultLinkAddress = "http://";
    const defaultHelpTip = "Content Editing Assistance";

    // --- Core functionality classes and utilities ---

    // Manages event listeners for custom actions, similar to hooks
    class ActionCoordinator {
        constructor() {
            this.eventListeners = {};
        }

        registerListener(eventName, defaultReturnValue) {
            this.eventListeners[eventName] = this.eventListeners[eventName] || [];
            this.eventListeners[eventName].defaultReturn = defaultReturnValue;
        }

        addListener(eventName, handler) {
            if (!this.eventListeners[eventName]) {
                throw new Error(`Event ${eventName} not registered.`);
            }
            this.eventListeners[eventName].push(handler);
        }

        executeListeners(eventName, ...args) {
            const handlers = this.eventListeners[eventName];
            if (!handlers || handlers.length === 0) {
                return handlers ? handlers.defaultReturn : undefined;
            }
            let result = handlers.defaultReturn;
            for (const handler of handlers) {
                const handlerResult = handler(...args);
                // Specific logic for boolean hooks like insertImageDialog
                if (typeof handlerResult === 'boolean') {
                    result = handlerResult;
                }
            }
            return result;
        }
    }

    // Captures and restores the state of the textarea
    class ContentSnapshot {
        constructor(domRefs, isInitial) {
            this.content = domRefs.inputField.value;
            this.selectionStart = domRefs.inputField.selectionStart;
            this.selectionEnd = domRefs.inputField.selectionEnd;
            this.scrollPos = domRefs.inputField.scrollTop;

            if (isInitial) { // Apply EOL normalization only for initial state
                this.content = auxiliary.standardizeLineEndings(this.content);
            }
        }

        applyTo(domRefs) {
            domRefs.inputField.value = this.content;
            domRefs.inputField.selectionStart = this.selectionStart;
            domRefs.inputField.selectionEnd = this.selectionEnd;
            domRefs.inputField.scrollTop = this.scrollPos;
        }
    }

    // Manages undo/redo history for the editor content
    class HistoryTracker {
        constructor(callbackFunction, domRefs) {
            const self = this;
            let pastStates = []; // Stores ContentSnapshot objects
            let currentStateIndex = 0; // Pointer to the current state in pastStates
            let operationMode = "idle"; // "idle", "moving", "command"
            let cachedState = null; // Used during "moving" mode
            let debounceTimer = null;
            let currentInputSnapshot = null; // Latest snapshot, possibly not yet stored

            const captureCurrentState = (isInitialState) => {
                currentInputSnapshot = new ContentSnapshot(domRefs, isInitialState);
                debounceTimer = undefined;
            };

            const storeState = () => {
                const snapshotToStore = currentInputSnapshot || new ContentSnapshot(domRefs);
                if (!snapshotToStore) {
                    return false;
                }

                if (operationMode === "moving") {
                    if (!cachedState) {
                        cachedState = snapshotToStore;
                    }
                    return;
                }

                // If coming out of "moving" mode and there was a cached state
                if (cachedState) {
                    // Check if the state before "moving" is different from the cached state
                    if (pastStates[currentStateIndex - 1] && pastStates[currentStateIndex - 1].content !== cachedState.content) {
                        // If "moving" caused a change, push the cached state
                        pastStates = pastStates.slice(0, currentStateIndex);
                        pastStates.push(cachedState);
                        currentStateIndex++;
                    }
                    cachedState = null;
                }

                // Prevent storing identical states
                if (pastStates.length > 0 &&
                    pastStates[currentStateIndex - 1].content === snapshotToStore.content &&
                    pastStates[currentStateIndex - 1].selectionStart === snapshotToStore.selectionStart &&
                    pastStates[currentStateIndex - 1].selectionEnd === snapshotToStore.selectionEnd) {
                    return false;
                }

                // Truncate future states and add the new one
                pastStates = pastStates.slice(0, currentStateIndex);
                pastStates.push(snapshotToStore);
                currentStateIndex = pastStates.length;

                // Enforce history limit
                if (pastStates.length > GLOBAL_PARAMETERS.maxHistoryStates) {
                    pastStates.shift();
                    currentStateIndex--;
                }
                return true;
            };

            this.configureOperationMode = (newMode, preventSave) => {
                if (operationMode !== newMode) {
                    operationMode = newMode;
                    if (!preventSave) {
                        storeState();
                    }
                }
                if (!browserTraits.isObsoleteIE || operationMode !== "moving") {
                    debounceTimer = setTimeout(captureCurrentState, 1);
                } else {
                    currentInputSnapshot = null;
                }
            };

            this.initiateCommandMode = () => {
                operationMode = "command";
                storeState();
                debounceTimer = setTimeout(captureCurrentState, 0);
            };

            this.hasPreviousStates = () => currentStateIndex > 1;

            this.hasNextStates = () => pastStates[currentStateIndex];

            this.revertToPrevious = () => {
                if (self.hasPreviousStates()) {
                    if (cachedState) { // If there's a cached state from "moving" mode, restore it
                        cachedState.applyTo(domRefs);
                        cachedState = null;
                    } else {
                        // Store current state to allow redo, then restore previous
                        pastStates[currentStateIndex] = new ContentSnapshot(domRefs);
                        pastStates[--currentStateIndex].applyTo(domRefs);

                        if (callbackFunction) {
                            callbackFunction();
                        }
                    }
                }
                operationMode = "idle";
                domRefs.inputField.focus();
                captureCurrentState();
            };

            this.advanceToNext = () => {
                if (self.hasNextStates()) {
                    pastStates[++currentStateIndex].applyTo(domRefs);

                    if (callbackFunction) {
                        callbackFunction();
                    }
                }
                operationMode = "idle";
                domRefs.inputField.focus();
                captureCurrentState();
            };

            // Initial state capture when HistoryTracker is created
            captureCurrentState(true);
        }
    }

    // Handles manipulation of text fragments (before, selection, after)
    class TextFragmentHandler {
        constructor(before, selection, after) {
            this.prefixContent = before || "";
            this.currentSelection = selection || "";
            this.suffixContent = after || "";
            this.leadingMarkup = "";
            this.trailingMarkup = "";
        }

        // Extracts markup matching startPattern and endPattern from prefix/selection/suffix
        extractBoundaryMarkers(startPattern, endPattern) {
            const newHandler = new TextFragmentHandler(
                this.prefixContent,
                this.currentSelection,
                this.suffixContent
            );
            newHandler.leadingMarkup = this.leadingMarkup;
            newHandler.trailingMarkup = this.trailingMarkup;

            // Process startPattern
            if (startPattern) {
                // Regex to match at the end of prefixContent
                const regexEnd = auxiliary.composeRegexPattern(startPattern, "", "$");
                newHandler.prefixContent = newHandler.prefixContent.replace(regexEnd, (match) => {
                    newHandler.leadingMarkup += match;
                    return "";
                });

                // Regex to match at the start of currentSelection
                const regexStart = auxiliary.composeRegexPattern(startPattern, "^", "");
                newHandler.currentSelection = newHandler.currentSelection.replace(regexStart, (match) => {
                    newHandler.leadingMarkup += match;
                    return "";
                });
            }

            // Process endPattern
            if (endPattern) {
                // Regex to match at the end of currentSelection
                const regexEnd = auxiliary.composeRegexPattern(endPattern, "", "$");
                newHandler.currentSelection = newHandler.currentSelection.replace(regexEnd, (match) => {
                    newHandler.trailingMarkup = match + newHandler.trailingMarkup;
                    return "";
                });

                // Regex to match at the start of suffixContent
                const regexStart = auxiliary.composeRegexPattern(endPattern, "^", "");
                newHandler.suffixContent = newHandler.suffixContent.replace(regexStart, (match) => {
                    newHandler.trailingMarkup = match + newHandler.trailingMarkup;
                    return "";
                });
            }
            return newHandler; // Return new instance for functional style
        }

        // Trims whitespace from selection, optionally moving it to prefix/suffix
        normalizeWhitespace(shouldRemove) {
            const newHandler = new TextFragmentHandler(
                this.prefixContent,
                this.currentSelection,
                this.suffixContent
            );
            newHandler.leadingMarkup = this.leadingMarkup;
            newHandler.trailingMarkup = this.trailingMarkup;

            let preReplacer, postReplacer;
            if (shouldRemove) {
                preReplacer = postReplacer = "";
            } else {
                preReplacer = (s) => { newHandler.prefixContent += s; return ""; };
                postReplacer = (s) => { newHandler.suffixContent = s + newHandler.suffixContent; return ""; };
            }

            newHandler.currentSelection = newHandler.currentSelection
                .replace(/^(\s*)/, preReplacer)
                .replace(/(\s*)$/, postReplacer);
            return newHandler;
        }

        // Adjusts line breaks around the selection
        adjustLineBreaks(linesBefore = 1, linesAfter = 1, detectExtraNewlines) {
            let nextLinesBefore = linesBefore + 1;
            let nextLinesAfter = linesAfter + 1;

            const newHandler = new TextFragmentHandler(
                this.prefixContent,
                this.currentSelection,
                this.suffixContent
            );
            newHandler.leadingMarkup = this.leadingMarkup;
            newHandler.trailingMarkup = this.trailingMarkup;

            // Chrome bug work-around (empty match in RegExp)
            // The original used the global RegExp.$1, which is a side effect.
            // This re-implements that behavior by capturing and re-assigning.
            let lastMatchResult;

            if (browserNavigator.userAgent.match(/Chrome/)) {
                "X".match(/()./); // Force RegExp.$1 to be ""
            }

            lastMatchResult = newHandler.currentSelection.match(/(^\n*)/);
            if (lastMatchResult) {
                newHandler.currentSelection = newHandler.currentSelection.slice(lastMatchResult[0].length);
                newHandler.leadingMarkup += lastMatchResult[0];
            }

            lastMatchResult = newHandler.currentSelection.match(/(\n*$)/);
            if (lastMatchResult) {
                newHandler.currentSelection = newHandler.currentSelection.slice(0, newHandler.currentSelection.length - lastMatchResult[0].length);
                newHandler.trailingMarkup += lastMatchResult[0];
            }

            lastMatchResult = newHandler.leadingMarkup.match(/(^\n*)/);
            if (lastMatchResult) {
                newHandler.leadingMarkup = newHandler.leadingMarkup.slice(lastMatchResult[0].length);
                newHandler.prefixContent += lastMatchResult[0];
            }

            lastMatchResult = newHandler.trailingMarkup.match(/(\n*$)/);
            if (lastMatchResult) {
                newHandler.trailingMarkup = newHandler.trailingMarkup.slice(0, newHandler.trailingMarkup.length - lastMatchResult[0].length);
                newHandler.suffixContent = lastMatchResult[0] + newHandler.suffixContent;
            }

            // Adjust prefix content
            if (newHandler.prefixContent) {
                let regexPattern = "";
                let replacementContent = "";
                let tempLinesBefore = nextLinesBefore;
                while (tempLinesBefore--) {
                    regexPattern += "\\n?";
                    replacementContent += "\n";
                }
                if (detectExtraNewlines) {
                    regexPattern = "\\n*";
                }
                newHandler.prefixContent = newHandler.prefixContent.replace(new regexConstructor(regexPattern + "$", ""), replacementContent);
            }

            // Adjust suffix content
            if (newHandler.suffixContent) {
                let regexPattern = "";
                let replacementContent = "";
                let tempLinesAfter = nextLinesAfter;
                while (tempLinesAfter--) {
                    regexPattern += "\\n?";
                    replacementContent += "\n";
                }
                if (detectExtraNewlines) {
                    regexPattern = "\\n*";
                }
                newHandler.suffixContent = newHandler.suffixContent.replace(new regexConstructor(regexPattern, ""), replacementContent);
            }
            return newHandler;
        }
    }

    // A collection of relevant DOM elements by ID
    class DomElementRegistry {
        constructor(idSuffix) {
            this.commandPanel = documentRef.getElementById("wmd-button-bar" + idSuffix);
            this.displayArea = documentRef.getElementById("wmd-preview" + idSuffix);
            this.inputField = documentRef.getElementById("wmd-input" + idSuffix);
            this.outputDisplay = documentRef.getElementById("wmd-html" + idSuffix);
        }
    }

    // --- Auxiliary utility functions ---
    auxiliary.checkDisplayVisibility = function (element) {
        if (window.getComputedStyle) {
            return window.getComputedStyle(element, null).getPropertyValue("display") !== "none";
        } else if (element.currentStyle) {
            return element.currentStyle["display"] !== "none";
        }
        return false;
    };

    auxiliary.attachEventHandler = function (element, eventName, handler) {
        if (element.attachEvent) {
            element.attachEvent("on" + eventName, handler);
        } else {
            element.addEventListener(eventName, handler, false);
        }
    };

    auxiliary.detachEventHandler = function (element, eventName, handler) {
        if (element.detachEvent) {
            element.detachEvent("on" + eventName, handler);
        } else {
            element.removeEventListener(eventName, handler, false);
        }
    };

    auxiliary.standardizeLineEndings = function (text) {
        return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    };

    auxiliary.composeRegexPattern = function (baseRegex, prefix = "", suffix = "") {
        let patternStr = baseRegex.source;
        let flags = baseRegex.flags;
        patternStr = prefix + patternStr + suffix;
        return new regexConstructor(patternStr, flags);
    };

    // --- Layout and positioning functions ---
    layout.calculateAbsoluteTop = function (element, isInner) {
        let cumulativeTop = element.offsetTop;
        if (!isInner) {
            let currentElement = element;
            while ((currentElement = currentElement.offsetParent)) {
                cumulativeTop += currentElement.offsetTop;
            }
        }
        return cumulativeTop;
    };

    layout.measureElementHeight = function (element) {
        return element.offsetHeight || element.scrollHeight;
    };

    layout.measureElementWidth = function (element) {
        return element.offsetWidth || element.scrollWidth;
    };

    layout.retrievePageDimensions = function () {
        let pageScrollWidth, pageScrollHeight;
        let viewportInnerWidth, viewportInnerHeight;

        if (self.innerHeight && self.scrollMaxY) {
            pageScrollWidth = documentRef.body.scrollWidth;
            pageScrollHeight = self.innerHeight + self.scrollMaxY;
        } else if (documentRef.body.scrollHeight > documentRef.body.offsetHeight) {
            pageScrollWidth = documentRef.body.scrollWidth;
            pageScrollHeight = documentRef.body.scrollHeight;
        } else {
            pageScrollWidth = documentRef.body.offsetWidth;
            pageScrollHeight = documentRef.body.offsetHeight;
        }

        if (self.innerHeight) {
            viewportInnerWidth = self.innerWidth;
            viewportInnerHeight = self.innerHeight;
        } else if (documentRef.documentElement && documentRef.documentElement.clientHeight) {
            viewportInnerWidth = documentRef.documentElement.clientWidth;
            viewportInnerHeight = documentRef.documentElement.clientHeight;
        } else if (documentRef.body) {
            viewportInnerWidth = documentRef.body.clientWidth;
            viewportInnerHeight = documentRef.body.clientHeight;
        }

        const overallMaxWidth = Math.max(pageScrollWidth, viewportInnerWidth);
        const overallMaxHeight = Math.max(pageScrollHeight, viewportInnerHeight);
        return [overallMaxWidth, overallMaxHeight, viewportInnerWidth, viewportInnerHeight];
    };

    // --- Placeholder classes for components not fully detailed in the original snippet ---
    class OperationDirector {
        constructor(actionHandlers) {
            // This class would manage the editor commands (e.g., bold, italic)
            // and interact with the TextFragmentHandler.
        }
    }

    class VisualizerController {
        constructor(processor, domRefs, refreshCallback) {
            this.processor = processor; // The markdown converter
            this.domRefs = domRefs;
            this.refreshCallback = refreshCallback;
        }

        refresh(force = false) {
            // This method would convert the input text and update the preview area.
            // For now, it just calls the callback.
            if (this.refreshCallback) {
                this.refreshCallback();
            }
        }
    }

    class InterfaceOrchestrator {
        constructor(idSuffix, domRefs, historyTracker, visualizerController, operationDirector, helpConfig) {
            this.idSuffix = idSuffix;
            this.domRefs = domRefs;
            this.historyTracker = historyTracker;
            this.visualizerController = visualizerController;
            this.operationDirector = operationDirector;
            this.helpConfig = helpConfig;
            // This class would handle UI elements, button states, dialogs, etc.
        }

        setUndoRedoButtonStates() {
            // Update UI buttons based on historyTracker.hasPreviousStates() and hasNextStates()
        }
    }

    // --- Main editor class, equivalent to Markdown.Editor ---
    class ContentComposer {
        constructor(textProcessor, idSuffix = "", assistanceConfig) {
            const self = this;
            this.actionHandlers = new ActionCoordinator();
            this.actionHandlers.registerListener("onVisualizerUpdate", null); // Called after preview refreshes
            this.actionHandlers.registerListener("postQuoteGeneration", null); // Called after blockquote creation
            this.actionHandlers.registerListener("insertImagePrompt", false); // Custom image dialog hook

            this.obtainProcessor = () => textProcessor; // Provides access to the markdown converter

            let componentSet; // Renamed from 'panels'

            this.initiateComposer = () => {
                if (componentSet) {
                    return; // Already initialized, no-op
                }

                componentSet = new DomElementRegistry(idSuffix);
                const operationDirector = new OperationDirector(this.actionHandlers);
                const visualizerController = new VisualizerController(textProcessor, componentSet, () => { this.actionHandlers.executeListeners("onVisualizerUpdate"); });
                let historyTracker;
                let interfaceOrchestrator;

                // Check for "?noundo" in URL to disable undo manager
                if (!/\?noundo/.test(documentRef.location.href)) {
                    historyTracker = new HistoryTracker(() => {
                        visualizerController.refresh();
                        if (interfaceOrchestrator) { // uiManager may not be available on first call
                            interfaceOrchestrator.setUndoRedoButtonStates();
                        }
                    }, componentSet);
                }

                interfaceOrchestrator = new InterfaceOrchestrator(idSuffix, componentSet, historyTracker, visualizerController, operationDirector, assistanceConfig);
                interfaceOrchestrator.setUndoRedoButtonStates();

                // Expose a method to force preview refresh
                const forceVisualizerRefresh = self.triggerVisualizerRefresh = function () { visualizerController.refresh(true); };

                forceVisualizerRefresh(); // Initial refresh
            };
        }
    }

    // Expose the ContentComposer under the original Markdown.Editor namespace
    window.Markdown = window.Markdown || {};
    window.Markdown.Editor = ContentComposer;

})();