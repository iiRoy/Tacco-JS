// This module provides advanced text manipulation capabilities for content creation,
// relying on an external Markdown conversion utility.

(function () {

    // Core utilities and system components
    const textProc = {}; // Renamed util to textProc, var to const
    const positioning = {}; // Renamed position to positioning, var to const
    const interfaceComponents = {}; // Renamed ui to interfaceComponents, var to const
    const currentDocument = window.document; // Renamed doc to currentDocument, var to const
    const regexpConstructor = window.RegExp; // Renamed re to regexpConstructor, var to const
    const browserInfo = window.navigator; // Renamed nav to browserInfo, var to const
    const CONFIGURATION = { defaultLineLength: 72 }; // Renamed SETTINGS to CONFIGURATION, property name changed, var to const

    // Browser-specific quirks detection for compatibility adjustments.
    // Note: Feature detection is generally preferred over user-agent sniffing.
    const browserQuirks = { // Renamed uaSniffed to browserQuirks, var to const
        isLegacyIE: /msie/.test(browserInfo.userAgent.toLowerCase()), // Renamed isIE to isLegacyIE
        isOlderIE: /msie [5-6]/.test(browserInfo.userAgent.toLowerCase()), // Combined 5or6 check, renamed
        isOperaBrowser: /opera/.test(browserInfo.userAgent.toLowerCase()) // Renamed isOpera to isOperaBrowser
    };


    // -------------------------------------------------------------------
    //  CUSTOMIZABLE APPLICATION MESSAGES AND DEFAULTS
    //
    // This section contains strings and default values that can be easily
    // adjusted for localization or specific application requirements.
    // -------------------------------------------------------------------

    // Display text for the hyperlink insertion prompt.
    const hyperlinkPromptContent = "<p><b>Insert Web Link</b></p><p>Provide a URL (e.g., `https://example.org/` ) and an optional title in quotes.</p>"; // Renamed, rephrased, var to const
    // Display text for the image insertion prompt.
    const graphicPromptContent = "<p><b>Embed Image File</b></p><p>Enter image URL: `https://example.com/assets/picture.png` \"Optional description\"<br><br>Need a <a href='https://www.google.com/search?q=free+image_hosting' target='_blank' rel='noopener noreferrer'>free image hosting service?</a></p>"; // Renamed, rephrased, added rel for security, var to const

    // Default placeholder text for image input fields.
    const graphicInputDefault = "https://"; // Renamed, var to const
    // Default placeholder text for hyperlink input fields.
    const hyperlinkInputDefault = "https://"; // Renamed, var to const

    const helpButtonTooltip = "Information about Markdown Syntax"; // Renamed, rephrased, var to const

    // -------------------------------------------------------------------
    //  END OF CUSTOMIZABLE APPLICATION MESSAGES
    // -------------------------------------------------------------------

    // The 'supportObject', if provided, should contain:
    // - 'actionCallback': the click handler for the help button.
    // - 'tipText' (optional): the tooltip text for the button (defaults to 'Information about Markdown Syntax').
    // If 'supportObject' is omitted, no help button will be rendered.
    //
    // The constructed editor instance will expose these methods:
    // - 'getMarkdownProcessor()': retrieves the Markdown converter object initially provided.
    // - 'initializeEditor()': starts the editor's core functionality; subsequent calls are ignored.
    // - 'updatePreviewDisplay()': forces an immediate refresh of the rendered preview area. (Available after 'initializeEditor()' is called).
    Markdown.Editor = function (markdownProcessor, elementSuffix, supportObject) { // Renamed parameters

        elementSuffix = elementSuffix || ""; // Ensure suffix is a string

        const eventHooks = this.eventHooks = new Markdown.HookCollection(); // Renamed hooks to eventHooks, var to const
        eventHooks.addNoop("onPreviewUpdate");       // Triggered after the preview content is refreshed, no arguments.
        eventHooks.addNoop("afterBlockQuoteInsertion"); // Invoked with user's text *after* blockquote creation; expects the final text to be inserted.
        eventHooks.addFalse("requestImageEmbedDialog");     /* Called with a single argument: a callback function expecting the image URL.
                                                  * If custom image dialog is used by the app, this hook should return `true`,
                                                  * and the callback must be invoked with the chosen URL (or `null` if canceled).
                                                  * If `false` is returned, the editor's default dialog will be presented.
                                                  */

        this.getMarkdownProcessor = function () { return markdownProcessor; }; // Renamed method

        const currentInstance = this; // Renamed that to currentInstance, var to const
        let editorPanels; // Renamed panels to editorPanels, var to let

        this.initializeEditor = function () { // Renamed run to initializeEditor
            if (editorPanels) { // Check if already initialized
                return;
            }

            editorPanels = new DomPanelGroup(elementSuffix); // Renamed PanelCollection to DomPanelGroup
            const commandHandler = new CommandCoordinator(eventHooks); // Renamed commandManager to CommandCoordinator, var to const
            const contentPreviewer = new PreviewSynchronizer(markdownProcessor, editorPanels, function () { eventHooks.onPreviewUpdate(); }); // Renamed previewManager to ContentPreviewer, var to const
            let actionHistoryManager; // Renamed undoManager to actionHistoryManager, var to let

            // Check URL for "noundo" parameter to disable undo/redo functionality.
            const urlParams = new URLSearchParams(currentDocument.location.search); // Added intermediate step, var to const
            if (!urlParams.has("noundo")) { // Rewrote condition, checking for parameter presence
                actionHistoryManager = new ActionHistoryManager(function () { // Renamed UndoManager to ActionHistoryManager
                    contentPreviewer.refreshContent(); // Renamed refresh to refreshContent
                    if (interfaceComponentsManager) { // check for availability
                        interfaceComponentsManager.updateHistoryButtons(); // Renamed setUndoRedoButtonStates
                    }
                }, editorPanels);
            }

            const interfaceComponentsManager = new InterfaceManager(elementSuffix, editorPanels, actionHistoryManager, contentPreviewer, commandHandler, supportObject); // Renamed UIManager to InterfaceManager, var to const
            interfaceComponentsManager.updateHistoryButtons(); // Renamed setUndoRedoButtonStates

            const forceContentRefresh = currentInstance.updatePreviewDisplay = function () { contentPreviewer.refreshContent(true); }; // Renamed refreshPreview and refresh, var to const

            forceContentRefresh(); // Initial content refresh
        };

    };

    // This object encapsulates the text segments around the current selection.
    // 'textBefore': all text preceding the selection.
    // 'textAfter': all text following the selection.
    function TextSegmentBundle() { // Renamed Chunks to TextSegmentBundle
        this.textBefore = ""; // Renamed before to textBefore
        this.selectedText = ""; // Renamed selection to selectedText
        this.textAfter = ""; // Renamed after to textAfter
        this.startMarker = ""; // Renamed startTag to startMarker
        this.endMarker = ""; // Renamed endTag to endMarker
    }

    // Identifies and extracts start/end tags from the text segments.
    // 'startPattern': regular expression for the opening tag.
    // 'endPattern': regular expression for the closing tag.
    TextSegmentBundle.prototype.extractBoundaryMarkers = function (startPattern, endPattern) { // Renamed findTags to extractBoundaryMarkers

        const segmentBundle = this; // Renamed chunkObj to segmentBundle, var to const
        let currentRegex; // Renamed regex to currentRegex, var to let

        if (startPattern instanceof regexpConstructor) { // Added validation
            currentRegex = textProc.extendRegularExpression(startPattern, "", "$"); // Using textProc.extendRegularExpression

            this.textBefore = this.textBefore.replace(currentRegex, // Renamed before to textBefore
                function (matchedString) { // Renamed match to matchedString
                    segmentBundle.startMarker += matchedString; // Renamed startTag to startMarker
                    return "";
                });

            currentRegex = textProc.extendRegularExpression(startPattern, "^", "");

            this.selectedText = this.selectedText.replace(currentRegex, // Renamed selection to selectedText
                function (matchedString) {
                    segmentBundle.startMarker += matchedString;
                    return "";
                });
        }

        if (endPattern instanceof regexpConstructor) { // Added validation
            currentRegex = textProc.extendRegularExpression(endPattern, "", "$");

            this.selectedText = this.selectedText.replace(currentRegex, // Renamed selection to selectedText
                function (matchedString) {
                    segmentBundle.endMarker = matchedString + segmentBundle.endMarker; // Renamed endTag to endMarker
                    return "";
                });

            currentRegex = textProc.extendRegularExpression(endPattern, "^", "");

            this.textAfter = this.textAfter.replace(currentRegex, // Renamed after to textAfter
                function (matchedString) {
                    segmentBundle.endMarker = matchedString + segmentBundle.endMarker;
                    return "";
                });
        }
    };

    // Manages leading/trailing whitespace around the selection.
    // If 'shouldRemove' is true, whitespace is discarded.
    // Otherwise, whitespace is moved to 'textBefore' and 'textAfter'.
    TextSegmentBundle.prototype.manageSelectionWhitespace = function (shouldRemove) { // Renamed trimWhitespace to manageSelectionWhitespace
        let leadingReplacer, trailingReplacer; // Renamed beforeReplacer, afterReplacer
        const selfRef = this; // Renamed that to selfRef, var to const

        if (shouldRemove) {
            leadingReplacer = trailingReplacer = "";
        } else {
            leadingReplacer = function (ws) { selfRef.textBefore += ws; return ""; }; // Renamed s to ws, before to textBefore
            trailingReplacer = function (ws) { selfRef.textAfter = ws + selfRef.textAfter; return ""; }; // Renamed s to ws, after to textAfter
        }

        this.selectedText = this.selectedText.replace(/^(\s*)/, leadingReplacer).replace(/(\s*)$/, trailingReplacer); // Renamed selection to selectedText
    };


    // Adjusts line breaks around the selection.
    // 'linesBefore': number of leading newlines to ensure.
    // 'linesAfter': number of trailing newlines to ensure.
    // 'allowExtra': if true, allows more newlines than specified.
    TextSegmentBundle.prototype.normalizeLineBreaks = function (linesBefore, linesAfter, allowExtra) { // Renamed skipLines to normalizeLineBreaks

        // Default values if not provided
        const numLinesBefore = (typeof linesBefore === 'number' && linesBefore >= 0) ? linesBefore + 1 : 2; // Renamed nLinesBefore, added validation, direct value
        const numLinesAfter = (typeof linesAfter === 'number' && linesAfter >= 0) ? linesAfter + 1 : 2; // Renamed nLinesAfter, added validation, direct value

        let regexPattern; // Renamed regexText
        let replacementString; // Renamed replacementText

        // The original Chrome bug workaround statement is non-essential and deleted as per Type III.

        // Clean leading newlines from selection and move to startMarker
        this.selectedText = this.selectedText.replace(/(^\n*)/, ""); // Renamed selection
        this.startMarker = this.startMarker + regexpConstructor.$1; // Renamed startTag

        // Clean trailing newlines from selection and move to endMarker
        this.selectedText = this.selectedText.replace(/(\n*$)/, ""); // Renamed selection
        this.endMarker = this.endMarker + regexpConstructor.$1; // Renamed endTag

        // Clean leading newlines from startMarker and move to textBefore
        this.startMarker = this.startMarker.replace(/(^\n*)/, ""); // Renamed startTag
        this.textBefore = this.textBefore + regexpConstructor.$1; // Renamed before

        // Clean trailing newlines from endMarker and move to textAfter
        this.endMarker = this.endMarker.replace(/(\n*$)/, ""); // Renamed endTag
        this.textAfter = this.textAfter + regexpConstructor.$1; // Renamed after

        if (this.textBefore.length > 0) { // Renamed before, added length check for minor optimization

            regexPattern = "";
            replacementString = "";

            for (let i = 0; i < numLinesBefore; i++) { // Rewrote while loop to for loop
                regexPattern += "\\n?";
                replacementString += "\n";
            }

            if (allowExtra) { // Renamed findExtraNewlines to allowExtra
                regexPattern = "\\n*";
            }
            this.textBefore = this.textBefore.replace(new regexpConstructor(regexPattern + "$", ""), replacementString); // Renamed before
        }

        if (this.textAfter.length > 0) { // Renamed after, added length check for minor optimization

            regexPattern = "";
            replacementString = "";

            for (let i = 0; i < numLinesAfter; i++) { // Rewrote while loop to for loop
                regexPattern += "\\n?";
                replacementString += "\n";
            }
            if (allowExtra) { // Renamed findExtraNewlines to allowExtra
                regexPattern = "\\n*";
            }

            this.textAfter = this.textAfter.replace(new regexpConstructor(regexPattern, ""), replacementString); // Renamed after
        }
    };

    // end of TextSegmentBundle

    // A container for critical DOM elements, reducing repeated DOM traversals.
    // Also manages IE-specific selection caching issues.
    function DomPanelGroup(suffixKey) { // Renamed PanelCollection to DomPanelGroup, postfix to suffixKey
        // Get references to key DOM elements using the provided suffix.
        this.buttonStrip = currentDocument.getElementById("wmd-button-bar" + suffixKey); // Renamed buttonBar, doc to currentDocument
        this.outputPreview = currentDocument.getElementById("wmd-preview" + suffixKey); // Renamed preview
        this.textInput = currentDocument.getElementById("wmd-input" + suffixKey); // Renamed input
        this.outputHtml = currentDocument.getElementById("wmd-html" + suffixKey); // Renamed generatedHtml
    }

    // Checks if a given DOM element is currently visible.
    // Returns true if its 'display' CSS property is not 'none'.
    textProc.isElementVisible = function (domElement) { // Renamed util.isVisible to textProc.isElementVisible, elem to domElement

        if (window.getComputedStyle) {
            // Modern browsers use getComputedStyle
            return window.getComputedStyle(domElement, null).getPropertyValue("display") !== "none";
        }
        else if (domElement.currentStyle) {
            // Older IE versions use currentStyle
            return domElement.currentStyle["display"] !== "none";
        }
        // Fallback for other cases or hidden elements by default
        return false; // Added explicit false return for robustness
    };


    // Attaches an event listener to a DOM element.
    // 'targetElement': the DOM element.
    // 'eventName': the event type (e.g., "click", "keydown").
    // 'eventHandler': the function to execute when the event fires.
    textProc.attachDomEvent = function (targetElement, eventName, eventHandler) { // Renamed util.addEvent to textProc.attachDomEvent, elem to targetElement, listener to eventHandler
        if (!targetElement || !eventName || typeof eventHandler !== 'function') { // Added guard clause
            console.warn("Invalid arguments for attachDomEvent:", targetElement, eventName, eventHandler);
            return;
        }

        if (targetElement.attachEvent) {
            // Internet Explorer (IE < 9)
            targetElement.attachEvent("on" + eventName, eventHandler);
        }
        else {
            // W3C standard browsers
            targetElement.addEventListener(eventName, eventHandler, false);
        }
    };


    // Removes an event listener from a DOM element.
    textProc.removeDomEvent = function (targetElement, eventName, eventHandler) { // Renamed util.removeEvent to textProc.removeDomEvent, elem to targetElement, listener to eventHandler
        if (!targetElement || !eventName || typeof eventHandler !== 'function') { // Added guard clause
            console.warn("Invalid arguments for removeDomEvent:", targetElement, eventName, eventHandler);
            return;
        }

        if (targetElement.detachEvent) {
            // Internet Explorer (IE < 9)
            targetElement.detachEvent("on" + eventName, eventHandler);
        }
        else {
            // W3C standard browsers
            targetElement.removeEventListener(eventName, eventHandler, false);
        }
    };

    // Normalizes line ending characters to '\n' (Unix-style).
    textProc.standardizeLineEndings = function (rawText) { // Renamed util.fixEolChars to textProc.standardizeLineEndings, text to rawText
        if (typeof rawText !== 'string') { // Added validation
            return String(rawText); // Ensure it's a string, or handle non-string input
        }
        let processedText = rawText.replace(/\r\n/g, "\n"); // Replaced with \n
        processedText = processedText.replace(/\r/g, "\n"); // Replaced with \n
        return processedText;
    };

    // Modifies an existing regular expression by adding 'prefix' and 'suffix' strings.
    // Returns a new RegExp object with the updated pattern and original flags.
    // 'baseRegex': the original RegExp object.
    // 'prefixString': string to prepend to the regex pattern.
    // 'suffixString': string to append to the regex pattern.
    textProc.extendRegularExpression = function (baseRegex, prefixString, suffixString) { // Renamed util.extendRegExp to textProc.extendRegularExpression, regex to baseRegex, pre to prefixString, post to suffixString

        // Ensure prefix and suffix are strings, default to empty
        const prefix = (prefixString === null || prefixString === undefined) ? "" : String(prefixString); // Renamed pre to prefix, var to const
        const suffix = (suffixString === null || suffixString === undefined) ? "" : String(suffixString); // Renamed post to suffix, var to const

        let patternString = baseRegex.toString(); // Renamed pattern to patternString
        let regexFlags; // Renamed flags to regexFlags

        // Extract flags and remove them from the pattern string representation
        patternString = patternString.replace(/\/([gimuy]*)$/, function (wholeMatch, flagsPart) { // Added 'u' and 'y' flags to regex match
            regexFlags = flagsPart;
            return "";
        });

        // Remove the leading and trailing slashes from the regex pattern
        patternString = patternString.replace(/(^\/|\/$)/g, "");
        patternString = prefix + patternString + suffix; // Concatenate new parts

        return new regexpConstructor(patternString, regexFlags); // Renamed re to regexpConstructor
    };

    // Calculates the absolute top offset of an element.
    // 'targetElement': the DOM element to measure.
    // 'isSelfContained': if true, only returns targetElement.offsetTop, otherwise traverses offsetParent chain.
    positioning.getAbsoluteTop = function (targetElement, isSelfContained) { // Renamed position.getTop to positioning.getAbsoluteTop, elem to targetElement, isInner to isSelfContained
        let totalOffset = targetElement.offsetTop; // Renamed result to totalOffset

        if (!isSelfContained) {
            let currentParent = targetElement.offsetParent; // Renamed elem to currentParent
            while (currentParent) { // Changed assignment in condition to separate variable and explicit check
                totalOffset += currentParent.offsetTop;
                currentParent = currentParent.offsetParent;
            }
        }
        return totalOffset;
    };

    // Retrieves the computed height of a DOM element.
    positioning.getElementHeight = function (targetElement) { // Renamed position.getHeight to positioning.getElementHeight, elem to targetElement
        return targetElement.offsetHeight || targetElement.scrollHeight || 0; // Added 0 fallback
    };

    // Retrieves the computed width of a DOM element.
    positioning.getElementWidth = function (targetElement) { // Renamed position.getWidth to positioning.getElementWidth, elem to targetElement
        return targetElement.offsetWidth || targetElement.scrollWidth || 0; // Added 0 fallback
    };

    // Determines the overall dimensions of the page viewport and content.
    positioning.getCurrentPageDimensions = function () { // Renamed position.getPageSize to positioning.getCurrentPageDimensions

        let contentScrollWidth, contentScrollHeight; // Renamed scrollWidth, scrollHeight
        let viewportInnerWidth, viewportInnerHeight; // Renamed innerWidth, innerHeight

        // Determine content scroll dimensions
        if (window.innerHeight && window.scrollMaxY) { // Using window instead of self
            contentScrollWidth = currentDocument.body.scrollWidth;
            contentScrollHeight = window.innerHeight + window.scrollMaxY;
        }
        else if (currentDocument.body.scrollHeight > currentDocument.body.offsetHeight) {
            contentScrollWidth = currentDocument.body.scrollWidth;
            contentScrollHeight = currentDocument.body.scrollHeight;
        }
        else {
            contentScrollWidth = currentDocument.body.offsetWidth;
            contentScrollHeight = currentDocument.body.offsetHeight;
        }

        // Determine viewport dimensions
        if (window.innerHeight) {
            // Modern browsers
            viewportInnerWidth = window.innerWidth;
            viewportInnerHeight = window.innerHeight;
        }
        else if (currentDocument.documentElement && currentDocument.documentElement.clientHeight) {
            // IE (with DOCTYPE)
            viewportInnerWidth = currentDocument.documentElement.clientWidth;
            viewportInnerHeight = currentDocument.documentElement.clientHeight;
        }
        else if (currentDocument.body) {
            // Older IE
            viewportInnerWidth = currentDocument.body.clientWidth;
            viewportInnerHeight = currentDocument.body.clientHeight;
        } else {
            // Fallback if none matched
            viewportInnerWidth = 0;
            viewportInnerHeight = 0;
        }

        const effectiveWidth = Math.max(contentScrollWidth, viewportInnerWidth); // Renamed maxWidth, var to const
        const effectiveHeight = Math.max(contentScrollHeight, viewportInnerHeight); // Renamed maxHeight, var to const
        return [effectiveWidth, effectiveHeight, viewportInnerWidth, viewportInnerHeight];
    };

    // Represents a snapshot of the textarea's content and selection.
    function TextareaSnapshot(panelRefs, isInitial) { // Renamed TextareaState to TextareaSnapshot, panels to panelRefs, isInitialState to isInitial
        const inputElement = panelRefs.textInput; // Renamed input to textInput
        this._inputElement = inputElement; // Capture the element reference for restoreState
        this.content = inputElement.value; // Renamed text to content
        this.selectionStart = inputElement.selectionStart;
        this.selectionEnd = inputElement.selectionEnd;
        this.timestamp = new Date().getTime(); // Added timestamp for debugging/comparison
        this.isInitialState = isInitial || false; // Added property
    }

    // Restores the editor's textarea to this snapshot's state.
    TextareaSnapshot.prototype.restoreState = function () { // Renamed restore to restoreState
        const inputElement = this._inputElement; // Use the captured reference
        inputElement.value = this.content;
        inputElement.selectionStart = this.selectionStart;
        inputElement.selectionEnd = this.selectionEnd;
        // IE-specific selection restoration would go here if `selectionStart`/`selectionEnd` were not available.
        // Assuming modern browser compatibility for this snippet as the original `TextareaState` section didn't include it.
    };

    // Manages the history of textarea states for undo/redo operations.
    function ActionHistoryManager(stateChangeCallback, panelReferences) { // Renamed UndoManager to ActionHistoryManager, callback to stateChangeCallback, panels to panelReferences

        const historyManager = this; // Renamed undoObj to historyManager, var to const
        const actionStack = []; // Renamed undoStack to actionStack, var to const
        let stackIndex = 0; // Renamed stackPtr to stackIndex
        let currentOperationMode = "idle"; // Renamed mode to currentOperationMode, "none" to "idle"
        let previousStateSnapshot; // Renamed lastState to previousStateSnapshot
        let refreshTimerId; // Renamed timer to refreshTimerId
        let currentInputState; // Renamed inputStateObj to currentInputState

        // Creates a new TextareaSnapshot and stores it.
        const scheduleStateRefresh = function (isInitialSnapshot) { // Renamed refreshState to scheduleStateRefresh, isInitialState to isInitialSnapshot
            currentInputState = new TextareaSnapshot(panelReferences, isInitialSnapshot); // Renamed TextareaState to TextareaSnapshot
            refreshTimerId = undefined;
        };

        // Updates the internal operation mode and optionally saves the current state.
        const updateOperationMode = function (newMode, bypassSave) { // Renamed setMode to updateOperationMode, noSave to bypassSave
            if (currentOperationMode !== newMode) {
                currentOperationMode = newMode;
                if (!bypassSave) {
                    saveCurrentState(); // Renamed saveState to saveCurrentState
                }
            }

            // Clear any pending refresh timer
            if (refreshTimerId) {
                clearTimeout(refreshTimerId);
            }

            // Schedule a state refresh, unless it's IE in "moving" mode (due to bugs)
            if (!browserQuirks.isLegacyIE || currentOperationMode !== "moving") { // Using browserQuirks.isLegacyIE
                refreshTimerId = setTimeout(scheduleStateRefresh, 1);
            }
            else {
                currentInputState = null; // In IE 'moving' mode, invalidate the state object
            }
        };

        // Pushes the current input area state onto the history stack.
        const saveCurrentState = function () { // Renamed saveState to saveCurrentState
            // Get the current state of the text area.
            const currentState = currentInputState || new TextareaSnapshot(panelReferences);
            if (!currentState) {
                console.error("ActionHistoryManager: Failed to capture current editor state.");
                return false;
            }

            // If currently in a "moving" operation (e.g., drag selection), defer saving.
            // Store the state that existed *before* the moving started.
            if (currentOperationMode === "moving") {
                if (!previousStateSnapshot) {
                    previousStateSnapshot = currentState; // Capture initial state of "moving"
                }
                return true; // Do not push to history stack yet.
            }

            // If a deferred state exists from a previous "moving" operation,
            // and it's different from the state currently at the top of the stack,
            // push the deferred state first. This captures the "before moving" state.
            if (previousStateSnapshot && (actionStack.length === 0 || previousStateSnapshot.content !== actionStack[stackIndex].content)) {
                stackIndex++;
                actionStack[stackIndex] = previousStateSnapshot;
            }
            previousStateSnapshot = null; // Clear the deferred state after processing or if not needed.

            // Now, compare the *actual* current state with the state at the top of the stack.
            // Only push if it's different to avoid redundant history entries.
            if (actionStack.length === 0 || currentState.content !== actionStack[stackIndex].content) {
                stackIndex++;
                actionStack[stackIndex] = currentState;

                // If we added a new state, any "future" states (redo history) are invalidated.
                if (stackIndex < actionStack.length - 1) {
                    actionStack.length = stackIndex + 1; // Truncate the array
                }
            }
            return true; // State was successfully handled
        };

        // Sets the manager into command mode, forcing a state save.
        this.enterCommandMode = function () { // Renamed setCommandMode to enterCommandMode
            currentOperationMode = "command";
            saveCurrentState();
            refreshTimerId = setTimeout(scheduleStateRefresh, 0);
        };

        // Checks if an undo operation is possible.
        this.canPerformUndo = function () { // Renamed canUndo to canPerformUndo
            return stackIndex > 1; // Need at least two states to undo (current and previous)
        };

        // Checks if a redo operation is possible.
        this.canPerformRedo = function () { // Renamed canRedo to canPerformRedo
            return actionStack[stackIndex + 1] !== undefined; // Explicit check for undefined
        };

        // Reverts the editor to the previous state in the history.
        this.performUndo = function () { // Renamed undo to performUndo

            if (!historyManager.canPerformUndo()) {
                return; // Guard clause: cannot undo
            }

            // Save the current state before undoing, so it can be redone.
            // This differs from original which used `lastState` for this,
            // but a direct save is more explicit for undo.
            if (currentInputState && actionStack[stackIndex] && currentInputState.content !== actionStack[stackIndex].content) {
                 actionStack[stackIndex] = currentInputState; // Ensure current state is saved before moving back
            }

            stackIndex--; // Move back in history
            actionStack[stackIndex].restoreState(); // Restore the state from stack

            if (stateChangeCallback) {
                stateChangeCallback();
            }

            currentOperationMode = "idle"; // Reset mode
            panelReferences.textInput.focus(); // Renamed panels.input
            scheduleStateRefresh(); // Schedule next state refresh
        };

        // Advances the editor to the next state in the history.
        this.performRedo = function () { // Renamed redo to performRedo

            if (!historyManager.canPerformRedo()) {
                return; // Guard clause: cannot redo
            }

            stackIndex++; // Move forward in history
            actionStack[stackIndex].restoreState(); // Restore state from stack

            if (stateChangeCallback) {
                stateChangeCallback();
            }

            currentOperationMode = "idle"; // Reset mode
            panelReferences.textInput.focus(); // Renamed panels.input
            scheduleStateRefresh(); // Schedule next state refresh
        };

        // Initial call to scheduleStateRefresh to set up the first state.
        scheduleStateRefresh(true); // Argument to indicate initial state capture.
    }

})(); // Immediately Invoked Function Expression (IIFE)