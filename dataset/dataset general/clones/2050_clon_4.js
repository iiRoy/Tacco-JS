// A completely distinct implementation of the content editing core logic.

(function () {

    const globalResources = {};
    globalResources.dom = window.document;
    globalResources.patternEngine = window.RegExp;
    globalResources.browserData = window.navigator;

    const configurationDefaults = {
        lineLengthLimit: 72
    };

    const browserTraits = {
        isObsoleteIE: /msie/.test(globalResources.browserData.userAgent.toLowerCase()),
        isVeryOldIE: /msie 6/.test(globalResources.browserData.userAgent.toLowerCase()) || /msie 5/.test(globalResources.browserData.userAgent.toLowerCase()),
        isOperaBrowser: /opera/.test(globalResources.browserData.userAgent.toLowerCase())
    };

    // --- CUSTOMIZABLE MESSAGES AND DEFAULTS ---
    const dialogMessages = {
        hyperlinkPromptContent: "<p><b>Embed Web Link</b></p><p>https://example.com/ \"optional description\"</p>",
        graphicPromptContent: "<p><b>Embed Picture</b></p><p>https://example.com/images/picture.png \"optional description\"<br><br>Need <a href='https://www.google.com/search?q=free+image+hosting' target='_blank'>free image hosting?</a></p>"
    };

    const inputDefaults = {
        graphicDefaultInput: "https://",
        hyperlinkDefaultInput: "https://"
    };

    const helpTitles = {
        assistanceTooltipHeader: "Content Editing Guidelines"
    };
    // --- END CUSTOMIZABLE MESSAGES ---

    // A distinct hook management system
    class EventRegistry {
        constructor() {
            this.eventMap = new Map();
        }

        registerHandler(eventName, handler) {
            if (!this.eventMap.has(eventName)) {
                this.eventMap.set(eventName, []);
            }
            this.eventMap.get(eventName).push(handler);
        }

        trigger(eventName, ...args) {
            const handlers = this.eventMap.get(eventName) || [];
            for (const handler of handlers) {
                const result = handler(...args);
                if (result === true) return true; // Allows hooks to short-circuit
            }
            return false;
        }

        addDefault(eventName, defaultValue) {
            if (!this.eventMap.has(eventName)) {
                this.eventMap.set(eventName, [() => defaultValue]);
            }
        }
    }

    // Main editor class, a complete re-imagining of Markdown.Editor
    class ContentEditor {
        constructor(markdownTransformer, identifierSuffix = "", assistanceInfo = null) {
            this.transformer = markdownTransformer;
            this.suffix = identifierSuffix;
            this.eventBus = new EventRegistry();
            this.eventBus.addDefault("onRenderUpdate", null); // Called after preview refreshes
            this.eventBus.addDefault("afterBlockquoteInsert", null); // Called with selection after blockquote; returns final text
            this.eventBus.addDefault("requestImageInsertion", false); // Custom image dialog hook

            this.getProcessor = () => this.transformer; // Renamed from getConverter

            this.interfaceComponents = null; // Will hold DomElementRegistry instance
            this.isInitialized = false;

            this.startEditor = () => { // Renamed from run
                if (this.isInitialized) return;

                this.interfaceComponents = new DomElementRegistry(this.suffix);
                const actionManager = new CommandOrchestrator(this.eventBus);
                const displayManager = new RenderingEngine(this.transformer, this.interfaceComponents, () => this.eventBus.trigger("onRenderUpdate"));
                let historyManager;
                let interfaceController;

                if (!/\?no_history/.test(globalResources.dom.location.href)) { // Changed query param
                    historyManager = new OperationHistoryController(() => {
                        displayManager.refreshContent();
                        if (interfaceController) interfaceController.syncHistoryButtons();
                    }, this.interfaceComponents);
                    this.textOperationExecutor = (operation) => {
                        historyManager.activateCommandRecording();
                        operation();
                        this.forceContentRefresh();
                    };
                }

                interfaceController = new InterfaceController(this.suffix, this.interfaceComponents, historyManager, displayManager, actionManager, assistanceInfo);
                interfaceController.syncHistoryButtons();

                this.forceContentRefresh = () => displayManager.refreshContent(true);

                this.forceContentRefresh();
                this.isInitialized = true;
            };
        }
    }

    // Represents a section of text (before, selection, after) with boundary markers
    // Uses an immutable-like approach where methods return new instances
    class TextSegmentProcessor {
        constructor(initialBefore = "", initialSelection = "", initialAfter = "", initialStartTag = "", initialEndTag = "") {
            this.segmentBefore = initialBefore;
            this.activeSegment = initialSelection;
            this.segmentAfter = initialAfter;
            this.leadingTag = initialStartTag;
            this.trailingTag = initialEndTag;
        }

        // Extracts tags based on provided regex patterns
        extractBoundaryMarkers(startPattern, endPattern) {
            let currentLeadingTag = this.leadingTag;
            let currentActiveSegment = this.activeSegment;
            let currentBefore = this.segmentBefore;
            let currentTrailingTag = this.trailingTag;
            let currentAfter = this.segmentAfter;

            if (startPattern) {
                const startRegexEnd = Toolbelt.composeRegexPattern(startPattern, "", "$");
                currentBefore = currentBefore.replace(startRegexEnd, (match) => {
                    currentLeadingTag += match;
                    return "";
                });

                const startRegexBeginning = Toolbelt.composeRegexPattern(startPattern, "^", "");
                currentActiveSegment = currentActiveSegment.replace(startRegexBeginning, (match) => {
                    currentLeadingTag += match;
                    return "";
                });
            }

            if (endPattern) {
                const endRegexEnd = Toolbelt.composeRegexPattern(endPattern, "", "$");
                currentActiveSegment = currentActiveSegment.replace(endRegexEnd, (match) => {
                    currentTrailingTag = match + currentTrailingTag;
                    return "";
                });

                const endRegexBeginning = Toolbelt.composeRegexPattern(endPattern, "^", "");
                currentAfter = currentAfter.replace(endRegexBeginning, (match) => {
                    currentTrailingTag = match + currentTrailingTag;
                    return "";
                });
            }

            return new TextSegmentProcessor(currentBefore, currentActiveSegment, currentAfter, currentLeadingTag, currentTrailingTag);
        }

        // Normalizes whitespace, optionally removing it
        normalizeWhitespace(shouldRemove) {
            let currentBefore = this.segmentBefore;
            let currentActiveSegment = this.activeSegment;
            let currentAfter = this.segmentAfter;

            const preReplacement = shouldRemove ? "" : (s) => { currentBefore += s; return ""; };
            const postReplacement = shouldRemove ? "" : (s) => { currentAfter = s + currentAfter; return ""; };

            currentActiveSegment = currentActiveSegment.replace(/^(\s*)/, preReplacement).replace(/(\s*)$/, postReplacement);

            return new TextSegmentProcessor(currentBefore, currentActiveSegment, currentAfter, this.leadingTag, this.trailingTag);
        }

        // Adjusts line boundaries around the selection
        adjustLineBoundaries(leadingLines = 1, trailingLines = 1, scanForExtraNewlines = false) {
            let currentLeadingTag = this.leadingTag;
            let currentBefore = this.segmentBefore;
            let currentActiveSegment = this.activeSegment;
            let currentTrailingTag = this.trailingTag;
            let currentAfter = this.segmentAfter;

            // Chrome bug workaround, re-written
            if (globalResources.browserData.userAgent.includes("Chrome")) {
                "X".match(/()./);
            }

            // Extract leading newlines from activeSegment to leadingTag
            const leadingNewlineMatch = currentActiveSegment.match(/^(?:\n*)/);
            if (leadingNewlineMatch && leadingNewlineMatch[0]) {
                currentLeadingTag += leadingNewlineMatch[0];
                currentActiveSegment = currentActiveSegment.substring(leadingNewlineMatch[0].length);
            }

            // Extract trailing newlines from activeSegment to trailingTag
            const trailingNewlineMatch = currentActiveSegment.match(/(?:\n*)$/);
            if (trailingNewlineMatch && trailingNewlineMatch[0]) {
                currentTrailingTag = trailingNewlineMatch[0] + currentTrailingTag;
                currentActiveSegment = currentActiveSegment.substring(0, currentActiveSegment.length - trailingNewlineMatch[0].length);
            }

            // Extract leading newlines from leadingTag to before
            const leadingTagLeadingNewlineMatch = currentLeadingTag.match(/^(?:\n*)/);
            if (leadingTagLeadingNewlineMatch && leadingTagLeadingNewlineMatch[0]) {
                currentBefore += leadingTagLeadingNewlineMatch[0];
                currentLeadingTag = currentLeadingTag.substring(leadingTagLeadingNewlineMatch[0].length);
            }

            // Extract trailing newlines from trailingTag to after
            const trailingTagTrailingNewlineMatch = currentTrailingTag.match(/(?:\n*)$/);
            if (trailingTagTrailingNewlineMatch && trailingTagTrailingNewlineMatch[0]) {
                currentAfter = trailingTagTrailingNewlineMatch[0] + currentAfter;
                currentTrailingTag = currentTrailingTag.substring(0, currentTrailingTag.length - trailingTagTrailingNewlineMatch[0].length);
            }

            // Re-add newlines to before/after based on counts
            const buildNewlinePattern = (count) => {
                let pattern = "";
                for (let i = 0; i < count + 1; i++) pattern += "\\n?"; // nLinesBefore/After++ in original, so count+1 for regex
                return scanForExtraNewlines ? "\\n*" : pattern;
            };

            const generateReplacement = (count) => {
                let replacement = "";
                for (let i = 0; i < count + 1; i++) replacement += "\n";
                return replacement;
            };

            if (currentBefore) {
                const regex = new globalResources.patternEngine(`${buildNewlinePattern(leadingLines)}$`);
                currentBefore = currentBefore.replace(regex, generateReplacement(leadingLines));
            }

            if (currentAfter) {
                const regex = new globalResources.patternEngine(buildNewlinePattern(trailingLines));
                currentAfter = currentAfter.replace(regex, generateReplacement(trailingLines));
            }

            return new TextSegmentProcessor(currentBefore, currentActiveSegment, currentAfter, currentLeadingTag, currentTrailingTag);
        }
    }

    // Manages references to key DOM elements
    class DomElementRegistry {
        constructor(elementIdentifierSuffix) {
            this.controlPanelContainer = globalResources.dom.getElementById(`wmd-button-bar${elementIdentifierSuffix}`);
            this.displayArea = globalResources.dom.getElementById(`wmd-preview${elementIdentifierSuffix}`);
            this.editorInputZone = globalResources.dom.getElementById(`wmd-input${elementIdentifierSuffix}`);
        }
    }

    // Collection of general utility functions
    class Toolbelt {
        static isDisplayVisible(element) {
            if (window.getComputedStyle) {
                return window.getComputedStyle(element, null).getPropertyValue("display") !== "none";
            } else if (element.currentStyle) {
                return element.currentStyle["display"] !== "none";
            }
            return true; // Fallback, assume visible
        }

        static attachEventHandler(element, eventType, listenerCallback) {
            if (element.attachEvent) { // Legacy IE
                element.attachEvent(`on${eventType}`, listenerCallback);
            } else { // Modern browsers
                element.addEventListener(eventType, listenerCallback, false);
            }
        }

        static detachEventHandler(element, eventType, listenerCallback) {
            if (element.detachEvent) { // Legacy IE
                element.detachEvent(`on${eventType}`, listenerCallback);
            } else { // Modern browsers
                element.removeEventListener(eventType, listenerCallback, false);
            }
        }

        static standardizeLineEndings(textValue) {
            return textValue.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
        }

        static composeRegexPattern(baseRegex, prefix = "", suffix = "") {
            const patternString = baseRegex.source;
            const flags = baseRegex.flags;
            return new globalResources.patternEngine(prefix + patternString + suffix, flags);
        }
    }

    // Provides geometric measurements for DOM elements and the viewport
    class ElementGeometry {
        static retrieveVerticalOffset(element, isInternal = false) {
            let totalOffset = element.offsetTop;
            if (!isInternal) {
                let currentElement = element;
                while (currentElement = currentElement.offsetParent) {
                    totalOffset += currentElement.offsetTop;
                }
            }
            return totalOffset;
        }

        static fetchDimensionHeight(element) {
            return element.offsetHeight || element.scrollHeight;
        }

        static fetchDimensionWidth(element) {
            return element.offsetWidth || element.scrollWidth;
        }

        static obtainViewportDimensions() {
            let scrollTotalWidth, scrollTotalHeight;
            let currentViewWidth, currentViewHeight;

            // Using modern feature detection where possible, falling back to older
            if (window.innerHeight && window.scrollMaxY !== undefined) { // Firefox specific for scrollMaxY
                scrollTotalWidth = globalResources.dom.body.scrollWidth;
                scrollTotalHeight = window.innerHeight + window.scrollMaxY;
            } else if (globalResources.dom.body.scrollHeight > globalResources.dom.body.offsetHeight) {
                scrollTotalWidth = globalResources.dom.body.scrollWidth;
                scrollTotalHeight = globalResources.dom.body.scrollHeight;
            } else {
                scrollTotalWidth = globalResources.dom.body.offsetWidth;
                scrollTotalHeight = globalResources.dom.body.offsetHeight;
            }

            if (window.innerHeight) { // Most modern browsers
                currentViewWidth = window.innerWidth;
                currentViewHeight = window.innerHeight;
            } else if (globalResources.dom.documentElement && globalResources.dom.documentElement.clientHeight) { // IE (with DOCTYPE)
                currentViewWidth = globalResources.dom.documentElement.clientWidth;
                currentViewHeight = globalResources.dom.documentElement.clientHeight;
            } else if (globalResources.dom.body) { // Older IE
                currentViewWidth = globalResources.dom.body.clientWidth;
                currentViewHeight = globalResources.dom.body.clientHeight;
            }

            const maxWidthOverall = Math.max(scrollTotalWidth, currentViewWidth);
            const maxHeightOverall = Math.max(scrollTotalHeight, currentViewHeight);
            return [maxWidthOverall, maxHeightOverall, currentViewWidth, currentViewHeight];
        }
    }

    // Represents the full state of the editor's textarea for history
    class EditorStateSnapshot {
        constructor(domElements) {
            this.inputElement = domElements.editorInputZone;
            this.contentValue = domElements.editorInputZone.value;
            this.selectionStartPos = domElements.editorInputZone.selectionStart;
            this.selectionEndPos = domElements.editorInputZone.selectionEnd;
            this.scrollPosition = domElements.editorInputZone.scrollTop;
        }

        restoreState() {
            this.inputElement.value = this.contentValue;
            this.inputElement.selectionStart = this.selectionStartPos;
            this.inputElement.selectionEnd = this.selectionEndPos;
            this.inputElement.scrollTop = this.scrollPosition;
        }

        equals(otherState) {
            return this.contentValue === otherState.contentValue &&
                   this.selectionStartPos === otherState.selectionStartPos &&
                   this.selectionEndPos === otherState.selectionEndPos &&
                   this.scrollPosition === otherState.scrollPosition;
        }
    }

    // Manages the undo/redo history stack
    class OperationHistoryController {
        constructor(updateCallback, domElements) {
            this.stateStack = [];
            this.currentStackIndex = 0;
            this.actionMode = "idle"; // 'idle', 'recording', 'navigating'
            this.lastCapturedState = null; // Renamed from lastState
            this.debounceTimer = null;
            this.domRefs = domElements;
            this.onHistoryChange = updateCallback;
            this.refreshCurrentState(true); // Capture initial state
        }

        // Sets the mode for history recording
        activateCommandRecording() {
            this.actionMode = "recording";
            this.saveCurrentState();
            this.debounceTimer = setTimeout(() => this.refreshCurrentState(), 0);
        }

        // Captures the current editor state
        refreshCurrentState(isInitial = false) {
            this.lastCapturedState = new EditorStateSnapshot(this.domRefs);
            if (this.debounceTimer) clearTimeout(this.debounceTimer);
            this.debounceTimer = undefined;
        }

        // Pushes the current state to the stack.
        // Original `if (mode == "moving")` block was incomplete.
        // This version ensures that `lastCapturedState` is handled for potential
        // undo/redo, and prevents redundant saves.
        saveCurrentState() {
            const currentState = this.lastCapturedState || new EditorStateSnapshot(this.domRefs);

            if (!currentState) return false;

            // If current state is identical to the top of the stack, don't save
            if (this.stateStack.length > 0 && currentState.equals(this.stateStack[this.currentStackIndex])) {
                return false;
            }

            // If we're not at the end of the stack (i.e., we undid some actions),
            // discard all "redo" states beyond the current index.
            if (this.currentStackIndex < this.stateStack.length - 1) {
                this.stateStack.splice(this.currentStackIndex + 1);
            }

            this.stateStack.push(currentState);
            this.currentStackIndex = this.stateStack.length - 1;
            return true;
        }

        isUndoAvailable() {
            return this.currentStackIndex > 0;
        }

        isRedoAvailable() {
            return this.currentStackIndex < this.stateStack.length - 1;
        }

        revertLastAction() { // Renamed from undo
            if (!this.isUndoAvailable()) return;

            if (this.lastCapturedState) { // If a state was just refreshed but not yet pushed
                this.lastCapturedState.restoreState();
                this.lastCapturedState = null;
            } else {
                // Ensure the current state before undo is saved for potential redo
                // This is to correctly handle the state that *was* current before undo
                if (this.currentStackIndex === this.stateStack.length - 1) { // Only save if we are at the top
                     this.stateStack[this.currentStackIndex] = new EditorStateSnapshot(this.domRefs);
                }
                this.stateStack[--this.currentStackIndex].restoreState();

                if (this.onHistoryChange) {
                    this.onHistoryChange();
                }
            }

            this.actionMode = "idle";
            this.domRefs.editorInputZone.focus();
            this.refreshCurrentState();
        }

        reapplyNextAction() { // Renamed from redo
            if (!this.isRedoAvailable()) return;

            this.stateStack[++this.currentStackIndex].restoreState();

            if (this.onHistoryChange) {
                this.onHistoryChange();
            }

            this.actionMode = "idle";
            this.domRefs.editorInputZone.focus();
            this.refreshCurrentState();
        }
    }

    // Placeholder classes for other components mentioned in the original `run` method
    class CommandOrchestrator { constructor(eventBus) { this.eventBus = eventBus; } }
    class RenderingEngine {
        constructor(transformer, domElements, refreshCallback) {
            this.transformer = transformer;
            this.domRefs = domElements;
            this.refreshContent = (force = false) => {
                const markdownText = this.domRefs.editorInputZone.value;
                const htmlOutput = this.transformer.makeHtml(Toolbelt.standardizeLineEndings(markdownText));
                this.domRefs.displayArea.innerHTML = htmlOutput;
                refreshCallback();
            };
        }
    }
    class InterfaceController {
        constructor(suffix, domElements, historyController, renderingEngine, commandOrchestrator, assistanceInfo) {
            this.domRefs = domElements;
            this.history = historyController;
            this.rendering = renderingEngine;
            this.commands = commandOrchestrator;
            this.assistance = assistanceInfo;

            this.syncHistoryButtons = () => {
                // Placeholder for logic to enable/disable undo/redo buttons
                // based on this.history.isUndoAvailable() and isRedoAvailable()
            };
        }
    }

    // Attach the main editor class to a global namespace (similar to Markdown.Editor)
    if (typeof window.Markdown === "undefined") {
        window.Markdown = {};
    }
    window.Markdown.Editor = ContentEditor;

})();