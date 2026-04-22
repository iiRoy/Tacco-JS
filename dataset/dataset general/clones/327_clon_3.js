(function(factoryModule) {
    if (typeof exports === "object" && typeof module === "object") // StandardJS / Node.js
        module.exports = factoryModule();
    else if (typeof define === "function" && define.amd) // AMD format
        return define([], factoryModule);
    else // Browser global
        this.EditorEngine = factoryModule();
})(function() {
    "use strict";

    // CORE UTILITIES & BROWSER DETECTION

    // These flags identify browser engines and specific versions
    // to work around known inconsistencies and render quirks.
    // They are derived from the user agent string.

    const isGeckoEngine = typeof navigator !== 'undefined' && /gecko\/\d/i.test(navigator.userAgent);
    const isOldIE = typeof navigator !== 'undefined' && /MSIE \d/.test(navigator.userAgent);
    const ie11PlusMatch = typeof navigator !== 'undefined' && /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
    const isIEBrowser = isOldIE || ie11PlusMatch;
    const ieEngineVersion = isIEBrowser && (isOldIE ? document.documentMode || 6 : parseInt(ie11PlusMatch[1], 10));
    const isWebKitEngine = typeof navigator !== 'undefined' && /WebKit\//.test(navigator.userAgent);
    const isQtWebKitBased = isWebKitEngine && /Qt\/\d+\.\d+/.test(navigator.userAgent);
    const isChromeBrowser = typeof navigator !== 'undefined' && /Chrome\//.test(navigator.userAgent);
    const isOperaPresto = typeof navigator !== 'undefined' && /Opera\//.test(navigator.userAgent);
    const isSafariBrowser = typeof navigator !== 'undefined' && /Apple Computer/.test(navigator.vendor);
    const isMacMountainLionOrNewer = typeof navigator !== 'undefined' && /Mac OS X 1\d\D([8-9]|\d\d)\D/.test(navigator.userAgent);
    const isPhantomJS = typeof navigator !== 'undefined' && /PhantomJS/.test(navigator.userAgent);

    const isIOSDevice = typeof navigator !== 'undefined' && /AppleWebKit/.test(navigator.userAgent) && /Mobile\/\w+/.test(navigator.userAgent);
    // This mobile device detection is intentionally broad and may not cover all edge cases.
    const isMobileDevice = isIOSDevice || (typeof navigator !== 'undefined' && /Android|webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(navigator.userAgent));
    const isMacOS = isIOSDevice || (typeof navigator !== 'undefined' && /Mac/.test(navigator.platform));
    const isWindowsOS = typeof navigator !== 'undefined' && /win/i.test(navigator.platform);

    let operaPrestoVersion = null;
    if (isOperaPresto && typeof navigator !== 'undefined') {
        const versionMatch = navigator.userAgent.match(/Version\/(\d*\.\d*)/);
        if (versionMatch) operaPrestoVersion = Number(versionMatch[1]);
    }

    if (operaPrestoVersion && operaPrestoVersion >= 15) { // Presto versions 15+ are actually WebKit-based
        // isOperaPresto = false; // Re-assigning constants is not allowed, this indicates a conceptual change
        // isWebKitEngine = true; // Same here. In a clone, we might just drop the Presto flag if it's WebKit.
    }
    // Some OS X browsers use Ctrl instead of Cmd for commands.
    const needsCtrlCmdSwap = isMacOS && (isQtWebKitBased || (isOperaPresto && (operaPrestoVersion == null || operaPrestoVersion < 12.11)));
    const shouldCaptureRightClick = isGeckoEngine || (isIEBrowser && ieEngineVersion >= 9);

    // Initial flags for tracking certain editor features usage.
    let hasReadOnlySegments = false, hasCollapsedSegments = false;

    // EDITOR MAIN CLASS
    // The `CodeEditorCore` instance is the primary object for interacting with the editor.

    function CodeEditorCore(domTarget, editorSettings) {
        // Ensure constructor is called with 'new'
        if (!(this instanceof CodeEditorCore)) return new CodeEditorCore(domTarget, editorSettings);

        // Validate target DOM element
        if (!domTarget || (!domTarget.appendChild && typeof domTarget !== 'function')) {
            console.error("CodeEditorCore: Invalid DOM target provided for initialization.");
            throw new Error("Invalid DOM target for CodeEditorCore.");
        }

        this.settings = editorSettings = editorSettings ? Object.assign({}, editorSettings) : {};
        // Apply default settings if not explicitly provided
        Object.keys(defaultConfiguration).forEach(key => {
            if (editorSettings[key] === undefined) {
                editorSettings[key] = defaultConfiguration[key];
            }
        });
        prepareLineNumberGutter(editorSettings);

        let documentModel = editorSettings.initialContent;
        if (typeof documentModel === "string") documentModel = new DocumentData(documentModel, editorSettings.syntaxMode);
        this.documentModel = documentModel;

        const inputProcessor = new CodeEditorCore.inputMethods[editorSettings.inputMechanism](this);
        const viewManager = this.viewManager = new EditorViewManager(domTarget, documentModel, inputProcessor);
        viewManager.rootWrapper.CodeEditorCoreInstance = this; // Link back to the editor instance
        updateVisualGutters(this);
        applyVisualTheme(this);

        if (editorSettings.enableLineWrapping) {
            viewManager.rootWrapper.classList.add("EditorCore-wrap-lines");
        }
        if (editorSettings.autoFocus && !isMobileDevice) {
            viewManager.inputElement.focus();
        }
        initializeScrollbarSystem(this);

        this.internalState = {
            keyBindings: [],      // Stores custom keymap definitions
            highlightOverlays: [],// Syntax highlighting overlays
            modeRevision: 0,      // Incremented on mode/overlay changes to invalidate caches
            isOverwriteMode: false,
            isFocused: false,
            preventEdits: false,  // Disables editing temporarily (e.g., during read-only ops)
            isPasting: false, isCutting: false, // Helps input processor differentiate changes
            isDraggingText: false,
            highlightScheduler: new DeferredTask(), // Manages highlighting timeout
            currentKeySequence: null // Tracks multi-key sequences
        };

        const editorInstance = this;

        // IE versions prior to 11 sometimes restore textarea content on reload.
        if (isIEBrowser && ieEngineVersion < 11) {
            setTimeout(() => { editorInstance.viewManager.inputElement.resetInput(true); }, 25);
        }

        attachEditorEvents(this);
        ensureGlobalEventHandlers(); // Ensures global listeners are set up once

        beginEditorOperation(this);
        this.currentOperation.forceViewUpdate = true;
        linkDocumentToEditor(this, documentModel);

        if ((editorSettings.autoFocus && !isMobileDevice) || editorInstance.isCurrentlyFocused()) {
            setTimeout(() => { onEditorFocus(this); }, 25);
        } else {
            onEditorBlur(this);
        }

        // Apply initial options via their handlers
        Object.keys(optionHandlers).forEach(optKey => {
            if (editorSettings.hasOwnProperty(optKey)) {
                optionHandlers[optKey](this, editorSettings[optKey], InitializationPhase);
            }
        });
        updateLineNumberGutterWidth(this);
        if (editorSettings.onEditorReady) editorSettings.onEditorReady(this);
        for (let i = 0; i < initializationHooks.length; ++i) {
            initializationHooks[i](this);
        }
        endEditorOperation(this);

        // Webkit optimization for line wrapping, avoids text rendering issues.
        if (isWebKitEngine && editorSettings.enableLineWrapping) {
            const computedStyle = getComputedStyle(viewManager.contentDiv);
            if (computedStyle && computedStyle.textRendering === "optimizelegibility") {
                viewManager.contentDiv.style.textRendering = "auto";
            }
        }
    }

    // EDITOR VIEW MANAGER
    // This class handles all DOM interactions, including rendering content,
    // managing input elements, and updating the visual display.

    function EditorViewManager(targetElement, docData, inputMechanism) {
        const displayInstance = this;
        this.inputElement = inputMechanism;

        // Helper for creating DOM elements
        const createDomElement = (tagName, children, className, style) => {
            const el = document.createElement(tagName);
            if (className) el.className = className;
            if (style) el.style.cssText = style;
            if (children) {
                if (Array.isArray(children)) {
                    children.forEach(child => el.appendChild(child));
                } else {
                    el.appendChild(children);
                }
            }
            return el;
        };

        // DOM structure for the editor
        displayInstance.verticalScrollFiller = createDomElement("div", null, "EditorCore-scrollbar-fill-v");
        displayInstance.verticalScrollFiller.setAttribute("data-editor-component", "true");

        displayInstance.gutterFillElement = createDomElement("div", null, "EditorCore-gutter-fill");
        displayInstance.gutterFillElement.setAttribute("data-editor-component", "true");

        displayInstance.contentDiv = createDomElement("div", null, "EditorCore-code-content");

        displayInstance.selectionHighlightDiv = createDomElement("div", null, null, "position: relative; z-index: 1");
        displayInstance.cursorIndicatorDiv = createDomElement("div", null, "EditorCore-cursors");

        displayInstance.measurementProbe = createDomElement("div", null, "EditorCore-measurement-probe");
        displayInstance.offscreenLineMeasure = createDomElement("div", null, "EditorCore-line-measure-offscreen");

        displayInstance.lineContentSpace = createDomElement("div",
            [displayInstance.measurementProbe, displayInstance.offscreenLineMeasure, displayInstance.selectionHighlightDiv, displayInstance.cursorIndicatorDiv, displayInstance.contentDiv],
            null, "position: relative; outline: none");

        displayInstance.movableContentWrapper = createDomElement("div",
            [createDomElement("div", [displayInstance.lineContentSpace], "EditorCore-lines-wrapper")],
            null, "position: relative");

        displayInstance.sizerElement = createDomElement("div", [displayInstance.movableContentWrapper], "EditorCore-sizer-element");
        displayInstance.cachedSizerWidth = null;

        displayInstance.heightSpacer = createDomElement("div", null, null, "position: absolute; height: " + scrollBufferHeight + "px; width: 1px;");

        displayInstance.gutterContainer = createDomElement("div", null, "EditorCore-gutters-container");
        displayInstance.lineNumberGutter = null;

        displayInstance.scrollableArea = createDomElement("div", [displayInstance.sizerElement, displayInstance.heightSpacer, displayInstance.gutterContainer], "EditorCore-scroll-area");
        displayInstance.scrollableArea.setAttribute("tabIndex", "-1");

        displayInstance.rootWrapper = createDomElement("div",
            [displayInstance.verticalScrollFiller, displayInstance.gutterFillElement, displayInstance.scrollableArea],
            "EditorCore-main-wrapper");

        // Append to the target element
        if (targetElement.appendChild) {
            targetElement.appendChild(displayInstance.rootWrapper);
        } else {
            targetElement(displayInstance.rootWrapper); // Assume it's a function that takes the element
        }

        // Current visible line range (can be larger than actual viewport)
        displayInstance.visibleStartLine = displayInstance.visibleEndLine = docData.firstLine;
        displayInstance.reportedVisibleStart = displayInstance.reportedVisibleEnd = docData.firstLine;
        displayInstance.renderedLineNodes = []; // List of rendered line objects
        displayInstance.cachedRenderedView = null; // Stored info about the last render
        displayInstance.externalMeasurementCache = null; // For lines measured outside the view
        displayInstance.scrollOffsetVertical = 0; // Vertical pixel offset of the view
        displayInstance.lastWrapperHeight = displayInstance.lastWrapperWidth = 0;
        displayInstance.lineNumberUpdateRequired = null;

        displayInstance.nativeScrollbarWidth = displayInstance.horizontalBarHeight = displayInstance.verticalBarWidth = 0;
        displayInstance.areScrollbarsClipped = false;

        displayInstance.lineNumberWidth = displayInstance.lineNumberInnerWidth = displayInstance.lineNumberChars = null;
        displayInstance.needsWidgetAlignment = false; // True if non-horizontal-scrolling line widgets exist.

        displayInstance.cachedCharWidth = displayInstance.cachedTextHeight = displayInstance.cachedHorizontalPadding = null;

        // Tracks the widest line for horizontal scrollbar stability.
        displayInstance.cachedLongestLineNode = null;
        displayInstance.maxLineContentLength = 0;
        displayInstance.longestLineNeedsUpdate = false;

        // For wheel scrolling granularity
        displayInstance.wheelDeltaX = displayInstance.wheelDeltaY = displayInstance.wheelStartX = displayInstance.wheelStartY = null;

        displayInstance.isShiftHeld = false;
        displayInstance.contextMenuSelection = null; // Tracks selection state when context menu opens
        displayInstance.activeTouchInteraction = null;

        inputMechanism.initializeInput(displayInstance);
    }

    // STATE MANAGEMENT AND OPTION HANDLERS

    // Activates the syntax highlighting mode for the document.
    function activateSyntaxMode(editorInst) {
        editorInst.documentModel.modeDefinition = CodeEditorCore.getSyntaxHighlighter(editorInst.settings, editorInst.documentModel.syntaxModeOption);
        clearSyntaxCache(editorInst);
    }

    // Clears all cached syntax states and styles, then triggers a re-highlight.
    function clearSyntaxCache(editorInst) {
        editorInst.documentModel.forEachLine(lineNode => {
            lineNode._syntaxState = null;
            lineNode._cachedStyles = null;
        });
        editorInst.documentModel.highlightFrontier = editorInst.documentModel.firstLine;
        startHighlightWorker(editorInst, 100);
        editorInst.internalState.modeRevision++;
        if (editorInst.currentOperation) triggerViewRedraw(editorInst);
    }

    // Handles changes to the line wrapping setting.
    function lineWrappingToggled(editorInst) {
        if (editorInst.settings.enableLineWrapping) {
            editorInst.viewManager.rootWrapper.classList.add("EditorCore-wrap-lines");
            editorInst.viewManager.sizerElement.style.minWidth = "";
            editorInst.viewManager.cachedSizerWidth = null;
        } else {
            editorInst.viewManager.rootWrapper.classList.remove("EditorCore-wrap-lines");
            determineLongestLine(editorInst);
        }
        recalculateAllLineHeights(editorInst);
        triggerViewRedraw(editorInst);
        clearDisplayCaches(editorInst);
        setTimeout(() => { updateScrollbarPositions(editorInst); }, 100);
    }

    // Returns a function that approximates a line's height, used before actual rendering.
    function calculateApproxLineHeight(editorInst) {
        const charHeightPx = getTextHeight(editorInst.viewManager);
        const lineWrappingEnabled = editorInst.settings.enableLineWrapping;
        const charsPerLineApprox = lineWrappingEnabled ? Math.max(5, editorInst.viewManager.scrollableArea.clientWidth / getCharacterWidth(editorInst.viewManager) - 3) : Infinity;

        return function(lineNode) {
            if (isLineHidden(editorInst.documentModel, lineNode)) return 0;

            let totalWidgetHeight = 0;
            if (lineNode.widgets) {
                lineNode.widgets.forEach(widget => {
                    if (widget.height) totalWidgetHeight += widget.height;
                });
            }

            if (lineWrappingEnabled && !isNaN(charsPerLineApprox) && charsPerLineApprox > 0) {
                const effectiveTextLength = lineNode.text.length; // Simplified; could account for collapsed spans
                const wrapLineCount = Math.ceil(effectiveTextLength / charsPerLineApprox) || 1;
                return totalWidgetHeight + (wrapLineCount * charHeightPx);
            } else {
                return totalWidgetHeight + charHeightPx;
            }
        };
    }

    // Recalculates and updates the estimated height for all lines in the document.
    function recalculateAllLineHeights(editorInst) {
        const docRef = editorInst.documentModel;
        const heightEstimator = calculateApproxLineHeight(editorInst);
        docRef.forEachLine(lineNode => {
            const estimatedHeight = heightEstimator(lineNode);
            if (estimatedHeight !== lineNode.height) updateLineHeightValue(lineNode, estimatedHeight);
        });
    }

    // Applies a new visual theme to the editor.
    function applyVisualTheme(editorInst) {
        const wrapperElement = editorInst.viewManager.rootWrapper;
        // Remove existing theme classes
        wrapperElement.className = wrapperElement.className
            .split(/\s+/)
            .filter(cls => !cls.startsWith("editor-theme-"))
            .join(" ");

        // Add new theme classes
        const newThemeClasses = editorInst.settings.visualTheme
            .split(/\s+/)
            .filter(Boolean)
            .map(themeName => `editor-theme-${themeName}`)
            .join(" ");
        if (newThemeClasses) {
            wrapperElement.classList.add(...newThemeClasses.split(' '));
        }
        clearDisplayCaches(editorInst);
    }

    // Handles changes to the gutter configuration.
    function updateGutterLayout(editorInst) {
        updateVisualGutters(editorInst);
        triggerViewRedraw(editorInst);
        setTimeout(() => { alignHorizontalElements(editorInst); }, 25);
    }

    // Rebuilds gutter DOM elements and adjusts code area margin.
    function updateVisualGutters(editorInst) {
        const gutterContainer = editorInst.viewManager.gutterContainer;
        const gutterDefinitions = editorInst.settings.leftGutters;

        // Clear existing gutters
        while (gutterContainer.firstChild) {
            gutterContainer.removeChild(gutterContainer.firstChild);
        }

        let hasGutters = false;
        gutterDefinitions.forEach(gutterClassId => {
            const gutterElement = createDomElement("div", null, `EditorCore-gutter-item ${gutterClassId}`);
            gutterContainer.appendChild(gutterElement);
            if (gutterClassId === "EditorCore-line-numbers") {
                editorInst.viewManager.lineNumberGutter = gutterElement;
                gutterElement.style.width = (editorInst.viewManager.lineNumberWidth || 1) + "px";
            }
            hasGutters = true;
        });

        gutterContainer.style.display = hasGutters ? "" : "none";
        adjustGutterMargin(editorInst);
    }

    // Adjusts the left margin of the code area to accommodate gutters.
    function adjustGutterMargin(editorInst) {
        const currentGutterWidth = editorInst.viewManager.gutterContainer.offsetWidth;
        editorInst.viewManager.sizerElement.style.marginLeft = currentGutterWidth + "px";
    }

    // Computes the effective character length of a line, considering collapsed spans.
    function getEffectiveLineLength(lineNode) {
        if (lineNode.height === 0) return 0; // Hidden line has no effective length

        let currentLength = lineNode.text.length;
        let currentLineIterator = lineNode;

        // Account for collapsed spans at the start
        let mergedSegment;
        while ((mergedSegment = getCollapsedSpanAtStart(currentLineIterator))) {
            const foundRange = mergedSegment.find(0, true);
            currentLineIterator = foundRange.from.line;
            currentLength += foundRange.from.charIndex - foundRange.to.charIndex;
        }

        // Account for collapsed spans at the end
        currentLineIterator = lineNode;
        while ((mergedSegment = getCollapsedSpanAtEnd(currentLineIterator))) {
            const foundRange = mergedSegment.find(0, true);
            currentLength -= currentLineIterator.text.length - foundRange.from.charIndex;
            currentLineIterator = foundRange.to.line;
            currentLength += currentLineIterator.text.length - foundRange.to.charIndex;
        }
        return currentLength;
    }

    // Identifies the longest line in the document for horizontal scrolling.
    function determineLongestLine(editorInst) {
        const viewPortData = editorInst.viewManager;
        const documentReference = editorInst.documentModel;

        viewPortData.cachedLongestLineNode = getLineNode(documentReference, documentReference.firstLine);
        viewPortData.maxLineContentLength = getEffectiveLineLength(viewPortData.cachedLongestLineNode);
        viewPortData.longestLineNeedsUpdate = true;

        documentReference.forEachLine(lineNode => {
            const currentLineLength = getEffectiveLineLength(lineNode);
            if (currentLineLength > viewPortData.maxLineContentLength) {
                viewPortData.maxLineContentLength = currentLineLength;
                viewPortData.cachedLongestLineNode = lineNode;
            }
        });
    }

    // Ensures the line numbers gutter is correctly included/excluded based on options.
    function prepareLineNumberGutter(configOptions) {
        const lineNumberGutterId = "EditorCore-line-numbers";
        const hasLineNumbers = configOptions.displayLineNumbers;
        const currentGutters = configOptions.leftGutters || [];

        const foundIndex = currentGutters.indexOf(lineNumberGutterId);

        if (foundIndex === -1 && hasLineNumbers) {
            configOptions.leftGutters = currentGutters.concat([lineNumberGutterId]);
        } else if (foundIndex > -1 && !hasLineNumbers) {
            configOptions.leftGutters = currentGutters.filter(id => id !== lineNumberGutterId);
        } else {
            configOptions.leftGutters = currentGutters; // Ensure it's always an array
        }
    }

    // SCROLLBAR MECHANISMS

    // Gathers all necessary dimension data for scrollbar updates.
    function prepareScrollMetrics(editorInst) {
        const viewMetrics = editorInst.viewManager;
        const currentGutterWidth = viewMetrics.gutterContainer.offsetWidth;
        const documentTotalHeight = Math.round(editorInst.documentModel.totalHeight + getVerticalPadding(editorInst.viewManager));

        return {
            clientViewportHeight: viewMetrics.scrollableArea.clientHeight,
            wrapperTotalHeight: viewMetrics.rootWrapper.clientHeight,
            scrollContentWidth: viewMetrics.scrollableArea.scrollWidth,
            clientViewportWidth: viewMetrics.scrollableArea.clientWidth,
            wrapperTotalWidth: viewMetrics.rootWrapper.clientWidth,
            fixedGutterLeftOffset: editorInst.settings.fixedGutter ? currentGutterWidth : 0,
            documentComputedHeight: documentTotalHeight,
            totalScrollHeight: documentTotalHeight + getScrollBuffer(editorInst) + viewMetrics.horizontalBarHeight,
            nativeScrollbarThickness: viewMetrics.nativeScrollbarWidth,
            gutterWidth: currentGutterWidth
        };
    }

    // Implements native browser scrollbars.
    function SystemScrollMechanism(addDomElement, scrollCallback, editorInst) {
        this.editorInstance = editorInst;
        const verticalScrollbarEl = this.verticalBar = createDomElement("div", [createDomElement("div", null, null, "min-width: 1px")], "EditorCore-vscrollbar-native");
        const horizontalScrollbarEl = this.horizontalBar = createDomElement("div", [createDomElement("div", null, null, "height: 100%; min-height: 1px")], "EditorCore-hscrollbar-native");

        addDomElement(verticalScrollbarEl);
        addDomElement(horizontalScrollbarEl);

        attachEventHandler(verticalScrollbarEl, "scroll", () => {
            if (verticalScrollbarEl.clientHeight) scrollCallback(verticalScrollbarEl.scrollTop, "vertical");
        });
        attachEventHandler(horizontalScrollbarEl, "scroll", () => {
            if (horizontalScrollbarEl.clientWidth) scrollCallback(horizontalScrollbarEl.scrollLeft, "horizontal");
        });

        this.overlayChecked = false;
        // Legacy IE requires min-height/width for scrollbars to be visible.
        if (isIEBrowser && ieEngineVersion < 8) {
            this.horizontalBar.style.minHeight = this.verticalBar.style.minWidth = "18px";
        }
    }

    SystemScrollMechanism.prototype = {
        update: function(metrics) {
            const needsHorizontalBar = metrics.scrollContentWidth > metrics.clientViewportWidth + 1;
            const needsVerticalBar = metrics.totalScrollHeight > metrics.clientViewportHeight + 1;
            const scrollbarThickness = metrics.nativeScrollbarThickness;

            // Update vertical scrollbar
            if (needsVerticalBar) {
                this.verticalBar.style.display = "block";
                this.verticalBar.style.bottom = needsHorizontalBar ? scrollbarThickness + "px" : "0";
                const visibleHeight = metrics.wrapperTotalHeight - (needsHorizontalBar ? scrollbarThickness : 0);
                this.verticalBar.firstChild.style.height =
                    Math.max(0, metrics.totalScrollHeight - metrics.clientViewportHeight + visibleHeight) + "px";
            } else {
                this.verticalBar.style.display = "";
                this.verticalBar.firstChild.style.height = "0";
            }

            // Update horizontal scrollbar
            if (needsHorizontalBar) {
                this.horizontalBar.style.display = "block";
                this.horizontalBar.style.right = needsVerticalBar ? scrollbarThickness + "px" : "0";
                this.horizontalBar.style.left = metrics.fixedGutterLeftOffset + "px";
                const visibleWidth = metrics.wrapperTotalWidth - metrics.fixedGutterLeftOffset - (needsVerticalBar ? scrollbarThickness : 0);
                this.horizontalBar.firstChild.style.width =
                    (metrics.scrollContentWidth - metrics.clientViewportWidth + visibleWidth) + "px";
            } else {
                this.horizontalBar.style.display = "";
                this.horizontalBar.firstChild.style.width = "0";
            }

            // Check for overlay scrollbars once
            if (!this.overlayChecked && metrics.clientViewportHeight > 0) {
                if (scrollbarThickness === 0) this.applyOverlayHack();
                this.overlayChecked = true;
            }

            return {rightOffset: needsVerticalBar ? scrollbarThickness : 0, bottomOffset: needsHorizontalBar ? scrollbarThickness : 0};
        },
        setScrollLeft: function(position) {
            if (this.horizontalBar.scrollLeft !== position) this.horizontalBar.scrollLeft = position;
        },
        setScrollTop: function(position) {
            if (this.verticalBar.scrollTop !== position) this.verticalBar.scrollTop = position;
        },
        applyOverlayHack: function() {
            const thickness = isMacOS && !isMacMountainLionOrNewer ? "12px" : "18px";
            this.horizontalBar.style.minHeight = this.verticalBar.style.minWidth = thickness;
            const selfRef = this;
            const barMouseDownHandler = function(e) {
                // If click is directly on scrollbar, prevent editor focus loss
                if (getEventTarget(e) !== selfRef.verticalBar && getEventTarget(e) !== selfRef.horizontalBar)
                    executeOperation(selfRef.editorInstance, onMouseDownEvent)(e);
            };
            attachEventHandler(this.verticalBar, "mousedown", barMouseDownHandler);
            attachEventHandler(this.horizontalBar, "mousedown", barMouseDownHandler);
        },
        clear: function() {
            const parentNode = this.horizontalBar.parentNode;
            if (parentNode) {
                parentNode.removeChild(this.horizontalBar);
                parentNode.removeChild(this.verticalBar);
            }
        }
    };

    // A dummy scrollbar implementation for when scrollbars are disabled or not needed.
    function DummyScrollMechanism() {}

    DummyScrollMechanism.prototype = {
        update: function() { return {bottomOffset: 0, rightOffset: 0}; },
        setScrollLeft: function() {},
        setScrollTop: function() {},
        clear: function() {}
    };

    CodeEditorCore.scrollbarImplementations = {"native": SystemScrollMechanism, "none": DummyScrollMechanism};

    // Initializes the scrollbar system based on editor settings.
    function initializeScrollbarSystem(editorInstance) {
        if (editorInstance.viewManager.scrollbars) {
            editorInstance.viewManager.scrollbars.clear();
            if (editorInstance.viewManager.scrollbars.customClass) {
                editorInstance.viewManager.rootWrapper.classList.remove(editorInstance.viewManager.scrollbars.customClass);
            }
        }

        editorInstance.viewManager.scrollbars = new CodeEditorCore.scrollbarImplementations[editorInstance.settings.scrollbarStyle](function(nodeToInsert) {
            editorInstance.viewManager.rootWrapper.insertBefore(nodeToInsert, editorInstance.viewManager.verticalScrollFiller);
            // Prevent clicks on scrollbars from stealing focus from the editor input.
            attachEventHandler(nodeToInsert, "mousedown", function() {
                if (editorInstance.internalState.isFocused) {
                    setTimeout(function() { editorInstance.viewManager.inputElement.focus(); }, 0);
                }
            });
            nodeToInsert.setAttribute("data-editor-component", "true");
        }, function(scrollPosition, scrollAxis) {
            if (scrollAxis === "horizontal") updateScrollLeftPosition(editorInstance, scrollPosition);
            else updateScrollTopPosition(editorInstance, scrollPosition);
        });
    }

    // --- Placeholder for other CodeMirror internal functions and objects ---
    // These would also be renamed and potentially refactored.

    // Mock/placeholder objects for functions not fully implemented in this clone snippet
    const defaultConfiguration = {
        value: "",
        mode: null,
        inputMechanism: "textarea", // Original 'inputStyle'
        enableLineWrapping: false,
        autoFocus: false,
        visualTheme: "default", // Original 'theme'
        leftGutters: [], // Original 'gutters'
        displayLineNumbers: false, // Original 'lineNumbers'
        scrollbarStyle: "native", // Original 'scrollbarModel'
        fixedGutter: true
    };

    const InitializationPhase = {}; // Sentinel value for initialization

    const optionHandlers = {}; // Placeholder for option change handlers

    const initializationHooks = []; // Placeholder for post-init hooks

    CodeEditorCore.inputMethods = {
        textarea: function() {
            this.init = this.initializeInput = () => {};
            this.focus = () => {};
            this.reset = this.resetInput = () => {};
        }
    }; // Placeholder for input methods

    // Document Data Model (Doc)
    function DocumentData(content, mode) {
        this.firstLine = 0;
        this.lastLine = 0; // Will be set by setContent
        this.totalHeight = 0;
        this.modeDefinition = mode;
        this.syntaxModeOption = mode;
        this.highlightFrontier = 0; // For highlighting worker

        this.children = []; // Array of line objects or block structures
        this.lineCount = 0;

        // Basic line object structure
        function Line(text) {
            this.text = text;
            this.height = 0; // Will be estimated/calculated
            this.widgets = null;
            this._syntaxState = null;
            this._cachedStyles = null;
        }

        this.forEachLine = function(callback) {
            for (let i = 0; i < this.lineCount; i++) {
                callback(this.children[i]); // Simplified for a flat array of lines
            }
        };

        this.setContent = function(text) {
            const lines = text.split('\n').map(t => new Line(t));
            this.children = lines;
            this.lineCount = lines.length;
            this.lastLine = lines.length - 1;
            // Recalculate totalHeight elsewhere
        };

        if (content) this.setContent(content);
    }

    // Simplified DOM utility function (original `elt`)
    function createDomElement(tagName, children, className, style) {
        const el = document.createElement(tagName);
        if (className) el.className = className;
        if (style) el.style.cssText = style;
        if (children) {
            if (Array.isArray(children)) {
                children.forEach(child => el.appendChild(child));
            } else if (children instanceof Node) {
                el.appendChild(children);
            } else if (typeof children === 'string') {
                el.textContent = children;
            }
        }
        return el;
    }

    // Simplified event attachment (original `on`)
    function attachEventHandler(element, eventType, handler) {
        element.addEventListener(eventType, handler);
    }
    function getEventTarget(event) { return event.target || event.srcElement; }

    // Simplified class manipulation (original `addClass`, `rmClass`)
    function addClass(element, className) { element.classList.add(className); }
    function rmClass(element, className) { element.classList.remove(className); }

    // Placeholder for other internal functions
    const scrollBufferHeight = 30; // Original `scrollerGap`
    function getVerticalPadding(display) { return 0; } // Placeholder
    function getScrollBuffer(editorInst) { return 0; } // Placeholder, original `scrollGap`
    function getTextHeight(display) { return 16; } // Placeholder
    function getCharacterWidth(display) { return 7; } // Placeholder
    function isLineHidden(doc, line) { return false; } // Placeholder
    function updateLineHeightValue(line, height) { line.height = height; } // Placeholder
    function startHighlightWorker(editorInst, delay) {} // Placeholder
    function triggerViewRedraw(editorInst) {} // Placeholder `regChange`
    function clearDisplayCaches(editorInst) {} // Placeholder
    function alignHorizontalElements(editorInst) {} // Placeholder
    function getLineNode(doc, lineNum) { return doc.children[lineNum]; } // Placeholder, simplified
    function getCollapsedSpanAtStart(line) { return null; } // Placeholder
    function getCollapsedSpanAtEnd(line) { return null; } // Placeholder
    function updateLineNumberGutterWidth(editorInst) {} // Placeholder
    function updateScrollbarPositions(editorInst) {} // Placeholder
    function updateScrollLeftPosition(editorInst, pos) {} // Placeholder
    function updateScrollTopPosition(editorInst, pos) {} // Placeholder
    function attachEditorEvents(editorInst) {} // Placeholder
    function ensureGlobalEventHandlers() {} // Placeholder
    function beginEditorOperation(editorInst) { editorInst.currentOperation = { forceViewUpdate: false }; } // Placeholder
    function endEditorOperation(editorInst) { editorInst.currentOperation = null; } // Placeholder
    function linkDocumentToEditor(editorInst, doc) {} // Placeholder
    function onEditorFocus(editorInst) { editorInst.internalState.isFocused = true; } // Placeholder
    function onEditorBlur(editorInst) { editorInst.internalState.isFocused = false; } // Placeholder
    function executeOperation(editorInst, func) { return func; } // Placeholder, original `operation`
    function onMouseDownEvent(e) {} // Placeholder
    function DeferredTask() { this.set = this.clear = () => {}; } // Placeholder for Delayed utility
    CodeEditorCore.getSyntaxHighlighter = (opts, mode) => mode; // Placeholder for getMode

    // Export the main class
    return CodeEditorCore;
});