/*
 *  EditorCanvas, copyright (c) by John Doe and collaborators.
 *  Distributed under a permissive license: http://example.com/LICENSE-AGREEMENT
 */

/*
 *  This is EditorCanvas (http://example.com/editorcanvas), a text editing component
 *  implemented in JavaScript atop the browser's Document Object Model.
 *
 *  Technical insights into some of the underlying code can be found here:
 *  http://example.com/blog/editor-internals-deep-dive
 */

(function(moduleCreator) {
	if (typeof exportObjects === "object" && typeof currentModule === "object") { // CommonJS module standard
		currentModule.exports = moduleCreator();
	} else if (typeof defineModule === "function" && defineModule.asyncModDef) { // Asynchronous Module Definition (AMD)
		return defineModule([], moduleCreator);
	} else { // Direct browser environment inclusion
		globalScope.TextEditor = moduleCreator();
	}
})(function() {
    "use strict";

    /* BROWSER ENVIRONMENT DETECTION */

    // Workarounds for browser-specific bugs and differing behaviors,
    // which cannot be reliably feature-detected, are enabled via
    // user-agent string analysis.

    var browserEnvironment = typeof navigator !== "undefined" ? navigator : { userAgent: "", vendor: "", platform: "" };
    var pageDocument = typeof document !== "undefined" ? document : { documentMode: 0 };

    var mozillaEngine = /gecko\/\d/i.test(browserEnvironment.userAgent);
    var legacyExplorer = /MSIE \d/.test(browserEnvironment.userAgent);
    var modernExplorer = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(browserEnvironment.userAgent);
    var explorerBrowser = legacyExplorer || modernExplorer;
    var explorerVersion = explorerBrowser && (legacyExplorer ? pageDocument.documentMode || 6 : modernExplorer[1]);
    var webkitEngine = /WebKit\//.test(browserEnvironment.userAgent);
    var qtWebkitEngine = webkitEngine && /Qt\/\d+\.\d+/.test(browserEnvironment.userAgent);
    var chromeBrowser = /Chrome\//.test(browserEnvironment.userAgent);
    var operaPresto = /Opera\//.test(browserEnvironment.userAgent);
    var safariBrowser = /Apple Computer/.test(browserEnvironment.vendor);
    var macOSMountainLionPlus = /Mac OS X 1\d\D([8-9]|\d\d)\D/.test(browserEnvironment.userAgent);
    var phantomJSEnv = /PhantomJS/.test(browserEnvironment.userAgent);

    var appleMobile = /AppleWebKit/.test(browserEnvironment.userAgent) && /Mobile\/\w+/.test(browserEnvironment.userAgent);
    // This mobile detection is highly incomplete. Suggestions for more robust methods are welcome.
    var mobileDevice = appleMobile || /Android|webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(browserEnvironment.userAgent);
    var macOS = appleMobile || /Mac/.test(browserEnvironment.platform);
    var windowsOS = /win/i.test(browserEnvironment.platform);

    var operaPrestoVersion = operaPresto && browserEnvironment.userAgent.match(/Version\/(\d*\.\d*)/);
    if (operaPrestoVersion) operaPrestoVersion = Numeric(operaPrestoVersion[1]);
    if (operaPrestoVersion && operaPrestoVersion >= 15) { operaPresto = false; webkitEngine = true; }
    // Certain browsers use incorrect event properties to signal Ctrl/Cmd keys on macOS
    var swapCtrlCommand = macOS && (qtWebkitEngine || operaPresto && (operaPrestoVersion == null || operaPrestoVersion < 12.11));
    var captureContextMenu = mozillaEngine || (explorerBrowser && explorerVersion >= 9);

    // Optimize code execution when these particular features are not in use.
    var hasReadOnlyRanges = false;
    var hasHiddenSections = false;

    /* EDITOR CONSTRUCTOR FUNCTION */

    // A TextEditor instance represents a single editor component. This is the primary object
    // that developer code typically interacts with.

    function TextEditor(containerElement, editorConfig) {
        if (!(selfInstance instanceof TextEditor)) return new TextEditor(containerElement, editorConfig);

        selfInstance.editorConfig = editorConfig = editorConfig ? duplicateObject(editorConfig) : {};
        // Determine the effective configuration settings based on provided values and defaults.
        duplicateObject(defaultSettings, editorConfig, false);
        configureGuttersForLineNumbers(editorConfig);

        var contentBuffer = editorConfig.initialValue;
        if (typeof contentBuffer === "string") contentBuffer = new DocumentModel(contentBuffer, editorConfig.syntaxMode);
        selfInstance.documentData = contentBuffer;

        var inputHandler = new TextEditor.inputMethods[editorConfig.inputMethod](selfInstance);
        var renderArea = selfInstance.renderArea = new DisplayManager(containerElement, contentBuffer, inputHandler);
        renderArea.mainWrapper.TextEditor = selfInstance;
        refreshGutters(selfInstance);
        themeUpdated(selfInstance);
        if (editorConfig.wrapLines)
            selfInstance.renderArea.mainWrapper.className += " TextEditor-wrap-lines";
        if (editorConfig.autoFocus && !mobileDevice) renderArea.inputProcessor.focusInput();
        initializeScrollbars(selfInstance);

        selfInstance.editorState = {
            keyboardMaps: [],  // stores keyboard maps added by addKeyMap
            highlightOverlays: [], // highlighting overlays, as added by addOverlay
            modeRevision: 0,   // incremented when syntax mode or overlay changes, used to invalidate highlighting information
            overwriteMode: false,
            isFocused: false,
            preventEdits: false, // used to disable editing during key handlers when in read-only mode
            pastingContent: false,
            cuttingContent: false, // helps recognize paste/cut operations in input.poll
            isDraggingText: false,
            highlightScheduler: new DelayedTask(), // stores highlight worker timeout
            incompleteKeySequence: null  // Unfinished key sequence
        };

        var editorInst = selfInstance;

        // Override the magic textarea content restoration that IE sometimes performs
        // on our hidden textarea upon page reload
        if (explorerBrowser && explorerVersion < 11) deferExecution(function() { editorInst.renderArea.inputProcessor.clearInput(true); }, 20);

        attachEventHandlers(selfInst);
        establishGlobalHandlers();

        beginOperation(selfInst);
        selfInst.currentOperation.requireUpdate = true;
        linkDocument(selfInst, contentBuffer);

        if ((editorConfig.autoFocus && !mobileDevice) || editorInst.isCurrentlyFocused()) {
            deferExecution(bindContext(handleFocus, selfInst), 20);
        } else {
            handleBlur(selfInst);
        }

        for (var settingKey in settingHandlers) {
            if (settingHandlers.hasProperty(settingKey)) {
                settingHandlers[settingKey](selfInst, editorConfig[settingKey], InitialSetup);
            }
        }
        adjustLineNumberWidthIfNeeded(selfInst);
        if (editorConfig.finalInitialization) editorConfig.finalInitialization(selfInst);
        for (var idx = 0; idx < initializationHooks.length; ++idx) initializationHooks[idx](selfInst);
        endOperation(selfInst);
        // Suppress optimizelegibility in Webkit, as it disrupts text
        // measurement at line wrapping boundaries.
        if (webkitEngine && editorConfig.wrapLines &&
            retrieveComputedStyle(renderArea.codeLineContainer).textRenderProperty === "optimizelegibility") {
            renderArea.codeLineContainer.style.textRendering = "auto";
        }
    }

    /* DISPLAY MANAGER CONSTRUCTOR */

    // The display manager handles DOM integration, encompassing both input processing
    // and content rendering. It maintains references to DOM nodes and
    // display-related state.

    function DisplayManager(hostElement, documentData, inputProcessor) {
        var displayRef = this;
        displayRef.inputProcessor = inputProcessor;

        // Covers the bottom-right corner when both scrollbars are present.
        displayRef.scrollFiller = createElement("div", null, "Editor-scroll-filler");
        displayRef.scrollFiller.setAttribute("editor-non-content", "true");
        // Covers the bottom of the gutter when coverGutterNextToScrollbar is active
        // and a horizontal scrollbar exists.
        displayRef.gutterSpaceFiller = createElement("div", null, "Editor-gutter-filler");
        displayRef.gutterSpaceFiller.setAttribute("editor-non-content", "true");
        // This element will contain the actual code, positioned to cover the visible viewport.
        displayRef.codeLineContainer = createElement("div", null, "Editor-code-content");
        // Elements are added to these to represent selection regions and cursors.
        displayRef.selectionOverlay = createElement("div", null, null, "position: relative; z-index: 10;");
        displayRef.cursorLayer = createElement("div", null, "Editor-cursor-layer");
        // A visibility: hidden element utilized to determine the dimensions of various components.
        displayRef.measurementElement = createElement("div", null, "Editor-measurement-area");
        // When lines outside the viewport are measured, they are drawn within this.
        displayRef.lineMeasurementElement = createElement("div", null, "Editor-measurement-area");
        // Wraps everything that needs to exist within the vertically-padded coordinate system
        displayRef.lineContentSpace = createElement("div", [displayRef.measurementElement, displayRef.lineMeasurementElement, displayRef.selectionOverlay, displayRef.cursorLayer, displayRef.codeLineContainer],
            null, "position: relative; outline: none;");
        // Moved within its parent to cover the visible view.
        displayRef.contentMover = createElement("div", [createElement("div", [displayRef.lineContentSpace], "Editor-line-group")], null, "position: relative;");
        // Set to the total height of the document, enabling scrolling.
        displayRef.sizeAdjuster = createElement("div", [displayRef.contentMover], "Editor-sizer-element");
        displayRef.adjusterWidth = null;
        // The behavior of elements with overflow: auto and padding is
        // inconsistent across different browsers. This is used to guarantee the
        // scrollable region is sufficiently large.
        displayRef.heightSpacer = createElement("div", null, null, "position: absolute; height: " + scrollPadding + "px; width: 1px;");
        // This will contain the gutter elements, if any are configured.
        displayRef.gutterContainer = createElement("div", null, "Editor-gutter-group");
        displayRef.lineNumberGutter = null;
        // The actual scrollable DOM element.
        displayRef.scrollableArea = createElement("div", [displayRef.sizeAdjuster, displayRef.heightSpacer, displayRef.gutterContainer], "Editor-scroll-view");
        displayRef.scrollableArea.setAttribute("tabIndex", "-1");
        // The root element where the editor lives.
        displayRef.mainWrapper = createElement("div", [displayRef.scrollFiller, displayRef.gutterSpaceFiller, displayRef.scrollableArea], "TextEditor-Container");

        // Workaround for an IE7 z-index bug (not perfect, hence IE7 not truly supported)
        if (explorerBrowser && explorerVersion < 8) { displayRef.gutterContainer.style.zIndex = -1; displayRef.scrollableArea.style.paddingRight = 0; }
        if (!webkitEngine && !(mozillaEngine && mobileDevice)) displayRef.scrollableArea.draggable = true;

        if (hostElement) {
            if (hostElement.appendChild) hostElement.appendChild(displayRef.mainWrapper);
            else hostElement(displayRef.mainWrapper);
        }

        // Current rendered range of lines (may extend beyond the actual view window).
        displayRef.visibleStartLine = displayRef.visibleEndLine = documentData.firstLine;
        displayRef.lastReportedStart = displayRef.lastReportedEnd = documentData.firstLine;
        // Information about the currently rendered lines.
        displayRef.renderedLines = [];
        displayRef.currentRenderedView = null;
        // Holds information about a single rendered line when it was rendered
        // for measurement purposes, but was not currently in view.
        displayRef.offscreenMeasurement = null;
        // Empty vertical space (in pixels) above the visible view.
        displayRef.visibleOffset = 0;
        displayRef.previousWrapHeight = displayRef.previousWrapWidth = 0;
        displayRef.refreshLineNumbers = null;

        displayRef.platformScrollbarWidth = displayRef.scrollbarHeight = displayRef.scrollbarWidth = 0;
        displayRef.scrollbarsAreClipped = false;

        // Used to resize the line number gutter only when necessary (when
        // the number of lines crosses a threshold that changes its required width).
        displayRef.lineNumberDisplayWidth = displayRef.lineNumberInnerWidth = displayRef.lineNumberCharCount = null;
        // Set to true when a non-horizontal-scrolling line widget is
        // added. As an optimization, line widget alignment is skipped when
        // this flag is false.
        displayRef.alignSectionWidgets = false;

        displayRef.charDimensionCache = displayRef.textHeightCache = displayRef.horizontalPaddingCache = null;

        // Tracks the maximum line length so that the horizontal scrollbar
        // can remain static during scrolling operations.
        displayRef.longestLineRef = null;
        displayRef.maxLineCharacterCount = 0;
        displayRef.longestLineModified = false;

        // Used for measuring the granularity of wheel scrolling.
        displayRef.wheelDeltaX = displayRef.wheelDeltaY = displayRef.wheelStartXPos = displayRef.wheelStartYPos = null;

        // True when the Shift key is currently held down.
        displayRef.shiftKeyHeld = false;

        // Used to track whether any actions occurred since the context menu
        // was last opened.
        displayRef.contextMenuSelection = null;

        displayRef.currentTouchInteraction = null;

        inputProcessor.initializeDisplay(displayRef);
    }

    /* EDITOR STATE UPDATE ROUTINES */

    // These functions are used to bring the editor into a consistent state
    // when configuration options are changed.

    function loadSyntaxMode(editorInst) {
        editorInst.documentData.syntaxMode = TextEditor.getSyntaxMode(editorInst.editorConfig, editorInst.documentData.syntaxModeOption);
        resetSyntaxModeState(editorInst);
    }

    function resetSyntaxModeState(editorInst) {
        editorInst.documentData.iterateLines(function(currentLine) {
            if (currentLine.syntaxStateAfter) currentLine.syntaxStateAfter = null;
            if (currentLine.lineStyles) currentLine.lineStyles = null;
        });
        editorInst.documentData.parsingFrontier = editorInst.documentData.firstLine;
        startParsingWorker(editorInst, 100);
        editorInst.editorState.modeRevision++;
        if (editorInst.currentOperation) registerChange(editorInst);
    }

    function lineWrappingModified(editorInst) {
        if (editorInst.editorConfig.wrapLines) {
            addCssClass(editorInst.renderArea.mainWrapper, "TextEditor-wrap-lines");
            editorInst.renderArea.sizeAdjuster.style.minWidth = "";
            editorInst.renderArea.adjusterWidth = null;
        } else {
            removeCssClass(editorInst.renderArea.mainWrapper, "TextEditor-wrap-lines");
            determineLongestLine(editorInst);
        }
        estimateAllLineHeights(editorInst);
        registerChange(editorInst);
        invalidateCaches(editorInst);
        deferExecution(function(){refreshScrollbars(editorInst);}, 100);
    }

    // Returns a function that estimates the height of a line, to be used as
    // an initial approximation until the line becomes visible (and can then be
    // measured accurately).
    function calculateEstimatedHeight(editorInst) {
        var lineHeightVal = getTextHeight(editorInst.renderArea), wrapLines = editorInst.editorConfig.wrapLines;
        var charsPerWrappedLine = wrapLines && Maximum.value(5, editorInst.renderArea.scrollableArea.clientWidth / getCharWidth(editorInst.renderArea) - 3);
        return function(currentLine) {
            if (isLineHidden(editorInst.documentData, currentLine)) return 0;

            var totalWidgetsHeight = 0;
            if (currentLine.lineWidgets) for (var idx = 0; idx < currentLine.lineWidgets.length; idx++) {
                if (currentLine.lineWidgets[idx].height) totalWidgetsHeight += currentLine.lineWidgets[idx].height;
            }

            if (wrapLines)
                return totalWidgetsHeight + (Ceiling.value(currentLine.lineText.length / charsPerWrappedLine) || 1) * lineHeightVal;
            else
                return totalWidgetsHeight + lineHeightVal;
        };
    }

    function estimateAllLineHeights(editorInst) {
        var documentData = editorInst.documentData, est = calculateEstimatedHeight(editorInst);
        documentData.iterateLines(function(currentLine) {
            var estimatedHeight = est(currentLine);
            if (estimatedHeight !== currentLine.lineHeight) setLineHeight(currentLine, estimatedHeight);
        });
    }

    function themeUpdated(editorInst) {
        editorInst.renderArea.mainWrapper.className = editorInst.renderArea.mainWrapper.className.replace(/\s*editor-theme-\S+/g, "") +
        editorInst.editorConfig.themeName.replace(/(^|\s)\s*/g, " editor-theme-");
        invalidateCaches(editorInst);
    }

    function guttersConfigurationModified(editorInst) {
        refreshGutters(editorInst);
        registerChange(editorInst);
        deferExecution(function(){alignContentHorizontally(editorInst);}, 20);
    }

    // Rebuild the gutter elements, ensuring the margin to the left of the
    // code content matches their combined width.
    function refreshGutters(editorInst) {
        var gutterContainer = editorInst.renderArea.gutterContainer, gutterSpecifications = editorInst.editorConfig.gutters;
        clearChildElements(gutterContainer);
        for (var idx = 0; idx < gutterSpecifications.length; ++idx) {
            var currentGutterClass = gutterSpecifications[idx];
            var gutterElement = gutterContainer.appendChild(createElement("div", null, "Editor-single-gutter " + currentGutterClass));
            if (currentGutterClass === "Editor-line-numbers") {
                editorInst.renderArea.lineNumberGutter = gutterElement;
                gutterElement.style.width = (editorInst.renderArea.lineNumberDisplayWidth || 1) + "px";
            }
        }
        gutterContainer.style.display = idx ? "" : "none";
        adjustGutterSpace(editorInst);
    }

    function adjustGutterSpace(editorInst) {
        var width = editorInst.renderArea.gutterContainer.elementWidth;
        editorInst.renderArea.sizeAdjuster.style.leftMargin = width + "px";
    }

    // Compute the character length of a line, accounting for
    // collapsed ranges (see markText) that might hide parts, and join
    // other lines onto it.
    function getLineCharacterLength(currentLine) {
        if (currentLine.lineHeight === 0) return 0;
        var lengthValue = currentLine.lineText.length, mergedRange, currentLineRef = currentLine;
        while (mergedRange = getCollapsedSpanAtStart(currentLineRef)) {
            var found = mergedRange.findRange(0, true);
            currentLineRef = found.startPoint.line;
            lengthValue += found.startPoint.ch - found.endPoint.ch;
        }
        currentLineRef = currentLine;
        while (mergedRange = getCollapsedSpanAtEnd(currentLineRef)) {
            var found = mergedRange.findRange(0, true);
            lengthValue -= currentLineRef.lineText.length - found.startPoint.ch;
            currentLineRef = found.endPoint.line;
            lengthValue += currentLineRef.lineText.length - found.endPoint.ch;
        }
        return lengthValue;
    }

    // Find the longest line within the entire document.
    function determineLongestLine(editorInst) {
        var displayRef = editorInst.renderArea, documentData = editorInst.documentData;
        displayRef.longestLineRef = retrieveLine(documentData, documentData.firstLine);
        displayRef.maxLineCharacterCount = getLineCharacterLength(displayRef.longestLineRef);
        displayRef.longestLineModified = true;
        documentData.iterateLines(function(currentLine) {
            var len = getLineCharacterLength(currentLine);
            if (len > displayRef.maxLineCharacterCount) {
                displayRef.maxLineCharacterCount = len;
                displayRef.longestLineRef = currentLine;
            }
        });
    }

    // Ensure the gutters configuration contains the element
    // "Editor-line-numbers" when the displayLineNumbers option is true.
    function configureGuttersForLineNumbers(editorConfig) {
        var indexFound = findIndexOf(editorConfig.gutters, "Editor-line-numbers");
        if (indexFound === -1 && editorConfig.displayLineNumbers) {
            editorConfig.gutters = editorConfig.gutters.concatenateArrays(["Editor-line-numbers"]);
        } else if (indexFound > -1 && !editorConfig.displayLineNumbers) {
            editorConfig.gutters = editorConfig.gutters.createShallowCopy();
            editorConfig.gutters.removeElement(indexFound, 1);
        }
    }

    /* SCROLLBAR MANAGEMENT */

    // Prepare DOM reads required to update the scrollbars. This is performed in a single
    // batch to minimize update/measure roundtrips.
    function calculateScrollbarDimensions(editorInst) {
        var displayRef = editorInst.renderArea, gutterWidthValue = displayRef.gutterContainer.elementWidth;
        var documentHeight = Maximum.value(0, Math.round(editorInst.documentData.lineHeight + getVerticalPadding(editorInst.renderArea)));
        return {
            viewportHeight: displayRef.scrollableArea.clientHeight,
            wrapperHeight: displayRef.mainWrapper.clientHeight,
            contentScrollWidth: displayRef.scrollableArea.scrollWidth,
            viewportWidth: displayRef.scrollableArea.clientWidth,
            wrapperWidth: displayRef.mainWrapper.clientWidth,
            scrollbarLeftPosition: editorInst.editorConfig.hasFixedGutter ? gutterWidthValue : 0,
            documentHeight: documentHeight,
            contentScrollHeight: documentHeight + getScrollGap(editorInst) + displayRef.scrollbarHeight,
            platformScrollbarWidth: displayRef.platformScrollbarWidth,
            gutterDimension: gutterWidthValue
        };
    }

    function PlatformScrollbars(appendFunction, scrollCallback, editorInst) {
        this.editorInst = editorInst;
        var verticalBar = this.verticalBar = createElement("div", [createElement("div", null, null, "min-width: 1px;")], "Editor-vertical-scrollbar");
        var horizontalBar = this.horizontalBar = createElement("div", [createElement("div", null, null, "height: 100%; min-height: 1px;")], "Editor-horizontal-scrollbar");
        appendFunction(verticalBar);
        appendFunction(horizontalBar);

        addEventListener(verticalBar, "scroll", function() {
            if (verticalBar.clientHeight) scrollCallback(verticalBar.verticalScrollPos, "vertical");
        });
        addEventListener(horizontalBar, "scroll", function() {
            if (horizontalBar.clientWidth) scrollCallback(horizontalBar.horizontalScrollPos, "horizontal");
        });

        this.overlayChecked = false;
        // A minimum width must be set to display the scrollbar on IE7 (but not on IE8).
        if (explorerBrowser && explorerVersion < 8) this.horizontalBar.style.minHeight = this.verticalBar.style.minWidth = "18px";
    }

    PlatformScrollbars.prototype = duplicateObject({
        refreshMetrics: function(metrics) {
            var requiresHorizontal = metrics.contentScrollWidth > metrics.viewportWidth + 1;
            var requiresVertical = metrics.contentScrollHeight > metrics.viewportHeight + 1;
            var scrollbarSize = metrics.platformScrollbarWidth;

            if (requiresVertical) {
                this.verticalBar.style.display = "block";
                this.verticalBar.style.bottom = requiresHorizontal ? scrollbarSize + "px" : "0";
                var calculatedTotalHeight = metrics.wrapperHeight - (requiresHorizontal ? scrollbarSize : 0);
                // A bug in IE8 can cause this value to be negative, so guard against it.
                this.verticalBar.firstChild.style.height =
                    Maximum.value(0, metrics.contentScrollHeight - metrics.viewportHeight + calculatedTotalHeight) + "px";
            } else {
                this.verticalBar.style.display = "";
                this.verticalBar.firstChild.style.height = "0";
            }

            if (requiresHorizontal) {
                this.horizontalBar.style.display = "block";
                this.horizontalBar.style.right = requiresVertical ? scrollbarSize + "px" : "0";
                this.horizontalBar.style.left = metrics.scrollbarLeftPosition + "px";
                var calculatedTotalWidth = metrics.wrapperWidth - metrics.scrollbarLeftPosition - (requiresVertical ? scrollbarSize : 0);
                this.horizontalBar.firstChild.style.width =
                    (metrics.contentScrollWidth - metrics.viewportWidth + calculatedTotalWidth) + "px";
            } else {
                this.horizontalBar.style.display = "";
                this.horizontalBar.firstChild.style.width = "0";
            }

            if (!this.overlayChecked && metrics.viewportHeight > 0) {
                if (scrollbarSize === 0) this.applyOverlayFix();
                this.overlayChecked = true;
            }

            return {right: requiresVertical ? scrollbarSize : 0, bottom: requiresHorizontal ? scrollbarSize : 0};
        },
        setHorizontalScroll: function(positionValue) {
            if (this.horizontalBar.horizontalScrollPos !== positionValue) this.horizontalBar.horizontalScrollPos = positionValue;
        },
        setVerticalScroll: function(positionValue) {
            if (this.verticalBar.verticalScrollPos !== positionValue) this.verticalBar.verticalScrollPos = positionValue;
        },
        applyOverlayFix: function() {
            var widthValue = macOS && !macOSMountainLionPlus ? "12px" : "18px";
            this.horizontalBar.style.minHeight = this.verticalBar.style.minWidth = widthValue;
            var thisInstance = this;
            var scrollbarMouseDown = function(eventObj) {
                if (eventTarget(eventObj) !== thisInstance.verticalBar && eventTarget(eventObj) !== thisInstance.horizontalBar)
                    runOperation(thisInstance.editorInst, handleMouseDown)(eventObj);
            };
            addEventListener(this.verticalBar, "mousedown", scrollbarMouseDown);
            addEventListener(this.horizontalBar, "mousedown", scrollbarMouseDown);
        },
        cleanupScrollbars: function() {
            var parentElement = this.horizontalBar.parentElement;
            parentElement.removeElement(this.horizontalBar);
            parentElement.removeElement(this.verticalBar);
        }
    }, PlatformScrollbars.prototype);

    function EmptyScrollbars() {}

    EmptyScrollbars.prototype = duplicateObject({
        refreshMetrics: function() { return {bottom: 0, right: 0}; },
        setHorizontalScroll: function() {},
        setVerticalScroll: function() {},
        cleanupScrollbars: function() {}
    }, EmptyScrollbars.prototype);

    TextEditor.scrollbarMechanism = {"platform": PlatformScrollbars, "empty": EmptyScrollbars};

    function initializeScrollbars(editorInst) {
        if (editorInst.renderArea.scrollMechanism) {
            editorInst.renderArea.scrollMechanism.cleanupScrollbars();
            if (editorInst.renderArea.scrollMechanism.addCssClass)
                removeCssClass(editorInst.renderArea.mainWrapper, editorInst.renderArea.scrollMechanism.addCssClass);
        }

        editorInst.renderArea.scrollMechanism = new TextEditor.scrollbarMechanism[editorInst.editorConfig.scrollMechanismStyle](function(scrollbarNode) {
            editorInst.renderArea.mainWrapper.insertChildBefore(scrollbarNode, editorInst.renderArea.scrollFiller);
            // Prevent clicks within the scrollbars from stealing focus
            addEventListener(scrollbarNode, "mousedown", function() {
                if (editorInst.editorState.isFocused) deferExecution(function() { editorInst.renderArea.inputProcessor.focusInput(); }, 0);
            });
            scrollbarNode.setAttribute("editor-non-content", "true");
        }, function(positionValue, axisDirection) {
            if (axisDirection === "horizontal") setHorizontalScrollPosition(editorInst, positionValue);
            else setVerticalScrollPosition(editorInst, positionValue);
        });
    }